"use client"

import { useState, useRef, useCallback } from "react"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
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

function statusBadge(status: ReportFile["status"]) {
  if (status === "approved") {
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

export function ProgressView() {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<ReportFile[]>([])
  const [finalThesis, setFinalThesis] = useState<string | null>(null)
  const [extensions, setExtensions] = useState<ExtensionRequest[]>([])
  const [studentProgressList, setStudentProgressList] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])

  const inputRef = useRef<HTMLInputElement>(null)
  const replaceRef = useRef<HTMLInputElement>(null)
  const finalRef = useRef<HTMLInputElement>(null)
  const replaceTargetId = useRef<string | null>(null)

  const [extOpen, setExtOpen] = useState(false)
  const [extForm, setExtForm] = useState({ reason: "", days: "" })
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewTarget, setReviewTarget] = useState<string>("")
  const [reviewText, setReviewText] = useState("")
  const [reviewGrade, setReviewGrade] = useState("")

  // dialog for confirming report deletion
  const [deleteFileOpen, setDeleteFileOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<ReportFile | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const res = await fetch("/api/progress")
      const data = await res.json()
      if (data.success) {
        setFiles(data.reportFiles)
        setExtensions(data.extensionRequests)
        setStudentProgressList(data.studentProgress)
        setChartData(data.progressChart)
      }
    } catch (err) {
      console.error("Error fetching progress data:", err)
    }
  }

  const addFiles = useCallback(async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    const file = fileList[0]
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_report",
          fileName: file.name,
          progressPercent: 45, // default simulation step
          studentName: "Nguyễn Văn Đạt",
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
  }, [])

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
          studentName: "Nguyễn Văn Đạt",
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

  function confirmDeleteFile(file: ReportFile) {
    setFileToDelete(file)
    setDeleteFileOpen(true)
  }

  function handleConfirmDeleteFile() {
    if (fileToDelete) {
      deleteFile(fileToDelete.id)
    }
    setDeleteFileOpen(false)
    setFileToDelete(null)
  }

  // 20. Nộp đơn xin gia hạn
  async function submitExtension() {
    if (!extForm.reason.trim() || !extForm.days) return
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request_extension",
          reason: extForm.reason.trim(),
          days: Number(extForm.days),
          studentName: "Nguyễn Văn Đạt"
        })
      })
      const data = await res.json()
      if (data.success) {
        setExtensions(data.extensionRequests)
      }
    } catch (err) {
      console.error("Error requesting extension:", err)
    }
    setExtForm({ reason: "", days: "" })
    setExtOpen(false)
  }

  // 21. Duyệt đơn gia hạn
  async function setExtStatus(id: string, status: ExtensionRequest["status"]) {
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Tiến độ &amp; Báo cáo</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Nộp báo cáo định kỳ, quyển đồ án, theo dõi tiến độ và xử lý đơn gia hạn.
        </p>
      </div>

      <Tabs defaultValue="reports" className="w-full">
        <TabsList>
          <TabsTrigger value="reports">Báo cáo của tôi</TabsTrigger>
          <TabsTrigger value="manage">Quản lý tiến độ (GVHD)</TabsTrigger>
        </TabsList>

        {/* ---- Student side ---- */}
        <TabsContent value="reports" className="mt-4 flex flex-col gap-6">
          {/* 24. progress chart */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-foreground">Biểu đồ tiến độ nộp báo cáo</h3>
              <p className="text-xs text-muted-foreground">Số lượt nộp tích lũy theo từng tuần</p>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{ submitted: { label: "Lượt nộp", color: "var(--chart-1)" } }}
                className="h-[220px] w-full"
              >
                <AreaChart data={chartData} margin={{ left: 0, right: 12, top: 8 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} width={28} fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area dataKey="submitted" type="monotone" fill="var(--color-submitted)" fillOpacity={0.2} stroke="var(--color-submitted)" strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

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
                addFiles(e.dataTransfer.files)
              }}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
                isDragging ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50 hover:bg-accent/40",
              )}
              aria-label="Khu vực tải lên báo cáo định kỳ PDF"
            >
              <input ref={inputRef} type="file" accept="application/pdf" multiple className="sr-only" onChange={(e) => addFiles(e.target.files)} />
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
            <div
              role="button"
              tabIndex={0}
              onClick={() => finalRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  finalRef.current?.click()
                }
              }}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
                finalThesis ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50 hover:bg-accent/40",
              )}
              aria-label="Khu vực nộp quyển đồ án tốt nghiệp PDF"
            >
              <input
                ref={finalRef}
                type="file"
                accept="application/pdf"
                className="sr-only"
                onChange={(e) => e.target.files?.[0] && setFinalThesis(e.target.files[0].name)}
              />
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <BookCheck className="size-6" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Nộp quyển ĐATN (bản PDF)</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {finalThesis ? `Đã nộp: ${finalThesis}` : "Bản hoàn chỉnh cuối cùng, nộp 1 lần"}
                </p>
              </div>
            </div>
          </div>

          {/* Action bar: extension request */}
          <div className="flex justify-end">
            <Button variant="outline" className="gap-2" onClick={() => setExtOpen(true)}>
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
                      <TableHead className="font-semibold">Trạng thái duyệt</TableHead>
                      <TableHead className="text-right font-semibold">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {files.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                          Chưa có báo cáo nào được nộp.
                        </TableCell>
                      </TableRow>
                    ) : (
                      files.map((f) => (
                        <TableRow key={f.id}>
                          <TableCell>
                            <span className="flex items-center gap-2 font-medium text-foreground">
                              <FileText className="size-4 shrink-0 text-primary" aria-hidden="true" />
                              {f.fileName}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{f.submittedDate}</TableCell>
                          <TableCell>{statusBadge(f.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground hover:text-primary"
                                aria-label={`Cập nhật đè file ${f.fileName}`}
                                onClick={() => {
                                  replaceTargetId.current = f.id
                                  replaceRef.current?.click()
                                }}
                              >
                                <RefreshCw className="size-4" aria-hidden="true" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground hover:text-destructive"
                                aria-label={`Xóa file ${f.fileName}`}
                                onClick={() => confirmDeleteFile(f)}
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
          </div>
        </TabsContent>

        {/* ---- Instructor side ---- */}
        <TabsContent value="manage" className="mt-4 flex flex-col gap-6">
          {/* 25. student progress list */}
          <Card className="overflow-hidden p-0">
            <CardHeader className="p-4">
              <h3 className="text-sm font-semibold text-foreground">Danh sách tiến độ sinh viên</h3>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Sinh viên</TableHead>
                    <TableHead className="font-semibold">Đề tài</TableHead>
                    <TableHead className="font-semibold">Báo cáo gần nhất</TableHead>
                    <TableHead className="min-w-[180px] font-semibold">Tiến độ</TableHead>
                    <TableHead className="text-right font-semibold">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentProgressList.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium text-foreground">{p.student}</TableCell>
                      <TableCell className="text-muted-foreground">{p.topicTitle}</TableCell>
                      <TableCell className="text-muted-foreground">{p.lastReport}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={p.progress} className="h-2" />
                          <span className="w-9 text-xs text-muted-foreground">{p.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() => {
                              setReviewTarget(p.student)
                              setReviewText("")
                              setReviewGrade("")
                              setReviewOpen(true)
                            }}
                          >
                            <MessageSquarePlus className="size-4" aria-hidden="true" />
                            Nhận xét
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* 21. extension approvals */}
          <Card className="overflow-hidden p-0">
            <CardHeader className="p-4">
              <h3 className="text-sm font-semibold text-foreground">Đơn xin gia hạn</h3>
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
                                <Button size="sm" className="gap-1" onClick={() => setExtStatus(e.id, "approved")}>
                                  <Check className="size-4" aria-hidden="true" />
                                  Duyệt
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1 text-destructive hover:text-destructive"
                                  onClick={() => setExtStatus(e.id, "rejected")}
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
        </TabsContent>
      </Tabs>

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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtOpen(false)}>
              Hủy
            </Button>
            <Button onClick={submitExtension}>Gửi đơn</Button>
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
            <Button onClick={() => setReviewOpen(false)} disabled={!reviewText.trim()}>
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
    </div>
  )
}
