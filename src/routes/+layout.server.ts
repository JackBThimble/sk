import type { LayoutServerLoad } from './$types';
import * as auth from '$lib/server/auth';

export const load: LayoutServerLoad = async ({ locals }) => {
	let session;
	if (locals.session) {
		session = await auth.validateSessionToken(locals.session.id);
	}
	return {
		user: locals.user,
		session: session
	};
};
