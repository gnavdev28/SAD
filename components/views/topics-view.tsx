"use client"

import { useState } from "react"
import { Search, User, Users2, Pencil, Trash2, Plus, Check, X, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
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
import { topics as initialTopics, registrations as initialRegs, type Topic, type Registration } from "@/lib/mock-data"

type Role = "student" | "instructor" | "admin"
type TopicRow = Topic & { approval: "approved" | "pending" | "rejected"; registered: number; mine?: boolean }

export function TopicsView() {
  const [role, setRole] = useState<Role>("student")
  const [query, setQuery] = useState("")
  const [items, setItems] = useState<TopicRow[]>([])
  const [regs, setRegs] = useState<Registration[]>([])

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: "", instructor: "", field: "", capacity: "", objective: "", requirement: "" })
  const [error, setError] = useState("")

  // dialog for confirming topic deletion
  const [deleteTopicOpen, setDeleteTopicOpen] = useState(false)
  const [topicToDelete, setTopicToDelete] = useState<TopicRow | null>(null)

  // dialog for confirming student registration cancellation
  const [cancelRegOpen, setCancelRegOpen] = useState(false)
  const [topicToCancel, setTopicToCancel] = useState<TopicRow | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const res = await fetch("/api/topics")
      const data = await res.json()
      if (data.success) {
        setItems(data.topics)
        setRegs(data.registrations)
      }
    } catch (err) {
      console.error("Error fetching topics:", err)
    }
  }

  const filtered = items.filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.instructor.toLowerCase().includes(query.toLowerCase()) ||
      t.field.toLowerCase().includes(query.toLowerCase()),
  )

  function openCreate() {
    setEditingId(null)
    setForm({ title: "", instructor: "", field: "", capacity: "", objective: "", requirement: "" })
    setError("")
    setOpen(true)
  }

  function openEdit(t: TopicRow) {
    setEditingId(t.id)
    setForm({
      title: t.title,
      instructor: t.instructor,
      field: t.field,
      capacity: String(t.capacity),
      objective: t.objective || "",
      requirement: t.requirement || "",
    })
    setError("")
    setOpen(true)
  }

  async function handleSave() {
    if (!form.title.trim() || !form.instructor.trim() || !form.field.trim() || !form.capacity || !form.objective.trim() || !form.requirement.trim()) {
      setError("Vui lòng nhập đầy đủ thông tin đề tài bao gồm cả mục tiêu và yêu cầu.")
      return
    }

    try {
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_topic",
          id: editingId,
          title: form.title.trim(),
          instructor: form.instructor.trim(),
          field: form.field.trim(),
          capacity: Number(form.capacity),
          objective: form.objective.trim(),
          requirement: form.requirement.trim()
        })
      })
      const data = await res.json()
      if (data.success) {
        setItems(data.topics)
      }
    } catch (err) {
      console.error("Error saving topic:", err)
    }

    setOpen(false)
  }

  async function removeTopic(id: string) {
    try {
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_topic",
          id
        })
      })
      const data = await res.json()
      if (data.success) {
        setItems(data.topics)
      }
    } catch (err) {
      console.error("Error deleting topic:", err)
    }
  }

  function confirmDeleteTopic(topic: TopicRow) {
    setTopicToDelete(topic)
    setDeleteTopicOpen(true)
  }

  function handleConfirmDeleteTopic() {
    if (topicToDelete) {
      removeTopic(topicToDelete.id)
    }
    setDeleteTopicOpen(false)
    setTopicToDelete(null)
  }

  async function setApproval(id: string, approval: TopicRow["approval"]) {
    try {
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set_approval",
          id,
          approval
        })
      })
      const data = await res.json()
      if (data.success) {
        setItems(data.topics)
      }
    } catch (err) {
      console.error("Error setting approval:", err)
    }
  }

  async function register(id: string) {
    try {
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register_topic",
          id,
          studentName: "Nguyễn Văn Đạt"
        })
      })
      const data = await res.json()
      if (data.success) {
        setItems(data.topics)
        setRegs(data.registrations)
      }
    } catch (err) {
      console.error("Error registering topic:", err)
    }
  }

  async function unregister(id: string) {
    try {
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cancel_registration",
          id,
          studentName: "Nguyễn Văn Đạt"
        })
      })
      const data = await res.json()
      if (data.success) {
        setItems(data.topics)
        setRegs(data.registrations)
      }
    } catch (err) {
      console.error("Error canceling registration:", err)
    }
  }

  function confirmCancelReg(topic: TopicRow) {
    setTopicToCancel(topic)
    setCancelRegOpen(true)
  }

  function handleConfirmCancelReg() {
    if (topicToCancel) {
      unregister(topicToCancel.id)
    }
    setCancelRegOpen(false)
    setTopicToCancel(null)
  }

  async function setRegStatus(id: string, status: Registration["status"]) {
    const reg = regs.find(r => r.id === id)
    if (!reg) return
    try {
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: status === "approved" ? "approve_student_reg" : "reject_student_reg",
          student: reg.student,
          topicTitle: reg.topicTitle
        })
      })
      const data = await res.json()
      if (data.success) {
        setRegs(data.registrations)
        if (data.topics) {
          setItems(data.topics)
        } else {
          // reload if needed
          fetchData()
        }
      }
    } catch (err) {
      console.error("Error setting reg status:", err)
    }
  }

  function approvalBadge(a: TopicRow["approval"]) {
    if (a === "approved") return <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Đã duyệt</Badge>
    if (a === "pending")
      return (
        <Badge variant="secondary" className="text-secondary-foreground">
          Chờ duyệt
        </Badge>
      )
    return <Badge variant="secondary" className="bg-destructive/10 text-destructive">Từ chối</Badge>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Quản lý đề tài</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Đăng ký, đề xuất và phê duyệt đề tài đồ án tốt nghiệp theo vai trò.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="role" className="text-xs text-muted-foreground">
            Vai trò:
          </Label>
          <Select value={role} onValueChange={(v) => setRole(v as Role)}>
            <SelectTrigger id="role" className="w-40 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Sinh viên</SelectItem>
              <SelectItem value="instructor">Giảng viên</SelectItem>
              <SelectItem value="admin">Giáo vụ</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="topics" className="w-full">
        <TabsList>
          <TabsTrigger value="topics">Danh sách đề tài</TabsTrigger>
          {role === "instructor" ? <TabsTrigger value="approvals">Duyệt SV đăng ký</TabsTrigger> : null}
        </TabsList>

        <TabsContent value="topics" className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                type="search"
                placeholder="Tìm theo tên đề tài, giảng viên, lĩnh vực..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-card pl-9"
                aria-label="Tìm kiếm đề tài"
              />
            </div>
            {role === "instructor" ? (
              <Button className="gap-2" onClick={openCreate}>
                <Plus className="size-4" aria-hidden="true" />
                Tạo đề tài mới
              </Button>
            ) : null}
          </div>

          {filtered.length === 0 ? (
            <Card className="flex items-center justify-center py-16">
              <p className="text-sm text-muted-foreground">Không tìm thấy đề tài phù hợp.</p>
            </Card>
          ) : role === "admin" ? (
            <Card className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Tên đề tài</TableHead>
                      <TableHead className="font-semibold">Giảng viên hướng dẫn</TableHead>
                      <TableHead className="font-semibold">Lĩnh vực</TableHead>
                      <TableHead className="font-semibold">Số lượng SV</TableHead>
                      <TableHead className="font-semibold">Trạng thái</TableHead>
                      <TableHead className="text-right font-semibold">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="max-w-[300px] truncate font-medium text-foreground" title={t.title}>
                          {t.title}
                        </TableCell>
                        <TableCell className="text-foreground">{t.instructor}</TableCell>
                        <TableCell className="text-muted-foreground">{t.field}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {t.registered}/{t.capacity}
                        </TableCell>
                        <TableCell>
                          {approvalBadge(t.approval)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-600 gap-1 border-0"
                              disabled={t.approval === "approved"}
                              onClick={() => setApproval(t.id, "approved")}
                            >
                              <Check className="size-3.5" aria-hidden="true" />
                              Phê duyệt
                            </Button>
                            <Button
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-600 gap-1 border-0"
                              disabled={t.approval === "rejected"}
                              onClick={() => setApproval(t.id, "rejected")}
                            >
                              <X className="size-3.5" aria-hidden="true" />
                              Từ chối
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((t) => {
                const isFull = t.registered >= t.capacity
                return (
                  <Card key={t.id} className="flex flex-col">
                    <CardHeader className="gap-3">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="secondary" className="w-fit bg-accent text-accent-foreground">
                          {t.field}
                        </Badge>
                        {approvalBadge(t.approval)}
                      </div>
                      <h3 className="text-base font-semibold leading-snug text-foreground text-balance">{t.title}</h3>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col gap-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <User className="size-4 shrink-0" aria-hidden="true" />
                        {t.instructor}
                      </span>
                      <span className="flex items-center gap-2">
                        <Users2 className="size-4 shrink-0" aria-hidden="true" />
                        Số lượng:{" "}
                        <span className={isFull ? "font-medium text-destructive" : "font-medium text-primary"}>
                          {t.registered}/{t.capacity}
                        </span>
                      </span>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                      {/* Student actions */}
                      {role === "student" ? (
                        t.mine ? (
                          <Button variant="outline" className="w-full gap-2" onClick={() => confirmCancelReg(t)}>
                            <X className="size-4" aria-hidden="true" />
                            Hủy đăng ký
                          </Button>
                        ) : (
                          <Button className="w-full" disabled={isFull || t.approval !== "approved"} onClick={() => register(t.id)}>
                            {isFull ? "Đã đầy" : t.approval !== "approved" ? "Chưa duyệt" : "Đăng ký"}
                          </Button>
                        )
                      ) : null}

                      {/* Instructor actions */}
                      {role === "instructor" ? (
                        <div className="flex w-full gap-2">
                          <Button variant="outline" className="flex-1 gap-2" onClick={() => openEdit(t)}>
                            <Pencil className="size-4" aria-hidden="true" />
                            Sửa
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 gap-2 text-destructive hover:text-destructive"
                            onClick={() => confirmDeleteTopic(t)}
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                            Xóa
                          </Button>
                        </div>
                      ) : null}
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Instructor: approve student registrations */}
        {role === "instructor" ? (
          <TabsContent value="approvals" className="mt-4">
            <Card className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Sinh viên</TableHead>
                      <TableHead className="font-semibold">Đề tài đăng ký</TableHead>
                      <TableHead className="font-semibold">Trạng thái</TableHead>
                      <TableHead className="text-right font-semibold">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {regs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                          Không có đăng ký nào chờ duyệt.
                        </TableCell>
                      </TableRow>
                    ) : (
                      regs.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium text-foreground">{r.student}</TableCell>
                          <TableCell className="text-muted-foreground">{r.topicTitle}</TableCell>
                          <TableCell>
                            {r.status === "approved" ? (
                              <Badge className="gap-1 bg-primary/10 text-primary hover:bg-primary/10">
                                <CheckCircle2 className="size-3.5" aria-hidden="true" />
                                Đã duyệt
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Chờ duyệt</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              {r.status === "pending" ? (
                                <>
                                  <Button size="sm" className="gap-1" onClick={() => setRegStatus(r.id, "approved")}>
                                    <Check className="size-4" aria-hidden="true" />
                                    Duyệt
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1 text-destructive hover:text-destructive"
                                    onClick={() => setRegStatus(r.id, "rejected")}
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
        ) : null}
      </Tabs>

      {/* Create / Edit topic dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Sửa đề tài" : "Tạo đề tài mới"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Cập nhật thông tin đề tài." : "Đề xuất đề tài mới, sẽ chờ quản trị viên phê duyệt."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Tên đề tài</Label>
              <Textarea
                id="title"
                rows={2}
                placeholder="Nhập tên đề tài..."
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="objective">Mục tiêu đề tài</Label>
              <Textarea
                id="objective"
                rows={2}
                placeholder="Nhập mục tiêu của đề tài..."
                value={form.objective}
                onChange={(e) => setForm((f) => ({ ...f, objective: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="requirement">Yêu cầu cần đạt</Label>
              <Textarea
                id="requirement"
                rows={2}
                placeholder="Nhập các yêu cầu của đề tài đối với sinh viên..."
                value={form.requirement}
                onChange={(e) => setForm((f) => ({ ...f, requirement: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="instructor">Giảng viên hướng dẫn</Label>
              <Input
                id="instructor"
                placeholder="VD: TS. Nguyễn Văn An"
                value={form.instructor}
                onChange={(e) => setForm((f) => ({ ...f, instructor: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="field">Lĩnh vực</Label>
                <Input
                  id="field"
                  placeholder="VD: Trí tuệ nhân tạo"
                  value={form.field}
                  onChange={(e) => setForm((f) => ({ ...f, field: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="capacity">Số lượng SV tối đa</Label>
                <Input
                  id="capacity"
                  type="number"
                  min={1}
                  placeholder="2"
                  value={form.capacity}
                  onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                />
              </div>
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave}>{editingId ? "Lưu thay đổi" : "Tạo đề tài"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete topic dialog */}
      <Dialog open={deleteTopicOpen} onOpenChange={setDeleteTopicOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa đề tài</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa đề tài <span className="font-semibold text-foreground">{topicToDelete?.title}</span> của giảng viên <span className="font-medium text-foreground">{topicToDelete?.instructor}</span> không?
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            Hành động này sẽ xóa hoàn toàn đề tài khỏi hệ thống và không thể hoàn tác.
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => {
              setDeleteTopicOpen(false)
              setTopicToDelete(null)
            }}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleConfirmDeleteTopic}>
              Xóa đề tài
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm cancel registration dialog */}
      <Dialog open={cancelRegOpen} onOpenChange={setCancelRegOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận hủy đăng ký</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn hủy đăng ký đề tài <span className="font-semibold text-foreground">{topicToCancel?.title}</span> của giảng viên <span className="font-medium text-foreground">{topicToCancel?.instructor}</span> không?
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            Hành động này sẽ giải phóng vị trí đăng ký của bạn trong đề tài này.
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => {
              setCancelRegOpen(false)
              setTopicToCancel(null)
            }}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleConfirmCancelReg}>
              Xác nhận hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
