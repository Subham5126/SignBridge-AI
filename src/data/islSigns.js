// ISL (Indian Sign Language) dictionary data
// Each entry has the word, category, description, and animation keyframes

export const ISL_SIGNS = [
  // Alphabet
  { id: 'A', word: 'A', category: 'Alphabet', description: 'Closed fist with thumb resting on the side', difficulty: 'easy', color: '#7c3aed' },
  { id: 'B', word: 'B', category: 'Alphabet', description: 'Flat hand, fingers together, thumb folded across palm', difficulty: 'easy', color: '#7c3aed' },
  { id: 'C', word: 'C', category: 'Alphabet', description: 'Curved hand forming a C shape', difficulty: 'easy', color: '#7c3aed' },
  { id: 'D', word: 'D', category: 'Alphabet', description: 'Index finger pointing up, other fingers curved', difficulty: 'easy', color: '#7c3aed' },
  { id: 'E', word: 'E', category: 'Alphabet', description: 'Fingers bent with thumb tucked underneath', difficulty: 'medium', color: '#7c3aed' },
  { id: 'F', word: 'F', category: 'Alphabet', description: 'Index and thumb touching, other fingers up', difficulty: 'medium', color: '#7c3aed' },
  { id: 'G', word: 'G', category: 'Alphabet', description: 'Index finger and thumb pointing sideways', difficulty: 'medium', color: '#7c3aed' },
  { id: 'H', word: 'H', category: 'Alphabet', description: 'Two fingers pointing sideways together', difficulty: 'easy', color: '#7c3aed' },
  { id: 'I', word: 'I', category: 'Alphabet', description: 'Pinky finger raised, others closed', difficulty: 'easy', color: '#7c3aed' },
  { id: 'J', word: 'J', category: 'Alphabet', description: 'Pinky up and trace a J motion', difficulty: 'medium', color: '#7c3aed' },
  { id: 'K', word: 'K', category: 'Alphabet', description: 'Index and middle up with thumb between them', difficulty: 'hard', color: '#7c3aed' },
  { id: 'L', word: 'L', category: 'Alphabet', description: 'L-shape with thumb and index finger', difficulty: 'easy', color: '#7c3aed' },
  { id: 'M', word: 'M', category: 'Alphabet', description: 'Three fingers folded over thumb', difficulty: 'hard', color: '#7c3aed' },
  { id: 'N', word: 'N', category: 'Alphabet', description: 'Two fingers folded over thumb', difficulty: 'hard', color: '#7c3aed' },
  { id: 'O', word: 'O', category: 'Alphabet', description: 'All fingers curved to meet thumb in O shape', difficulty: 'easy', color: '#7c3aed' },
  { id: 'P', word: 'P', category: 'Alphabet', description: 'K handshape pointing downward', difficulty: 'hard', color: '#7c3aed' },
  { id: 'Q', word: 'Q', category: 'Alphabet', description: 'G handshape pointing downward', difficulty: 'medium', color: '#7c3aed' },
  { id: 'R', word: 'R', category: 'Alphabet', description: 'Crossed index and middle fingers', difficulty: 'medium', color: '#7c3aed' },
  { id: 'S', word: 'S', category: 'Alphabet', description: 'Closed fist with thumb over fingers', difficulty: 'easy', color: '#7c3aed' },
  { id: 'T', word: 'T', category: 'Alphabet', description: 'Thumb between index and middle fingers', difficulty: 'medium', color: '#7c3aed' },
  { id: 'U', word: 'U', category: 'Alphabet', description: 'Index and middle fingers together pointing up', difficulty: 'easy', color: '#7c3aed' },
  { id: 'V', word: 'V', category: 'Alphabet', description: 'Index and middle fingers spread in V', difficulty: 'easy', color: '#7c3aed' },
  { id: 'W', word: 'W', category: 'Alphabet', description: 'Three fingers spread (index, middle, ring)', difficulty: 'easy', color: '#7c3aed' },
  { id: 'X', word: 'X', category: 'Alphabet', description: 'Hooked index finger', difficulty: 'medium', color: '#7c3aed' },
  { id: 'Y', word: 'Y', category: 'Alphabet', description: 'Thumb and pinky extended', difficulty: 'easy', color: '#7c3aed' },
  { id: 'Z', word: 'Z', category: 'Alphabet', description: 'Index finger traces a Z in the air', difficulty: 'medium', color: '#7c3aed' },

  // Common words
  { id: 'HELLO', word: 'Hello', category: 'Greetings', description: 'Open hand raised to forehead, move outward', difficulty: 'easy', color: '#06b6d4' },
  { id: 'GOODBYE', word: 'Goodbye', category: 'Greetings', description: 'Wave open hand side to side', difficulty: 'easy', color: '#06b6d4' },
  { id: 'THANK_YOU', word: 'Thank You', category: 'Greetings', description: 'Flat hand from chin moving forward', difficulty: 'easy', color: '#06b6d4' },
  { id: 'PLEASE', word: 'Please', category: 'Greetings', description: 'Flat hand on chest, circular motion', difficulty: 'easy', color: '#06b6d4' },
  { id: 'SORRY', word: 'Sorry', category: 'Greetings', description: 'Fist on chest, circular motion', difficulty: 'easy', color: '#06b6d4' },
  { id: 'YES', word: 'Yes', category: 'Common', description: 'Closed fist nodding up and down', difficulty: 'easy', color: '#10b981' },
  { id: 'NO', word: 'No', category: 'Common', description: 'Index and middle finger close against thumb', difficulty: 'easy', color: '#10b981' },
  { id: 'HELP', word: 'Help', category: 'Emergency', description: 'Thumbs up on flat palm, move upward together', difficulty: 'medium', color: '#ef4444' },
  { id: 'STOP', word: 'Stop', category: 'Emergency', description: 'Flat hand slapping down on other hand', difficulty: 'easy', color: '#ef4444' },
  { id: 'WAIT', word: 'Wait', category: 'Common', description: 'Both hands slightly apart, wiggle fingers', difficulty: 'medium', color: '#10b981' },
  { id: 'I', word: 'I / Me', category: 'Pronouns', description: 'Point index finger to chest', difficulty: 'easy', color: '#f59e0b' },
  { id: 'YOU', word: 'You', category: 'Pronouns', description: 'Point index finger outward', difficulty: 'easy', color: '#f59e0b' },
  { id: 'WE', word: 'We', category: 'Pronouns', description: 'Index finger arc from self to others', difficulty: 'easy', color: '#f59e0b' },
  { id: 'THEY', word: 'They', category: 'Pronouns', description: 'Index finger sweep to the side', difficulty: 'easy', color: '#f59e0b' },
  { id: 'GOOD', word: 'Good', category: 'Adjectives', description: 'Flat hand from chin moving forward and down', difficulty: 'easy', color: '#8b5cf6' },
  { id: 'BAD', word: 'Bad', category: 'Adjectives', description: 'Flat hand from chin flicking outward downward', difficulty: 'easy', color: '#8b5cf6' },
  { id: 'WATER', word: 'Water', category: 'Needs', description: 'W handshape tapping on chin', difficulty: 'medium', color: '#0891b2' },
  { id: 'FOOD', word: 'Food', category: 'Needs', description: 'Fingers bunched, tap mouth', difficulty: 'easy', color: '#0891b2' },
  { id: 'HOME', word: 'Home', category: 'Places', description: 'Flat hand on cheek, move to forehead area', difficulty: 'medium', color: '#ec4899' },
  { id: 'SCHOOL', word: 'School', category: 'Places', description: 'Clap hands twice', difficulty: 'easy', color: '#ec4899' },
  { id: 'WORK', word: 'Work', category: 'Actions', description: 'Fists, tap together at wrist', difficulty: 'medium', color: '#14b8a6' },
  { id: 'LEARN', word: 'Learn', category: 'Actions', description: 'Flat hand picks from palm and moves to forehead', difficulty: 'medium', color: '#14b8a6' },
  { id: 'LOVE', word: 'Love', category: 'Emotions', description: 'Cross arms over chest in X', difficulty: 'easy', color: '#f43f5e' },
  { id: 'HAPPY', word: 'Happy', category: 'Emotions', description: 'Flat hand brush up on chest twice', difficulty: 'easy', color: '#f43f5e' },
  { id: 'SAD', word: 'Sad', category: 'Emotions', description: 'Both hands by cheeks, move downward', difficulty: 'easy', color: '#f43f5e' },
  { id: 'ANGRY', word: 'Angry', category: 'Emotions', description: 'Claw hands in front of face, tense', difficulty: 'medium', color: '#f43f5e' },
  { id: 'HOSPITAL', word: 'Hospital', category: 'Places', description: 'Draw H cross on upper arm', difficulty: 'hard', color: '#ec4899' },
  { id: 'DOCTOR', word: 'Doctor', category: 'People', description: 'D handshape tap wrist', difficulty: 'medium', color: '#a855f7' },
  { id: 'POLICE', word: 'Police', category: 'People', description: 'C handshape on shoulder', difficulty: 'medium', color: '#a855f7' },
  { id: 'FRIEND', word: 'Friend', category: 'People', description: 'Hook index fingers together and switch', difficulty: 'medium', color: '#a855f7' },
]

export const SIGN_CATEGORIES = [
  { id: 'all', label: 'All Signs', count: ISL_SIGNS.length },
  { id: 'Alphabet', label: 'Alphabet', count: 26 },
  { id: 'Greetings', label: 'Greetings', count: 5 },
  { id: 'Common', label: 'Common', count: 4 },
  { id: 'Emergency', label: 'Emergency', count: 2 },
  { id: 'Pronouns', label: 'Pronouns', count: 4 },
  { id: 'Adjectives', label: 'Adjectives', count: 2 },
  { id: 'Needs', label: 'Needs', count: 2 },
  { id: 'Places', label: 'Places', count: 3 },
  { id: 'Actions', label: 'Actions', count: 2 },
  { id: 'Emotions', label: 'Emotions', count: 4 },
  { id: 'People', label: 'People', count: 3 },
]

// Simulated ISL gesture recognition mapping
// Maps landmark patterns to signs (simplified rule-based)
export const GESTURE_PATTERNS = {
  // These represent simplified hand configurations
  'open_palm': 'B',
  'closed_fist': 'A',
  'thumbs_up': 'GOOD',
  'peace': 'V',
  'pointing': 'YOU',
  'ok_sign': 'O',
  'love_sign': 'Y',
  'phone': 'Y',
  'one_finger': 'D',
  'three_fingers': 'W',
}

// Common ISL phrases for sentence correction demo
export const ISL_PHRASES = [
  { raw: 'I GO MARKET TOMORROW', corrected: 'I will go to the market tomorrow.' },
  { raw: 'YOU HELP ME PLEASE', corrected: 'Could you please help me?' },
  { raw: 'I HUNGRY FOOD WANT', corrected: 'I am hungry and want food.' },
  { raw: 'THANK YOU VERY MUCH', corrected: 'Thank you very much!' },
  { raw: 'GOOD MORNING HOW YOU', corrected: 'Good morning! How are you?' },
  { raw: 'I DOCTOR NEED', corrected: 'I need to see a doctor.' },
  { raw: 'WHERE HOSPITAL', corrected: 'Where is the nearest hospital?' },
  { raw: 'I NOT UNDERSTAND', corrected: 'I do not understand.' },
  { raw: 'REPEAT PLEASE SLOW', corrected: 'Please repeat that slowly.' },
  { raw: 'MY NAME SIGN WHAT', corrected: 'What is the sign for my name?' },
]

export const DEMO_SIGNS_SEQUENCE = ['Hello', 'I', 'You', 'Thank You', 'Please', 'Help', 'Good', 'Yes', 'No', 'Love']
