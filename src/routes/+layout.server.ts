import type { LayoutServerLoad } from './$types';
import * as auth from '$lib/server/auth';


export const load: LayoutServerLoad = async ({ locals }) => {
	const session = await auth.validateSessionToken();
	return {
		user: locals.user
	};
};
