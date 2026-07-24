export type Semester = {
  id: string
  name: string
  startDate: string
  endDate: string
  status: "open" | "locked"
}

export const semesters: Semester[] = [
  {
    id: "dt-2025-1",
    name: "Đợt 1 - Học kỳ I 2025-2026",
    startDate: "01/09/2025",
    endDate: "15/01/2026",
    status: "open",
  },
  {
    id: "dt-2024-2",
    name: "Đợt 2 - Học kỳ II 2024-2025",
    startDate: "10/02/2025",
    endDate: "30/06/2025",
    status: "locked",
  },
  {
    id: "dt-2024-1",
    name: "Đợt 1 - Học kỳ I 2024-2025",
    startDate: "05/09/2024",
    endDate: "20/01/2025",
    status: "locked",
  },
  {
    id: "dt-2025-he",
    name: "Đợt bổ sung - Học kỳ Hè 2025",
    startDate: "01/07/2025",
    endDate: "31/08/2025",
    status: "open",
  },
]

export type Topic = {
  id: string
  title: string
  instructor: string
  field: string
  registered: number
  capacity: number
}

export const topics: Topic[] = [
  {
    id: "t1",
    title: "Hệ thống nhận diện khuôn mặt điểm danh sinh viên",
    instructor: "TS. Nguyễn Văn An",
    field: "Trí tuệ nhân tạo",
    registered: 1,
    capacity: 2,
  },
  {
    id: "t2",
    title: "Ứng dụng di động quản lý chi tiêu cá nhân",
    instructor: "ThS. Trần Thị Bình",
    field: "Phát triển ứng dụng",
    registered: 2,
    capacity: 2,
  },
  {
    id: "t3",
    title: "Xây dựng nền tảng thương mại điện tử với Next.js",
    instructor: "TS. Lê Hoàng Cường",
    field: "Phát triển web",
    registered: 0,
    capacity: 3,
  },
  {
    id: "t4",
    title: "Phân tích dữ liệu lớn cho dự báo thời tiết",
    instructor: "PGS.TS. Phạm Minh Dũng",
    field: "Khoa học dữ liệu",
    registered: 1,
    capacity: 2,
  },
  {
    id: "t5",
    title: "Hệ thống IoT giám sát chất lượng không khí",
    instructor: "ThS. Vũ Thị Em",
    field: "Internet vạn vật",
    registered: 2,
    capacity: 3,
  },
  {
    id: "t6",
    title: "Chatbot hỗ trợ tư vấn tuyển sinh đại học",
    instructor: "TS. Đặng Quốc Phong",
    field: "Trí tuệ nhân tạo",
    registered: 1,
    capacity: 2,
  },
]

export type ReportFile = {
  id: string
  fileName: string
  submittedDate: string
  status: "approved" | "pending" | "rejected"
}

export const reportFiles: ReportFile[] = [
  {
    id: "r1",
    fileName: "BaoCao_TienDo_Tuan04.pdf",
    submittedDate: "12/10/2025",
    status: "approved",
  },
  {
    id: "r2",
    fileName: "BaoCao_TienDo_Tuan06.pdf",
    submittedDate: "26/10/2025",
    status: "pending",
  },
  {
    id: "r3",
    fileName: "DeCuong_ChiTiet_v2.pdf",
    submittedDate: "30/09/2025",
    status: "rejected",
  },
]

export type UnassignedProject = {
  id: string
  title: string
  student: string
  instructor: string
}

export const unassignedProjects: UnassignedProject[] = [
  {
    id: "u1",
    title: "Hệ thống nhận diện khuôn mặt điểm danh sinh viên",
    student: "Hoàng Văn Khoa",
    instructor: "TS. Nguyễn Văn An",
  },
  {
    id: "u2",
    title: "Phân tích dữ liệu lớn cho dự báo thời tiết",
    student: "Lý Thị Lan",
    instructor: "PGS.TS. Phạm Minh Dũng",
  },
  {
    id: "u3",
    title: "Chatbot hỗ trợ tư vấn tuyển sinh đại học",
    student: "Ngô Đức Mạnh",
    instructor: "TS. Đặng Quốc Phong",
  },
  {
    id: "u4",
    title: "Hệ thống IoT giám sát chất lượng không khí",
    student: "Bùi Thanh Nga",
    instructor: "ThS. Vũ Thị Em",
  },
]

export type Council = {
  id: string
  name: string
  room: string
  time: string
  members: string[]
  projects: { title: string; student: string }[]
}

export const councils: Council[] = [
  {
    id: "c1",
    name: "Hội đồng số 01 - Công nghệ phần mềm",
    room: "Phòng A3.05",
    time: "08:00 - 11:30, 20/01/2026",
    members: ["TS. Nguyễn Văn An", "ThS. Trần Thị Bình", "TS. Lê Hoàng Cường"],
    projects: [
      { title: "Ứng dụng di động quản lý chi tiêu cá nhân", student: "Phan Văn Quý" },
      { title: "Xây dựng nền tảng thương mại điện tử với Next.js", student: "Đỗ Thị Hà" },
    ],
  },
  {
    id: "c2",
    name: "Hội đồng số 02 - Trí tuệ nhân tạo",
    room: "Phòng B2.10",
    time: "13:30 - 17:00, 21/01/2026",
    members: ["PGS.TS. Phạm Minh Dũng", "TS. Đặng Quốc Phong", "ThS. Vũ Thị Em"],
    projects: [{ title: "Chatbot hỗ trợ tư vấn sinh viên năm nhất", student: "Trịnh Văn Sơn" }],
  },
]

/* ---- Sinh viên trong đợt (View 1) ---- */
export type SemesterStudent = {
  id: string
  code: string
  name: string
  className: string
  credits: number // số tín chỉ tích lũy (%)
  eligible: boolean
}

export const semesterStudents: SemesterStudent[] = [
  { id: "s1", code: "SV2021001", name: "Hoàng Văn Khoa", className: "CNTT01", credits: 92, eligible: true },
  { id: "s2", code: "SV2021002", name: "Lý Thị Lan", className: "CNTT01", credits: 85, eligible: true },
  { id: "s3", code: "SV2021003", name: "Ngô Đức Mạnh", className: "CNTT02", credits: 78, eligible: false },
  { id: "s4", code: "SV2021004", name: "Bùi Thanh Nga", className: "CNTT02", credits: 81, eligible: true },
  { id: "s5", code: "SV2021005", name: "Phan Văn Quý", className: "CNTT03", credits: 74, eligible: false },
]

/* ---- SV đăng ký đề tài chờ duyệt (View 2) ---- */
export type Registration = {
  id: string
  student: string
  topicTitle: string
  status: "pending" | "approved"
}

export const registrations: Registration[] = [
  { id: "rg1", student: "Hoàng Văn Khoa", topicTitle: "Hệ thống nhận diện khuôn mặt điểm danh sinh viên", status: "pending" },
  { id: "rg2", student: "Lý Thị Lan", topicTitle: "Phân tích dữ liệu lớn cho dự báo thời tiết", status: "pending" },
  { id: "rg3", student: "Bùi Thanh Nga", topicTitle: "Hệ thống IoT giám sát chất lượng không khí", status: "approved" },
]

/* ---- Đơn xin gia hạn & tiến độ SV (View 3) ---- */
export type ExtensionRequest = {
  id: string
  student: string
  reason: string
  days: number
  status: "pending" | "approved" | "rejected"
}

export const extensionRequests: ExtensionRequest[] = [
  { id: "ex1", student: "Ngô Đức Mạnh", reason: "Bổ sung thực nghiệm mô hình", days: 7, status: "pending" },
  { id: "ex2", student: "Phan Văn Quý", reason: "Hoàn thiện chương 4", days: 5, status: "approved" },
]

export type StudentProgress = {
  id: string
  student: string
  topicTitle: string
  progress: number
  lastReport: string
}

export const studentProgress: StudentProgress[] = [
  { id: "p1", student: "Hoàng Văn Khoa", topicTitle: "Nhận diện khuôn mặt điểm danh", progress: 75, lastReport: "Tuần 6" },
  { id: "p2", student: "Lý Thị Lan", topicTitle: "Dự báo thời tiết", progress: 60, lastReport: "Tuần 5" },
  { id: "p3", student: "Bùi Thanh Nga", topicTitle: "IoT giám sát không khí", progress: 90, lastReport: "Tuần 7" },
  { id: "p4", student: "Ngô Đức Mạnh", topicTitle: "Chatbot tư vấn tuyển sinh", progress: 40, lastReport: "Tuần 4" },
]

// Biểu đồ tiến độ theo tuần
export const progressChart = [
  { week: "Tuần 1", submitted: 2 },
  { week: "Tuần 2", submitted: 5 },
  { week: "Tuần 3", submitted: 8 },
  { week: "Tuần 4", submitted: 12 },
  { week: "Tuần 5", submitted: 18 },
  { week: "Tuần 6", submitted: 24 },
  { week: "Tuần 7", submitted: 29 },
]

/* ---- Phản biện (View 4) ---- */
export const reviewerOptions = [
  "TS. Nguyễn Văn An",
  "ThS. Trần Thị Bình",
  "TS. Lê Hoàng Cường",
  "PGS.TS. Phạm Minh Dũng",
  "TS. Đặng Quốc Phong",
  "ThS. Vũ Thị Em",
]

export type ReviewAssignment = {
  id: string
  topicTitle: string
  student: string
  reviewer: string | null
}

export const reviewAssignments: ReviewAssignment[] = [
  { id: "ra1", topicTitle: "Ứng dụng quản lý chi tiêu cá nhân", student: "Phan Văn Quý", reviewer: null },
  { id: "ra2", topicTitle: "Nền tảng thương mại điện tử Next.js", student: "Đỗ Thị Hà", reviewer: "TS. Lê Hoàng Cường" },
  { id: "ra3", topicTitle: "Chatbot tư vấn sinh viên năm nhất", student: "Trịnh Văn Sơn", reviewer: null },
]
