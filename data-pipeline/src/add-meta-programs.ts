/**
 * Adds the meta-programs that aren't berkeleytime.com majors/minors:
 *  • Berkeley University Requirements (campus-wide for all undergrads)
 *  • College of Engineering H/SS breadth
 *  • Haas (UBA) breadth
 *  • College of Natural Resources general ed
 *  • College of Environmental Design general ed
 *  • College of Chemistry general ed
 *  • Sample certificates (L&S Honors, Public Service)
 *
 * Run idempotently — replaces existing meta entries by id.
 */
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface Program {
  id: string
  name: string
  type: 'major' | 'minor' | 'college' | 'certificate' | 'university'
  groups: any[]
}

const META_PROGRAMS: Program[] = [
  // ─── UNIVERSITY-WIDE ────────────────────────────────────────────────
  {
    id: 'berkeley-university-reqs',
    name: 'Berkeley University Requirements',
    type: 'university',
    groups: [
      {
        id: 'campus-wide',
        name: 'Campus-Wide Requirements',
        description: 'Five requirements every Berkeley undergraduate must satisfy regardless of major or college.',
        requirements: [
          {
            id: 'total-units',
            name: 'Minimum 120 Units to Graduate',
            description: 'A baccalaureate degree requires at least 120 semester units of coursework.',
            rule: { type: 'total-units', units: 120 },
          },
          {
            id: 'senior-residence',
            name: 'Senior Residence (24 units)',
            description: 'After reaching senior standing (90 units), at least 24 of the remaining units must be completed in residence at Berkeley.',
            rule: { type: 'senior-residence', units: 24 },
          },
          {
            id: 'elwr',
            name: 'Entry Level Writing Requirement (ELWR)',
            description: 'Must be satisfied before completing 30 units. Met by AP English Lang/Lit, IB English HL, SAT/ACT essay scores, or by passing College Writing R1A or English R1A.',
            rule: { type: 'university-req', req: 'Entry Level Writing & Reading Composition A', count: 1 },
          },
          {
            id: 'amer-hist-inst',
            name: 'American History & Institutions (AH&I)',
            description: 'One course covering both American History AND American Institutions. May also be satisfied by an approved high-school course taken in the U.S.',
            rule: { type: 'university-req', req: 'Am Cultures & Am History', count: 1 },
          },
          {
            id: 'amer-cultures',
            name: 'American Cultures (AC)',
            description: 'One course officially designated AC by Berkeley\'s American Cultures Center. Required of every undergraduate regardless of college.',
            rule: { type: 'breadth', breadth: 'American Cultures', count: 1 },
          },
        ],
      },
    ],
  },

  // ─── COLLEGE OF ENGINEERING ─────────────────────────────────────────
  {
    id: 'coe-hss-breadth',
    name: 'College of Engineering · H/SS Breadth',
    type: 'college',
    groups: [
      {
        id: 'hss-six',
        name: 'Six Humanities & Social Studies Courses',
        description: 'CoE undergraduates must complete 6 H/SS courses (≥18 units total). Specific structural rules: 2 courses upper-division, 2 in the same series/department, 2 covering different breadth areas. This planner counts the 6 minimum; consult your advisor for the structural rules.',
        requirements: [
          {
            id: 'hss-arts-lit',
            name: 'Arts & Literature',
            rule: { type: 'breadth', breadth: 'Arts & Literature', count: 1 },
          },
          {
            id: 'hss-historical',
            name: 'Historical Studies',
            rule: { type: 'breadth', breadth: 'Historical Studies', count: 1 },
          },
          {
            id: 'hss-international',
            name: 'International Studies',
            rule: { type: 'breadth', breadth: 'International Studies', count: 1 },
          },
          {
            id: 'hss-philosophy',
            name: 'Philosophy & Values',
            rule: { type: 'breadth', breadth: 'Philosophy & Values', count: 1 },
          },
          {
            id: 'hss-social',
            name: 'Social & Behavioral Sciences',
            rule: { type: 'breadth', breadth: 'Social & Behavioral Sciences', count: 1 },
          },
          {
            id: 'hss-rc',
            name: 'Reading & Composition (R1A or R1B)',
            rule: {
              type: 'choose',
              count: 1,
              from: [
                'COLWRIT R1A', 'COLWRIT R1B', 'COMLIT R1A', 'COMLIT R1B',
                'ENGLISH R1A', 'ENGLISH R1B', 'RHETOR R1A', 'RHETOR R1B',
                'COLLEGE 1A', 'COLLEGE 1B',
              ],
            },
          },
        ],
      },
    ],
  },

  // ─── HAAS UBA ───────────────────────────────────────────────────────
  {
    id: 'haas-uba-breadth',
    name: 'Haas Undergraduate Program · Breadth',
    type: 'college',
    groups: [
      {
        id: 'haas-breadth',
        name: 'UBA Breadth Requirements',
        description: 'UBA students complete 7 breadth areas alongside Haas core courses. Reading & Composition, Quantitative Reasoning, and Foreign Language are pre-Haas requirements.',
        requirements: [
          { id: 'haas-arts-lit', name: 'Arts & Literature', rule: { type: 'breadth', breadth: 'Arts & Literature', count: 1 } },
          { id: 'haas-bio', name: 'Biological Science', rule: { type: 'breadth', breadth: 'Biological Science', count: 1 } },
          { id: 'haas-historical', name: 'Historical Studies', rule: { type: 'breadth', breadth: 'Historical Studies', count: 1 } },
          { id: 'haas-international', name: 'International Studies', rule: { type: 'breadth', breadth: 'International Studies', count: 1 } },
          { id: 'haas-philosophy', name: 'Philosophy & Values', rule: { type: 'breadth', breadth: 'Philosophy & Values', count: 1 } },
          { id: 'haas-physical', name: 'Physical Science', rule: { type: 'breadth', breadth: 'Physical Science', count: 1 } },
          { id: 'haas-social', name: 'Social & Behavioral Sciences', rule: { type: 'breadth', breadth: 'Social & Behavioral Sciences', count: 1 } },
        ],
      },
    ],
  },

  // ─── COLLEGE OF NATURAL RESOURCES ───────────────────────────────────
  {
    id: 'cnr-breadth',
    name: 'CNR · College Requirements',
    type: 'college',
    groups: [
      {
        id: 'cnr-essential',
        name: 'Essential Skills',
        description: 'CNR-specific essentials in addition to UC Berkeley\'s campus-wide requirements.',
        requirements: [
          {
            id: 'cnr-rc-a',
            name: 'Reading & Composition Part A',
            rule: { type: 'breadth', breadth: 'Reading and Composition A', count: 1 },
          },
          {
            id: 'cnr-rc-b',
            name: 'Reading & Composition Part B',
            rule: { type: 'breadth', breadth: 'Reading and Composition B', count: 1 },
          },
        ],
      },
      {
        id: 'cnr-breadth-areas',
        name: 'CNR Breadth Areas (7)',
        description: 'CNR undergraduates complete one course in each of seven breadth areas, mirroring the L&S structure but managed by the CNR Office of Instruction & Student Affairs.',
        requirements: [
          { id: 'cnr-arts-lit', name: 'Arts & Literature', rule: { type: 'breadth', breadth: 'Arts & Literature', count: 1 } },
          { id: 'cnr-bio', name: 'Biological Science', rule: { type: 'breadth', breadth: 'Biological Science', count: 1 } },
          { id: 'cnr-historical', name: 'Historical Studies', rule: { type: 'breadth', breadth: 'Historical Studies', count: 1 } },
          { id: 'cnr-international', name: 'International Studies', rule: { type: 'breadth', breadth: 'International Studies', count: 1 } },
          { id: 'cnr-philosophy', name: 'Philosophy & Values', rule: { type: 'breadth', breadth: 'Philosophy & Values', count: 1 } },
          { id: 'cnr-physical', name: 'Physical Science', rule: { type: 'breadth', breadth: 'Physical Science', count: 1 } },
          { id: 'cnr-social', name: 'Social & Behavioral Sciences', rule: { type: 'breadth', breadth: 'Social & Behavioral Sciences', count: 1 } },
        ],
      },
    ],
  },

  // ─── COLLEGE OF ENVIRONMENTAL DESIGN ────────────────────────────────
  {
    id: 'ced-breadth',
    name: 'CED · College Requirements',
    type: 'college',
    groups: [
      {
        id: 'ced-essential',
        name: 'Essential Skills',
        requirements: [
          {
            id: 'ced-rc-a',
            name: 'Reading & Composition Part A',
            rule: { type: 'breadth', breadth: 'Reading and Composition A', count: 1 },
          },
          {
            id: 'ced-rc-b',
            name: 'Reading & Composition Part B',
            rule: { type: 'breadth', breadth: 'Reading and Composition B', count: 1 },
          },
          {
            id: 'ced-quant',
            name: 'Quantitative Reasoning',
            rule: {
              type: 'choose', count: 1,
              from: ['MATH 1A', 'MATH 1B', 'MATH 16A', 'MATH 16B', 'MATH 10A', 'MATH 10B', 'STAT 2', 'STAT 20', 'STAT 21', 'DATA C8', 'COMPSCI 61A', 'COMPSCI C8'],
            },
          },
        ],
      },
      {
        id: 'ced-breadth-areas',
        name: 'CED Breadth Areas',
        description: 'CED follows the seven L&S breadth areas with the addition of design-focused electives managed by the college.',
        requirements: [
          { id: 'ced-arts-lit', name: 'Arts & Literature', rule: { type: 'breadth', breadth: 'Arts & Literature', count: 1 } },
          { id: 'ced-bio', name: 'Biological Science', rule: { type: 'breadth', breadth: 'Biological Science', count: 1 } },
          { id: 'ced-historical', name: 'Historical Studies', rule: { type: 'breadth', breadth: 'Historical Studies', count: 1 } },
          { id: 'ced-international', name: 'International Studies', rule: { type: 'breadth', breadth: 'International Studies', count: 1 } },
          { id: 'ced-philosophy', name: 'Philosophy & Values', rule: { type: 'breadth', breadth: 'Philosophy & Values', count: 1 } },
          { id: 'ced-physical', name: 'Physical Science', rule: { type: 'breadth', breadth: 'Physical Science', count: 1 } },
          { id: 'ced-social', name: 'Social & Behavioral Sciences', rule: { type: 'breadth', breadth: 'Social & Behavioral Sciences', count: 1 } },
        ],
      },
    ],
  },

  // ─── COLLEGE OF CHEMISTRY ───────────────────────────────────────────
  {
    id: 'coc-breadth',
    name: 'College of Chemistry · College Requirements',
    type: 'college',
    groups: [
      {
        id: 'coc-essential',
        name: 'Essential Skills',
        requirements: [
          {
            id: 'coc-rc-a',
            name: 'Reading & Composition Part A',
            rule: { type: 'breadth', breadth: 'Reading and Composition A', count: 1 },
          },
          {
            id: 'coc-rc-b',
            name: 'Reading & Composition Part B',
            rule: { type: 'breadth', breadth: 'Reading and Composition B', count: 1 },
          },
        ],
      },
      {
        id: 'coc-hss',
        name: 'Humanities & Social Sciences (6 courses)',
        description: 'CoC undergrads take 6 H/SS courses spanning the L&S breadth areas. Same structural rules as CoE H/SS apply.',
        requirements: [
          { id: 'coc-arts-lit', name: 'Arts & Literature', rule: { type: 'breadth', breadth: 'Arts & Literature', count: 1 } },
          { id: 'coc-historical', name: 'Historical Studies', rule: { type: 'breadth', breadth: 'Historical Studies', count: 1 } },
          { id: 'coc-international', name: 'International Studies', rule: { type: 'breadth', breadth: 'International Studies', count: 1 } },
          { id: 'coc-philosophy', name: 'Philosophy & Values', rule: { type: 'breadth', breadth: 'Philosophy & Values', count: 1 } },
          { id: 'coc-social', name: 'Social & Behavioral Sciences', rule: { type: 'breadth', breadth: 'Social & Behavioral Sciences', count: 1 } },
          { id: 'coc-american-cultures', name: 'American Cultures (built into H/SS)', rule: { type: 'breadth', breadth: 'American Cultures', count: 1 } },
        ],
      },
    ],
  },

  // ─── CERTIFICATES ────────────────────────────────────────────────────
  // ─── L&S COLLEGE HONORS ─────────────────────────────────────────────
  {
    id: 'cert-ls-honors',
    name: 'L&S Honors Program',
    type: 'certificate',
    groups: [
      {
        id: 'ls-honors',
        name: 'College Honors Requirements',
        description: 'L&S College Honors recognizes graduates with high cumulative GPAs (≥3.7 typically) plus completion of an honors thesis or research project. This planner tracks the honors-eligible coursework requirement; GPA + thesis approval happen in CalCentral.',
        requirements: [
          {
            id: 'ls-honors-coursework',
            name: 'Honors-eligible upper-division coursework (≥4 courses)',
            description: 'Departments offering Honors tracks: take ≥4 upper-div courses in the major + an honors thesis seminar.',
            rule: { type: 'category', from: [], count: 4 },
          },
        ],
      },
    ],
  },

  // ─── CAL CORPS PUBLIC SERVICE ───────────────────────────────────────
  {
    id: 'cert-public-service',
    name: 'Cal Corps Public Service Internship Certificate',
    type: 'certificate',
    groups: [
      {
        id: 'public-service',
        name: 'Public Service Coursework + Hours',
        description: 'Cal Corps Public Service Internship Certificate (Public Service Center): 250+ hours of community service, two public-service-themed courses, and a capstone reflection.',
        requirements: [
          {
            id: 'public-service-coursework',
            name: 'Two public-service themed courses',
            rule: {
              type: 'choose', count: 2,
              from: [
                'PUB POL 101', 'PUB POL 157', 'POL SCI 167AC', 'POL SCI 137',
                'EDUC 130AC', 'GWS 100AC', 'SOCIOL 145', 'SOCIOL 137AC',
                'CY PLAN 110', 'AFRICAM 107', 'LEGALST 132AC',
              ],
            },
          },
        ],
      },
    ],
  },

  // ─── DATA SCIENCE DOMAIN EMPHASIS ───────────────────────────────────
  {
    id: 'cert-data-science-domain',
    name: 'Data Science Domain Emphasis',
    type: 'certificate',
    groups: [
      {
        id: 'ds-foundations',
        name: 'Foundations',
        description: 'Data Science domain emphasis (paired with a non-DS major). Students complete the foundations + a domain emphasis from any of the 21+ approved tracks.',
        requirements: [
          {
            id: 'ds-foundations-courses',
            name: 'Data Science Foundations',
            rule: { type: 'choose', count: 3, from: ['DATA C8', 'DATA C100', 'COMPSCI 61A', 'STAT 20', 'STAT 21', 'STAT 88'] },
          },
        ],
      },
      {
        id: 'ds-domain',
        name: 'Domain Emphasis (1 of 21+ tracks)',
        description: 'Choose one Data Science domain track. Common picks: Computational Biology, Geospatial Data, Linguistics, Social Science.',
        requirements: [
          {
            id: 'ds-domain-courses',
            name: 'Domain Track Courses (3)',
            rule: {
              type: 'choose', count: 3,
              from: [
                'DATA 102', 'DATA 104', 'DATA 140', 'DATA 198',
                'COMPSCI 189', 'STAT 154',
                'LINGUIS 110', 'LINGUIS C160',
                'GEOG C160', 'EPS C162',
                'COGSCI 131', 'PSYCH 101',
                'BIOENG C146', 'MCELLBI 102',
              ],
            },
          },
        ],
      },
    ],
  },

  // ─── SCET — CERTIFICATE IN ENTREPRENEURSHIP & TECHNOLOGY ────────────
  {
    id: 'cert-scet-cet',
    name: 'SCET · Certificate in Entrepreneurship & Technology (CET)',
    type: 'certificate',
    groups: [
      {
        id: 'scet-cet-core',
        name: 'Core',
        description: 'Sutardja Center for Entrepreneurship & Technology (CET) certificate: complete the Berkeley Method of Entrepreneurship core + 3 SCET courses spanning ≥9 units. Verify the latest list at scet.berkeley.edu/students/certificates.',
        requirements: [
          {
            id: 'scet-cet-bme',
            name: 'Berkeley Method of Entrepreneurship (UGBA 192T)',
            rule: { type: 'specific', courses: ['UGBA 192T'] },
          },
          {
            id: 'scet-cet-electives',
            name: 'SCET Electives (3 courses, ≥9 units)',
            rule: {
              type: 'choose', count: 3,
              from: [
                'UGBA 192P', 'UGBA 192A', 'UGBA 192R',
                'UGBA 195S', 'UGBA 195T', 'UGBA 196',
                'IND ENG 185', 'IND ENG 190E',
                'COMPSCI 195', 'COMPSCI 294',
                'DESINV 15', 'DESINV 22', 'DESINV 90',
              ],
            },
          },
        ],
      },
    ],
  },

  // ─── SCET — DESIGN INNOVATION ───────────────────────────────────────
  {
    id: 'cert-scet-design-innovation',
    name: 'SCET · Certificate in Design Innovation',
    type: 'certificate',
    groups: [
      {
        id: 'scet-design',
        name: 'Design Innovation Coursework',
        description: 'Berkeley Design Innovation Certificate (BDI). Four courses in design thinking + studio + capstone. Track managed by SCET / Jacobs Institute.',
        requirements: [
          {
            id: 'scet-design-foundation',
            name: 'Design Foundation (DESINV 15 or 22)',
            rule: { type: 'choose', count: 1, from: ['DESINV 15', 'DESINV 22', 'DESINV 21'] },
          },
          {
            id: 'scet-design-studio',
            name: 'Design Studio Electives (3 of)',
            rule: {
              type: 'choose', count: 3,
              from: [
                'DESINV 90', 'DESINV 90E', 'DESINV 95', 'DESINV 190',
                'NWMEDIA 151AC', 'INFO 214', 'NWMEDIA 190',
                'ARCH 100A', 'ARCH 100B', 'CIVENG 11', 'IND ENG 110',
              ],
            },
          },
        ],
      },
    ],
  },

  // ─── SCET — INNOVATION, TECH & SUSTAINABLE DEV ──────────────────────
  {
    id: 'cert-scet-itsd',
    name: 'SCET · Certificate in Innovation, Tech & Sustainable Development',
    type: 'certificate',
    groups: [
      {
        id: 'scet-itsd',
        name: 'Sustainability + Tech Coursework',
        description: 'SCET certificate combining sustainability, global development, and technology innovation.',
        requirements: [
          {
            id: 'scet-itsd-courses',
            name: 'Approved courses (4)',
            rule: {
              type: 'choose', count: 4,
              from: [
                'UGBA 192T', 'UGBA 192P', 'UGBA 195S',
                'GLOBAL 150', 'GLOBAL 175', 'GLOBAL C124', 'IAS 102',
                'ENERES 100', 'ENERES 102', 'ENERES 175',
                'ESPM 161', 'ESPM C167', 'CY PLAN 119',
                'ECON C175', 'PUB POL 184',
              ],
            },
          },
        ],
      },
    ],
  },

  // ─── BERKELEY CHANGEMAKER ───────────────────────────────────────────
  {
    id: 'cert-berkeley-changemaker',
    name: 'Berkeley Changemaker Certificate',
    type: 'certificate',
    groups: [
      {
        id: 'changemaker-core',
        name: 'Changemaker Coursework',
        description: 'Berkeley Changemaker Certificate (L&S): three Changemaker-designated courses + a high-impact final project. Many Changemaker courses are cross-listed; verify designation each semester at changemaker.berkeley.edu.',
        requirements: [
          {
            id: 'changemaker-foundation',
            name: 'Berkeley Changemaker Foundation Course',
            description: 'L&S 1B "Berkeley Changemaker" or another foundation Changemaker course.',
            rule: { type: 'choose', count: 1, from: ['L&S 1B', 'UGBA 192T', 'BIO 1A', 'GWS 110AC'] },
          },
          {
            id: 'changemaker-electives',
            name: 'Changemaker-designated Electives (2)',
            rule: {
              type: 'choose', count: 2,
              from: [
                'UGBA 152', 'UGBA 192T', 'UGBA 195T',
                'PUB POL 184', 'PUB POL 157',
                'EDUC 124AC', 'EDUC 130AC',
                'CY PLAN 110', 'CY PLAN 119',
                'ENERES 100', 'ESPM 161',
                'GLOBAL 150', 'POL SCI 167AC',
                'SOCIOL 137AC', 'SOCIOL 145',
              ],
            },
          },
        ],
      },
    ],
  },

  // ─── PUBLIC HEALTH CERTIFICATE ──────────────────────────────────────
  {
    id: 'cert-public-health',
    name: 'Berkeley Public Health Certificate',
    type: 'certificate',
    groups: [
      {
        id: 'public-health',
        name: 'Public Health Foundations',
        description: 'School of Public Health undergraduate certificate. 5 courses covering the breadth of public health.',
        requirements: [
          {
            id: 'ph-intro',
            name: 'Introduction to Public Health (PB HLTH 150A or W150A)',
            rule: { type: 'choose', count: 1, from: ['PBHLTH 150A', 'PBHLTH W150A', 'PBHLTH 200B'] },
          },
          {
            id: 'ph-electives',
            name: 'PH-themed electives (4)',
            rule: {
              type: 'choose', count: 4,
              from: [
                'PBHLTH 101', 'PBHLTH 116', 'PBHLTH 126',
                'PBHLTH 142', 'PBHLTH 150B', 'PBHLTH 150D', 'PBHLTH 150E',
                'PBHLTH 162A', 'PBHLTH 162B',
                'PBHLTH 170', 'PBHLTH 181',
                'NUSCTX 10', 'NUSCTX 103', 'NUSCTX 110',
                'CYPLAN 117AC', 'CYPLAN 120',
                'STAT 21', 'STAT 88',
              ],
            },
          },
        ],
      },
    ],
  },

  // ─── BIOENGINEERING / BIOENERGY ─────────────────────────────────────
  {
    id: 'cert-bioenergy',
    name: 'Bioenergy & Sustainable Chemical Technologies Certificate',
    type: 'certificate',
    groups: [
      {
        id: 'bioenergy',
        name: 'Bioenergy Coursework',
        description: 'Interdisciplinary undergraduate certificate combining chemistry, bioengineering, and policy around renewable energy. Anchored in the Energy & Resources Group / Bioengineering.',
        requirements: [
          {
            id: 'bioenergy-courses',
            name: 'Approved courses (4)',
            rule: {
              type: 'choose', count: 4,
              from: [
                'ENERES 100', 'ENERES 102', 'ENERES 175',
                'BIOENG 100', 'BIOENG 102', 'BIOENG 110',
                'CHEM ENG 150A', 'CHEM ENG 178',
                'PLANTBI 135', 'PLANTBI C124',
                'ESPM C167', 'ESPM 175',
              ],
            },
          },
        ],
      },
    ],
  },

  // ─── BIOETHICS ──────────────────────────────────────────────────────
  {
    id: 'cert-bioethics',
    name: 'Bioethics Certificate',
    type: 'certificate',
    groups: [
      {
        id: 'bioethics',
        name: 'Bioethics Coursework',
        description: 'Interdisciplinary certificate co-sponsored by the philosophy and biology departments. Covers ethics in biomedical research, biotechnology, and clinical practice.',
        requirements: [
          {
            id: 'bioethics-core',
            name: 'Bioethics core course',
            rule: { type: 'choose', count: 1, from: ['PHILOS 104', 'PHILOS 106', 'PHILOS 107', 'PB HLTH 116'] },
          },
          {
            id: 'bioethics-electives',
            name: 'Approved electives (3)',
            rule: {
              type: 'choose', count: 3,
              from: [
                'PHILOS 102', 'PHILOS 103', 'PHILOS C107',
                'MCELLBI 32', 'MCELLBI C148',
                'PB HLTH 116', 'PB HLTH 162B',
                'GWS 100AC', 'LEGALST 138', 'ANTHRO 138',
              ],
            },
          },
        ],
      },
    ],
  },

  // ─── ENGINEERING LEADERSHIP (FUNG) ──────────────────────────────────
  {
    id: 'cert-engineering-leadership',
    name: 'Engineering Leadership Professional Certificate (Fung)',
    type: 'certificate',
    groups: [
      {
        id: 'eng-leadership',
        name: 'Engineering Leadership Coursework',
        description: 'Fung Institute for Engineering Leadership undergraduate professional certificate. Five courses covering leadership, communication, project management, and engineering ethics.',
        requirements: [
          {
            id: 'fung-core',
            name: 'Fung Core',
            rule: { type: 'choose', count: 2, from: ['ENG 198', 'ENG 198E', 'ENG 198F', 'IND ENG 95', 'IND ENG 185'] },
          },
          {
            id: 'fung-electives',
            name: 'Leadership / professional skills electives (3)',
            rule: {
              type: 'choose', count: 3,
              from: [
                'IND ENG 110', 'IND ENG 115', 'IND ENG 165',
                'UGBA 105', 'UGBA 152', 'UGBA 196',
                'COMPSCI 195', 'COMPSCI 294',
                'ENG 195F',
              ],
            },
          },
        ],
      },
    ],
  },

  // ─── CONSERVATION & RESOURCE STUDIES ────────────────────────────────
  {
    id: 'cert-conservation-resource',
    name: 'Conservation & Resource Studies Certificate',
    type: 'certificate',
    groups: [
      {
        id: 'crs',
        name: 'Conservation Coursework',
        description: 'CNR-administered undergraduate certificate (separate from the CRS major) for students in any college who want a structured environmental track.',
        requirements: [
          {
            id: 'crs-courses',
            name: 'Approved CRS courses (4)',
            rule: {
              type: 'choose', count: 4,
              from: [
                'ESPM 50AC', 'ESPM 60', 'ESPM 100',
                'ESPM 117', 'ESPM 161', 'ESPM 163',
                'ENERES 100', 'ENERES 102',
                'CY PLAN 119', 'CY PLAN 130',
                'ENVDES 100',
              ],
            },
          },
        ],
      },
    ],
  },

  // ─── SUSTAINABILITY ─────────────────────────────────────────────────
  {
    id: 'cert-sustainability',
    name: 'Berkeley Sustainability Certificate',
    type: 'certificate',
    groups: [
      {
        id: 'sustainability',
        name: 'Sustainability Coursework',
        description: 'Cross-college sustainability certificate. Five courses spanning environmental science, policy, and design.',
        requirements: [
          {
            id: 'sus-foundations',
            name: 'Sustainability foundations',
            rule: { type: 'choose', count: 2, from: ['ESPM 50AC', 'ESPM 60', 'ENERES 100', 'ENVDES 1', 'CY PLAN 119'] },
          },
          {
            id: 'sus-electives',
            name: 'Sustainability-themed electives (3)',
            rule: {
              type: 'choose', count: 3,
              from: [
                'ESPM 100', 'ESPM 161', 'ESPM 163', 'ESPM 175',
                'ENERES 102', 'ENERES 175',
                'CY PLAN 119', 'CY PLAN 130', 'CY PLAN 160',
                'GLOBAL 175', 'PUB POL 184',
                'ARCH 140',
              ],
            },
          },
        ],
      },
    ],
  },

  // ─── BLUM CENTER — GLOBAL POVERTY & PRACTICE MINOR/CERT ─────────────
  {
    id: 'cert-gpp',
    name: 'Blum Center · Global Poverty & Practice (GPP) Certificate',
    type: 'certificate',
    groups: [
      {
        id: 'gpp',
        name: 'GPP Coursework + Practice',
        description: 'Global Poverty & Practice undergraduate program (Blum Center). 5 courses + a 240-hour Practice Experience. Available as a minor; this entry tracks the coursework only.',
        requirements: [
          {
            id: 'gpp-gateway',
            name: 'GPP Gateway',
            rule: { type: 'choose', count: 1, from: ['GPP 115', 'GPP 105'] },
          },
          {
            id: 'gpp-electives',
            name: 'GPP-approved electives (3)',
            rule: {
              type: 'choose', count: 3,
              from: [
                'GPP 110', 'GPP 115', 'GPP 165', 'GPP 197',
                'IAS 102', 'IAS 110',
                'PB HLTH 150A', 'PB HLTH 150E',
                'AFRICAM 107', 'AFRICAM 159AC',
                'CY PLAN 110', 'CY PLAN 115',
                'SOCIOL 130AC', 'SOCIOL 145',
              ],
            },
          },
          {
            id: 'gpp-capstone',
            name: 'GPP Capstone (GPP 196)',
            rule: { type: 'specific', courses: ['GPP 196'] },
          },
        ],
      },
    ],
  },

  // ─── HUMAN RIGHTS INTERDISCIPLINARY MINOR/CERT ──────────────────────
  {
    id: 'cert-human-rights',
    name: 'Human Rights Interdisciplinary Certificate',
    type: 'certificate',
    groups: [
      {
        id: 'human-rights',
        name: 'Human Rights Coursework',
        description: 'Cross-college interdisciplinary certificate run through the Human Rights Center. Five courses spanning law, history, and political science.',
        requirements: [
          {
            id: 'hr-foundations',
            name: 'Human Rights foundations',
            rule: { type: 'choose', count: 1, from: ['LEGALST 132AC', 'POL SCI 109H', 'HISTORY 124B'] },
          },
          {
            id: 'hr-electives',
            name: 'Approved electives (4)',
            rule: {
              type: 'choose', count: 4,
              from: [
                'LEGALST 132AC', 'LEGALST 138', 'LEGALST 155',
                'POL SCI 109H', 'POL SCI 137', 'POL SCI 167AC',
                'GWS 100AC', 'GWS 110AC',
                'AFRICAM 107', 'AFRICAM 159AC',
                'GLOBAL 150', 'IAS 102',
                'ANTHRO 138', 'SOCIOL 137AC',
              ],
            },
          },
        ],
      },
    ],
  },

  // ─── EDUCATION (CalTeach / Dev Studies) ─────────────────────────────
  {
    id: 'cert-calteach',
    name: 'Cal Teach Math/Science Teaching Certificate',
    type: 'certificate',
    groups: [
      {
        id: 'calteach',
        name: 'Cal Teach Coursework',
        description: 'Cal Teach: prepares Berkeley undergrads in STEM majors to become K-12 math or science teachers. Five courses + classroom field placements.',
        requirements: [
          {
            id: 'calteach-intro',
            name: 'Intro to Math & Science Teaching (UGIS / EDUC 130)',
            rule: { type: 'choose', count: 1, from: ['UGIS 130', 'EDUC 130AC', 'EDUC 130'] },
          },
          {
            id: 'calteach-courses',
            name: 'Cal Teach methods + content (4)',
            rule: {
              type: 'choose', count: 4,
              from: [
                'EDUC 124AC', 'EDUC 124B', 'EDUC 130AC', 'EDUC 140AC',
                'UGIS 130', 'UGIS 140',
                'MATH 151', 'MATH 152', 'MATH 153',
                'BIO 1AL', 'PHYSICS 8A',
              ],
            },
          },
        ],
      },
    ],
  },

  // ─── DEMOGRAPHY MINOR / CERT ────────────────────────────────────────
  {
    id: 'cert-demography',
    name: 'Demography Certificate',
    type: 'certificate',
    groups: [
      {
        id: 'demography',
        name: 'Demography Coursework',
        description: 'Department of Demography certificate. Five courses spanning population science, statistics, and policy.',
        requirements: [
          {
            id: 'demog-core',
            name: 'Demography Core (DEMOG 110 or C126)',
            rule: { type: 'choose', count: 1, from: ['DEMOG 110', 'DEMOG C126', 'SOCIOL 5'] },
          },
          {
            id: 'demog-electives',
            name: 'Approved electives (4)',
            rule: {
              type: 'choose', count: 4,
              from: [
                'DEMOG 110', 'DEMOG C126', 'DEMOG 145',
                'STAT 20', 'STAT 21', 'STAT 88',
                'ECON 100A', 'ECON 100B', 'ECON 130', 'ECON 151',
                'SOCIOL 130AC', 'SOCIOL 5',
                'CY PLAN 119',
              ],
            },
          },
        ],
      },
    ],
  },

  // ─── COMPUTATIONAL ECONOMICS / FINANCE ──────────────────────────────
  {
    id: 'cert-comp-econ',
    name: 'Computational Economics & Finance Certificate',
    type: 'certificate',
    groups: [
      {
        id: 'comp-econ',
        name: 'Computational Economics Coursework',
        description: 'Cross-listed certificate for econ majors who want a computational / data-science overlay. Five courses combining economics and CS / statistics.',
        requirements: [
          {
            id: 'ce-foundations',
            name: 'Foundations',
            rule: { type: 'choose', count: 2, from: ['ECON 140', 'ECON 141', 'ECON 142', 'STAT 88', 'DATA C8'] },
          },
          {
            id: 'ce-electives',
            name: 'Computational electives (3)',
            rule: {
              type: 'choose', count: 3,
              from: [
                'COMPSCI 61A', 'COMPSCI 61B', 'COMPSCI 70',
                'COMPSCI 188', 'COMPSCI 189',
                'STAT 134', 'STAT 135', 'STAT 154',
                'DATA C100', 'DATA 102', 'DATA 140',
                'ECON 119', 'ECON 138', 'ECON 191',
              ],
            },
          },
        ],
      },
    ],
  },
]

async function main() {
  const path = join(__dirname, '..', '..', 'public', 'data', 'programs.json')
  const data = JSON.parse(readFileSync(path, 'utf-8'))
  const existingIds = new Set(META_PROGRAMS.map((p) => p.id))
  // Strip any old versions of these meta programs.
  const filtered = data.programs.filter((p: Program) => !existingIds.has(p.id))
  // Append fresh meta programs.
  const merged = [...filtered, ...META_PROGRAMS]
  data.programs = merged
  data.meta = { ...data.meta, generatedAt: new Date().toISOString() }
  writeFileSync(path, JSON.stringify(data, null, 2))
  console.log(`Updated programs.json — total: ${merged.length} (added/refreshed: ${META_PROGRAMS.length})`)
  console.log(`Meta programs by type:`)
  for (const p of META_PROGRAMS) console.log(`  [${p.type}] ${p.name} (${p.groups.reduce((n, g) => n + g.requirements.length, 0)} reqs)`)
}

main().catch((e) => { console.error('FAIL:', e); process.exit(1) })
