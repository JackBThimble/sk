import { fail, redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async (event) => {
		console.log('Process logout');
		try {
			if (!event.locals.session) {
				console.log('No active session found');
				return fail(401, {
					message: 'Not authenticated'
				});
			}
			console.log('Invalidating session');
			await auth.invalidateSession(event.locals.session.id);
			auth.deleteSessionTokenCookie(event);
			console.log('Logout successful, redirecting to home page');
			return redirect(302, '/');
		} catch (error) {
			console.error('Error during logout: ', error);
			return fail(500, {
				message: 'An error occurred during logout',
				error: error instanceof Error ? error.message : String(error)
			});
		}
	}
};
