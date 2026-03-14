// @custom API calls — product-specific API functions
import { api } from '../../lib/@system/api.js'

// ─── Analytics API ────────────────────────────────────────────────────────────

export const getDashboard = (range = '7d') =>
  api.get(`/analytics/dashboard?range=${range}`)

export const getAnalyticsOverview = (range = '30d') =>
  api.get(`/analytics/overview?range=${range}`)

export const getTopPages = (range = '7d') =>
  api.get(`/analytics/top-pages?range=${range}`)

export const getTopReferrers = (range = '7d') =>
  api.get(`/analytics/referrers?range=${range}`)

// ─── Funnels API ──────────────────────────────────────────────────────────────

export const getFunnels = () =>
  api.get('/funnels')

export const createFunnel = (data) =>
  api.post('/funnels', data)

export const updateFunnel = (id, data) =>
  api.patch(`/funnels/${id}`, data)

export const deleteFunnel = (id) =>
  api.delete(`/funnels/${id}`)

export const getFunnelAnalysis = (id, range = '30d') =>
  api.get(`/funnels/${id}/analysis?range=${range}`)

// ─── Sessions API ─────────────────────────────────────────────────────────────

export const getSessions = ({ device, country, limit = 50, offset = 0 } = {}) => {
  const params = new URLSearchParams()
  if (device) params.set('device', device)
  if (country) params.set('country', country)
  params.set('limit', String(limit))
  params.set('offset', String(offset))
  return api.get(`/sessions?${params.toString()}`)
}

export const getSession = (id) =>
  api.get(`/sessions/${id}`)

// ─── Brand types ─────────────────────────────────────────────────────────────


// ─── Brand API ────────────────────────────────────────────────────────────────

export const getBrands = () =>
  api.get('/brands')

export const getBrand = (id) =>
  api.get(`/brands/${id}`)

export const createBrand = (data) => api.post('/brands', data)

export const updateBrand = (id, data) => api.patch(`/brands/${id}`, data)

export const uploadBrandLogo = (id, logo) =>
  api.post(`/brands/${id}/logo`, { logo })

export const deleteBrandLogo = (id) =>
  api.delete(`/brands/${id}/logo`)

export const deleteBrand = (id) =>
  api.delete(`/brands/${id}`)
