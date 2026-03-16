// @system — API shim (re-exports apiRequest as api for backward compat)
import { apiRequest } from './utils'
export const api = apiRequest
