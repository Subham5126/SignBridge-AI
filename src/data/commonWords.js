// Expanded dictionary of common English words for sign language autocomplete suggestions
export const COMMON_WORDS = [
  // A
  'ABOUT', 'AFTER', 'AGAIN', 'ALL', 'ALSO', 'ALWAYS', 'AND', 'ANIMAL', 'ANSWER', 'ANY', 'APPLE', 'ARE', 'ASK', 'AT',
  // B
  'BABY', 'BACK', 'BAD', 'BAG', 'BALL', 'BALLOON', 'BANANA', 'BEAUTIFUL', 'BECAUSE', 'BED', 'BEFORE', 'BEST', 'BIG', 'BIRD', 'BLACK', 'BLUE', 'BOOK', 'BOY', 'BREAD', 'BROTHER', 'BUS', 'BUT', 'BUY', 'BYE',
  'BAL', 'BALL',
  // C
  'CALL', 'CAMERA', 'CAN', 'CAR', 'CAT', 'CHAIR', 'CHILD', 'CITY', 'CLEAN', 'CLOSE', 'COLD', 'COLOR', 'COME', 'COMPUTER', 'CONNECT', 'COOK', 'COOL',
  // D
  'DAD', 'DANCE', 'DAY', 'DEAR', 'DOCTOR', 'DOG', 'DOOR', 'DOWN', 'DRAW', 'DRINK', 'DRIVE',
  // E
  'EARLY', 'EARTH', 'EAT', 'EGG', 'EIGHT', 'EVERY', 'EXCELLENT', 'EYE',
  // F
  'FAMILY', 'FAR', 'FAST', 'FATHER', 'FEEL', 'FINE', 'FIRE', 'FIRST', 'FISH', 'FIVE', 'FLOWER', 'FOOD', 'FOR', 'FRIEND', 'FROM', 'FULL', 'FUN',
  // G
  'GAME', 'GARDEN', 'GIFT', 'GIRL', 'GIVE', 'GLASS', 'GO', 'GOOD', 'GREAT', 'GREEN', 'GROUP',
  // H
  'HAPPY', 'HARD', 'HAT', 'HAVE', 'HE', 'HEAD', 'HEALTH', 'HEAR', 'HELLO', 'HELP', 'HER', 'HERE', 'HI', 'HIGH', 'HOME', 'HOPE', 'HOSPITAL', 'HOT', 'HOUSE', 'HOW',
  // I
  'I', 'ICE', 'IDEA', 'IF', 'IMPORTANT', 'IN', 'INSIDE', 'INTERESTING', 'INTO', 'IS', 'IT',
  // J
  'JOB', 'JOIN', 'JOY', 'JUICE', 'JUMP',
  // K
  'KEEP', 'KEY', 'KIND', 'KING', 'KITCHEN', 'KNOW',
  // L
  'LANGUAGE', 'LARGE', 'LAST', 'LATE', 'LAUGH', 'LEARN', 'LEFT', 'LETTER', 'LIFE', 'LIGHT', 'LIKE', 'LINE', 'LITTLE', 'LIVE', 'LONG', 'LOOK', 'LOVE', 'LUNCH',
  // M
  'MAKE', 'MAN', 'MANY', 'MARKET', 'MAY', 'ME', 'MEET', 'MILK', 'MINUTE', 'MOM', 'MONEY', 'MONTH', 'MOON', 'MORE', 'MORNING', 'MOTHER', 'MOUNTAIN', 'MOUSE', 'MOUTH', 'MUCH', 'MUSIC', 'MY',
  // N
  'NAME', 'NATURE', 'NEAR', 'NEED', 'NEVER', 'NEW', 'NEXT', 'NICE', 'NIGHT', 'NINE', 'NO', 'NOISE', 'NOON', 'NOT', 'NOW', 'NUMBER',
  // O
  'OFF', 'OFFICE', 'OLD', 'ON', 'ONE', 'ONLY', 'OPEN', 'OR', 'ORANGE', 'OTHER', 'OUR', 'OUT', 'OUTSIDE',
  // P
  'PAGE', 'PAPER', 'PARENT', 'PARK', 'PARTY', 'PEOPLE', 'PHONE', 'PICTURE', 'PLACE', 'PLAY', 'PLEASE', 'POWER', 'PROBLEM',
  // Q
  'QUEEN', 'QUESTION', 'QUICK', 'QUIET',
  // R
  'RAIN', 'READ', 'READY', 'RED', 'REMEMBER', 'REST', 'RIGHT', 'RIVER', 'ROAD', 'ROOM', 'RUN',
  // S
  'SAD', 'SAME', 'SCHOOL', 'SEA', 'SECOND', 'SEE', 'SEVEN', 'SHE', 'SHOES', 'SHOP', 'SHORT', 'SHOW', 'SIGN', 'SISTER', 'SIX', 'SKY', 'SLEEP', 'SLOW', 'SMALL', 'SMILE', 'SNOW', 'SOME', 'SON', 'SONG', 'SORRY', 'SPEAK', 'SPORT', 'SPRING', 'STAR', 'START', 'STATION', 'STOP', 'STORY', 'STREET', 'STUDENT', 'SUN', 'SWEET',
  // T
  'TABLE', 'TAKE', 'TALK', 'TEACHER', 'TEN', 'THANK', 'THANKS', 'THAT', 'THE', 'THEIR', 'THEM', 'THEN', 'THERE', 'THESE', 'THEY', 'THING', 'THINK', 'THIS', 'THREE', 'TIME', 'TO', 'TODAY', 'TOGETHER', 'TOMORROW', 'TONIGHT', 'TOO', 'TOWN', 'TRAIN', 'TREE', 'TRY', 'TWO',
  // U
  'UNDER', 'UNDERSTAND', 'UNIVERSITY', 'UNTIL', 'UP', 'US', 'USE',
  // V
  'VERY', 'VICTORY', 'VILLAGE', 'VISIT', 'VOICE',
  // W
  'WAIT', 'WALK', 'WANT', 'WARM', 'WASH', 'WATCH', 'WATER', 'WAY', 'WE', 'WEATHER', 'WELCOME', 'WELL', 'WHAT', 'WHEN', 'WHERE', 'WHICH', 'WHITE', 'WHO', 'WHY', 'WIFE', 'WIN', 'WINDOW', 'WINTER', 'WITH', 'WOMAN', 'WORD', 'WORK', 'WORLD', 'WRITE',
  // Y
  'YEAR', 'YELLOW', 'YES', 'YESTERDAY', 'YOU', 'YOUR', 'YOUNG',
  // Z
  'ZERO', 'ZOO'
]

/**
 * Returns up to maxResults word autocomplete suggestions based on the last unfinished word.
 * @param {string} text Full recognized text string
 * @param {number} maxResults Max number of suggestions (default 4)
 * @returns {Array<{word: string, replacementText: string}>}
 */
export function getWordSuggestions(text, maxResults = 5) {
  if (!text) return []

  // Trim trailing spaces for token matching so suggestions work smoothly even after a trailing space
  const trimmed = text.trimEnd()
  if (!trimmed) return []

  const words = trimmed.split(/\s+/)
  const currentToken = words[words.length - 1]?.toUpperCase()

  if (!currentToken || currentToken.length < 1) return []

  // Find matching words starting with currentToken (allowing exact match or prefix match)
  const matches = Array.from(new Set(
    COMMON_WORDS.filter(w => w.startsWith(currentToken))
  )).slice(0, maxResults)

  // Format replacements
  const baseText = words.slice(0, -1).join(' ')
  const prefix = baseText ? baseText + ' ' : ''

  return matches.map(word => ({
    word,
    replacementText: prefix + word + ' '
  }))
}
