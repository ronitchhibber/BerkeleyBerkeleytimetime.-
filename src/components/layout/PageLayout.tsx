import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function PageLayout() {
  return (
    <div className="h-screen w-screen overflow-hidden p-0 md:p-5">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <div className="flex h-full w-full flex-col overflow-hidden border border-border-strong bg-bg-primary md:rounded-2xl md:shadow-[0_0_60px_rgba(0,0,0,0.5)]">
        <Navbar />
        <main id="main-content" className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
