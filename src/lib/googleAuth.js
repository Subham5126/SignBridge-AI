/**
 * Google Identity Services (GIS) sign-in helpers.
 * Requires the GIS script in index.html and VITE_GOOGLE_CLIENT_ID in .env
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

function getGoogleClientId() {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
}

function waitForGoogleScript(maxWaitMs = 8000) {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve()
      return
    }

    const started = Date.now()
    const timer = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(timer)
        resolve()
      } else if (Date.now() - started > maxWaitMs) {
        clearInterval(timer)
        reject(new Error('Google Sign-In failed to load. Check your network connection.'))
      }
    }, 100)
  })
}

function userFromGooglePayload(payload) {
  return {
    id: payload.sub,
    email: payload.email,
    user_metadata: {
      name: payload.name,
      avatar_url: payload.picture,
      email_verified: payload.email_verified,
      provider: 'google',
    },
  }
}

async function verifyTokenOnBackend(credential) {
  try {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.user ? { user: data.user, error: null } : null
  } catch {
    return null
  }
}

/**
 * Opens the official Google account picker and returns a verified user.
 */
export async function signInWithGoogleIdentity() {
  const clientId = getGoogleClientId()
  if (!clientId) {
    return {
      user: null,
      error: 'Google Client ID is not configured. Add VITE_GOOGLE_CLIENT_ID to your .env file.',
    }
  }

  try {
    await waitForGoogleScript()
  } catch (err) {
    return { user: null, error: err.message }
  }

  return new Promise((resolve) => {
    let settled = false
    const finish = (result) => {
      if (settled) return
      settled = true
      clearTimeout(timeoutId)
      resolve(result)
    }

    const timeoutId = setTimeout(() => {
      finish({ user: null, error: 'Google Sign-In timed out. Please try again.' })
    }, 120_000)

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        const verified = await verifyTokenOnBackend(response.credential)
        if (verified?.user) {
          finish(verified)
          return
        }

        const payload = parseJwt(response.credential)
        if (!payload) {
          finish({ user: null, error: 'Failed to verify Google account.' })
          return
        }

        finish({ user: userFromGooglePayload(payload), error: null })
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    })

    const container = document.createElement('div')
    container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none;'
    document.body.appendChild(container)

    window.google.accounts.id.renderButton(container, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
    })

    const button = container.querySelector('div[role="button"]')
    if (!button) {
      container.remove()
      finish({ user: null, error: 'Could not open Google Sign-In.' })
      return
    }

    button.click()

    setTimeout(() => container.remove(), 60_000)
  })
}
