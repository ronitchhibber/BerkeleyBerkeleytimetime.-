/**
 * Wave 2: improve the most critical PARTIAL majors — programs that have
 * some requirements but sparse course lists.
 *
 * Replaces existing entries by id. Focused on:
 *   • STEM majors with sparse course data (Physics, CS, Bioengineering, etc.)
 *   • Popular humanities/social-science majors (African American Studies,
 *     Political Science, Comparative Literature, Philosophy)
 *   • Engineering disciplines (Aerospace, Civil, Industrial, Materials, Nuclear)
 *   • Smaller departments missing depth (Italian Studies, Art Practice)
 */
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROGRAMS_PATH = join(__dirname, '..', '..', 'public', 'data', 'programs.json')

interface Program { id: string; name: string; type: string; groups: any[] }

const UPDATES: Program[] = [
  // ─── PHYSICS ────────────────────────────────────────────────────────
  {
    id: 'physics-ba', name: 'Physics', type: 'major',
    groups: [
      {
        id: 'phys-lower', name: 'Lower Division',
        requirements: [
          { id: 'phys-7-series', name: 'Physics 7-series (7A, 7B, 7C)', rule: { type: 'choose', count: 3, from: ['PHYSICS 7A', 'PHYSICS 7B', 'PHYSICS 7C', 'PHYSICS 5A', 'PHYSICS 5B', 'PHYSICS 5C'] } },
          { id: 'phys-math-lower', name: 'Single + multivariable calculus + linear algebra', rule: { type: 'choose', count: 4, from: ['MATH 1A', 'MATH 1B', 'MATH 53', 'MATH 54', 'MATH H1A', 'MATH H1B', 'MATH H53', 'MATH H54'] } },
          { id: 'phys-77-89', name: 'Physics 77 / 89', rule: { type: 'choose', count: 1, from: ['PHYSICS 77', 'PHYSICS 89'] } },
        ],
      },
      {
        id: 'phys-upper', name: 'Upper Division Physics Core (8 courses)',
        requirements: [
          { id: 'phys-105', name: 'Analytic Mechanics (PHYSICS 105 or 105H)', rule: { type: 'choose', count: 1, from: ['PHYSICS 105', 'PHYSICS H105'] } },
          { id: 'phys-110a-b', name: 'Electromagnetism (PHYSICS 110A, 110B)', rule: { type: 'choose', count: 2, from: ['PHYSICS 110A', 'PHYSICS 110B', 'PHYSICS H110A', 'PHYSICS H110B'] } },
          { id: 'phys-111a-b', name: 'Lab (PHYSICS 111A, 111B)', rule: { type: 'choose', count: 2, from: ['PHYSICS 111A', 'PHYSICS 111B', 'PHYSICS 111BL', 'PHYSICS 111ADV'] } },
          { id: 'phys-112', name: 'Statistical Mechanics (PHYSICS 112)', rule: { type: 'specific', courses: ['PHYSICS 112'] } },
          { id: 'phys-137a-b', name: 'Quantum Mechanics (PHYSICS 137A, 137B)', rule: { type: 'choose', count: 2, from: ['PHYSICS 137A', 'PHYSICS 137B', 'PHYSICS H137A', 'PHYSICS H137B'] } },
          { id: 'phys-electives', name: 'Physics upper-division electives (2)', rule: { type: 'choose', count: 2, from: ['PHYSICS 129', 'PHYSICS 130', 'PHYSICS 138', 'PHYSICS 139', 'PHYSICS 141A', 'PHYSICS 142', 'PHYSICS 151', 'PHYSICS 250', 'ASTRON 120', 'ASTRON C161', 'ASTRON C162'] } },
        ],
      },
    ],
  },

  // ─── COMPUTER SCIENCE ───────────────────────────────────────────────
  {
    id: 'computer-science-ba', name: 'Computer Science', type: 'major',
    groups: [
      {
        id: 'cs-lower', name: 'Lower Division',
        requirements: [
          { id: 'cs-61a', name: 'CS 61A — Structure & Interpretation', rule: { type: 'specific', courses: ['COMPSCI 61A'] } },
          { id: 'cs-61b', name: 'CS 61B — Data Structures', rule: { type: 'specific', courses: ['COMPSCI 61B'] } },
          { id: 'cs-61c', name: 'CS 61C — Machine Structures', rule: { type: 'specific', courses: ['COMPSCI 61C'] } },
          { id: 'cs-70', name: 'CS 70 — Discrete Math & Probability', rule: { type: 'specific', courses: ['COMPSCI 70'] } },
          { id: 'cs-math', name: 'Math 1A, 1B, 54 (or honors equivalents)', rule: { type: 'choose', count: 3, from: ['MATH 1A', 'MATH 1B', 'MATH 54', 'MATH H1A', 'MATH H1B', 'MATH H54', 'MATH N1A', 'MATH N1B'] } },
        ],
      },
      {
        id: 'cs-upper', name: 'Upper Division (7 courses)',
        requirements: [
          { id: 'cs-170', name: 'CS 170 — Algorithms', rule: { type: 'specific', courses: ['COMPSCI 170'] } },
          { id: 'cs-systems', name: 'Systems requirement (162 or similar)', rule: { type: 'choose', count: 1, from: ['COMPSCI 162', 'COMPSCI 168', 'COMPSCI 161', 'COMPSCI 152', 'COMPSCI 164', 'COMPSCI 169', 'COMPSCI 184', 'COMPSCI 186', 'COMPSCI 194-176'] } },
          { id: 'cs-electives', name: 'CS upper-division electives (5)', rule: { type: 'choose', count: 5, from: ['COMPSCI 152', 'COMPSCI 160', 'COMPSCI 161', 'COMPSCI 162', 'COMPSCI 164', 'COMPSCI 168', 'COMPSCI 169', 'COMPSCI 170', 'COMPSCI 172', 'COMPSCI 174', 'COMPSCI 176', 'COMPSCI 180', 'COMPSCI 182', 'COMPSCI 184', 'COMPSCI 186', 'COMPSCI 188', 'COMPSCI 189', 'COMPSCI 191', 'COMPSCI 195', 'COMPSCI 198', 'COMPSCI C100', 'COMPSCI C281A'] } },
        ],
      },
    ],
  },

  // ─── BIOENGINEERING ─────────────────────────────────────────────────
  {
    id: 'bioengineering-ba', name: 'Bioengineering', type: 'major',
    groups: [
      {
        id: 'bioe-lower', name: 'Lower Division',
        requirements: [
          { id: 'bioe-bio', name: 'Foundational biology', rule: { type: 'choose', count: 2, from: ['BIOLOGY 1A', 'BIOLOGY 1AL', 'BIOLOGY 1B', 'BIOENG 11', 'BIOENG 26'] } },
          { id: 'bioe-chem', name: 'General chemistry', rule: { type: 'choose', count: 2, from: ['CHEM 1A', 'CHEM 1AL', 'CHEM 1B', 'CHEM 4A', 'CHEM 4B'] } },
          { id: 'bioe-physics', name: 'Physics 7-series', rule: { type: 'choose', count: 2, from: ['PHYSICS 7A', 'PHYSICS 7B', 'PHYSICS 7C'] } },
          { id: 'bioe-math', name: 'Math 1A, 1B, 53, 54', rule: { type: 'choose', count: 4, from: ['MATH 1A', 'MATH 1B', 'MATH 53', 'MATH 54'] } },
          { id: 'bioe-orgchem', name: 'Organic chemistry', rule: { type: 'choose', count: 1, from: ['CHEM 3A', 'CHEM 12A'] } },
        ],
      },
      {
        id: 'bioe-upper', name: 'Upper Division (10 courses)',
        requirements: [
          { id: 'bioe-core', name: 'Bioengineering core', rule: { type: 'choose', count: 5, from: ['BIOENG 100', 'BIOENG 102', 'BIOENG 103', 'BIOENG 104', 'BIOENG 105', 'BIOENG 110', 'BIOENG 115', 'BIOENG 117', 'BIOENG C145B', 'BIOENG C146'] } },
          { id: 'bioe-electives', name: 'Bioengineering electives (5)', rule: { type: 'choose', count: 5, from: ['BIOENG 130', 'BIOENG 140', 'BIOENG 145', 'BIOENG 147', 'BIOENG 168', 'BIOENG 175', 'BIOENG 187', 'BIOENG C181', 'CHEM ENG 150A', 'CHEM ENG 154', 'MEC ENG 130A', 'MEC ENG 132', 'MCELLBI 102', 'MCELLBI 110'] } },
        ],
      },
    ],
  },

  // ─── POLITICAL SCIENCE ──────────────────────────────────────────────
  {
    id: 'political-science-ba', name: 'Political Science', type: 'major',
    groups: [
      {
        id: 'polsci-lower', name: 'Lower Division (1 of)',
        requirements: [
          { id: 'ps-lower', name: 'Choose 1 of POL SCI 1, 2, 3, 4, 5', rule: { type: 'choose', count: 1, from: ['POL SCI 1', 'POL SCI 2', 'POL SCI 3', 'POL SCI 4', 'POL SCI 5'] } },
        ],
      },
      {
        id: 'polsci-upper', name: 'Upper Division (8 courses)',
        requirements: [
          { id: 'ps-research', name: 'Research methods (POL SCI 3, 5, or similar)', rule: { type: 'choose', count: 1, from: ['POL SCI 3', 'POL SCI 5', 'POL SCI 88', 'POL SCI 109H'] } },
          { id: 'ps-american', name: 'American Politics field', rule: { type: 'choose', count: 1, from: ['POL SCI 102', 'POL SCI 104A', 'POL SCI 104B', 'POL SCI 104C', 'POL SCI 105', 'POL SCI 106', 'POL SCI 109F', 'POL SCI 109H', 'POL SCI 112A', 'POL SCI 167AC'] } },
          { id: 'ps-comparative', name: 'Comparative Politics field', rule: { type: 'choose', count: 1, from: ['POL SCI 124A', 'POL SCI 124B', 'POL SCI 142A', 'POL SCI 142B', 'POL SCI 143A', 'POL SCI 143B', 'POL SCI 145', 'POL SCI 146', 'POL SCI 147A'] } },
          { id: 'ps-international', name: 'International Relations field', rule: { type: 'choose', count: 1, from: ['POL SCI 122', 'POL SCI 124A', 'POL SCI 124B', 'POL SCI 125', 'POL SCI 126', 'POL SCI 128', 'POL SCI 138', 'POL SCI 149'] } },
          { id: 'ps-theory', name: 'Political Theory field', rule: { type: 'choose', count: 1, from: ['POL SCI 111AC', 'POL SCI 111B', 'POL SCI 112A', 'POL SCI 112B', 'POL SCI 114A', 'POL SCI 116A', 'POL SCI 116B', 'POL SCI 119', 'POL SCI 137'] } },
          { id: 'ps-electives', name: 'Political Science upper-div electives (3)', rule: { type: 'choose', count: 3, from: ['POL SCI 102', 'POL SCI 104A', 'POL SCI 109H', 'POL SCI 122', 'POL SCI 124A', 'POL SCI 124B', 'POL SCI 137', 'POL SCI 138', 'POL SCI 142A', 'POL SCI 142B', 'POL SCI 143A', 'POL SCI 143B', 'POL SCI 145', 'POL SCI 146', 'POL SCI 149', 'POL SCI 167AC'] } },
        ],
      },
    ],
  },

  // ─── PHILOSOPHY ─────────────────────────────────────────────────────
  {
    id: 'philosophy-ba', name: 'Philosophy', type: 'major',
    groups: [
      {
        id: 'phil-lower', name: 'Lower Division',
        requirements: [
          { id: 'phil-25', name: 'Symbolic Logic (PHILOS 12A or 100)', rule: { type: 'choose', count: 1, from: ['PHILOS 12A', 'PHILOS 100', 'PHILOS 140A'] } },
          { id: 'phil-history', name: 'History of philosophy intro', rule: { type: 'choose', count: 2, from: ['PHILOS 25A', 'PHILOS 25B'] } },
        ],
      },
      {
        id: 'phil-upper', name: 'Upper Division (8 courses)',
        requirements: [
          { id: 'phil-history-upper', name: 'History courses (3)', rule: { type: 'choose', count: 3, from: ['PHILOS 156', 'PHILOS 157A', 'PHILOS 158', 'PHILOS 159', 'PHILOS 160', 'PHILOS 161', 'PHILOS 162', 'PHILOS 163', 'PHILOS 178'] } },
          { id: 'phil-mvt', name: 'Metaphysics, value, theory (3)', rule: { type: 'choose', count: 3, from: ['PHILOS 100', 'PHILOS 102', 'PHILOS 103', 'PHILOS 104', 'PHILOS 105', 'PHILOS 107', 'PHILOS 115', 'PHILOS 116', 'PHILOS 122', 'PHILOS 132', 'PHILOS 142', 'PHILOS 178'] } },
          { id: 'phil-electives', name: 'Philosophy upper-div electives (2)', rule: { type: 'choose', count: 2, from: ['PHILOS 100', 'PHILOS 110', 'PHILOS 115', 'PHILOS 122', 'PHILOS 125', 'PHILOS 132', 'PHILOS 138', 'PHILOS 142', 'PHILOS 187'] } },
        ],
      },
    ],
  },

  // ─── COMPARATIVE LITERATURE ─────────────────────────────────────────
  {
    id: 'comparative-literature-ba', name: 'Comparative Literature', type: 'major',
    groups: [
      {
        id: 'comlit-prereq', name: 'Prerequisites',
        requirements: [
          { id: 'cl-r1b', name: 'Comparative literature R1A + R1B', rule: { type: 'choose', count: 2, from: ['COMLIT R1A', 'COMLIT R1B'] } },
          { id: 'cl-foreign', name: 'Foreign language at literary level', rule: { type: 'choose', count: 1, from: ['FRENCH 102', 'GERMAN 100', 'SPANISH 100A', 'ITALIAN 100', 'RUSSIAN 100A', 'JAPAN 100A', 'CHINESE 100A', 'LATIN 100', 'GREEK 100', 'ARABIC 100A'] } },
        ],
      },
      {
        id: 'comlit-upper', name: 'Upper Division (8 courses)',
        requirements: [
          { id: 'cl-100', name: 'COMLIT 100 — Methods', rule: { type: 'specific', courses: ['COMLIT 100'] } },
          { id: 'cl-history', name: 'Pre-1800 literature (2)', rule: { type: 'choose', count: 2, from: ['COMLIT 153', 'COMLIT 155', 'COMLIT 156', 'COMLIT 158', 'COMLIT C160', 'ENGLISH 117A', 'CLASSIC 130A', 'FRENCH 116A', 'GERMAN 130'] } },
          { id: 'cl-modern', name: 'Modern literature (2)', rule: { type: 'choose', count: 2, from: ['COMLIT 165', 'COMLIT 170', 'COMLIT 172', 'COMLIT 175', 'COMLIT C180', 'ENGLISH 165', 'ENGLISH 173', 'FRENCH 130'] } },
          { id: 'cl-electives', name: 'Comparative Lit electives (3)', rule: { type: 'choose', count: 3, from: ['COMLIT 100', 'COMLIT 153', 'COMLIT 155', 'COMLIT 158', 'COMLIT C160', 'COMLIT 165', 'COMLIT 170', 'COMLIT 175', 'COMLIT 180', 'COMLIT 190', 'ENGLISH 165', 'FRENCH 170', 'GERMAN 150'] } },
        ],
      },
    ],
  },

  // ─── AFRICAN AMERICAN STUDIES ───────────────────────────────────────
  {
    id: 'african-american-studies-ba', name: 'African American Studies', type: 'major',
    groups: [
      {
        id: 'aas-foundation', name: 'Foundations',
        requirements: [
          { id: 'aas-intro', name: 'Intro to African American Studies', rule: { type: 'choose', count: 1, from: ['AFRICAM 4A', 'AFRICAM 4B', 'AFRICAM 5A', 'AFRICAM 5B'] } },
          { id: 'aas-history', name: 'African American history', rule: { type: 'choose', count: 1, from: ['AFRICAM 100', 'AFRICAM 117', 'AFRICAM 134', 'HISTORY 137AC'] } },
        ],
      },
      {
        id: 'aas-upper', name: 'Upper Division (8 courses)',
        requirements: [
          { id: 'aas-electives', name: 'AFRICAM upper-div + cross-listed', rule: { type: 'choose', count: 8, from: ['AFRICAM 100', 'AFRICAM 107', 'AFRICAM 112A', 'AFRICAM 112B', 'AFRICAM 113', 'AFRICAM 117', 'AFRICAM 119', 'AFRICAM 120', 'AFRICAM 130', 'AFRICAM 134', 'AFRICAM 138', 'AFRICAM 139', 'AFRICAM 144', 'AFRICAM 150', 'AFRICAM 159AC', 'AFRICAM 170', 'AFRICAM 175', 'AFRICAM 180', 'ETHSTD 100', 'ETHSTD 144AC'] } },
        ],
      },
    ],
  },

  // ─── ITALIAN STUDIES ────────────────────────────────────────────────
  {
    id: 'italian-studies-ba', name: 'Italian Studies', type: 'major',
    groups: [
      {
        id: 'ital-prereq', name: 'Prerequisites',
        requirements: [
          { id: 'it-prereq', name: 'Intermediate Italian (ITALIAN 3 + 4)', rule: { type: 'choose', count: 2, from: ['ITALIAN 3', 'ITALIAN 4', 'ITALIAN 13', 'ITALIAN 14'] } },
        ],
      },
      {
        id: 'ital-upper', name: 'Upper Division (8 courses)',
        requirements: [
          { id: 'it-100', name: 'ITALIAN 100 — Advanced Italian', rule: { type: 'specific', courses: ['ITALIAN 100'] } },
          { id: 'it-survey', name: 'Italian literature surveys (2)', rule: { type: 'choose', count: 2, from: ['ITALIAN 102A', 'ITALIAN 102B', 'ITALIAN 103', 'ITALIAN 104', 'ITALIAN 110A', 'ITALIAN 110B'] } },
          { id: 'it-electives', name: 'Italian upper-division electives (5)', rule: { type: 'choose', count: 5, from: ['ITALIAN 105', 'ITALIAN 110A', 'ITALIAN 110B', 'ITALIAN 112', 'ITALIAN 115', 'ITALIAN 120', 'ITALIAN 130', 'ITALIAN 145', 'ITALIAN 150', 'ITALIAN 158', 'ITALIAN 160', 'ITALIAN 170', 'ITALIAN 175', 'ITALIAN 180'] } },
        ],
      },
    ],
  },

  // ─── ART PRACTICE ───────────────────────────────────────────────────
  {
    id: 'art-practice-ba', name: 'Art Practice', type: 'major',
    groups: [
      {
        id: 'art-lower', name: 'Lower Division',
        requirements: [
          { id: 'ap-foundations', name: 'Art foundations (Drawing, Painting, Sculpture, Photography)', rule: { type: 'choose', count: 4, from: ['ART 8', 'ART 12', 'ART 13', 'ART 14', 'ART 15', 'ART 18', 'ART 23AC'] } },
        ],
      },
      {
        id: 'art-upper', name: 'Upper Division (8 courses)',
        requirements: [
          { id: 'ap-history', name: 'Art history requirement', rule: { type: 'choose', count: 1, from: ['HISTART 100', 'HISTART 105', 'HISTART 192L', 'HISTART 192M', 'HISTART 192P'] } },
          { id: 'ap-theory', name: 'Theory / criticism', rule: { type: 'choose', count: 1, from: ['ART 130AC', 'ART 162', 'ART 163', 'ART 165'] } },
          { id: 'ap-studio', name: 'Studio practice (5 upper-division)', rule: { type: 'choose', count: 5, from: ['ART 110', 'ART 130AC', 'ART 132', 'ART 134', 'ART 142', 'ART 152', 'ART 162', 'ART 163', 'ART 165', 'ART 169', 'ART 175', 'ART 180', 'ART 185', 'ART 190', 'ART 196'] } },
          { id: 'ap-thesis', name: 'Senior thesis exhibition (ART 190 / 196)', rule: { type: 'choose', count: 1, from: ['ART 190', 'ART 196'] } },
        ],
      },
    ],
  },

  // ─── AEROSPACE ENGINEERING ──────────────────────────────────────────
  {
    id: 'aerospace-engineering-ba', name: 'Aerospace Engineering', type: 'major',
    groups: [
      {
        id: 'ae-lower', name: 'Lower Division',
        requirements: [
          { id: 'ae-math', name: 'Math sequence', rule: { type: 'choose', count: 4, from: ['MATH 1A', 'MATH 1B', 'MATH 53', 'MATH 54'] } },
          { id: 'ae-physics', name: 'Physics 7-series', rule: { type: 'choose', count: 3, from: ['PHYSICS 7A', 'PHYSICS 7B', 'PHYSICS 7C'] } },
          { id: 'ae-chem', name: 'Chemistry', rule: { type: 'choose', count: 1, from: ['CHEM 1A', 'CHEM 4A'] } },
          { id: 'ae-eng', name: 'Engineering intro', rule: { type: 'choose', count: 2, from: ['ENGIN 7', 'ENGIN 25', 'AEROSPC 1', 'MEC ENG C85'] } },
        ],
      },
      {
        id: 'ae-upper', name: 'Upper Division (10 courses)',
        requirements: [
          { id: 'ae-core', name: 'Aerospace core', rule: { type: 'choose', count: 6, from: ['AEROSPC 100', 'AEROSPC 135A', 'AEROSPC 162', 'AEROSPC C193P', 'MEC ENG 100', 'MEC ENG 102B', 'MEC ENG 104', 'MEC ENG 106', 'MEC ENG 109', 'MEC ENG 119', 'MEC ENG 130A', 'MEC ENG 132', 'MEC ENG 140'] } },
          { id: 'ae-electives', name: 'Aerospace electives (4)', rule: { type: 'choose', count: 4, from: ['AEROSPC C136', 'AEROSPC C162', 'AEROSPC C166', 'MEC ENG 165', 'MEC ENG 170', 'MEC ENG 175', 'MEC ENG 185', 'EE 120', 'EE 128'] } },
        ],
      },
    ],
  },

  // ─── CIVIL ENGINEERING ──────────────────────────────────────────────
  {
    id: 'civil-engineering-ba', name: 'Civil Engineering', type: 'major',
    groups: [
      {
        id: 'ce-lower', name: 'Lower Division',
        requirements: [
          { id: 'ce-math', name: 'Math sequence', rule: { type: 'choose', count: 4, from: ['MATH 1A', 'MATH 1B', 'MATH 53', 'MATH 54'] } },
          { id: 'ce-physics', name: 'Physics 7A + 7B', rule: { type: 'choose', count: 2, from: ['PHYSICS 7A', 'PHYSICS 7B'] } },
          { id: 'ce-chem', name: 'Chemistry', rule: { type: 'choose', count: 1, from: ['CHEM 1A', 'CHEM 4A'] } },
          { id: 'ce-intro', name: 'Civil engineering introduction', rule: { type: 'choose', count: 2, from: ['CIV ENG 11', 'CIV ENG 70', 'CIV ENG 60', 'ENGIN 7'] } },
        ],
      },
      {
        id: 'ce-upper', name: 'Upper Division (10 courses)',
        requirements: [
          { id: 'ce-core', name: 'Civil engineering core', rule: { type: 'choose', count: 6, from: ['CIV ENG 93', 'CIV ENG 100', 'CIV ENG C103N', 'CIV ENG 110', 'CIV ENG 120', 'CIV ENG 130N', 'CIV ENG 153', 'CIV ENG 160', 'CIV ENG 165', 'CIV ENG 170'] } },
          { id: 'ce-electives', name: 'CE upper-division electives (4)', rule: { type: 'choose', count: 4, from: ['CIV ENG 121', 'CIV ENG 123', 'CIV ENG 131', 'CIV ENG 135', 'CIV ENG 153', 'CIV ENG 155', 'CIV ENG 168', 'CIV ENG 175', 'CIV ENG 180', 'CIV ENG 188', 'CIV ENG 191'] } },
        ],
      },
    ],
  },

  // ─── INDUSTRIAL ENGINEERING & OPERATIONS RESEARCH ───────────────────
  {
    id: 'industrial-engineering-operations-research-ba', name: 'Industrial Engineering & Operations Research', type: 'major',
    groups: [
      {
        id: 'ieor-lower', name: 'Lower Division',
        requirements: [
          { id: 'ie-math', name: 'Math + linear algebra', rule: { type: 'choose', count: 4, from: ['MATH 1A', 'MATH 1B', 'MATH 53', 'MATH 54'] } },
          { id: 'ie-physics', name: 'Physics 7A + 7B', rule: { type: 'choose', count: 2, from: ['PHYSICS 7A', 'PHYSICS 7B'] } },
          { id: 'ie-cs', name: 'Programming (CS 61A or similar)', rule: { type: 'choose', count: 1, from: ['COMPSCI 61A', 'COMPSCI 9G', 'IND ENG 95'] } },
          { id: 'ie-stats', name: 'Probability & statistics', rule: { type: 'choose', count: 1, from: ['STAT 134', 'IND ENG 173', 'IND ENG 170'] } },
        ],
      },
      {
        id: 'ieor-upper', name: 'Upper Division (8 courses)',
        requirements: [
          { id: 'ie-core', name: 'IEOR core', rule: { type: 'choose', count: 5, from: ['IND ENG 115', 'IND ENG 120', 'IND ENG 130', 'IND ENG 142', 'IND ENG 150', 'IND ENG 151', 'IND ENG 153', 'IND ENG 162', 'IND ENG 165', 'IND ENG 166', 'IND ENG 171', 'IND ENG 173', 'IND ENG 185', 'IND ENG 190E'] } },
          { id: 'ie-electives', name: 'IEOR electives (3)', rule: { type: 'choose', count: 3, from: ['IND ENG 110', 'IND ENG 115', 'IND ENG 134', 'IND ENG 162', 'IND ENG 169', 'IND ENG 174', 'IND ENG 180', 'COMPSCI 61B', 'STAT 135', 'UGBA 105'] } },
        ],
      },
    ],
  },

  // ─── MATERIALS SCIENCE & ENGINEERING ────────────────────────────────
  {
    id: 'materials-science-engineering-ba', name: 'Materials Science & Engineering', type: 'major',
    groups: [
      {
        id: 'mse-lower', name: 'Lower Division',
        requirements: [
          { id: 'ms-math', name: 'Math sequence', rule: { type: 'choose', count: 4, from: ['MATH 1A', 'MATH 1B', 'MATH 53', 'MATH 54'] } },
          { id: 'ms-physics', name: 'Physics 7A + 7B + 7C', rule: { type: 'choose', count: 3, from: ['PHYSICS 7A', 'PHYSICS 7B', 'PHYSICS 7C'] } },
          { id: 'ms-chem', name: 'General + organic chemistry', rule: { type: 'choose', count: 2, from: ['CHEM 1A', 'CHEM 4A', 'CHEM 1B', 'CHEM 4B', 'CHEM 3A'] } },
          { id: 'ms-intro', name: 'Materials science intro', rule: { type: 'choose', count: 1, from: ['MAT SCI 45', 'MAT SCI 102'] } },
        ],
      },
      {
        id: 'mse-upper', name: 'Upper Division (8 courses)',
        requirements: [
          { id: 'ms-core', name: 'Materials Science core', rule: { type: 'choose', count: 5, from: ['MAT SCI 102', 'MAT SCI 103', 'MAT SCI 104', 'MAT SCI 111', 'MAT SCI 113', 'MAT SCI 120', 'MAT SCI 121', 'MAT SCI 122', 'MAT SCI 130', 'MAT SCI 162'] } },
          { id: 'ms-electives', name: 'MSE electives (3)', rule: { type: 'choose', count: 3, from: ['MAT SCI 125', 'MAT SCI 145', 'MAT SCI 151', 'MAT SCI 161', 'MAT SCI 170', 'MAT SCI 175', 'MAT SCI 180', 'MAT SCI 191', 'CHEM ENG 150A', 'PHYSICS 110A'] } },
        ],
      },
    ],
  },

  // ─── NUCLEAR ENGINEERING ────────────────────────────────────────────
  {
    id: 'nuclear-engineering-ba', name: 'Nuclear Engineering', type: 'major',
    groups: [
      {
        id: 'ne-lower', name: 'Lower Division',
        requirements: [
          { id: 'ne-math', name: 'Math sequence', rule: { type: 'choose', count: 4, from: ['MATH 1A', 'MATH 1B', 'MATH 53', 'MATH 54'] } },
          { id: 'ne-physics', name: 'Physics 7-series', rule: { type: 'choose', count: 3, from: ['PHYSICS 7A', 'PHYSICS 7B', 'PHYSICS 7C'] } },
          { id: 'ne-chem', name: 'General chemistry', rule: { type: 'choose', count: 1, from: ['CHEM 1A', 'CHEM 4A'] } },
          { id: 'ne-intro', name: 'NE intro', rule: { type: 'choose', count: 1, from: ['NUC ENG 92', 'NUC ENG C100', 'NUC ENG 101', 'ENGIN 7'] } },
        ],
      },
      {
        id: 'ne-upper', name: 'Upper Division (8 courses)',
        requirements: [
          { id: 'ne-core', name: 'Nuclear engineering core', rule: { type: 'choose', count: 5, from: ['NUC ENG 100', 'NUC ENG 101', 'NUC ENG 104', 'NUC ENG 124', 'NUC ENG 130', 'NUC ENG 150', 'NUC ENG 161', 'NUC ENG 162', 'NUC ENG 167', 'NUC ENG 170A'] } },
          { id: 'ne-electives', name: 'NE electives (3)', rule: { type: 'choose', count: 3, from: ['NUC ENG 92', 'NUC ENG 175', 'NUC ENG 180', 'NUC ENG C162', 'PHYSICS 105', 'PHYSICS 110A', 'PHYSICS 137A', 'CHEM ENG 150A'] } },
        ],
      },
    ],
  },

  // ─── PUBLIC HEALTH ──────────────────────────────────────────────────
  {
    id: 'public-health-ba', name: 'Public Health', type: 'major',
    groups: [
      {
        id: 'ph-lower', name: 'Lower Division',
        requirements: [
          { id: 'ph-bio', name: 'Foundational biology', rule: { type: 'choose', count: 1, from: ['BIOLOGY 1A', 'BIOLOGY 1B', 'MCELLBI C100A', 'MCELLBI 102'] } },
          { id: 'ph-chem', name: 'General chemistry', rule: { type: 'choose', count: 1, from: ['CHEM 1A', 'CHEM 4A'] } },
          { id: 'ph-stats', name: 'Statistics', rule: { type: 'choose', count: 1, from: ['STAT 2', 'STAT 20', 'STAT 21', 'PB HLTH 142', 'STAT C8'] } },
          { id: 'ph-calc', name: 'Calculus', rule: { type: 'choose', count: 1, from: ['MATH 16A', 'MATH 1A', 'MATH 10A'] } },
          { id: 'ph-intro', name: 'Intro to Public Health', rule: { type: 'choose', count: 1, from: ['PB HLTH 150A', 'PB HLTH W150A'] } },
        ],
      },
      {
        id: 'ph-upper', name: 'Upper Division (10 courses)',
        requirements: [
          { id: 'ph-core', name: 'Public Health core', rule: { type: 'choose', count: 5, from: ['PB HLTH 142', 'PB HLTH 150B', 'PB HLTH 150D', 'PB HLTH 150E', 'PB HLTH 152', 'PB HLTH 160', 'PB HLTH 162A', 'PB HLTH 162B', 'PB HLTH 170', 'PB HLTH 181'] } },
          { id: 'ph-electives', name: 'PH electives (5)', rule: { type: 'choose', count: 5, from: ['PB HLTH 101', 'PB HLTH 116', 'PB HLTH 126', 'PB HLTH 131', 'PB HLTH 150C', 'PB HLTH 165', 'PB HLTH 180', 'PB HLTH 189', 'NUSCTX 110', 'NUSCTX 121', 'CY PLAN 117AC', 'SOCIOL 130AC'] } },
        ],
      },
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
  console.log(`Updated ${UPDATES.length} partial majors with deeper course lists.`)
}

main().catch((e) => { console.error('FAIL:', e); process.exit(1) })
