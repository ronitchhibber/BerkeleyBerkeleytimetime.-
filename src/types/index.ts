export interface Course {
  id: string
  code: string
  sectionNumber: string
  title: string
  department: string
  units: number
  classNumber: number
  level: ClassLevel

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
  gradingOption: GradingOption

  requirements: {
    lsBreadth: string[]
    universityReqs: string[]
  }

  hasReservedSeating: boolean
  reservedSeatingDetails?: string

  starsCount: number
  attendanceRequired: boolean
  lecturesRecorded: boolean

  rmpRating?: RMPRating

  sections: Section[]
  /** Lazy-loaded — undefined until loadCourseDetail() resolves. Read via useCourseDetail(). */
  gradeHistory?: GradeRecord[]
  /** Lazy-loaded — undefined until loadCourseDetail() resolves. */
  enrollmentHistory?: EnrollmentDataPoint[]
  /** Lazy-loaded. */
  enrollmentHistoryBySemester?: Record<string, EnrollmentDataPoint[]>
}

export interface RMPRating {
  avgRating: number
  avgDifficulty: number
  numRatings: number
  wouldTakeAgainPercent: number
  department: string
  rmpId: string
}

export interface Section {
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

export interface GradeRecord {
  semester: string
  instructor: string
  totalEnrolled: number
  distribution: GradeDistribution
  averageGPA: number
}

export interface GradeDistribution {
  aPlus: number
  a: number
  aMinus: number
  bPlus: number
  b: number
  bMinus: number
  cPlus: number
  c: number
  cMinus: number
  dPlus: number
  d: number
  dMinus: number
  f: number
  p: number
  np: number
}

export interface EnrollmentDataPoint {
  day: number
  enrollmentPercent: number
  enrolledCount: number
  date?: string
  waitlistCount?: number
}

export interface Term {
  id: string
  name: string
  isCurrent: boolean
}

export interface CoursesData {
  meta: {
    generatedAt: string
    termId: string
    termName: string
    totalCourses: number
  }
  courses: Course[]
}

export type ClassLevel = 'lower' | 'upper' | 'graduate'
export type GradingOption = 'letter' | 'pnp' | 'satisfactory'
export type SortOption = 'relevance' | 'grade' | 'enrolled' | 'units' | 'number' | 'department' | 'rmp'
export type DetailTab = 'Overview' | 'Sections' | 'Ratings' | 'Grades' | 'Enrollment'
