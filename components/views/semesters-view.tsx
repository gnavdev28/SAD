"use client"

import { useState } from "react"
import { Pencil, Lock, LockOpen, Trash2, Plus, FileDown, Filter, UserPlus, UserMinus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  semesters as initialSemesters,
  semesterStudents as initialStudents,
  type Semester,
  type SemesterStudent,
} from "@/lib/mock-data"

function formatDate(value: string) {
  if (!value) return ""
  const [y, m, d] = value.split("-")
  return `${d}/${m}/${y}`
}

function toInputDate(display: string) {
  // dd/mm/yyyy -> yyyy-mm-dd
  if (!display || !display.includes("/")) return ""
  const [d, m, y] = display.split("/")
  return `${y}-${m}-${d}`
}

export function SemestersView() {
  const [rows, setRows] = useState<Semester[]>([])
  const [students, setStudents] = useState<SemesterStudent[]>([])
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", startDate: "", endDate: "" })
  const [error, setError] = useState("")

  // dialog for adding a student manually
  const [studentOpen, setStudentOpen] = useState(false)
  const [studentForm, setStudentForm] = useState({ code: "", name: "", className: "", credits: "" })
  const [studentError, setStudentError] = useState("")

  // dialog for confirming student deletion
  const [deleteStudentOpen, setDeleteStudentOpen] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState<SemesterStudent | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const res = await fetch("/api/semesters")
      const data = await res.json()
      if (data.success) {
        setRows(data.semesters)
        setStudents(data.students)
      }
    } catch (err) {
      console.error("Error fetching data:", err)
    }
  }

  function resetForm() {
    setForm({ name: "", startDate: "", endDate: "" })
    setError("")
    setEditingId(null)
  }

  function openCreate() {
    resetForm()
    setOpen(true)
  }

  function openEdit(s: Semester) {
    setEditingId(s.id)
    setForm({ name: s.name, startDate: toInputDate(s.startDate), endDate: toInputDate(s.endDate) })
    setError("")
    setOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim() || !form.startDate || !form.endDate) {
      setError("Vui lòng nhập đầy đủ tên đợt, ngày bắt đầu và ngày kết thúc.")
      return
    }
    if (form.endDate < form.startDate) {
      setError("Ngày kết thúc phải sau ngày bắt đầu.")
      return
    }

    try {
      const res = await fetch("/api/semesters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_semester",
          id: editingId,
          name: form.name.trim(),
          startDate: formatDate(form.startDate),
          endDate: formatDate(form.endDate)
        })
      })
      const data = await res.json()
      if (data.success) {
        setRows(data.semesters)
      }
    } catch (err) {
      console.error("Error saving semester:", err)
    }

    setOpen(false)
    resetForm()
  }

  async function toggleLock(id: string) {
    try {
      const res = await fetch("/api/semesters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_lock_semester",
          id
        })
      })
      const data = await res.json()
      if (data.success) {
        setRows(data.semesters)
      }
    } catch (err) {
      console.error("Error toggling lock:", err)
    }
  }

  async function removeRow(id: string) {
    try {
      const res = await fetch("/api/semesters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_semester",
          id
        })
      })
      const data = await res.json()
      if (data.success) {
        setRows(data.semesters)
      }
    } catch (err) {
      console.error("Error deleting semester:", err)
    }
  }

  // View 1.5: Duyệt 80% tín chỉ - lọc tự động sinh viên đủ điều kiện
  async function autoFilter() {
    try {
      const res = await fetch("/api/semesters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "auto_filter_students"
        })
      })
      const data = await res.json()
      if (data.success) {
        setStudents(data.students)
      }
    } catch (err) {
      console.error("Error auto filtering students:", err)
    }
  }

  async function removeStudent(id: string) {
    try {
      const res = await fetch("/api/semesters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_student",
          id
        })
      })
      const data = await res.json()
      if (data.success) {
        setStudents(data.students)
      }
    } catch (err) {
      console.error("Error deleting student:", err)
    }
  }

  function confirmDeleteStudent(student: SemesterStudent) {
    setStudentToDelete(student)
    setDeleteStudentOpen(true)
  }

  function handleConfirmDelete() {
    if (studentToDelete) {
      removeStudent(studentToDelete.id)
    }
    setDeleteStudentOpen(false)
    setStudentToDelete(null)
  }

  async function handleAddStudent() {
    const credits = Number(studentForm.credits)
    if (!studentForm.code.trim() || !studentForm.name.trim() || !studentForm.className.trim() || !studentForm.credits) {
      setStudentError("Vui lòng nhập đầy đủ thông tin sinh viên.")
      return
    }

    try {
      const res = await fetch("/api/semesters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_student",
          code: studentForm.code.trim(),
          name: studentForm.name.trim(),
          className: studentForm.className.trim(),
          credits
        })
      })
      const data = await res.json()
      if (data.success) {
        setStudents(data.students)
      }
    } catch (err) {
      console.error("Error adding student:", err)
    }

    setStudentForm({ code: "", name: "", className: "", credits: "" })
    setStudentError("")
    setStudentOpen(false)
  }

  function exportReport() {
    const header = "Mã SV,Họ tên,Lớp,Tín chỉ (%),Đủ điều kiện\n"
    const body = students
      .map((s) => `${s.code},${s.name},${s.className},${s.credits},${s.eligible ? "Có" : "Không"}`)
      .join("\n")
    const blob = new Blob(["\uFEFF" + header + body], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "bien-ban-danh-sach-sinh-vien.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Quản lý đợt</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý các đợt đăng ký và danh sách sinh viên tham gia đồ án tốt nghiệp.
          </p>
        </div>
        <Button className="gap-2 self-start sm:self-auto" onClick={openCreate}>
          <Plus className="size-4" aria-hidden="true" />
          Tạo đợt mới
        </Button>
      </div>

      <Tabs defaultValue="semesters" className="w-full">
        <TabsList>
          <TabsTrigger value="semesters">Danh sách đợt</TabsTrigger>
          <TabsTrigger value="students">Sinh viên trong đợt</TabsTrigger>
        </TabsList>

        {/* Tab: semesters table */}
        <TabsContent value="semesters" className="mt-4">
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Tên đợt</TableHead>
                    <TableHead className="font-semibold">Ngày bắt đầu</TableHead>
                    <TableHead className="font-semibold">Ngày kết thúc</TableHead>
                    <TableHead className="font-semibold">Trạng thái</TableHead>
                    <TableHead className="text-right font-semibold">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                        Chưa có đợt nào. Nhấn &quot;Tạo đợt mới&quot; để bắt đầu.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium text-foreground">{s.name}</TableCell>
                        <TableCell className="text-muted-foreground">{s.startDate}</TableCell>
                        <TableCell className="text-muted-foreground">{s.endDate}</TableCell>
                        <TableCell>
                          {s.status === "open" ? (
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Mở</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-muted-foreground">
                              Khóa
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-primary"
                              aria-label={`Chỉnh sửa ${s.name}`}
                              onClick={() => openEdit(s)}
                            >
                              <Pencil className="size-4" aria-hidden="true" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-primary"
                              aria-label={s.status === "open" ? `Khóa ${s.name}` : `Mở ${s.name}`}
                              onClick={() => toggleLock(s.id)}
                            >
                              {s.status === "open" ? (
                                <Lock className="size-4" aria-hidden="true" />
                              ) : (
                                <LockOpen className="size-4" aria-hidden="true" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-destructive"
                              aria-label={`Xóa ${s.name}`}
                              onClick={() => removeRow(s.id)}
                            >
                              <Trash2 className="size-4" aria-hidden="true" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Tab: students list */}
        <TabsContent value="students" className="mt-4">
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Danh sách sinh viên ({students.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={autoFilter}>
                  <Filter className="size-4" aria-hidden="true" />
                  Lọc tự động (≥80% tín chỉ)
                </Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setStudentOpen(true)}>
                  <UserPlus className="size-4" aria-hidden="true" />
                  Thêm SV
                </Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={exportReport}>
                  <FileDown className="size-4" aria-hidden="true" />
                  Xuất biên bản
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Mã SV</TableHead>
                      <TableHead className="font-semibold">Họ tên</TableHead>
                      <TableHead className="font-semibold">Lớp</TableHead>
                      <TableHead className="font-semibold">Tín chỉ</TableHead>
                      <TableHead className="font-semibold">Điều kiện</TableHead>
                      <TableHead className="text-right font-semibold">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                          Không có sinh viên trong danh sách.
                        </TableCell>
                      </TableRow>
                    ) : (
                      students.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium text-foreground">{s.code}</TableCell>
                          <TableCell className="text-foreground">{s.name}</TableCell>
                          <TableCell className="text-muted-foreground">{s.className}</TableCell>
                          <TableCell className="text-muted-foreground">{s.credits}%</TableCell>
                          <TableCell>
                            {s.eligible ? (
                              <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Đủ ĐK</Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-destructive/10 text-destructive">
                                Chưa đủ
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground hover:text-destructive"
                                aria-label={`Xóa sinh viên ${s.name}`}
                                onClick={() => confirmDeleteStudent(s)}
                              >
                                <UserMinus className="size-4" aria-hidden="true" />
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
        </TabsContent>
      </Tabs>

      {/* Create / Edit semester dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Sửa thông tin đợt" : "Tạo đợt mới"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Cập nhật thông tin đợt đăng ký." : "Nhập thông tin đợt đăng ký đồ án tốt nghiệp mới."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Tên đợt</Label>
              <Input
                id="name"
                placeholder="VD: Đợt 1 - Học kỳ I 2026-2027"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="startDate">Ngày bắt đầu</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="endDate">Ngày kết thúc</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                />
              </div>
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave}>{editingId ? "Lưu thay đổi" : "Tạo đợt"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add student dialog */}
      <Dialog open={studentOpen} onOpenChange={setStudentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm sinh viên thủ công</DialogTitle>
            <DialogDescription>Bổ sung sinh viên vào danh sách đợt hiện tại.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="code">Mã SV</Label>
                <Input
                  id="code"
                  placeholder="SV2021xxx"
                  value={studentForm.code}
                  onChange={(e) => setStudentForm((f) => ({ ...f, code: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="className">Lớp</Label>
                <Input
                  id="className"
                  placeholder="CNTT01"
                  value={studentForm.className}
                  onChange={(e) => setStudentForm((f) => ({ ...f, className: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="sname">Họ tên</Label>
              <Input
                id="sname"
                placeholder="Nguyễn Văn A"
                value={studentForm.name}
                onChange={(e) => setStudentForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="credits">Tín chỉ tích lũy (%)</Label>
              <Input
                id="credits"
                type="number"
                min={0}
                max={100}
                placeholder="80"
                value={studentForm.credits}
                onChange={(e) => setStudentForm((f) => ({ ...f, credits: e.target.value }))}
              />
            </div>
            {studentError ? <p className="text-sm text-destructive">{studentError}</p> : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStudentOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddStudent}>Thêm sinh viên</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete student dialog */}
      <Dialog open={deleteStudentOpen} onOpenChange={setDeleteStudentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa sinh viên</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa sinh viên <span className="font-semibold text-foreground">{studentToDelete?.name}</span> ({studentToDelete?.code}) khỏi danh sách đợt này không?
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            Hành động này sẽ loại bỏ sinh viên khỏi đợt hiện tại và không thể hoàn tác.
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => {
              setDeleteStudentOpen(false)
              setStudentToDelete(null)
            }}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Xóa sinh viên
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
