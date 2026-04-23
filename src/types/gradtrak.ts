export type RequirementRule =
  | { type: 'specific'; courses: string[] }
  | { type: 'choose'; count: number; from: string[] }
  | { type: 'category'; from: string[]; count: number }
  | { type: 'units'; from: string[]; units: number }
  | { type: 'breadth'; breadth: string; count?: number }
  | { type: 'total-units'; units: number }
  | { type: 'senior-residence'; units: number }
  | { type: 'university-req'; req: string; count?: number }

export interface Requirement {
  id: string
  name: string
  description?: string
  rule: RequirementRule
}

export interface RequirementGroup {
  id: string
  name: string
  description?: string
  requirements: Requirement[]
}

export interface Program {
  id: string
  name: string
  type: 'major' | 'minor' | 'college' | 'certificate' | 'university'
  groups: RequirementGroup[]
}

export interface ProgramsData {
  meta: { generatedAt: string; source: string }
  programs: Program[]
}

export type SemesterTerm = 'Fall' | 'Spring' | 'Summer'

export interface PlannedSemester {
  id: string
  term: SemesterTerm
  year: number
  courseCodes: string[]
}

export interface RequirementProgress {
  requirementId: string
  satisfied: boolean
  matchedCourses: string[]
  remaining: number
  total: number
  unitsCompleted?: number
  unitsRequired?: number
}

export interface GroupProgress {
  groupId: string
  satisfied: boolean
  satisfiedCount: number
  totalCount: number
  requirements: RequirementProgress[]
}

export interface ProgramProgress {
  programId: string
  satisfied: boolean
  groups: GroupProgress[]
}
