/**
 * Parse a paste from CalCentral's "My Academics" page into a list of
 * (semester, courseCode) pairs that can populate the gradtrak store.
 *
 * CalCentral's My Academics text is messy — full of headers, navigation,
 * grades, units, etc. We use a tolerant regex strategy: find anything that
 * looks like a Berkeley course code (`SUBJECT NUMBER`, e.g. `COMPSCI 61A`,
 * `MELC R1B`, `STAT W21`, `MATH H53`, `DATA C8`) attached to a known term
 * label (`Fall 2024`, `Spring 2026`, `Summer 2024`).
 *
 * Strategy:
 *  - Walk through the text line-by-line
 *  - Track the "current semester" header as we encounter it
 *  - Collect course codes that appear under each header
 */

const TERM_HEADER_RE = /\b(Fall|Spring|Summer)\s+(20\d{2})\b/
const COURSE_CODE_RE = /\b([A-Z][A-Z]+(?:\s*&\s*[A-Z]+)?)\s+(?:[CWNHX]?\d{1,3}[A-Z]{0,3})\b/g

// Known Berkeley subject codes (subset of the 217 we have) — used to filter
// out false positives like company names or random caps. We accept anything
// that looks like a code AND matches a real subject.
const VALID_SUBJECT_RE = /^(?:AEROENG|AEROSPC|AFRICAM|AGRS|AHMA|AMERSTD|ANTHRO|ARABIC|ARCH|ARESEC|ARMENI|ART|ASAMST|ASIANST|AST|ASTRON|BIOENG|BIOLOGY|BIOPHY|BUDDSTD|CATALAN|CDSS|CELTIC|CHEM|CHICANO|CHINESE|CHMENG|CIVENG|CLASSIC|COGSCI|COLWRIT|COMLIT|COMPBIO|COMPSCI|CPH|CRITTH|CSOL|CYBER|CYPLAN|CZECH|DANISH|DATA|DATASCI|DEMOG|DESINV|DEVENG|DEVP|DEVSTD|DIGHUM|DUTCH|EALANG|ECON|EDSTEM|EDUC|EECS|EGYPT|ELENG|ENERES|ENGIN|ENGLISH|ENVDES|ENVECON|EPS|ESPM|ETHSTD|EUST|EWMBA|FILIPN|FILM|FINNISH|FOLKLOR|FRENCH|GEOG|GERMAN|GLOBAL|GMS|GPP|GREEK|GSPDP|GWS|HEBREW|HINDI|HISTART|HISTORY|HMEDSCI|HUM|IAS|INDENG|INDONES|INFO|INTEGBI|IRANIAN|ISF|ITALIAN|JAPAN|JEWISH|JOURN|KOREAN|LANPRO|LATAMST|LATIN|LAW|LDARCH|LEGALST|LGBT|LINGUIS|LS|MATH|MATSCI|MBA|MCELLBI|MEC?ENG|MEDIAST|MEDST|MELC|MILSCI|MUSIC|NATAMST|NATRES|NAVSCI|NEU|NEUROSC|NSE|NUCENG|NUSCTX|NWMEDIA|OPTOM|PACS|PBHLTH|PERSIAN|PHILOS|PHYSED|PHYSICS|PLANTBI|POLECON|POLISH|POLSCI|PORTUG|PSYCH|PUBAFF|PUBPOL|RDEV|RHETOR|RUSSIAN|SANSKR|SASIAN|SCANDIN|SEASIAN|SEMITIC|SLAVIC|SOCIOL|SOCWEL|SPANISH|STAT|STS|SWEDISH|TAMIL|THAI|THEATER|TIBETAN|TURKISH|UGBA|UGIS|VIETNMS|VISSCI|YIDDISH)$/i

export interface ParsedSemester {
  term: 'Fall' | 'Spring' | 'Summer'
  year: number
  courseCodes: string[]
}

export function parseCalCentralPaste(input: string): ParsedSemester[] {
  const lines = input.split(/\r?\n/)
  const result = new Map<string, ParsedSemester>()
  let current: ParsedSemester | null = null

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    // Detect a new semester header
    const termMatch = line.match(TERM_HEADER_RE)
    if (termMatch) {
      const term = termMatch[1] as 'Fall' | 'Spring' | 'Summer'
      const year = parseInt(termMatch[2])
      const key = `${term} ${year}`
      if (!result.has(key)) result.set(key, { term, year, courseCodes: [] })
      current = result.get(key)!
      // Don't continue — same line might also have course codes
    }

    if (!current) continue

    // Find every course code on this line
    const matches = [...line.matchAll(COURSE_CODE_RE)]
    for (const m of matches) {
      const subject = m[1].toUpperCase().replace(/\s+/g, '')
      if (!VALID_SUBJECT_RE.test(subject)) continue
      // Re-extract with subject + number from the full match
      const fullMatch = m[0].toUpperCase().replace(/\s+/g, ' ').trim()
      // Normalize spacing: "CS 61A" not "CS  61A"
      const parts = fullMatch.split(/\s+/)
      if (parts.length < 2) continue
      const code = `${parts[0]} ${parts.slice(1).join(' ')}`.toUpperCase()
      if (!current.courseCodes.includes(code)) current.courseCodes.push(code)
    }
  }

  // Sort by chronological order
  const order = { Spring: 0, Summer: 1, Fall: 2 }
  return [...result.values()]
    .filter((s) => s.courseCodes.length > 0)
    .sort((a, b) => a.year - b.year || order[a.term] - order[b.term])
}

