// dataSource.js — single entry point for all read-only public-app data access.
// Today every function hits Supabase directly with the exact same queries the
// app used before this module existed. Swapping to a static JSON snapshot
// later means reimplementing this file only — callers never touch Supabase.
import { supabase } from '../lib/supabase.js'

export async function getSystemes() {
  const { data, error } = await supabase
    .from('bacterio_systems')
    .select('*, bacterio_zones(*)')
    .order('position')
  if (error) throw error
  return data || []
}

export async function getZoneBacteries(zoneId) {
  const { data, error } = await supabase
    .from('bacterio_zone_bacteria')
    .select('ordre, bacterio_bacteria(*, bacterio_images(*))')
    .eq('zone_id', zoneId)
    .order('ordre')
  if (error) throw error
  return (data || []).map(r => r.bacterio_bacteria).filter(Boolean)
}

export async function getZoneFlore(zoneId) {
  const { data, error } = await supabase
    .from('bacterio_bacteria')
    .select('*, bacterio_images(*)')
    .contains('flora_zone_ids', [zoneId])
    .order('name')
  if (error) throw error
  return data || []
}

export async function getSystemBacteries(systemId) {
  const { data, error } = await supabase
    .from('bacterio_system_bacteria')
    .select('bacterio_bacteria(*, bacterio_images(*))')
    .eq('system_id', systemId)
  if (error) throw error
  return (data || []).map(r => r.bacterio_bacteria).filter(Boolean)
}

export async function getAllBacteries() {
  const { data, error } = await supabase
    .from('bacterio_bacteria')
    .select('id, name, gram, morphology, zone_ids')
    .order('name')
  if (error) throw error
  return data || []
}

export async function getBacterieByName(name) {
  const { data, error } = await supabase
    .from('bacterio_bacteria')
    .select('*, bacterio_images(*)')
    .eq('name', name)
    .single()
  if (error) throw error
  return data
}

export async function getZonePathologies(zoneId) {
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
}

export async function getSystemPathologies(systemId) {
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
}

export async function getPathologieBacteries(pathologieId) {
  const { data, error } = await supabase
    .from('bacterio_pathologie_germes')
    .select('bacteria_id, ordre, bacterio_bacteria(*, bacterio_images(*))')
    .eq('pathologie_id', pathologieId)
    .order('ordre')
  if (error) throw error
  return (data || []).map(r => r.bacterio_bacteria).filter(Boolean)
}

export async function getLinkedBacteriaIds(pathologieIds) {
  const { data, error } = await supabase
    .from('bacterio_pathologie_germes')
    .select('bacteria_id')
    .in('pathologie_id', pathologieIds)
  if (error) throw error
  return (data || []).map(r => r.bacteria_id)
}

export async function getPathologie(pathologieId) {
  const { data, error } = await supabase
    .from('bacterio_pathologies')
    .select('*')
    .eq('id', pathologieId)
    .single()
  if (error) throw error
  return data
}

export async function getZoneLabel(zoneId) {
  const { data, error } = await supabase
    .from('bacterio_zones')
    .select('label, name')
    .eq('id', zoneId)
    .single()
  if (error) throw error
  return data
}

export async function getQuiz(systemId = null) {
  let q = supabase.from('bacterio_quiz').select('*').eq('active', true).order('id')
  if (systemId) q = q.eq('system_id', systemId)
  const { data, error } = await q
  if (error) throw error
  return data || []
}
