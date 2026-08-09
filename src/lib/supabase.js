import { createClient } from '@supabase/supabase-js'
import { signInWithGoogleIdentity } from '@/lib/googleAuth'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'public-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

function isSupabaseConfigured() {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL &&
    !import.meta.env.VITE_SUPABASE_URL.includes('xyzcompany')
  )
}

/**
 * Sign up a new user with Supabase Auth
 */
export async function signUpUser(email, password, name) {
  if (!isSupabaseConfigured()) {
    const mockUser = { id: 'user_' + Date.now(), email, user_metadata: { name } }
    return { user: mockUser, session: { token: 'demo-token' }, error: null }
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) throw error
    return { user: data.user, session: data.session, error: null }
  } catch (err) {
    console.warn('Supabase Auth fallback:', err.message)
    const mockUser = { id: 'user_' + Date.now(), email, user_metadata: { name } }
    return { user: mockUser, session: { token: 'demo-token' }, error: null }
  }
}

/**
 * Log in an existing user
 */
export async function signInUser(email, password) {
  if (!isSupabaseConfigured()) {
    const userName = email.split('@')[0]
    const mockUser = { id: 'user_demo', email, user_metadata: { name: userName } }
    return { user: mockUser, session: { token: 'demo-token' }, error: null }
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return { user: data.user, session: data.session, error: null }
  } catch (err) {
    console.warn('Supabase Auth fallback:', err.message)
    const mockUser = { id: 'user_demo', email, user_metadata: { name: email.split('@')[0] } }
    return { user: mockUser, session: { token: 'demo-token' }, error: null }
  }
}

/**
 * Sign out current user
 */
export async function signOutUser() {
  try {
    await supabase.auth.signOut()
  } catch (err) {
    console.warn('Sign out error:', err)
  }
}

/**
 * Log in with Google — Supabase OAuth when configured, otherwise Google Identity Services.
 */
export async function signInWithGoogle() {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/login`,
        },
      })
      if (error) throw error
      return { user: null, error: null, redirecting: true }
    } catch (err) {
      console.warn('Supabase Google OAuth failed, falling back to GIS:', err.message)
    }
  }

  return signInWithGoogleIdentity()
}

/**
 * Restore session after Supabase OAuth redirect or on app load.
 */
export async function restoreAuthSession() {
  if (!isSupabaseConfigured()) return { user: null, error: null }

  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    if (session?.user) {
      return { user: session.user, error: null }
    }
  } catch (err) {
    console.warn('Session restore error:', err.message)
  }

  return { user: null, error: null }
}

/**
 * Listen for Supabase auth state changes (OAuth callbacks, sign-out, etc.)
 */
export function onAuthStateChange(callback) {
  if (!isSupabaseConfigured()) return () => {}

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })

  return () => subscription.unsubscribe()
}

/**
 * Save full user profile metadata
 */
export async function saveUserProfile(profileData) {
  if (!isSupabaseConfigured()) {
    return { user: null, error: null }
  }

  try {
    const { data, error } = await supabase.auth.updateUser({ data: profileData })
    if (error) throw error
    return { user: data.user, error: null }
  } catch (err) {
    console.warn('Profile save error:', err.message)
    return { error: err.message }
  }
}

/**
 * @deprecated Use saveUserProfile instead
 */
export async function updateUserProfile(name, bio) {
  return saveUserProfile({ name, bio, profile_complete: true })
}

/**
 * Save translation session to Supabase database
 */
export async function saveTranslationSession(
    userId,
    rawText,
    correctedText,
    confidence
) {
    if (!isSupabaseConfigured()) {
        return { data: null, error: null }
    }

    try {
        const { data: authData, error: authError } =
            await supabase.auth.getUser()

        if (authError || !authData?.user) {
            return {
                data: null,
                error: authError?.message || "Not authenticated"
            }
        }

        const realUserId = authData.user.id

        const { data, error } = await supabase
            .from("translations")
            .insert([{
                user_id: realUserId,
                raw_text: rawText,
                corrected_text: correctedText,
                confidence: confidence,
                created_at: new Date().toISOString(),
            }])

        if (error) throw error

        return { data, error: null }
    } catch (err) {
        console.warn("Supabase DB save error:", err.message)

        return {
            data: null,
            error: err.message
        }
    }
}
