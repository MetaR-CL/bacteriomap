// One-off admin utility: walks every image already stored in Supabase Storage
// and re-encodes it in place (same path, same public URL) through the same
// canvas-based compressImage() used for new uploads. No DB rows change since
// the URL never changes — only the bytes behind it shrink.
import { supabase } from '../lib/supabase.js'
import { compressImage } from './compressImage.js'

const BUCKET = 'bacteriomap-images'
const MARKER = `/object/public/${BUCKET}/`
const SKIP_UNDER_BYTES = 300 * 1024 // don't bother re-touching already-small files

function pathFromUrl(url) {
  return url?.includes(MARKER) ? url.split(MARKER)[1] : null
}

async function recompressUrl(url) {
  const path = pathFromUrl(url)
  if (!path) return { url, skipped: true, reason: 'not a storage url' }

  const res = await fetch(url)
  if (!res.ok) return { url, error: `fetch failed (${res.status})` }
  const blob = await res.blob()

  if (blob.size < SKIP_UNDER_BYTES) return { url, skipped: true, reason: 'already small', size: blob.size }

  const file = new File([blob], path.split('/').pop(), { type: blob.type })
  const compressed = await compressImage(file)

  if (compressed.size >= blob.size) return { url, skipped: true, reason: 'no gain', size: blob.size }

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, compressed, { upsert: true, contentType: 'image/jpeg' })
  if (error) return { url, error: error.message }

  return { url, before: blob.size, after: compressed.size }
}

// Collects every distinct image URL referenced across the content tables.
async function collectUrls() {
  const [images, systems, pathologies, quiz] = await Promise.all([
    supabase.from('bacterio_images').select('url'),
    supabase.from('bacterio_systems').select('image_url'),
    supabase.from('bacterio_pathologies').select('image_url'),
    supabase.from('bacterio_quiz').select('image_url'),
  ])
  const urls = [
    ...(images.data || []).map(r => r.url),
    ...(systems.data || []).map(r => r.image_url),
    ...(pathologies.data || []).map(r => r.image_url),
    ...(quiz.data || []).map(r => r.image_url),
  ].filter(Boolean)
  return [...new Set(urls)]
}

export async function recompressAllImages(onProgress) {
  const urls = await collectUrls()
  const results = []
  for (let i = 0; i < urls.length; i++) {
    const r = await recompressUrl(urls[i])
    results.push(r)
    onProgress?.(i + 1, urls.length, r)
  }
  const done = results.filter(r => r.before != null)
  const savedBytes = done.reduce((sum, r) => sum + (r.before - r.after), 0)
  const errors = results.filter(r => r.error)
  return {
    total: urls.length,
    recompressed: done.length,
    skipped: results.filter(r => r.skipped).length,
    errors,
    savedBytes,
  }
}
