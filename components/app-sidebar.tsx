import { useState } from "react"
import { CalendarRange, FileStack, ClipboardCheck, Users, GraduationCap, Workflow, LogOut, UserCog, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export type ViewKey = "accounts" | "semesters" | "topics" | "progress" | "councils" | "diagram"

const menuItems: { key: ViewKey; label: string; sublabel: string; icon: typeof CalendarRange }[] = [
  { key: "accounts", label: "Quản lý tài khoản", sublabel: "Phân quyền & tài khoản", icon: UserCog },
  { key: "semesters", label: "Quản lý đợt", sublabel: "Đợt & sinh viên", icon: CalendarRange },
  { key: "topics", label: "Quản lý đề tài", sublabel: "Đăng ký & phê duyệt", icon: FileStack },
  { key: "progress", label: "Tiến độ & Báo cáo", sublabel: "Nộp, duyệt & gia hạn", icon: ClipboardCheck },
  { key: "councils", label: "Phản biện & Hội đồng", sublabel: "Phân công & chấm điểm", icon: Users },
]

const docMenuItems: { key: ViewKey; label: string; sublabel: string; icon: typeof CalendarRange }[] = [
  { key: "diagram", label: "Activity Diagram", sublabel: "Quy trình tổng thể", icon: Workflow },
]

export function AppSidebar({
  activeView,
  onViewChange,
  user,
  onLogout,
}: {
  activeView: ViewKey
  onViewChange: (view: ViewKey) => void
  user: { name: string; email: string; role: string }
  onLogout: () => void
}) {
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()
  return (
    <aside className="flex h-full w-full flex-col bg-sidebar text-sidebar-foreground md:w-72">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-6 py-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <GraduationCap className="size-6" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold leading-tight">Quản lý Đồ án</h1>
          <p className="truncate text-xs text-sidebar-foreground/70">Tốt nghiệp đại học</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4" aria-label="Điều hướng chính">
        <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">
          Quy trình
        </p>
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.key
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onViewChange(item.key)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              <span className="flex min-w-0 flex-col">
                <span className="truncate">{item.label}</span>
                <span
                  className={cn(
                    "truncate text-xs font-normal",
                    isActive ? "text-sidebar-primary-foreground/75" : "text-sidebar-foreground/50",
                  )}
                >
                  {item.sublabel}
                </span>
              </span>
            </button>
          )
        })}

        <div className="my-4 border-t border-sidebar-border" />

        <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">
          Tài liệu
        </p>
        {docMenuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.key
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onViewChange(item.key)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              <span className="flex min-w-0 flex-col">
                <span className="truncate">{item.label}</span>
                <span
                  className={cn(
                    "truncate text-xs font-normal",
                    isActive ? "text-sidebar-primary-foreground/75" : "text-sidebar-foreground/50",
                  )}
                >
                  {item.sublabel}
                </span>
              </span>
            </button>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border px-6 py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sm font-semibold text-sidebar-accent-foreground">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-sidebar-foreground/60">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLogoutModalOpen(true)}
            title="Đăng xuất"
            aria-label="Đăng xuất"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors cursor-pointer"
          >
            <LogOut className="size-5" />
          </button>
        </div>
      </div>

      {/* LOGOUT CONFIRMATION MODAL (UC1.2) */}
      <Dialog open={logoutModalOpen} onOpenChange={setLogoutModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="size-5" />
              Xác nhận đăng xuất hệ thống
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn đăng xuất khỏi hệ thống Quản lý Đồ án Tốt nghiệp? Các dữ liệu chưa lưu có thể bị mất.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setLogoutModalOpen(false)}>
              Hủy
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => {
                setLogoutModalOpen(false)
                onLogout()
              }}
            >
              Đăng xuất
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  )
}
