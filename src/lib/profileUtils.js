export const USER_ROLES = [
  { id: 'deaf', label: 'Deaf / Hard of Hearing', desc: 'I use sign language as my primary language' },
  { id: 'hearing_ally', label: 'Hearing Ally', desc: 'I want to communicate with deaf friends or family' },
  { id: 'interpreter', label: 'Interpreter / Professional', desc: 'I work with sign language professionally' },
  { id: 'student', label: 'Student', desc: 'I am learning sign language in school or college' },
  { id: 'educator', label: 'Educator / Teacher', desc: 'I teach or mentor sign language learners' },
]

export const SIGN_LANGUAGES = [
  { id: 'asl', label: 'ASL (American Sign Language)' },
  { id: 'bsl', label: 'BSL (British Sign Language)' },
  { id: 'isl', label: 'ISL (Indian Sign Language)' },
  { id: 'other', label: 'Other / Multiple' },
]

export const EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'Beginner', desc: 'Just starting out — learning basics' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Can hold simple conversations' },
  { id: 'advanced', label: 'Advanced', desc: 'Fluent or near-fluent signer' },
]

export const PRIMARY_GOALS = [
  { id: 'learn_asl', label: 'Learn sign language', desc: 'Build vocabulary and grammar step by step' },
  { id: 'daily_communication', label: 'Daily communication', desc: 'Talk with deaf/HoH people in everyday life' },
  { id: 'workplace', label: 'Workplace accessibility', desc: 'Use sign language at work or with colleagues' },
  { id: 'family', label: 'Connect with family', desc: 'Communicate better with loved ones' },
  { id: 'teaching', label: 'Teach or mentor others', desc: 'Help others learn and practice signing' },
]

export function isProfileComplete(user) {
  if (!user) return false
  return user.user_metadata?.profile_complete === true
}

export function getPostLoginPath(user) {
  return isProfileComplete(user) ? '/app' : '/app/profile'
}

export function getProfileDefaults(user) {
  const meta = user?.user_metadata || {}
  const customAvatar = user?.custom_avatar_url || meta.custom_avatar_url
  return {
    name: meta.name || user?.email?.split('@')[0] || '',
    role: meta.role || '',
    sign_language: meta.sign_language || '',
    experience_level: meta.experience_level || '',
    primary_goal: meta.primary_goal || '',
    bio: meta.bio || '',
    location: meta.location || '',
    avatar_url: customAvatar || user?.avatar_url || meta.avatar_url || '',
  }
}
