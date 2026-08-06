import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { saveTranslationSession } from '@/lib/supabase'

export const useAppStore = create(
  persist(
    (set, get) => ({
      // Theme / Accessibility
      theme: 'dark',
      highContrast: false,
      largeText: false,
      language: 'en',

      // User
      user: null,
      isAuthenticated: false,

      // Recognition session state
      recognitionActive: false,
      recognitionPaused: false,
      currentSign: null,
      recognizedText: '',
      recognitionHistory: [],
      confidence: 0,

      // Speech state
      speechActive: false,
      speechTranscript: [],

      // Conversation
      conversations: [],

      // Learning
      activePracticeSeconds: 0,
      learningProgress: {
        streak: 1,
        totalSigns: 0,
        accuracy: 85,
        practiceMinutes: 0,
        favoriteSigns: ['Hello', 'Thank You', 'Please'],
        weakSigns: ['Numbers'],
        weeklyData: [0, 0, 0, 0, 0, 0, 0],
      },

      // Saved phrases
      savedPhrases: [
        { id: 1, text: 'Good morning, how are you?', sign: 'GOOD MORNING HOW YOU', category: 'Greetings' },
        { id: 2, text: 'I need help please.', sign: 'I NEED HELP PLEASE', category: 'Emergency' },
        { id: 3, text: 'Thank you very much.', sign: 'THANK YOU VERY MUCH', category: 'Common' },
        { id: 4, text: 'Can you repeat that?', sign: 'YOU REPEAT THAT', category: 'Communication' },
      ],

      // Dashboard stats
      stats: {
        todayRecognitions: 48,
        todayAccuracy: 82,
        weekRecognitions: 312,
        monthRecognitions: 1248,
        chartData: [
          { day: 'Mon', signs: 42, accuracy: 75 },
          { day: 'Tue', signs: 58, accuracy: 80 },
          { day: 'Wed', signs: 35, accuracy: 72 },
          { day: 'Thu', signs: 67, accuracy: 85 },
          { day: 'Fri', signs: 48, accuracy: 78 },
          { day: 'Sat', signs: 72, accuracy: 88 },
          { day: 'Sun', signs: 30, accuracy: 70 },
        ],
      },

      // User History & Profiles Store
      userHistoryStore: {},
      registeredUsers: {},

      // Actions
      setTheme: (theme) => set({ theme }),
      toggleHighContrast: () => set((s) => ({ highContrast: !s.highContrast })),
      toggleLargeText: () => set((s) => ({ largeText: !s.largeText })),
      setLanguage: (language) => set({ language }),

      setUser: (newUser) => set((s) => {
        const storeMap = { ...s.userHistoryStore }

        // Save active user data before switching
        if (s.user?.id || s.user?.email) {
          const activeKey = (s.user.id || s.user.email).toLowerCase()
          storeMap[activeKey] = {
            recognitionHistory: s.recognitionHistory || [],
            activePracticeSeconds: s.activePracticeSeconds || 0,
            conversations: s.conversations || [],
            recognizedText: s.recognizedText || ''
          }
        }

        // Check if user already exists in registeredUsers profile store
        let profileToUse = newUser
        if (newUser?.email) {
          const emailKey = newUser.email.toLowerCase()
          if (s.registeredUsers[emailKey]) {
            profileToUse = {
              ...s.registeredUsers[emailKey],
              ...newUser,
              user_metadata: {
                ...(s.registeredUsers[emailKey]?.user_metadata || {}),
                ...(newUser?.user_metadata || {})
              }
            }
          }
        }

        // Persist profile into registeredUsers
        const updatedRegistered = profileToUse?.email ? {
          ...s.registeredUsers,
          [profileToUse.email.toLowerCase()]: profileToUse
        } : s.registeredUsers

        // Restore target user history data
        let targetHistory = []
        let targetSeconds = 0
        let targetConversations = []
        let targetText = ''

        if (profileToUse?.id || profileToUse?.email) {
          const targetKey = (profileToUse.id || profileToUse.email).toLowerCase()
          if (storeMap[targetKey]) {
            targetHistory = storeMap[targetKey].recognitionHistory || []
            targetSeconds = storeMap[targetKey].activePracticeSeconds || 0
            targetConversations = storeMap[targetKey].conversations || []
            targetText = storeMap[targetKey].recognizedText || ''
          }
        }

        return {
          user: profileToUse,
          isAuthenticated: !!profileToUse,
          registeredUsers: updatedRegistered,
          userHistoryStore: storeMap,
          recognitionHistory: targetHistory,
          activePracticeSeconds: targetSeconds,
          conversations: targetConversations,
          recognizedText: targetText,
          currentSign: null
        }
      }),

      logout: () => set((s) => {
        const storeMap = { ...s.userHistoryStore }

        // Save active user data before logging out
        if (s.user?.id || s.user?.email) {
          const activeKey = (s.user.id || s.user.email).toLowerCase()
          storeMap[activeKey] = {
            recognitionHistory: s.recognitionHistory || [],
            activePracticeSeconds: s.activePracticeSeconds || 0,
            conversations: s.conversations || [],
            recognizedText: s.recognizedText || ''
          }
        }

        return {
          user: null,
          isAuthenticated: false,
          userHistoryStore: storeMap,
          recognitionHistory: [],
          activePracticeSeconds: 0,
          recognizedText: '',
          currentSign: null,
          conversations: []
        }
      }),

      startRecognition: () => set({ recognitionActive: true, recognitionPaused: false }),
      pauseRecognition: () => set((s) => ({ recognitionPaused: !s.recognitionPaused })),
      stopRecognition: () => set({ recognitionActive: false, recognitionPaused: false, currentSign: null }),
      resetRecognition: () => set({ recognizedText: '', recognitionHistory: [], confidence: 0, currentSign: null }),
      setRecognizedText: (text) => set({ recognizedText: text }),

      addRecognizedSign: (sign, confidence) => set((s) => {
        let newText = s.recognizedText

        // Special signs
        if (sign === 'SPACE' || sign === 'space') {
          // Insert a space (avoid double spaces)
          newText = newText.trimEnd() + ' '
        } else if (sign === 'DEL' || sign === 'del') {
          // Delete last character
          newText = newText.slice(0, -1)
        } else if (sign === 'NOTHING' || sign === 'nothing') {
          // Ignore neutral/no-sign frames
          return {}
        } else {
          // Alphabet letter — concatenate directly (no space)
          newText = newText + sign
        }

        if (s.user?.id || s.user?.email) {
          saveTranslationSession(s.user.id || s.user.email, sign, newText, confidence)
        }

        return {
          currentSign: sign,
          confidence,
          recognizedText: newText,
          recognitionHistory: [
            { sign, confidence, timestamp: Date.now() },
            ...s.recognitionHistory.slice(0, 49),
          ],
        }
      }),

      incrementPracticeSeconds: (sec = 1) => set((s) => ({ activePracticeSeconds: (s.activePracticeSeconds || 0) + sec })),
      addConversation: (msg) => set((s) => ({
        conversations: [...s.conversations, { ...msg, id: Date.now() }],
      })),

      savePhraseToggle: (phrase) => set((s) => {
        const exists = s.savedPhrases.find(p => p.text === phrase.text)
        if (exists) {
          return { savedPhrases: s.savedPhrases.filter(p => p.text !== phrase.text) }
        }
        return { savedPhrases: [...s.savedPhrases, { ...phrase, id: Date.now() }] }
      }),
    }),
    {
      name: 'signbridge-store',
      partialize: (state) => ({
        theme: state.theme,
        highContrast: state.highContrast,
        largeText: state.largeText,
        language: state.language,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        savedPhrases: state.savedPhrases,
        learningProgress: state.learningProgress,
        recognitionHistory: state.recognitionHistory,
        activePracticeSeconds: state.activePracticeSeconds,
        userHistoryStore: state.userHistoryStore,
        registeredUsers: state.registeredUsers,
      }),
    }
  )
)
