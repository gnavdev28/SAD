"use client"

import { useState, useEffect, useRef } from "react"
import { Pencil, Lock, LockOpen, Trash2, Plus, FileDown, UserPlus, UserMinus, FileUp, UploadCloud, FileSpreadsheet, Check, Download, ArrowUpDown, Star, CheckCircle2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

function isBatchActiveNow(startDateStr: string, endDateStr: string) {
  if (!startDateStr || !endDateStr) return false
  const parseDate = (str: string) => {
    const parts = str.split("/").map(Number)
    if (parts.length !== 3) return new Date(0)
    return new Date(parts[2], parts[1] - 1, parts[0])
  }
  const start = parseDate(startDateStr)
  const end = parseDate(endDateStr)
  end.setHours(23, 59, 59, 999)
  // Simulated current date: 01/08/2026
  const simulatedNow = new Date(2026, 7, 1)
  return simulatedNow >= start && simulatedNow <= end
}

export function SemestersView() {
  const [rows, setRows] = useState<Semester[]>([])
  const [students, setStudents] = useState<SemesterStudent[]>([])
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", startDate: "", endDate: "" })
  const [error, setError] = useState("")

  // sorting state for student list
  const [sortBy, setSortBy] = useState<"credits_desc" | "credits_asc" | "eligible" | "name" | "code">("credits_desc")

  // dialog for adding a student manually
  const [studentOpen, setStudentOpen] = useState(false)
  const [studentForm, setStudentForm] = useState({ code: "", name: "", className: "", credits: "" })
  const [studentError, setStudentError] = useState("")

  // dialog for confirming student deletion
  const [deleteStudentOpen, setDeleteStudentOpen] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState<SemesterStudent | null>(null)

  // dialog for importing students via file
  const [importOpen, setImportOpen] = useState(false)
  const [importFileName, setImportFileName] = useState("")
  const [importedPreview, setImportedPreview] = useState<Array<{ code: string; name: string; className: string; credits: number }>>([])
  const [importError, setImportError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    requestBatchList()
  }, [])

  async function requestBatchList() {
    await sendListRequest()
  }

  async function sendListRequest() {
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

  async function requestCreateBatch() {
    await sendBatchObject()
  }

  async function sendBatchObject() {
    try {
      const res = await fetch("/api/semesters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_semester",
          id: null,
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
      console.error("Error creating semester:", err)
    }
  }

  async function sendUpdateRequest() {
    await sendUpdatedObject()
  }

  async function sendUpdatedObject() {
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

    if (editingId) {
      await sendUpdateRequest()
    } else {
      await requestCreateBatch()
    }

    setOpen(false)
    resetForm()
  }

  async function sendUpdateStatusRequest(id: string) {
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

  async function setAsCurrentSemester(id: string) {
    try {
      const res = await fetch("/api/semesters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set_current_semester",
          id
        })
      })
      const data = await res.json()
      if (data.success) {
        setRows(data.semesters)
      }
    } catch (err) {
      console.error("Error setting current semester:", err)
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

  function handleFileSelect(file: File) {
    if (!file) return
    setImportFileName(file.name)
    setImportError("")
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        if (!text) return
        const lines = text.split(/\r?\n/)
        const parsed: Array<{ code: string; name: string; className: string; credits: number }> = []

        lines.forEach((line, index) => {
          const trimmed = line.trim()
          if (!trimmed) return
          if (index === 0 && (trimmed.toLowerCase().includes("mã") || trimmed.toLowerCase().includes("họ tên") || trimmed.toLowerCase().includes("code"))) {
            return
          }
          const parts = trimmed.split(/[,;\t]+/).map((p) => p.trim().replace(/^["']|["']$/g, ""))
          if (parts.length >= 2) {
            const code = parts[0] || `SV2026${index}`
            const name = parts[1] || "Sinh viên"
            const className = parts[2] || "CNTT01"
            const credits = Number(parts[3]) || 80
            if (code && name) {
              parsed.push({ code, name, className, credits })
            }
          }
        })

        if (parsed.length === 0) {
          setImportError("Không tìm thấy dữ liệu sinh viên hợp lệ trong file. Vui lòng thử file mẫu CSV.")
        } else {
          setImportedPreview(parsed)
        }
      } catch (err) {
        setImportError("Lỗi đọc file. Vui lòng kiểm tra lại định dạng file.")
      }
    }
    reader.readAsText(file, "UTF-8")
  }

  function downloadSampleCSV() {
    const content = "\uFEFFMã SV,Họ tên,Lớp,Tín chỉ (%)\nSV2021011,Nguyễn Văn Nam,CNTT01,86\nSV2021012,Trần Thị Mai,CNTT02,75\nSV2021013,Lê Hoàng Cường,CNTT01,92"
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "danh-sach-sinh-vien-mau.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  async function confirmImportStudents() {
    if (importedPreview.length === 0) {
      setImportError("Chưa có danh sách sinh viên hợp lệ để thêm.")
      return
    }
    try {
      const res = await fetch("/api/semesters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "import_students",
          students: importedPreview
        })
      })
      const data = await res.json()
      if (data.success) {
        setStudents(data.students)
        setImportOpen(false)
        setImportedPreview([])
        setImportFileName("")
      }
    } catch (err) {
      console.error("Error importing students:", err)
      setImportError("Lỗi kết nối server khi nhập danh sách.")
    }
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

  function sendExportRequest() {
    callExportReportAPI()
  }

  function callExportReportAPI() {
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
                    rows.map((s) => {
                      const isActive = s.status === "open" && isBatchActiveNow(s.startDate, s.endDate)
                      return (
                        <TableRow key={s.id} className={isActive ? "bg-emerald-500/10 hover:bg-emerald-500/15 border-l-4 border-l-emerald-500 font-medium" : ""}>
                          <TableCell className="font-medium text-foreground">
                            <div className="flex items-center gap-2">
                              {s.name}
                              {isActive && (
                                <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] gap-1 px-1.5 py-0">
                                  <CheckCircle2 className="size-3" /> Đang hoạt động
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{s.startDate}</TableCell>
                          <TableCell className="text-muted-foreground">{s.endDate}</TableCell>
                          <TableCell>
                            {s.status === "locked" ? (
                              <Badge variant="secondary" className="bg-destructive/10 text-destructive border border-destructive/20 gap-1">
                                <Lock className="size-3" /> Đã khóa
                              </Badge>
                            ) : isActive ? (
                              <Badge className="bg-emerald-600/15 text-emerald-600 border border-emerald-600/30">Mở &amp; Đang hoạt động</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                Mở (Ngoài mốc ngày)
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
                                className={s.status === "open" ? "size-8 text-emerald-600 hover:text-emerald-700" : "size-8 text-muted-foreground hover:text-primary"}
                                title={s.status === "open" ? "Khóa đợt (Đóng đăng ký/nộp bài)" : "Mở đợt"}
                                onClick={() => sendUpdateStatusRequest(s.id)}
                              >
                                {s.status === "open" ? (
                                  <LockOpen className="size-4" aria-hidden="true" />
                                ) : (
                                  <Lock className="size-4" aria-hidden="true" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground hover:text-destructive"
                                aria-label={`Xóa đợt ${s.name}`}
                                onClick={() => removeRow(s.id)}
                              >
                                <Trash2 className="size-4" aria-hidden="true" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
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
                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                  <SelectTrigger className="w-[190px] h-9 text-xs bg-card">
                    <div className="flex items-center gap-1.5 truncate">
                      <ArrowUpDown className="size-3.5 text-muted-foreground shrink-0" />
                      <span>Sắp xếp: </span>
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credits_desc">Tín chỉ (% giảm dần)</SelectItem>
                    <SelectItem value="credits_asc">Tín chỉ (% tăng dần)</SelectItem>
                    <SelectItem value="eligible">Ưu tiên Đủ ĐK</SelectItem>
                    <SelectItem value="name">Họ tên (A - Z)</SelectItem>
                    <SelectItem value="code">Mã sinh viên</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-0" onClick={() => {
                  setImportFileName("")
                  setImportedPreview([])
                  setImportError("")
                  setImportOpen(true)
                }}>
                  <FileUp className="size-4" aria-hidden="true" />
                  Thêm từ file Excel/CSV
                </Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setStudentOpen(true)}>
                  <UserPlus className="size-4" aria-hidden="true" />
                  Thêm thủ công
                </Button>
                 <Button variant="outline" size="sm" className="gap-2" onClick={sendExportRequest}>
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
                      [...students].sort((a, b) => {
                        if (sortBy === "credits_desc") return b.credits - a.credits
                        if (sortBy === "credits_asc") return a.credits - b.credits
                        if (sortBy === "eligible") return Number(b.eligible) - Number(a.eligible)
                        if (sortBy === "name") return a.name.localeCompare(b.name, "vi")
                        if (sortBy === "code") return a.code.localeCompare(b.code)
                        return 0
                      }).map((s) => (
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
                placeholder="VD: Đợt ĐATN Tháng 8 - 9/2026"
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

      {/* Import students via file dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="size-5 text-emerald-600" />
              Thêm danh sách sinh viên từ file (Excel / CSV)
            </DialogTitle>
            <DialogDescription>
              Tải lên file danh sách sinh viên đợt này. Hệ thống hỗ trợ file `.csv`, `.xlsx`, `.txt`.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            {/* File dropzone area */}
            <div
              className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 text-center transition-colors hover:border-emerald-500/60 bg-muted/20 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls,.txt"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0])
                  }
                }}
              />
              <UploadCloud className="size-8 text-muted-foreground" />
              {importFileName ? (
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                  <FileSpreadsheet className="size-4" />
                  {importFileName} ({importedPreview.length} sinh viên)
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-foreground">Bấm vào đây để chọn file hoặc kéo thả file vào đây</p>
                  <p className="text-xs text-muted-foreground">Định dạng hỗ trợ: CSV, XLSX, TXT (Mã SV, Họ tên, Lớp, Tín chỉ)</p>
                </>
              )}
            </div>

            {/* Template download link */}
            <div className="flex items-center justify-between text-xs text-muted-foreground bg-accent/40 p-2.5 rounded-md">
              <span>Chưa có file chuẩn cấu trúc?</span>
              <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 text-primary hover:text-primary" onClick={downloadSampleCSV}>
                <Download className="size-3" />
                Tải file mẫu (.csv)
              </Button>
            </div>

            {/* Error message */}
            {importError && (
              <p className="text-xs font-medium text-destructive">{importError}</p>
            )}

            {/* Preview table if file parsed */}
            {importedPreview.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Check className="size-3.5 text-emerald-600" />
                  Xem trước danh sách đọc được ({importedPreview.length} sinh viên):
                </p>
                <div className="max-h-48 overflow-y-auto border border-border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 text-xs">
                        <TableHead className="py-2 font-semibold">Mã SV</TableHead>
                        <TableHead className="py-2 font-semibold">Họ tên</TableHead>
                        <TableHead className="py-2 font-semibold">Lớp</TableHead>
                        <TableHead className="py-2 font-semibold">Tín chỉ</TableHead>
                        <TableHead className="py-2 font-semibold">Đủ ĐK</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importedPreview.map((s, idx) => (
                        <TableRow key={idx} className="text-xs">
                          <TableCell className="py-1.5 font-medium">{s.code}</TableCell>
                          <TableCell className="py-1.5">{s.name}</TableCell>
                          <TableCell className="py-1.5 text-muted-foreground">{s.className}</TableCell>
                          <TableCell className="py-1.5 text-muted-foreground">{s.credits}%</TableCell>
                          <TableCell className="py-1.5">
                            {s.credits >= 80 ? (
                              <Badge className="bg-primary/10 text-primary text-[10px] py-0 px-1">Đủ ĐK</Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-destructive/10 text-destructive text-[10px] py-0 px-1">Chưa đủ</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setImportOpen(false)}>
              Hủy
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-0"
              onClick={confirmImportStudents}
              disabled={importedPreview.length === 0}
            >
              Thêm {importedPreview.length > 0 ? `${importedPreview.length} sinh viên` : "từ file"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
