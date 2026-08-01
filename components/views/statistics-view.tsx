"use client"

import { useMemo, useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GraduationCap, Users, BookCheck, Clock, TrendingUp, Award } from "lucide-react"

const SEMESTERS = [
  { id: "dt-2026-t8", name: "Đợt ĐATN Tháng 8 - 9/2026" },
  { id: "dt-2025-1", name: "Đợt 1 - Năm 2025" },
]

const STATS_DATA: Record<string, {
  totalStudents: number
  registeredTopics: number
  approved: number
  defending: number
  avgGpa: number
  progressChart: { name: string; value: number; fill: string }[]
  gradeChart: { range: string; count: number }[]
  topicStatusChart: { name: string; value: number }[]
}> = {
  "dt-2026-t8": {
    totalStudents: 48,
    registeredTopics: 42,
    approved: 38,
    defending: 5,
    avgGpa: 8.3,
    progressChart: [
      { name: "0–25%", value: 6, fill: "#ef4444" },
      { name: "26–50%", value: 14, fill: "#f97316" },
      { name: "51–75%", value: 15, fill: "#eab308" },
      { name: "76–100%", value: 13, fill: "#22c55e" },
    ],
    gradeChart: [
      { range: "< 5.0", count: 1 },
      { range: "5.0–6.4", count: 3 },
      { range: "6.5–7.9", count: 11 },
      { range: "8.0–8.9", count: 18 },
      { range: "9.0–10", count: 7 },
    ],
    topicStatusChart: [
      { name: "Đã duyệt", value: 38 },
      { name: "Chờ duyệt", value: 4 },
      { name: "Từ chối", value: 2 },
      { name: "Chưa đăng ký", value: 4 },
    ],
  },
  "dt-2025-1": {
    totalStudents: 55,
    registeredTopics: 54,
    approved: 52,
    defending: 52,
    avgGpa: 8.1,
    progressChart: [
      { name: "0–25%", value: 0, fill: "#ef4444" },
      { name: "26–50%", value: 2, fill: "#f97316" },
      { name: "51–75%", value: 5, fill: "#eab308" },
      { name: "76–100%", value: 48, fill: "#22c55e" },
    ],
    gradeChart: [
      { range: "< 5.0", count: 2 },
      { range: "5.0–6.4", count: 6 },
      { range: "6.5–7.9", count: 18 },
      { range: "8.0–8.9", count: 22 },
      { range: "9.0–10", count: 7 },
    ],
    topicStatusChart: [
      { name: "Đã duyệt", value: 52 },
      { name: "Chờ duyệt", value: 0 },
      { name: "Từ chối", value: 2 },
      { name: "Chưa đăng ký", value: 1 },
    ],
  },
}

const PIE_COLORS = ["#3b82f6", "#f59e0b", "#ef4444", "#94a3b8"]

export function StatisticsView() {
  const [semester, setSemester] = useState("dt-2026-t8")
  const stats = useMemo(() => STATS_DATA[semester] ?? STATS_DATA["dt-2026-t8"], [semester])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Báo cáo & Thống kê</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Tổng quan tình hình đồ án tốt nghiệp theo đợt</p>
        </div>
        <div className="w-64">
          <Select value={semester} onValueChange={setSemester}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn đợt…" />
            </SelectTrigger>
            <SelectContent>
              {SEMESTERS.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: "Tổng sinh viên", value: stats.totalStudents, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Đã đăng ký đề tài", value: stats.registeredTopics, icon: BookCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Đề tài được duyệt", value: stats.approved, icon: GraduationCap, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Đã bảo vệ / Xếp lịch", value: stats.defending, icon: Award, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Điểm TB toàn đợt", value: stats.avgGpa.toFixed(1), icon: TrendingUp, color: "text-rose-600", bg: "bg-rose-50" },
        ].map((card) => (
          <Card key={card.label} className="overflow-hidden">
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${card.bg}`}>
                <card.icon className={`size-5 ${card.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-muted-foreground leading-tight">{card.label}</p>
                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Progress distribution bar chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Phân bố tiến độ đồ án</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.progressChart} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => [`${v} SV`, "Số sinh viên"]} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {stats.progressChart.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Grade distribution bar chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Phổ điểm tổng kết bảo vệ</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.gradeChart} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => [`${v} SV`, "Số sinh viên"]} />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Topic status pie + summary table */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Trạng thái đăng ký đề tài</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={stats.topicStatusChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {stats.topicStatusChart.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Summary table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Bảng tổng hợp chỉ số</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border">
                {[
                  { label: "Tỉ lệ đăng ký đề tài", value: `${Math.round((stats.registeredTopics / stats.totalStudents) * 100)}%` },
                  { label: "Tỉ lệ phê duyệt", value: `${Math.round((stats.approved / stats.registeredTopics) * 100)}%` },
                  { label: "Tỉ lệ đã xếp lịch bảo vệ", value: `${Math.round((stats.defending / stats.approved) * 100)}%` },
                  { label: "Điểm trung bình toàn đợt", value: <Badge className="bg-blue-600 text-white">{stats.avgGpa.toFixed(1)}</Badge> },
                  { label: "SV chưa đăng ký đề tài", value: stats.totalStudents - stats.registeredTopics },
                  { label: "SV có nguy cơ trễ hạn", value: stats.progressChart[0].value + stats.progressChart[1].value },
                ].map((row) => (
                  <tr key={row.label} className="flex justify-between py-2.5">
                    <td className="text-muted-foreground">{row.label}</td>
                    <td className="font-semibold text-foreground">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
