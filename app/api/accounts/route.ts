import { NextResponse } from 'next/server'
import { readDB, writeDB, type UserRole } from '@/lib/db-server'

function queryData() {
  return readDB()
}

function insertAccountToDB(db: any, name: string, email: string, role: UserRole, roleName: string, status: any, permissions: any) {
  db.users.push({
    id: `u-${Date.now()}`,
    name,
    email,
    role,
    roleName,
    status,
    permissions
  })
  writeDB(db)
}

function updateAccountInDB(db: any, id: string, name: string, email: string, role: UserRole, roleName: string, status: any, permissions: any) {
  db.users = db.users.map((u: any) => 
    u.id === id ? { ...u, name, email, role, roleName, status, permissions } : u
  )
  writeDB(db)
}

function deleteAccountInDB(db: any, id: string) {
  db.users = db.users.filter((u: any) => u.id !== id)
  writeDB(db)
}

export async function GET() {
  try {
    const db = queryData()
    return NextResponse.json({
      success: true,
      users: db.users
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi Server" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action } = body
    const db = readDB()

    const roleNames: Record<UserRole, string> = {
      admin: "Người phụ trách đồ án (Quản trị)",
      instructor: "Giảng viên hướng dẫn",
      reviewer: "Giảng viên phản biện",
      council: "Thành viên hội đồng",
      student: "Sinh viên",
    }

    if (action === 'save_user') {
      const { id, name, email, role, status, permissions } = body
      const roleName = roleNames[role as UserRole] || "Người dùng"

      if (id) {
        // Edit / Assign Role
        updateAccountInDB(db, id, name, email, role as UserRole, roleName, status, permissions)
      } else {
        // Create
        insertAccountToDB(db, name, email, role as UserRole, roleName, status, permissions)
      }
      return NextResponse.json({ success: true, users: db.users })
    }

    if (action === 'delete_user') {
      const { id } = body
      deleteAccountInDB(db, id)
      return NextResponse.json({ success: true, users: db.users })
    }

    return NextResponse.json({ success: false, message: "Hành động không hợp lệ" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi Server" }, { status: 500 })
  }
}
