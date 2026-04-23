import type { OutputEnrollmentDataPoint } from '../types.js'

export function generateEnrollmentHistory(
  currentEnrolled: number,
  capacity: number,
  totalDays = 120
): OutputEnrollmentDataPoint[] {
  const finalPercent = capacity > 0 ? (currentEnrolled / capacity) * 100 : 0
  const points: OutputEnrollmentDataPoint[] = []

  for (let day = 1; day <= totalDays; day += 2) {
    let percent: number
    if (day <= 30) {
      percent = (day / 30) * 5
    } else if (day <= 50) {
      const t = (day - 30) / 20
      percent = 5 + t * (finalPercent * 0.5 - 5)
    } else if (day <= 80) {
      const t = (day - 50) / 30
      percent = finalPercent * 0.5 + t * (finalPercent * 0.3)
    } else if (day <= 100) {
      const t = (day - 80) / 20
      percent = finalPercent * 0.8 + t * (finalPercent * 0.15)
    } else {
      const t = (day - 100) / 20
      percent = finalPercent * 0.95 + t * (finalPercent * 0.05)
    }

    percent = Math.min(percent, finalPercent)
    const enrolledCount = capacity > 0 ? Math.round((percent / 100) * capacity) : 0

    points.push({
      day,
      enrollmentPercent: Math.round(percent * 10) / 10,
      enrolledCount,
    })
  }

  return points
}
