// dataSource.js — single entry point for all read-only public-app data access.
//
// Instead of one Supabase round-trip per screen/click (systems, zone
// bacteria, flora, pathologies, system bacteria, linked germs...), the
// entire content set is fetched ONCE per session (8 queries in parallel)
// and kept in memory. Every getX() below reads/derives from that in-memory
// store — zero network calls after the first load. Content only changes via
// the admin, so serving a session-long snapshot is a safe tradeoff (a page
// reload always picks up the latest data).
//
// Swapping to a static JSON snapshot later means reimplementing loadStore()
// only — every getX() function and its return shape stays identical.
import { supabase } from '../lib/supabase.js'

let storePromise = null

async function loadStore() {
  const [systems, bacteria, images, pathologies, pathologieGermes, zoneBacteria, systemBacteria, quiz] = await Promise.all([
    supabase.from('bacterio_systems').select('*, bacterio_zones(*)').order('position'),
    supabase.from('bacterio_bacteria').select('*'),
    supabase.from('bacterio_images').select('*'),
    supabase.from('bacterio_pathologies').select('*'),
    supabase.from('bacterio_pathologie_germes').select('bacteria_id, pathologie_id, ordre'),
    supabase.from('bacterio_zone_bacteria').select('zone_id, bacteria_id, ordre'),
    supabase.from('bacterio_system_bacteria').select('system_id, bacteria_id'),
    supabase.from('bacterio_quiz').select('*').eq('active', true).order('id'),
  ])
  for (const r of [systems, bacteria, images, pathologies, pathologieGermes, zoneBacteria, systemBacteria, quiz]) {
    if (r.error) throw r.error
  }

  const imagesByBacteria = new Map()
  for (const img of images.data || []) {
    if (!imagesByBacteria.has(img.bacteria_id)) imagesByBacteria.set(img.bacteria_id, [])
    imagesByBacteria.get(img.bacteria_id).push(img)
  }

  const bacteriaById = new Map()
  const bacteriaByName = new Map()
  for (const b of bacteria.data || []) {
    const full = { ...b, bacterio_images: imagesByBacteria.get(b.id) || [] }
    bacteriaById.set(b.id, full)
    bacteriaByName.set(b.name, full)
  }

  const zoneLabelById = new Map()
  for (const sys of systems.data || []) {
    for (const z of sys.bacterio_zones || []) zoneLabelById.set(z.id, { label: z.label, name: z.name })
  }

  return {
    systems: systems.data || [],
    bacteriaById,
    bacteriaByName,
    zoneLabelById,
    pathologies: pathologies.data || [],
    pathologieGermes: pathologieGermes.data || [],
    zoneBacteria: zoneBacteria.data || [],
    systemBacteria: systemBacteria.data || [],
    quiz: quiz.data || [],
  }
}

function getStore() {
  if (!storePromise) {
    storePromise = loadStore().catch(err => { storePromise = null; throw err })
  }
  return storePromise
}

function resolveBacteria(store, ids) {
  return ids.map(id => store.bacteriaById.get(id)).filter(Boolean)
}

export async function getSystemes() {
  const store = await getStore()
  return store.systems
}

export async function getZoneBacteries(zoneId) {
  const store = await getStore()
  const ids = store.zoneBacteria
    .filter(r => r.zone_id === zoneId)
    .sort((a, b) => a.ordre - b.ordre)
    .map(r => r.bacteria_id)
  return resolveBacteria(store, ids)
}

export async function getZoneFlore(zoneId) {
  const store = await getStore()
  return [...store.bacteriaById.values()]
    .filter(b => Array.isArray(b.flora_zone_ids) && b.flora_zone_ids.includes(zoneId))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function getSystemBacteries(systemId) {
  const store = await getStore()
  const ids = store.systemBacteria.filter(r => r.system_id === systemId).map(r => r.bacteria_id)
  return resolveBacteria(store, ids)
}

export async function getAllBacteries() {
  const store = await getStore()
  return [...store.bacteriaById.values()]
    .map(b => ({ id: b.id, name: b.name, gram: b.gram, morphology: b.morphology, zone_ids: b.zone_ids }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function getBacterieByName(name) {
  const store = await getStore()
  const b = store.bacteriaByName.get(name)
  if (!b) throw new Error(`Bactérie introuvable: ${name}`)
  return b
}

function withGermeCount(store, p) {
  const germe_count = store.pathologieGermes.filter(g => g.pathologie_id === p.id).length
  return { ...p, germe_count }
}

export async function getZonePathologies(zoneId) {
  const store = await getStore()
  return store.pathologies
    .filter(p => p.zone_id === zoneId)
    .sort((a, b) => a.ordre - b.ordre)
    .map(p => withGermeCount(store, p))
}

export async function getSystemPathologies(systemId) {
  const store = await getStore()
  return store.pathologies
    .filter(p => p.system_id === systemId)
    .sort((a, b) => a.ordre - b.ordre)
    .map(p => withGermeCount(store, p))
}

export async function getPathologieBacteries(pathologieId) {
  const store = await getStore()
  const ids = store.pathologieGermes
    .filter(g => g.pathologie_id === pathologieId)
    .sort((a, b) => a.ordre - b.ordre)
    .map(g => g.bacteria_id)
  return resolveBacteria(store, ids)
}

export async function getLinkedBacteriaIds(pathologieIds) {
  const store = await getStore()
  const set = new Set(pathologieIds)
  return store.pathologieGermes.filter(g => set.has(g.pathologie_id)).map(g => g.bacteria_id)
}

export async function getPathologie(pathologieId) {
  const store = await getStore()
  const p = store.pathologies.find(p => p.id === pathologieId)
  if (!p) throw new Error(`Pathologie introuvable: ${pathologieId}`)
  return p
}

export async function getZoneLabel(zoneId) {
  const store = await getStore()
  const z = store.zoneLabelById.get(zoneId)
  if (!z) throw new Error(`Zone introuvable: ${zoneId}`)
  return z
}

export async function getQuiz(systemId = null) {
  const store = await getStore()
  return systemId ? store.quiz.filter(q => q.system_id === systemId) : store.quiz
}
