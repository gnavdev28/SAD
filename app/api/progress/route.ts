import { NextResponse } from 'next/server'
import { readDB, writeDB } from '@/lib/db-server'

export async function GET() {
  try {
    const db = readDB()
    return NextResponse.json({
      success: true,
      reportFiles: db.reportFiles,
      extensionRequests: db.extensionRequests,
      studentProgress: db.studentProgress,
      progressChart: db.progressChart
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

    if (action === 'submit_report') {
      const { fileName, progressPercent, studentName, topicTitle } = body
      
      // 1. Add to report files list
      const newReport = {
        id: `r-${Date.now()}`,
        fileName,
        submittedDate: new Date().toLocaleDateString('vi-VN'),
        status: 'pending' as const
      }
      db.reportFiles.unshift(newReport)

      // 2. Update student progress
      db.studentProgress = db.studentProgress.map(p => 
        p.student === studentName 
          ? { ...p, progress: Number(progressPercent), lastReport: fileName.split('_')[1] || "Báo cáo" }
          : p
      )

      // 3. Update chart
      if (db.progressChart.length > 0) {
        // Increment the last week's submissions
        const lastWeek = db.progressChart[db.progressChart.length - 1]
        lastWeek.submitted += 1
      }

      writeDB(db)
      return NextResponse.json({ 
        success: true, 
        reportFiles: db.reportFiles, 
        studentProgress: db.studentProgress,
        progressChart: db.progressChart
      })
    }

    if (action === 'grade_report') {
      const { id, status } = body
      db.reportFiles = db.reportFiles.map(r => 
        r.id === id ? { ...r, status } : r
      )
      writeDB(db)
      return NextResponse.json({ success: true, reportFiles: db.reportFiles })
    }

    if (action === 'delete_report') {
      const { id } = body
      db.reportFiles = db.reportFiles.filter(r => r.id !== id)
      writeDB(db)
      return NextResponse.json({ success: true, reportFiles: db.reportFiles })
    }

    if (action === 'request_extension') {
      const { reason, days, studentName } = body
      db.extensionRequests.unshift({
        id: `ex-${Date.now()}`,
        student: studentName,
        reason,
        days: Number(days),
        status: 'pending'
      })
      writeDB(db)
      return NextResponse.json({ success: true, extensionRequests: db.extensionRequests })
    }

    if (action === 'approve_extension') {
      const { id } = body
      db.extensionRequests = db.extensionRequests.map(ex => 
        ex.id === id ? { ...ex, status: 'approved' } : ex
      )
      writeDB(db)
      return NextResponse.json({ success: true, extensionRequests: db.extensionRequests })
    }

    if (action === 'reject_extension') {
      const { id } = body
      db.extensionRequests = db.extensionRequests.map(ex => 
        ex.id === id ? { ...ex, status: 'rejected' } : ex
      )
      writeDB(db)
      return NextResponse.json({ success: true, extensionRequests: db.extensionRequests })
    }

    if (action === 'update_progress_percent') {
      const { id, progress } = body
      db.studentProgress = db.studentProgress.map(p => 
        p.id === id ? { ...p, progress: Number(progress) } : p
      )
      writeDB(db)
      return NextResponse.json({ success: true, studentProgress: db.studentProgress })
    }

    return NextResponse.json({ success: false, message: "Hành động không hợp lệ" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi Server" }, { status: 500 })
  }
}
