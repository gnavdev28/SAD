"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { AppSidebar, type ViewKey } from "@/components/app-sidebar"
import { SemestersView } from "@/components/views/semesters-view"
import { TopicsView } from "@/components/views/topics-view"
import { ProgressView } from "@/components/views/progress-view"
import { CouncilsView } from "@/components/views/councils-view"
import { AccountsView } from "@/components/views/accounts-view"
import { StatisticsView } from "@/components/views/statistics-view"
import { AuthView } from "@/components/auth-view"
import { cn } from "@/lib/utils"

const viewTitles: Record<ViewKey, string> = {
  accounts: "Quản lý tài khoản",
  semesters: "Quản lý đợt",
  topics: "Quản lý đề tài",
  progress: "Tiến độ & Báo cáo",
  councils: "Phản biện & Hội đồng",
  statistics: "Báo cáo & Thống kê",
}

interface UserInfo {
  name: string
  email: string
  role: string
}

export default function Page() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [activeView, setActiveView] = useState<ViewKey>("semesters")
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleViewChange = (view: ViewKey) => {
    setActiveView(view)
    setMobileOpen(false)
  }

  const handleLoginSuccess = (userInfo: UserInfo) => {
    setUser(userInfo)
    const rawRole = (userInfo as any)?.rawRole
    if (rawRole === "reviewer" || rawRole === "council") {
      setActiveView("councils")
    } else if (userInfo.role === "Sinh viên" || userInfo.role === "Giảng viên") {
      setActiveView("topics")
    } else {
      setActiveView("semesters")
    }
  }

  const processLogout = () => {
    setUser(null)
  }

  if (!user) {
    return <AuthView onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <AppSidebar
          activeView={activeView}
          onViewChange={handleViewChange}
          user={user}
          onLogout={processLogout}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Đóng menu"
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 shadow-xl">
            <AppSidebar
              activeView={activeView}
              onViewChange={handleViewChange}
              user={user}
              onLogout={processLogout}
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
            className="flex size-9 items-center justify-center rounded-lg text-foreground hover:bg-accent"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <span className="text-sm font-semibold text-foreground">{viewTitles[activeView]}</span>
        </header>

        <main className={cn("flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8")}>
          <div className="mx-auto max-w-6xl">
            {activeView === "accounts" && <AccountsView />}
            {activeView === "semesters" && <SemestersView />}
            {activeView === "topics" && <TopicsView user={user} />}
            {activeView === "progress" && <ProgressView user={user} />}
            {activeView === "councils" && <CouncilsView user={user} />}
            {activeView === "statistics" && <StatisticsView />}
          </div>
        </main>
      </div>
    </div>
  )
}
