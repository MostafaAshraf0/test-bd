import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/^['"]|['"]$/g, '')
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim().replace(/^['"]|['"]$/g, '')

  if (!supabaseUrl || !/^https?:\/\/[^\s]+$/.test(supabaseUrl)) {
    throw new Error('Invalid NEXT_PUBLIC_SUPABASE_URL. Set it to your Supabase URL, for example https://your-project.supabase.co.')
  }

  if (!supabaseKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Add it to the Vercel environment variables.')
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseKey
  )
}
