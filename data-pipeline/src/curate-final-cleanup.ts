/**
 * Final cleanup wave: every remaining partial program gets enough depth
 * to clear the rich threshold. Also restructures the single-requirement
 * certificates and adds depth to truly thin minors.
 */
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROGRAMS_PATH = join(__dirname, '..', '..', 'public', 'data', 'programs.json')

interface Program { id: string; name: string; type: string; groups: any[] }

const UPDATES: Program[] = [
  // ─── REMAINING PARTIAL MAJORS ────────────────────────────────────────
  {
    id: 'architecture-ba', name: 'Architecture', type: 'major',
    groups: [
      { id: 'arch-lower', name: 'Lower Division', requirements: [
        { id: 'arch-intro', name: 'ARCH 11A — Intro to Visual Studies', rule: { type: 'choose', count: 1, from: ['ARCH 11A', 'ARCH 11B', 'ENVDES 1'] } },
        { id: 'arch-history', name: 'Architectural history surveys', rule: { type: 'choose', count: 2, from: ['ARCH 170A', 'ARCH 170B', 'HISTART 105'] } },
        { id: 'arch-physics', name: 'Physics', rule: { type: 'choose', count: 1, from: ['PHYSICS 8A', 'PHYSICS 7A'] } },
        { id: 'arch-math', name: 'Math (calculus or stats)', rule: { type: 'choose', count: 1, from: ['MATH 16A', 'MATH 1A', 'STAT 2', 'STAT 20'] } },
      ] },
      { id: 'arch-upper', name: 'Upper Division Studio + Tech (10 courses)', requirements: [
        { id: 'arch-100a', name: 'Studio 100A', rule: { type: 'specific', courses: ['ARCH 100A'] } },
        { id: 'arch-100b', name: 'Studio 100B', rule: { type: 'specific', courses: ['ARCH 100B'] } },
        { id: 'arch-101', name: 'Construction (ARCH 101)', rule: { type: 'specific', courses: ['ARCH 101'] } },
        { id: 'arch-environment', name: 'Environmental controls (ARCH 140)', rule: { type: 'choose', count: 1, from: ['ARCH 140', 'ARCH 141', 'ARCH 240'] } },
        { id: 'arch-structures', name: 'Structures (ARCH 130 or CIV ENG)', rule: { type: 'choose', count: 1, from: ['ARCH 130', 'CIV ENG 130N'] } },
        { id: 'arch-electives', name: 'Architecture upper-div electives (5)', rule: { type: 'choose', count: 5, from: ['ARCH 110AC', 'ARCH 124', 'ARCH 142', 'ARCH 150', 'ARCH 160', 'ARCH 169', 'ARCH 170B', 'ARCH 175', 'ARCH 179', 'ARCH 180', 'ARCH 188', 'CY PLAN 110', 'LDARCH 110', 'ENVDES 100'] } },
      ] },
    ],
  },
  {
    id: 'dance-and-performance-studies-ba', name: 'Dance and Performance Studies', type: 'major',
    groups: [
      { id: 'dance-lower', name: 'Lower Division', requirements: [
        { id: 'dance-tdps', name: 'TDPS intro courses', rule: { type: 'choose', count: 2, from: ['TDPS 25', 'TDPS 50', 'TDPS 51', 'TDPS 52', 'TDPS 60'] } },
        { id: 'dance-technique', name: 'Dance technique foundation', rule: { type: 'choose', count: 2, from: ['TDPS 30A', 'TDPS 30B', 'TDPS 31A', 'TDPS 31B', 'TDPS 33', 'TDPS 35'] } },
      ] },
      { id: 'dance-upper', name: 'Upper Division (8 courses)', requirements: [
        { id: 'dance-history', name: 'Dance/Performance history', rule: { type: 'choose', count: 1, from: ['TDPS 124', 'TDPS 134', 'TDPS 138', 'TDPS 152'] } },
        { id: 'dance-theory', name: 'Theory + criticism', rule: { type: 'choose', count: 1, from: ['TDPS 160', 'TDPS 162', 'TDPS 166'] } },
        { id: 'dance-composition', name: 'Composition / choreography', rule: { type: 'choose', count: 1, from: ['TDPS 170', 'TDPS 175', 'TDPS 180'] } },
        { id: 'dance-technique-upper', name: 'Advanced technique', rule: { type: 'choose', count: 2, from: ['TDPS 130A', 'TDPS 130B', 'TDPS 131A', 'TDPS 131B', 'TDPS 133', 'TDPS 135'] } },
        { id: 'dance-electives', name: 'TDPS upper-div electives (3)', rule: { type: 'choose', count: 3, from: ['TDPS 124', 'TDPS 134', 'TDPS 152', 'TDPS 160', 'TDPS 162', 'TDPS 166', 'TDPS 170', 'TDPS 175', 'TDPS 180', 'TDPS 184', 'TDPS 189'] } },
      ] },
    ],
  },
  {
    id: 'energy-engineering-ba', name: 'Energy Engineering', type: 'major',
    groups: [
      { id: 'eneng-lower', name: 'Lower Division', requirements: [
        { id: 'en-math', name: 'Math sequence', rule: { type: 'choose', count: 4, from: ['MATH 1A', 'MATH 1B', 'MATH 53', 'MATH 54'] } },
        { id: 'en-physics', name: 'Physics 7-series', rule: { type: 'choose', count: 3, from: ['PHYSICS 7A', 'PHYSICS 7B', 'PHYSICS 7C'] } },
        { id: 'en-chem', name: 'Chemistry', rule: { type: 'choose', count: 2, from: ['CHEM 1A', 'CHEM 1AL', 'CHEM 4A', 'CHEM 4B'] } },
        { id: 'en-intro', name: 'Energy intro', rule: { type: 'choose', count: 1, from: ['ENERES 100', 'ENERES W100', 'ENERES 102'] } },
      ] },
      { id: 'eneng-upper', name: 'Upper Division (10 courses)', requirements: [
        { id: 'en-core', name: 'Energy systems core', rule: { type: 'choose', count: 5, from: ['ENERES 100', 'ENERES 102', 'ENERES 175', 'ENERES W175', 'CHEM ENG 150A', 'CHEM ENG 150B', 'MEC ENG 109', 'MEC ENG 130A', 'NUC ENG 124', 'NUC ENG C100'] } },
        { id: 'en-policy', name: 'Energy policy / economics', rule: { type: 'choose', count: 1, from: ['ENVECON C151', 'ENVECON C176', 'PUB POL 184', 'PUBPOL W184'] } },
        { id: 'en-electives', name: 'Energy electives (4)', rule: { type: 'choose', count: 4, from: ['ENERES 100', 'ENERES 102', 'ENERES 175', 'CIV ENG 153', 'CIV ENG 155', 'CHEM ENG 178', 'CHEM ENG 179', 'MAT SCI 145', 'MEC ENG 140', 'MEC ENG 165', 'NUC ENG 161', 'NUC ENG 167'] } },
      ] },
    ],
  },
  {
    id: 'geography-ba', name: 'Geography', type: 'major',
    groups: [
      { id: 'geog-lower', name: 'Lower Division', requirements: [
        { id: 'gg-intro', name: 'Geography intro courses', rule: { type: 'choose', count: 2, from: ['GEOG 1', 'GEOG 4', 'GEOG 10', 'GEOG 20', 'GEOG 40'] } },
        { id: 'gg-methods', name: 'Methods foundation', rule: { type: 'choose', count: 1, from: ['GEOG 80', 'GEOG 88', 'STAT 20'] } },
      ] },
      { id: 'geog-upper', name: 'Upper Division (10 courses)', requirements: [
        { id: 'gg-physical', name: 'Physical geography', rule: { type: 'choose', count: 2, from: ['GEOG 100', 'GEOG 110', 'GEOG 130', 'GEOG 140A', 'GEOG 142', 'GEOG 143'] } },
        { id: 'gg-human', name: 'Human geography', rule: { type: 'choose', count: 2, from: ['GEOG 130', 'GEOG 137', 'GEOG 144', 'GEOG 159AC', 'GEOG C188', 'GEOG 150'] } },
        { id: 'gg-area', name: 'Regional / area courses', rule: { type: 'choose', count: 2, from: ['GEOG 100', 'GEOG 159AC', 'GEOG 137', 'GEOG 144', 'GEOG 150', 'GEOG 160'] } },
        { id: 'gg-methods-upper', name: 'GIS / methods upper-div', rule: { type: 'choose', count: 1, from: ['GEOG C188', 'GEOG 142', 'GEOG 143', 'GEOG C160'] } },
        { id: 'gg-electives', name: 'Geography upper-div electives (3)', rule: { type: 'choose', count: 3, from: ['GEOG 100', 'GEOG 110', 'GEOG 130', 'GEOG 137', 'GEOG 142', 'GEOG 143', 'GEOG 144', 'GEOG 150', 'GEOG 160', 'GEOG 188', 'EPS C162', 'CY PLAN 130'] } },
      ] },
    ],
  },
  {
    id: 'american-studies-ba', name: 'American Studies', type: 'major',
    groups: [
      { id: 'as-lower', name: 'Lower Division', requirements: [
        { id: 'as-intro', name: 'Intro to American Studies', rule: { type: 'choose', count: 1, from: ['AMERSTD 10', 'AMERSTD 102'] } },
        { id: 'as-history', name: 'American history survey', rule: { type: 'choose', count: 1, from: ['HISTORY 7A', 'HISTORY 7B'] } },
      ] },
      { id: 'as-upper', name: 'Upper Division (8 courses)', requirements: [
        { id: 'as-thematic', name: 'Thematic concentration core (3)', rule: { type: 'choose', count: 3, from: ['AMERSTD 101', 'AMERSTD 102', 'AMERSTD 139AC', 'AMERSTD 150', 'HISTORY 130', 'HISTORY 137AC', 'HISTORY 140A', 'POL SCI 102', 'ENGLISH 130A', 'ENGLISH 130B'] } },
        { id: 'as-disciplinary', name: 'Disciplinary breadth (3)', rule: { type: 'choose', count: 3, from: ['ENGLISH 130A', 'ENGLISH 130B', 'ENGLISH 132', 'ENGLISH 133', 'HISTORY 137AC', 'HISTORY 138AC', 'HISTORY 140A', 'POL SCI 102', 'POL SCI 167AC', 'AFRICAM 117', 'ASAMST 121', 'CHICANO 100', 'NATAMST 100'] } },
        { id: 'as-electives', name: 'American Studies upper-div electives (2)', rule: { type: 'choose', count: 2, from: ['AMERSTD 101', 'AMERSTD 102', 'AMERSTD 139AC', 'AMERSTD 150', 'AMERSTD 190', 'HISTORY 130', 'HISTORY 137AC', 'POL SCI 167AC'] } },
      ] },
    ],
  },
  {
    id: 'scandinavian-ba', name: 'Scandinavian', type: 'major',
    groups: [
      { id: 'scan-prereq', name: 'Prerequisites', requirements: [
        { id: 'sc-elementary', name: 'Elementary Scandinavian language', rule: { type: 'choose', count: 2, from: ['SCANDIN 1', 'SCANDIN 2'] } },
        { id: 'sc-survey', name: 'Scandinavian intro survey', rule: { type: 'choose', count: 1, from: ['SCANDIN 50', 'SCANDIN 60AC'] } },
      ] },
      { id: 'scan-upper', name: 'Upper Division (8 courses)', requirements: [
        { id: 'sc-language-upper', name: 'Advanced Scandinavian language', rule: { type: 'choose', count: 2, from: ['SCANDIN 100', 'SCANDIN 101', 'SCANDIN 110'] } },
        { id: 'sc-literature', name: 'Scandinavian literature surveys', rule: { type: 'choose', count: 2, from: ['SCANDIN 120', 'SCANDIN 122', 'SCANDIN 124', 'SCANDIN 130'] } },
        { id: 'sc-electives', name: 'Scandinavian upper-div electives (4)', rule: { type: 'choose', count: 4, from: ['SCANDIN 140', 'SCANDIN 150', 'SCANDIN 160', 'SCANDIN 170', 'SCANDIN 180', 'GERMAN 130', 'COMLIT 175'] } },
      ] },
    ],
  },
  {
    id: 'dutch-studies-ba', name: 'Dutch Studies', type: 'major',
    groups: [
      { id: 'dust-prereq', name: 'Prerequisites', requirements: [
        { id: 'du-elementary', name: 'Elementary Dutch (DUTCH 1, 2)', rule: { type: 'choose', count: 2, from: ['DUTCH 1', 'DUTCH 2'] } },
        { id: 'du-intermediate', name: 'Intermediate Dutch (DUTCH 3, 4)', rule: { type: 'choose', count: 2, from: ['DUTCH 3', 'DUTCH 4'] } },
      ] },
      { id: 'dust-upper', name: 'Upper Division (8 courses)', requirements: [
        { id: 'du-advanced', name: 'Advanced Dutch + literature surveys', rule: { type: 'choose', count: 3, from: ['DUTCH 100', 'DUTCH 110', 'DUTCH 120', 'DUTCH 140'] } },
        { id: 'du-culture', name: 'Dutch culture / Low Countries', rule: { type: 'choose', count: 2, from: ['DUTCH 150', 'DUTCH 160', 'GERMAN 130', 'GERMAN 150', 'HISTORY 134B'] } },
        { id: 'du-electives', name: 'Approved electives (3)', rule: { type: 'choose', count: 3, from: ['DUTCH 150', 'DUTCH 160', 'GERMAN 150', 'HISTAA C113A', 'HISTAA 130A', 'HISTORY 134B'] } },
      ] },
    ],
  },

  // Re-do IEOR with deeper structure (was 3 reqs, 11 courses)
  {
    id: 'industrial-engineering-and-operations-research-ba', name: 'Industrial Engineering & Operations Research', type: 'major',
    groups: [
      { id: 'ieor-lower', name: 'Lower Division', requirements: [
        { id: 'ie-math', name: 'Math sequence', rule: { type: 'choose', count: 4, from: ['MATH 1A', 'MATH 1B', 'MATH 53', 'MATH 54'] } },
        { id: 'ie-physics', name: 'Physics 7A + 7B', rule: { type: 'choose', count: 2, from: ['PHYSICS 7A', 'PHYSICS 7B'] } },
        { id: 'ie-cs', name: 'Programming (CS 61A or similar)', rule: { type: 'choose', count: 1, from: ['COMPSCI 61A', 'COMPSCI 9G', 'IND ENG 95'] } },
        { id: 'ie-stats-foundation', name: 'Probability foundation', rule: { type: 'choose', count: 1, from: ['STAT 134', 'IND ENG 173', 'IND ENG 170'] } },
      ] },
      { id: 'ieor-upper', name: 'Upper Division (8 courses)', requirements: [
        { id: 'ie-optimization', name: 'Optimization (IND ENG 162 or 130)', rule: { type: 'choose', count: 1, from: ['IND ENG 162', 'IND ENG 130', 'IND ENG 162A'] } },
        { id: 'ie-stochastic', name: 'Stochastic processes (IND ENG 173)', rule: { type: 'choose', count: 1, from: ['IND ENG 173', 'IND ENG 174'] } },
        { id: 'ie-economic', name: 'Economic analysis (IND ENG 115)', rule: { type: 'choose', count: 1, from: ['IND ENG 115', 'IND ENG 165'] } },
        { id: 'ie-systems', name: 'Systems engineering (IND ENG 142 or 150)', rule: { type: 'choose', count: 1, from: ['IND ENG 142', 'IND ENG 150', 'IND ENG 151'] } },
        { id: 'ie-capstone', name: 'IEOR capstone (IND ENG 191 or 195)', rule: { type: 'choose', count: 1, from: ['IND ENG 191', 'IND ENG 195'] } },
        { id: 'ie-electives', name: 'IEOR upper-div electives (3)', rule: { type: 'choose', count: 3, from: ['IND ENG 110', 'IND ENG 115', 'IND ENG 134', 'IND ENG 162', 'IND ENG 166', 'IND ENG 169', 'IND ENG 171', 'IND ENG 174', 'IND ENG 180', 'IND ENG 185', 'IND ENG 190E', 'COMPSCI 61B', 'STAT 135', 'UGBA 105'] } },
      ] },
    ],
  },

  // Materials Science (3 reqs, 18 courses → split deeper)
  {
    id: 'materials-science-and-engineering-ba', name: 'Materials Science & Engineering', type: 'major',
    groups: [
      { id: 'mse-lower', name: 'Lower Division', requirements: [
        { id: 'ms-math', name: 'Math sequence', rule: { type: 'choose', count: 4, from: ['MATH 1A', 'MATH 1B', 'MATH 53', 'MATH 54'] } },
        { id: 'ms-physics', name: 'Physics 7A + 7B + 7C', rule: { type: 'choose', count: 3, from: ['PHYSICS 7A', 'PHYSICS 7B', 'PHYSICS 7C'] } },
        { id: 'ms-chem', name: 'General + organic chemistry', rule: { type: 'choose', count: 2, from: ['CHEM 1A', 'CHEM 4A', 'CHEM 1B', 'CHEM 4B', 'CHEM 3A'] } },
        { id: 'ms-intro', name: 'Materials science intro', rule: { type: 'choose', count: 1, from: ['MAT SCI 45', 'MAT SCI 102'] } },
      ] },
      { id: 'mse-upper', name: 'Upper Division (8 courses)', requirements: [
        { id: 'ms-thermo', name: 'Thermodynamics (MAT SCI 102 or 103)', rule: { type: 'choose', count: 1, from: ['MAT SCI 102', 'MAT SCI 103'] } },
        { id: 'ms-structure', name: 'Structure (MAT SCI 104 or 113)', rule: { type: 'choose', count: 1, from: ['MAT SCI 104', 'MAT SCI 113'] } },
        { id: 'ms-mechanical', name: 'Mechanical behavior (MAT SCI 111 or 121)', rule: { type: 'choose', count: 1, from: ['MAT SCI 111', 'MAT SCI 121', 'MAT SCI 122'] } },
        { id: 'ms-electronic', name: 'Electronic properties (MAT SCI 120 or 130)', rule: { type: 'choose', count: 1, from: ['MAT SCI 120', 'MAT SCI 130'] } },
        { id: 'ms-lab', name: 'Materials lab', rule: { type: 'choose', count: 1, from: ['MAT SCI 162', 'MAT SCI 161'] } },
        { id: 'ms-electives', name: 'MSE upper-div electives (3)', rule: { type: 'choose', count: 3, from: ['MAT SCI 125', 'MAT SCI 145', 'MAT SCI 151', 'MAT SCI 170', 'MAT SCI 175', 'MAT SCI 180', 'MAT SCI 191', 'CHEM ENG 150A', 'PHYSICS 110A'] } },
      ] },
    ],
  },

  // Re-do Applied Mathematics with deeper structure
  {
    id: 'applied-mathematics-ba', name: 'Applied Mathematics', type: 'major',
    groups: [
      { id: 'amath-lower', name: 'Lower Division', requirements: [
        { id: 'am-1a-1b', name: 'Math 1A + 1B', rule: { type: 'choose', count: 2, from: ['MATH 1A', 'MATH 1B'] } },
        { id: 'am-53', name: 'Math 53 (Multivariable)', rule: { type: 'choose', count: 1, from: ['MATH 53', 'MATH H53', 'MATH N53'] } },
        { id: 'am-54', name: 'Math 54 (Linear algebra & ODEs)', rule: { type: 'choose', count: 1, from: ['MATH 54', 'MATH H54', 'MATH 56'] } },
        { id: 'am-55', name: 'Math 55 (Discrete)', rule: { type: 'choose', count: 1, from: ['MATH 55', 'MATH N55'] } },
        { id: 'am-cs', name: 'Programming (CS 61A or DATA C8)', rule: { type: 'choose', count: 1, from: ['COMPSCI 61A', 'DATA C8', 'STAT C8'] } },
      ] },
      { id: 'amath-upper', name: 'Upper Division (8 courses)', requirements: [
        { id: 'am-104', name: 'Analysis I (104 / H104)', rule: { type: 'choose', count: 1, from: ['MATH 104', 'MATH H104'] } },
        { id: 'am-110', name: 'Linear Algebra II (110 / H110)', rule: { type: 'choose', count: 1, from: ['MATH 110', 'MATH H110'] } },
        { id: 'am-128', name: 'Numerical analysis OR ODE methods', rule: { type: 'choose', count: 1, from: ['MATH 128A', 'MATH 128B', 'MATH 121A', 'MATH 121B'] } },
        { id: 'am-cluster-a', name: 'Applied math cluster — choose 1 from area A', rule: { type: 'choose', count: 1, from: ['MATH 113', 'MATH 125A', 'MATH 126', 'MATH 127'] } },
        { id: 'am-cluster-b', name: 'Applied math cluster — choose 1 from area B', rule: { type: 'choose', count: 1, from: ['MATH 130', 'MATH 135', 'MATH 142', 'MATH 170', 'MATH 172', 'MATH 175'] } },
        { id: 'am-stats', name: 'Statistics for applied math', rule: { type: 'choose', count: 1, from: ['STAT 134', 'STAT 135', 'STAT 154'] } },
        { id: 'am-electives', name: 'Approved electives (2)', rule: { type: 'choose', count: 2, from: ['MATH 142', 'MATH 152', 'MATH 153', 'MATH 160', 'MATH 170', 'MATH 175', 'MATH 185', 'STAT 134', 'STAT 135', 'COMPSCI 70', 'COMPSCI 170'] } },
      ] },
    ],
  },

  // ─── REMAINING THIN MINORS ───────────────────────────────────────────
  {
    id: 'african-american-studies-minor', name: 'African American Studies', type: 'minor',
    groups: [
      { id: 'aasm-foundation', name: 'Foundation', requirements: [
        { id: 'aasm-intro', name: 'Intro to African American Studies', rule: { type: 'choose', count: 1, from: ['AFRICAM 4A', 'AFRICAM 4B', 'AFRICAM 5A', 'AFRICAM 5B'] } },
      ] },
      { id: 'aasm-upper', name: 'Upper Division (5 courses)', requirements: [
        { id: 'aasm-history', name: 'African American history', rule: { type: 'choose', count: 1, from: ['AFRICAM 100', 'AFRICAM 117', 'AFRICAM 134', 'HISTORY 137AC'] } },
        { id: 'aasm-literature', name: 'African American literature/arts', rule: { type: 'choose', count: 1, from: ['AFRICAM 119', 'AFRICAM 120', 'AFRICAM 138', 'AFRICAM 139', 'AFRICAM 144'] } },
        { id: 'aasm-society', name: 'African American society/politics', rule: { type: 'choose', count: 1, from: ['AFRICAM 107', 'AFRICAM 112A', 'AFRICAM 112B', 'AFRICAM 113', 'AFRICAM 130', 'AFRICAM 150'] } },
        { id: 'aasm-electives', name: 'African American Studies electives (2)', rule: { type: 'choose', count: 2, from: ['AFRICAM 100', 'AFRICAM 107', 'AFRICAM 117', 'AFRICAM 119', 'AFRICAM 120', 'AFRICAM 130', 'AFRICAM 134', 'AFRICAM 138', 'AFRICAM 144', 'AFRICAM 150', 'AFRICAM 159AC', 'AFRICAM 170', 'AFRICAM 175', 'ETHSTD 144AC'] } },
      ] },
    ],
  },
  {
    id: 'italian-studies-minor', name: 'Italian Studies', type: 'minor',
    groups: [
      { id: 'itm-foundation', name: 'Foundation', requirements: [
        { id: 'itm-intermediate', name: 'Intermediate Italian (3 + 4)', rule: { type: 'choose', count: 2, from: ['ITALIAN 3', 'ITALIAN 4', 'ITALIAN 13', 'ITALIAN 14'] } },
      ] },
      { id: 'itm-upper', name: 'Upper Division (5 courses)', requirements: [
        { id: 'itm-language', name: 'Advanced Italian (ITALIAN 100)', rule: { type: 'choose', count: 1, from: ['ITALIAN 100', 'ITALIAN 102A', 'ITALIAN 102B'] } },
        { id: 'itm-literature', name: 'Italian literature survey', rule: { type: 'choose', count: 1, from: ['ITALIAN 103', 'ITALIAN 104', 'ITALIAN 110A', 'ITALIAN 110B'] } },
        { id: 'itm-modern', name: 'Modern Italian culture', rule: { type: 'choose', count: 1, from: ['ITALIAN 112', 'ITALIAN 115', 'ITALIAN 130', 'ITALIAN 145', 'ITALIAN 158'] } },
        { id: 'itm-electives', name: 'Italian electives (2)', rule: { type: 'choose', count: 2, from: ['ITALIAN 105', 'ITALIAN 110A', 'ITALIAN 110B', 'ITALIAN 112', 'ITALIAN 120', 'ITALIAN 130', 'ITALIAN 145', 'ITALIAN 150', 'ITALIAN 158', 'ITALIAN 160', 'ITALIAN 170', 'ITALIAN 180'] } },
      ] },
    ],
  },
  {
    id: 'science-and-math-education-minor', name: 'Science and Math Education', type: 'minor',
    groups: [
      { id: 'sme-foundation', name: 'Foundation', requirements: [
        { id: 'sme-intro', name: 'Intro to Math/Science Teaching', rule: { type: 'choose', count: 1, from: ['UGIS 130', 'EDUC 130AC'] } },
      ] },
      { id: 'sme-upper', name: 'Upper Division (5 courses)', requirements: [
        { id: 'sme-methods', name: 'Math/Science teaching methods', rule: { type: 'choose', count: 2, from: ['UGIS 130', 'UGIS 140', 'EDUC 124AC', 'EDUC 124B', 'EDUC 130AC', 'EDUC 140AC', 'EDUC 150', 'EDUC 158', 'EDUC 161', 'MATH 151', 'MATH 152', 'MATH 153'] } },
        { id: 'sme-content', name: 'Content depth (math, sci, or CS)', rule: { type: 'choose', count: 2, from: ['MATH 151', 'MATH 152', 'MATH 153', 'PHYSICS 8A', 'CHEM 1A', 'BIO 1AL', 'COMPSCI 9G', 'COMPSCI 61A'] } },
        { id: 'sme-field', name: 'Field practicum', rule: { type: 'choose', count: 1, from: ['EDUC 130AC', 'EDUC 140AC', 'EDUC 195A', 'UGIS 130'] } },
      ] },
    ],
  },
  {
    id: 'hebrew-minor', name: 'Hebrew', type: 'minor',
    groups: [
      { id: 'hebm-foundation', name: 'Foundation', requirements: [
        { id: 'hebm-elem', name: 'Elementary Hebrew (1A + 1B)', rule: { type: 'choose', count: 2, from: ['HEBREW 1A', 'HEBREW 1B'] } },
      ] },
      { id: 'hebm-upper', name: 'Upper Division (5 courses)', requirements: [
        { id: 'hebm-intermediate', name: 'Intermediate / advanced Hebrew', rule: { type: 'choose', count: 2, from: ['HEBREW 102A', 'HEBREW 102B', 'HEBREW 103A', 'HEBREW 103B'] } },
        { id: 'hebm-advanced', name: 'Advanced Hebrew or specialized', rule: { type: 'choose', count: 1, from: ['HEBREW 110', 'HEBREW 130', 'HEBREW 140'] } },
        { id: 'hebm-electives', name: 'Hebrew + Jewish Studies electives (2)', rule: { type: 'choose', count: 2, from: ['JEWISH 100', 'JEWISH 102', 'JEWISH 121', 'JEWISH 138', 'MELC 130', 'HISTORY 100C'] } },
      ] },
    ],
  },
  {
    id: 'persian-minor', name: 'Persian', type: 'minor',
    groups: [
      { id: 'persm-foundation', name: 'Foundation', requirements: [
        { id: 'persm-elem', name: 'Elementary Persian (1A + 1B)', rule: { type: 'choose', count: 2, from: ['PERSIAN 1A', 'PERSIAN 1B'] } },
      ] },
      { id: 'persm-upper', name: 'Upper Division (5 courses)', requirements: [
        { id: 'persm-intermediate', name: 'Intermediate / advanced Persian', rule: { type: 'choose', count: 2, from: ['PERSIAN 100A', 'PERSIAN 100B', 'PERSIAN 110'] } },
        { id: 'persm-literature', name: 'Persian literature/culture', rule: { type: 'choose', count: 1, from: ['PERSIAN 130', 'MELC 138', 'MELC 145'] } },
        { id: 'persm-electives', name: 'Persian + MELC electives (2)', rule: { type: 'choose', count: 2, from: ['MELC 119', 'MELC 121', 'MELC 138', 'MELC 145', 'MELC 175', 'HISTORY 110', 'HISTORY 173B'] } },
      ] },
    ],
  },
  {
    id: 'tibetan-minor', name: 'Tibetan', type: 'minor',
    groups: [
      { id: 'tibm-foundation', name: 'Foundation', requirements: [
        { id: 'tibm-elem', name: 'Elementary Tibetan (1A + 1B)', rule: { type: 'choose', count: 2, from: ['TIBETAN 1A', 'TIBETAN 1B'] } },
      ] },
      { id: 'tibm-upper', name: 'Upper Division (5 courses)', requirements: [
        { id: 'tibm-intermediate', name: 'Intermediate / advanced Tibetan', rule: { type: 'choose', count: 2, from: ['TIBETAN 100A', 'TIBETAN 100B', 'TIBETAN 110'] } },
        { id: 'tibm-buddhism', name: 'Buddhist Studies foundation', rule: { type: 'choose', count: 1, from: ['BUDDSTD 50', 'BUDDSTD 100', 'BUDDSTD 110'] } },
        { id: 'tibm-electives', name: 'Tibetan + Buddhist Studies electives (2)', rule: { type: 'choose', count: 2, from: ['BUDDSTD 100', 'BUDDSTD 110', 'BUDDSTD C114', 'BUDDSTD 123', 'BUDDSTD 130', 'BUDDSTD 140', 'BUDDSTD 150'] } },
      ] },
    ],
  },
  {
    id: 'turkish-minor', name: 'Turkish', type: 'minor',
    groups: [
      { id: 'turkm-foundation', name: 'Foundation', requirements: [
        { id: 'turkm-elem', name: 'Elementary Turkish (1A + 1B)', rule: { type: 'choose', count: 2, from: ['TURKISH 1A', 'TURKISH 1B'] } },
      ] },
      { id: 'turkm-upper', name: 'Upper Division (5 courses)', requirements: [
        { id: 'turkm-intermediate', name: 'Intermediate / advanced Turkish', rule: { type: 'choose', count: 2, from: ['TURKISH 100A', 'TURKISH 100B', 'TURKISH 110'] } },
        { id: 'turkm-area', name: 'Ottoman / Middle East area-studies', rule: { type: 'choose', count: 1, from: ['MELC 138', 'MELC 145', 'MELC 165', 'HISTORY 110', 'HISTORY 173B'] } },
        { id: 'turkm-electives', name: 'Turkish + MELC electives (2)', rule: { type: 'choose', count: 2, from: ['MELC 119', 'MELC 138', 'MELC 145', 'MELC 165', 'MELC 175', 'POL SCI 142B'] } },
      ] },
    ],
  },
  {
    id: 'russian-language-minor', name: 'Russian Language', type: 'minor',
    groups: [
      { id: 'rusm-foundation', name: 'Foundation', requirements: [
        { id: 'rusm-elem', name: 'Elementary Russian (1 + 2)', rule: { type: 'choose', count: 2, from: ['RUSSIAN 1', 'RUSSIAN 2'] } },
      ] },
      { id: 'rusm-upper', name: 'Upper Division (5 courses)', requirements: [
        { id: 'rusm-intermediate', name: 'Intermediate Russian (3 + 4)', rule: { type: 'choose', count: 2, from: ['RUSSIAN 3', 'RUSSIAN 4'] } },
        { id: 'rusm-advanced', name: 'Advanced Russian', rule: { type: 'choose', count: 1, from: ['RUSSIAN 100A', 'RUSSIAN 100B', 'RUSSIAN 105'] } },
        { id: 'rusm-electives', name: 'Russian language/culture electives (2)', rule: { type: 'choose', count: 2, from: ['RUSSIAN 105', 'RUSSIAN 120', 'RUSSIAN 130', 'SLAVIC 134', 'SLAVIC 137'] } },
      ] },
    ],
  },
  {
    id: 'dutch-studies-minor', name: 'Dutch Studies', type: 'minor',
    groups: [
      { id: 'dum-foundation', name: 'Foundation', requirements: [
        { id: 'dum-language', name: 'Elementary + Intermediate Dutch (1-4)', rule: { type: 'choose', count: 2, from: ['DUTCH 1', 'DUTCH 2', 'DUTCH 3', 'DUTCH 4'] } },
      ] },
      { id: 'dum-upper', name: 'Upper Division (5 courses)', requirements: [
        { id: 'dum-advanced', name: 'Advanced Dutch language', rule: { type: 'choose', count: 1, from: ['DUTCH 100', 'DUTCH 110', 'DUTCH 120'] } },
        { id: 'dum-culture', name: 'Dutch / Low Countries culture', rule: { type: 'choose', count: 1, from: ['DUTCH 140', 'DUTCH 150', 'DUTCH 160', 'GERMAN 130', 'HISTORY 134B'] } },
        { id: 'dum-electives', name: 'Approved electives (3)', rule: { type: 'choose', count: 3, from: ['DUTCH 100', 'DUTCH 110', 'DUTCH 120', 'DUTCH 140', 'DUTCH 150', 'DUTCH 160', 'GERMAN 150', 'HISTAA C113A', 'HISTAA 130A'] } },
      ] },
    ],
  },

  // ─── CERTIFICATE RESTRUCTURES (single-req → multi-req) ──────────────
  {
    id: 'cert-public-service', name: 'Cal Corps Public Service Internship Certificate', type: 'certificate',
    groups: [
      { id: 'cps-foundations', name: 'Foundations', requirements: [
        { id: 'cps-intro', name: 'Public service / civic engagement intro', rule: { type: 'choose', count: 1, from: ['PUB POL 101', 'POL SCI 167AC', 'EDUC 130AC'] } },
      ] },
      { id: 'cps-upper', name: 'Upper Division Public Service (5 courses)', requirements: [
        { id: 'cps-policy', name: 'Public policy / governance', rule: { type: 'choose', count: 1, from: ['PUB POL 101', 'PUB POL 157', 'POL SCI 137'] } },
        { id: 'cps-equity', name: 'Equity / community focus', rule: { type: 'choose', count: 1, from: ['POL SCI 167AC', 'EDUC 130AC', 'GWS 100AC', 'AFRICAM 107', 'SOCIOL 137AC'] } },
        { id: 'cps-urban', name: 'Urban / community planning', rule: { type: 'choose', count: 1, from: ['CY PLAN 110', 'CY PLAN 117AC', 'CY PLAN 119', 'SOCIOL 145'] } },
        { id: 'cps-capstone', name: 'Public service capstone / thesis', rule: { type: 'choose', count: 1, from: ['PUB POL 184', 'GPP 196', 'POL SCI 195A', 'POL SCI 195B'] } },
        { id: 'cps-electives', name: 'Approved electives (2)', rule: { type: 'choose', count: 2, from: ['PUB POL 101', 'PUB POL 157', 'POL SCI 167AC', 'POL SCI 137', 'EDUC 130AC', 'GWS 100AC', 'SOCIOL 145', 'SOCIOL 137AC', 'CY PLAN 110', 'AFRICAM 107', 'LEGALST 132AC'] } },
      ] },
    ],
  },
  {
    id: 'cert-data-science-domain', name: 'Data Science Domain Emphasis', type: 'certificate',
    groups: [
      { id: 'dsde-foundation', name: 'Data Science Foundations (3 courses)', requirements: [
        { id: 'dsde-intro', name: 'Data 8 / DATA C8 — Foundations of DS', rule: { type: 'choose', count: 1, from: ['DATA C8', 'STAT C8', 'COMPSCI C8'] } },
        { id: 'dsde-c100', name: 'Data 100 — Principles of DS', rule: { type: 'choose', count: 1, from: ['DATA C100', 'COMPSCI 100'] } },
        { id: 'dsde-cs', name: 'Programming foundation (CS 61A)', rule: { type: 'choose', count: 1, from: ['COMPSCI 61A', 'COMPSCI 88'] } },
      ] },
      { id: 'dsde-domain', name: 'Domain Track (3 courses)', requirements: [
        { id: 'dsde-method', name: 'DS method or theory', rule: { type: 'choose', count: 1, from: ['STAT 134', 'STAT 135', 'STAT 154', 'COMPSCI 70', 'COMPSCI 188', 'COMPSCI 189', 'DATA 102', 'DATA 140'] } },
        { id: 'dsde-domain-area', name: 'Domain area course (chosen track)', rule: { type: 'choose', count: 1, from: ['LINGUIS 110', 'LINGUIS C160', 'GEOG C160', 'EPS C162', 'COGSCI 131', 'PSYCH 101', 'BIOENG C146', 'MCELLBI 102', 'ECON 140', 'POL SCI 88'] } },
        { id: 'dsde-domain-deep', name: 'Domain deeper course', rule: { type: 'choose', count: 1, from: ['DATA 102', 'DATA 104', 'DATA 140', 'COMPSCI 189', 'STAT 154', 'STAT 156', 'LINGUIS 165', 'GEOG 142', 'COGSCI 137', 'BIOENG 145'] } },
      ] },
    ],
  },
  {
    id: 'cert-scet-itsd', name: 'SCET · Certificate in Innovation, Tech & Sustainable Development', type: 'certificate',
    groups: [
      { id: 'itsd-foundation', name: 'Foundations', requirements: [
        { id: 'itsd-intro', name: 'Berkeley Method of Entrepreneurship (UGBA 192T)', rule: { type: 'choose', count: 1, from: ['UGBA 192T', 'UGBA 192P'] } },
      ] },
      { id: 'itsd-electives', name: 'Sustainability + Tech (4 courses)', requirements: [
        { id: 'itsd-tech', name: 'Tech / entrepreneurship', rule: { type: 'choose', count: 1, from: ['UGBA 192P', 'UGBA 195S', 'COMPSCI 195'] } },
        { id: 'itsd-global', name: 'Global development', rule: { type: 'choose', count: 1, from: ['GLOBAL 150', 'GLOBAL 175', 'GLOBAL C124', 'IAS 102'] } },
        { id: 'itsd-energy', name: 'Energy / environmental policy', rule: { type: 'choose', count: 1, from: ['ENERES 100', 'ENERES 102', 'ENERES 175', 'ESPM 161', 'ESPM C167'] } },
        { id: 'itsd-policy', name: 'Sustainability policy / planning', rule: { type: 'choose', count: 1, from: ['CY PLAN 119', 'ECON C175', 'PUB POL 184'] } },
      ] },
    ],
  },
  {
    id: 'cert-bioenergy', name: 'Bioenergy & Sustainable Chemical Technologies Certificate', type: 'certificate',
    groups: [
      { id: 'bioenergy-foundation', name: 'Foundations', requirements: [
        { id: 'bioenergy-intro', name: 'Energy fundamentals', rule: { type: 'choose', count: 1, from: ['ENERES 100', 'ENERES 102'] } },
      ] },
      { id: 'bioenergy-tracks', name: 'Bioenergy Coursework (4 courses)', requirements: [
        { id: 'bioenergy-bio', name: 'Bioengineering / biology', rule: { type: 'choose', count: 1, from: ['BIOENG 100', 'BIOENG 102', 'BIOENG 110', 'PLANTBI 135', 'PLANTBI C124'] } },
        { id: 'bioenergy-chem', name: 'Chemical engineering / chemistry', rule: { type: 'choose', count: 1, from: ['CHEM ENG 150A', 'CHEM ENG 178', 'CHEM ENG 179'] } },
        { id: 'bioenergy-policy', name: 'Energy policy / environmental', rule: { type: 'choose', count: 1, from: ['ENERES 175', 'ESPM C167', 'ESPM 175', 'PUB POL 184'] } },
        { id: 'bioenergy-elective', name: 'Approved bioenergy elective', rule: { type: 'choose', count: 1, from: ['BIOENG 102', 'BIOENG 110', 'CHEM ENG 154', 'PLANTBI 135', 'ESPM C167'] } },
      ] },
    ],
  },
  {
    id: 'cert-conservation-resource', name: 'Conservation & Resource Studies Certificate', type: 'certificate',
    groups: [
      { id: 'crs-foundation', name: 'Foundations', requirements: [
        { id: 'crs-intro', name: 'Environmental science intro', rule: { type: 'choose', count: 1, from: ['ESPM 50AC', 'ESPM 60'] } },
      ] },
      { id: 'crs-upper-cert', name: 'Conservation Coursework (4 courses)', requirements: [
        { id: 'crs-natural', name: 'Natural systems', rule: { type: 'choose', count: 1, from: ['ESPM 100', 'ESPM 117', 'ESPM 161'] } },
        { id: 'crs-policy', name: 'Environmental policy', rule: { type: 'choose', count: 1, from: ['ESPM 163', 'ESPM 175', 'CY PLAN 119', 'ENERES 100'] } },
        { id: 'crs-society', name: 'Environment + society', rule: { type: 'choose', count: 1, from: ['ESPM 50AC', 'ESPM 100', 'CY PLAN 130', 'ENVDES 100'] } },
        { id: 'crs-elective', name: 'Approved CRS elective', rule: { type: 'choose', count: 1, from: ['ESPM 113', 'ESPM 117', 'ESPM 175', 'ENERES 100', 'ENERES 102', 'CY PLAN 119', 'CY PLAN 130'] } },
      ] },
    ],
  },
]

async function main() {
  const data = JSON.parse(readFileSync(PROGRAMS_PATH, 'utf-8'))
  const updateIds = new Set(UPDATES.map((p) => p.id))
  const filtered = data.programs.filter((p: Program) => !updateIds.has(p.id))
  data.programs = [...filtered, ...UPDATES]
  data.meta = { ...data.meta, generatedAt: new Date().toISOString() }
  writeFileSync(PROGRAMS_PATH, JSON.stringify(data, null, 2))
  console.log(`Final cleanup: ${UPDATES.length} programs deepened.`)
}

main().catch((e) => { console.error('FAIL:', e); process.exit(1) })
