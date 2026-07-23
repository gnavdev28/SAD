"use client"

import { useState } from "react"
import { GraduationCap, Lock, Mail, Type, ShieldCheck, AlertCircle, X, ArrowLeft, Eye, EyeOff, UserSquare2 } from "lucide-react"

type AuthState = "login" | "login_failed" | "register"
type Role = "student" | "lecturer"

export interface AuthViewProps {
  onLoginSuccess: (user: { name: string; email: string; role: string }) => void
}

export function AuthView({ onLoginSuccess }: AuthViewProps) {
  const [state, setState] = useState<AuthState>("login")
  const [role, setRole] = useState<Role>("student")
  
  // Form states
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [code, setCode] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (data.success) {
        onLoginSuccess(data.user)
      } else {
        setState("login_failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      setState("login_failed")
    }
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    if (!termsAccepted) return
    
    // Simulate successful registration by logging in
    onLoginSuccess({
      name: fullName || (role === "student" ? "Sinh viên Mới" : "Giảng viên Mới"),
      email: email || `${code || "user"}@st.phenikaa-uni.edu.vn`,
      role: role === "student" ? "Sinh viên" : "Giảng viên"
    })
  }

  const handleSSOLogin = () => {
    // Quick bypass for testing or demonstration
    onLoginSuccess({
      name: "Người dùng SSO",
      email: "sso.user@st.phenikaa-uni.edu.vn",
      role: "Giáo vụ"
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-[460px] space-y-6 rounded-2xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100/80 transition-all duration-300">
        
        {/* REGISTER STATE BACK LINK */}
        {state === "register" && (
          <button
            type="button"
            onClick={() => setState("login")}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-4" />
            Đăng nhập
          </button>
        )}

        {/* LOGO AND HEADER FOR LOGIN */}
        {state !== "register" ? (
          <div className="flex flex-col items-center text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-600 shadow-md shadow-blue-500/20 mb-4 transition-transform duration-300 hover:scale-105">
              <GraduationCap className="size-8 text-white" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-800 uppercase">
              Quản lý đồ án tốt nghiệp
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Cổng thông tin dành cho Sinh viên & Giảng viên
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-xl font-bold tracking-tight text-slate-800 uppercase">
              Tạo tài khoản mới
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Hệ thống Quản lý Đồ án Tốt nghiệp
            </p>
          </div>
        )}

        {/* FAILED LOGIN WARNING BOX */}
        {state === "login_failed" && (
          <div className="relative flex gap-3 rounded-xl border border-red-200 bg-red-50/70 p-4">
            <AlertCircle className="size-5 shrink-0 text-red-500 mt-0.5" />
            <div className="flex-1 text-left">
              <h3 className="text-sm font-semibold text-red-800">Đăng nhập thất bại</h3>
              <p className="mt-1 text-xs text-red-700 leading-normal">
                Tài khoản này chưa tồn tại trên hệ thống. Vui lòng kiểm tra lại hoặc đăng ký tài khoản mới.
              </p>
              <button
                type="button"
                onClick={() => setState("register")}
                className="mt-2 text-xs font-bold text-red-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                Đăng ký tài khoản ngay →
              </button>
            </div>
            <button
              type="button"
              onClick={() => setState("login")}
              className="absolute top-3 right-3 text-red-400 hover:text-red-600 transition-colors cursor-pointer"
              aria-label="Đóng thông báo"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* FORMS */}
        {state !== "register" ? (
          /* LOGIN FORM */
          <form className="mt-6 space-y-5" onSubmit={handleLogin}>
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-bold tracking-wider text-slate-600 uppercase">
                Tên đăng nhập / Email trường
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="size-4.5" />
                </span>
                <input
                  id="email"
                  name="email"
                  type="text"
                  required
                  placeholder="ma_sinh_vien@school.edu.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-xs font-bold tracking-wider text-slate-600 uppercase">
                  Mật khẩu
                </label>
                <a href="#forgot" className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline">
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="size-4.5" />
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="........"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 py-3 pl-11 pr-11 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="size-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2.5 text-sm font-medium text-slate-600 cursor-pointer select-none">
                Duy trì đăng nhập trên thiết bị này
              </label>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/10 hover:bg-blue-700 transition-all hover:shadow-blue-500/20 active:scale-[0.98] cursor-pointer"
            >
              Đăng nhập hệ thống
            </button>

            <div className="text-center text-sm">
              <span className="text-slate-500">Chưa có tài khoản? </span>
              <button
                type="button"
                onClick={() => setState("register")}
                className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                Đăng ký ngay
              </button>
            </div>

            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <span className="relative bg-white px-4 text-xs font-bold tracking-wider text-slate-400 uppercase">
                Hoặc kết nối qua
              </span>
            </div>

            <button
              type="button"
              onClick={handleSSOLogin}
              className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-emerald-200/80 bg-emerald-50/30 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-colors active:scale-[0.98] cursor-pointer"
            >
              <ShieldCheck className="size-5 text-emerald-600" />
              Đăng nhập qua cổng SSO trường
            </button>

            <p className="text-center text-xs text-slate-400 mt-6">
              Hỗ trợ kỹ thuật: <a href="mailto:it-support@school.edu.vn" className="hover:underline">it-support@school.edu.vn</a>
            </p>
          </form>
        ) : (
          /* REGISTRATION FORM */
          <form className="mt-6 space-y-4" onSubmit={handleRegister}>
            {/* SEGMENTED TAB SELECTOR */}
            <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 mb-4">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-all cursor-pointer ${
                  role === "student"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <GraduationCap className="size-4" />
                Sinh viên
              </button>
              <button
                type="button"
                onClick={() => setRole("lecturer")}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-all cursor-pointer ${
                  role === "lecturer"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <UserSquare2 className="size-4" />
                Giảng viên
              </button>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="fullname" className="block text-xs font-bold tracking-wider text-slate-600 uppercase">
                Họ và tên
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Type className="size-4.5" />
                </span>
                <input
                  id="fullname"
                  name="fullname"
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="code" className="block text-xs font-bold tracking-wider text-slate-600 uppercase">
                {role === "student" ? "Mã số sinh viên" : "Mã số giảng viên"}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <UserSquare2 className="size-4.5" />
                </span>
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  placeholder={role === "student" ? "Ví dụ: 24100498" : "Ví dụ: GV012345"}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-email" className="block text-xs font-bold tracking-wider text-slate-600 uppercase">
                Email nhà trường cấp
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="size-4.5" />
                </span>
                <input
                  id="reg-email"
                  name="reg-email"
                  type="email"
                  required
                  placeholder="username@school.edu.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="reg-password" className="block text-xs font-bold tracking-wider text-slate-600 uppercase">
                  Mật khẩu
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock className="size-4.5" />
                  </span>
                  <input
                    id="reg-password"
                    name="reg-password"
                    type="password"
                    required
                    placeholder="........"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="confirm-password" className="block text-xs font-bold tracking-wider text-slate-600 uppercase">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock className="size-4.5" />
                  </span>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    required
                    placeholder="........"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start mt-2">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="size-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-0.5 cursor-pointer"
              />
              <label htmlFor="terms" className="ml-2.5 text-xs text-slate-500 leading-relaxed cursor-pointer select-none">
                Tôi cam kết các thông tin khai báo trên là chính xác và hoàn toàn chịu trách nhiệm trước quy chế đào tạo của Nhà trường.
              </label>
            </div>

            <button
              type="submit"
              disabled={!termsAccepted}
              className={`w-full rounded-xl py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/10 transition-all active:scale-[0.98] mt-2 ${
                termsAccepted
                  ? "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/20 cursor-pointer"
                  : "bg-slate-300 cursor-not-allowed shadow-none"
              }`}
            >
              Hoàn tất đăng ký
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
