import { NextResponse } from 'next/server';
import { fetchListing } from '../../../../../lib/api';

/**
 * Resolves a listing photo to a freshly signed S3 link.
 *
 * Listing images come back as presigned URLs valid for one hour, which makes
 * them unsafe to store in cached HTML — a page older than that renders every
 * photo as the "Gambar tidak tersedia" fallback. Pages embed the stable
 * /api/img/<listingId>/<index> path (see listingImagePath) and this handler
 * signs on demand, so the page itself stays cacheable.
 */
export const dynamic = 'force-dynamic';

/**
 * How long one signed batch may be handed out before we ask for a new one.
 * Half the API's one-hour lifetime, so every link a client receives still has
 * at least ~30 minutes left even at the end of the window.
 */
const REUSE_WINDOW_MS = 30 * 60 * 1000;

/** Cap on memoised listings, so a crawler sweeping the catalog can't grow this without bound. */
const MAX_ENTRIES = 500;

/**
 * Per-instance memo. Without it a five-photo gallery would trigger five
 * identical listing lookups, one per <img>. Serverless instances start cold
 * and may be recycled at any time — that only costs an extra lookup.
 */
const signedGalleries = new Map<string, { urls: string[]; signedAt: number }>();

async function galleryFor(listingId: string): Promise<string[] | null> {
  const hit = signedGalleries.get(listingId);
  if (hit && Date.now() - hit.signedAt < REUSE_WINDOW_MS) return hit.urls;

  const product = await fetchListing(listingId, { cache: 'no-store' });
  if (!product) return null;

  const urls = product.gallery.length
    ? product.gallery
    : [product.image].filter(Boolean);

  if (signedGalleries.size >= MAX_ENTRIES) {
    // Map iterates in insertion order, so this drops the oldest entry.
    const oldest = signedGalleries.keys().next();
    if (!oldest.done) signedGalleries.delete(oldest.value);
  }
  signedGalleries.set(listingId, { urls, signedAt: Date.now() });
  return urls;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ listingId: string; index: string }> },
) {
  const { listingId, index } = await params;

  const position = Number(index);
  if (!Number.isInteger(position) || position < 0) {
    return new NextResponse('Invalid image index', { status: 400 });
  }

  let urls: string[] | null;
  try {
    urls = await galleryFor(listingId);
  } catch {
    // Upstream hiccup. Deliberately not cached — the next request retries.
    return new NextResponse('Listing lookup failed', {
      status: 502,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  const target = urls?.[position];
  if (!target) {
    return new NextResponse('Image not found', {
      status: 404,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  // Redirect instead of streaming: the bytes travel browser → S3 directly, so
  // this function stays cheap and no listing traffic runs through our egress.
  // The redirect may be cached well inside REUSE_WINDOW_MS, which keeps the
  // link a client follows comfortably short of its own expiry.
  return NextResponse.redirect(target, {
    status: 307,
    headers: { 'Cache-Control': 'public, max-age=600' },
  });
}
