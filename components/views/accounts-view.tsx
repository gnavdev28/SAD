"use client"

import { useState, useEffect } from "react"
import {
  UserCog,
  Search,
  UserPlus,
  FileUp,
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export type UserRole = "admin" | "instructor" | "reviewer" | "council" | "student"

export interface AccountUser {
  id: string
  name: string
  email: string
  role: UserRole
  roleName: string
  status: "active" | "locked"
  permissions: string[]
}

const initialUsers: AccountUser[] = [
  {
    id: "u1",
    name: "Quản trị viên (Phạm Quang Hà)",
    email: "admin@dhcn.edu.vn",
    role: "admin",
    roleName: "Người phụ trách đồ án (Quản trị)",
    status: "active",
    permissions: ["quan_ly_dot", "duyet_de_tai", "phan_cong_phan_bien", "thanh_lap_hoi_dong", "thong_ke"],
  },
  {
    id: "u2",
    name: "TS. Nguyễn Văn An",
    email: "an.nguyen@school.edu.vn",
    role: "instructor",
    roleName: "Giảng viên hướng dẫn",
    status: "active",
    permissions: ["de_xuat_de_tai", "duyet_sv_dang_ky", "cham_tien_do"],
  },
  {
    id: "u3",
    name: "PGS.TS. Phạm Minh Dũng",
    email: "dung.pham@school.edu.vn",
    role: "reviewer",
    roleName: "Giảng viên phản biện",
    status: "active",
    permissions: ["cham_phan_bien", "tai_quyen_do_an"],
  },
  {
    id: "u4",
    name: "TS. Lê Hoàng Cường",
    email: "cuong.le@school.edu.vn",
    role: "council",
    roleName: "Thành viên hội đồng",
    status: "active",
    permissions: ["cham_diem_bao_ve", "xem_bien_ban"],
  },
  {
    id: "u5",
    name: "Nguyễn Văn Đạt (SV2021008)",
    email: "24100498@school.edu.vn",
    role: "student",
    roleName: "Sinh viên",
    status: "active",
    permissions: ["dang_ky_de_tai", "nop_bao_cao", "gia_han"],
  },
  {
    id: "u6",
    name: "Ngọ Tâm Ngọc (SV2021009)",
    email: "24108752@school.edu.vn",
    role: "student",
    roleName: "Sinh viên",
    status: "locked",
    permissions: ["dang_ky_de_tai"],
  },
]

export function AccountsView() {
  const [users, setUsers] = useState<AccountUser[]>([])
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")

  // Edit permissions dialog state
  const [editOpen, setEditOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AccountUser | null>(null)
  const [selectedRole, setSelectedRole] = useState<UserRole>("student")
  const [permissions, setPermissions] = useState<string[]>([])

  useEffect(() => {
    requestAccountList()
  }, [])

  async function requestAccountList() {
    await getAccountList()
  }

  async function getAccountList() {
    try {
      const res = await fetch("/api/accounts")
      const data = await res.json()
      if (data.success) {
        setUsers(data.users)
      }
    } catch (err) {
      console.error("Error fetching accounts data:", err)
    }
  }

  // Search and filter
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === "all" || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  function openEditPermissions(user: AccountUser) {
    setEditingUser(user)
    setSelectedRole(user.role)
    setPermissions(user.permissions)
    setEditOpen(true)
  }

  async function requestAssignRole() {
    if (!editingUser) return
    await saveRoleAssignment()
    setEditOpen(false)
  }

  async function saveRoleAssignment() {
    if (!editingUser) return
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_user",
          id: editingUser.id,
          name: editingUser.name,
          email: editingUser.email,
          role: selectedRole,
          status: editingUser.status,
          permissions: permissions
        })
      })
      const data = await res.json()
      if (data.success) {
        setUsers(data.users)
      }
    } catch (err) {
      console.error("Error saving permissions:", err)
    }
  }

  async function toggleLock(id: string) {
    const targetUser = users.find(u => u.id === id)
    if (!targetUser) return
    const newStatus = targetUser.status === "active" ? "locked" : "active"

    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_user",
          id,
          name: targetUser.name,
          email: targetUser.email,
          role: targetUser.role,
          status: newStatus,
          permissions: targetUser.permissions
        })
      })
      const data = await res.json()
      if (data.success) {
        setUsers(data.users)
      }
    } catch (err) {
      console.error("Error toggling lock:", err)
    }
  }

  function togglePermission(permId: string) {
    setPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    )
  }

  function handleImportExcel() {
    alert("Hệ thống đã sẵn sàng import danh sách phân quyền từ tệp tin Excel (.xlsx)")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2.5">
            <UserCog className="size-6 text-primary" />
            Quản lý tài khoản và phân quyền
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cấp quyền, gán vai trò người dùng (Sinh viên, GVHD, GVPB, Hội đồng, Giáo vụ) và quản lý tài khoản.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={handleImportExcel}>
            <FileUp className="size-4" />
            Import Excel
          </Button>
          <Button className="gap-2">
            <UserPlus className="size-4" />
            Tạo tài khoản mới
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border py-4">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm tên, email, mã SV/GV..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-card"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-muted-foreground" />
              <Select value={roleFilter} onValueChange={(val) => setRoleFilter(val || "all")}>
                <SelectTrigger className="w-44 bg-card">
                  <SelectValue placeholder="Lọc vai trò..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả vai trò</SelectItem>
                  <SelectItem value="admin">Người phụ trách (Quản trị)</SelectItem>
                  <SelectItem value="instructor">Giảng viên hướng dẫn</SelectItem>
                  <SelectItem value="reviewer">Giảng viên phản biện</SelectItem>
                  <SelectItem value="council">Thành viên hội đồng</SelectItem>
                  <SelectItem value="student">Sinh viên</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Hiển thị <span className="font-semibold text-foreground">{filteredUsers.length}</span> tài khoản
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Họ và tên / Mã định danh</TableHead>
                  <TableHead className="font-semibold">Email tài khoản</TableHead>
                  <TableHead className="font-semibold">Vai trò được cấp</TableHead>
                  <TableHead className="font-semibold">Trạng thái</TableHead>
                  <TableHead className="text-right font-semibold">Thao tác phân quyền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      Không tìm thấy tài khoản phù hợp với tìm kiếm.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium text-foreground">{u.name}</TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        {u.role === "admin" && (
                          <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20">
                            {u.roleName}
                          </Badge>
                        )}
                        {u.role === "instructor" && (
                          <Badge variant="secondary" className="bg-accent text-accent-foreground">
                            {u.roleName}
                          </Badge>
                        )}
                        {u.role === "reviewer" && (
                          <Badge variant="outline" className="border-border text-foreground">
                            {u.roleName}
                          </Badge>
                        )}
                        {u.role === "council" && (
                          <Badge variant="secondary">
                            {u.roleName}
                          </Badge>
                        )}
                        {u.role === "student" && (
                          <Badge variant="outline" className="text-muted-foreground">
                            {u.roleName}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {u.status === "active" ? (
                          <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                            Hoạt động
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10">
                            Đang khóa
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 h-8 text-xs"
                            onClick={() => openEditPermissions(u)}
                          >
                            <ShieldCheck className="size-3.5 text-primary" />
                            Cấp / Sửa quyền
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-foreground"
                            aria-label={u.status === "active" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                            onClick={() => toggleLock(u.id)}
                          >
                            {u.status === "active" ? <Lock className="size-4 text-muted-foreground" /> : <Unlock className="size-4 text-primary" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* EDIT ROLE & PERMISSIONS DIALOG */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="size-5 text-primary" />
              Cấp quyền &amp; Phân quyền người dùng
            </DialogTitle>
            <DialogDescription>
              Thay đổi vai trò và thiết lập danh sách quyền chi tiết cho tài khoản:{" "}
              <span className="font-semibold text-foreground">{editingUser?.name}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-5 py-2">
            <div className="space-y-2">
              <Label htmlFor="role-select" className="text-xs font-semibold text-foreground">
                Vai trò chính (Role)
              </Label>
              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserRole)}>
                <SelectTrigger id="role-select" className="w-full bg-card">
                  <SelectValue placeholder="Chọn vai trò..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Người phụ trách đồ án (Quản trị / Giáo vụ)</SelectItem>
                  <SelectItem value="instructor">Giảng viên hướng dẫn (GVHD)</SelectItem>
                  <SelectItem value="reviewer">Giảng viên phản biện (GVPB)</SelectItem>
                  <SelectItem value="council">Thành viên hội đồng bảo vệ</SelectItem>
                  <SelectItem value="student">Sinh viên thực hiện đồ án</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground">
                  Phân quyền truy cập chi tiết (Permissions)
                </Label>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPermissions(["quan_ly_dot", "duyet_de_tai", "phan_cong_phan_bien", "thanh_lap_hoi_dong", "cham_diem_bao_ve", "thong_ke"])}
                    className="text-xs text-primary hover:underline cursor-pointer font-medium"
                  >
                    Chọn tất cả
                  </button>
                  <span className="text-muted-foreground">·</span>
                  <button
                    type="button"
                    onClick={() => setPermissions([])}
                    className="text-xs text-muted-foreground hover:underline cursor-pointer"
                  >
                    Bỏ chọn
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3">
                {[
                  { id: "quan_ly_dot", label: "Quản lý & cấu hình đợt đồ án (Tạo, Sửa, Đóng/Mở)" },
                  { id: "duyet_de_tai", label: "Phê duyệt & quản lý danh mục đề tài" },
                  { id: "phan_cong_phan_bien", label: "Phân công giảng viên phản biện" },
                  { id: "thanh_lap_hoi_dong", label: "Thành lập hội đồng & xếp lịch bảo vệ" },
                  { id: "cham_diem_bao_ve", label: "Chấm điểm & cập nhật kết quả bảo vệ" },
                  { id: "thong_ke", label: "Xem báo cáo thống kê & xuất dữ liệu toàn khóa" },
                ].map((item) => {
                  const isChecked = permissions.includes(item.id)
                  return (
                    <label
                      key={item.id}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-md border p-3 transition-colors cursor-pointer select-none text-sm",
                        isChecked
                          ? "border-primary/40 bg-primary/5 text-foreground font-medium"
                          : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      )}
                    >
                      <span>{item.label}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePermission(item.id)}
                        className="size-4 rounded border-input text-primary focus:ring-ring cursor-pointer shrink-0 ml-2"
                      />
                    </label>
                  )
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Hủy
            </Button>
            <Button onClick={requestAssignRole}>
              Lưu phân quyền
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
