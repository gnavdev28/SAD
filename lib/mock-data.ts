export type Semester = {
  id: string
  name: string
  startDate: string
  endDate: string
  status: "open" | "locked"
  isCurrent?: boolean
}

export const semesters: Semester[] = [
  {
    id: "dt-2026-t8",
    name: "Đợt ĐATN Tháng 8 - 9/2026",
    startDate: "01/08/2026",
    endDate: "30/09/2026",
    status: "open",
    isCurrent: true,
  },
  {
    id: "dt-2025-1",
    name: "Đợt 1 - Học kỳ I 2025-2026",
    startDate: "01/09/2025",
    endDate: "15/01/2026",
    status: "locked",
    isCurrent: false,
  },
]

export type Topic = {
  id: string
  title: string
  instructor: string
  field: string
  registered: number
  capacity: number
  approval: "approved" | "pending" | "rejected"
  objective: string
  requirement: string
  creator?: string
  semesterId?: string
}

export const topics: Topic[] = [
  {
    id: "t1",
    title: "Hệ thống nhận diện khuôn mặt điểm danh sinh viên",
    instructor: "TS. Nguyễn Văn An",
    field: "Trí tuệ nhân tạo",
    registered: 1,
    capacity: 2,
    approval: "approved",
    semesterId: "dt-2025-1",
    objective: "Nghiên cứu và xây dựng mô hình học sâu (Deep Learning) nhận diện khuôn mặt thời gian thực với độ chính xác cao.",
    requirement: "Thành thạo Python, thư viện OpenCV, TensorFlow/PyTorch và thiết kế giao diện ứng dụng cơ bản."
  },
  {
    id: "t2",
    title: "Ứng dụng di động quản lý chi tiêu cá nhân",
    instructor: "TS. Nguyễn Văn An",
    field: "Phát triển ứng dụng",
    registered: 1,
    capacity: 2,
    approval: "approved",
    semesterId: "dt-2026-t8",
    objective: "Phát triển ứng dụng di động đa nền tảng giúp người dùng ghi chép chi tiêu và phân tích hành vi tiêu dùng thông minh.",
    requirement: "Kiến thức về React Native/Flutter, thiết kế cơ sở dữ liệu SQLite/Firebase và tư duy UI/UX tốt."
  },
  {
    id: "t3",
    title: "Xây dựng nền tảng thương mại điện tử với Next.js",
    instructor: "TS. Lê Hoàng Cường",
    field: "Phát triển web",
    registered: 0,
    capacity: 3,
    approval: "pending",
    semesterId: "dt-2026-t8",
    objective: "Thiết kế và tối ưu hóa hiệu năng trang web thương mại điện tử tích hợp thanh toán trực tuyến.",
    requirement: "Kỹ năng lập trình React/Next.js, Tailwind CSS, RESTful API và cơ sở dữ liệu MongoDB/PostgreSQL."
  },
  {
    id: "t6",
    title: "Chatbot hỗ trợ tư vấn tuyển sinh đại học",
    instructor: "TS. Đặng Quốc Phong",
    field: "Trí tuệ nhân tạo",
    registered: 1,
    capacity: 2,
    approval: "approved",
    semesterId: "dt-2026-t8",
    objective: "Xây dựng chatbot dựa trên xử lý ngôn ngữ tự nhiên (NLP) trả lời tự động các câu hỏi về thông tin tuyển sinh.",
    requirement: "Hiểu biết về NLP, xây dựng ứng dụng với Node.js/Python, sử dụng API OpenAI hoặc mô hình mã nguồn mở Rasa."
  },
]

export type ReportFile = {
  id: string
  fileName: string
  submittedDate: string
  status: "approved" | "pending" | "rejected"
  student?: string
  progress?: number
  isFinalThesis?: boolean
}

export const reportFiles: ReportFile[] = [
  {
    id: "r1",
    fileName: "BaoCao_TienDo_Tuan04.pdf",
    submittedDate: "12/10/2025",
    status: "approved",
    progress: 40,
    student: "Nguyễn Văn Đạt (SV2021008)",
  },
  {
    id: "r2",
    fileName: "BaoCao_TienDo_Tuan06.pdf",
    submittedDate: "26/10/2025",
    status: "pending",
    progress: 60,
    student: "Nguyễn Văn Đạt (SV2021008)",
  },
  {
    id: "r3",
    fileName: "DeCuong_ChiTiet_v2.pdf",
    submittedDate: "30/09/2025",
    status: "rejected",
    progress: 20,
    student: "Nguyễn Văn Đạt (SV2021008)",
  },

  {
    id: "r6",
    fileName: "BaoCao_TienDo_Tuan05_DuBaoThoiTiet.pdf",
    submittedDate: "18/10/2025",
    status: "approved",
    progress: 60,
    student: "Lý Thị Lan",
  },
  {
    id: "r7",
    fileName: "BaoCao_ThietKe_IoT_Tuan07.pdf",
    submittedDate: "28/10/2025",
    status: "approved",
    progress: 90,
    student: "Bùi Thanh Nga",
  },
  {
    id: "r8",
    fileName: "BaoCao_TienDo_Tuan04_ChatbotNLP.pdf",
    submittedDate: "15/10/2025",
    status: "approved",
    progress: 40,
    student: "Ngô Đức Mạnh",
  },
]

export type UnassignedProject = {
  id: string
  title: string
  student: string
  instructor: string
  semesterId?: string
}

export const unassignedProjects: UnassignedProject[] = [
  {
    id: "u1",
    title: "Ứng dụng di động quản lý chi tiêu cá nhân",
    student: "Nguyễn Văn Đạt (SV2021008)",
    instructor: "TS. Nguyễn Văn An",
    semesterId: "dt-2026-t8",
  },
  {
    id: "u3",
    title: "Chatbot hỗ trợ tư vấn tuyển sinh đại học",
    student: "Ngô Đức Mạnh",
    instructor: "TS. Đặng Quốc Phong",
    semesterId: "dt-2026-t8",
  },
  {
    id: "u2",
    title: "Phân tích dữ liệu lớn cho dự báo thời tiết",
    student: "Lý Thị Lan",
    instructor: "PGS.TS. Phạm Minh Dũng",
    semesterId: "dt-2025-1",
  },
]

export type Council = {
  id: string
  name: string
  room: string
  time: string
  members: string[]
  projects: { title: string; student: string }[]
  semesterId?: string
}

export const councils: Council[] = [
  {
    id: "c1",
    name: "Hội đồng số 01 - Công nghệ phần mềm",
    room: "Phòng A3.05",
    time: "08:00 - 11:30, 25/09/2026",
    members: ["TS. Nguyễn Văn An", "ThS. Trần Thị Bình", "TS. Lê Hoàng Cường"],
    projects: [
      { title: "Hệ thống IoT giám sát chất lượng không khí", student: "Bùi Thanh Nga" },
    ],
    semesterId: "dt-2026-t8"
  },
  {
    id: "c2",
    name: "Hội đồng số 02 - Trí tuệ nhân tạo (HK I 2025-2026)",
    room: "Phòng B2.10",
    time: "13:30 - 17:00, 21/01/2026",
    members: ["PGS.TS. Phạm Minh Dũng", "TS. Đặng Quốc Phong", "TS. Lê Hoàng Cường"],
    projects: [
      { title: "Hệ thống nhận diện khuôn mặt điểm danh sinh viên", student: "Hoàng Văn Khoa (SV2021001)" },
    ],
    semesterId: "dt-2025-1"
  },
]

/* ---- Sinh viên trong đợt (View 1) ---- */
export type SemesterStudent = {
  id: string
  semesterId: string
  code: string
  name: string
  className: string
  credits: number // số tín chỉ tích lũy (%)
  eligible: boolean
}

export const semesterStudents: SemesterStudent[] = [
  { id: "s1", semesterId: "dt-2025-1", code: "SV2021001", name: "Hoàng Văn Khoa (SV2021001)", className: "CNTT01", credits: 92, eligible: true },
  { id: "s2", semesterId: "dt-2025-1", code: "SV2021002", name: "Lý Thị Lan", className: "CNTT01", credits: 85, eligible: true },
  { id: "s3", semesterId: "dt-2025-1", code: "SV2021003", name: "Ngô Đức Mạnh", className: "CNTT02", credits: 78, eligible: false },
  { id: "s4", semesterId: "dt-2025-1", code: "SV2021004", name: "Bùi Thanh Nga", className: "CNTT02", credits: 81, eligible: true },
  { id: "s5", semesterId: "dt-2025-1", code: "SV2021005", name: "Phan Văn Quý", className: "CNTT03", credits: 74, eligible: false },
]

/* ---- SV đăng ký đề tài chờ duyệt (View 2) ---- */
export type Registration = {
  id: string
  student: string
  topicTitle: string
  status: "pending" | "approved"
}

export const registrations: Registration[] = [
  { id: "rg0", student: "Nguyễn Văn Đạt (SV2021008)", topicTitle: "Ứng dụng di động quản lý chi tiêu cá nhân", status: "approved" },
  { id: "rg1", student: "Hoàng Văn Khoa (SV2021001)", topicTitle: "Hệ thống nhận diện khuôn mặt điểm danh sinh viên", status: "approved" },
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
  instructor?: string
  grade?: number
  comment?: string
  semesterId?: string
  isLocked?: boolean
}

export const studentProgress: StudentProgress[] = [
  {
    id: "p1",
    student: "Hoàng Văn Khoa (SV2021001)",
    topicTitle: "Hệ thống nhận diện khuôn mặt điểm danh sinh viên",
    progress: 100,
    lastReport: "BaoCao_QuyenDoAn_HoanThien.pdf",
    instructor: "TS. Nguyễn Văn An",
    grade: 9.0,
    comment: "Sinh viên nghiêm túc, chủ động báo cáo tiến độ hàng tuần và hoàn thành xuất sắc 100% mục tiêu đề ra.",
    semesterId: "dt-2025-1",
    isLocked: true
  },
  { id: "p2", student: "Lý Thị Lan", topicTitle: "Dự báo thời tiết", progress: 60, lastReport: "Tuần 5", instructor: "PGS.TS. Phạm Minh Dũng", semesterId: "dt-2025-1", isLocked: true },
  { id: "p3", student: "Bùi Thanh Nga", topicTitle: "IoT giám sát không khí", progress: 90, lastReport: "Tuần 7", instructor: "ThS. Vũ Thị Em", semesterId: "dt-2026-t8", isLocked: false },
  { id: "p4", student: "Ngô Đức Mạnh", topicTitle: "Chatbot tư vấn tuyển sinh", progress: 40, lastReport: "Tuần 4", instructor: "TS. Đặng Quốc Phong", semesterId: "dt-2026-t8", isLocked: false },
  { id: "p5", student: "Nguyễn Văn Đạt (SV2021008)", topicTitle: "Ứng dụng di động quản lý chi tiêu cá nhân", progress: 40, lastReport: "BaoCao_TienDo_Tuan04.pdf", instructor: "TS. Nguyễn Văn An", semesterId: "dt-2026-t8", isLocked: false },
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
  comment?: string
  grade?: number
  instructorGrade?: number
  instructorComment?: string
  semesterId?: string
}

export const reviewAssignments: ReviewAssignment[] = [
  {
    id: "ra0",
    topicTitle: "Ứng dụng di động quản lý chi tiêu cá nhân",
    student: "Nguyễn Văn Đạt (SV2021008)",
    reviewer: "PGS.TS. Phạm Minh Dũng",
    semesterId: "dt-2026-t8"
  },
  {
    id: "ra5",
    topicTitle: "Hệ thống nhận diện khuôn mặt điểm danh sinh viên",
    student: "Hoàng Văn Khoa (SV2021001)",
    reviewer: "PGS.TS. Phạm Minh Dũng",
    grade: 8.5,
    comment: "Nội dung báo cáo thực hiện đầy đủ, mô hình nhận diện khuôn mặt hoạt động tốt, slide thuyết trình chuẩn bị kỹ lưỡng.",
    instructorGrade: 9.0,
    instructorComment: "Sinh viên nghiêm túc, chủ động báo cáo tiến độ hàng tuần và hoàn thành xuất sắc 100% mục tiêu đề ra.",
    semesterId: "dt-2025-1"
  },
]
