import { NextResponse } from 'next/server'
import { readDB, writeDB } from '@/lib/db-server'

function queryDatabase() {
  return readDB()
}

function saveReportAndUpdateStatus(db: any, fileName: string, progressPercent: number, studentName: string, topicTitle: string) {
  const newReport = {
    id: `r-${Date.now()}`,
    fileName,
    submittedDate: new Date().toLocaleDateString('vi-VN'),
    status: 'pending' as const,
    student: studentName,
    progress: Number(progressPercent)
  }
  db.reportFiles.unshift(newReport)

  const sName = studentName.trim()
  let found = false
  db.studentProgress = (db.studentProgress || []).map((p: any) => {
    const pName = p.student.trim()
    const isMatch = pName === sName || pName.includes(sName) || sName.includes(pName)
    if (isMatch) {
      found = true
      return { 
        ...p, 
        progress: Number(progressPercent), 
        lastReport: fileName 
      }
    }
    return p
  })

  // If student was not in studentProgress, auto-add them!
  if (!found) {
    const reg = (db.registrations || []).find((r: any) => {
      const rName = r.student.trim()
      return rName === sName || rName.includes(sName) || sName.includes(rName)
    })
    const assignedTopic = reg ? reg.topicTitle : topicTitle
    const topicObj = (db.topics || []).find((t: any) => t.title === assignedTopic)
    const assignedInstructor = topicObj ? topicObj.instructor : "TS. Nguyễn Văn An"

    db.studentProgress.push({
      id: `p-${Date.now()}`,
      student: studentName,
      topicTitle: assignedTopic,
      progress: Number(progressPercent),
      lastReport: fileName,
      instructor: assignedInstructor,
      semesterId: "dt-2026-t8",
      isLocked: false
    })
  }

  if (db.progressChart.length > 0) {
    const lastWeek = db.progressChart[db.progressChart.length - 1]
    lastWeek.submitted += 1
  }

  writeDB(db)
}

function saveExtensionRequest(db: any, reason: string, days: number, studentName: string) {
  db.extensionRequests.unshift({
    id: `ex-${Date.now()}`,
    student: studentName,
    reason,
    days: Number(days),
    status: 'pending'
  })
  writeDB(db)
}

function updateStatusAndDeadlineInDB(db: any, id: string, status: 'approved' | 'rejected') {
  db.extensionRequests = db.extensionRequests.map((ex: any) => 
    ex.id === id ? { ...ex, status } : ex
  )
  writeDB(db)
}

export async function GET() {
  try {
    const db = queryDatabase()
    const mergedProgress = (db.studentProgress || []).map((p: any) => {
      const ra = (db.reviewAssignments || []).find((r: any) => {
        const rName = r.student.trim()
        const pName = p.student.trim()
        return rName === pName || rName.includes(pName) || pName.includes(rName)
      })
      return {
        ...p,
        grade: p.grade !== undefined && p.grade !== null ? p.grade : ra?.instructorGrade,
        comment: p.comment ? p.comment : ra?.instructorComment
      }
    })
    return NextResponse.json({
      success: true,
      reportFiles: db.reportFiles,
      extensionRequests: db.extensionRequests,
      studentProgress: mergedProgress,
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
      saveReportAndUpdateStatus(db, fileName, Number(progressPercent), studentName, topicTitle)
      return NextResponse.json({ 
        success: true, 
        reportFiles: db.reportFiles, 
        studentProgress: db.studentProgress,
        progressChart: db.progressChart
      })
    }

    if (action === 'submit_final_thesis') {
      const { fileName, studentName, topicTitle } = body
      const sName = (studentName || "Nguyễn Văn Đạt").trim()
      const cleanFileName = fileName.startsWith("[Quyển ĐATN]") ? fileName : `[Quyển ĐATN] ${fileName}`
      
      const newReport = {
        id: `r-final-${Date.now()}`,
        fileName: cleanFileName,
        submittedDate: new Date().toLocaleDateString('vi-VN'),
        status: 'pending' as const,
        student: studentName || "Nguyễn Văn Đạt (SV2021008)",
        progress: 100,
        isFinalThesis: true
      }

      // Remove any existing final thesis report for this student
      db.reportFiles = (db.reportFiles || []).filter((f: any) => {
        if (!f.student) return true
        const fStudent = f.student.trim()
        const isMatch = fStudent === sName || fStudent.includes(sName) || sName.includes(fStudent)
        return !(isMatch && (f.isFinalThesis || (f.fileName && f.fileName.includes("[Quyển ĐATN]"))))
      })

      db.reportFiles.unshift(newReport)

      let found = false
      db.studentProgress = (db.studentProgress || []).map((p: any) => {
        const pName = p.student.trim()
        const isMatch = pName === sName || pName.includes(sName) || sName.includes(pName)
        if (isMatch) {
          found = true
          return {
            ...p,
            progress: 100,
            lastReport: cleanFileName
          }
        }
        return p
      })

      if (!found) {
        db.studentProgress.push({
          id: `p-${Date.now()}`,
          student: studentName,
          topicTitle: topicTitle || "Ứng dụng di động quản lý chi tiêu cá nhân",
          progress: 100,
          lastReport: cleanFileName,
          instructor: "TS. Nguyễn Văn An",
          semesterId: "dt-2026-t8",
          isLocked: false
        })
      }

      writeDB(db)
      return NextResponse.json({
        success: true,
        reportFiles: db.reportFiles,
        studentProgress: db.studentProgress,
        progressChart: db.progressChart
      })
    }

    if (action === 'cancel_final_thesis') {
      const { studentName } = body
      const sName = (studentName || "Nguyễn Văn Đạt").trim()
      db.reportFiles = (db.reportFiles || []).filter((f: any) => {
        if (!f.student) return true
        const fStudent = f.student.trim()
        const isMatch = fStudent === sName || fStudent.includes(sName) || sName.includes(fStudent)
        return !(isMatch && (f.isFinalThesis || (f.fileName && f.fileName.includes("[Quyển ĐATN]"))))
      })

      // Recalculate progress from remaining files
      db.studentProgress = (db.studentProgress || []).map((p: any) => {
        const pName = p.student.trim()
        const isMatch = pName === sName || pName.includes(sName) || sName.includes(pName)
        if (isMatch) {
          const myFiles = db.reportFiles.filter((r: any) => {
            if (!r.student) return false
            const rStudent = r.student.trim()
            return rStudent === sName || rStudent.includes(sName) || sName.includes(rStudent)
          })
          const maxProg = myFiles.length > 0 ? Math.max(...myFiles.map((r: any) => r.progress || 0)) : 40
          const lastFile = myFiles.length > 0 ? myFiles[0].fileName : "BaoCao_TienDo_Tuan04.pdf"
          return {
            ...p,
            progress: maxProg,
            lastReport: lastFile
          }
        }
        return p
      })

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
      db.reportFiles = db.reportFiles.map((r: any) => 
        r.id === id ? { ...r, status } : r
      )
      // Nếu duyệt, cập nhật lastReport và max progress trong studentProgress
      if (status === 'approved') {
        const approvedFile = db.reportFiles.find((r: any) => r.id === id)
        if (approvedFile && approvedFile.student) {
          const sName: string = approvedFile.student
          db.studentProgress = db.studentProgress.map((p: any) => {
            const pName: string = p.student
            const matched = sName === pName || sName.includes(pName) || pName.includes(sName)
            if (matched) {
              const studentApprovedFiles = db.reportFiles.filter((r: any) =>
                r.status === 'approved' &&
                r.student &&
                (r.student === sName || r.student.includes(sName) || sName.includes(r.student)) &&
                r.progress !== undefined
              )
              const maxProgress = studentApprovedFiles.length > 0
                ? Math.max(...studentApprovedFiles.map((r: any) => r.progress))
                : (approvedFile.progress !== undefined ? approvedFile.progress : p.progress)
              return {
                ...p,
                lastReport: approvedFile.fileName,
                progress: maxProgress
              }
            }
            return p
          })
        }
      }
      writeDB(db)
      return NextResponse.json({ success: true, reportFiles: db.reportFiles, studentProgress: db.studentProgress })
    }

    if (action === 'delete_report') {
      const { id } = body
      db.reportFiles = db.reportFiles.filter(r => r.id !== id)
      writeDB(db)
      return NextResponse.json({ success: true, reportFiles: db.reportFiles })
    }

    if (action === 'request_extension') {
      const { reason, days, studentName } = body
      saveExtensionRequest(db, reason, Number(days), studentName)
      return NextResponse.json({ success: true, extensionRequests: db.extensionRequests })
    }

    if (action === 'approve_extension') {
      const { id } = body
      updateStatusAndDeadlineInDB(db, id, 'approved')
      return NextResponse.json({ success: true, extensionRequests: db.extensionRequests })
    }

    if (action === 'reject_extension') {
      const { id } = body
      updateStatusAndDeadlineInDB(db, id, 'rejected')
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

    if (action === 'save_evaluation') {
      const { studentName, grade, comment } = body
      db.studentProgress = db.studentProgress.map((p: any) => {
        const sName: string = p.student
        const target: string = studentName
        const isMatch = sName === target || sName.includes(target) || target.includes(sName)
        return isMatch ? { ...p, grade: Number(grade), comment } : p
      })

      if (!db.reviewAssignments) db.reviewAssignments = []
      db.reviewAssignments = db.reviewAssignments.map((ra: any) => {
        const sName: string = ra.student
        const target: string = studentName
        const isMatch = sName === target || sName.includes(target) || target.includes(sName)
        return isMatch ? { ...ra, instructorGrade: Number(grade), instructorComment: comment } : ra
      })

      writeDB(db)
      return NextResponse.json({ success: true, studentProgress: db.studentProgress, reviewAssignments: db.reviewAssignments })
    }

    if (action === 'delete_student_progress') {
      const { id } = body
      db.studentProgress = db.studentProgress.filter((p: any) => p.id !== id)
      writeDB(db)
      return NextResponse.json({ success: true, studentProgress: db.studentProgress })
    }

    return NextResponse.json({ success: false, message: "Hành động không hợp lệ" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi Server" }, { status: 500 })
  }
}
