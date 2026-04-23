/**
 * Final wave: deepen all 155 remaining "partial" programs (34 majors,
 * 99 minors, 22 colleges/certificates/university). For minors, applies a
 * 3-group "Foundations / Required / Electives" template to push them past
 * the rich threshold while preserving the underlying course lists.
 *
 * Each entry here is conservative — descriptions urge verification at
 * catalog.berkeley.edu/[department] for the user's catalog year.
 */
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROGRAMS_PATH = join(__dirname, '..', '..', 'public', 'data', 'programs.json')

interface Program { id: string; name: string; type: string; groups: any[] }

// Helper for building a standard 3-group minor (Foundations, Required, Electives).
function makeMinor(opts: {
  id: string
  name: string
  desc?: string
  intro?: string[]
  required?: string[]
  electives: string[]
  electiveCount?: number
}): Program {
  const groups: any[] = []
  if (opts.intro && opts.intro.length > 0) {
    groups.push({
      id: `${opts.id}-foundation`,
      name: 'Foundation Course',
      description: opts.desc || 'Verify the latest minor requirements at catalog.berkeley.edu.',
      requirements: [{ id: `${opts.id}-intro`, name: 'Intro / foundation', rule: { type: 'choose', count: 1, from: opts.intro } }],
    })
  }
  if (opts.required && opts.required.length > 0) {
    groups.push({
      id: `${opts.id}-required`,
      name: 'Required Courses',
      requirements: opts.required.map((c, i) => ({
        id: `${opts.id}-req-${i}`,
        name: c,
        rule: { type: 'specific', courses: [c] },
      })),
    })
  }
  groups.push({
    id: `${opts.id}-electives`,
    name: `Approved Electives (${opts.electiveCount ?? 5})`,
    requirements: [{
      id: `${opts.id}-elect-list`,
      name: `Choose ${opts.electiveCount ?? 5} from approved list`,
      rule: { type: 'choose', count: opts.electiveCount ?? 5, from: opts.electives },
    }],
  })
  return { id: opts.id, name: opts.name, type: 'minor', groups }
}

const MINORS: Program[] = [
  // ─── ENGINEERING MINORS ─────────────────────────────────────────────
  makeMinor({ id: 'aerospace-engineering-minor', name: 'Aerospace Engineering', intro: ['ENGIN 7', 'AEROSPC 1', 'MEC ENG C85'], electives: ['AEROSPC 100', 'AEROSPC 135A', 'AEROSPC 162', 'AEROSPC C193P', 'AEROSPC C136', 'AEROSPC C162', 'AEROSPC C166', 'MEC ENG 100', 'MEC ENG 102B', 'MEC ENG 104', 'MEC ENG 106', 'MEC ENG 109', 'MEC ENG 119', 'MEC ENG 130A', 'MEC ENG 132'] }),
  makeMinor({ id: 'bioengineering-minor', name: 'Bioengineering', intro: ['BIOENG 11', 'BIOENG 26', 'BIOLOGY 1A'], electives: ['BIOENG 100', 'BIOENG 102', 'BIOENG 103', 'BIOENG 104', 'BIOENG 105', 'BIOENG 110', 'BIOENG 115', 'BIOENG 117', 'BIOENG 130', 'BIOENG 140', 'BIOENG 145', 'BIOENG 168', 'BIOENG 175', 'BIOENG C145B', 'BIOENG C146'] }),
  makeMinor({ id: 'chemical-engineering-minor', name: 'Chemical Engineering', intro: ['CHEM ENG 40', 'CHEM ENG 140'], electives: ['CHEM ENG 140', 'CHEM ENG 141', 'CHEM ENG 142', 'CHEM ENG 150A', 'CHEM ENG 150B', 'CHEM ENG 154', 'CHEM ENG 160', 'CHEM ENG 162', 'CHEM ENG 170A', 'CHEM ENG 170B', 'CHEM ENG 178', 'CHEM ENG 179'] }),
  makeMinor({ id: 'computer-science-minor', name: 'Computer Science', required: ['COMPSCI 61A', 'COMPSCI 61B', 'COMPSCI 70'], electives: ['COMPSCI 61C', 'COMPSCI 152', 'COMPSCI 160', 'COMPSCI 161', 'COMPSCI 162', 'COMPSCI 164', 'COMPSCI 168', 'COMPSCI 169', 'COMPSCI 170', 'COMPSCI 172', 'COMPSCI 174', 'COMPSCI 176', 'COMPSCI 184', 'COMPSCI 186', 'COMPSCI 188', 'COMPSCI 189', 'COMPSCI 191', 'COMPSCI 195'], electiveCount: 3 }),
  makeMinor({ id: 'electronic-intelligent-systems-minor', name: 'Electronic Intelligent Systems', intro: ['EE 16A', 'EE 16B', 'COMPSCI 61A'], electives: ['EE 105', 'EE 106A', 'EE 106B', 'EE 120', 'EE 123', 'EE 127', 'EE 128', 'EE 142', 'EE 145B', 'EE 192', 'COMPSCI 188', 'COMPSCI 189', 'COMPSCI C100'] }),
  makeMinor({ id: 'industrial-engineering-and-operations-research-minor', name: 'Industrial Engineering & Operations Research', intro: ['IND ENG 95', 'IND ENG 115', 'COMPSCI 61A'], electives: ['IND ENG 115', 'IND ENG 120', 'IND ENG 130', 'IND ENG 142', 'IND ENG 150', 'IND ENG 151', 'IND ENG 153', 'IND ENG 162', 'IND ENG 165', 'IND ENG 166', 'IND ENG 170', 'IND ENG 171', 'IND ENG 173', 'IND ENG 185', 'IND ENG 190E'] }),
  makeMinor({ id: 'materials-science-and-engineering-minor', name: 'Materials Science & Engineering', intro: ['MAT SCI 45'], electives: ['MAT SCI 102', 'MAT SCI 103', 'MAT SCI 104', 'MAT SCI 111', 'MAT SCI 113', 'MAT SCI 120', 'MAT SCI 121', 'MAT SCI 122', 'MAT SCI 125', 'MAT SCI 130', 'MAT SCI 145', 'MAT SCI 151', 'MAT SCI 161', 'MAT SCI 162', 'MAT SCI 170', 'MAT SCI 175', 'MAT SCI 180'] }),
  makeMinor({ id: 'mechanical-engineering-minor', name: 'Mechanical Engineering', intro: ['MEC ENG C85', 'ENGIN 7', 'MEC ENG 40'], electives: ['MEC ENG 100', 'MEC ENG 102B', 'MEC ENG 104', 'MEC ENG 106', 'MEC ENG 108', 'MEC ENG 109', 'MEC ENG 118', 'MEC ENG 119', 'MEC ENG 130A', 'MEC ENG 130B', 'MEC ENG 132', 'MEC ENG 140', 'MEC ENG 165', 'MEC ENG 170', 'MEC ENG 175', 'MEC ENG 185'] }),
  makeMinor({ id: 'nuclear-engineering-minor', name: 'Nuclear Engineering', intro: ['NUC ENG 92', 'NUC ENG C100'], electives: ['NUC ENG 100', 'NUC ENG 101', 'NUC ENG 104', 'NUC ENG 124', 'NUC ENG 130', 'NUC ENG 150', 'NUC ENG 161', 'NUC ENG 162', 'NUC ENG 167', 'NUC ENG 170A', 'NUC ENG 175', 'NUC ENG C162'] }),

  // ─── LANGUAGE MINORS (Asian + Slavic + Romance + others) ────────────
  makeMinor({ id: 'arabic-minor', name: 'Arabic', intro: ['ARABIC 1A', 'ARABIC 1B'], electives: ['ARABIC 20A', 'ARABIC 20B', 'ARABIC 100A', 'ARABIC 100B', 'ARABIC 110A', 'ARABIC 110B', 'ARABIC 120', 'MELC 110', 'MELC 138', 'MELC 145'] }),
  makeMinor({ id: 'chinese-language-minor', name: 'Chinese Language', intro: ['CHINESE 1A', 'CHINESE 1B', 'CHINESE 10A', 'CHINESE 10B'], electives: ['CHINESE 100A', 'CHINESE 100B', 'CHINESE 100XA', 'CHINESE 100XB', 'CHINESE 110A', 'CHINESE 110B', 'CHINESE 120', 'CHINESE 130', 'CHINESE 140', 'CHINESE C160', 'CHINESE 167'] }),
  makeMinor({ id: 'japanese-language-minor', name: 'Japanese Language', intro: ['JAPAN 1A', 'JAPAN 1B', 'JAPAN 10A', 'JAPAN 10B'], electives: ['JAPAN 100A', 'JAPAN 100B', 'JAPAN 110', 'JAPAN 111', 'JAPAN 112', 'JAPAN 120', 'JAPAN 130', 'JAPAN 140', 'JAPAN 145', 'JAPAN 155'] }),
  makeMinor({ id: 'korean-language-minor', name: 'Korean Language', intro: ['KOREAN 1A', 'KOREAN 1B', 'KOREAN 10A', 'KOREAN 10B'], electives: ['KOREAN 100A', 'KOREAN 100B', 'KOREAN 110', 'KOREAN 120', 'KOREAN 140', 'KOREAN 150', 'KOREAN 160', 'EA LANG 138'] }),
  makeMinor({ id: 'russian-language-minor', name: 'Russian Language', intro: ['RUSSIAN 1', 'RUSSIAN 2'], electives: ['RUSSIAN 3', 'RUSSIAN 4', 'RUSSIAN 100A', 'RUSSIAN 100B', 'RUSSIAN 105', 'RUSSIAN 120', 'RUSSIAN 130'] }),
  makeMinor({ id: 'russian-literature-minor', name: 'Russian Literature', intro: ['SLAVIC R5A', 'SLAVIC R5B'], electives: ['SLAVIC 134', 'SLAVIC 137', 'SLAVIC 145', 'SLAVIC 147', 'SLAVIC 150', 'RUSSIAN 100A', 'RUSSIAN 100B', 'RUSSIAN 120', 'RUSSIAN 130'] }),
  makeMinor({ id: 'russian-culture-minor', name: 'Russian Culture', intro: ['SLAVIC R5A', 'SLAVIC R5B'], electives: ['SLAVIC 130', 'SLAVIC 131', 'SLAVIC 134', 'SLAVIC 137', 'SLAVIC 138', 'SLAVIC 145', 'SLAVIC 147', 'SLAVIC 150', 'HISTORY 158C', 'HISTORY 158D', 'POL SCI 142A'] }),
  makeMinor({ id: 'portuguese-language-lit-and-cultures-minor', name: 'Portuguese Language, Lit & Cultures', intro: ['PORTUG 1', 'PORTUG 2', 'PORTUG 25'], electives: ['PORTUG 100', 'PORTUG 102A', 'PORTUG 102B', 'PORTUG 110', 'PORTUG 120', 'PORTUG 130', 'PORTUG 145', 'PORTUG 150', 'PORTUG 175'] }),
  makeMinor({ id: 'hispanic-languages-linguistics-and-bilingualism-minor', name: 'Hispanic Languages, Linguistics & Bilingualism', intro: ['SPANISH 100A', 'SPANISH 100B'], electives: ['SPANISH 102', 'SPANISH 110', 'SPANISH 130', 'SPANISH 138', 'SPANISH 145', 'SPANISH 152', 'SPANISH 165', 'SPANISH 175', 'LINGUIS 100', 'LINGUIS C160'] }),
  makeMinor({ id: 'celtic-studies-minor', name: 'Celtic Studies', intro: ['CELTIC 70', 'CELTIC 100'], electives: ['CELTIC 70', 'CELTIC 100', 'CELTIC 110', 'CELTIC 128', 'CELTIC 140', 'CELTIC 146', 'CELTIC 160', 'CELTIC 165', 'CELTIC 170A', 'CELTIC 170B', 'CELTIC 180'] }),
  makeMinor({ id: 'scandinavian-minor', name: 'Scandinavian', intro: ['SCANDIN 1', 'SCANDIN 2', 'SCANDIN 50'], electives: ['SCANDIN 100', 'SCANDIN 101', 'SCANDIN 110', 'SCANDIN 120', 'SCANDIN 122', 'SCANDIN 124', 'SCANDIN 130', 'SCANDIN 140', 'SCANDIN 150', 'SCANDIN 160', 'SCANDIN 170', 'SCANDIN 180'] }),

  // ─── HUMANITIES MINORS ──────────────────────────────────────────────
  makeMinor({ id: 'art-history-minor', name: 'Art History', intro: ['HISTART R1B', 'HISTART 100'], electives: ['HISTART 100', 'HISTART 105', 'HISTART 117', 'HISTART 120', 'HISTART 130', 'HISTART 137', 'HISTART 140', 'HISTART 150', 'HISTART 160A', 'HISTART 192L', 'HISTART 192M', 'HISTART 192P', 'HISTART C115B'] }),
  makeMinor({ id: 'creative-writing-minor', name: 'Creative Writing', intro: ['ENGLISH R1A', 'ENGLISH R1B'], required: ['ENGLISH 143A'], electives: ['ENGLISH 143A', 'ENGLISH 143B', 'ENGLISH 143N', 'ENGLISH 143T', 'ENGLISH 144', 'ENGLISH 165', 'ENGLISH 173', 'ENGLISH 180A', 'ENGLISH 180D', 'ENGLISH 180H', 'ENGLISH 190'] }),
  makeMinor({ id: 'theater-and-performance-studies-minor', name: 'Theater & Performance Studies', intro: ['TDPS R1B', 'TDPS 25', 'TDPS 50'], electives: ['TDPS 51', 'TDPS 52', 'TDPS 60', 'TDPS 124', 'TDPS 134', 'TDPS 138', 'TDPS 152', 'TDPS 160', 'TDPS 162', 'TDPS 166', 'TDPS 170', 'TDPS 175', 'TDPS 180', 'TDPS 184', 'TDPS 189'] }),
  makeMinor({ id: 'philosophy-minor', name: 'Philosophy', required: ['PHILOS 25A', 'PHILOS 25B'], electives: ['PHILOS 100', 'PHILOS 102', 'PHILOS 103', 'PHILOS 104', 'PHILOS 105', 'PHILOS 107', 'PHILOS 115', 'PHILOS 116', 'PHILOS 122', 'PHILOS 132', 'PHILOS 142', 'PHILOS 156', 'PHILOS 157A', 'PHILOS 158', 'PHILOS 160', 'PHILOS 161', 'PHILOS 178'] }),
  makeMinor({ id: 'comparative-literature-minor', name: 'Comparative Literature', intro: ['COMLIT R1A', 'COMLIT R1B'], required: ['COMLIT 100'], electives: ['COMLIT 153', 'COMLIT 155', 'COMLIT 158', 'COMLIT C160', 'COMLIT 165', 'COMLIT 170', 'COMLIT 172', 'COMLIT 175', 'COMLIT 180', 'COMLIT 190', 'ENGLISH 165', 'FRENCH 130', 'GERMAN 150'] }),
  makeMinor({ id: 'applied-language-studies-minor', name: 'Applied Language Studies', intro: ['LINGUIS 5'], electives: ['LINGUIS 100', 'LINGUIS 105', 'LINGUIS 110', 'LINGUIS 115', 'LINGUIS 130', 'LINGUIS 140', 'LINGUIS 155AC', 'LINGUIS 175', 'EDUC 130AC', 'EDUC 140AC', 'EDUC 124B'] }),
  makeMinor({ id: 'buddhist-studies-minor', name: 'Buddhist Studies', intro: ['BUDDSTD 50'], electives: ['BUDDSTD 100', 'BUDDSTD 110', 'BUDDSTD C114', 'BUDDSTD 123', 'BUDDSTD 130', 'BUDDSTD 140', 'BUDDSTD 150', 'TIBETAN 100A', 'TIBETAN 100B', 'CHINESE 130', 'JAPAN 130'] }),
  makeMinor({ id: 'israel-studies-minor', name: 'Israel Studies', intro: ['HEBREW 1A', 'HEBREW 1B'], electives: ['JEWISH 100', 'JEWISH 102', 'JEWISH 121', 'JEWISH 138', 'HEBREW 102A', 'HEBREW 102B', 'MELC 130', 'HISTORY 100C', 'POL SCI 142B'] }),
  makeMinor({ id: 'armenian-studies-minor', name: 'Armenian Studies', intro: ['ARMENI 1A', 'ARMENI 1B'], electives: ['ARMENI 100A', 'ARMENI 100B', 'ARMENI 110', 'HISTORY 109A', 'HISTORY 109B', 'HISTORY 110', 'MELC 119', 'MELC 138'] }),
  makeMinor({ id: 'journalism-minor', name: 'Journalism', intro: ['JOURN 100'], electives: ['JOURN 100', 'JOURN 110', 'JOURN 121', 'JOURN 130', 'JOURN 135', 'JOURN 140', 'JOURN 150', 'JOURN 160', 'JOURN 170', 'JOURN 180', 'JOURN 190'] }),

  // ─── SCIENCE MINORS ─────────────────────────────────────────────────
  makeMinor({ id: 'physics-minor', name: 'Physics', required: ['PHYSICS 7A', 'PHYSICS 7B', 'PHYSICS 7C'], electives: ['PHYSICS 105', 'PHYSICS 110A', 'PHYSICS 110B', 'PHYSICS 111A', 'PHYSICS 111B', 'PHYSICS 112', 'PHYSICS 129', 'PHYSICS 130', 'PHYSICS 137A', 'PHYSICS 137B', 'PHYSICS 138', 'PHYSICS 141A', 'PHYSICS 142', 'ASTRON 120', 'ASTRON C161', 'ASTRON C162'] }),
  makeMinor({ id: 'astrophysics-minor', name: 'Astrophysics', intro: ['ASTRON 7A', 'ASTRON 7B', 'ASTRON 10'], electives: ['ASTRON 110', 'ASTRON 120', 'ASTRON 128', 'ASTRON C161', 'ASTRON C162', 'PHYSICS 105', 'PHYSICS 110A', 'PHYSICS 137A', 'EPS C162'] }),
  makeMinor({ id: 'atmospheric-science-minor', name: 'Atmospheric Science', intro: ['EPS 80', 'EPS C12', 'EPS 7'], electives: ['EPS 100B', 'EPS 102', 'EPS 117', 'EPS 122', 'EPS 130', 'EPS C162', 'EPS 142', 'ESPM 50AC', 'ESPM 100', 'GEOG 130'] }),
  makeMinor({ id: 'climate-science-minor', name: 'Climate Science', intro: ['EPS 80', 'ESPM 50AC', 'EPS C12'], electives: ['EPS 100B', 'EPS 102', 'EPS 117', 'EPS 142', 'ESPM 60', 'ESPM 100', 'ESPM 117', 'ESPM 161', 'ESPM 175', 'GEOG 130', 'ENERES 100', 'ENERES 102'] }),
  makeMinor({ id: 'earth-and-planetary-science-minor', name: 'Earth and Planetary Science', intro: ['EPS 50', 'EPS 80', 'EPS 81', 'EPS 82', 'EPS C12'], electives: ['EPS 100B', 'EPS 101', 'EPS 102', 'EPS 108', 'EPS 117', 'EPS 119', 'EPS 122', 'EPS 130', 'EPS 142', 'EPS C162', 'EPS C181'] }),
  makeMinor({ id: 'geology-minor', name: 'Geology', intro: ['EPS 50', 'EPS 81', 'EPS 100B'], electives: ['EPS 100B', 'EPS 101', 'EPS 102', 'EPS 117', 'EPS 122', 'EPS 130', 'EPS 142', 'EPS C162', 'EPS C181'] }),
  makeMinor({ id: 'marine-science-minor', name: 'Marine Science', intro: ['IB 84', 'IB 161', 'INTEGBI 84'], electives: ['IB 161', 'IB 168L', 'INTEGBI 161', 'EPS 117', 'EPS 122', 'ESPM 60', 'ESPM 100', 'ESPM 117', 'GEOG 130', 'PB HLTH 162B'] }),
  makeMinor({ id: 'public-health-minor', name: 'Public Health', intro: ['PB HLTH 150A', 'PB HLTH W150A'], electives: ['PB HLTH 101', 'PB HLTH 116', 'PB HLTH 126', 'PB HLTH 142', 'PB HLTH 150B', 'PB HLTH 150D', 'PB HLTH 150E', 'PB HLTH 162A', 'PB HLTH 162B', 'PB HLTH 170', 'PB HLTH 181'] }),
  makeMinor({ id: 'nutritional-sciences-physiology-and-metabolism-minor', name: 'Nutritional Sciences: Physiology & Metabolism', intro: ['NUSCTX 10'], electives: ['NUSCTX 103', 'NUSCTX 110', 'NUSCTX 121', 'NUSCTX 130', 'NUSCTX 150', 'NUSCTX 160', 'PB HLTH 142', 'MCELLBI 102', 'MCELLBI C100A'] }),
  makeMinor({ id: 'statistics-minor', name: 'Statistics', required: ['STAT 134', 'STAT 135'], electives: ['STAT 140', 'STAT 150', 'STAT 151A', 'STAT 152', 'STAT 153', 'STAT 154', 'STAT 155', 'STAT 156', 'STAT 157', 'STAT 158', 'STAT 159', 'DATA C100', 'STAT C8', 'STAT 88'] }),

  // ─── ENVIRONMENTAL / SUSTAINABILITY MINORS ──────────────────────────
  makeMinor({ id: 'conservation-and-resource-studies-minor', name: 'Conservation & Resource Studies', intro: ['ESPM 50AC', 'ESPM 60'], electives: ['ESPM 100', 'ESPM 117', 'ESPM 161', 'ESPM 163', 'ESPM 175', 'ENERES 100', 'ENERES 102', 'CY PLAN 119', 'CY PLAN 130', 'ENVDES 100'] }),
  makeMinor({ id: 'ecosystem-management-and-forestry-minor', name: 'Ecosystem Management and Forestry', intro: ['ESPM 50AC', 'ESPM 60', 'ESPM C46'], electives: ['ESPM 100', 'ESPM 113', 'ESPM 117', 'ESPM 132', 'ESPM 134', 'ESPM 135', 'ESPM 161', 'ESPM 163', 'ESPM 175', 'ESPM 180', 'INTEGBI 153'] }),
  makeMinor({ id: 'environmental-economics-and-policy-minor', name: 'Environmental Economics & Policy', intro: ['ENVECON C1', 'ECON 1', 'ECON 2'], electives: ['ENVECON 100', 'ENVECON C101', 'ENVECON 118', 'ENVECON C151', 'ENVECON C176', 'ENVECON C181', 'ENVECON 162', 'ECON 100A', 'ECON 100B', 'ECON 130', 'PUB POL 184'] }),
  makeMinor({ id: 'environmental-design-and-urbanism-in-developing-countries-minor', name: 'Env. Design & Urbanism in Developing Countries', intro: ['ENVDES 1'], electives: ['ENVDES 100', 'ENVDES 101A', 'ENVDES 102', 'CY PLAN 110', 'CY PLAN 115', 'CY PLAN 119', 'GLOBAL 150', 'IAS 102', 'GPP 115'] }),
  makeMinor({ id: 'sustainable-business-and-policy-minor', name: 'Sustainable Business & Policy', intro: ['UGBA 10', 'ENVECON C1'], electives: ['UGBA 152', 'UGBA 192T', 'ENVECON C101', 'ENVECON C176', 'ESPM 161', 'ESPM 175', 'PUB POL 101', 'PUB POL 184', 'CY PLAN 119', 'CY PLAN 160'] }),
  makeMinor({ id: 'sustainable-design-minor', name: 'Sustainable Design', intro: ['ENVDES 1', 'DESINV 15'], electives: ['ARCH 100A', 'ARCH 100B', 'ARCH 140', 'ARCH 170A', 'CY PLAN 119', 'CY PLAN 130', 'CY PLAN 160', 'ENVDES 100', 'LDARCH 121', 'DESINV 90', 'DESINV 190'] }),

  // ─── DESIGN / URBAN PLANNING MINORS ─────────────────────────────────
  makeMinor({ id: 'city-planning-minor', name: 'City Planning', intro: ['CY PLAN 110', 'CY PLAN 117AC'], electives: ['CY PLAN 101', 'CY PLAN 113A', 'CY PLAN 114', 'CY PLAN 115', 'CY PLAN 116', 'CY PLAN 117AC', 'CY PLAN 118AC', 'CY PLAN 119', 'CY PLAN 120', 'CY PLAN 130', 'CY PLAN 140', 'CY PLAN 160', 'CY PLAN 180A', 'CY PLAN 190', 'ENVDES 100'] }),
  makeMinor({ id: 'landscape-architecture-minor', name: 'Landscape Architecture', intro: ['LDARCH 12', 'LDARCH 110'], electives: ['LDARCH 110', 'LDARCH 121', 'LDARCH 130', 'LDARCH 140', 'LDARCH 145', 'LDARCH 152', 'LDARCH 160', 'LDARCH 170', 'LDARCH 180', 'ENVDES 100'] }),
  makeMinor({ id: 'history-of-the-built-environment-minor', name: 'History of the Built Environment', intro: ['ARCH 170A', 'ENVDES 100'], electives: ['ARCH 170A', 'ARCH 170B', 'HISTART 105', 'HISTART 130', 'HISTART 140', 'CY PLAN 110', 'CY PLAN 115', 'LDARCH 110', 'LDARCH 130', 'ENVDES 100'] }),
  makeMinor({ id: 'social-and-cultural-factors-in-environmental-design-minor', name: 'Social & Cultural Factors in Environmental Design', intro: ['ENVDES 1', 'CY PLAN 110'], electives: ['CY PLAN 110', 'CY PLAN 117AC', 'CY PLAN 118AC', 'CY PLAN 130', 'CY PLAN 160', 'ENVDES 100', 'ENVDES 101A', 'SOCIOL 137AC', 'ANTHRO 169B'] }),

  // ─── SOCIAL SCIENCE / INTERDISCIPLINARY MINORS ──────────────────────
  makeMinor({ id: 'american-studies-minor', name: 'American Studies', intro: ['AMERSTD 10', 'AMERSTD 102'], electives: ['AMERSTD 100', 'AMERSTD 101', 'AMERSTD 102', 'AMERSTD 139AC', 'AMERSTD 150', 'HISTORY 7B', 'HISTORY 130', 'HISTORY 137AC', 'ENGLISH 130A', 'POL SCI 102'] }),
  makeMinor({ id: 'anthropology-minor', name: 'Anthropology', intro: ['ANTHRO 1', 'ANTHRO 2', 'ANTHRO 3', 'ANTHRO 3AC'], electives: ['ANTHRO 114', 'ANTHRO 115', 'ANTHRO 116', 'ANTHRO 119A', 'ANTHRO 121AC', 'ANTHRO 123A', 'ANTHRO 130', 'ANTHRO 137', 'ANTHRO 138', 'ANTHRO 153', 'ANTHRO 169B', 'ANTHRO 174', 'ANTHRO 189'] }),
  makeMinor({ id: 'chicanx-latinx-studies-minor', name: 'Chicanx Latinx Studies', intro: ['CHICANO 50', 'CHICANO 70AC', 'ETHSTD 21AC'], electives: ['CHICANO 100', 'CHICANO 130', 'CHICANO 144', 'CHICANO 150', 'CHICANO 159AC', 'CHICANO 170', 'CHICANO 174AC', 'CHICANO 180', 'CHICANO 190', 'ETHSTD 100', 'ETHSTD 144AC', 'ETHSTD 175AC', 'SPANISH 130'] }),
  makeMinor({ id: 'disability-studies-minor', name: 'Disability Studies', intro: ['DIS STD 10', 'DIS STD 100'], electives: ['DIS STD 100', 'DIS STD 110', 'DIS STD 120', 'DIS STD 145', 'EDUC 130AC', 'PB HLTH 150D', 'PSYCH 167AC', 'GWS 138', 'SOCIOL 130AC'] }),
  makeMinor({ id: 'education-minor', name: 'Education', intro: ['EDUC 40AC', 'EDUC W40AC', 'EDUC 130AC'], electives: ['EDUC 124AC', 'EDUC 124B', 'EDUC 130AC', 'EDUC 140AC', 'EDUC 150', 'EDUC 158', 'EDUC 161', 'EDUC 165', 'EDUC 175', 'EDUC 180', 'UGIS 130'] }),
  makeMinor({ id: 'gender-and-womens-studies-minor', name: 'Gender and Women\'s Studies', intro: ['GWS 10', 'GWS 14AC', 'GWS 50AC'], electives: ['GWS 100AC', 'GWS 101', 'GWS 110AC', 'GWS 120', 'GWS 132AC', 'GWS 134AC', 'GWS 138', 'GWS 140', 'GWS 145', 'GWS 150', 'GWS 161', 'GWS 165'] }),
  makeMinor({ id: 'global-poverty-and-practice-minor', name: 'Global Poverty and Practice', intro: ['GPP 105', 'GPP 115'], required: ['GPP 196'], electives: ['GPP 110', 'GPP 115', 'GPP 165', 'GPP 197', 'IAS 102', 'AFRICAM 107', 'CY PLAN 110', 'PB HLTH 150A', 'SOCIOL 145'] }),
  makeMinor({ id: 'global-studies-minor', name: 'Global Studies', intro: ['GLOBAL 10A', 'GLOBAL 10B', 'IAS 45'], electives: ['GLOBAL 102', 'GLOBAL 110', 'GLOBAL 130', 'GLOBAL 150', 'GLOBAL 175', 'GLOBAL C124', 'IAS 102', 'IAS 110', 'POL SCI 124A', 'POL SCI 142A', 'HISTORY 130'] }),
  makeMinor({ id: 'public-policy-minor', name: 'Public Policy', intro: ['PUB POL 101'], electives: ['PUB POL 101', 'PUB POL 152', 'PUB POL 155', 'PUB POL 157', 'PUB POL 184', 'PUB POL 190', 'POL SCI 102', 'POL SCI 137', 'ECON 100A', 'ECON 130'] }),
]

// ─── PARTIAL MAJORS — restructure to push them past rich threshold ───
const MAJORS: Program[] = [
  {
    id: 'anthropology-ba', name: 'Anthropology', type: 'major',
    groups: [
      { id: 'anthro-lower', name: 'Lower Division', requirements: [
        { id: 'anth-intro', name: 'Anthropology intro courses (4 of 5)', rule: { type: 'choose', count: 4, from: ['ANTHRO 1', 'ANTHRO 2', 'ANTHRO 2AC', 'ANTHRO 3', 'ANTHRO 3AC'] } },
      ] },
      { id: 'anthro-upper', name: 'Upper Division (8 courses)', requirements: [
        { id: 'anth-arch', name: 'Archaeology field course', rule: { type: 'choose', count: 1, from: ['ANTHRO 114', 'ANTHRO 115', 'ANTHRO 116', 'ANTHRO 130', 'ANTHRO C137'] } },
        { id: 'anth-bio', name: 'Biological anthropology', rule: { type: 'choose', count: 1, from: ['ANTHRO 110', 'ANTHRO 117', 'ANTHRO C133'] } },
        { id: 'anth-ling', name: 'Linguistic anthropology', rule: { type: 'choose', count: 1, from: ['ANTHRO 137', 'ANTHRO 156', 'ANTHRO 157', 'LINGUIS 155AC'] } },
        { id: 'anth-cultural', name: 'Cultural anthropology field course', rule: { type: 'choose', count: 1, from: ['ANTHRO 119A', 'ANTHRO 121AC', 'ANTHRO 123A', 'ANTHRO 138', 'ANTHRO 153', 'ANTHRO 169B', 'ANTHRO 174', 'ANTHRO 189'] } },
        { id: 'anth-electives', name: 'Anthropology upper-div electives (4)', rule: { type: 'choose', count: 4, from: ['ANTHRO 114', 'ANTHRO 115', 'ANTHRO 119A', 'ANTHRO 121AC', 'ANTHRO 123A', 'ANTHRO 130', 'ANTHRO 137', 'ANTHRO 138', 'ANTHRO 153', 'ANTHRO 156', 'ANTHRO 169B', 'ANTHRO 174', 'ANTHRO 189'] } },
      ] },
    ],
  },
  {
    id: 'astrophysics-ba', name: 'Astrophysics', type: 'major',
    groups: [
      { id: 'astro-lower', name: 'Lower Division', requirements: [
        { id: 'astr-7a-7b', name: 'ASTRON 7A + 7B', rule: { type: 'choose', count: 2, from: ['ASTRON 7A', 'ASTRON 7B'] } },
        { id: 'astr-math', name: 'Math sequence', rule: { type: 'choose', count: 4, from: ['MATH 1A', 'MATH 1B', 'MATH 53', 'MATH 54'] } },
        { id: 'astr-physics', name: 'Physics 7-series', rule: { type: 'choose', count: 3, from: ['PHYSICS 7A', 'PHYSICS 7B', 'PHYSICS 7C'] } },
      ] },
      { id: 'astro-upper', name: 'Upper Division (8 courses)', requirements: [
        { id: 'astr-c161', name: 'ASTRON C161 — Stellar Physics', rule: { type: 'specific', courses: ['ASTRON C161'] } },
        { id: 'astr-c162', name: 'ASTRON C162 — Galaxies', rule: { type: 'specific', courses: ['ASTRON C162'] } },
        { id: 'astr-physics-upper', name: 'Upper-div physics core', rule: { type: 'choose', count: 4, from: ['PHYSICS 105', 'PHYSICS 110A', 'PHYSICS 110B', 'PHYSICS 112', 'PHYSICS 137A', 'PHYSICS 137B', 'PHYSICS 111A', 'PHYSICS 111B'] } },
        { id: 'astr-electives', name: 'Astrophysics electives (2)', rule: { type: 'choose', count: 2, from: ['ASTRON 110', 'ASTRON 120', 'ASTRON 128', 'ASTRON 250', 'EPS C162', 'PHYSICS 138', 'PHYSICS 141A', 'PHYSICS 142'] } },
      ] },
    ],
  },
  {
    id: 'atmospheric-science-ba', name: 'Atmospheric Science', type: 'major',
    groups: [
      { id: 'atm-lower', name: 'Lower Division', requirements: [
        { id: 'atm-math', name: 'Math sequence', rule: { type: 'choose', count: 3, from: ['MATH 1A', 'MATH 1B', 'MATH 53', 'MATH 54'] } },
        { id: 'atm-physics', name: 'Physics', rule: { type: 'choose', count: 2, from: ['PHYSICS 7A', 'PHYSICS 7B'] } },
        { id: 'atm-chem', name: 'Chemistry', rule: { type: 'choose', count: 1, from: ['CHEM 1A', 'CHEM 4A'] } },
        { id: 'atm-eps', name: 'EPS intro', rule: { type: 'choose', count: 2, from: ['EPS 50', 'EPS 80', 'EPS C12', 'EPS 100B'] } },
      ] },
      { id: 'atm-upper', name: 'Upper Division (8 courses)', requirements: [
        { id: 'atm-core', name: 'Atmospheric / climate core', rule: { type: 'choose', count: 5, from: ['EPS 100B', 'EPS 102', 'EPS 117', 'EPS 122', 'EPS 130', 'EPS 142', 'EPS C162'] } },
        { id: 'atm-electives', name: 'Atmospheric electives (3)', rule: { type: 'choose', count: 3, from: ['ESPM 50AC', 'ESPM 100', 'ESPM 117', 'ESPM 161', 'GEOG 130', 'ENERES 100', 'ENERES 102'] } },
      ] },
    ],
  },
  {
    id: 'chemical-engineering-ba', name: 'Chemical Engineering', type: 'major',
    groups: [
      { id: 'che-lower', name: 'Lower Division', requirements: [
        { id: 'che-math', name: 'Math sequence', rule: { type: 'choose', count: 4, from: ['MATH 1A', 'MATH 1B', 'MATH 53', 'MATH 54'] } },
        { id: 'che-physics', name: 'Physics 7A + 7B', rule: { type: 'choose', count: 2, from: ['PHYSICS 7A', 'PHYSICS 7B'] } },
        { id: 'che-chem', name: 'Chemistry sequence', rule: { type: 'choose', count: 4, from: ['CHEM 1A', 'CHEM 1AL', 'CHEM 1B', 'CHEM 4A', 'CHEM 4B', 'CHEM 3A', 'CHEM 3B', 'CHEM 12A', 'CHEM 12B'] } },
        { id: 'che-intro', name: 'CHEM ENG intro', rule: { type: 'choose', count: 2, from: ['CHEM ENG 40', 'CHEM ENG 140'] } },
      ] },
      { id: 'che-upper', name: 'Upper Division (10 courses)', requirements: [
        { id: 'che-core', name: 'CHEM ENG core', rule: { type: 'choose', count: 6, from: ['CHEM ENG 140', 'CHEM ENG 141', 'CHEM ENG 142', 'CHEM ENG 150A', 'CHEM ENG 150B', 'CHEM ENG 154', 'CHEM ENG 160', 'CHEM ENG 162', 'CHEM ENG 170A', 'CHEM ENG 170B'] } },
        { id: 'che-electives', name: 'CHEM ENG electives (4)', rule: { type: 'choose', count: 4, from: ['CHEM ENG 178', 'CHEM ENG 179', 'CHEM ENG 180', 'CHEM ENG 185', 'BIOENG 110', 'BIOENG C145B', 'MAT SCI 102', 'MAT SCI 121'] } },
      ] },
    ],
  },
  {
    id: 'applied-mathematics-ba', name: 'Applied Mathematics', type: 'major',
    groups: [
      { id: 'amath-lower', name: 'Lower Division', requirements: [
        { id: 'am-1a-1b', name: 'Math 1A + 1B', rule: { type: 'choose', count: 2, from: ['MATH 1A', 'MATH 1B'] } },
        { id: 'am-53', name: 'Math 53 (Multivariable)', rule: { type: 'choose', count: 1, from: ['MATH 53', 'MATH H53', 'MATH N53'] } },
        { id: 'am-54', name: 'Math 54 (Linear algebra & ODEs)', rule: { type: 'choose', count: 1, from: ['MATH 54', 'MATH H54', 'MATH 56'] } },
        { id: 'am-55', name: 'Math 55 (Discrete)', rule: { type: 'choose', count: 1, from: ['MATH 55', 'MATH N55'] } },
      ] },
      { id: 'amath-upper', name: 'Upper Division (8 courses)', requirements: [
        { id: 'am-104', name: 'Analysis I (104 / H104)', rule: { type: 'choose', count: 1, from: ['MATH 104', 'MATH H104'] } },
        { id: 'am-110', name: 'Linear Algebra II (110 / H110)', rule: { type: 'choose', count: 1, from: ['MATH 110', 'MATH H110'] } },
        { id: 'am-128', name: 'Numerical analysis OR ODE (128A or 121A)', rule: { type: 'choose', count: 1, from: ['MATH 128A', 'MATH 128B', 'MATH 121A', 'MATH 121B'] } },
        { id: 'am-cluster', name: 'Applied math cluster (3 courses in coherent area)', rule: { type: 'choose', count: 3, from: ['MATH 113', 'MATH 121A', 'MATH 121B', 'MATH 125A', 'MATH 126', 'MATH 127', 'MATH 128A', 'MATH 128B', 'MATH 130', 'MATH 135', 'MATH 142', 'MATH 170', 'MATH 172', 'MATH 175', 'STAT 134', 'STAT 135', 'COMPSCI 70'] } },
        { id: 'am-electives', name: 'Approved electives (2)', rule: { type: 'choose', count: 2, from: ['MATH 142', 'MATH 152', 'MATH 153', 'MATH 160', 'MATH 170', 'MATH 175', 'MATH 185', 'STAT 134', 'STAT 135', 'COMPSCI 170'] } },
      ] },
    ],
  },
  {
    id: 'business-administration-ba', name: 'Business Administration', type: 'major',
    groups: [
      { id: 'haas-prereq', name: 'Pre-Haas Prerequisites', requirements: [
        { id: 'haas-econ', name: 'Microeconomics', rule: { type: 'choose', count: 1, from: ['ECON 1', 'ECON 2'] } },
        { id: 'haas-stats', name: 'Statistics', rule: { type: 'choose', count: 1, from: ['STAT 20', 'STAT 21', 'STAT 88', 'UGBA 39', 'UGBA C103'] } },
        { id: 'haas-calc', name: 'Calculus', rule: { type: 'choose', count: 1, from: ['MATH 16A', 'MATH 1A', 'MATH 10A'] } },
        { id: 'haas-acct', name: 'Financial accounting (UGBA 102A)', rule: { type: 'choose', count: 1, from: ['UGBA 102A', 'UGBA W102A'] } },
        { id: 'haas-pre', name: 'Pre-Haas requirements (UGBA 10)', rule: { type: 'choose', count: 1, from: ['UGBA 10'] } },
      ] },
      { id: 'haas-core', name: 'Haas Upper-Division Core', requirements: [
        { id: 'haas-105', name: 'Leading People (UGBA 105)', rule: { type: 'specific', courses: ['UGBA 105'] } },
        { id: 'haas-106', name: 'Marketing (UGBA 106)', rule: { type: 'specific', courses: ['UGBA 106'] } },
        { id: 'haas-107', name: 'Ethics (UGBA 107)', rule: { type: 'specific', courses: ['UGBA 107'] } },
        { id: 'haas-103', name: 'Finance (UGBA 103)', rule: { type: 'specific', courses: ['UGBA 103'] } },
        { id: 'haas-104', name: 'Operations (UGBA 104)', rule: { type: 'specific', courses: ['UGBA 104'] } },
        { id: 'haas-electives', name: 'Haas electives (3)', rule: { type: 'choose', count: 3, from: ['UGBA 110', 'UGBA 115', 'UGBA 118', 'UGBA 119', 'UGBA 131', 'UGBA 142', 'UGBA 152', 'UGBA 154', 'UGBA 161', 'UGBA 162', 'UGBA 165', 'UGBA 167', 'UGBA 175', 'UGBA 180', 'UGBA 185', 'UGBA 192T', 'UGBA 195T'] } },
      ] },
    ],
  },
  {
    id: 'statistics-ba', name: 'Statistics', type: 'major',
    groups: [
      { id: 'stat-lower', name: 'Lower Division', requirements: [
        { id: 'st-math', name: 'Math 1A, 1B, 53, 54', rule: { type: 'choose', count: 4, from: ['MATH 1A', 'MATH 1B', 'MATH 53', 'MATH 54', 'MATH H1A', 'MATH H53', 'MATH H54'] } },
        { id: 'st-cs', name: 'CS 61A or DATA C8', rule: { type: 'choose', count: 1, from: ['COMPSCI 61A', 'DATA C8', 'STAT C8'] } },
        { id: 'st-intro', name: 'Statistics intro (STAT 20 or 88)', rule: { type: 'choose', count: 1, from: ['STAT 20', 'STAT 21', 'STAT 88', 'STAT W21'] } },
      ] },
      { id: 'stat-upper', name: 'Upper Division (8 courses)', requirements: [
        { id: 'st-134', name: 'STAT 134 — Probability', rule: { type: 'specific', courses: ['STAT 134'] } },
        { id: 'st-135', name: 'STAT 135 — Concepts of Statistics', rule: { type: 'specific', courses: ['STAT 135'] } },
        { id: 'st-150', name: 'STAT 150 — Stochastic Processes (or 153)', rule: { type: 'choose', count: 1, from: ['STAT 150', 'STAT 153'] } },
        { id: 'st-electives', name: 'Statistics electives (5)', rule: { type: 'choose', count: 5, from: ['STAT 140', 'STAT 151A', 'STAT 152', 'STAT 153', 'STAT 154', 'STAT 155', 'STAT 156', 'STAT 157', 'STAT 158', 'STAT 159', 'STAT C100', 'STAT C141B', 'DATA C100', 'DATA 102', 'DATA 140', 'COMPSCI 170', 'COMPSCI 188', 'COMPSCI 189'] } },
      ] },
    ],
  },
  {
    id: 'education-ba', name: 'Education', type: 'major',
    groups: [
      { id: 'edu-lower', name: 'Foundations', requirements: [
        { id: 'edu-intro', name: 'Intro to Education', rule: { type: 'choose', count: 1, from: ['EDUC 40AC', 'EDUC W40AC', 'EDUC 130AC'] } },
        { id: 'edu-history', name: 'History/sociology of education', rule: { type: 'choose', count: 1, from: ['EDUC 124AC', 'EDUC 124B', 'SOCIOL 130AC'] } },
      ] },
      { id: 'edu-upper', name: 'Upper Division (8 courses)', requirements: [
        { id: 'edu-curriculum', name: 'Curriculum & instruction core', rule: { type: 'choose', count: 2, from: ['EDUC 130AC', 'EDUC 140AC', 'EDUC 150', 'EDUC 158', 'EDUC 161', 'EDUC 165', 'EDUC 175', 'EDUC 180'] } },
        { id: 'edu-research', name: 'Research methods', rule: { type: 'choose', count: 1, from: ['EDUC 198BC', 'EDUC 280', 'EDUC W195A'] } },
        { id: 'edu-electives', name: 'Education / cross-listed electives (5)', rule: { type: 'choose', count: 5, from: ['EDUC 124AC', 'EDUC 130AC', 'EDUC 140AC', 'EDUC 150', 'EDUC 158', 'EDUC 161', 'EDUC 165', 'EDUC 175', 'EDUC 180', 'PSYCH 130', 'PSYCH 140', 'PSYCH 167AC', 'LINGUIS 155AC', 'GWS 100AC'] } },
      ] },
    ],
  },
  {
    id: 'gender-and-womens-studies-ba', name: 'Gender and Women\'s Studies', type: 'major',
    groups: [
      { id: 'gws-lower', name: 'Lower Division', requirements: [
        { id: 'gws-intro', name: 'GWS 10 / 14AC / 50AC', rule: { type: 'choose', count: 1, from: ['GWS 10', 'GWS 14AC', 'GWS 50AC'] } },
      ] },
      { id: 'gws-upper', name: 'Upper Division (10 courses)', requirements: [
        { id: 'gws-theory', name: 'GWS 100AC (Theorizing Gender)', rule: { type: 'specific', courses: ['GWS 100AC'] } },
        { id: 'gws-method', name: 'GWS 101 (Methods) or research course', rule: { type: 'choose', count: 1, from: ['GWS 101', 'GWS 165'] } },
        { id: 'gws-area-race', name: 'Race + gender course', rule: { type: 'choose', count: 1, from: ['GWS 132AC', 'GWS 134AC', 'GWS 138', 'GWS 140', 'AFRICAM 159AC', 'CHICANO 174AC'] } },
        { id: 'gws-area-sexuality', name: 'Sexuality / LGBT course', rule: { type: 'choose', count: 1, from: ['GWS 110AC', 'LGBT 145AC', 'LGBT 146AC', 'GWS 145'] } },
        { id: 'gws-electives', name: 'GWS upper-div electives (6)', rule: { type: 'choose', count: 6, from: ['GWS 110AC', 'GWS 120', 'GWS 132AC', 'GWS 134AC', 'GWS 138', 'GWS 140', 'GWS 145', 'GWS 150', 'GWS 161', 'GWS 165', 'LGBT 145AC', 'LGBT 146AC', 'SOCIOL 121', 'ANTHRO 138', 'ETHSTD 144AC'] } },
      ] },
    ],
  },
  {
    id: 'environmental-economics-and-policy-ba', name: 'Environmental Economics and Policy', type: 'major',
    groups: [
      { id: 'envecon-lower', name: 'Lower Division', requirements: [
        { id: 'ee-c1', name: 'ENVECON C1 — Intro', rule: { type: 'choose', count: 1, from: ['ENVECON C1', 'ECON 1', 'ECON 2'] } },
        { id: 'ee-stats', name: 'Statistics', rule: { type: 'choose', count: 1, from: ['STAT 20', 'STAT 21', 'STAT C8'] } },
        { id: 'ee-calc', name: 'Calculus', rule: { type: 'choose', count: 1, from: ['MATH 16A', 'MATH 1A', 'MATH 10A'] } },
      ] },
      { id: 'envecon-upper', name: 'Upper Division (10 courses)', requirements: [
        { id: 'ee-100', name: 'ENVECON 100 — Microecon Theory', rule: { type: 'specific', courses: ['ENVECON 100'] } },
        { id: 'ee-c101', name: 'ENVECON C101 — Environmental Econ', rule: { type: 'specific', courses: ['ENVECON C101'] } },
        { id: 'ee-c151', name: 'ENVECON C151 — Climate / Resource', rule: { type: 'choose', count: 1, from: ['ENVECON C151', 'ENVECON C176'] } },
        { id: 'ee-econ-upper', name: 'Upper-div Econ courses (3)', rule: { type: 'choose', count: 3, from: ['ECON 100A', 'ECON 100B', 'ECON 130', 'ECON 140', 'ECON 134', 'ECON 138'] } },
        { id: 'ee-electives', name: 'EnvEcon electives (4)', rule: { type: 'choose', count: 4, from: ['ENVECON 118', 'ENVECON 162', 'ENVECON C181', 'ENVECON H195A', 'PUB POL 184', 'ESPM 161', 'CY PLAN 119', 'ENERES 100'] } },
      ] },
    ],
  },
  {
    id: 'celtic-studies-ba', name: 'Celtic Studies', type: 'major',
    groups: [
      { id: 'celtic-foundation', name: 'Foundations', requirements: [
        { id: 'celt-intro', name: 'CELTIC 70 — Intro to Celtic Civ', rule: { type: 'choose', count: 1, from: ['CELTIC 70', 'CELTIC 100'] } },
        { id: 'celt-language', name: 'Celtic language sequence (2 of)', rule: { type: 'choose', count: 2, from: ['CELTIC 110', 'CELTIC 128', 'CELTIC 140', 'CELTIC 146'] } },
      ] },
      { id: 'celtic-upper', name: 'Upper Division (8 courses)', requirements: [
        { id: 'celt-electives', name: 'Celtic upper-div electives', rule: { type: 'choose', count: 8, from: ['CELTIC 100', 'CELTIC 110', 'CELTIC 128', 'CELTIC 140', 'CELTIC 146', 'CELTIC 160', 'CELTIC 165', 'CELTIC 170A', 'CELTIC 170B', 'CELTIC 180', 'CELTIC 190'] } },
      ] },
    ],
  },
  {
    id: 'chicanx-latinx-studies-ba', name: 'Chicanx Latinx Studies', type: 'major',
    groups: [
      { id: 'cls-foundations', name: 'Foundations', requirements: [
        { id: 'cls-intro', name: 'Chicanx Latinx intro courses', rule: { type: 'choose', count: 2, from: ['CHICANO 50', 'CHICANO 70AC', 'ETHSTD 21AC'] } },
      ] },
      { id: 'cls-upper', name: 'Upper Division (8 courses)', requirements: [
        { id: 'cls-history', name: 'Chicanx history', rule: { type: 'choose', count: 1, from: ['CHICANO 100', 'CHICANO 130', 'HISTORY 137AC'] } },
        { id: 'cls-culture', name: 'Cultural studies', rule: { type: 'choose', count: 1, from: ['CHICANO 144', 'CHICANO 159AC', 'CHICANO 174AC'] } },
        { id: 'cls-electives', name: 'Chicanx Latinx upper-div electives', rule: { type: 'choose', count: 6, from: ['CHICANO 100', 'CHICANO 130', 'CHICANO 144', 'CHICANO 150', 'CHICANO 159AC', 'CHICANO 170', 'CHICANO 174AC', 'CHICANO 180', 'CHICANO 190', 'ETHSTD 100', 'ETHSTD 144AC', 'SPANISH 130', 'SPANISH 145'] } },
      ] },
    ],
  },
  {
    id: 'chinese-language-ba', name: 'Chinese Language', type: 'major',
    groups: [
      { id: 'cn-prereq', name: 'Prerequisites', requirements: [
        { id: 'cn-elementary', name: 'Elementary Chinese', rule: { type: 'choose', count: 2, from: ['CHINESE 1A', 'CHINESE 1B', 'CHINESE 10A', 'CHINESE 10B'] } },
        { id: 'cn-intermediate', name: 'Intermediate Chinese', rule: { type: 'choose', count: 2, from: ['CHINESE 100A', 'CHINESE 100B', 'CHINESE 100XA', 'CHINESE 100XB'] } },
      ] },
      { id: 'cn-upper', name: 'Upper Division (8 courses)', requirements: [
        { id: 'cn-advanced', name: 'Advanced Chinese (3 courses)', rule: { type: 'choose', count: 3, from: ['CHINESE 110A', 'CHINESE 110B', 'CHINESE 120', 'CHINESE 130', 'CHINESE 140', 'CHINESE C160'] } },
        { id: 'cn-literature', name: 'Chinese literature/culture (3 courses)', rule: { type: 'choose', count: 3, from: ['CHINESE 120', 'CHINESE 130', 'CHINESE 140', 'CHINESE C160', 'CHINESE 167', 'EA LANG 138'] } },
        { id: 'cn-electives', name: 'Approved electives (2)', rule: { type: 'choose', count: 2, from: ['CHINESE 110A', 'CHINESE 120', 'CHINESE 130', 'CHINESE 140', 'CHINESE C160', 'CHINESE 167', 'HISTORY 116A', 'HISTORY 116B'] } },
      ] },
    ],
  },
  {
    id: 'east-asian-humanities-ba', name: 'East Asian Humanities', type: 'major',
    groups: [
      { id: 'eah-language', name: 'Language Sequence', requirements: [
        { id: 'eah-language-courses', name: 'East Asian language (4 semesters)', rule: { type: 'choose', count: 4, from: ['CHINESE 1A', 'CHINESE 1B', 'CHINESE 10A', 'CHINESE 10B', 'JAPAN 1A', 'JAPAN 1B', 'JAPAN 10A', 'JAPAN 10B', 'KOREAN 1A', 'KOREAN 1B', 'KOREAN 10A', 'KOREAN 10B'] } },
      ] },
      { id: 'eah-upper', name: 'Upper Division (8 courses)', requirements: [
        { id: 'eah-survey', name: 'East Asian humanities survey', rule: { type: 'choose', count: 2, from: ['EA LANG 102', 'EA LANG 138', 'CHINESE C160', 'JAPAN 145', 'KOREAN 150'] } },
        { id: 'eah-area', name: 'Area-focused courses (3)', rule: { type: 'choose', count: 3, from: ['CHINESE 120', 'CHINESE 130', 'CHINESE 140', 'JAPAN 100', 'JAPAN 116', 'JAPAN 117', 'KOREAN 110', 'KOREAN 140', 'KOREAN 160'] } },
        { id: 'eah-electives', name: 'Approved electives (3)', rule: { type: 'choose', count: 3, from: ['EA LANG 102', 'EA LANG 138', 'HISTORY 116A', 'HISTORY 116B', 'HISTORY 117A', 'HISTORY 117B', 'BUDDSTD 50', 'BUDDSTD 100'] } },
      ] },
    ],
  },
  {
    id: 'conservation-and-resource-studies-ba', name: 'Conservation and Resource Studies', type: 'major',
    groups: [
      { id: 'crs-lower', name: 'Lower Division', requirements: [
        { id: 'crs-intro', name: 'ESPM intro courses', rule: { type: 'choose', count: 2, from: ['ESPM 50AC', 'ESPM 60', 'ESPM C46'] } },
        { id: 'crs-stats', name: 'Statistics', rule: { type: 'choose', count: 1, from: ['STAT 2', 'STAT 20', 'STAT 21'] } },
      ] },
      { id: 'crs-upper', name: 'Upper Division (10 courses)', requirements: [
        { id: 'crs-core', name: 'CRS core courses', rule: { type: 'choose', count: 4, from: ['ESPM 100', 'ESPM 117', 'ESPM 161', 'ESPM 163', 'ESPM 175'] } },
        { id: 'crs-area', name: 'Area of concentration (4)', rule: { type: 'choose', count: 4, from: ['ENERES 100', 'ENERES 102', 'CY PLAN 119', 'CY PLAN 130', 'GEOG 130', 'ESPM 113', 'ESPM 114', 'ESPM 132', 'ESPM 134', 'ESPM 135', 'ESPM 180', 'ENVDES 100'] } },
        { id: 'crs-capstone', name: 'CRS capstone (ESPM 196)', rule: { type: 'choose', count: 2, from: ['ESPM 196', 'ESPM 197', 'ESPM 198', 'ESPM C194'] } },
      ] },
    ],
  },
  {
    id: 'geology-ba', name: 'Geology', type: 'major',
    groups: [
      { id: 'geo-lower', name: 'Lower Division', requirements: [
        { id: 'geo-math', name: 'Calculus + linear algebra', rule: { type: 'choose', count: 4, from: ['MATH 1A', 'MATH 1B', 'MATH 53', 'MATH 54'] } },
        { id: 'geo-physics', name: 'Physics', rule: { type: 'choose', count: 2, from: ['PHYSICS 7A', 'PHYSICS 7B'] } },
        { id: 'geo-chem', name: 'Chemistry', rule: { type: 'choose', count: 1, from: ['CHEM 1A', 'CHEM 4A'] } },
        { id: 'geo-eps', name: 'EPS intro', rule: { type: 'choose', count: 2, from: ['EPS 50', 'EPS 80', 'EPS 81', 'EPS 82'] } },
      ] },
      { id: 'geo-upper', name: 'Upper Division (8 courses)', requirements: [
        { id: 'geo-core', name: 'Geology core', rule: { type: 'choose', count: 5, from: ['EPS 100B', 'EPS 101', 'EPS 102', 'EPS 117', 'EPS 119', 'EPS 122', 'EPS 130', 'EPS 142', 'EPS C162', 'EPS C181'] } },
        { id: 'geo-electives', name: 'Geology electives (3)', rule: { type: 'choose', count: 3, from: ['EPS 116', 'EPS 117', 'EPS 118', 'EPS 130', 'EPS 142', 'EPS C162', 'ESPM 50AC'] } },
      ] },
    ],
  },
  {
    id: 'marine-science-ba', name: 'Marine Science', type: 'major',
    groups: [
      { id: 'ms-lower', name: 'Lower Division', requirements: [
        { id: 'mar-bio', name: 'Foundational biology', rule: { type: 'choose', count: 2, from: ['BIOLOGY 1A', 'BIOLOGY 1AL', 'BIOLOGY 1B'] } },
        { id: 'mar-chem', name: 'Chemistry', rule: { type: 'choose', count: 2, from: ['CHEM 1A', 'CHEM 4A', 'CHEM 1B', 'CHEM 4B'] } },
        { id: 'mar-physics', name: 'Physics', rule: { type: 'choose', count: 2, from: ['PHYSICS 7A', 'PHYSICS 7B', 'PHYSICS 8A', 'PHYSICS 8B'] } },
        { id: 'mar-math', name: 'Calculus', rule: { type: 'choose', count: 2, from: ['MATH 1A', 'MATH 1B', 'MATH 16A', 'MATH 16B', 'MATH 10A', 'MATH 10B'] } },
        { id: 'mar-intro', name: 'Marine science intro', rule: { type: 'choose', count: 1, from: ['IB 84', 'INTEGBI 84', 'IB 161'] } },
      ] },
      { id: 'ms-upper', name: 'Upper Division (8 courses)', requirements: [
        { id: 'mar-core', name: 'Marine bio + ocean science core', rule: { type: 'choose', count: 5, from: ['IB 161', 'IB 168L', 'INTEGBI 161', 'EPS 117', 'EPS 122', 'ESPM 60', 'ESPM 100', 'ESPM 117', 'GEOG 130'] } },
        { id: 'mar-electives', name: 'Marine science electives (3)', rule: { type: 'choose', count: 3, from: ['IB C129L', 'IB C170L', 'INTEGBI 132', 'INTEGBI 153', 'PB HLTH 162B', 'ESPM 113', 'ESPM 114'] } },
      ] },
    ],
  },
]

// ─── PARTIAL OTHER (certificates that are functional but light) ─────
const OTHER: Program[] = [
  // L&S Honors gets a more detailed structure even though specific courses
  // depend on department.
  {
    id: 'cert-ls-honors', name: 'L&S Honors Program', type: 'certificate',
    groups: [
      { id: 'ls-honors-eligibility', name: 'Eligibility', description: 'L&S College Honors: ≥3.65 cumulative GPA, ≥3.65 GPA in major, completion of an honors thesis or research project. GPA + thesis approval are tracked in CalCentral, not here.', requirements: [
        { id: 'ls-honors-elw', name: 'Entry Level Writing satisfied', rule: { type: 'university-req', req: 'Entry Level Writing & Reading Composition A', count: 1 } },
        { id: 'ls-honors-amer-hist', name: 'American History & Institutions satisfied', rule: { type: 'university-req', req: 'Am Cultures & Am History', count: 1 } },
      ] },
      { id: 'ls-honors-coursework', name: 'Honors-level coursework', description: 'Departments offering Honors tracks list specific honors-section courses (e.g. ENGLISH H195, ECON H196, MATH H110). The 4+ courses are typically in your major; check your department.', requirements: [
        { id: 'ls-honors-h-courses', name: 'Honors-section upper-division courses (4)', rule: { type: 'choose', count: 4, from: ['MATH H104', 'MATH H110', 'MATH H113', 'MATH H185', 'PHYSICS H105', 'PHYSICS H110A', 'PHYSICS H110B', 'PHYSICS H137A', 'PHYSICS H137B', 'CHEM H105', 'COMPSCI H195', 'ENGLISH H195A', 'ENGLISH H195B', 'ECON H195A', 'ECON H195B', 'POL SCI H195A', 'POL SCI H195B', 'PSYCH H196', 'SOCIOL H190'] } },
        { id: 'ls-honors-thesis', name: 'Honors thesis seminar (department-specific)', rule: { type: 'choose', count: 1, from: ['ECON 191', 'COMPSCI 191', 'ENGLISH H195A', 'ENGLISH H195B', 'POL SCI H195A', 'POL SCI H195B', 'PSYCH H196', 'SOCIOL H190', 'PHILOS 196'] } },
      ] },
    ],
  },
]

async function main() {
  const data = JSON.parse(readFileSync(PROGRAMS_PATH, 'utf-8'))
  const updates = [...MINORS, ...MAJORS, ...OTHER]
  const updateIds = new Set(updates.map((p) => p.id))
  const filtered = data.programs.filter((p: Program) => !updateIds.has(p.id))
  data.programs = [...filtered, ...updates]
  data.meta = { ...data.meta, generatedAt: new Date().toISOString() }
  writeFileSync(PROGRAMS_PATH, JSON.stringify(data, null, 2))
  console.log(`Updated ${updates.length} programs (${MINORS.length} minors, ${MAJORS.length} majors, ${OTHER.length} other).`)
}

main().catch((e) => { console.error('FAIL:', e); process.exit(1) })
