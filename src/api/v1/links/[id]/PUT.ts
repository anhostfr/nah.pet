import { Endpoint, z, error, type RouteConfig } from "sveltekit-api";
import { apiAuth, requirePermission } from '$lib/api/apiAuthMiddleware';
import { API_PERMISSIONS } from '$lib/server/api-auth.js';
import { db } from '$lib/server/db.js';
import { isValidUrl } from '$lib/utils';
import { sanitizeTitle, validateExpiresAt } from '$lib/utils/sanitize';
import { hash } from '@node-rs/argon2';

export const Param = z.object({
  id: z.string().describe("Link ID")
});

export const Input = z.object({
  originalUrl: z.string().url().optional().describe("The original URL to shorten"),
  title: z.string().max(255).optional().describe("Link title"),
  password: z.string().optional().describe("Password protection"),
  expiresAt: z.string().refine(val => !val || validateExpiresAt(val), {
    message: "Expiration date must be in the future and within 10 years"
  }).optional().describe("Expiration date (ISO string)")
});

export const Output = z.object({
  id: z.string().describe("Link unique identifier"),
  slug: z.string().describe("Short URL slug"),
  originalUrl: z.string().describe("Original long URL"),
  title: z.string().nullable().describe("Link title"),
  shortUrl: z.string().describe("Complete short URL"),
  domain: z.string().nullable().describe("Custom domain if any"),
  expiresAt: z.string().nullable().describe("Expiration date"),
  updatedAt: z.string().describe("Last update date")
});

export const Error = {
  400: error(400, "Bad request - Invalid input"),
  401: error(401, "Unauthorized - Invalid API key"),
  403: error(403, "Forbidden - Insufficient permissions"),
  404: error(404, "Link not found"),
  429: error(429, "Rate limit exceeded"),
  500: error(500, "Failed to update link")
};

export const Modifier = (r: RouteConfig) => {
  r.tags = ["Links"];
  r.operationId = "updateLink";
  r.summary = "Update a link";
  r.description = "Update an existing shortened link";
  r.security = [{ bearerAuth: [] }];
  return r;
};

export default new Endpoint({ Param, Input, Output, Error, Modifier }).handle(async (input: any, evt) => {
  const authResult = await apiAuth(evt);
  if (authResult instanceof Response) {
    throw Error[401];
  }

  requirePermission(authResult, API_PERMISSIONS.LINKS_WRITE);

  try {
    const { originalUrl, title, password, expiresAt } = input as any;

    if (originalUrl && !isValidUrl(originalUrl)) {
      throw Error[400];
    }

    const existingLink = await db.link.findFirst({
      where: {
        id: input.id,
        userId: authResult.userId
      },
      include: {
        customDomain: { select: { domain: true } }
      }
    });

    if (!existingLink) {
      throw Error[404];
    }

    const updateData: any = {};
    
    if (originalUrl !== undefined) updateData.originalUrl = originalUrl;
    if (title !== undefined) {
      const sanitizedTitle = title ? sanitizeTitle(title) : null;
      if (title && !sanitizedTitle) {
        throw Error[400];
      }
      updateData.title = sanitizedTitle;
    }
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
    
    if (password !== undefined) {
      updateData.password = password ? await hash(password, {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1
      }) : null;
    }

    const updatedLink = await db.link.update({
      where: { id: input.id },
      data: updateData,
      include: {
        customDomain: { select: { domain: true } }
      }
    });

    return {
      id: updatedLink.id,
      slug: updatedLink.slug,
      originalUrl: updatedLink.originalUrl,
      title: updatedLink.title,
      shortUrl: updatedLink.customDomain 
        ? `https://${updatedLink.customDomain.domain}/${updatedLink.slug}`
        : `https://nah.pet/${updatedLink.slug}`,
      domain: updatedLink.customDomain?.domain || null,
      expiresAt: updatedLink.expiresAt?.toISOString() || null,
      updatedAt: updatedLink.updatedAt.toISOString()
    };
  } catch (err: any) {
    if (err.status) throw err;
    console.error('Error updating link:', err);
    throw Error[500];
  }
});