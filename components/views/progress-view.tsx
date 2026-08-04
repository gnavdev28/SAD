"use client"

import { useState, useRef, useCallback, useEffect, Fragment } from "react"
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Trash2,
  CalendarClock,
  MessageSquarePlus,
  BookCheck,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Download,
  Lock,
  CalendarRange,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  reportFiles,
  extensionRequests as initialExtensions,
  studentProgress,
  progressChart,
  type ReportFile,
  type ExtensionRequest,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"

function statusBadge(status: ReportFile["status"], isFinalThesis?: boolean) {
  if (status === "approved") {
    if (isFinalThesis) {
      return (
        <Badge className="gap-1 bg-emerald-600 text-white hover:bg-emerald-600">
          <CheckCircle2 className="size-3.5" aria-hidden="true" />
          Đã duyệt &amp; Khóa
        </Badge>
      )
    }
    return (
      <Badge className="gap-1 bg-primary/10 text-primary hover:bg-primary/10">
        <CheckCircle2 className="size-3.5" aria-hidden="true" />
        Đã duyệt
      </Badge>
    )
  }
  if (status === "pending") {
    return (
      <Badge variant="secondary" className="gap-1 text-secondary-foreground">
        <Clock className="size-3.5" aria-hidden="true" />
        Chờ duyệt
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="gap-1 bg-destructive/10 text-destructive hover:bg-destructive/10">
      <XCircle className="size-3.5" aria-hidden="true" />
      Từ chối
    </Badge>
  )
}

export interface ProgressViewProps {
  user?: { name: string; email: string; role: string }
}

export function ProgressView({ user }: ProgressViewProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<ReportFile[]>([])
  const [finalThesis, setFinalThesis] = useState<string | null>(null)
  // const [extensions, setExtensions] = useState<ExtensionRequest[]>([]); // duplicate removed
  const [studentProgressList, setStudentProgressList] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState<string>("dt-2026-t8")

  const inputRef = useRef<HTMLInputElement>(null)
  const replaceRef = useRef<HTMLInputElement>(null)
  const finalRef = useRef<HTMLInputElement>(null)
  const replaceTargetId = useRef<string | null>(null)

  // upload dialog state
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<FileList | null>(null)
  const [uploadProgress, setUploadProgress] = useState("")
  const [uploadError, setUploadError] = useState("")

  const [extOpen, setExtOpen] = useState(false)
  const [extForm, setExtForm] = useState({ reason: "", days: "" })
  const [extError, setExtError] = useState("")
  const [extensions, setExtensions] = useState<ExtensionRequest[]>(initialExtensions);
  function openExtensionDialog() {
    setExtForm({ reason: "", days: "" })
    setExtError("")
    setExtOpen(true)
  }
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewTarget, setReviewTarget] = useState<string>("")
  const [reviewText, setReviewText] = useState("")
  const [reviewGrade, setReviewGrade] = useState("")

  // dialog for confirming report deletion
  const [deleteFileOpen, setDeleteFileOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<ReportFile | null>(null)

  // expanded rows in combined student table
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set())

  // dialog for confirming student deletion (admin)
  const [deleteStudentOpen, setDeleteStudentOpen] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState<{ id: string; student: string } | null>(null)

  const isAdmin = user?.role === "admin" || user?.role === "Giáo vụ" || user?.role === "Người phụ trách đồ án (Quản trị)" || (user as any)?.rawRole === "admin"

  function openDeleteFileConfirm(file: ReportFile) {
    if (file.status === "approved") return
    setFileToDelete(file)
    setDeleteFileOpen(true)
  }

  async function handleConfirmDeleteFile() {
    if (!fileToDelete) return
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_report", id: fileToDelete.id })
      })
      const data = await res.json()
      if (data.success) {
        setFiles(data.reportFiles)
      }
    } catch (err) {
      console.error("Error deleting report file:", err)
    }
    setDeleteFileOpen(false)
    setFileToDelete(null)
  }

  function openDeleteStudentConfirm(p: any) {
    setStudentToDelete({ id: p.id, student: p.student })
    setDeleteStudentOpen(true)
  }

  async function confirmDeleteStudent() {
    if (!studentToDelete) return
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_student_progress", id: studentToDelete.id })
      })
      const data = await res.json()
      if (data.success) {
        setStudentProgressList(data.studentProgress)
      }
    } catch (err) {
      console.error("Error deleting student progress:", err)
    }
    setDeleteStudentOpen(false)
    setStudentToDelete(null)
  }

  // dialog for confirming report approval/rejection
  const [gradeConfirmOpen, setGradeConfirmOpen] = useState(false)
  const [gradeTarget, setGradeTarget] = useState<{ id: string; fileName: string; student: string; action: "approved" | "rejected" } | null>(null)

  function openGradeConfirm(f: ReportFile, action: "approved" | "rejected") {
    setGradeTarget({ id: f.id, fileName: f.fileName, student: f.student || "", action })
    setGradeConfirmOpen(true)
  }

  async function handleConfirmGrade() {
    if (!gradeTarget) return
    await gradeReport(gradeTarget.id, gradeTarget.action)
    setGradeConfirmOpen(false)
    setGradeTarget(null)
  }

  useEffect(() => {
    requestMilestoneInfo()
  }, [])

  async function requestMilestoneInfo() {
    await callQueryMilestoneAPI()
  }

  async function callQueryMilestoneAPI() {
    try {
      const res = await fetch("/api/progress")
      const data = await res.json()
      if (data.success) {
        setFiles(data.reportFiles)
        setExtensions(data.extensionRequests)
        setStudentProgressList(data.studentProgress)
        setChartData(data.progressChart)

        const studentName = (user?.name || "Nguyễn Văn Đạt").trim()
        const myFinal = (data.reportFiles || []).find((f: any) => {
          if (!f.student) return false
          const fStudent = f.student.trim()
          const match = fStudent === studentName || fStudent.includes(studentName) || studentName.includes(fStudent)
          return match && (f.isFinalThesis || (f.fileName && f.fileName.includes("[Quyển ĐATN]")))
        })
        if (myFinal) {
          setFinalThesis(myFinal.fileName)
        } else {
          setFinalThesis(null)
        }
      }
    } catch (err) {
      console.error("Error fetching progress data:", err)
    }
  }

  async function handleFinalThesisUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    const file = fileList[0]
    const studentName = user?.name || "Nguyễn Văn Đạt"
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_final_thesis",
          fileName: file.name,
          studentName,
          topicTitle: "Ứng dụng di động quản lý chi tiêu cá nhân"
        })
      })
      const data = await res.json()
      if (data.success) {
        setFiles(data.reportFiles)
        setStudentProgressList(data.studentProgress)
        setChartData(data.progressChart)
        const myFinal = (data.reportFiles || []).find((f: any) => {
          if (!f.student) return false
          const fStudent = f.student.trim()
          const sName = studentName.trim()
          return (fStudent === sName || fStudent.includes(sName) || sName.includes(fStudent)) &&
                 (f.isFinalThesis || (f.fileName && f.fileName.includes("[Quyển ĐATN]")))
        })
        setFinalThesis(myFinal ? myFinal.fileName : `[Quyển ĐATN] ${file.name}`)
      }
    } catch (err) {
      console.error("Error submitting final thesis:", err)
    }
  }

  async function handleCancelFinalThesis() {
    const studentName = user?.name || "Nguyễn Văn Đạt"
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cancel_final_thesis",
          studentName
        })
      })
      const data = await res.json()
      if (data.success) {
        setFiles(data.reportFiles)
        setStudentProgressList(data.studentProgress)
        setChartData(data.progressChart)
        setFinalThesis(null)
      }
    } catch (err) {
      console.error("Error cancelling final thesis:", err)
    }
  }

  const sendSubmitReportRequest = useCallback(async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    setPendingFiles(fileList)
    setUploadProgress("")
    setUploadError("")
    setUploadDialogOpen(true)
  }, [user])

  async function confirmUploadReport() {
    const newProgress = Number(uploadProgress)
    if (isNaN(newProgress) || uploadProgress.trim() === "" || newProgress < 0 || newProgress > 100) {
      setUploadError("Vui lòng nhập % tiến độ hợp lệ (0–100).")
      return
    }

    const studentName = user?.name || "Nguyễn Văn Đạt"
    const myFiles = files.filter((f) => f.student === studentName || (f.student && (f.student.includes(studentName) || studentName.includes(f.student))))
    const myProgressObj = studentProgressList.find((p) => p.student === studentName || p.student.includes(studentName) || studentName.includes(p.student))

    const maxPreviousProgress = myFiles.reduce(
      (max, f) => (f.progress !== undefined && f.progress > max ? f.progress : max),
      myProgressObj?.progress || 0
    )

    if (newProgress < maxPreviousProgress) {
      setUploadError(`Tiến độ mới (${newProgress}%) không được nhỏ hơn tiến độ đã khai trước đó (${maxPreviousProgress}%).`)
      return
    }

    await callSaveReportAPI(pendingFiles, newProgress)
    setUploadDialogOpen(false)
    setPendingFiles(null)
    setUploadProgress("")
  }

  const callSaveReportAPI = async (fileList: FileList | null, progressPercent: number = 0) => {
    if (!fileList || fileList.length === 0) return
    const file = fileList[0]
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_report",
          fileName: file.name,
          progressPercent,
          studentName: user?.name || "Nguyễn Văn Đạt",
          topicTitle: "Hệ thống nhận diện khuôn mặt điểm danh sinh viên"
        })
      })
      const data = await res.json()
      if (data.success) {
        setFiles(data.reportFiles)
        setStudentProgressList(data.studentProgress)
        setChartData(data.progressChart)
      }
    } catch (err) {
      console.error("Error uploading report:", err)
    }
  }

  // 18. Cập nhật file đè
  async function replaceFile(fileList: FileList | null) {
    const id = replaceTargetId.current
    if (!fileList || fileList.length === 0 || !id) return
    const file = fileList[0]
    try {
      // For mock simplicity, replace acts as deleting then submitting, or just a new submission
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_report",
          fileName: file.name,
          progressPercent: 55, // higher progress on replace
          studentName: user?.name || "Nguyễn Văn Đạt",
          topicTitle: "Hệ thống nhận diện khuôn mặt điểm danh sinh viên"
        })
      })
      const data = await res.json()
      if (data.success) {
        setFiles(data.reportFiles)
        setStudentProgressList(data.studentProgress)
        setChartData(data.progressChart)
      }
    } catch (err) {
      console.error("Error replacing file:", err)
    }
    replaceTargetId.current = null
  }

  // 19. Xóa file báo cáo
  async function deleteFile(id: string) {
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_report",
          id
        })
      })
      const data = await res.json()
      if (data.success) {
        setFiles(data.reportFiles)
      }
    } catch (err) {
      console.error("Error deleting report:", err)
    }
  }



  // 20. Nộp đơn xin gia hạn
  async function submitExtensionRequest() {
    if (!extForm.reason.trim() || !extForm.days) {
      setExtError("Vui lòng nhập đầy đủ lý do và số ngày xin gia hạn.")
      return
    }
    setExtError("")
    await initExtensionObject()
    setExtForm({ reason: "", days: "" })
    setExtOpen(false)
  }

  async function initExtensionObject() {
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request_extension",
          reason: extForm.reason.trim(),
          days: Number(extForm.days),
          studentName: user?.name || "Nguyễn Văn Đạt"
        })
      })
      const data = await res.json()
      if (data.success) {
        setExtensions(data.extensionRequests)
      }
    } catch (err) {
      console.error("Error requesting extension:", err)
    }
  }

  // 21. Duyệt đơn gia hạn
  async function sendApprovalRequest(id: string, status: ExtensionRequest["status"]) {
    await callSaveApprovalResultAPI(id, status)
  }

  async function callSaveApprovalResultAPI(id: string, status: ExtensionRequest["status"]) {
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: status === "approved" ? "approve_extension" : "reject_extension",
          id
        })
      })
      const data = await res.json()
      if (data.success) {
        setExtensions(data.extensionRequests)
      }
    } catch (err) {
      console.error("Error setting extension status:", err)
    }
  }

  async function sendEvaluationResult() {
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_evaluation",
          studentName: reviewTarget,
          grade: Number(reviewGrade),
          comment: reviewText.trim()
        })
      })
      const data = await res.json()
      if (data.success) {
        setStudentProgressList(data.studentProgress)
      }
    } catch (err) {
      console.error("Error saving evaluation:", err)
    }
  }

  async function gradeReport(id: string, status: "approved" | "rejected") {
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "grade_report", id, status })
      })
      const data = await res.json()
      if (data.success) {
        setFiles(data.reportFiles)
        if (data.studentProgress) {
          setStudentProgressList(data.studentProgress)
        }
      }
    } catch (err) {
      console.error("Error grading report:", err)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <Badge variant="outline" className="gap-1.5 py-1 px-3 bg-primary/5 text-primary border-primary/20 font-medium text-xs">
            <CalendarClock className="size-3.5" />
            Đợt hiện tại: <span className="font-semibold">Đợt ĐATN Tháng 8 - 9/2026</span>
          </Badge>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Tiến độ &amp; Báo cáo</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Nộp báo cáo định kỳ, quyển đồ án, theo dõi tiến độ và xử lý đơn gia hạn.
        </p>
      </div>

      <Tabs defaultValue={user?.role === "Sinh viên" ? "reports" : "manage"} className="w-full">
        <TabsList>
          {user?.role === "Sinh viên" && (
            <TabsTrigger value="reports">Báo cáo của tôi</TabsTrigger>
          )}
          {(user?.role === "Giảng viên" || user?.role === "Giáo vụ" || user?.role === "admin" || (user as any)?.rawRole === "admin") && (
            <TabsTrigger value="manage">Quản lý tiến độ (GVHD &amp; Admin)</TabsTrigger>
          )}
        </TabsList>

        {/* ---- Student side ---- */}
        {user?.role === "Sinh viên" && (() => {
          const currentStudentName = user?.name || "Nguyễn Văn Đạt"
          const myStudentProgress = studentProgressList.find((p) => {
            const sName = p.student.trim()
            const target = currentStudentName.trim()
            return sName === target || sName.includes(target) || target.includes(sName)
          })
          const studentFilesList = files.filter((f) => {
            if (!f.student) return true
            const sName = f.student.trim()
            const target = currentStudentName.trim()
            return sName === target || sName.includes(target) || target.includes(sName)
          })
          const approvedFilesList = studentFilesList.filter((f) => f.status === "approved" && f.progress !== undefined && f.progress !== null)
          const currentProgressVal = approvedFilesList.length > 0
            ? Math.max(...approvedFilesList.map((f) => f.progress!))
            : (myStudentProgress?.progress ?? 40)

          return (
            <TabsContent value="reports" className="mt-4 flex flex-col gap-6">
              {/* Topic approval status banner */}
              <Card className="border-emerald-600/30 bg-emerald-500/5">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          Đề tài: {myStudentProgress?.topicTitle || "Hệ thống nhận diện khuôn mặt điểm danh sinh viên"}
                        </span>
                        <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px]">Đã duyệt đăng ký</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        GVHD: TS. Nguyễn Văn An | Trạng thái:{" "}
                        <span className="font-semibold text-emerald-600">
                          {currentProgressVal >= 100
                            ? `Đã hoàn thành đồ án (${currentProgressVal}% tiến độ) - Chuẩn bị bảo vệ`
                            : `Đang thực hiện đồ án (${currentProgressVal}% tiến độ)`}
                        </span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

          {myStudentProgress?.isLocked || myStudentProgress?.semesterId === "dt-2025-1" ? (
            <Card className="border-emerald-600/30 bg-emerald-500/10 p-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 className="size-8 text-emerald-600" />
                <h4 className="text-base font-semibold text-foreground">Bạn đã hoàn thành bảo vệ đồ án tốt nghiệp</h4>
                <p className="text-xs text-muted-foreground max-w-md">
                  Đợt đồ án của bạn đã kết thúc và đã được chốt điểm chính thức. Hệ thống đã đóng tính năng nộp báo cáo đối với tài khoản này.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* 17. periodic report upload */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    inputRef.current?.click()
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDragging(false)
                  sendSubmitReportRequest(e.dataTransfer.files)
                }}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
                  isDragging ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50 hover:bg-accent/40",
                )}
                aria-label="Khu vực tải lên báo cáo định kỳ PDF"
              >
                <input ref={inputRef} type="file" accept="application/pdf" multiple className="sr-only" onChange={(e) => sendSubmitReportRequest(e.target.files)} />
                <input ref={replaceRef} type="file" accept="application/pdf" className="sr-only" onChange={(e) => replaceFile(e.target.files)} />
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UploadCloud className="size-6" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Nộp báo cáo tiến độ định kỳ</p>
                  <p className="mt-1 text-xs text-muted-foreground">Kéo thả hoặc nhấn để chọn tệp PDF</p>
                </div>
              </div>

              {/* 22. final thesis upload */}
              {(() => {
                const studentName = user?.name || "Nguyễn Văn Đạt"
                const myFinalFile = files.find((f) => {
                  if (!f.student) return false
                  const fStudent = f.student.trim()
                  const sName = studentName.trim()
                  const match = fStudent === sName || fStudent.includes(sName) || sName.includes(fStudent)
                  return match && (f.isFinalThesis || (f.fileName && f.fileName.includes("[Quyển ĐATN]")))
                })
                const isFinalThesisApproved = myFinalFile?.status === "approved"

                return (
                  <div className="flex flex-col gap-2">
                    <div
                      role="button"
                      tabIndex={finalThesis ? -1 : 0}
                      onClick={() => !finalThesis && finalRef.current?.click()}
                      onKeyDown={(e) => {
                        if (!finalThesis && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault()
                          finalRef.current?.click()
                        }
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
                        isFinalThesisApproved
                          ? "border-emerald-500 bg-emerald-500/10 cursor-default"
                          : finalThesis
                          ? "border-primary bg-primary/5 cursor-default"
                          : "cursor-pointer border-border bg-card hover:border-primary/50 hover:bg-accent/40",
                      )}
                      aria-label="Khu vực nộp quyển đồ án tốt nghiệp PDF"
                    >
                      <input
                        ref={finalRef}
                        type="file"
                        accept="application/pdf"
                        className="sr-only"
                        onChange={(e) => handleFinalThesisUpload(e.target.files)}
                      />
                      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <BookCheck className="size-6" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Nộp quyển ĐATN (bản PDF)</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {isFinalThesisApproved ? (
                            <span className="font-semibold text-emerald-600 flex items-center justify-center gap-1">
                              <CheckCircle2 className="size-3.5" /> Đã được GVHD duyệt chính thức (Đã khóa)
                            </span>
                          ) : finalThesis ? (
                            `Đã nộp: ${finalThesis}`
                          ) : (
                            "Bản hoàn chỉnh cuối cùng"
                          )}
                        </p>
                      </div>
                    </div>
                    {finalThesis && (
                      isFinalThesisApproved ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="gap-1 opacity-60 bg-muted/40 cursor-not-allowed text-muted-foreground border-border self-end"
                          title="Quyển ĐATN đã được GVHD duyệt chính thức, không thể hủy nộp"
                        >
                          <Lock className="size-3.5" aria-hidden="true" />
                          Đã được GVHD duyệt (Không thể hủy nộp)
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-destructive hover:text-destructive self-end"
                          onClick={handleCancelFinalThesis}
                        >
                          <X className="size-3.5" aria-hidden="true" />
                          Huỷ nộp quyển
                        </Button>
                      )
                    )}
                  </div>
                )
              })()}
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="outline" className="gap-2" onClick={openExtensionDialog}>
              <CalendarClock className="size-4" aria-hidden="true" />
              Nộp đơn xin gia hạn
            </Button>
          </div>

          {/* report history with replace/delete actions */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">Lịch sử nộp báo cáo</h3>
            <Card className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Tên file</TableHead>
                      <TableHead className="font-semibold">Ngày nộp</TableHead>
                      <TableHead className="font-semibold">Tiến độ (%)</TableHead>
                      <TableHead className="font-semibold">Trạng thái duyệt</TableHead>
                      <TableHead className="text-right font-semibold">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const studentName = user?.name || "Nguyễn Văn Đạt"
                      const myFiles = files.filter((f) => {
                        if (!f.student) return true
                        const sName = f.student.trim()
                        const target = studentName.trim()
                        return sName === target || sName.includes(target) || target.includes(sName)
                      })

                      if (myFiles.length === 0) {
                        return (
                          <TableRow>
                            <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                              Chưa có báo cáo nào được nộp.
                            </TableCell>
                          </TableRow>
                        )
                      }

                      return myFiles.map((f) => (
                        <TableRow key={f.id}>
                          <TableCell>
                            <span className="flex items-center gap-2 font-medium text-foreground">
                              <FileText className="size-4 shrink-0 text-primary" aria-hidden="true" />
                              {f.fileName}
                              {(f.isFinalThesis || f.fileName.includes("[Quyển ĐATN]")) && (
                                <Badge className="bg-purple-600 text-white text-[10px] px-1.5 py-0">Quyển ĐATN</Badge>
                              )}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{f.submittedDate}</TableCell>
                          <TableCell>
                            {f.progress !== undefined ? (
                              <div className="flex items-center gap-2">
                                <Progress value={f.progress} className="h-2 w-20" />
                                <span className="text-xs text-muted-foreground">{f.progress}%</span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">—</span>
                            )}
                          </TableCell>
                          <TableCell>{statusBadge(f.status, f.isFinalThesis || (f.fileName && f.fileName.includes("[Quyển ĐATN]")))}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              {f.status === "approved" ? (
                                <span className="text-xs text-muted-foreground italic px-2">Đã duyệt (Không thể xóa)</span>
                              ) : (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-muted-foreground hover:text-primary"
                                    aria-label={`Cập nhật đè file ${f.fileName}`}
                                    onClick={() => {
                                      replaceTargetId.current = f.id
                                      replaceRef.current?.click()
                                    }}
                                    title="Cập nhật đè tệp mới"
                                  >
                                    <RefreshCw className="size-4" aria-hidden="true" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-muted-foreground hover:text-destructive"
                                    aria-label={`Xóa file ${f.fileName}`}
                                    onClick={() => openDeleteFileConfirm(f)}
                                    title="Xóa tệp báo cáo"
                                  >
                                    <Trash2 className="size-4" aria-hidden="true" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    })()}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>

          {/* Extension Request History */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">Lịch sử đơn gia hạn</h3>
            <Card className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Lý do</TableHead>
                      <TableHead className="font-semibold">Số ngày</TableHead>
                      <TableHead className="font-semibold">Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {extensions.filter(ex => ex.student === user?.name).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="py-6 text-center text-muted-foreground text-xs">
                          Chưa có đơn xin gia hạn nào được gửi.
                        </TableCell>
                      </TableRow>
                    ) : (
                      extensions
                        .filter(ex => ex.student === user?.name)
                        .map((ex) => (
                          <TableRow key={ex.id}>
                            <TableCell className="font-medium text-foreground text-xs">{ex.reason}</TableCell>
                            <TableCell className="text-muted-foreground text-xs">{ex.days} ngày</TableCell>
                            <TableCell>
                              {ex.status === "approved" ? (
                                <Badge className="bg-primary/10 text-primary hover:bg-primary/10 text-[10px] py-0 px-1.5 border-0">
                                  Đã duyệt
                                </Badge>
                              ) : ex.status === "rejected" ? (
                                <Badge variant="secondary" className="bg-destructive/10 text-destructive text-[10px] py-0 px-1.5 border-0">
                                  Từ chối
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                                  Chờ duyệt
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
          </TabsContent>
          )
        })()}

        {/* ---- Instructor / Admin side ---- */}
        {(user?.role === "Giảng viên" || user?.role === "Giáo vụ" || user?.role === "admin" || (user as any)?.rawRole === "admin") && (
          <TabsContent value="manage" className="mt-4 flex flex-col gap-6">

          {/* Combined student progress + report files table */}
          <Card className="overflow-hidden p-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border-b border-border bg-card">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Danh sách sinh viên &amp; báo cáo</h3>
                <p className="text-xs text-muted-foreground">Bấm vào hàng để xem các tệp báo cáo đã nộp</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <CalendarRange className="size-3.5" />
                  Đợt:
                </span>
                <Select value={selectedSemesterFilter} onValueChange={(v) => { if (v) setSelectedSemesterFilter(v) }}>
                  <SelectTrigger className="w-[250px] h-8 text-xs bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dt-2026-t8">Đợt ĐATN Tháng 8 - 9/2026 (Hiện tại)</SelectItem>
                    <SelectItem value="dt-2025-1">Đợt 1 - HK I 2025-2026 (Quá khứ - Đã khóa)</SelectItem>
                    <SelectItem value="all">Tất cả các đợt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-8" />
                    <TableHead className="font-semibold">Sinh viên</TableHead>
                    <TableHead className="font-semibold">Đề tài</TableHead>
                    <TableHead className="min-w-[160px] font-semibold">
                      <span title="Do sinh viên tự khai khi nộp báo cáo" className="cursor-help underline decoration-dashed underline-offset-2">
                        Tiến độ (SV báo cáo)
                      </span>
                    </TableHead>
                    <TableHead className="font-semibold">Điểm GVHD</TableHead>
                    <TableHead className="font-semibold">Nhận xét</TableHead>
                    <TableHead className="text-right font-semibold">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentProgressList
                    .filter((p: any) => {
                      if (user?.role === "Giảng viên" && !isAdmin) {
                        if (p.instructor) {
                          const uName = (user?.name || "").trim()
                          const iName = p.instructor.trim()
                          if (iName !== uName && !iName.includes(uName) && !uName.includes(iName)) return false
                        }
                      }
                      if (selectedSemesterFilter !== "all") {
                        return p.semesterId === selectedSemesterFilter
                      }
                      return true
                    })
                    .map((p) => {
                    const studentFiles = files.filter((f) => {
                      if (!f.student) return false
                      const fName = f.student.trim()
                      const pName = p.student.trim()
                      return fName === pName || fName.includes(pName) || pName.includes(fName)
                    })
                    const approvedFiles = studentFiles.filter((f) => f.status === "approved" && f.progress !== undefined && f.progress !== null)
                    const displayProgress = approvedFiles.length > 0
                      ? Math.max(...approvedFiles.map((f) => f.progress!))
                      : (studentFiles.length > 0 && studentFiles[0].progress !== undefined
                          ? studentFiles[0].progress!
                          : p.progress)

                    const isExpanded = expandedStudents.has(p.id)
                    const isLocked = p.isLocked || p.semesterId === "dt-2025-1"

                    return (
                      <Fragment key={p.id}>
                        <TableRow
                          className="cursor-pointer hover:bg-accent/40"
                          onClick={() => {
                            setExpandedStudents((prev) => {
                              const next = new Set(prev)
                              if (next.has(p.id)) next.delete(p.id)
                              else next.add(p.id)
                              return next
                            })
                          }}
                        >
                          <TableCell className="text-muted-foreground text-center">
                            {isExpanded
                              ? <ChevronDown className="size-4 inline" />
                              : <ChevronRight className="size-4 inline" />}
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            <div className="flex items-center gap-2">
                              {p.student}
                              {studentFiles.filter((f) => f.status === "pending").length > 0 && (
                                <Badge variant="secondary" className="bg-amber-500/15 text-amber-600 text-[10px] px-1.5 py-0">
                                  {studentFiles.filter((f) => f.status === "pending").length} chờ duyệt
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">{p.topicTitle}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2" title="Tiến độ được tính theo báo cáo đã được duyệt mới nhất">
                              <Progress value={displayProgress} className="h-2 w-24" />
                              <span className="w-9 text-xs text-muted-foreground">{displayProgress}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm font-semibold">
                            {p.grade !== undefined && p.grade !== null ? (
                              <span className="text-primary">{p.grade}/10</span>
                            ) : (
                              <span className="text-muted-foreground italic text-xs">Chưa chấm</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[140px] truncate" title={p.comment}>
                            {p.comment || <span className="italic">Chưa có</span>}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                              {!isAdmin && (
                                isLocked ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled
                                    className="gap-1.5 opacity-60 bg-muted/40 cursor-not-allowed text-muted-foreground border-border"
                                    title="Đợt đồ án đã kết thúc và chốt điểm, không thể chỉnh sửa"
                                  >
                                    <Lock className="size-3.5" aria-hidden="true" />
                                    Đã chốt điểm (Quá khứ)
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1"
                                    onClick={() => {
                                      setReviewTarget(p.student)
                                      setReviewText(p.comment || "")
                                      setReviewGrade(p.grade !== undefined && p.grade !== null ? String(p.grade) : "")
                                      setReviewOpen(true)
                                    }}
                                  >
                                    <MessageSquarePlus className="size-4" aria-hidden="true" />
                                    {p.grade !== undefined && p.grade !== null ? "Sửa" : "Nhận xét"}
                                  </Button>
                                )
                              )}
                              {isAdmin && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                                  onClick={() => openDeleteStudentConfirm(p)}
                                  title="Xóa sinh viên khỏi tiến độ (Dành cho Admin)"
                                >
                                  <Trash2 className="size-3.5" aria-hidden="true" />
                                  Xóa SV
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Expanded: file list */}
                        {isExpanded && (
                          <TableRow key={`${p.id}-files`} className="bg-muted/20 hover:bg-muted/20">
                            <TableCell colSpan={7} className="p-0">
                              <div className="px-8 py-3 flex flex-col gap-2">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                                  Tệp báo cáo đã nộp ({studentFiles.length})
                                </p>
                                {studentFiles.length === 0 ? (
                                  <p className="text-xs text-muted-foreground italic">Sinh viên chưa nộp tệp nào.</p>
                                ) : (
                                  <div className="flex flex-col gap-1.5">
                                    {studentFiles.map((f) => (
                                      <div key={f.id} className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-2.5">
                                        <FileText className="size-4 shrink-0 text-primary" aria-hidden="true" />
                                        <span className="flex-1 text-sm font-medium text-foreground">{f.fileName}</span>
                                        <span className="text-xs text-muted-foreground">{f.submittedDate}</span>
                                        {f.progress !== undefined && (
                                          <div className="flex items-center gap-1.5">
                                            <Progress value={f.progress} className="h-1.5 w-16" />
                                            <span className="text-xs text-muted-foreground w-8">{f.progress}%</span>
                                          </div>
                                        )}
                                        {statusBadge(f.status, f.isFinalThesis || (f.fileName && f.fileName.includes("[Quyển ĐATN]")))}
                                        {!isAdmin && f.status === "pending" && (
                                          <>
                                            <Button
                                              size="sm"
                                              className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white border-0 h-7 text-xs"
                                              onClick={() => openGradeConfirm(f, "approved")}
                                            >
                                              <Check className="size-3" />
                                              Duyệt
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="gap-1 text-destructive hover:text-destructive h-7 text-xs"
                                              onClick={() => openGradeConfirm(f, "rejected")}
                                            >
                                              <X className="size-3" />
                                              Từ chối
                                            </Button>
                                          </>
                                        )}
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 text-xs gap-1"
                                          onClick={() => {
                                            const blob = new Blob([`Tệp báo cáo: ${f.fileName}\nSinh viên: ${p.student}`], { type: "text/plain;charset=utf-8;" })
                                            const url = URL.createObjectURL(blob)
                                            const a = document.createElement("a")
                                            a.href = url
                                            a.download = f.fileName
                                            a.click()
                                            URL.revokeObjectURL(url)
                                          }}
                                        >
                                          <Download className="size-3" />
                                          Tải
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* 21. extension approvals (Only for GVHD, hidden for Admin) */}
          {!isAdmin && (
            <Card className="overflow-hidden p-0">
              <CardHeader className="p-4">
                <h3 className="text-sm font-semibold text-foreground">Đơn xin gia hạn của sinh viên</h3>
              </CardHeader>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Sinh viên</TableHead>
                      <TableHead className="font-semibold">Lý do</TableHead>
                      <TableHead className="font-semibold">Số ngày</TableHead>
                      <TableHead className="font-semibold">Trạng thái</TableHead>
                      <TableHead className="text-right font-semibold">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {extensions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                          Không có đơn gia hạn.
                        </TableCell>
                      </TableRow>
                    ) : (
                      extensions.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell className="font-medium text-foreground">{e.student}</TableCell>
                          <TableCell className="text-muted-foreground">{e.reason}</TableCell>
                          <TableCell className="text-muted-foreground">{e.days} ngày</TableCell>
                          <TableCell>
                            {e.status === "approved" ? (
                              <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Đã duyệt</Badge>
                            ) : e.status === "rejected" ? (
                              <Badge variant="secondary" className="bg-destructive/10 text-destructive">Từ chối</Badge>
                            ) : (
                              <Badge variant="secondary">Chờ duyệt</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              {e.status === "pending" ? (
                                <>
                                  <Button size="sm" className="gap-1" onClick={() => sendApprovalRequest(e.id, "approved")}>
                                    <Check className="size-4" aria-hidden="true" />
                                    Duyệt
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1 text-destructive hover:text-destructive"
                                    onClick={() => sendApprovalRequest(e.id, "rejected")}
                                  >
                                    <X className="size-4" aria-hidden="true" />
                                    Từ chối
                                  </Button>
                                </>
                              ) : (
                                <span className="text-xs text-muted-foreground">Đã xử lý</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}

        </TabsContent>
      )}
    </Tabs>

      {/* Upload progress dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Xác nhận nộp báo cáo</DialogTitle>
            <DialogDescription>
              File: <span className="font-medium text-foreground">{pendingFiles?.[0]?.name}</span>
              <br />Vui lòng nhập % tiến độ hoàn thành hiện tại của bạn.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="uploadProgress">Tiến độ hoàn thành (%)</Label>
              <Input
                id="uploadProgress"
                type="number"
                min={0}
                max={100}
                placeholder="Ví dụ: 60"
                value={uploadProgress}
                onChange={(e) => setUploadProgress(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">
                Lưu ý: % tiến độ mới không được nhỏ hơn % tiến độ đã báo cáo ở các lần nộp trước.
              </p>
            </div>
            {uploadError && (
              <p className="text-xs font-medium text-destructive">{uploadError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Hủy</Button>
            <Button onClick={confirmUploadReport}>Nộp báo cáo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grade confirm dialog */}
      <Dialog open={gradeConfirmOpen} onOpenChange={setGradeConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {gradeTarget?.action === "approved" ? "Xác nhận duyệt báo cáo" : "Xác nhận từ chối báo cáo"}
            </DialogTitle>
            <div className="space-y-3 pt-2 text-sm text-muted-foreground">
              <div>
                File: <span className="font-semibold text-foreground">{gradeTarget?.fileName}</span>
                <br />Sinh viên: <span className="font-semibold text-foreground">{gradeTarget?.student}</span>
              </div>
              {gradeTarget?.action === "approved" && (gradeTarget?.fileName.includes("[Quyển ĐATN]") || files.find((f) => f.id === gradeTarget?.id)?.isFinalThesis) ? (
                <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-800 font-medium leading-relaxed flex items-start gap-2.5">
                  <AlertTriangle className="size-5 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-900">CẢNH BÁO QUAN TRỌNG:</span>
                    <br />Bạn đang chuẩn bị duyệt <strong>Quyển ĐATN (Bản hoàn chỉnh)</strong>.
                    <br />Sau khi bạn duyệt, quyển ĐATN này sẽ <strong>chính thức bị khóa</strong>:
                    <ul className="mt-1.5 list-disc list-inside text-[11px] text-amber-900/90 font-normal space-y-0.5">
                      <li>Sinh viên <strong>không thể hủy nộp</strong> nữa.</li>
                      <li>Giảng viên <strong>không thể hủy duyệt</strong> hoặc chỉnh sửa lại.</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <p>
                  {gradeTarget?.action === "approved"
                    ? "Sau khi duyệt, báo cáo sẽ được ghi nhận vào tiến độ sinh viên và không thể hoàn tác."
                    : "Sau khi từ chối, sinh viên sẽ cần nộp lại báo cáo mới. Hành động này không thể hoàn tác."}
                </p>
              )}
            </div>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setGradeConfirmOpen(false)}>Hủy</Button>
            <Button
              className={gradeTarget?.action === "approved"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                : "bg-destructive hover:bg-destructive/90 text-white border-0"}
              onClick={handleConfirmGrade}
            >
              {gradeTarget?.action === "approved" ? "Xác nhận duyệt" : "Xác nhận từ chối"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 20. extension request dialog */}
      <Dialog open={extOpen} onOpenChange={setExtOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nộp đơn xin gia hạn</DialogTitle>
            <DialogDescription>Gửi yêu cầu gia hạn thời gian nộp đến giảng viên hướng dẫn.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="reason">Lý do gia hạn</Label>
              <Textarea
                id="reason"
                rows={3}
                placeholder="Trình bày lý do..."
                value={extForm.reason}
                onChange={(e) => setExtForm((f) => ({ ...f, reason: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="days">Số ngày xin gia hạn</Label>
              <Input
                id="days"
                type="number"
                min={1}
                placeholder="7"
                value={extForm.days}
                onChange={(e) => setExtForm((f) => ({ ...f, days: e.target.value }))}
              />
            </div>
            {extError && (
              <p className="text-xs font-medium text-destructive mt-1">{extError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtOpen(false)}>
              Hủy
            </Button>
             <Button onClick={submitExtensionRequest}>Gửi đơn</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 23. instructor review dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nhập nhận xét và điểm GVHD</DialogTitle>
            <DialogDescription>Nhận xét tiến độ và điểm số cho sinh viên: {reviewTarget}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="review">Nội dung nhận xét chi tiết</Label>
              <Textarea
                id="review"
                rows={4}
                placeholder="Nhập nhận xét về tiến độ, chất lượng báo cáo..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="reviewGrade">Điểm quá trình (thang 10)</Label>
              <Input
                id="reviewGrade"
                type="number"
                min={0}
                max={10}
                step={0.1}
                placeholder="8.5"
                value={reviewGrade}
                onChange={(e) => setReviewGrade(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={async () => {
                await sendEvaluationResult()
                setReviewOpen(false)
              }}
              disabled={!reviewText.trim() || !reviewGrade}
            >
              Lưu đánh giá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete report file dialog */}
      <Dialog open={deleteFileOpen} onOpenChange={setDeleteFileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận gỡ bỏ báo cáo</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa tệp tin báo cáo <span className="font-semibold text-foreground">{fileToDelete?.fileName}</span> khỏi hệ thống không?
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            Hành động này sẽ gỡ bỏ tệp báo cáo đã nộp của bạn và không thể hoàn tác.
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => {
              setDeleteFileOpen(false)
              setFileToDelete(null)
            }}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleConfirmDeleteFile}>
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete student progress dialog for Admin */}
      <Dialog open={deleteStudentOpen} onOpenChange={setDeleteStudentOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="size-5" />
              Xác nhận xóa sinh viên
            </DialogTitle>
            <DialogDescription className="pt-2">
              Bạn có chắc chắn muốn xóa sinh viên <span className="font-semibold text-foreground">{studentToDelete?.student}</span> khỏi danh sách theo dõi tiến độ không?
              <br /><br />
              Hành động này sẽ gỡ sinh viên khỏi hệ thống quản lý tiến độ.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteStudentOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={confirmDeleteStudent}>Xóa sinh viên</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
