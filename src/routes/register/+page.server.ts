import { hash } from '@node-rs/argon2';
import { fail, redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';
import { userSchema } from '$lib/server/zod-schemas';
import { z } from 'zod';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/');
	}
	return {};
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();

		const userData = {
			username: String(formData.get('username')),
			password: String(formData.get('password')),
			confirmPassword: String(formData.get('confirmPassword')),
		};

		if (userData.password !== userData.confirmPassword) {
			return fail(400, {
				message: 'Passwords do not match',
				data: {
					username: userData.username,
				},
				errors: {
					confirmPassword: 'Passwords do not match',
				},
			});
		}
		try {
			const validatedData = userSchema.parse({
				username: userData.username,
				password: userData.password,
			});
            if (!auth.validateUsername(validatedData.username)) {
				return fail(400, {
					message: 'Invalid username format',
					data: {
						username: validatedData.username
					},
					errors: {
						username: 'Username must be alphanumeric and between 3 and 31 characters (may contain underscores and hyphens)',
					},
				}); 
			}
			const userId = auth.generateUserId();
			const passwordHash = await hash(validatedData.password, {
				memoryCost: 19456,
				timeCost: 3,
				outputLen: 32,
				parallelism: 1,
			});
			const username = validatedData.username;
			try {
				const existingUser = await db.query.user.findFirst({
					where: (user, { eq }) => eq(user.username, username)
				});
				if (existingUser) {
					return fail(400, {
						message: 'Username already exists',
						data: {
							username
						},
						errors: {
							username: 'This username is already taken',
						}
					});
				}
				await db.insert(table.user).values({ id: userId, username, passwordHash});
				const sessionToken = auth.generateSessionToken();
				const session = await auth.createSession(sessionToken, userId);
				auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
				
			}
			catch (e) {
				console.error("Database error during registration.");
				return fail(500, {
					message: 'A fucking error occured! Goddammit! not again...',
				    data: { username },
				});
			}
			return redirect(302, '/');
		}
		catch (e) {
			if (e instanceof z.ZodError) {
				const errors = {};

				e.errors.forEach(err => {
					const field = err.path[0];
					errors[field] = err.message;
				});
				return fail(400, {
					message: 'Validation failed',
				    data: { username: userData.username},
				    errors,
					issues: e.errors
				});
			}
			console.error("An error occurred during the fucking registration. now we are fucked...:", e);
			return fail(500, {
				message: 'An error has occurred during registration',
				data: { username: userData.username },
			});
		}
	}
};