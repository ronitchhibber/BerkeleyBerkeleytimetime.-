/**
 * Map student-friendly subject codes → official Berkeley catalog codes.
 * Berkeley uses verbose codes (COMPSCI) but students refer to classes by short
 * names (CS). Used by allCoursesStore search and Catalog filter to normalize.
 */
export const SUBJECT_ALIASES: Record<string, string[]> = {
  // Engineering & CS
  COMPSCI: ['CS'],
  ELENG: ['EE'],
  EECS: ['EECS'],
  MECENG: ['ME', 'MECH'],
  CIVENG: ['CE', 'CIVIL'],
  CHMENG: ['CHEME', 'CHEMENG', 'CHE'],
  BIOENG: ['BIOE', 'BE'],
  INDENG: ['IEOR', 'IE'],
  MATSCI: ['MSE', 'MATSE'],
  NUCENG: ['NE', 'NUCE'],
  AEROENG: ['AERO'],
  AEROSPC: ['AEROSPACE'],
  ENGIN: ['ENG', 'E'],
  // Sciences
  PHYSICS: ['PHYS', 'PHY'],
  BIOLOGY: ['BIO'],
  CHEM: ['CHEMISTRY'],
  MCELLBI: ['MCB'],
  INTEGBI: ['IB'],
  PLANTBI: ['PMB', 'PB'],
  ASTRON: ['ASTRO'],
  EPS: ['ESS', 'EARTH'],
  // Math/Stats
  MATH: ['MATHEMATICS'],
  STAT: ['STATS', 'STATISTICS'],
  DATA: ['DS', 'DATASCI'],
  DATASCI: ['DS', 'DATA'],
  // Social Sciences
  ECON: ['ECONOMICS'],
  POLSCI: ['PS', 'POLI', 'POLITICS', 'POLISCI'],
  PSYCH: ['PSYCHOLOGY'],
  SOCIOL: ['SOC', 'SOCIOLOGY'],
  ANTHRO: ['ANTHROPOLOGY', 'ANTH'],
  GEOG: ['GEOGRAPHY'],
  HISTORY: ['HIST'],
  PHILOS: ['PHIL', 'PHILOSOPHY'],
  LINGUIS: ['LING', 'LINGUISTICS'],
  // Humanities
  ENGLISH: ['ENG'],
  COLWRIT: ['COLLEGE WRITING', 'COL'],
  RHETOR: ['RHET', 'RHETORIC'],
  COMLIT: ['COMP LIT', 'CL'],
  CLASSIC: ['CLASSICS'],
  // Languages
  SPANISH: ['SPAN'],
  FRENCH: ['FREN'],
  GERMAN: ['GER'],
  ITALIAN: ['ITAL'],
  JAPAN: ['JAPANESE', 'JAP'],
  CHINESE: ['CHIN'],
  KOREAN: ['KOR'],
  RUSSIAN: ['RUSS'],
  ARABIC: ['ARAB'],
  // Business & Public
  UGBA: ['HAAS', 'BUSINESS', 'BUS'],
  MBA: ['MBA'],
  PBHLTH: ['PH', 'PUBLIC HEALTH'],
  PUBPOL: ['PP', 'PUBLIC POLICY'],
  // Ethnic/Area Studies
  AFRICAM: ['AAS', 'AFRICAN AMERICAN'],
  ASAMST: ['ASIAN AMERICAN'],
  CHICANO: ['CHST'],
  ETHSTD: ['ES'],
  NATAMST: ['NAT AM'],
  GWS: ['GENDER', 'WOMEN'],
  LGBT: ['LGBTQ'],
  // Other
  COGSCI: ['COGNITIVE SCIENCE'],
  MEDIAST: ['MEDIA STUDIES'],
  FILM: ['FM'],
  THEATER: ['TDPS', 'THEATRE'],
  ENVECON: ['EEP'],
  ESPM: ['ENVIRO'],
  NUSCTX: ['NUSC', 'NUTRITION'],
  ARCH: ['ARCHITECTURE'],
  CYPLAN: ['CP', 'CITY PLANNING'],
  LDARCH: ['LA'],
  ENVDES: ['ED'],
  LEGALST: ['LS', 'LEGAL'],
  EDUC: ['EDUCATION'],
  MELC: ['MIDDLE EAST'],
  EALANG: ['EAL', 'EAST ASIAN'],
  SLAVIC: ['SLAV'],
  GLOBAL: ['GS', 'GLOBAL STUDIES'],
  IAS: ['INTERNATIONAL'],
  ISF: ['INTERDISC'],
}

const ALIAS_TO_OFFICIAL: Record<string, string> = {}
for (const [official, aliases] of Object.entries(SUBJECT_ALIASES)) {
  for (const alias of aliases) {
    ALIAS_TO_OFFICIAL[alias.toUpperCase()] = official
  }
  ALIAS_TO_OFFICIAL[official] = official
}

/**
 * Normalize a course query into match variants. Handles:
 *   - "cs 61a" / "cs61a" / "CS 61A"  → COMPSCI 61A
 *   - "phys 7a" → PHYSICS 7A
 *   - "MELC R1B" → MELC R1B (no alias, uses raw)
 *   - "stats 134" → STAT 134
 */
export function normalizeQuery(query: string): { variants: string[]; raw: string } {
  const raw = query.trim().toLowerCase()
  if (!raw) return { variants: [], raw }

  const match = raw.match(/^([a-z&_\s]+?)\s*([0-9][a-z0-9]*)$/i)

  const variants: string[] = []
  if (match) {
    const subjectRaw = match[1].trim().toUpperCase().replace(/\s+/g, ' ')
    const number = match[2].toUpperCase()
    const officialSubj = ALIAS_TO_OFFICIAL[subjectRaw]
    if (officialSubj) variants.push(`${officialSubj} ${number}`)
    variants.push(`${subjectRaw} ${number}`)
  }
  return { variants: [...new Set(variants)], raw }
}
