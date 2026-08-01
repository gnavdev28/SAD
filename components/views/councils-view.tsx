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
  CalendarRange,
  Award,
  CheckCircle2,
  Lock,
  X,
  Trash2,
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
  type Council,
} from "@/lib/mock-data"

export interface CouncilsViewProps {
  user?: { name: string; email: string; role: string; rawRole?: string }
}

export function CouncilsView({ user }: CouncilsViewProps) {
  const isAdmin = user?.role === "admin" || user?.role === "Giáo vụ" || user?.role === "Người phụ trách đồ án (Quản trị)" || (user as any)?.rawRole === "admin"
  const rawRole = (user as any)?.rawRole
  const isReviewerOnly = rawRole === "reviewer"
  const isCouncilOnly = rawRole === "council"

  const [assignments, setAssignments] = useState<ReviewAssignment[]>([])
  const [issued, setIssued] = useState(false)
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState<string>("dt-2026-t8")

  // grades keyed by "councilId-projectIndex"
  const [grades, setGrades] = useState<Record<string, number>>({})

  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewTargetId, setReviewTargetId] = useState("")
  const [reviewTarget, setReviewTarget] = useState("")
  const [reviewText, setReviewText] = useState("")
  const [reviewGrade, setReviewGrade] = useState("")

  const [gradeOpen, setGradeOpen] = useState(false)
  const [gradeKey, setGradeKey] = useState("")
  const [gradeStudent, setGradeStudent] = useState("")
  const [gradeValue, setGradeValue] = useState("")
  const [gradeError, setGradeError] = useState("")

  const [unassignedList, setUnassignedList] = useState<any[]>(unassignedProjects)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [assignCouncilId, setAssignCouncilId] = useState("")
  const [assignProjectId, setAssignProjectId] = useState("")
  const [topicAssignDialogOpen, setTopicAssignDialogOpen] = useState(false)
  const [selectedTopicToAssign, setSelectedTopicToAssign] = useState<any>(null)
  const [targetCouncilSelect, setTargetCouncilSelect] = useState("")

  function openTopicAssignModal(topic: any) {
    setSelectedTopicToAssign(topic)
    setTargetCouncilSelect("")
    setTopicAssignDialogOpen(true)
  }

  async function confirmAssignTopicToCouncil() {
    if (!selectedTopicToAssign || !targetCouncilSelect) return
    try {
      const res = await fetch("/api/councils", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "assign_project_to_council",
          councilId: targetCouncilSelect,
          projectId: selectedTopicToAssign.id
        })
      })
      const data = await res.json()
      if (data.success) {
        setLocalCouncils(data.councils)
        if (data.unassignedProjects) {
          setUnassignedList(data.unassignedProjects)
        }
      }
    } catch (err) {
      console.error("Error assigning topic:", err)
    }
    setTopicAssignDialogOpen(false)
    setSelectedTopicToAssign(null)
  }

  const [deleteCouncilOpen, setDeleteCouncilOpen] = useState(false)
  const [councilToDelete, setCouncilToDelete] = useState<Council | null>(null)

  function openDeleteCouncilConfirm(c: Council) {
    setCouncilToDelete(c)
    setDeleteCouncilOpen(true)
  }

  async function confirmDeleteCouncil() {
    if (!councilToDelete) return
    try {
      const res = await fetch("/api/councils", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_council",
          id: councilToDelete.id
        })
      })
      const data = await res.json()
      if (data.success) {
        setLocalCouncils(data.councils)
        if (data.unassignedProjects) {
          setUnassignedList(data.unassignedProjects)
        }
      }
    } catch (err) {
      console.error("Error deleting council:", err)
    }
    setDeleteCouncilOpen(false)
    setCouncilToDelete(null)
  }

  const [createCouncilOpen, setCreateCouncilOpen] = useState(false)
  const [councilForm, setCouncilForm] = useState({
    name: "",
    date: "2026-09-25",
    timeSlot: "08:00 - 11:30",
    room: "",
    president: "TS. Nguyễn Văn An",
    secretary: "ThS. Trần Thị Bình",
    member: "TS. Lê Hoàng Cường"
  })
  const [councilError, setCouncilError] = useState("")
  const [localCouncils, setLocalCouncils] = useState<Council[]>([])

  useEffect(() => {
    requestTopicsForAssignment()
  }, [])

  async function requestTopicsForAssignment() {
    await callGetApprovedTopicsAPI()
  }

  async function callGetApprovedTopicsAPI() {
    try {
      const res = await fetch("/api/councils")
      const data = await res.json()
      if (data.success) {
        setAssignments(data.reviewAssignments || [])
        setLocalCouncils(data.councils || [])
        setIssued(data.issued || false)
        setGrades(data.councilGrades || {})
      }
    } catch (err) {
      console.error("Error fetching councils data:", err)
    }
  }

  function openAssignDialog(councilId: string) {
    setAssignCouncilId(councilId)
    setAssignProjectId("")
    setAssignDialogOpen(true)
  }

  async function confirmAssignProject() {
    if (!assignCouncilId || !assignProjectId) return
    try {
      const res = await fetch("/api/councils", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "assign_project_to_council",
          councilId: assignCouncilId,
          projectId: assignProjectId
        })
      })
      const data = await res.json()
      if (data.success) {
        setLocalCouncils(data.councils)
        if (data.unassignedProjects) {
          setUnassignedList(data.unassignedProjects)
        }
      }
    } catch (err) {
      console.error("Error assigning project:", err)
    }
    setAssignDialogOpen(false)
  }

  async function sendIssueDecisionRequest() {
    try {
      const res = await fetch("/api/councils", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "issue_decision" })
      })
      const data = await res.json()
      if (data.success) {
        setIssued(true)
      }
    } catch (err) {
      console.error("Error issuing decision:", err)
    }
  }

  // 26. Đề xuất GV phản biện
  async function sendAssignmentRequest(id: string, reviewer: string) {
    await callSaveAssignmentAPI(id, reviewer)
  }

  async function callSaveAssignmentAPI(id: string, reviewer: string) {
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

  async function saveGrade() {
    if (gradeValue === "") {
      setGradeError("Vui lòng nhập điểm số bảo vệ.")
      return
    }
    const v = Number(gradeValue)
    if (isNaN(v) || v < 0 || v > 10) {
      setGradeError("Điểm số không hợp lệ. Điểm phải nằm trong thang điểm từ 0 đến 10.")
      return
    }
    try {
      const parts = gradeKey.split("-")
      const councilId = parts[0]
      const projectIndex = parts[1]
      const res = await fetch("/api/councils", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_council_grade",
          councilId,
          projectIndex: Number(projectIndex),
          grade: v
        })
      })
      const data = await res.json()
      if (data.success) {
        setGrades(data.councilGrades || {})
      }
    } catch (err) {
      console.error("Error saving grade:", err)
    }
    setGradeError("")
    setGradeOpen(false)
  }

  async function sendSaveReviewerEvaluation() {
    if (!reviewGrade.trim()) return
    try {
      const res = await fetch("/api/councils", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_reviewer_evaluation",
          id: reviewTargetId,
          comment: reviewText.trim(),
          grade: Number(reviewGrade)
        })
      })
      const data = await res.json()
      if (data.success) {
        setAssignments(data.reviewAssignments || [])
        setReviewOpen(false)
      }
    } catch (err) {
      console.error("Error saving reviewer evaluation:", err)
    }
  }

  async function sendCouncilInfo() {
    if (!councilForm.name.trim() || !councilForm.room.trim() || !councilForm.date || !councilForm.timeSlot || !councilForm.president.trim() || !councilForm.secretary.trim() || !councilForm.member.trim()) {
      setCouncilError("Vui lòng nhập đầy đủ thông tin hội đồng, thời gian, phòng và các thành viên.")
      return
    }

    await saveCouncil()

    setCouncilForm({ name: "", date: "2026-09-25", timeSlot: "08:00 - 11:30", room: "", president: "TS. Nguyễn Văn An", secretary: "ThS. Trần Thị Bình", member: "TS. Lê Hoàng Cường" })
    setCouncilError("")
    setCreateCouncilOpen(false)
  }

  async function saveCouncil() {
    try {
      const dateParts = councilForm.date.split("-")
      const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : councilForm.date
      const formattedTime = `${councilForm.timeSlot}, ${formattedDate}`
      const semId = selectedSemesterFilter !== "all" ? selectedSemesterFilter : "dt-2026-t8"

      const res = await fetch("/api/councils", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_council",
          name: councilForm.name.trim(),
          room: councilForm.room.trim(),
          time: formattedTime,
          members: [councilForm.president.trim(), councilForm.secretary.trim(), councilForm.member.trim()],
          projects: [],
          semesterId: semId
        })
      })
      const data = await res.json()
      if (data.success) {
        setLocalCouncils(data.councils)
      }
    } catch (err) {
      console.error("Error creating council:", err)
    }
  }

  const [activeTab, setActiveTab] = useState<string>("councils")

  // Xuất điểm Hội đồng bảo vệ theo đợt đang chọn
  function exportCouncilGrades() {
    const header = "Hội đồng,Đề tài,Sinh viên,Thời gian bảo vệ,Phòng,Điểm Hội đồng\n"
    const lines: string[] = []

    const targetCouncils = localCouncils.filter((c) => {
      if (selectedSemesterFilter !== "all") {
        const cSem = c.semesterId || "dt-2025-1"
        return cSem === selectedSemesterFilter
      }
      return true
    })

    targetCouncils.forEach((c) => {
      c.projects.forEach((p, i) => {
        const g = grades[`${c.id}-${i}`]
        lines.push(`"${c.name}","${p.title}","${p.student}","${c.time}","${c.room}",${g ?? "Chưa nhập"}`)
      })
    })

    const blob = new Blob(["\uFEFF" + header + lines.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    const semName = selectedSemesterFilter === "dt-2026-t8" ? "Thang-8-2026" : selectedSemesterFilter === "dt-2025-1" ? "Dot-1-2025" : "Tat-ca"
    a.download = `bang-diem-hoi-dong-${semName}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Xuất điểm Phản biện theo đợt đang chọn
  function exportReviewerGrades() {
    const header = "Đề tài,Sinh viên,Giảng viên Phản biện,Điểm Phản biện,Nhận xét\n"
    const lines: string[] = []

    const targetAssignments = assignments.filter((a: any) => {
      if (selectedSemesterFilter !== "all") {
        const aSem = a.semesterId || "dt-2025-1"
        return aSem === selectedSemesterFilter
      }
      return true
    })

    targetAssignments.forEach((a: any) => {
      lines.push(`"${a.topicTitle}","${a.student}","${a.reviewer || "Chưa phân công"}",${a.grade ?? "Chưa nhập"},"${a.comment || ""}"`)
    })

    const blob = new Blob(["\uFEFF" + header + lines.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    const semName = selectedSemesterFilter === "dt-2026-t8" ? "Thang-8-2026" : selectedSemesterFilter === "dt-2025-1" ? "Dot-1-2025" : "Tat-ca"
    a.download = `bang-diem-phan-bien-${semName}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function revokeProjectFromCouncil(councilId: string, projectTitle: string) {
    try {
      const res = await fetch("/api/councils", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "revoke_project_from_council",
          councilId,
          projectTitle
        })
      })
      const data = await res.json()
      if (data.success) {
        setLocalCouncils(data.councils)
        if (data.unassignedProjects) {
          setUnassignedList(data.unassignedProjects)
        }
      }
    } catch (err) {
      console.error("Error revoking project:", err)
    }
  }

  const isStudent = user?.role === "Sinh viên"
    const currentStudentName = user?.name || "Nguyễn Văn Đạt"

    const studentCouncil = localCouncils.find((c) =>
      c.projects.some((p) => {
        const sName = p.student.trim()
        const target = currentStudentName.trim()
        return sName === target || sName.includes(target) || target.includes(sName)
      })
    )

    const studentProjectIndex = studentCouncil
      ? studentCouncil.projects.findIndex((p) => {
          const sName = p.student.trim()
          const target = currentStudentName.trim()
          return sName === target || sName.includes(target) || target.includes(sName)
        })
      : -1

    const studentProject = studentCouncil && studentProjectIndex !== -1 ? studentCouncil.projects[studentProjectIndex] : null

    const studentReview = assignments.find((a: any) => {
      const sName = a.student.trim()
      const target = currentStudentName.trim()
      return sName === target || sName.includes(target) || target.includes(sName)
    })

    const studentGrade = studentCouncil && studentProjectIndex !== -1 ? grades[`${studentCouncil.id}-${studentProjectIndex}`] : undefined

    return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="outline" className="gap-1.5 py-1 px-3 bg-primary/5 text-primary border-primary/20 font-medium text-xs">
              <CalendarRange className="size-3.5" />
              Đợt bảo vệ: <span className="font-semibold">Đợt ĐATN Tháng 8 - 9/2026</span>
            </Badge>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Phản biện &amp; Hội đồng</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isStudent ? "Xem lịch bảo vệ hội đồng, kết quả chấm phản biện và điểm tổng kết của bản thân." : "Phân công phản biện, xếp lịch hội đồng bảo vệ và nhập điểm tổng kết."}
          </p>
        </div>
        {!isStudent && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
              <CalendarRange className="size-3.5" />
              Đợt:
            </span>
            <Select value={selectedSemesterFilter} onValueChange={(v) => { if (v) setSelectedSemesterFilter(v) }}>
              <SelectTrigger className="w-[250px] h-9 text-xs bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dt-2026-t8">Tháng 8 - 9/2026 (Hiện tại)</SelectItem>
                <SelectItem value="dt-2025-1">Đợt 1 - HK I 2025-2026 (Quá khứ)</SelectItem>
                <SelectItem value="all">Tất cả các đợt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {isStudent && (
        <Card className="border-emerald-600/30 bg-emerald-500/5 overflow-hidden">
          <CardHeader className="border-b border-emerald-600/20 bg-emerald-500/10 py-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="size-6 text-emerald-600" />
                <div>
                  <h3 className="text-base font-semibold text-foreground">Lịch bảo vệ &amp; Kết quả đánh giá đồ án</h3>
                  <p className="text-xs text-muted-foreground">Thông tin chi tiết về hội đồng bảo vệ, nhận xét phản biện và điểm số của bạn</p>
                </div>
              </div>
              {studentCouncil ? (
                <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">Đã xếp lịch bảo vệ</Badge>
              ) : (
                <Badge variant="outline" className="text-amber-600 border-amber-600/30 bg-amber-500/10">Chưa xếp lịch</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 pt-5">
            {studentCouncil ? (() => {
              const scoreGVHD = studentReview?.instructorGrade
              const scoreGVPB = studentReview?.grade
              const scoreHoiDong = studentGrade

              const hasAll = scoreGVHD !== undefined && scoreGVHD !== null && scoreGVPB !== undefined && scoreGVPB !== null && scoreHoiDong !== undefined && scoreHoiDong !== null
              const finalGPA = hasAll ? (scoreGVHD * 0.3 + scoreGVPB * 0.3 + scoreHoiDong * 0.4).toFixed(1) : null

              return (
                <div className="flex flex-col gap-6">
                  {/* Row 1: Council Schedule Info */}
                  <div className="rounded-lg border border-border p-4 bg-card shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-3">
                      <Clock className="size-4 text-emerald-600" /> Thông tin Hội đồng bảo vệ đồ án tốt nghiệp
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div className="md:col-span-2">
                        <span className="text-muted-foreground text-xs">Đề tài đồ án:</span>
                        <p className="font-semibold text-foreground text-sm mt-0.5">{studentProject?.title}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Thời gian bảo vệ:</span>
                        <p className="font-semibold text-foreground text-xs mt-0.5">{studentCouncil.time}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Địa điểm / Phòng:</span>
                        <p className="mt-0.5">
                          <Badge className="bg-emerald-600/15 text-emerald-600 font-bold border border-emerald-600/30">{studentCouncil.room}</Badge>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: 3 Component Score Breakdown */}
                  <div className="flex flex-col gap-4 rounded-lg border border-emerald-600/30 p-4 bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <Award className="size-4 text-emerald-600" /> Bảng tổng kết 3 thành phần điểm đồ án tốt nghiệp
                      </h4>
                      {hasAll ? (
                        <Badge className="bg-emerald-600 text-white font-bold text-xs">
                          {Number(finalGPA) >= 8.5 ? "ĐẠT - XẾP LOẠI XUẤT SẮC" : Number(finalGPA) >= 7.0 ? "ĐẠT - XẾP LOẠI KHÁ" : "ĐẠT - TRUNG BÌNH"}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-600/30 bg-amber-500/10 text-xs font-medium">
                          Đang chờ các thành viên chấm điểm đầy đủ
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Component 1: GVHD */}
                      <div className="p-3.5 rounded-lg bg-blue-500/10 border border-blue-500/25 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase">1. Điểm GV Hướng dẫn (30%)</span>
                            {scoreGVHD !== undefined && scoreGVHD !== null ? (
                              <Badge className="bg-blue-600 text-white font-bold text-xs">{scoreGVHD.toFixed(1)} / 10</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px]">Chưa chấm</Badge>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-foreground mt-1.5">TS. Nguyễn Văn An</p>
                          <p className="text-[11px] text-muted-foreground italic mt-1.5 leading-relaxed">
                            &quot;{studentReview?.instructorComment || "Chưa có nhận xét GVHD."}&quot;
                          </p>
                        </div>
                      </div>

                      {/* Component 2: GVPB */}
                      <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/25 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase">2. Điểm GV Phản biện (30%)</span>
                            {scoreGVPB !== undefined && scoreGVPB !== null ? (
                              <Badge className="bg-amber-600 text-white font-bold text-xs">{scoreGVPB.toFixed(1)} / 10</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px]">Chưa chấm</Badge>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-foreground mt-1.5">{studentReview?.reviewer || "PGS.TS. Phạm Minh Dũng"}</p>
                          <p className="text-[11px] text-muted-foreground italic mt-1.5 leading-relaxed">
                            &quot;{studentReview?.comment || "Chưa có nhận xét GVPB."}&quot;
                          </p>
                        </div>
                      </div>

                      {/* Component 3: Hoi Dong */}
                      <div className="p-3.5 rounded-lg bg-purple-500/10 border border-purple-500/25 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase">3. Điểm Hội đồng bảo vệ (40%)</span>
                            {scoreHoiDong !== undefined && scoreHoiDong !== null ? (
                              <Badge className="bg-purple-600 text-white font-bold text-xs">{scoreHoiDong.toFixed(1)} / 10</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px]">Chưa chấm</Badge>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-foreground mt-1.5">{studentCouncil.name}</p>
                          <p className="text-[11px] text-muted-foreground italic mt-1.5 leading-relaxed">
                            {scoreHoiDong !== undefined && scoreHoiDong !== null
                              ? '"Thuyết trình tự tin, phản biện tốt các câu hỏi mở."'
                              : "Hội đồng chưa chấm điểm."}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Final Average Grade Banner */}
                    <div className="flex flex-col sm:flex-row items-center justify-between bg-emerald-500/10 p-4 rounded-lg border border-emerald-600/30 gap-3 mt-1">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="size-6 text-emerald-600 shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wide">TỔNG KẾT ĐIỂM BẢO VỆ ĐỒ ÁN TỐT NGHIỆP</span>
                          <p className="text-xs text-muted-foreground mt-0.5">Công thức: (GVHD × 30%) + (GVPB × 30%) + (Hội đồng × 40%)</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {hasAll ? (
                          <span className="text-2xl font-extrabold text-emerald-600">{finalGPA} / 10.0</span>
                        ) : (
                          <span className="text-xs font-semibold text-amber-600 italic">Chưa tổng kết điểm</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })() : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Đồ án của bạn đang được <span className="font-medium text-foreground">Người phụ trách đồ án</span> sắp xếp hội đồng và phân công phản biện. Vui lòng kiểm tra lại sau.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!isStudent && (() => {
        const rawRole = (user as any)?.rawRole
        const isReviewerOnly = rawRole === "reviewer"
        const isCouncilOnly = rawRole === "council"
        const defaultTab = isReviewerOnly ? "reviewers" : "councils"

        return (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)} className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <TabsList className="shrink-0">
                {(!isReviewerOnly || isAdmin) && (
                  <TabsTrigger value="councils">
                    {isCouncilOnly ? "Hội đồng bảo vệ của tôi" : "Hội đồng bảo vệ"}
                  </TabsTrigger>
                )}
                {(!isCouncilOnly || isAdmin) && (
                  <TabsTrigger value="reviewers">
                    {isReviewerOnly ? "Đề tài được phân công Phản biện" : "Phân công phản biện"}
                  </TabsTrigger>
                )}
              </TabsList>

              {isAdmin && (
                <div className="flex items-center gap-2">
                  {activeTab === "councils" ? (
                    <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={exportCouncilGrades}>
                      <FileDown className="size-4" aria-hidden="true" />
                      Xuất điểm Hội đồng
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={exportReviewerGrades}>
                      <FileDown className="size-4" aria-hidden="true" />
                      Xuất điểm Phản biện
                    </Button>
                  )}
                  {activeTab === "councils" && (
                    <Button size="sm" className="gap-2 text-xs" onClick={() => setCreateCouncilOpen(true)}>
                      <CalendarPlus className="size-4" aria-hidden="true" />
                      Tạo hội đồng
                    </Button>
                  )}
                </div>
              )}
            </div>

        {/* ---- Councils kanban ---- */}
        <TabsContent value="councils" className="mt-2 flex flex-col gap-4">
          {!isAdmin && user?.role !== "Sinh viên" && (
            <div className="rounded-md bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-700 dark:text-amber-400 font-medium">
              {isCouncilOnly
                ? "Lưu ý: Bạn đang ở màn hình Chấm điểm Hội đồng. Vui lòng tải quyển đồ án của sinh viên và nhập điểm bảo vệ trực tiếp."
                : "Lưu ý: Giảng viên chỉ có quyền xem lịch hội đồng và chấm điểm các đề tài thuộc hội đồng của mình. Chỉ Người phụ trách đồ án có quyền tạo hội đồng và xếp lịch."}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            {/* Left: unassigned (only for Admin) */}
            {isAdmin && (
              <div className="lg:col-span-2">
                <Card className="h-full bg-muted/30">
                  {(() => {
                    const filteredUnassigned = unassignedList.filter((p: any) => {
                      const pSem = p.semesterId || "dt-2026-t8"
                      if (selectedSemesterFilter !== "all" && pSem !== selectedSemesterFilter) {
                        return false
                      }
                      const isAlreadyAssigned = localCouncils.some((c: any) =>
                        c.projects.some((cp: any) => {
                          const title1 = (cp.title || "").trim().toLowerCase()
                          const title2 = (p.title || "").trim().toLowerCase()
                          return title1 === title2 || title1.includes(title2) || title2.includes(title1)
                        })
                      )
                      return !isAlreadyAssigned
                    })

                    return (
                      <>
                        <CardHeader className="flex flex-row items-center justify-between gap-2">
                          <h3 className="text-sm font-semibold text-foreground">Đề tài chưa xếp lịch</h3>
                          <Badge variant="secondary" className="text-muted-foreground font-semibold">
                            {filteredUnassigned.length}
                          </Badge>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                          {filteredUnassigned.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic text-center py-4">
                              Tất cả đề tài trong đợt này đã được xếp lịch hội đồng.
                            </p>
                          ) : (
                            filteredUnassigned.map((p) => (
                              <div key={p.id} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card p-3 shadow-sm hover:border-primary/40 transition-colors">
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium leading-snug text-foreground text-pretty">{p.title}</p>
                                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <User className="size-3.5" aria-hidden="true" />
                                    {p.student} · {p.instructor}
                                  </p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-8 shrink-0 gap-1 font-medium"
                                  onClick={() => openTopicAssignModal(p)}
                                  title="Xếp lịch hội đồng cho đề tài này"
                                >
                                  <Plus className="size-3.5" /> Xếp lịch
                                </Button>
                              </div>
                            ))
                          )}
                        </CardContent>
                      </>
                    )
                  })()}
                </Card>
              </div>
            )}

            {/* Right: councils */}
            <div className={isAdmin ? "flex flex-col gap-4 lg:col-span-3" : "flex flex-col gap-4 lg:col-span-5"}>
              {(() => {
                const currentTeacherName = user?.name || ""
                const displayCouncils = localCouncils.filter((c) => {
                  if (!isAdmin) {
                    const matchMember = c.members.some((m) => {
                      const cleanM = m.trim()
                      const cleanT = currentTeacherName.trim()
                      return cleanM === cleanT || cleanM.includes(cleanT) || cleanT.includes(cleanM)
                    })
                    if (!matchMember) return false
                  }
                  if (selectedSemesterFilter !== "all") {
                    const cSem = c.semesterId || "dt-2025-1"
                    return cSem === selectedSemesterFilter
                  }
                  return true
                })

                if (displayCouncils.length === 0) {
                  return (
                    <Card className="p-8 text-center text-sm text-muted-foreground">
                      Bạn chưa được xếp lịch tham gia hội đồng bảo vệ nào trong đợt này.
                    </Card>
                  )
                }

                return displayCouncils.map((c) => (
                <Card key={c.id}>
                  <CardHeader className="gap-2 border-b border-border flex flex-row items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{c.name}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
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
                    </div>
                    {isAdmin && c.semesterId !== "dt-2025-1" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => openDeleteCouncilConfirm(c)}
                        title="Xóa hội đồng này"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    {c.projects.map((p, i) => {
                      const key = `${c.id}-${i}`
                      const councilScore = grades[key]
                      const isLockedCouncil = c.semesterId === "dt-2025-1"

                      const rev = assignments.find((a: any) => {
                        const s1 = (a.student || "").trim().toLowerCase()
                        const s2 = (p.student || "").trim().toLowerCase()
                        return s1 === s2 || s1.includes(s2) || s2.includes(s1)
                      })

                      const gvhdScore = rev?.instructorGrade ?? (isLockedCouncil ? 9.0 : undefined)
                      const gvpbScore = rev?.grade ?? (isLockedCouncil ? 8.5 : undefined)

                      const hasFull3Scores = gvhdScore !== undefined && gvhdScore !== null &&
                                             gvpbScore !== undefined && gvpbScore !== null &&
                                             councilScore !== undefined && councilScore !== null

                      const totalGrade = hasFull3Scores
                        ? (gvhdScore * 0.3 + gvpbScore * 0.3 + councilScore * 0.4).toFixed(1)
                        : councilScore !== undefined ? councilScore.toFixed(1) : null

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
                            {totalGrade !== null ? (
                              <Badge className="bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs border border-emerald-600/20">
                                {hasFull3Scores ? `Điểm tổng kết: ${totalGrade}` : `Điểm HĐ: ${totalGrade}`}
                              </Badge>
                            ) : null}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-primary"
                              onClick={() => downloadThesis(p.title)}
                              title="Tải quyển ĐATN để chấm"
                            >
                              <Download className="size-4" aria-hidden="true" />
                            </Button>
                            {isAdmin && !isLockedCouncil && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground hover:text-destructive"
                                onClick={() => revokeProjectFromCouncil(c.id, p.title)}
                                title="Thu hồi / Hủy xếp lịch đề tài này khỏi hội đồng"
                              >
                                <X className="size-4" aria-hidden="true" />
                              </Button>
                            )}
                            {!isAdmin && (
                              isLockedCouncil ? (
                                <Button variant="outline" size="sm" disabled className="gap-1 opacity-60 bg-muted/40 cursor-not-allowed">
                                  <Lock className="size-3.5" /> Đã chốt điểm
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1"
                                  onClick={() => {
                                    setGradeKey(key)
                                    setGradeStudent(p.student)
                                    setGradeValue(councilScore !== undefined ? String(councilScore) : "")
                                    setGradeError("")
                                    setGradeOpen(true)
                                  }}
                                >
                                  <GraduationCap className="size-4" aria-hidden="true" />
                                  {councilScore !== undefined ? "Sửa điểm" : "Nhập điểm"}
                                </Button>
                              )
                            )}
                          </div>
                        </div>
                      )
                    })}
                    {isAdmin && c.semesterId !== "dt-2025-1" && (
                      <button
                        type="button"
                        onClick={() => openAssignDialog(c.id)}
                        className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary cursor-pointer w-full mt-1"
                      >
                        <Plus className="size-4" aria-hidden="true" />
                      </button>
                    )}
                  </CardContent>
                </Card>
              ))
              })()}
            </div>
          </div>
        </TabsContent>

        {/* ---- Reviewer assignment ---- */}
        <TabsContent value="reviewers" className="mt-4 flex flex-col gap-4">
          {!isAdmin && user?.role !== "Sinh viên" && (
            <div className="rounded-md bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-700 dark:text-amber-400 font-medium">
              {isReviewerOnly
                ? "Lưu ý: Bạn đang ở màn hình Chấm điểm Phản biện. Bấm vào biểu tượng Tải về để xem quyển ĐATN và bấm biểu tượng Tin nhắn để nhập nhận xét & điểm phản biện."
                : "Lưu ý: Chỉ Người phụ trách đồ án có quyền phân công Giảng viên phản biện và ban hành quyết định. Giảng viên chỉ có quyền xem thông tin phân công."}
            </div>
          )}
          <div className="flex justify-end">
            <Button className="gap-2" disabled={!isAdmin || issued} onClick={sendIssueDecisionRequest}>
              <FileSignature className="size-4" aria-hidden="true" />
              {issued ? "Đã ban hành QĐ phân công" : "Ban hành QĐ phân công"}
            </Button>
          </div>
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Đề tài</TableHead>
                    <TableHead className="font-semibold">Sinh viên</TableHead>
                    {!isReviewerOnly && (
                      <TableHead className="min-w-[220px] font-semibold">GV phản biện</TableHead>
                    )}
                    {isReviewerOnly && (
                      <TableHead className="font-semibold">Thời gian bảo vệ</TableHead>
                    )}
                    {isReviewerOnly && (
                      <TableHead className="font-semibold">Phòng</TableHead>
                    )}
                    <TableHead className="font-semibold">Điểm PB</TableHead>
                    <TableHead className="text-right font-semibold">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments
                    .filter((a: any) => {
                      if (isReviewerOnly) {
                        const uName = (user?.name || "").trim()
                        const rName = (a.reviewer || "").trim()
                        if (rName !== uName && !rName.includes(uName) && !uName.includes(rName)) return false
                      }
                      if (selectedSemesterFilter !== "all") {
                        const aSem = a.semesterId || "dt-2025-1"
                        return aSem === selectedSemesterFilter
                      }
                      return true
                    })
                    .map((a: any) => {
                    // Lookup council info for this topic
                    const council = localCouncils.find((c) =>
                      c.projects.some((p) => p.title === a.topicTitle || p.student === a.student)
                    )
                    const isLocked = a.semesterId === "dt-2025-1"

                    return (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium text-foreground">{a.topicTitle}</TableCell>
                      <TableCell className="text-muted-foreground">{a.student}</TableCell>
                      {!isReviewerOnly && (
                        <TableCell>
                          <Select
                            value={a.reviewer ?? ""}
                            disabled={!isAdmin || issued}
                            onValueChange={(v) => sendAssignmentRequest(a.id, v || "")}
                          >
                            <SelectTrigger className="w-full bg-card">
                              <SelectValue placeholder="Chưa phân công..." />
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
                      )}
                      {isReviewerOnly && (
                        <TableCell>
                          {council ? (
                            <div className="flex items-center gap-1.5 text-sm text-foreground">
                              <Clock className="size-3.5 shrink-0 text-muted-foreground" />
                              {council.time}
                            </div>
                          ) : (
                            <span className="text-xs text-amber-600 font-medium italic">Chưa xếp lịch bảo vệ</span>
                          )}
                        </TableCell>
                      )}
                      {isReviewerOnly && (
                        <TableCell>
                          {council ? (
                            <div className="flex items-center gap-1.5 text-sm text-foreground">
                              <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
                              {council.room}
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-amber-600 bg-amber-500/10 border-amber-500/30 text-xs font-medium">
                              Chưa phân phòng
                            </Badge>
                          )}
                        </TableCell>
                      )}
                      <TableCell>
                        {a.grade !== undefined && a.grade !== null ? (
                          <Badge className="bg-emerald-600/15 text-emerald-600 border border-emerald-600/30">
                            {a.grade} điểm
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Chưa chấm</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-primary"
                            aria-label={`Tải quyển ĐATN ${a.topicTitle}`}
                            onClick={() => downloadThesis(a.topicTitle)}
                            title="Tải quyển ĐATN để chấm"
                          >
                            <Download className="size-4" aria-hidden="true" />
                          </Button>
                          {isLocked ? (
                            <Button variant="outline" size="sm" disabled className="gap-1 opacity-60 bg-muted/40 cursor-not-allowed text-xs" title="Đợt quá khứ đã chốt điểm">
                              <Lock className="size-3.5" /> Đã chốt
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-primary"
                              aria-label={`Nhập nhận xét phản biện ${a.topicTitle}`}
                              onClick={() => {
                                setReviewTargetId(a.id)
                                setReviewTarget(a.topicTitle)
                                setReviewText(a.comment || "")
                                setReviewGrade(a.grade !== undefined ? String(a.grade) : "")
                                setReviewOpen(true)
                              }}
                              title="Nhập nhận xét & điểm phản biện"
                            >
                              <MessageSquarePlus className="size-4" aria-hidden="true" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
        )
      })()}

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
            <Button onClick={sendSaveReviewerEvaluation} disabled={!reviewText.trim() || !reviewGrade.trim()}>
              Lưu nhận xét &amp; điểm
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
            <DialogDescription>Thiết lập thông tin hội đồng bảo vệ, chọn ngày giờ và địa điểm phòng.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="cName">Tên hội đồng</Label>
              <Input
                id="cName"
                placeholder="VD: Hội đồng số 03 - Công nghệ phần mềm"
                value={councilForm.name}
                onChange={(e) => setCouncilForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="cDate">Ngày bảo vệ</Label>
                <Input
                  id="cDate"
                  type="date"
                  value={councilForm.date}
                  onChange={(e) => setCouncilForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="cTimeSlot">Khung giờ</Label>
                <Select value={councilForm.timeSlot} onValueChange={(v) => setCouncilForm((f) => ({ ...f, timeSlot: v || "08:00 - 11:30" }))}>
                  <SelectTrigger id="cTimeSlot" className="bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="08:00 - 11:30">Sáng (08:00 - 11:30)</SelectItem>
                    <SelectItem value="13:30 - 17:00">Chiều (13:30 - 17:00)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cRoom">Phòng bảo vệ</Label>
              <Input
                id="cRoom"
                placeholder="VD: Phòng A3.05"
                value={councilForm.room}
                onChange={(e) => setCouncilForm((f) => ({ ...f, room: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cPresident" className="text-xs font-medium">Chủ tịch</Label>
                <Select value={councilForm.president} onValueChange={(v) => setCouncilForm((f) => ({ ...f, president: v || "" }))}>
                  <SelectTrigger id="cPresident" className="bg-card text-xs h-9">
                    <SelectValue placeholder="Chọn Chủ tịch..." />
                  </SelectTrigger>
                  <SelectContent>
                    {reviewerOptions.map((r) => (
                      <SelectItem key={r} value={r} className="text-xs">
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cSecretary" className="text-xs font-medium">Thư ký</Label>
                <Select value={councilForm.secretary} onValueChange={(v) => setCouncilForm((f) => ({ ...f, secretary: v || "" }))}>
                  <SelectTrigger id="cSecretary" className="bg-card text-xs h-9">
                    <SelectValue placeholder="Chọn Thư ký..." />
                  </SelectTrigger>
                  <SelectContent>
                    {reviewerOptions.map((r) => (
                      <SelectItem key={r} value={r} className="text-xs">
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cMember" className="text-xs font-medium">Ủy viên PB</Label>
                <Select value={councilForm.member} onValueChange={(v) => setCouncilForm((f) => ({ ...f, member: v || "" }))}>
                  <SelectTrigger id="cMember" className="bg-card text-xs h-9">
                    <SelectValue placeholder="Chọn Ủy viên PB..." />
                  </SelectTrigger>
                  <SelectContent>
                    {reviewerOptions.map((r) => (
                      <SelectItem key={r} value={r} className="text-xs">
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {councilError ? <p className="text-sm text-destructive">{councilError}</p> : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateCouncilOpen(false)}>
              Hủy
            </Button>
            <Button onClick={sendCouncilInfo}>Khởi tạo hội đồng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign project to council dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Phân phòng &amp; xếp lịch đề tài</DialogTitle>
            <DialogDescription>Chọn đề tài chưa xếp lịch để thêm vào hội đồng bảo vệ này.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <Label htmlFor="projSelect">Chọn đề tài</Label>
            <Select value={assignProjectId} onValueChange={(v) => setAssignProjectId(v || "")}>
              <SelectTrigger id="projSelect" className="w-full bg-card">
                <SelectValue placeholder="-- Chọn đề tài chưa xếp lịch --" />
              </SelectTrigger>
              <SelectContent>
                {unassignedList
                  .filter((p: any) => selectedSemesterFilter === "all" || (p.semesterId || "dt-2026-t8") === selectedSemesterFilter)
                  .map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.student} - {p.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {unassignedList.filter((p: any) => selectedSemesterFilter === "all" || (p.semesterId || "dt-2026-t8") === selectedSemesterFilter).length === 0 && (
              <p className="text-xs text-amber-600 font-medium">Không còn đề tài nào chưa xếp lịch trong đợt này.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={confirmAssignProject} disabled={!assignProjectId}>
              Xác nhận xếp lịch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Confirm Delete Council Dialog */}
      <Dialog open={deleteCouncilOpen} onOpenChange={setDeleteCouncilOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Xác nhận xóa hội đồng</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa hội đồng <span className="font-semibold text-foreground">{councilToDelete?.name}</span>? Tất cả đề tài thuộc hội đồng này sẽ được tự động trả về cột &quot;Đề tài chưa xếp lịch&quot;.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCouncilOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDeleteCouncil}>
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign topic from left list to council dialog */}
      <Dialog open={topicAssignDialogOpen} onOpenChange={setTopicAssignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xếp lịch hội đồng bảo vệ</DialogTitle>
            <DialogDescription>
              Đề tài: <span className="font-semibold text-foreground">{selectedTopicToAssign?.title}</span> ({selectedTopicToAssign?.student})
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <Label htmlFor="councilSel">Chọn hội đồng bảo vệ</Label>
            <Select value={targetCouncilSelect} onValueChange={(v) => setTargetCouncilSelect(v || "")}>
              <SelectTrigger id="councilSel" className="w-full bg-card">
                <SelectValue placeholder="-- Chọn hội đồng --" />
              </SelectTrigger>
              <SelectContent>
                {localCouncils
                  .filter((c) => selectedSemesterFilter === "all" || (c.semesterId || "dt-2026-t8") === selectedSemesterFilter)
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.room} · {c.time})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {localCouncils.filter((c) => selectedSemesterFilter === "all" || (c.semesterId || "dt-2026-t8") === selectedSemesterFilter).length === 0 && (
              <p className="text-xs text-amber-600 font-medium">Chưa có hội đồng nào trong đợt này. Vui lòng bấm &quot;Tạo hội đồng&quot; trước.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTopicAssignDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={confirmAssignTopicToCouncil} disabled={!targetCouncilSelect}>
              Xác nhận xếp lịch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
