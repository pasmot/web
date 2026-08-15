/**
 * Path of the never-expiring stand-in for a listing photo.
 *
 * The catalog API hands out presigned S3 links that die after an hour, so a
 * real photo URL must never be baked into HTML we intend to cache. Pages embed
 * this path instead; /api/img resolves it to a freshly signed link per request.
 *
 * `index` is a position in Product.gallery — the route rebuilds that same
 * array from the same API response, so the ordering matches.
 */
export function listingImagePath(listingId: string, index: number): string {
  return `/api/img/${encodeURIComponent(listingId)}/${index}`;
}
