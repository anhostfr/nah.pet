import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	event.depends('app:auth');

	return {
		user: event.locals.user
	};
};

