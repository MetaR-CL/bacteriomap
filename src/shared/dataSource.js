// dataSource.js — single entry point for all read-only public-app data access.
// Today every function hits Supabase directly with the exact same queries the
// app used before this module existed. Swapping to a static JSON snapshot
// later means reimplementing this file only — callers never touch Supabase.
import { supabase } from '../lib/supabase.js'

// Short-lived in-memory cache. Every zone/system click re-mounts ZoneScreen,
// which re-fires 6-7 fresh network round-trips with no reuse across
// navigation — this is what made every click feel like a fresh page load.
// Content here only changes via the admin, so a short TTL is safe and
// collapses repeat navigation (e.g. switching between zones) into cache hits.
const CACHE_TTL = 60_000
const cache = new Map()

function cached(key, fetcher) {
  const hit = cache.get(key)
  if (hit && Date.now() - hit.time < CACHE_TTL) return hit.promise
  const promise = fetcher().catch(err => { cache.delete(key); throw err })
  cache.set(key, { promise, time: Date.now() })
  return promise
}

export async function getSystemes() {
  return cached('systemes', async () => {
    const { data, error } = await supabase
      .from('bacterio_systems')
      .select('*, bacterio_zones(*)')
      .order('position')
    if (error) throw error
    return data || []
  })
}

export async function getZoneBacteries(zoneId) {
  return cached(`zone_bacteries:${zoneId}`, async () => {
    const { data, error } = await supabase
      .from('bacterio_zone_bacteria')
      .select('ordre, bacterio_bacteria(*, bacterio_images(*))')
      .eq('zone_id', zoneId)
      .order('ordre')
    if (error) throw error
    return (data || []).map(r => r.bacterio_bacteria).filter(Boolean)
  })
}

export async function getZoneFlore(zoneId) {
  return cached(`zone_flore:${zoneId}`, async () => {
    const { data, error } = await supabase
      .from('bacterio_bacteria')
      .select('*, bacterio_images(*)')
      .contains('flora_zone_ids', [zoneId])
      .order('name')
    if (error) throw error
    return data || []
  })
}

export async function getSystemBacteries(systemId) {
  return cached(`system_bacteries:${systemId}`, async () => {
    const { data, error } = await supabase
      .from('bacterio_system_bacteria')
      .select('bacterio_bacteria(*, bacterio_images(*))')
      .eq('system_id', systemId)
    if (error) throw error
    return (data || []).map(r => r.bacterio_bacteria).filter(Boolean)
  })
}

export async function getAllBacteries() {
  return cached('all_bacteries', async () => {
    const { data, error } = await supabase
      .from('bacterio_bacteria')
      .select('id, name, gram, morphology, zone_ids')
      .order('name')
    if (error) throw error
    return data || []
  })
}

export async function getBacterieByName(name) {
  return cached(`bacterie:${name}`, async () => {
    const { data, error } = await supabase
      .from('bacterio_bacteria')
      .select('*, bacterio_images(*)')
      .eq('name', name)
      .single()
    if (error) throw error
    return data
  })
}

export async function getZonePathologies(zoneId) {
  return cached(`zone_patho:${zoneId}`, async () => {
    const { data, error } = await supabase
      .from('bacterio_pathologies')
      .select('*, bacterio_pathologie_germes(bacteria_id)')
      .eq('zone_id', zoneId)
      .order('ordre')
    if (error) throw error
    return (data || []).map(p => ({
      ...p,
      germe_count: Array.isArray(p.bacterio_pathologie_germes) ? p.bacterio_pathologie_germes.length : 0,
    }))
  })
}

export async function getSystemPathologies(systemId) {
  return cached(`system_patho:${systemId}`, async () => {
    const { data, error } = await supabase
      .from('bacterio_pathologies')
      .select('*, bacterio_pathologie_germes(bacteria_id)')
      .eq('system_id', systemId)
      .order('ordre')
    if (error) throw error
    return (data || []).map(p => ({
      ...p,
      germe_count: Array.isArray(p.bacterio_pathologie_germes) ? p.bacterio_pathologie_germes.length : 0,
    }))
  })
}

export async function getPathologieBacteries(pathologieId) {
  return cached(`patho_bacteries:${pathologieId}`, async () => {
    const { data, error } = await supabase
      .from('bacterio_pathologie_germes')
      .select('bacteria_id, ordre, bacterio_bacteria(*, bacterio_images(*))')
      .eq('pathologie_id', pathologieId)
      .order('ordre')
    if (error) throw error
    return (data || []).map(r => r.bacterio_bacteria).filter(Boolean)
  })
}

export async function getLinkedBacteriaIds(pathologieIds) {
  return cached(`linked_bact:${pathologieIds.slice().sort().join(',')}`, async () => {
    const { data, error } = await supabase
      .from('bacterio_pathologie_germes')
      .select('bacteria_id')
      .in('pathologie_id', pathologieIds)
    if (error) throw error
    return (data || []).map(r => r.bacteria_id)
  })
}

export async function getPathologie(pathologieId) {
  return cached(`pathologie:${pathologieId}`, async () => {
    const { data, error } = await supabase
      .from('bacterio_pathologies')
      .select('*')
      .eq('id', pathologieId)
      .single()
    if (error) throw error
    return data
  })
}

export async function getZoneLabel(zoneId) {
  return cached(`zone_label:${zoneId}`, async () => {
    const { data, error } = await supabase
      .from('bacterio_zones')
      .select('label, name')
      .eq('id', zoneId)
      .single()
    if (error) throw error
    return data
  })
}

export async function getQuiz(systemId = null) {
  return cached(`quiz:${systemId ?? 'all'}`, async () => {
    let q = supabase.from('bacterio_quiz').select('*').eq('active', true).order('id')
    if (systemId) q = q.eq('system_id', systemId)
    const { data, error } = await q
    if (error) throw error
    return data || []
  })
}
