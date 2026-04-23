import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PageLayout from '@/components/layout/PageLayout'
import ErrorBoundary from '@/components/ErrorBoundary'
import { useGradtrakStore } from '@/stores/gradtrakStore'
import { useScheduleStore } from '@/stores/scheduleStore'
import { useAutoSync } from '@/services/sync'
// themeStore self-initializes on import (sets html.light + listens to system pref)
import '@/stores/themeStore'

const CatalogPage = lazy(() => import('@/pages/CatalogPage'))
const SchedulerPage = lazy(() => import('@/pages/SchedulerPage'))
const GradtrakPage = lazy(() => import('@/pages/GradtrakPage'))
const GradesPage = lazy(() => import('@/pages/GradesPage'))
const EnrollmentPage = lazy(() => import('@/pages/EnrollmentPage'))

function RouteLoading() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-2 border-cal-gold/20" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-cal-gold" />
        </div>
        <p className="serif text-[14px] italic text-text-muted">Loading…</p>
      </div>
    </div>
  )
}

function SyncProvider() {
  useAutoSync()
  return null
}

export default function App() {
  return (
    <ErrorBoundary name="App">
      <BrowserRouter>
        <SyncProvider />
        <Suspense fallback={<RouteLoading />}>
          <Routes>
            <Route element={<PageLayout />}>
              <Route path="/" element={<Navigate to="/catalog" replace />} />
              <Route
                path="/catalog/:courseId?"
                element={<ErrorBoundary name="Catalog"><CatalogPage /></ErrorBoundary>}
              />
              <Route
                path="/scheduler"
                element={
                  <ErrorBoundary name="Scheduler" onReset={() => useScheduleStore.getState().clearAll()}>
                    <SchedulerPage />
                  </ErrorBoundary>
                }
              />
              <Route
                path="/gradtrak"
                element={
                  <ErrorBoundary name="Gradtrak" onReset={() => useGradtrakStore.getState().clearAll()}>
                    <GradtrakPage />
                  </ErrorBoundary>
                }
              />
              <Route
                path="/grades/:courseId?"
                element={<ErrorBoundary name="Grades"><GradesPage /></ErrorBoundary>}
              />
              <Route
                path="/enrollment/:courseId?"
                element={<ErrorBoundary name="Enrollment"><EnrollmentPage /></ErrorBoundary>}
              />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
