export interface SISCourse {
  identifiers?: { type: string; id: string }[]
  subjectArea?: { code: string; description: string }
  catalogNumber?: { number: string; formatted: string }
  displayName?: string
  title?: string
  transcriptTitle?: string
  description?: { value?: string }
  credit?: { value?: { fixed?: { units?: number } } }
  gradingBasis?: { code?: string; description?: string }
  academicCareer?: { code?: string }
  preparation?: { requiredText?: string }
  finalExam?: { code?: string; description?: string }
  formatsOffered?: { typicallyOffered?: string }
  classSubjectArea?: { code?: string }
  catalogNumber_formatted?: string
}

export interface SISClass {
  course?: { identifiers?: { type: string; id: string }[] }
  classNumber?: number
  displayName?: string
  session?: { term?: { id?: string; name?: string } }
  aggregateEnrollmentStatus?: {
    enrolledCount?: number
    maxEnroll?: number
    waitlistedCount?: number
    status?: { code?: string }
  }
  allowedUnits?: { forAcademicProgress?: number }
  gradingBasis?: { code?: string }
  instructionMode?: { code?: string }
  primaryComponent?: { code?: string }
}

export interface SISSection {
  class?: {
    course?: { identifiers?: { type: string; id: string }[] }
    number?: number
    displayName?: string
    session?: { term?: { id?: string; name?: string } }
    allowedUnits?: { forAcademicProgress?: number }
  }
  number?: string
  component?: { code?: string; description?: string }
  enrollmentStatus?: {
    enrolledCount?: number
    maxEnroll?: number
    waitlistedCount?: number
    status?: { code?: string; description?: string }
  }
  meetings?: SISMeeting[]
  association?: { primary?: boolean; primaryAssociatedSectionId?: string }
}

export interface SISMeeting {
  meetsDays?: string
  meetsMonday?: boolean
  meetsTuesday?: boolean
  meetsWednesday?: boolean
  meetsThursday?: boolean
  meetsFriday?: boolean
  meetsSaturday?: boolean
  meetsSunday?: boolean
  startTime?: string
  endTime?: string
  location?: { description?: string }
  building?: { description?: string }
  assignedInstructors?: {
    instructor?: {
      names?: { formattedName?: string; familyName?: string; givenName?: string }[]
    }
    role?: { code?: string }
  }[]
}

export interface SISTerm {
  id?: string
  name?: string
  temporalPosition?: string
  beginDate?: string
  endDate?: string
}

export interface OutputCourse {
  id: string
  code: string
  sectionNumber: string
  title: string
  department: string
  units: number
  classNumber: number
  level: 'lower' | 'upper' | 'graduate'
  days: string[]
  startTime: string
  endTime: string
  location: string
  instructor: string
  prerequisites: string
  description: string
  finalExam: string
  enrolledCount: number
  enrollmentCapacity: number
  waitlistCount: number
  enrollmentPercent: number
  averageGPA: number
  averageGrade: string
  gradingOption: 'letter' | 'pnp' | 'satisfactory'
  requirements: { lsBreadth: string[]; universityReqs: string[] }
  hasReservedSeating: boolean
  reservedSeatingDetails?: string
  starsCount: number
  attendanceRequired: boolean
  lecturesRecorded: boolean
  rmpRating?: OutputRMPRating
  sections: OutputSection[]
  gradeHistory: OutputGradeRecord[]
  enrollmentHistory: OutputEnrollmentDataPoint[]
}

export interface OutputSection {
  sectionNumber: string
  type: 'discussion' | 'lab'
  days: string[]
  startTime: string
  endTime: string
  location: string
  instructor: string
  enrolledCount: number
  capacity: number
  waitlistCount: number
  status: 'open' | 'closed' | 'waitlist'
}

export interface OutputGradeRecord {
  semester: string
  instructor: string
  totalEnrolled: number
  distribution: {
    aPlus: number; a: number; aMinus: number
    bPlus: number; b: number; bMinus: number
    cPlus: number; c: number; cMinus: number
    dPlus: number; d: number; dMinus: number
    f: number; p: number; np: number
  }
  averageGPA: number
}

export interface OutputRMPRating {
  avgRating: number
  avgDifficulty: number
  numRatings: number
  wouldTakeAgainPercent: number
  department: string
  rmpId: string
}

export interface OutputEnrollmentDataPoint {
  day: number
  enrollmentPercent: number
  enrolledCount: number
}
