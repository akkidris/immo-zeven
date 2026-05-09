import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(url, anonKey)

export const supabaseAdmin = () => createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
})

export type ObjectRow = {
  id: string
  url: string
  source: string
  status: 'active' | 'expired' | 'reserved' | 'sold'
  title: string | null
  description: string | null
  city: string | null
  postal_code: string | null
  address: string | null
  price: number | null
  living_area: number | null
  plot_area: number | null
  units: number | null
  rooms: number | null
  year_built: number | null
  year_renovated: number | null
  energy_class: string | null
  annual_rent: number | null
  is_rented: boolean | null
  price_per_sqm: number | null
  factor: number | null
  brutto_yield: number | null
  netto_yield: number | null
  monthly_rate: number | null
  cashflow_monthly: number | null
  score: number | null
  rating: string | null
  raw_data: Record<string, unknown> | null
  notes: string | null
  created_at: string
  updated_at: string
  last_checked_at: string | null
  expired_at: string | null
}
