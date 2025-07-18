import api from "$api/v1";
import { json } from "@sveltejs/kit";

export const prerender = false;

export const GET = async (evt) => {
  const openapi = await api.openapi(evt);
  return json(openapi, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};