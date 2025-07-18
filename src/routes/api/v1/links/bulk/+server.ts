import api from "$api/v1";
import type { RequestHandler } from "./$types";

export const POST = ((evt) => api.handle(evt)) satisfies RequestHandler;
export const DELETE = ((evt) => api.handle(evt)) satisfies RequestHandler;