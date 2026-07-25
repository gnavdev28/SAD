import { NextResponse } from 'next/server'
import { readDB, writeDB } from '@/lib/db-server'

export async function GET() {
  try {
    const db = readDB()
    return NextResponse.json({
      success: true,
      semesters: db.semesters,
      students: db.semesterStudents
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

    if (action === 'save_semester') {
      const { id, name, startDate, endDate } = body
      if (id) {
        // Edit
        db.semesters = db.semesters.map(s => 
          s.id === id ? { ...s, name, startDate, endDate } : s
        )
      } else {
        // Create
        db.semesters.unshift({
          id: `dt-${Date.now()}`,
          name,
          startDate,
          endDate,
          status: 'open'
        })
      }
      writeDB(db)
      return NextResponse.json({ success: true, semesters: db.semesters })
    }

    if (action === 'toggle_lock_semester') {
      const { id } = body
      db.semesters = db.semesters.map(s => 
        s.id === id ? { ...s, status: s.status === 'open' ? 'locked' : 'open' } : s
      )
      writeDB(db)
      return NextResponse.json({ success: true, semesters: db.semesters })
    }

    if (action === 'delete_semester') {
      const { id } = body
      db.semesters = db.semesters.filter(s => s.id !== id)
      writeDB(db)
      return NextResponse.json({ success: true, semesters: db.semesters })
    }

    if (action === 'auto_filter_students') {
      // Auto filter eligible students who have credits >= 80
      db.semesterStudents = db.semesterStudents.map(s => ({
        ...s,
        eligible: s.credits >= 80
      }))
      writeDB(db)
      return NextResponse.json({ success: true, students: db.semesterStudents })
    }

    if (action === 'delete_student') {
      const { id } = body
      db.semesterStudents = db.semesterStudents.filter(s => s.id !== id)
      writeDB(db)
      return NextResponse.json({ success: true, students: db.semesterStudents })
    }

    if (action === 'add_student') {
      const { code, name, className, credits } = body
      const newStudent = {
        id: `sv-${Date.now()}`,
        code,
        name,
        className,
        credits,
        eligible: credits >= 80
      }
      db.semesterStudents.unshift(newStudent)
      writeDB(db)
      return NextResponse.json({ success: true, students: db.semesterStudents })
    }

    return NextResponse.json({ success: false, message: "Hành động không hợp lệ" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi Server" }, { status: 500 })
  }
}
