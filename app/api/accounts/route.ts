import { NextResponse } from 'next/server'
import { readDB, writeDB, type UserRole } from '@/lib/db-server'

export async function GET() {
  try {
    const db = readDB()
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
        // Edit
        db.users = db.users.map(u => 
          u.id === id ? { ...u, name, email, role: role as UserRole, roleName, status, permissions } : u
        )
      } else {
        // Create
        db.users.push({
          id: `u-${Date.now()}`,
          name,
          email,
          role: role as UserRole,
          roleName,
          status,
          permissions
        })
      }
      writeDB(db)
      return NextResponse.json({ success: true, users: db.users })
    }

    if (action === 'delete_user') {
      const { id } = body
      db.users = db.users.filter(u => u.id !== id)
      writeDB(db)
      return NextResponse.json({ success: true, users: db.users })
    }

    return NextResponse.json({ success: false, message: "Hành động không hợp lệ" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi Server" }, { status: 500 })
  }
}
