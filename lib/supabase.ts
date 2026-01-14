import { createClient } from '@supabase/supabase-js'
import { Database } from './supabase/database.types'

// ============================================
// Environment Variable Validation
// ============================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// ============================================
// Main Supabase Client (For Client-Side Usage)
// ============================================
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Persist session across page reloads
    autoRefreshToken: true, // Automatically refresh expired tokens
    detectSessionInUrl: true, // Detect OAuth session in URL
    storage: typeof window !== 'undefined' ? window.localStorage : undefined, // Use localStorage in browser
    flowType: 'pkce', // Use PKCE flow for enhanced security
  },
  global: {
    headers: {
      'x-application-name': 'ask-gene-web3', // Identify application in requests
      'x-client-info': 'nextjs', // Identify client framework
    },
  },
  db: {
    schema: 'public', // Use the public schema by default
  },
})

// ============================================
// Type Exports (From database.types.ts)
// ============================================
export type Tables = Database['public']['Tables'] // All table types
export type Enums = Database['public']['Enums'] // All enum types

// Common table row types
export type Profile = Tables['profiles']['Row']
export type Consultant = Tables['consultants']['Row']
export type Consultation = Tables['consultations']['Row']
export type Feedback = Tables['feedback']['Row']

// ============================================
// Common Query Functions (Usable on Client and Server)
// ============================================

/**
 * Retrieves all verified consultants with optional filtering
 * @param options Optional parameters for filtering and pagination
 * @returns Array of verified consultant records
 */
export async function getVerifiedConsultants(options?: {
  limit?: number // Number of records to return
  offset?: number // Pagination offset
  expertise?: string[] // Filter by expertise areas
}) {
  const { limit = 20, offset = 0, expertise } = options || {}

  // Build base query for verified and active consultants
  let query = supabase
    .from('consultants')
    .select('*')
    .eq('is_verified', true) // Only verified consultants
    .eq('is_active', true) // Only active consultants
    .order('rating', { ascending: false }) // Sort by highest rating first
    .range(offset, offset + limit - 1) // Apply pagination

  // Add expertise filter if provided
  if (expertise && expertise.length > 0) {
    query = query.contains('expertise', expertise) // Filter by expertise array
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching verified consultants:', error)
    return []
  }

  return data || []
}

/**
 * Retrieves a single consultant by their ID
 * @param id Consultant's unique identifier
 * @returns Consultant record or null if not found
 */
export async function getConsultantById(id: string) {
  const { data, error } = await supabase
    .from('consultants')
    .select('*')
    .eq('id', id)
    .single() // Expects exactly one record

  if (error) {
    console.error('Error fetching consultant:', error)
    return null
  }

  return data
}

/**
 * Searches consultants by name, title, or bio
 * @param query Search term
 * @param options Optional pagination parameters
 * @returns Array of matching consultant records
 */
export async function searchConsultants(query: string, options?: {
  limit?: number // Number of results to return
  offset?: number // Pagination offset
}) {
  const { limit = 20, offset = 0 } = options || {}

  const { data, error } = await supabase
    .from('consultants')
    .select('*')
    .or(`name.ilike.%${query}%,title.ilike.%${query}%,bio.ilike.%${query}%`) // Case-insensitive search across multiple fields
    .eq('is_verified', true) // Only verified consultants
    .eq('is_active', true) // Only active consultants
    .order('rating', { ascending: false }) // Sort by highest rating first
    .range(offset, offset + limit - 1) // Apply pagination

  if (error) {
    console.error('Error searching consultants:', error)
    return []
  }

  return data || []
}

/**
 * Retrieves public feedback for a specific consultant
 * @param consultantId Consultant's unique identifier
 * @param options Optional pagination parameters
 * @returns Array of feedback records with consultation details
 */
export async function getConsultantFeedback(consultantId: string, options?: {
  limit?: number // Number of feedback items to return
  offset?: number // Pagination offset
}) {
  const { limit = 20, offset = 0 } = options || {}

  const { data, error } = await supabase
    .from('feedback')
    .select(`
      *,
      consultation:consultations(title, scheduled_for) // Include related consultation data
    `)
    .eq('consultant_id', consultantId) // Filter by consultant
    .eq('is_public', true) // Only public feedback
    .order('created_at', { ascending: false }) // Sort by most recent first
    .range(offset, offset + limit - 1) // Apply pagination

  if (error) {
    console.error('Error fetching consultant feedback:', error)
    return []
  }

  return data || []
}

// ============================================
// Utility Functions
// ============================================

/**
 * Formats a numeric amount as a currency string
 * @param amount Numeric amount to format
 * @param currency Currency code (default: 'USD')
 * @returns Formatted currency string
 */
export function formatPrice(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0, // No decimal places for whole numbers
    maximumFractionDigits: 2, // Up to 2 decimal places
  }).format(amount)
}

/**
 * Truncates an Ethereum address for display purposes
 * @param address Full Ethereum address (0x...)
 * @param start Number of characters to keep from the beginning
 * @param end Number of characters to keep from the end
 * @returns Truncated address (e.g., 0xabcd...1234)
 */
export function truncateAddress(address: string, start: number = 6, end: number = 4): string {
  // Validate address format (basic Ethereum address check)
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return address // Return original if not a valid Ethereum address
  }
  return `${address.slice(0, start)}...${address.slice(-end)}`
}