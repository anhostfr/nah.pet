import { env } from '$env/dynamic/public';

export const allowRegistration = env.PUBLIC_ALLOW_REGISTRATION !== 'false';
export const publicDoc = env.PUBLIC_DOC === 'true';
