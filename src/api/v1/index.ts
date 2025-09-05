import { env } from '$env/dynamic/public';
import { API } from 'sveltekit-api';

export default new API(
	import.meta.glob('./**/*.ts'),
	{
		openapi: '3.0.0',
		info: {
			title: 'Nah.pet API',
			version: '1.0.0',
			description: 'Nah.pet API for pet owners',
			contact: {
				name: 'Nah.pet Support',
				email: '',
				url: 'https://nah.pet'
			}
		},
		servers: [
			{
				url: 'https://' + env.PUBLIC_MAIN_DOMAIN + '/api/v1',
				description: 'Production server'
			},
			{
				url: 'http://localhost:5173/api/v1',
				description: 'Development server'
			}
		]
	},
	'/api/v1',
	(r) => {
		r.registerComponent('securitySchemes', 'bearerAuth', {
			type: 'http',
			scheme: 'bearer',
			bearerFormat: 'API Key',
			description: 'Use your Nah.pet API key as Bearer token'
		});
	}
);
