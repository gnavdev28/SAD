'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ActivityDiagramView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Activity Diagram</h2>
          <p className="text-sm text-muted-foreground mt-1">Quy trình quản lý đồ án tốt nghiệp</p>
        </div>
      </div>

      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Quy trình từ A→Z</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <svg
              viewBox="0 0 1200 1400"
              className="w-full min-h-96 bg-white rounded-lg border"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Title */}
              <text x="600" y="30" fontSize="20" fontWeight="bold" textAnchor="middle" fill="#1e3a8a">
                Activity Diagram: Hệ thống Quản lý Đồ án Tốt nghiệp
              </text>

              {/* Start */}
              <circle cx="600" cy="80" r="15" fill="#22c55e" stroke="#16a34a" strokeWidth="2" />
              <text x="600" y="120" fontSize="12" textAnchor="middle" fill="#333">
                Start
              </text>
              <line x1="600" y1="95" x2="600" y2="140" stroke="#333" strokeWidth="2" />

              {/* Phase 1: Quản lý đợt */}
              <rect x="450" y="140" width="300" height="80" rx="8" fill="#3b82f6" stroke="#1e40af" strokeWidth="2" />
              <text x="600" y="165" fontSize="14" fontWeight="bold" textAnchor="middle" fill="white">
                Phase 1: Quản lý đợt
              </text>
              <text x="600" y="185" fontSize="12" textAnchor="middle" fill="white">
                [Đơn vị]: Tạo/Khóa đợt, Thêm SV
              </text>
              <text x="600" y="205" fontSize="12" textAnchor="middle" fill="white">
                Xuất danh sách SV đủ điều kiện
              </text>
              <line x1="600" y1="220" x2="600" y2="270" stroke="#333" strokeWidth="2" />

              {/* Parallel start */}
              <circle cx="600" cy="290" r="8" fill="#333" stroke="#333" strokeWidth="2" />
              <line x1="600" y1="298" x2="600" y2="330" stroke="#333" strokeWidth="2" />
              <line x1="600" y1="330" x2="300" y2="330" stroke="#333" strokeWidth="2" />
              <line x1="600" y1="330" x2="900" y2="330" stroke="#333" strokeWidth="2" />
              <line x1="300" y1="330" x2="300" y2="360" stroke="#333" strokeWidth="2" />
              <line x1="900" y1="330" x2="900" y2="360" stroke="#333" strokeWidth="2" />

              {/* Phase 2a: Topics */}
              <rect x="150" y="360" width="300" height="100" rx="8" fill="#06b6d4" stroke="#0891b2" strokeWidth="2" />
              <text x="300" y="390" fontSize="14" fontWeight="bold" textAnchor="middle" fill="white">
                Phase 2a: Đăng ký đề tài
              </text>
              <text x="300" y="410" fontSize="12" textAnchor="middle" fill="white">
                [Giảng viên]: Tạo/Sửa đề tài
              </text>
              <text x="300" y="430" fontSize="12" textAnchor="middle" fill="white">
                [Sinh viên]: Đăng ký đề tài
              </text>
              <text x="300" y="450" fontSize="12" textAnchor="middle" fill="white">
                [Admin]: Phê duyệt/Từ chối
              </text>

              {/* Phase 2b: Progress setup */}
              <rect x="750" y="360" width="300" height="100" rx="8" fill="#8b5cf6" stroke="#6d28d9" strokeWidth="2" />
              <text x="900" y="390" fontSize="14" fontWeight="bold" textAnchor="middle" fill="white">
                Phase 2b: Khởi tạo Báo cáo
              </text>
              <text x="900" y="410" fontSize="12" textAnchor="middle" fill="white">
                [Sinh viên]: Lập kế hoạch ĐATN
              </text>
              <text x="900" y="430" fontSize="12" textAnchor="middle" fill="white">
                [GVHD]: Ghi nhận hướng dẫn
              </text>
              <text x="900" y="450" fontSize="12" textAnchor="middle" fill="white">
                [Admin]: Mở cửa nộp báo cáo
              </text>

              {/* Join parallel */}
              <line x1="300" y1="460" x2="300" y2="500" stroke="#333" strokeWidth="2" />
              <line x1="900" y1="460" x2="900" y2="500" stroke="#333" strokeWidth="2" />
              <line x1="300" y1="500" x2="600" y2="500" stroke="#333" strokeWidth="2" />
              <line x1="900" y1="500" x2="600" y2="500" stroke="#333" strokeWidth="2" />
              <circle cx="600" cy="500" r="8" fill="#333" stroke="#333" strokeWidth="2" />
              <line x1="600" y1="508" x2="600" y2="540" stroke="#333" strokeWidth="2" />

              {/* Phase 3: Progress Reports */}
              <rect x="400" y="540" width="400" height="120" rx="8" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
              <text x="600" y="570" fontSize="14" fontWeight="bold" textAnchor="middle" fill="white">
                Phase 3: Báo cáo tiến độ
              </text>
              <text x="600" y="590" fontSize="12" textAnchor="middle" fill="white">
                [Sinh viên]: Nộp báo cáo theo tuần
              </text>
              <text x="600" y="610" fontSize="12" textAnchor="middle" fill="white">
                [GVHD]: Nhận xét &amp; hướng dẫn
              </text>
              <text x="600" y="630" fontSize="12" textAnchor="middle" fill="white">
                [Admin]: Duyệt tiến độ, xử lý đơn gia hạn
              </text>
              <text x="600" y="650" fontSize="12" textAnchor="middle" fill="white">
                Loop: Tuần 1 → Tuần 12
              </text>
              <line x1="600" y1="660" x2="600" y2="710" stroke="#333" strokeWidth="2" />

              {/* Decision: Hết đợt báo cáo? */}
              <polygon points="600,710 680,760 600,810 520,760" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
              <text x="600" y="765" fontSize="12" textAnchor="middle" fontWeight="bold" fill="#333">
                Hết đợt
              </text>
              <text x="600" y="780" fontSize="11" textAnchor="middle" fill="#333">
                báo cáo?
              </text>

              {/* No - Loop back */}
              <line x1="520" y1="760" x2="350" y2="760" stroke="#ef4444" strokeWidth="2" />
              <line x1="350" y1="760" x2="350" y2="600" stroke="#ef4444" strokeWidth="2" />
              <line x1="350" y1="600" x2="400" y2="600" stroke="#ef4444" strokeWidth="2" />
              <text x="380" y="755" fontSize="11" fill="#ef4444" fontWeight="bold">
                Không
              </text>

              {/* Yes - Continue */}
              <line x1="600" y1="810" x2="600" y2="860" stroke="#22c55e" strokeWidth="2" />
              <text x="620" y="840" fontSize="11" fill="#22c55e" fontWeight="bold">
                Có
              </text>

              {/* Phase 4: Reviewer Assignment */}
              <rect x="400" y="860" width="400" height="100" rx="8" fill="#ec4899" stroke="#be185d" strokeWidth="2" />
              <text x="600" y="890" fontSize="14" fontWeight="bold" textAnchor="middle" fill="white">
                Phase 4: Phân công Phản biện
              </text>
              <text x="600" y="910" fontSize="12" textAnchor="middle" fill="white">
                [Giảng viên]: Đề xuất phản biện
              </text>
              <text x="600" y="930" fontSize="12" textAnchor="middle" fill="white">
                [Admin]: Ban hành QĐ phân công
              </text>
              <text x="600" y="950" fontSize="12" textAnchor="middle" fill="white">
                [Phản biện]: Tải quyển ĐATN
              </text>
              <line x1="600" y1="960" x2="600" y2="1010" stroke="#333" strokeWidth="2" />

              {/* Phase 5: Review */}
              <rect x="400" y="1010" width="400" height="100" rx="8" fill="#06b6d4" stroke="#0891b2" strokeWidth="2" />
              <text x="600" y="1040" fontSize="14" fontWeight="bold" textAnchor="middle" fill="white">
                Phase 5: Phản biện
              </text>
              <text x="600" y="1060" fontSize="12" textAnchor="middle" fill="white">
                [Phản biện]: Viết nhận xét phản biện
              </text>
              <text x="600" y="1080" fontSize="12" textAnchor="middle" fill="white">
                [GVHD]: Chuẩn bị thuyết trình
              </text>
              <text x="600" y="1100" fontSize="12" textAnchor="middle" fill="white">
                [SV]: Chuẩn bị bản trình bày
              </text>
              <line x1="600" y1="1110" x2="600" y2="1160" stroke="#333" strokeWidth="2" />

              {/* Phase 6: Defense */}
              <rect x="400" y="1160" width="400" height="100" rx="8" fill="#14b8a6" stroke="#0d9488" strokeWidth="2" />
              <text x="600" y="1190" fontSize="14" fontWeight="bold" textAnchor="middle" fill="white">
                Phase 6: Hội đồng Bảo vệ
              </text>
              <text x="600" y="1210" fontSize="12" textAnchor="middle" fill="white">
                [Sinh viên]: Thuyết trình
              </text>
              <text x="600" y="1230" fontSize="12" textAnchor="middle" fill="white">
                [Hội đồng]: Hỏi và chấm điểm
              </text>
              <text x="600" y="1250" fontSize="12" textAnchor="middle" fill="white">
                [Admin]: Nhập điểm vào hệ thống
              </text>
              <line x1="600" y1="1260" x2="600" y2="1310" stroke="#333" strokeWidth="2" />

              {/* End */}
              <circle cx="600" cy="1330" r="15" fill="#ef4444" stroke="#dc2626" strokeWidth="2" />
              <text x="600" y="1370" fontSize="12" textAnchor="middle" fill="#333">
                End
              </text>

              {/* Legend */}
              <g transform="translate(50, 1250)">
                <text x="0" y="0" fontSize="12" fontWeight="bold" fill="#333">
                  Actors:
                </text>
                <circle cx="0" cy="20" r="4" fill="#3b82f6" />
                <text x="12" y="24" fontSize="11" fill="#333">
                  Đơn vị
                </text>
                <circle cx="80" cy="20" r="4" fill="#06b6d4" />
                <text x="92" y="24" fontSize="11" fill="#333">
                  Giảng viên / Sinh viên
                </text>
                <circle cx="320" cy="20" r="4" fill="#f59e0b" />
                <text x="332" y="24" fontSize="11" fill="#333">
                  Admin
                </text>
              </g>
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* Mermaid Diagram */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Mermaid Diagram Code</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-slate-100 p-4 rounded overflow-auto text-xs font-mono">
            {`activityDiagram
  title Quy trình Quản lý Đồ án Tốt nghiệp
  
  start
  :Quản lý đợt
   Đơn vị tạo/khóa đợt
   Thêm sinh viên;
  fork
    :Đăng ký đề tài
     GV tạo đề tài
     SV đăng ký
     Admin phê duyệt;
  fork again
    :Khởi tạo báo cáo
     GVHD ghi nhận
     Admin mở cửa nộp;
  join
  :Báo cáo tiến độ
   SV nộp báo cáo (Tuần 1-12)
   GVHD nhận xét
   Admin xử lý gia hạn;
  if (Kết thúc đợt báo cáo?) then (Có)
    :Phân công phản biện
     GV đề xuất PB
     Admin ban hành QĐ
     PB tải quyển;
    :Phản biện
     PB viết nhận xét
     GVHD chuẩn bị thuyết trình;
    :Hội đồng bảo vệ
     SV thuyết trình
     Hội đồng chấm điểm
     Admin nhập điểm;
    end
  else (Không)
    note right
      Quay lại nộp báo cáo tuần tiếp theo
    end note
  endif
  stop`}
          </pre>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Giải thích Quy trình</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-primary">Phase 1: Quản lý đợt</h4>
            <p className="text-sm text-muted-foreground">
              Đơn vị tạo/khóa đợt, thêm sinh viên đủ điều kiện (≥80% tín chỉ), xuất danh sách.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-primary">Phase 2: Đăng ký đề tài & Khởi tạo báo cáo</h4>
            <p className="text-sm text-muted-foreground">
              Diễn ra song song — Giảng viên tạo đề tài, sinh viên đăng ký, Admin phê duyệt. Đồng thời GVHD ghi nhận hướng dẫn và Admin mở
              cửa nộp báo cáo.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-primary">Phase 3: Báo cáo tiến độ</h4>
            <p className="text-sm text-muted-foreground">
              Vòng lặp 12 tuần — Sinh viên nộp báo cáo, GVHD nhận xét, Admin duyệt & xử lý đơn gia hạn. Quay lại nếu chưa kết thúc.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-primary">Phase 4: Phân công phản biện</h4>
            <p className="text-sm text-muted-foreground">
              Giảng viên đề xuất phản biện, Admin ban hành Quyết định phân công, phản biện tải quyển ĐATN.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-primary">Phase 5: Phản biện</h4>
            <p className="text-sm text-muted-foreground">
              Phản biện viết nhận xét chi tiết, GVHD chuẩn bị thuyết trình, sinh viên chuẩn bị bản trình bày.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-primary">Phase 6: Hội đồng Bảo vệ</h4>
            <p className="text-sm text-muted-foreground">
              Sinh viên thuyết trình, hội đồng hỏi & chấm điểm, Admin nhập điểm vào hệ thống. Kết thúc quy trình.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
