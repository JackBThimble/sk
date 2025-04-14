import { hash } from '@node-rs/argon2';
import { fail, redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';
import { userSchema } from '$lib/server/zod-schemas';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/');
	}
	return {};
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();

		const user = {
			username: String(formData.get('username')),
			password: String(formData.get('password'))
		};

		const safeParse = userSchema.safeParse(user);

		if (!safeParse.success) {
			return fail(400, { issues: safeParse.error.issues });
		}

		if (!auth.validateUsername(user.username)) {
			return fail(400, { message: 'Invalid username' });
		}
		if (!auth.validatePassword(user.password)) {
			return fail(400, { message: 'Invalid password' });
		}

		const userId = auth.generateUserId();
		const passwordHash = await hash(user.password, {
			// recommended minimum parameters
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		const username = user.username;

		try {
			await db.insert(table.user).values({ id: userId, username, passwordHash });

			const sessionToken = auth.generateSessionToken();
			const session = await auth.createSession(sessionToken, userId);
			auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
		} catch (e) {
			return fail(500, { message: 'An error has occurred' });
		}
		return redirect(302, '/');
	}
};
