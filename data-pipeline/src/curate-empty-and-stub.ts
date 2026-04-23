/**
 * Curated requirements for the 6 empty + 21 stub majors + 36 stub minors.
 *
 * Sources: Berkeley Academic Guide / department websites as of 2025-26 academic
 * year. Each program description notes when verification is recommended.
 *
 * Conservative posture: when a department offers many electives, we list the
 * commonly-required core + the most frequently approved electives. Departments
 * routinely add/drop electives each year — verify against catalog.berkeley.edu
 * for the user's catalog year before relying on this for graduation planning.
 */
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROGRAMS_PATH = join(__dirname, '..', '..', 'public', 'data', 'programs.json')

interface Program {
  id: string
  name: string
  type: 'major' | 'minor' | 'college' | 'certificate' | 'university'
  groups: any[]
}

// ─── EMPTY PROGRAMS (advisory + language-tracking) ──────────────────
const EMPTY: Program[] = [
  {
    id: 'pre-med-pre-health-ba',
    name: 'Pre-Med / Pre-Health',
    type: 'major',
    groups: [
      {
        id: 'premed-prereqs',
        name: 'Pre-Health Course Prerequisites',
        description: 'Pre-Med / Pre-Health is a track, not a major — students choose any major. These are the medical-school prerequisites the Career Center recommends. Allopathic (MD), osteopathic (DO), and PA programs all accept these. Verify your specific target schools at careers.berkeley.edu/pre-health.',
        requirements: [
          { id: 'premed-bio', name: 'Year of biology with lab', rule: { type: 'choose', count: 2, from: ['BIOLOGY 1A', 'BIOLOGY 1AL', 'BIOLOGY 1B', 'INTEGBI 161', 'MCELLBI 102', 'MCELLBI C100A'] } },
          { id: 'premed-genchem', name: 'General chemistry with lab', rule: { type: 'choose', count: 2, from: ['CHEM 1A', 'CHEM 1AL', 'CHEM 1B', 'CHEM 4A', 'CHEM 4B'] } },
          { id: 'premed-orgchem', name: 'Organic chemistry', rule: { type: 'choose', count: 2, from: ['CHEM 3A', 'CHEM 3AL', 'CHEM 3B', 'CHEM 3BL', 'CHEM 12A', 'CHEM 12B'] } },
          { id: 'premed-biochem', name: 'Biochemistry', rule: { type: 'choose', count: 1, from: ['MCELLBI 102', 'MCELLBI C100A', 'CHEM 135', 'NUSCTX 110'] } },
          { id: 'premed-physics', name: 'Year of physics with lab', rule: { type: 'choose', count: 2, from: ['PHYSICS 8A', 'PHYSICS 8B', 'PHYSICS 7A', 'PHYSICS 7B'] } },
          { id: 'premed-math', name: 'Calculus / quant reasoning', rule: { type: 'choose', count: 1, from: ['MATH 16A', 'MATH 16B', 'MATH 1A', 'MATH 1B', 'MATH 10A', 'MATH 10B'] } },
          { id: 'premed-stats', name: 'Statistics', rule: { type: 'choose', count: 1, from: ['STAT 2', 'STAT 20', 'STAT 21', 'PB HLTH 142', 'DATA C8'] } },
          { id: 'premed-english', name: 'English / writing-intensive', rule: { type: 'choose', count: 2, from: ['ENGLISH R1A', 'ENGLISH R1B', 'COMLIT R1A', 'COMLIT R1B', 'COLWRIT R1A', 'COLWRIT R1B', 'RHETOR R1A', 'RHETOR R1B'] } },
          { id: 'premed-psych-soc', name: 'Psychology + Sociology (MCAT prep)', rule: { type: 'choose', count: 2, from: ['PSYCH 1', 'PSYCH 2', 'PSYCH 101', 'SOCIOL 1', 'SOCIOL 3AC', 'SOCIOL 5'] } },
        ],
      },
    ],
  },
  {
    id: 'prelaw-information-ba',
    name: 'Prelaw Information',
    type: 'major',
    groups: [
      {
        id: 'prelaw-development',
        name: 'Pre-Law Skill Development',
        description: 'Pre-Law is a track, not a major — law schools accept any undergraduate major. The Career Center recommends developing strong reading, writing, analytical, and oral-communication skills. These courses build the foundations the LSAT and 1L year reward.',
        requirements: [
          { id: 'prelaw-writing', name: 'Two writing-intensive courses', rule: { type: 'choose', count: 2, from: ['ENGLISH R1A', 'ENGLISH R1B', 'COMLIT R1A', 'COMLIT R1B', 'COLWRIT R1A', 'COLWRIT R1B', 'RHETOR R1A', 'RHETOR R1B', 'LEGALST 100'] } },
          { id: 'prelaw-logic', name: 'Logic / critical reasoning', rule: { type: 'choose', count: 1, from: ['PHILOS 12A', 'PHILOS 100', 'PHILOS 140A', 'COMPSCI 70'] } },
          { id: 'prelaw-legal', name: 'Legal studies foundations', rule: { type: 'choose', count: 2, from: ['LEGALST 100', 'LEGALST 101', 'LEGALST 102', 'LEGALST 103', 'LEGALST 104'] } },
          { id: 'prelaw-econ', name: 'Economics or political-economy course', rule: { type: 'choose', count: 1, from: ['ECON 1', 'ECON 2', 'POL SCI 2', 'PUB POL 101', 'POLECON 100'] } },
          { id: 'prelaw-history', name: 'American history / institutions', rule: { type: 'choose', count: 1, from: ['HISTORY 7A', 'HISTORY 7B', 'POL SCI 1', 'POL SCI 102'] } },
        ],
      },
    ],
  },
  {
    id: 'japanese-language-ba',
    name: 'Japanese Language',
    type: 'major',
    groups: [
      {
        id: 'japanese-prereq',
        name: 'Language Prerequisites',
        description: 'East Asian Languages & Cultures, Japanese track. Verify with EALC undergraduate advisor at ealc.berkeley.edu.',
        requirements: [
          { id: 'jpn-elementary', name: 'Elementary Japanese', rule: { type: 'choose', count: 2, from: ['JAPAN 1A', 'JAPAN 1B', 'JAPAN 10A', 'JAPAN 10B'] } },
          { id: 'jpn-intermediate', name: 'Intermediate Japanese', rule: { type: 'choose', count: 2, from: ['JAPAN 100A', 'JAPAN 100B', 'JAPAN 110', 'JAPAN 111', 'JAPAN 112'] } },
        ],
      },
      {
        id: 'japanese-upper',
        name: 'Upper Division Major Coursework',
        requirements: [
          { id: 'jpn-advanced', name: 'Advanced Japanese (3 courses)', rule: { type: 'choose', count: 3, from: ['JAPAN 100A', 'JAPAN 100B', 'JAPAN 110', 'JAPAN 111', 'JAPAN 112', 'JAPAN 120', 'JAPAN 130', 'JAPAN 140'] } },
          { id: 'jpn-literature', name: 'Japanese literature / culture (3 courses)', rule: { type: 'choose', count: 3, from: ['JAPAN 100', 'JAPAN 116', 'JAPAN 117', 'JAPAN 118', 'JAPAN 119', 'JAPAN 120', 'JAPAN 145', 'JAPAN 155', 'EA LANG 138'] } },
          { id: 'jpn-electives', name: 'Approved electives (2 upper-div)', rule: { type: 'choose', count: 2, from: ['JAPAN 100', 'JAPAN 116', 'JAPAN 117', 'JAPAN 145', 'JAPAN 155', 'EA LANG 138', 'HISTORY 117A', 'HISTORY 117B'] } },
        ],
      },
    ],
  },
  {
    id: 'east-european-eurasian-languages-and-or-cultures-ba',
    name: 'East European/Eurasian Languages and/or Cultures',
    type: 'major',
    groups: [
      {
        id: 'eelc-language',
        name: 'Language Sequence',
        description: 'Slavic Languages & Literatures: choose Russian, Polish, Czech, BCS (Bosnian/Croatian/Serbian), or Bulgarian as your primary language. Verify with department.',
        requirements: [
          { id: 'eelc-elementary', name: 'Elementary language sequence', rule: { type: 'choose', count: 2, from: ['RUSSIAN 1', 'RUSSIAN 2', 'POLISH 1', 'POLISH 2', 'CZECH 1', 'CZECH 2', 'BCS 1', 'BCS 2', 'BULGARI 1', 'BULGARI 2'] } },
          { id: 'eelc-intermediate', name: 'Intermediate language sequence', rule: { type: 'choose', count: 2, from: ['RUSSIAN 3', 'RUSSIAN 4', 'POLISH 100A', 'POLISH 100B', 'CZECH 100A', 'CZECH 100B', 'BCS 100A', 'BCS 100B'] } },
        ],
      },
      {
        id: 'eelc-upper',
        name: 'Upper Division',
        requirements: [
          { id: 'eelc-literature', name: 'Slavic / E.Eur literature & culture (3)', rule: { type: 'choose', count: 3, from: ['SLAVIC 134', 'SLAVIC 137', 'SLAVIC 145', 'SLAVIC 147', 'SLAVIC 150', 'RUSSIAN 100A', 'RUSSIAN 100B', 'RUSSIAN 105', 'RUSSIAN 120', 'RUSSIAN 130'] } },
          { id: 'eelc-history', name: 'Eastern European history / area studies (2)', rule: { type: 'choose', count: 2, from: ['HISTORY 158C', 'HISTORY 158D', 'POL SCI 142A', 'SLAVIC R5A', 'SLAVIC R5B'] } },
          { id: 'eelc-electives', name: 'Approved Slavic / E.Eur electives (2)', rule: { type: 'choose', count: 2, from: ['SLAVIC 130', 'SLAVIC 131', 'SLAVIC 132', 'SLAVIC 138', 'POLISH 105', 'CZECH 105', 'BCS 105'] } },
        ],
      },
    ],
  },
  {
    id: 'east-european-eurasian-languages-and-or-cultures-minor',
    name: 'East European/Eurasian Languages and/or Cultures',
    type: 'minor',
    groups: [
      {
        id: 'eelc-min',
        name: 'Minor Coursework (5 upper-division)',
        description: 'Five upper-division Slavic / E.European courses, ≥3 with substantive language content. Verify with Slavic department.',
        requirements: [
          { id: 'eelc-min-language', name: 'Language at intermediate+ level (2)', rule: { type: 'choose', count: 2, from: ['RUSSIAN 100A', 'RUSSIAN 100B', 'RUSSIAN 105', 'POLISH 100A', 'POLISH 100B', 'CZECH 100A', 'CZECH 100B', 'BCS 100A', 'BCS 100B'] } },
          { id: 'eelc-min-electives', name: 'Slavic / E.Eur upper-div electives (3)', rule: { type: 'choose', count: 3, from: ['SLAVIC 134', 'SLAVIC 137', 'SLAVIC 145', 'SLAVIC 147', 'RUSSIAN 120', 'RUSSIAN 130', 'POLISH 105', 'HISTORY 158C', 'HISTORY 158D', 'POL SCI 142A'] } },
        ],
      },
    ],
  },
  {
    id: 'lesbian-gay-bisexual-and-transgender-studies-minor',
    name: 'Lesbian, Gay, Bisexual, & Transgender Studies',
    type: 'minor',
    groups: [
      {
        id: 'lgbts-min',
        name: 'LGBT Studies Coursework (5 courses)',
        description: 'LGBT Studies minor administered through the Gender & Women\'s Studies department. Five courses, ≥3 upper-division. Cross-listed courses count.',
        requirements: [
          { id: 'lgbts-foundation', name: 'GWS 100 / 101 / LGBT-focused intro', rule: { type: 'choose', count: 1, from: ['GWS 100AC', 'GWS 101', 'LGBT 145AC', 'LGBT 100'] } },
          { id: 'lgbts-electives', name: 'LGBT-focused upper-division electives (4)', rule: { type: 'choose', count: 4, from: ['LGBT 145AC', 'LGBT 146AC', 'LGBT 150AC', 'GWS 134AC', 'GWS 138', 'GWS 145', 'ANTHRO 136G', 'ENGLISH 173', 'HISTORY 124B', 'PSYCH 167AC', 'SOCIOL 121'] } },
        ],
      },
    ],
  },
]

// ─── STUB MAJORS — flesh out with course lists ──────────────────────
const STUB_MAJORS: Program[] = [
  {
    id: 'english-ba',
    name: 'English',
    type: 'major',
    groups: [
      {
        id: 'eng-prereq',
        name: 'Prerequisites',
        description: 'English major. Verify catalog year requirements at english.berkeley.edu.',
        requirements: [
          { id: 'eng-r1b', name: 'Reading & Composition Part B', rule: { type: 'breadth', breadth: 'Reading and Composition B', count: 1 } },
          { id: 'eng-45', name: 'English 45A or 45B (Literature in English)', rule: { type: 'choose', count: 2, from: ['ENGLISH 45A', 'ENGLISH 45B', 'ENGLISH 45C'] } },
        ],
      },
      {
        id: 'eng-upper',
        name: 'Upper Division (8 courses)',
        requirements: [
          { id: 'eng-historical', name: 'Pre-1800 literature (2)', rule: { type: 'choose', count: 2, from: ['ENGLISH 100', 'ENGLISH 111', 'ENGLISH 112', 'ENGLISH 116', 'ENGLISH 117A', 'ENGLISH 117B', 'ENGLISH 117C', 'ENGLISH 117S', 'ENGLISH 122'] } },
          { id: 'eng-1800-1900', name: '1800-1900 literature (1)', rule: { type: 'choose', count: 1, from: ['ENGLISH 125A', 'ENGLISH 125B', 'ENGLISH 125C', 'ENGLISH 125D', 'ENGLISH 130A', 'ENGLISH 130B', 'ENGLISH 130C', 'ENGLISH 130D'] } },
          { id: 'eng-modern', name: 'Modern / 20-21st century literature (1)', rule: { type: 'choose', count: 1, from: ['ENGLISH 165', 'ENGLISH 166', 'ENGLISH 173', 'ENGLISH 174', 'ENGLISH 175', 'ENGLISH 176', 'ENGLISH 177'] } },
          { id: 'eng-american', name: 'American literature (1)', rule: { type: 'choose', count: 1, from: ['ENGLISH 130A', 'ENGLISH 130B', 'ENGLISH 130C', 'ENGLISH 132', 'ENGLISH 133', 'ENGLISH 135', 'ENGLISH 165AC', 'ENGLISH 166AC'] } },
          { id: 'eng-electives', name: 'Upper-division English electives (3)', rule: { type: 'choose', count: 3, from: ['ENGLISH 100', 'ENGLISH 101', 'ENGLISH 103', 'ENGLISH 110', 'ENGLISH 119', 'ENGLISH 137', 'ENGLISH 143', 'ENGLISH 150', 'ENGLISH 165', 'ENGLISH 167AC', 'ENGLISH 170', 'ENGLISH 173', 'ENGLISH 175', 'ENGLISH 180A', 'ENGLISH 180D', 'ENGLISH 180H', 'ENGLISH 190'] } },
        ],
      },
    ],
  },
  {
    id: 'mathematics-ba',
    name: 'Mathematics',
    type: 'major',
    groups: [
      {
        id: 'math-lower',
        name: 'Lower Division',
        requirements: [
          { id: 'math-1a-1b', name: 'Single-variable calculus', rule: { type: 'choose', count: 2, from: ['MATH 1A', 'MATH 1B', 'MATH N1A', 'MATH N1B'] } },
          { id: 'math-53', name: 'Multivariable calculus', rule: { type: 'choose', count: 1, from: ['MATH 53', 'MATH H53', 'MATH N53'] } },
          { id: 'math-54', name: 'Linear algebra & differential equations', rule: { type: 'choose', count: 1, from: ['MATH 54', 'MATH H54', 'MATH N54', 'MATH 56'] } },
          { id: 'math-55', name: 'Discrete math', rule: { type: 'choose', count: 1, from: ['MATH 55', 'MATH N55'] } },
        ],
      },
      {
        id: 'math-upper',
        name: 'Upper Division (8 courses)',
        requirements: [
          { id: 'math-104', name: 'Analysis I (MATH 104 or H104)', rule: { type: 'choose', count: 1, from: ['MATH 104', 'MATH H104'] } },
          { id: 'math-110', name: 'Linear Algebra II (MATH 110 or H110)', rule: { type: 'choose', count: 1, from: ['MATH 110', 'MATH H110'] } },
          { id: 'math-113', name: 'Abstract Algebra (MATH 113 or H113)', rule: { type: 'choose', count: 1, from: ['MATH 113', 'MATH H113'] } },
          { id: 'math-185', name: 'Complex analysis OR additional analysis', rule: { type: 'choose', count: 1, from: ['MATH 185', 'MATH H185', 'MATH 105', 'MATH H105'] } },
          { id: 'math-electives', name: 'Math upper-division electives (4)', rule: { type: 'choose', count: 4, from: ['MATH 121A', 'MATH 121B', 'MATH 125A', 'MATH 126', 'MATH 127', 'MATH 128A', 'MATH 128B', 'MATH 130', 'MATH 135', 'MATH 136', 'MATH 140', 'MATH 142', 'MATH 143', 'MATH 151', 'MATH 152', 'MATH 153', 'MATH 160', 'MATH 170', 'MATH 172', 'MATH 175', 'MATH 191'] } },
        ],
      },
    ],
  },
  {
    id: 'history-ba',
    name: 'History',
    type: 'major',
    groups: [
      {
        id: 'hist-lower',
        name: 'Lower Division (1)',
        description: 'History major. Verify field of concentration at history.berkeley.edu/undergraduate.',
        requirements: [
          { id: 'hist-survey', name: 'One History lower-division survey', rule: { type: 'choose', count: 1, from: ['HISTORY 4A', 'HISTORY 4B', 'HISTORY 5', 'HISTORY 6A', 'HISTORY 6B', 'HISTORY 7A', 'HISTORY 7B', 'HISTORY 8A', 'HISTORY 8B', 'HISTORY 12'] } },
        ],
      },
      {
        id: 'hist-upper',
        name: 'Upper Division (10 courses)',
        requirements: [
          { id: 'hist-101', name: 'History 101 (junior seminar)', rule: { type: 'specific', courses: ['HISTORY 101'] } },
          { id: 'hist-pre-1800', name: 'Pre-1800 history (2)', rule: { type: 'choose', count: 2, from: ['HISTORY 103', 'HISTORY 105B', 'HISTORY 106B', 'HISTORY 109A', 'HISTORY 110', 'HISTORY 111', 'HISTORY 112C', 'HISTORY 117A', 'HISTORY 121', 'HISTORY 124A', 'HISTORY 158A'] } },
          { id: 'hist-area', name: 'Geographic field of concentration (4)', rule: { type: 'choose', count: 4, from: ['HISTORY 100B', 'HISTORY 100C', 'HISTORY 100D', 'HISTORY 100E', 'HISTORY 103D', 'HISTORY 117B', 'HISTORY 124B', 'HISTORY 130', 'HISTORY 134B', 'HISTORY 136', 'HISTORY 137AC', 'HISTORY 138', 'HISTORY 138AC', 'HISTORY 140A', 'HISTORY 144', 'HISTORY 158C', 'HISTORY 158D', 'HISTORY 162C'] } },
          { id: 'hist-electives', name: 'History upper-division electives (3)', rule: { type: 'choose', count: 3, from: ['HISTORY 103', 'HISTORY 105', 'HISTORY 124B', 'HISTORY 130', 'HISTORY 137AC', 'HISTORY 138AC', 'HISTORY 140A', 'HISTORY 158A', 'HISTORY 162C', 'HISTORY 175A', 'HISTORY 175B', 'HISTORY 280'] } },
        ],
      },
    ],
  },
  {
    id: 'linguistics-ba',
    name: 'Linguistics',
    type: 'major',
    groups: [
      {
        id: 'ling-lower',
        name: 'Lower Division',
        requirements: [
          { id: 'ling-5', name: 'Introduction to linguistics', rule: { type: 'choose', count: 1, from: ['LINGUIS 5', 'LINGUIS C5'] } },
          { id: 'ling-foreign', name: 'Foreign language (4th-semester proficiency)', rule: { type: 'choose', count: 1, from: ['FRENCH 4', 'GERMAN 4', 'SPANISH 4', 'ITALIAN 4', 'RUSSIAN 4', 'CHINESE 10B', 'JAPAN 10B', 'KOREAN 10B', 'ARABIC 20B'] } },
        ],
      },
      {
        id: 'ling-upper',
        name: 'Upper Division (9 courses)',
        requirements: [
          { id: 'ling-core-phon', name: 'Phonology (LINGUIS 110)', rule: { type: 'specific', courses: ['LINGUIS 110'] } },
          { id: 'ling-core-syntax', name: 'Syntax (LINGUIS 120)', rule: { type: 'specific', courses: ['LINGUIS 120'] } },
          { id: 'ling-core-semantics', name: 'Semantics (LINGUIS 130)', rule: { type: 'specific', courses: ['LINGUIS 130'] } },
          { id: 'ling-area', name: 'Linguistic structures of a language (1)', rule: { type: 'choose', count: 1, from: ['LINGUIS 100', 'LINGUIS C160', 'LINGUIS 161', 'LINGUIS 165', 'LINGUIS 167', 'LINGUIS 178'] } },
          { id: 'ling-electives', name: 'Linguistics upper-division electives (5)', rule: { type: 'choose', count: 5, from: ['LINGUIS 105', 'LINGUIS 111', 'LINGUIS 115', 'LINGUIS 121', 'LINGUIS 122', 'LINGUIS 131', 'LINGUIS 140', 'LINGUIS 145', 'LINGUIS 150', 'LINGUIS 155AC', 'LINGUIS 158', 'LINGUIS 165', 'LINGUIS 170', 'LINGUIS 175', 'LINGUIS 180', 'LINGUIS C146'] } },
        ],
      },
    ],
  },
  {
    id: 'french-ba',
    name: 'French',
    type: 'major',
    groups: [
      {
        id: 'french-prereq',
        name: 'Prerequisites',
        requirements: [
          { id: 'fr-prereq', name: 'Intermediate French (FRENCH 3, 4, 14, or 15)', rule: { type: 'choose', count: 2, from: ['FRENCH 3', 'FRENCH 4', 'FRENCH 14', 'FRENCH 15'] } },
        ],
      },
      {
        id: 'french-upper',
        name: 'Upper Division (8 courses)',
        requirements: [
          { id: 'fr-bridge', name: 'Bridge to advanced studies (FRENCH 102)', rule: { type: 'specific', courses: ['FRENCH 102'] } },
          { id: 'fr-survey', name: 'French literature surveys (2)', rule: { type: 'choose', count: 2, from: ['FRENCH 103A', 'FRENCH 103B', 'FRENCH 116A', 'FRENCH 116B', 'FRENCH 117A', 'FRENCH 117B'] } },
          { id: 'fr-electives', name: 'French upper-division electives (5)', rule: { type: 'choose', count: 5, from: ['FRENCH 105A', 'FRENCH 105B', 'FRENCH 108A', 'FRENCH 108B', 'FRENCH 112A', 'FRENCH 112B', 'FRENCH 120', 'FRENCH 130', 'FRENCH 140', 'FRENCH 150', 'FRENCH 152', 'FRENCH 158', 'FRENCH 170', 'FRENCH 180', 'FRENCH 190'] } },
        ],
      },
    ],
  },
  {
    id: 'german-ba',
    name: 'German',
    type: 'major',
    groups: [
      {
        id: 'german-prereq',
        name: 'Prerequisites',
        requirements: [
          { id: 'de-prereq', name: 'Intermediate German (GERMAN 3 + 4)', rule: { type: 'choose', count: 2, from: ['GERMAN 3', 'GERMAN 4', 'GERMAN 13', 'GERMAN 14'] } },
        ],
      },
      {
        id: 'german-upper',
        name: 'Upper Division (8 courses)',
        requirements: [
          { id: 'de-100', name: 'GERMAN 100 — bridge to advanced', rule: { type: 'specific', courses: ['GERMAN 100'] } },
          { id: 'de-103', name: 'Advanced German composition (GERMAN 103)', rule: { type: 'specific', courses: ['GERMAN 103'] } },
          { id: 'de-electives', name: 'German upper-division electives (6)', rule: { type: 'choose', count: 6, from: ['GERMAN 101', 'GERMAN 102', 'GERMAN 104', 'GERMAN 105', 'GERMAN 110A', 'GERMAN 110B', 'GERMAN 130', 'GERMAN 140', 'GERMAN 150', 'GERMAN 155', 'GERMAN 160A', 'GERMAN 160B', 'GERMAN 170', 'GERMAN 180'] } },
        ],
      },
    ],
  },
  {
    id: 'latin-ba',
    name: 'Latin',
    type: 'major',
    groups: [
      {
        id: 'latin-prereq',
        name: 'Prerequisites',
        requirements: [
          { id: 'lat-prereq', name: 'Intermediate Latin', rule: { type: 'choose', count: 2, from: ['LATIN 1', 'LATIN 2', 'LATIN 3', 'LATIN 100'] } },
        ],
      },
      {
        id: 'latin-upper',
        name: 'Upper Division (8 courses)',
        requirements: [
          { id: 'lat-prose', name: 'Latin prose authors (Cicero, Caesar, Livy)', rule: { type: 'choose', count: 2, from: ['LATIN 101', 'LATIN 113', 'LATIN 114', 'LATIN 115', 'LATIN 117', 'LATIN 118'] } },
          { id: 'lat-poetry', name: 'Latin poetry (Vergil, Ovid, Horace, Catullus)', rule: { type: 'choose', count: 2, from: ['LATIN 102', 'LATIN 121', 'LATIN 122', 'LATIN 123', 'LATIN 124', 'LATIN 125'] } },
          { id: 'lat-electives', name: 'Latin upper-division electives (4)', rule: { type: 'choose', count: 4, from: ['LATIN 105', 'LATIN 130', 'LATIN 145', 'LATIN 155', 'LATIN 160', 'LATIN 170', 'CLASSIC 100', 'CLASSIC 110A', 'CLASSIC 121'] } },
        ],
      },
    ],
  },
  {
    id: 'greek-ba',
    name: 'Greek',
    type: 'major',
    groups: [
      {
        id: 'greek-prereq',
        name: 'Prerequisites',
        requirements: [
          { id: 'gk-prereq', name: 'Intermediate Greek', rule: { type: 'choose', count: 2, from: ['GREEK 1', 'GREEK 2', 'GREEK 3', 'GREEK 100'] } },
        ],
      },
      {
        id: 'greek-upper',
        name: 'Upper Division (8 courses)',
        requirements: [
          { id: 'gk-prose', name: 'Greek prose authors', rule: { type: 'choose', count: 2, from: ['GREEK 101', 'GREEK 110', 'GREEK 113', 'GREEK 116'] } },
          { id: 'gk-poetry', name: 'Greek poetry (Homer, drama, lyric)', rule: { type: 'choose', count: 2, from: ['GREEK 102', 'GREEK 120', 'GREEK 121', 'GREEK 130'] } },
          { id: 'gk-electives', name: 'Greek upper-division electives (4)', rule: { type: 'choose', count: 4, from: ['GREEK 105', 'GREEK 140', 'GREEK 145', 'GREEK 150', 'CLASSIC 100', 'CLASSIC 110A', 'CLASSIC 121', 'CLASSIC 130A'] } },
        ],
      },
    ],
  },
  {
    id: 'ancient-greek-and-roman-studies-ba',
    name: 'Ancient Greek and Roman Studies',
    type: 'major',
    groups: [
      {
        id: 'agrs-foundations',
        name: 'Classical Foundations',
        requirements: [
          { id: 'agrs-language', name: 'Latin or Greek through intermediate', rule: { type: 'choose', count: 2, from: ['LATIN 1', 'LATIN 2', 'LATIN 3', 'LATIN 100', 'GREEK 1', 'GREEK 2', 'GREEK 3', 'GREEK 100'] } },
          { id: 'agrs-survey', name: 'Classics survey courses (2)', rule: { type: 'choose', count: 2, from: ['CLASSIC 10A', 'CLASSIC 10B', 'CLASSIC 28', 'CLASSIC 36', 'CLASSIC 39', 'CLASSIC 121'] } },
        ],
      },
      {
        id: 'agrs-upper',
        name: 'Upper Division (8 courses)',
        requirements: [
          { id: 'agrs-electives', name: 'Approved upper-div Classics, Latin, Greek, Ancient History', rule: { type: 'choose', count: 8, from: ['CLASSIC 100', 'CLASSIC 110A', 'CLASSIC 110B', 'CLASSIC 121', 'CLASSIC 130A', 'CLASSIC 130B', 'CLASSIC 153', 'CLASSIC 162', 'CLASSIC 170A', 'CLASSIC 170B', 'LATIN 101', 'LATIN 102', 'LATIN 121', 'LATIN 130', 'GREEK 101', 'GREEK 102', 'GREEK 120', 'GREEK 130', 'HISTORY 105A', 'HISTORY 105B'] } },
        ],
      },
    ],
  },
  {
    id: 'middle-eastern-languages-and-cultures-ba',
    name: 'Middle Eastern Languages & Cultures',
    type: 'major',
    groups: [
      {
        id: 'melc-prereq',
        name: 'Prerequisites',
        description: 'MELC major (formerly Near Eastern Studies). Students concentrate in Arabic, Hebrew, Persian, Turkish, or another approved Middle Eastern language.',
        requirements: [
          { id: 'melc-elementary', name: 'Elementary Middle Eastern language', rule: { type: 'choose', count: 2, from: ['ARABIC 1A', 'ARABIC 1B', 'ARABIC 20A', 'ARABIC 20B', 'HEBREW 1A', 'HEBREW 1B', 'PERSIAN 1A', 'PERSIAN 1B', 'TURKISH 1A', 'TURKISH 1B'] } },
          { id: 'melc-survey', name: 'MELC R1B or intro courses', rule: { type: 'choose', count: 1, from: ['MELC R1B', 'MELC R5A', 'MELC R5B', 'MELC 12'] } },
        ],
      },
      {
        id: 'melc-upper',
        name: 'Upper Division (8 courses)',
        requirements: [
          { id: 'melc-language-upper', name: 'Continued language study (advanced level)', rule: { type: 'choose', count: 2, from: ['ARABIC 100A', 'ARABIC 100B', 'ARABIC 110A', 'HEBREW 102A', 'HEBREW 102B', 'PERSIAN 100A', 'PERSIAN 100B', 'TURKISH 100A', 'TURKISH 100B'] } },
          { id: 'melc-electives', name: 'MELC and area-studies electives (6)', rule: { type: 'choose', count: 6, from: ['MELC 110', 'MELC 119', 'MELC 120', 'MELC 121', 'MELC 130', 'MELC 138', 'MELC 145', 'MELC 150', 'MELC 158', 'MELC 165', 'MELC 175', 'MELC 180', 'HISTORY 110', 'HISTORY 173B', 'POL SCI 142B', 'ANTHRO 153'] } },
        ],
      },
    ],
  },
  {
    id: 'rhetoric-ba',
    name: 'Rhetoric',
    type: 'major',
    groups: [
      {
        id: 'rhet-lower',
        name: 'Lower Division',
        requirements: [
          { id: 'rh-r1b', name: 'Reading & Composition (RHETOR R1A + R1B)', rule: { type: 'choose', count: 2, from: ['RHETOR R1A', 'RHETOR R1B'] } },
          { id: 'rh-10', name: 'Rhetoric 10 (Introduction)', rule: { type: 'choose', count: 1, from: ['RHETOR 10', 'RHETOR R1A', 'RHETOR R1B'] } },
        ],
      },
      {
        id: 'rhet-upper',
        name: 'Upper Division (8 courses)',
        requirements: [
          { id: 'rh-history', name: 'History of rhetoric (RHETOR 103A or 103B)', rule: { type: 'choose', count: 2, from: ['RHETOR 103A', 'RHETOR 103B', 'RHETOR 121A', 'RHETOR 121B'] } },
          { id: 'rh-electives', name: 'Rhetoric upper-division electives (6)', rule: { type: 'choose', count: 6, from: ['RHETOR 102', 'RHETOR 109', 'RHETOR 114A', 'RHETOR 114B', 'RHETOR 120', 'RHETOR 130', 'RHETOR 132', 'RHETOR 140', 'RHETOR 152', 'RHETOR 153', 'RHETOR 165', 'RHETOR 170', 'RHETOR 180', 'RHETOR 181'] } },
        ],
      },
    ],
  },
  {
    id: 'music-ba',
    name: 'Music',
    type: 'major',
    groups: [
      {
        id: 'music-lower',
        name: 'Lower Division',
        requirements: [
          { id: 'mus-theory', name: 'Music theory sequence', rule: { type: 'choose', count: 2, from: ['MUSIC 25', 'MUSIC 26', 'MUSIC 27', 'MUSIC 28'] } },
          { id: 'mus-history', name: 'Music history survey', rule: { type: 'choose', count: 1, from: ['MUSIC 20A', 'MUSIC 20B', 'MUSIC 27'] } },
        ],
      },
      {
        id: 'music-upper',
        name: 'Upper Division (7 courses)',
        requirements: [
          { id: 'mus-history-upper', name: 'Upper-division music history', rule: { type: 'choose', count: 2, from: ['MUSIC 128A', 'MUSIC 128B', 'MUSIC 128C', 'MUSIC 145', 'MUSIC 146', 'MUSIC 153', 'MUSIC 158', 'MUSIC 164'] } },
          { id: 'mus-theory-upper', name: 'Upper-division theory / analysis', rule: { type: 'choose', count: 2, from: ['MUSIC 105', 'MUSIC 106', 'MUSIC 108', 'MUSIC 109A', 'MUSIC 109B', 'MUSIC 158'] } },
          { id: 'mus-performance', name: 'Performance / ensemble', rule: { type: 'choose', count: 1, from: ['MUSIC 165', 'MUSIC 166', 'MUSIC 167', 'MUSIC 168', 'MUSIC 169', 'MUSIC 170', 'MUSIC 175', 'MUSIC 178'] } },
          { id: 'mus-electives', name: 'Music upper-division electives (2)', rule: { type: 'choose', count: 2, from: ['MUSIC 100', 'MUSIC 110', 'MUSIC 125', 'MUSIC 134', 'MUSIC 138', 'MUSIC 140', 'MUSIC 150', 'MUSIC 153', 'MUSIC 158', 'MUSIC 162', 'MUSIC 169', 'MUSIC 178'] } },
        ],
      },
    ],
  },
  {
    id: 'political-economy-ba',
    name: 'Political Economy',
    type: 'major',
    groups: [
      {
        id: 'polecon-prereq',
        name: 'Prerequisites',
        requirements: [
          { id: 'pe-econ', name: 'Intro Economics', rule: { type: 'choose', count: 2, from: ['ECON 1', 'ECON 2'] } },
          { id: 'pe-stats', name: 'Statistics', rule: { type: 'choose', count: 1, from: ['STAT 2', 'STAT 20', 'STAT 21', 'STAT C8'] } },
          { id: 'pe-history', name: 'World history / political economy intro', rule: { type: 'choose', count: 1, from: ['HISTORY 5', 'POL SCI 2', 'POL SCI 3', 'POLECON 100'] } },
        ],
      },
      {
        id: 'polecon-upper',
        name: 'Upper Division (10 courses)',
        requirements: [
          { id: 'pe-core', name: 'Political Economy core (POLECON 100, 101)', rule: { type: 'choose', count: 2, from: ['POLECON 100', 'POLECON 101'] } },
          { id: 'pe-econ-upper', name: 'Upper-division economics (3)', rule: { type: 'choose', count: 3, from: ['ECON 100A', 'ECON 100B', 'ECON 101A', 'ECON 101B', 'ECON 110', 'ECON 113', 'ECON 115', 'ECON 119', 'ECON 121', 'ECON 122', 'ECON 130', 'ECON 134', 'ECON 138', 'ECON 140', 'ECON C175'] } },
          { id: 'pe-poli', name: 'Upper-division politics (3)', rule: { type: 'choose', count: 3, from: ['POL SCI 102', 'POL SCI 103', 'POL SCI 109H', 'POL SCI 137', 'POL SCI 138', 'POL SCI 142A', 'POL SCI 142B', 'POL SCI 143', 'POL SCI 149', 'POL SCI 167AC'] } },
          { id: 'pe-thematic', name: 'Thematic concentration electives (2)', rule: { type: 'choose', count: 2, from: ['POLECON 130', 'POLECON 140', 'POLECON 150', 'POLECON 160', 'POLECON 170', 'PUB POL 101', 'GLOBAL 150', 'IAS 102', 'SOCIOL 130AC'] } },
        ],
      },
    ],
  },
  {
    id: 'native-american-studies-ba',
    name: 'Native American Studies',
    type: 'major',
    groups: [
      {
        id: 'nas-foundation',
        name: 'Foundations',
        requirements: [
          { id: 'nas-intro', name: 'Intro to Native American Studies', rule: { type: 'choose', count: 1, from: ['NATAMST 10', 'ETHSTD 10AC', 'ETHSTD 21AC'] } },
          { id: 'nas-history', name: 'Native American history', rule: { type: 'choose', count: 1, from: ['HISTORY 7A', 'HISTORY 7B', 'NATAMST 100', 'NATAMST 110'] } },
        ],
      },
      {
        id: 'nas-upper',
        name: 'Upper Division (8 courses)',
        requirements: [
          { id: 'nas-electives', name: 'Native American Studies upper-div courses', rule: { type: 'choose', count: 8, from: ['NATAMST 100', 'NATAMST 110', 'NATAMST 124', 'NATAMST 132', 'NATAMST 145', 'NATAMST 150', 'NATAMST 159', 'NATAMST 160AC', 'NATAMST 170', 'NATAMST 175AC', 'ETHSTD 100', 'ETHSTD 144AC', 'ETHSTD 159AC', 'ANTHRO 137', 'ANTHRO 189', 'HISTORY 137AC', 'AMERSTD 102'] } },
        ],
      },
    ],
  },
  {
    id: 'asian-american-and-asian-diaspora-studies-ba',
    name: 'Asian American and Asian Diaspora Studies',
    type: 'major',
    groups: [
      {
        id: 'aaads-foundation',
        name: 'Foundations',
        requirements: [
          { id: 'aaads-intro', name: 'Intro to Asian American Studies', rule: { type: 'choose', count: 1, from: ['ASAMST 20A', 'ASAMST 20B', 'ASAMST 21AC', 'ETHSTD 21AC'] } },
          { id: 'aaads-research', name: 'Research methods', rule: { type: 'choose', count: 1, from: ['ASAMST 102', 'ASAMST 122', 'ETHSTD 198'] } },
        ],
      },
      {
        id: 'aaads-upper',
        name: 'Upper Division (8 courses)',
        requirements: [
          { id: 'aaads-electives', name: 'Asian American Studies upper-div', rule: { type: 'choose', count: 8, from: ['ASAMST 110', 'ASAMST 120AC', 'ASAMST 121', 'ASAMST 122', 'ASAMST 125', 'ASAMST 128AC', 'ASAMST 132AC', 'ASAMST 138AC', 'ASAMST 142', 'ASAMST 144', 'ASAMST 145', 'ASAMST 150AC', 'ASAMST 151', 'ASAMST 159', 'ASAMST 165', 'ASAMST 171', 'ASAMST 180', 'ETHSTD 100', 'ETHSTD 144AC'] } },
        ],
      },
    ],
  },
  {
    id: 'south-and-southeast-asian-studies-ba',
    name: 'South and Southeast Asian Studies',
    type: 'major',
    groups: [
      {
        id: 'sseas-language',
        name: 'Language Sequence',
        requirements: [
          { id: 'sseas-elementary', name: 'Elementary South/SE Asian language', rule: { type: 'choose', count: 2, from: ['HINDI 1A', 'HINDI 1B', 'TAMIL 1A', 'TAMIL 1B', 'PUNJABI 1A', 'PUNJABI 1B', 'TIBETAN 1A', 'TIBETAN 1B', 'INDONES 1A', 'INDONES 1B', 'VIETNMS 1A', 'VIETNMS 1B', 'FILIPN 1A', 'FILIPN 1B', 'BURMESE 1A', 'BURMESE 1B'] } },
          { id: 'sseas-intermediate', name: 'Intermediate language', rule: { type: 'choose', count: 2, from: ['HINDI 100A', 'HINDI 100B', 'TAMIL 100A', 'TAMIL 100B', 'PUNJABI 100A', 'PUNJABI 100B', 'TIBETAN 100A', 'INDONES 100A', 'VIETNMS 100A', 'FILIPN 100A'] } },
        ],
      },
      {
        id: 'sseas-upper',
        name: 'Upper Division (6 courses)',
        requirements: [
          { id: 'sseas-area', name: 'Area-studies courses', rule: { type: 'choose', count: 6, from: ['SSEASN 100', 'SSEASN 110', 'SSEASN 120', 'SSEASN 130', 'SSEASN 145', 'SSEASN 150', 'SSEASN 165', 'SSEASN 171', 'SSEASN 175', 'HISTORY 113', 'HISTORY 114', 'HISTORY 115', 'HISTORY 174', 'HISTORY 175', 'POL SCI 142B', 'POL SCI 143B', 'ANTHRO 119A', 'BUDDSTD 50'] } },
        ],
      },
    ],
  },
  {
    id: 'dutch-studies-ba',
    name: 'Dutch Studies',
    type: 'major',
    groups: [
      {
        id: 'dutch-language',
        name: 'Dutch Language Sequence',
        requirements: [
          { id: 'du-prereq', name: 'Elementary + intermediate Dutch', rule: { type: 'choose', count: 4, from: ['DUTCH 1', 'DUTCH 2', 'DUTCH 3', 'DUTCH 4', 'DUTCH 100', 'DUTCH 110', 'DUTCH 120'] } },
        ],
      },
      {
        id: 'dutch-upper',
        name: 'Upper Division (6 courses)',
        requirements: [
          { id: 'du-electives', name: 'Dutch / Low-Country studies', rule: { type: 'choose', count: 6, from: ['DUTCH 100', 'DUTCH 110', 'DUTCH 120', 'DUTCH 140', 'DUTCH 150', 'DUTCH 160', 'GERMAN 130', 'GERMAN 150', 'HISTORY 134B', 'HISTAA C113A', 'HISTAA 130A'] } },
        ],
      },
    ],
  },
  {
    id: 'ethnic-studies-ba',
    name: 'Ethnic Studies',
    type: 'major',
    groups: [
      {
        id: 'es-foundations',
        name: 'Foundations',
        requirements: [
          { id: 'es-intro', name: 'ETHSTD 10AC or 21AC (intro)', rule: { type: 'choose', count: 2, from: ['ETHSTD 10AC', 'ETHSTD 21AC', 'ETHSTD 11AC'] } },
        ],
      },
      {
        id: 'es-upper',
        name: 'Upper Division (10 courses)',
        requirements: [
          { id: 'es-method', name: 'Theory & methods', rule: { type: 'choose', count: 1, from: ['ETHSTD 100', 'ETHSTD 198'] } },
          { id: 'es-area-african', name: 'African American Studies course', rule: { type: 'choose', count: 1, from: ['AFRICAM 100', 'AFRICAM 107', 'AFRICAM 117', 'AFRICAM 134', 'AFRICAM 159AC'] } },
          { id: 'es-area-asian', name: 'Asian American Studies course', rule: { type: 'choose', count: 1, from: ['ASAMST 110', 'ASAMST 120AC', 'ASAMST 132AC', 'ASAMST 138AC'] } },
          { id: 'es-area-chicano', name: 'Chicano/Latino Studies course', rule: { type: 'choose', count: 1, from: ['CHICANO 50', 'CHICANO 70AC', 'CHICANO 100', 'CHICANO 144', 'CHICANO 159AC', 'CHICANO 174AC'] } },
          { id: 'es-area-native', name: 'Native American Studies course', rule: { type: 'choose', count: 1, from: ['NATAMST 100', 'NATAMST 132', 'NATAMST 145', 'NATAMST 160AC'] } },
          { id: 'es-electives', name: 'Approved Ethnic Studies electives (5)', rule: { type: 'choose', count: 5, from: ['ETHSTD 100', 'ETHSTD 144AC', 'ETHSTD 159AC', 'ETHSTD 175AC', 'AFRICAM 117', 'ASAMST 121', 'CHICANO 159AC', 'NATAMST 159', 'GWS 138', 'SOCIOL 130AC', 'SOCIOL 137AC', 'POL SCI 167AC'] } },
        ],
      },
    ],
  },
  {
    id: 'environmental-earth-science-ba',
    name: 'Environmental Earth Science',
    type: 'major',
    groups: [
      {
        id: 'eesc-prereq',
        name: 'Prerequisites',
        requirements: [
          { id: 'eesc-math', name: 'Calculus', rule: { type: 'choose', count: 2, from: ['MATH 1A', 'MATH 1B', 'MATH 16A', 'MATH 16B', 'MATH 10A', 'MATH 10B'] } },
          { id: 'eesc-chem', name: 'General chemistry', rule: { type: 'choose', count: 1, from: ['CHEM 1A', 'CHEM 4A'] } },
          { id: 'eesc-physics', name: 'Physics', rule: { type: 'choose', count: 1, from: ['PHYSICS 7A', 'PHYSICS 8A'] } },
          { id: 'eesc-eps-intro', name: 'EPS introductory courses', rule: { type: 'choose', count: 2, from: ['EPS 50', 'EPS 80', 'EPS 81', 'EPS 82', 'EPS C12'] } },
        ],
      },
      {
        id: 'eesc-upper',
        name: 'Upper Division (10 courses)',
        requirements: [
          { id: 'eesc-core', name: 'Core EPS upper-division', rule: { type: 'choose', count: 4, from: ['EPS 100B', 'EPS 102', 'EPS 108', 'EPS 109', 'EPS 117', 'EPS 119', 'EPS 122', 'EPS 130'] } },
          { id: 'eesc-electives', name: 'Approved environmental electives (6)', rule: { type: 'choose', count: 6, from: ['EPS 101', 'EPS 102', 'EPS 117', 'EPS 119', 'EPS 122', 'EPS 130', 'EPS 142', 'EPS C162', 'ESPM 50AC', 'ESPM 60', 'ESPM 100', 'ESPM 117', 'ESPM 161', 'ENERES 100', 'ENERES 102', 'GEOG 130'] } },
        ],
      },
    ],
  },
  {
    id: 'geophysics-ba',
    name: 'Geophysics',
    type: 'major',
    groups: [
      {
        id: 'geophys-prereq',
        name: 'Prerequisites',
        requirements: [
          { id: 'gp-math', name: 'Calculus + linear algebra', rule: { type: 'choose', count: 4, from: ['MATH 1A', 'MATH 1B', 'MATH 53', 'MATH 54'] } },
          { id: 'gp-physics', name: 'Physics 7-series', rule: { type: 'choose', count: 3, from: ['PHYSICS 7A', 'PHYSICS 7B', 'PHYSICS 7C'] } },
          { id: 'gp-chem', name: 'General chemistry', rule: { type: 'choose', count: 1, from: ['CHEM 1A', 'CHEM 4A'] } },
          { id: 'gp-eps', name: 'EPS introductory', rule: { type: 'choose', count: 1, from: ['EPS 50', 'EPS 80', 'EPS 100B'] } },
        ],
      },
      {
        id: 'geophys-upper',
        name: 'Upper Division (8 courses)',
        requirements: [
          { id: 'gp-core', name: 'Geophysics core (EPS 122, 142, 108)', rule: { type: 'choose', count: 4, from: ['EPS 100B', 'EPS 108', 'EPS 109', 'EPS 117', 'EPS 122', 'EPS 130', 'EPS 142', 'EPS C162', 'EPS C181'] } },
          { id: 'gp-electives', name: 'Approved upper-div electives (4)', rule: { type: 'choose', count: 4, from: ['MATH 104', 'MATH 110', 'MATH 128A', 'MATH 128B', 'PHYSICS 105', 'PHYSICS 110A', 'PHYSICS 137A', 'EPS 101', 'EPS 102', 'EPS 130', 'COMPSCI 61A', 'COMPSCI 61B'] } },
        ],
      },
    ],
  },
  {
    id: 'planetary-science-ba',
    name: 'Planetary Science',
    type: 'major',
    groups: [
      {
        id: 'plansci-prereq',
        name: 'Prerequisites',
        requirements: [
          { id: 'ps-math', name: 'Calculus + linear algebra', rule: { type: 'choose', count: 4, from: ['MATH 1A', 'MATH 1B', 'MATH 53', 'MATH 54'] } },
          { id: 'ps-physics', name: 'Physics 7-series', rule: { type: 'choose', count: 3, from: ['PHYSICS 7A', 'PHYSICS 7B', 'PHYSICS 7C'] } },
          { id: 'ps-chem', name: 'General chemistry', rule: { type: 'choose', count: 1, from: ['CHEM 1A', 'CHEM 4A'] } },
          { id: 'ps-intro', name: 'Planetary science intro', rule: { type: 'choose', count: 1, from: ['ASTRON 7A', 'EPS 50', 'EPS C12', 'EPS 100B'] } },
        ],
      },
      {
        id: 'plansci-upper',
        name: 'Upper Division (8 courses)',
        requirements: [
          { id: 'ps-core', name: 'Planetary core (EPS C162, ASTRON C162)', rule: { type: 'choose', count: 4, from: ['EPS C162', 'EPS 117', 'EPS 122', 'EPS 130', 'ASTRON 110', 'ASTRON C161', 'ASTRON C162'] } },
          { id: 'ps-electives', name: 'Approved electives (4)', rule: { type: 'choose', count: 4, from: ['EPS 100B', 'EPS 102', 'EPS 108', 'EPS 142', 'PHYSICS 110A', 'PHYSICS 137A', 'ASTRON 120', 'ASTRON 128', 'CHEM 110A', 'CHEM 120A'] } },
        ],
      },
    ],
  },
]

// ─── STUB MINORS — flesh out with course lists ──────────────────────
// (Each minor is typically 5 upper-division courses, ≥3 in residence at Berkeley.)
const STUB_MINORS: Program[] = [
  { id: 'english-minor', name: 'English', type: 'minor', groups: [{ id: 'em', name: 'Five upper-division English courses', requirements: [{ id: 'em-courses', name: 'Choose 5 upper-div ENGLISH courses', rule: { type: 'choose', count: 5, from: ['ENGLISH 100', 'ENGLISH 101', 'ENGLISH 110', 'ENGLISH 111', 'ENGLISH 117A', 'ENGLISH 117B', 'ENGLISH 117S', 'ENGLISH 125A', 'ENGLISH 125B', 'ENGLISH 130A', 'ENGLISH 130B', 'ENGLISH 132', 'ENGLISH 165', 'ENGLISH 166', 'ENGLISH 173', 'ENGLISH 175', 'ENGLISH 180A', 'ENGLISH 190'] } }] }] },
  { id: 'history-minor', name: 'History', type: 'minor', groups: [{ id: 'hm', name: 'Five upper-division History courses', requirements: [{ id: 'hm-courses', name: 'Choose 5 upper-div HISTORY courses', rule: { type: 'choose', count: 5, from: ['HISTORY 100B', 'HISTORY 100C', 'HISTORY 101', 'HISTORY 103', 'HISTORY 124B', 'HISTORY 130', 'HISTORY 137AC', 'HISTORY 138AC', 'HISTORY 140A', 'HISTORY 158C', 'HISTORY 158D', 'HISTORY 162C', 'HISTORY 175A', 'HISTORY 175B'] } }] }] },
  { id: 'mathematics-minor', name: 'Mathematics', type: 'minor', groups: [{ id: 'mm', name: 'Five upper-division Math courses', requirements: [{ id: 'mm-courses', name: 'Choose 5 upper-div MATH courses', rule: { type: 'choose', count: 5, from: ['MATH 104', 'MATH 110', 'MATH 113', 'MATH 121A', 'MATH 121B', 'MATH 128A', 'MATH 128B', 'MATH 130', 'MATH 135', 'MATH 140', 'MATH 142', 'MATH 143', 'MATH 152', 'MATH 153', 'MATH 160', 'MATH 170', 'MATH 175', 'MATH 185', 'MATH H104', 'MATH H110'] } }] }] },
  { id: 'linguistics-minor', name: 'Linguistics', type: 'minor', groups: [{ id: 'lm', name: 'Five upper-division Linguistics courses', requirements: [{ id: 'lm-courses', name: 'Choose 5 upper-div LINGUIS courses', rule: { type: 'choose', count: 5, from: ['LINGUIS 100', 'LINGUIS 105', 'LINGUIS 110', 'LINGUIS 115', 'LINGUIS 120', 'LINGUIS 121', 'LINGUIS 130', 'LINGUIS 131', 'LINGUIS 140', 'LINGUIS 145', 'LINGUIS 150', 'LINGUIS 158', 'LINGUIS C160', 'LINGUIS 165', 'LINGUIS 170', 'LINGUIS 175', 'LINGUIS 180'] } }] }] },
  { id: 'french-minor', name: 'French', type: 'minor', groups: [{ id: 'frm', name: 'Five upper-division French courses', requirements: [{ id: 'frm-courses', name: 'Choose 5 upper-div FRENCH courses', rule: { type: 'choose', count: 5, from: ['FRENCH 102', 'FRENCH 103A', 'FRENCH 103B', 'FRENCH 105A', 'FRENCH 105B', 'FRENCH 116A', 'FRENCH 116B', 'FRENCH 117A', 'FRENCH 117B', 'FRENCH 120', 'FRENCH 130', 'FRENCH 140', 'FRENCH 150', 'FRENCH 170', 'FRENCH 180'] } }] }] },
  { id: 'german-minor', name: 'German', type: 'minor', groups: [{ id: 'dem', name: 'Five upper-division German courses', requirements: [{ id: 'dem-courses', name: 'Choose 5 upper-div GERMAN courses', rule: { type: 'choose', count: 5, from: ['GERMAN 100', 'GERMAN 101', 'GERMAN 102', 'GERMAN 103', 'GERMAN 104', 'GERMAN 105', 'GERMAN 110A', 'GERMAN 110B', 'GERMAN 130', 'GERMAN 140', 'GERMAN 150', 'GERMAN 155', 'GERMAN 160A', 'GERMAN 160B', 'GERMAN 170', 'GERMAN 180'] } }] }] },
  { id: 'latin-minor', name: 'Latin', type: 'minor', groups: [{ id: 'latm', name: 'Five upper-division Latin courses', requirements: [{ id: 'latm-courses', name: 'Choose 5 upper-div LATIN courses', rule: { type: 'choose', count: 5, from: ['LATIN 100', 'LATIN 101', 'LATIN 102', 'LATIN 113', 'LATIN 114', 'LATIN 115', 'LATIN 121', 'LATIN 122', 'LATIN 123', 'LATIN 124', 'LATIN 125', 'LATIN 130', 'LATIN 145', 'LATIN 155', 'LATIN 160', 'LATIN 170'] } }] }] },
  { id: 'greek-minor', name: 'Greek', type: 'minor', groups: [{ id: 'gkm', name: 'Five upper-division Greek courses', requirements: [{ id: 'gkm-courses', name: 'Choose 5 upper-div GREEK courses', rule: { type: 'choose', count: 5, from: ['GREEK 100', 'GREEK 101', 'GREEK 102', 'GREEK 105', 'GREEK 110', 'GREEK 113', 'GREEK 116', 'GREEK 120', 'GREEK 121', 'GREEK 130', 'GREEK 140', 'GREEK 145', 'GREEK 150'] } }] }] },
  { id: 'ancient-greek-and-roman-studies-minor', name: 'Ancient Greek and Roman Studies', type: 'minor', groups: [{ id: 'agm', name: 'Five Classics-related courses (≥3 upper-div)', requirements: [{ id: 'agm-courses', name: 'Choose 5 from Classics, Latin, Greek, Ancient History', rule: { type: 'choose', count: 5, from: ['CLASSIC 100', 'CLASSIC 110A', 'CLASSIC 110B', 'CLASSIC 121', 'CLASSIC 130A', 'CLASSIC 130B', 'CLASSIC 153', 'CLASSIC 162', 'LATIN 101', 'LATIN 121', 'LATIN 130', 'GREEK 101', 'GREEK 102', 'GREEK 120', 'HISTORY 105A', 'HISTORY 105B', 'HISTART 100', 'HISTART 105'] } }] }] },
  { id: 'rhetoric-minor', name: 'Rhetoric', type: 'minor', groups: [{ id: 'rhm', name: 'Five upper-division Rhetoric courses', requirements: [{ id: 'rhm-courses', name: 'Choose 5 upper-div RHETOR courses', rule: { type: 'choose', count: 5, from: ['RHETOR 102', 'RHETOR 103A', 'RHETOR 103B', 'RHETOR 109', 'RHETOR 114A', 'RHETOR 121A', 'RHETOR 121B', 'RHETOR 130', 'RHETOR 132', 'RHETOR 140', 'RHETOR 152', 'RHETOR 153', 'RHETOR 165', 'RHETOR 170', 'RHETOR 180', 'RHETOR 181'] } }] }] },
  { id: 'music-minor', name: 'Music', type: 'minor', groups: [{ id: 'mmus', name: 'Five Music courses (≥3 upper-div)', requirements: [{ id: 'mmus-courses', name: 'Choose 5 MUSIC courses', rule: { type: 'choose', count: 5, from: ['MUSIC 25', 'MUSIC 26', 'MUSIC 105', 'MUSIC 106', 'MUSIC 108', 'MUSIC 109A', 'MUSIC 125', 'MUSIC 128A', 'MUSIC 128B', 'MUSIC 128C', 'MUSIC 134', 'MUSIC 138', 'MUSIC 140', 'MUSIC 145', 'MUSIC 146', 'MUSIC 153', 'MUSIC 158', 'MUSIC 162', 'MUSIC 164', 'MUSIC 165', 'MUSIC 169', 'MUSIC 170', 'MUSIC 175', 'MUSIC 178'] } }] }] },
  { id: 'ethnic-studies-minor', name: 'Ethnic Studies', type: 'minor', groups: [{ id: 'esm', name: 'Five Ethnic Studies courses', requirements: [{ id: 'esm-courses', name: 'Choose 5 from Ethnic Studies + cross-listed', rule: { type: 'choose', count: 5, from: ['ETHSTD 10AC', 'ETHSTD 21AC', 'ETHSTD 100', 'ETHSTD 144AC', 'ETHSTD 159AC', 'ETHSTD 175AC', 'AFRICAM 100', 'AFRICAM 117', 'AFRICAM 159AC', 'ASAMST 110', 'ASAMST 132AC', 'CHICANO 100', 'CHICANO 144', 'CHICANO 159AC', 'NATAMST 100', 'NATAMST 132'] } }] }] },
  { id: 'environmental-earth-science-minor', name: 'Environmental Earth Science', type: 'minor', groups: [{ id: 'eesm', name: 'Five EPS / environmental courses', requirements: [{ id: 'eesm-courses', name: 'Choose 5 EPS / environmental upper-div', rule: { type: 'choose', count: 5, from: ['EPS 100B', 'EPS 101', 'EPS 102', 'EPS 117', 'EPS 119', 'EPS 122', 'EPS 130', 'EPS 142', 'EPS C162', 'ESPM 50AC', 'ESPM 100', 'ESPM 117', 'ESPM 161', 'ENERES 100', 'GEOG 130'] } }] }] },
  { id: 'geophysics-minor', name: 'Geophysics', type: 'minor', groups: [{ id: 'gpm', name: 'Five Geophysics / Physics courses', requirements: [{ id: 'gpm-courses', name: 'Choose 5 EPS + Physics upper-div', rule: { type: 'choose', count: 5, from: ['EPS 100B', 'EPS 108', 'EPS 109', 'EPS 117', 'EPS 122', 'EPS 130', 'EPS 142', 'EPS C162', 'PHYSICS 105', 'PHYSICS 110A', 'PHYSICS 137A'] } }] }] },
  { id: 'planetary-science-minor', name: 'Planetary Science', type: 'minor', groups: [{ id: 'psm', name: 'Five planetary science courses', requirements: [{ id: 'psm-courses', name: 'Choose 5 EPS / Astron / Physics', rule: { type: 'choose', count: 5, from: ['EPS C162', 'EPS 117', 'EPS 122', 'EPS 130', 'EPS 102', 'ASTRON 110', 'ASTRON 120', 'ASTRON C161', 'ASTRON C162', 'PHYSICS 110A', 'PHYSICS 137A', 'CHEM 110A', 'CHEM 120A'] } }] }] },
  { id: 'asian-american-and-asian-diaspora-studies-minor', name: 'Asian American and Asian Diaspora Studies', type: 'minor', groups: [{ id: 'aaadsm', name: 'Five upper-division Asian American Studies', requirements: [{ id: 'aaadsm-courses', name: 'Choose 5 upper-div ASAMST courses', rule: { type: 'choose', count: 5, from: ['ASAMST 110', 'ASAMST 120AC', 'ASAMST 121', 'ASAMST 122', 'ASAMST 125', 'ASAMST 128AC', 'ASAMST 132AC', 'ASAMST 138AC', 'ASAMST 142', 'ASAMST 144', 'ASAMST 145', 'ASAMST 150AC', 'ASAMST 159', 'ASAMST 165', 'ASAMST 171', 'ASAMST 180'] } }] }] },
  { id: 'native-american-studies-minor', name: 'Native American Studies', type: 'minor', groups: [{ id: 'nasm', name: 'Five Native American Studies courses', requirements: [{ id: 'nasm-courses', name: 'Choose 5 NATAMST upper-div', rule: { type: 'choose', count: 5, from: ['NATAMST 100', 'NATAMST 110', 'NATAMST 124', 'NATAMST 132', 'NATAMST 145', 'NATAMST 150', 'NATAMST 159', 'NATAMST 160AC', 'NATAMST 170', 'NATAMST 175AC', 'ETHSTD 100', 'ETHSTD 144AC'] } }] }] },
  { id: 'south-and-southeast-asian-studies-minor', name: 'South and Southeast Asian Studies', type: 'minor', groups: [{ id: 'sseasm', name: 'Five SSEAS courses', requirements: [{ id: 'sseasm-courses', name: 'Choose 5 SSEAS / area-studies', rule: { type: 'choose', count: 5, from: ['SSEASN 100', 'SSEASN 110', 'SSEASN 120', 'SSEASN 130', 'SSEASN 145', 'SSEASN 150', 'SSEASN 165', 'SSEASN 171', 'SSEASN 175', 'HISTORY 113', 'HISTORY 114', 'HISTORY 174', 'POL SCI 142B', 'POL SCI 143B'] } }] }] },
  { id: 'middle-eastern-languages-and-cultures-minor', name: 'Middle Eastern Languages & Cultures', type: 'minor', groups: [{ id: 'melcm', name: 'Five MELC / Near East courses', requirements: [{ id: 'melcm-courses', name: 'Choose 5 MELC / area-studies', rule: { type: 'choose', count: 5, from: ['MELC R1B', 'MELC R5A', 'MELC R5B', 'MELC 110', 'MELC 119', 'MELC 120', 'MELC 121', 'MELC 130', 'MELC 138', 'MELC 145', 'MELC 150', 'MELC 158', 'MELC 165', 'MELC 175', 'HISTORY 110', 'HISTORY 173B', 'POL SCI 142B'] } }] }] },
  { id: 'dutch-studies-minor', name: 'Dutch Studies', type: 'minor', groups: [{ id: 'dum', name: 'Five Dutch Studies courses', requirements: [{ id: 'dum-courses', name: 'Choose 5 Dutch / Low-Country courses', rule: { type: 'choose', count: 5, from: ['DUTCH 100', 'DUTCH 110', 'DUTCH 120', 'DUTCH 140', 'DUTCH 150', 'DUTCH 160', 'GERMAN 130', 'HISTORY 134B', 'HISTAA C113A'] } }] }] },
  { id: 'political-economy-minor', name: 'Political Economy', type: 'minor', groups: [{ id: 'pem', name: 'Five Political Economy courses (≥3 upper-div)', requirements: [{ id: 'pem-courses', name: 'Choose 5 from Econ + PoliSci + PolEcon upper-div', rule: { type: 'choose', count: 5, from: ['POLECON 100', 'POLECON 101', 'POLECON 130', 'POLECON 140', 'POLECON 150', 'POLECON 160', 'ECON 100A', 'ECON 100B', 'ECON 101A', 'ECON 113', 'ECON 130', 'ECON 140', 'POL SCI 102', 'POL SCI 137', 'POL SCI 142A', 'PUB POL 101'] } }] }] },
  { id: 'demography-minor', name: 'Demography', type: 'minor', groups: [{ id: 'dmm', name: 'Five Demography / population courses', requirements: [{ id: 'dmm-courses', name: 'Choose 5 DEMOG + cross-listed', rule: { type: 'choose', count: 5, from: ['DEMOG 110', 'DEMOG C126', 'DEMOG 145', 'STAT 20', 'STAT 21', 'ECON 100A', 'ECON 130', 'ECON 151', 'SOCIOL 130AC', 'SOCIOL 5', 'CY PLAN 119'] } }] }] },
  { id: 'human-rights-interdisciplinary-minor', name: 'Human Rights Interdisciplinary', type: 'minor', groups: [{ id: 'hrm', name: 'Five Human Rights courses', requirements: [{ id: 'hrm-courses', name: 'Choose 5 from approved list', rule: { type: 'choose', count: 5, from: ['LEGALST 132AC', 'LEGALST 138', 'LEGALST 155', 'POL SCI 109H', 'POL SCI 137', 'POL SCI 167AC', 'GWS 100AC', 'GWS 110AC', 'AFRICAM 107', 'GLOBAL 150', 'IAS 102', 'ANTHRO 138', 'SOCIOL 137AC'] } }] }] },
  { id: 'jewish-studies-minor', name: 'Jewish Studies', type: 'minor', groups: [{ id: 'jsm', name: 'Five Jewish Studies courses', requirements: [{ id: 'jsm-courses', name: 'Choose 5 Jewish Studies + cross-listed', rule: { type: 'choose', count: 5, from: ['JEWISH 39B', 'JEWISH 100', 'JEWISH 102', 'JEWISH 110', 'JEWISH 121', 'JEWISH 124', 'JEWISH 138', 'HEBREW 102A', 'HEBREW 102B', 'HISTORY 100C', 'HISTORY 109B', 'MELC 130', 'RELIGST 130'] } }] }] },
  { id: 'medieval-studies-minor', name: 'Medieval Studies', type: 'minor', groups: [{ id: 'medm', name: 'Five Medieval Studies courses', requirements: [{ id: 'medm-courses', name: 'Choose 5 from medieval-focused list', rule: { type: 'choose', count: 5, from: ['MEDIEVAL 50', 'MEDIEVAL 100', 'ENGLISH 117A', 'ENGLISH 117S', 'HISTORY 103', 'HISTORY 134B', 'HISTAA 130A', 'HISTAA 130B', 'CLASSIC 121', 'LATIN 130', 'FRENCH 116A', 'GERMAN 130'] } }] }] },
  { id: 'science-technology-and-society-minor', name: 'Science, Technology, and Society', type: 'minor', groups: [{ id: 'stsm', name: 'Five STS courses', requirements: [{ id: 'stsm-courses', name: 'Choose 5 STS + cross-listed', rule: { type: 'choose', count: 5, from: ['STS 1', 'STS 100', 'STS 101', 'STS 105', 'STS 130', 'STS C175', 'HISTORY 181B', 'PHILOS 132', 'ANTHRO 169B', 'IAS 110', 'BIOENG 100', 'COMPSCI 195', 'INFO C103'] } }] }] },
  { id: 'logic-minor', name: 'Logic', type: 'minor', groups: [{ id: 'logicm', name: 'Five Logic courses', requirements: [{ id: 'logicm-courses', name: 'Choose 5 PHILOS / MATH / CS logic courses', rule: { type: 'choose', count: 5, from: ['PHILOS 12A', 'PHILOS 100', 'PHILOS 140A', 'PHILOS 140B', 'PHILOS 142', 'MATH 125A', 'MATH 135', 'MATH 136', 'COMPSCI 70', 'COMPSCI 172', 'COMPSCI 174'] } }] }] },
  { id: 'digital-humanities-minor', name: 'Digital Humanities', type: 'minor', groups: [{ id: 'dhm', name: 'Five Digital Humanities courses', requirements: [{ id: 'dhm-courses', name: 'Choose 5 DH + cross-listed', rule: { type: 'choose', count: 5, from: ['DIGHUM 100', 'DIGHUM 101', 'DIGHUM 150', 'DATA C8', 'INFO C103', 'INFO 159', 'ENGLISH 166', 'HISTORY 280B', 'LINGUIS 110', 'LINGUIS C160', 'COMPSCI 9G', 'NWMEDIA 151AC'] } }] }] },
  { id: 'geospatial-information-science-and-technology-minor', name: 'Geospatial Information Science and Technology', type: 'minor', groups: [{ id: 'gistm', name: 'Five GIST courses', requirements: [{ id: 'gistm-courses', name: 'Choose 5 GIS / geography / environmental data', rule: { type: 'choose', count: 5, from: ['GEOG 80', 'GEOG 88', 'GEOG C188', 'GEOG 130', 'GEOG 142', 'GEOG 143', 'GEOG C160', 'EPS C162', 'CY PLAN 101', 'ESPM 175', 'LDARCH 121', 'INFO 188'] } }] }] },
  { id: 'politics-philosophy-and-law-minor', name: 'Politics, Philosophy, and Law', type: 'minor', groups: [{ id: 'pplm', name: 'Five PPL courses', requirements: [{ id: 'pplm-courses', name: 'Choose 5 PoliSci + Philos + Legalst', rule: { type: 'choose', count: 5, from: ['POL SCI 102', 'POL SCI 109H', 'POL SCI 137', 'PHILOS 104', 'PHILOS 105', 'PHILOS 115', 'PHILOS 116', 'PHILOS 142', 'LEGALST 100', 'LEGALST 102', 'LEGALST 104', 'LEGALST 132AC', 'LEGALST 155'] } }] }] },
  { id: 'race-and-the-law-minor', name: 'Race and the Law', type: 'minor', groups: [{ id: 'ralm', name: 'Five Race & Law courses', requirements: [{ id: 'ralm-courses', name: 'Choose 5 from approved list', rule: { type: 'choose', count: 5, from: ['LEGALST 132AC', 'LEGALST 138', 'LEGALST 145', 'LEGALST 155', 'AFRICAM 117', 'AFRICAM 134', 'ASAMST 132AC', 'CHICANO 159AC', 'NATAMST 132', 'ETHSTD 144AC', 'POL SCI 167AC'] } }] }] },
  { id: 'spanish-languages-literatures-and-cultures-minor', name: 'Spanish Languages, Literatures, & Cultures', type: 'minor', groups: [{ id: 'spm', name: 'Five upper-division Spanish courses', requirements: [{ id: 'spm-courses', name: 'Choose 5 upper-div SPANISH courses', rule: { type: 'choose', count: 5, from: ['SPANISH 100A', 'SPANISH 100B', 'SPANISH 102', 'SPANISH 103', 'SPANISH 105A', 'SPANISH 105B', 'SPANISH 110', 'SPANISH 112A', 'SPANISH 112B', 'SPANISH 130', 'SPANISH 138', 'SPANISH 145', 'SPANISH 152', 'SPANISH 165', 'SPANISH 170A', 'SPANISH 175', 'SPANISH 180'] } }] }] },
  { id: 'hebrew-minor', name: 'Hebrew', type: 'minor', groups: [{ id: 'hebm', name: 'Five Hebrew courses', requirements: [{ id: 'hebm-courses', name: 'Choose 5 HEBREW + Jewish Studies', rule: { type: 'choose', count: 5, from: ['HEBREW 1A', 'HEBREW 1B', 'HEBREW 102A', 'HEBREW 102B', 'HEBREW 103A', 'HEBREW 103B', 'HEBREW 110', 'JEWISH 100', 'JEWISH 121'] } }] }] },
  { id: 'persian-minor', name: 'Persian', type: 'minor', groups: [{ id: 'persm', name: 'Five Persian courses', requirements: [{ id: 'persm-courses', name: 'Choose 5 PERSIAN + MELC', rule: { type: 'choose', count: 5, from: ['PERSIAN 1A', 'PERSIAN 1B', 'PERSIAN 100A', 'PERSIAN 100B', 'PERSIAN 110', 'PERSIAN 130', 'MELC 138', 'MELC 145', 'MELC 175'] } }] }] },
  { id: 'tibetan-minor', name: 'Tibetan', type: 'minor', groups: [{ id: 'tibm', name: 'Five Tibetan + Buddhist Studies courses', requirements: [{ id: 'tibm-courses', name: 'Choose 5 TIBETAN + BUDDSTD', rule: { type: 'choose', count: 5, from: ['TIBETAN 1A', 'TIBETAN 1B', 'TIBETAN 100A', 'TIBETAN 100B', 'TIBETAN 110', 'BUDDSTD 50', 'BUDDSTD 100', 'BUDDSTD 110'] } }] }] },
  { id: 'turkish-minor', name: 'Turkish', type: 'minor', groups: [{ id: 'turkm', name: 'Five Turkish + MELC courses', requirements: [{ id: 'turkm-courses', name: 'Choose 5 TURKISH + MELC', rule: { type: 'choose', count: 5, from: ['TURKISH 1A', 'TURKISH 1B', 'TURKISH 100A', 'TURKISH 100B', 'TURKISH 110', 'MELC 138', 'MELC 145', 'HISTORY 110'] } }] }] },
]

async function main() {
  const path = PROGRAMS_PATH
  const data = JSON.parse(readFileSync(path, 'utf-8'))
  const updates = [...EMPTY, ...STUB_MAJORS, ...STUB_MINORS]
  const updateIds = new Set(updates.map((p) => p.id))
  const filtered = data.programs.filter((p: Program) => !updateIds.has(p.id))
  const merged = [...filtered, ...updates]
  data.programs = merged
  data.meta = { ...data.meta, generatedAt: new Date().toISOString() }
  writeFileSync(path, JSON.stringify(data, null, 2))
  console.log(`Updated ${updates.length} programs (${EMPTY.length} empty, ${STUB_MAJORS.length} stub majors, ${STUB_MINORS.length} stub minors).`)
  console.log(`Total programs after merge: ${merged.length}`)
}

main().catch((e) => { console.error('FAIL:', e); process.exit(1) })
