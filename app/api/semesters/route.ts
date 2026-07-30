import { NextResponse } from 'next/server'
import { readDB, writeDB } from '@/lib/db-server'

function queryData() {
  return readDB()
}

function insertBatchToDB(db: any, name: string, startDate: string, endDate: string) {
  db.semesters.unshift({
    id: `dt-${Date.now()}`,
    name,
    startDate,
    endDate,
    status: 'open'
  })
  writeDB(db)
}

function updateDB(db: any, id: string, name: string, startDate: string, endDate: string) {
  db.semesters = db.semesters.map((s: any) => 
    s.id === id ? { ...s, name, startDate, endDate } : s
  )
  writeDB(db)
}

function saveBatchStatusToDB(db: any, id: string) {
  db.semesters = db.semesters.map((s: any) => 
    s.id === id ? { ...s, status: s.status === 'open' ? 'locked' : 'open' } : s
  )
  writeDB(db)
}

export async function GET() {
  try {
    const db = queryData()
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
        // Edit / Update
        updateDB(db, id, name, startDate, endDate)
      } else {
        // Create
        insertBatchToDB(db, name, startDate, endDate)
      }
      return NextResponse.json({ success: true, semesters: db.semesters })
    }

    if (action === 'toggle_lock_semester') {
      const { id } = body
      saveBatchStatusToDB(db, id)
      return NextResponse.json({ success: true, semesters: db.semesters })
    }

    if (action === 'set_current_semester') {
      const { id } = body
      db.semesters = db.semesters.map((s: any) => ({
        ...s,
        isCurrent: s.id === id
      }))
      writeDB(db)
      return NextResponse.json({ success: true, semesters: db.semesters })
    }

    if (action === 'delete_semester') {
      const { id } = body
      db.semesters = db.semesters.filter((s: any) => s.id !== id)
      writeDB(db)
      return NextResponse.json({ success: true, semesters: db.semesters })
    }

    if (action === 'auto_filter_students') {
      // Auto filter eligible students who have credits >= 80
      db.semesterStudents = db.semesterStudents.map((s: any) => ({
        ...s,
        eligible: s.credits >= 80
      }))
      writeDB(db)
      return NextResponse.json({ success: true, students: db.semesterStudents })
    }

    if (action === 'delete_student') {
      const { id } = body
      db.semesterStudents = db.semesterStudents.filter((s: any) => s.id !== id)
      writeDB(db)
      return NextResponse.json({ success: true, students: db.semesterStudents })
    }

    if (action === 'add_student') {
      const { code, name, className, credits, semesterId } = body
      const newStudent = {
        id: `sv-${Date.now()}`,
        semesterId: semesterId || 'dt-2025-1',
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

    if (action === 'import_students') {
      const { students: importedList, semesterId } = body
      if (Array.isArray(importedList)) {
        const newStudents = importedList.map((s: any, idx: number) => ({
          id: `sv-${Date.now()}-${idx}`,
          semesterId: semesterId || 'dt-2025-1',
          code: s.code,
          name: s.name,
          className: s.className || s.class || "CNTT01",
          credits: Number(s.credits) || 0,
          eligible: Number(s.credits) >= 80
        }))
        db.semesterStudents.unshift(...newStudents)
        writeDB(db)
      }
      return NextResponse.json({ success: true, students: db.semesterStudents })
    }

    return NextResponse.json({ success: false, message: "Hành động không hợp lệ" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi Server" }, { status: 500 })
  }
}
