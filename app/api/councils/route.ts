import { NextResponse } from 'next/server'
import { readDB, writeDB } from '@/lib/db-server'

function queryApprovedTopicsWithAdvisor() {
  return readDB()
}

function insertCouncilToDB(db: any, name: string, room: string, time: string, members: string[], projects: any[]) {
  db.councils.unshift({
    id: `c-${Date.now()}`,
    name,
    room,
    time,
    members,
    projects
  })
  writeDB(db)
}

function saveAssignmentToDB(db: any, id: string, reviewer: string) {
  db.reviewAssignments = db.reviewAssignments.map((ra: any) => 
    ra.id === id ? { ...ra, reviewer } : ra
  )
  writeDB(db)
}

export async function GET() {
  try {
    const db = queryApprovedTopicsWithAdvisor()
    return NextResponse.json({
      success: true,
      councils: db.councils,
      reviewAssignments: db.reviewAssignments,
      issued: db.reviewerDecisionIssued || false,
      councilGrades: db.councilGrades || {}
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
      const { id, name, room, time, members, projects, semesterId } = body
      if (id) {
        // Edit
        db.councils = db.councils.map(c => 
          c.id === id ? { ...c, name, room, time, members, projects, semesterId: semesterId || c.semesterId || "dt-2026-t8" } : c
        )
        writeDB(db)
      } else {
        // Create
        db.councils.unshift({
          id: `c-${Date.now()}`,
          name,
          room,
          time,
          members,
          projects: projects || [],
          semesterId: semesterId || "dt-2026-t8"
        })
        writeDB(db)
      }
      return NextResponse.json({ success: true, councils: db.councils })
    }

    if (action === 'assign_project_to_council') {
      const { councilId, projectId } = body
      const targetProj = db.unassignedProjects.find((u: any) => u.id === projectId)
      if (targetProj) {
        db.councils = db.councils.map((c: any) => {
          if (c.id === councilId) {
            return {
              ...c,
              projects: [...c.projects, { title: targetProj.title, student: targetProj.student }]
            }
          }
          return c
        })
        db.unassignedProjects = db.unassignedProjects.filter((u: any) => u.id !== projectId)
        writeDB(db)
      }
      return NextResponse.json({ success: true, councils: db.councils, unassignedProjects: db.unassignedProjects })
    }

    if (action === 'revoke_project_from_council') {
      const { councilId, projectTitle } = body
      let revokedProj: any = null
      db.councils = db.councils.map((c: any) => {
        if (c.id === councilId) {
          const remaining = c.projects.filter((p: any) => {
            if (p.title === projectTitle) {
              revokedProj = p
              return false
            }
            return true
          })
          return { ...c, projects: remaining }
        }
        return c
      })

      if (revokedProj) {
        const exists = db.unassignedProjects.some((u: any) => u.title === revokedProj.title)
        if (!exists) {
          db.unassignedProjects.push({
            id: `u-${Date.now()}`,
            title: revokedProj.title,
            student: revokedProj.student,
            instructor: "TS. Nguyễn Văn An",
            semesterId: "dt-2026-t8"
          })
        }
      }
      writeDB(db)
      return NextResponse.json({ success: true, councils: db.councils, unassignedProjects: db.unassignedProjects })
    }

    if (action === 'delete_council') {
      const { id } = body
      const targetCouncil = db.councils.find((c: any) => c.id === id)
      if (targetCouncil && targetCouncil.projects) {
        targetCouncil.projects.forEach((p: any) => {
          const exists = db.unassignedProjects.some((u: any) => u.title === p.title)
          if (!exists) {
            db.unassignedProjects.push({
              id: `u-${Date.now()}-${Math.random()}`,
              title: p.title,
              student: p.student,
              instructor: "TS. Nguyễn Văn An",
              semesterId: targetCouncil.semesterId || "dt-2026-t8"
            })
          }
        })
      }
      db.councils = db.councils.filter((c: any) => c.id !== id)
      writeDB(db)
      return NextResponse.json({ success: true, councils: db.councils, unassignedProjects: db.unassignedProjects })
    }

    if (action === 'assign_reviewer') {
      const { id, reviewer } = body
      saveAssignmentToDB(db, id, reviewer)
      return NextResponse.json({ success: true, reviewAssignments: db.reviewAssignments })
    }

    if (action === 'issue_decision') {
      db.reviewerDecisionIssued = true
      writeDB(db)
      return NextResponse.json({ success: true, issued: true })
    }

    if (action === 'save_reviewer_evaluation') {
      const { id, comment, grade } = body
      db.reviewAssignments = db.reviewAssignments.map((ra: any) =>
        ra.id === id ? { ...ra, comment, grade: Number(grade) } : ra
      )
      writeDB(db)
      return NextResponse.json({ success: true, reviewAssignments: db.reviewAssignments })
    }

    if (action === 'save_council_grade') {
      const { councilId, projectIndex, grade } = body
      if (!db.councilGrades) db.councilGrades = {}
      db.councilGrades[`${councilId}-${projectIndex}`] = Number(grade)
      writeDB(db)
      return NextResponse.json({ success: true, councilGrades: db.councilGrades })
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
