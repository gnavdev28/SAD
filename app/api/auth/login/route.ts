import { NextResponse } from 'next/server'
import { readDB } from '@/lib/db-server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    const db = readDB()
    
    // Find user in database
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase())
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Tài khoản không tồn tại trên hệ thống." },
        { status: 401 }
      )
    }

    // Basic password validation mock (accept admin123 for admin, 123456 for others)
    const expectedPassword = user.role === 'admin' ? 'admin123' : '123456'
    if (password !== expectedPassword) {
      return NextResponse.json(
        { success: false, message: "Mật khẩu không chính xác." },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        role: user.roleName.includes("Quản trị") || user.role === 'admin' ? "Giáo vụ" : (user.role === 'student' ? "Sinh viên" : "Giảng viên"),
        rawRole: user.role
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra." },
      { status: 500 }
    )
  }
}
