import type { PageServerLoad, PageData } from './$types';

export const load: PageServerLoad | PageData = async (event: ServerLoadEvent) => {
	return event.locals.user;
};
