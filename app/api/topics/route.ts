import { NextResponse } from 'next/server'
import { readDB, writeDB } from '@/lib/db-server'

export async function GET() {
  try {
    const db = readDB()
    return NextResponse.json({
      success: true,
      topics: db.topics,
      registrations: db.registrations,
      unassignedProjects: db.unassignedProjects
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

    if (action === 'save_topic') {
      const { id, title, instructor, field, capacity, objective, requirement } = body
      if (id) {
        // Edit
        db.topics = db.topics.map(t => 
          t.id === id ? { 
            ...t, 
            title, 
            instructor, 
            field, 
            capacity: Number(capacity),
            objective,
            requirement
          } : t
        )
      } else {
        // Create (proposed by lecturer/student)
        db.topics.unshift({
          id: `t-${Date.now()}`,
          title,
          instructor,
          field,
          capacity: Number(capacity),
          registered: 0,
          approval: 'pending',
          objective,
          requirement
        } as any)
      }
      writeDB(db)
      return NextResponse.json({ success: true, topics: db.topics })
    }

    if (action === 'delete_topic') {
      const { id } = body
      db.topics = db.topics.filter(t => t.id !== id)
      writeDB(db)
      return NextResponse.json({ success: true, topics: db.topics })
    }

    if (action === 'set_approval') {
      const { id, approval } = body
      db.topics = db.topics.map(t => 
        t.id === id ? { ...t, approval } : t
      )
      writeDB(db)
      return NextResponse.json({ success: true, topics: db.topics })
    }

    if (action === 'register_topic') {
      const { id, studentName } = body
      const topic = db.topics.find(t => t.id === id)
      if (topic) {
        topic.registered = (topic.registered || 0) + 1
        // Create registration
        db.registrations.unshift({
          id: `rg-${Date.now()}`,
          student: studentName,
          topicTitle: topic.title,
          status: 'pending'
        })
        writeDB(db)
      }
      return NextResponse.json({ success: true, topics: db.topics, registrations: db.registrations })
    }

    if (action === 'cancel_registration') {
      const { id, studentName } = body
      const topic = db.topics.find(t => t.id === id)
      if (topic) {
        topic.registered = Math.max(0, (topic.registered || 1) - 1)
        // Remove registration
        db.registrations = db.registrations.filter(
          r => !(r.student === studentName && r.topicTitle === topic.title)
        )
        writeDB(db)
      }
      return NextResponse.json({ success: true, topics: db.topics, registrations: db.registrations })
    }

    if (action === 'approve_student_reg') {
      const { student, topicTitle } = body
      db.registrations = db.registrations.map(r => 
        (r.student === student && r.topicTitle === topicTitle) ? { ...r, status: 'approved' } : r
      )
      // Also add to progress tracking
      const progressExists = db.studentProgress.some(p => p.student === student && p.topicTitle === topicTitle)
      if (!progressExists) {
        db.studentProgress.unshift({
          id: `p-${Date.now()}`,
          student,
          topicTitle,
          progress: 0,
          lastReport: "Chưa nộp"
        })
      }
      writeDB(db)
      return NextResponse.json({ success: true, registrations: db.registrations })
    }

    if (action === 'reject_student_reg') {
      const { student, topicTitle } = body
      db.registrations = db.registrations.filter(r => !(r.student === student && r.topicTitle === topicTitle))
      
      // Decrease registered count of the topic
      const topic = db.topics.find(t => t.title === topicTitle)
      if (topic) {
        topic.registered = Math.max(0, (topic.registered || 1) - 1)
      }
      
      writeDB(db)
      return NextResponse.json({ success: true, registrations: db.registrations, topics: db.topics })
    }

    return NextResponse.json({ success: false, message: "Hành động không hợp lệ" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi Server" }, { status: 500 })
  }
}
