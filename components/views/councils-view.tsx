"use client"

import { useState, useEffect } from "react"
import {
  MapPin,
  Clock,
  User,
  GripVertical,
  Plus,
  CalendarPlus,
  Download,
  MessageSquarePlus,
  FileSignature,
  GraduationCap,
  FileDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  unassignedProjects,
  councils,
  reviewAssignments as initialAssignments,
  reviewerOptions,
  type ReviewAssignment,
} from "@/lib/mock-data"

export function CouncilsView() {
  const [assignments, setAssignments] = useState<ReviewAssignment[]>([])
  const [issued, setIssued] = useState(false)

  // grades keyed by "councilId-projectIndex"
  const [grades, setGrades] = useState<Record<string, number>>({})

  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewTarget, setReviewTarget] = useState("")
  const [reviewText, setReviewText] = useState("")
  const [reviewGrade, setReviewGrade] = useState("")

  const [gradeOpen, setGradeOpen] = useState(false)
  const [gradeKey, setGradeKey] = useState("")
  const [gradeStudent, setGradeStudent] = useState("")
  const [gradeValue, setGradeValue] = useState("")
  const [gradeError, setGradeError] = useState("")

  const [createCouncilOpen, setCreateCouncilOpen] = useState(false)
  const [councilForm, setCouncilForm] = useState({ name: "", time: "", room: "", president: "", secretary: "", member: "" })
  const [councilError, setCouncilError] = useState("")
  const [localCouncils, setLocalCouncils] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const res = await fetch("/api/councils")
      const data = await res.json()
      if (data.success) {
        setAssignments(data.reviewAssignments)
        setLocalCouncils(data.councils)
      }
    } catch (err) {
      console.error("Error fetching councils data:", err)
    }
  }

  // 26. Đề xuất GV phản biện
  async function setReviewer(id: string, reviewer: string) {
    try {
      const res = await fetch("/api/councils", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "assign_reviewer",
          id,
          reviewer
        })
      })
      const data = await res.json()
      if (data.success) {
        setAssignments(data.reviewAssignments)
      }
    } catch (err) {
      console.error("Error assigning reviewer:", err)
    }
  }

  // 28. Tải quyển ĐATN để chấm
  function downloadThesis(title: string) {
    const blob = new Blob([`Quyển ĐATN: ${title}\n(Tệp mô phỏng để chấm phản biện)`], { type: "text/plain;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title.slice(0, 30)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  function saveGrade() {
    if (gradeValue === "") {
      setGradeError("Vui lòng nhập điểm số bảo vệ.")
      return
    }
    const v = Number(gradeValue)
    if (isNaN(v) || v < 0 || v > 10) {
      setGradeError("Điểm số không hợp lệ. Điểm phải nằm trong thang điểm từ 0 đến 10.")
      return
    }
    setGrades((prev) => ({ ...prev, [gradeKey]: v }))
    setGradeError("")
    setGradeOpen(false)
  }

  async function handleCreateCouncil() {
    if (!councilForm.name.trim() || !councilForm.time.trim() || !councilForm.room.trim() || !councilForm.president.trim() || !councilForm.secretary.trim() || !councilForm.member.trim()) {
      setCouncilError("Vui lòng nhập đầy đủ thông tin hội đồng và các thành viên (Chủ tịch, Thư ký, Ủy viên).")
      return
    }

    try {
      const res = await fetch("/api/councils", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_council",
          name: councilForm.name.trim(),
          room: councilForm.room.trim(),
          time: councilForm.time.trim(),
          members: [councilForm.president.trim(), councilForm.secretary.trim(), councilForm.member.trim()],
          projects: []
        })
      })
      const data = await res.json()
      if (data.success) {
        setLocalCouncils(data.councils)
      }
    } catch (err) {
      console.error("Error creating council:", err)
    }

    setCouncilForm({ name: "", time: "", room: "", president: "", secretary: "", member: "" })
    setCouncilError("")
    setCreateCouncilOpen(false)
  }

  // 33. Xuất bảng điểm tổng kết
  function exportGrades() {
    const header = "Hội đồng,Đề tài,Sinh viên,Điểm\n"
    const lines: string[] = []
    localCouncils.forEach((c) => {
      c.projects.forEach((p, i) => {
        const g = grades[`${c.id}-${i}`]
        lines.push(`${c.name},${p.title},${p.student},${g ?? "Chưa nhập"}`)
      })
    })
    const blob = new Blob(["\uFEFF" + header + lines.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "bang-diem-tong-ket.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Phản biện &amp; Hội đồng</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Phân công phản biện, xếp lịch hội đồng bảo vệ và nhập điểm tổng kết.
          </p>
        </div>
      </div>

      <Tabs defaultValue="councils" className="w-full">
        <TabsList>
          <TabsTrigger value="councils">Hội đồng bảo vệ</TabsTrigger>
          <TabsTrigger value="reviewers">Phân công phản biện</TabsTrigger>
        </TabsList>

        {/* ---- Councils kanban ---- */}
        <TabsContent value="councils" className="mt-4 flex flex-col gap-4">
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" className="gap-2" onClick={exportGrades}>
              <FileDown className="size-4" aria-hidden="true" />
              Xuất bảng điểm tổng kết
            </Button>
            <Button className="gap-2" onClick={() => setCreateCouncilOpen(true)}>
              <CalendarPlus className="size-4" aria-hidden="true" />
              Tạo hội đồng
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            {/* Left: unassigned */}
            <div className="lg:col-span-2">
              <Card className="h-full bg-muted/30">
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground">Đề tài chưa xếp lịch</h3>
                  <Badge variant="secondary" className="text-muted-foreground">
                    {unassignedProjects.length}
                  </Badge>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {unassignedProjects.map((p) => (
                    <div key={p.id} className="flex items-start gap-2 rounded-lg border border-border bg-card p-3 shadow-sm">
                      <GripVertical className="mt-0.5 size-4 shrink-0 cursor-grab text-muted-foreground" aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-snug text-foreground text-pretty">{p.title}</p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <User className="size-3.5" aria-hidden="true" />
                          {p.student} · {p.instructor}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right: councils */}
            <div className="flex flex-col gap-4 lg:col-span-3">
              {localCouncils.map((c) => (
                <Card key={c.id}>
                  <CardHeader className="gap-2 border-b border-border">
                    <h3 className="text-sm font-semibold text-foreground">{c.name}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Clock className="size-3.5" aria-hidden="true" />
                        {c.time}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="size-3.5" aria-hidden="true" />
                        {c.room}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {c.members.map((m) => (
                        <Badge key={m} variant="secondary" className="bg-accent text-xs font-normal text-accent-foreground">
                          {m}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    {c.projects.map((p, i) => {
                      const key = `${c.id}-${i}`
                      const g = grades[key]
                      return (
                        <div key={i} className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
                          <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
                            {i + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium leading-snug text-foreground text-pretty">{p.title}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{p.student}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            {g !== undefined ? (
                              <Badge className="bg-primary/10 text-primary hover:bg-primary/10">{g.toFixed(1)} điểm</Badge>
                            ) : null}
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => {
                                setGradeKey(key)
                                setGradeStudent(p.student)
                                setGradeValue(g !== undefined ? String(g) : "")
                                setGradeError("")
                                setGradeOpen(true)
                              }}
                            >
                              <GraduationCap className="size-4" aria-hidden="true" />
                              Nhập điểm
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                    >
                      <Plus className="size-4" aria-hidden="true" />
                      Phân phòng &amp; xếp lịch đề tài
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ---- Reviewer assignment ---- */}
        <TabsContent value="reviewers" className="mt-4 flex flex-col gap-4">
          <div className="flex justify-end">
            <Button className="gap-2" disabled={issued} onClick={() => setIssued(true)}>
              <FileSignature className="size-4" aria-hidden="true" />
              {issued ? "Đã ban hành QĐ" : "Ban hành QĐ phân công"}
            </Button>
          </div>
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Đề tài</TableHead>
                    <TableHead className="font-semibold">Sinh viên</TableHead>
                    <TableHead className="min-w-[200px] font-semibold">GV phản biện</TableHead>
                    <TableHead className="text-right font-semibold">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium text-foreground">{a.topicTitle}</TableCell>
                      <TableCell className="text-muted-foreground">{a.student}</TableCell>
                      <TableCell>
                        <Select value={a.reviewer ?? ""} onValueChange={(v) => setReviewer(a.id, v)}>
                          <SelectTrigger className="w-full bg-card">
                            <SelectValue placeholder="Đề xuất GV phản biện..." />
                          </SelectTrigger>
                          <SelectContent>
                            {reviewerOptions.map((r) => (
                              <SelectItem key={r} value={r}>
                                {r}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-primary"
                            aria-label={`Tải quyển ĐATN ${a.topicTitle}`}
                            onClick={() => downloadThesis(a.topicTitle)}
                          >
                            <Download className="size-4" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-primary"
                            aria-label={`Nhập nhận xét phản biện ${a.topicTitle}`}
                            onClick={() => {
                              setReviewTarget(a.topicTitle)
                              setReviewText("")
                              setReviewGrade("")
                              setReviewOpen(true)
                            }}
                          >
                            <MessageSquarePlus className="size-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 29. reviewer comments dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nhập nhận xét và điểm phản biện</DialogTitle>
            <DialogDescription>Đề tài: {reviewTarget}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="rv">Nội dung nhận xét phản biện</Label>
              <Textarea
                id="rv"
                rows={4}
                placeholder="Nhập nhận xét phản biện về nội dung, phương pháp, kết quả..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="rvGrade">Điểm phản biện (thang 10)</Label>
              <Input
                id="rvGrade"
                type="number"
                min={0}
                max={10}
                step={0.1}
                placeholder="8.0"
                value={reviewGrade}
                onChange={(e) => setReviewGrade(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)}>
              Hủy
            </Button>
            <Button onClick={() => setReviewOpen(false)} disabled={!reviewText.trim()}>
              Lưu nhận xét
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 32. grade entry dialog */}
      <Dialog open={gradeOpen} onOpenChange={setGradeOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Nhập điểm bảo vệ</DialogTitle>
            <DialogDescription>Sinh viên: {gradeStudent}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <Label htmlFor="grade">Điểm (thang 10)</Label>
            <Input
              id="grade"
              type="number"
              min={0}
              max={10}
              step={0.1}
              placeholder="8.5"
              value={gradeValue}
              onChange={(e) => setGradeValue(e.target.value)}
            />
            {gradeError ? <p className="text-xs text-destructive mt-1 font-medium">{gradeError}</p> : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGradeOpen(false)}>
              Hủy
            </Button>
            <Button onClick={saveGrade}>Lưu điểm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create council dialog */}
      <Dialog open={createCouncilOpen} onOpenChange={setCreateCouncilOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Khởi tạo hội đồng mới</DialogTitle>
            <DialogDescription>Thiết lập thông tin hội đồng bảo vệ và phân công các thành viên.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="cName">Tên hội đồng</Label>
              <Input
                id="cName"
                placeholder="VD: Hội đồng số 03 - Hệ thống thông tin"
                value={councilForm.name}
                onChange={(e) => setCouncilForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="cRoom">Phòng bảo vệ</Label>
                <Input
                  id="cRoom"
                  placeholder="VD: Phòng A2.15"
                  value={councilForm.room}
                  onChange={(e) => setCouncilForm((f) => ({ ...f, room: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="cTime">Thời gian bảo vệ</Label>
                <Input
                  id="cTime"
                  placeholder="VD: 08:00, 25/06/2026"
                  value={councilForm.time}
                  onChange={(e) => setCouncilForm((f) => ({ ...f, time: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cPresident">Chủ tịch hội đồng</Label>
              <Input
                id="cPresident"
                placeholder="VD: PGS.TS. Nguyễn Văn A"
                value={councilForm.president}
                onChange={(e) => setCouncilForm((f) => ({ ...f, president: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="cSecretary">Thư ký</Label>
                <Input
                  id="cSecretary"
                  placeholder="VD: TS. Trần Thị B"
                  value={councilForm.secretary}
                  onChange={(e) => setCouncilForm((f) => ({ ...f, secretary: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="cMember">Ủy viên</Label>
                <Input
                  id="cMember"
                  placeholder="VD: ThS. Lê Văn C"
                  value={councilForm.member}
                  onChange={(e) => setCouncilForm((f) => ({ ...f, member: e.target.value }))}
                />
              </div>
            </div>
            {councilError ? <p className="text-sm text-destructive">{councilError}</p> : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateCouncilOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateCouncil}>Khởi tạo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
