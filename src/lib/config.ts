import { PUBLIC_ALLOW_REGISTRATION, PUBLIC_DOC } from '$env/static/public';

export const allowRegistration = PUBLIC_ALLOW_REGISTRATION !== 'false';
export const publicDoc = PUBLIC_DOC === 'true';
