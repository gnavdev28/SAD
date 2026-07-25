import { NextResponse } from 'next/server'
import { readDB, writeDB } from '@/lib/db-server'

export async function GET() {
  try {
    const db = readDB()
    return NextResponse.json({
      success: true,
      councils: db.councils,
      reviewAssignments: db.reviewAssignments
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

    if (action === 'save_council') {
      const { id, name, room, time, members, projects } = body
      if (id) {
        // Edit
        db.councils = db.councils.map(c => 
          c.id === id ? { ...c, name, room, time, members, projects } : c
        )
      } else {
        // Create
        db.councils.unshift({
          id: `c-${Date.now()}`,
          name,
          room,
          time,
          members,
          projects
        })
      }
      writeDB(db)
      return NextResponse.json({ success: true, councils: db.councils })
    }

    if (action === 'delete_council') {
      const { id } = body
      db.councils = db.councils.filter(c => c.id !== id)
      writeDB(db)
      return NextResponse.json({ success: true, councils: db.councils })
    }

    if (action === 'assign_reviewer') {
      const { id, reviewer } = body
      db.reviewAssignments = db.reviewAssignments.map(ra => 
        ra.id === id ? { ...ra, reviewer } : ra
      )
      writeDB(db)
      return NextResponse.json({ success: true, reviewAssignments: db.reviewAssignments })
    }

    if (action === 'delete_assignment') {
      const { id } = body
      db.reviewAssignments = db.reviewAssignments.filter(ra => ra.id !== id)
      writeDB(db)
      return NextResponse.json({ success: true, reviewAssignments: db.reviewAssignments })
    }

    return NextResponse.json({ success: false, message: "Hành động không hợp lệ" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi Server" }, { status: 500 })
  }
}
