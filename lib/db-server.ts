import fs from 'fs'
import path from 'path'
import { 
  semesters, topics, reportFiles, unassignedProjects, councils, semesterStudents,
  registrations, extensionRequests, studentProgress, progressChart, reviewAssignments
} from './mock-data'

const DB_FILE = path.join(process.cwd(), 'db.json')

export type UserRole = "admin" | "instructor" | "reviewer" | "council" | "student"

export interface AccountUser {
  id: string
  name: string
  email: string
  role: UserRole
  roleName: string
  status: "active" | "inactive" | "locked"
  permissions: string[]
}

const defaultUsers: AccountUser[] = [
  {
    id: "u1",
    name: "Quản trị viên (Phạm Quang Hà)",
    email: "admin@phenikaa-uni.edu.vn",
    role: "admin",
    roleName: "Người phụ trách đồ án (Quản trị)",
    status: "active",
    permissions: ["quan_ly_dot", "duyet_de_tai", "phan_cong_phan_bien", "thanh_lap_hoi_dong", "thong_ke"],
  },
  {
    id: "u2",
    name: "TS. Nguyễn Văn An",
    email: "an.nguyen@phenikaa-uni.edu.vn",
    role: "instructor",
    roleName: "Giảng viên hướng dẫn",
    status: "active",
    permissions: ["de_xuat_de_tai", "duyet_sv_dang_ky", "cham_tien_do"],
  },
  {
    id: "u3",
    name: "PGS.TS. Phạm Minh Dũng",
    email: "dung.pham@phenikaa-uni.edu.vn",
    role: "reviewer",
    roleName: "Giảng viên phản biện",
    status: "active",
    permissions: ["cham_phan_bien", "tai_quyen_do_an"],
  },
  {
    id: "u4",
    name: "TS. Lê Hoàng Cường",
    email: "cuong.le@phenikaa-uni.edu.vn",
    role: "council",
    roleName: "Thành viên hội đồng",
    status: "active",
    permissions: ["cham_diem_bao_ve", "xem_bien_ban"],
  },
  {
    id: "u5",
    name: "Nguyễn Văn Đạt (SV2021008)",
    email: "student@st.phenikaa-uni.edu.vn",
    role: "student",
    roleName: "Sinh viên",
    status: "active",
    permissions: ["dang_ky_de_tai", "nop_bao_cao", "gia_han"],
  },
  {
    id: "u6",
    name: "Ngọ Tâm Ngọc (SV2021009)",
    email: "24108752@st.phenikaa-uni.edu.vn",
    role: "student",
    roleName: "Sinh viên",
    status: "locked",
    permissions: ["dang_ky_de_tai"],
  },
  {
    id: "u7",
    name: "Đặng Ngọc Khuê (SV2021010)",
    email: "24100493@st.phenikaa-uni.edu.vn",
    role: "student",
    roleName: "Sinh viên",
    status: "active",
    permissions: ["dang_ky_de_tai", "nop_bao_cao", "gia_han"],
  }
]

export interface DatabaseSchema {
  semesters: typeof semesters
  topics: typeof topics
  reportFiles: typeof reportFiles
  unassignedProjects: typeof unassignedProjects
  councils: typeof councils
  semesterStudents: typeof semesterStudents
  users: AccountUser[]
  registrations: typeof registrations
  extensionRequests: typeof extensionRequests
  studentProgress: typeof studentProgress
  progressChart: typeof progressChart
  reviewAssignments: typeof reviewAssignments
}

const initialData: DatabaseSchema = {
  semesters,
  topics: topics.map((t, index) => ({
    ...t,
    approval: index === 2 || index === 4 ? "pending" : "approved",
  } as any)),
  reportFiles,
  unassignedProjects,
  councils,
  semesterStudents,
  users: defaultUsers,
  registrations,
  extensionRequests,
  studentProgress,
  progressChart,
  reviewAssignments
}

export function readDB(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDB(initialData)
      return initialData
    }
    const data = fs.readFileSync(DB_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error("Error reading database:", error)
    return initialData
  }
}

export function writeDB(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8')
  } catch (error) {
    console.error("Error writing database:", error)
  }
}
