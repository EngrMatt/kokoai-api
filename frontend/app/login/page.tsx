'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, EyeOff, Mail, Check, X, AlertCircle } from 'lucide-react'
import { authApi } from '@/lib/api/auth'

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Validation states
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid' | 'taken'>('idle')
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'valid' | 'invalid'>('idle')
  const [nameStatus, setNameStatus] = useState<'idle' | 'valid' | 'invalid'>('idle')
  const [confirmStatus, setConfirmStatus] = useState<'idle' | 'valid' | 'invalid'>('idle')

  const isFormValid = isLogin
    ? (email && password)
    : (nameStatus === 'valid' && emailStatus === 'valid' && passwordStatus === 'valid' && confirmStatus === 'valid')

  const checkEmailAvailability = async (emailToTrack: string) => {
    if (!emailToTrack || !emailToTrack.includes('@')) {
      setEmailStatus('invalid')
      return
    }

    setEmailStatus('checking')
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8077'
      const res = await fetch(`${API_URL}/auth/check-email?email=${encodeURIComponent(emailToTrack)}`)
      const data = await res.json()
      if (data.available) {
        setEmailStatus('valid')
      } else {
        setEmailStatus('taken')
      }
    } catch (err) {
      setEmailStatus('idle')
    }
  }

  const validatePassword = (val: string) => {
    if (val.length >= 8) {
      setPasswordStatus('valid')
    } else {
      setPasswordStatus('invalid')
    }
    // 連動檢查確認密碼
    if (confirmPassword.length > 0) {
      if (val === confirmPassword) {
        setConfirmStatus('valid')
      } else {
        setConfirmStatus('invalid')
      }
    }
  }

  const validateConfirmPassword = (val: string, currentPassword = password) => {
    if (val === currentPassword && val.length > 0) {
      setConfirmStatus('valid')
    } else {
      setConfirmStatus('invalid')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLogin && !isFormValid) return
    setIsLoading(true)

    try {
      const payload = isLogin
        ? { email, password }
        : { email, password, full_name: name }

      const data = isLogin
        ? await authApi.login(payload)
        : await authApi.register(payload)

      if (isLogin) {
        localStorage.setItem('token', data.access_token)
        router.push('/')
      } else {
        setIsLogin(true)
        alert('註冊成功，請登入')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    router.push('/')
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setEmailStatus('idle')
    setPasswordStatus('idle')
    setNameStatus('idle')
    setConfirmStatus('idle')
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary via-primary/90 to-accent overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-40 right-10 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-accent/30 blur-2xl" />
        </div>

        {/* Content - Static after initial load */}
        <div className="relative z-10 flex flex-col justify-center h-full px-12 xl:px-20">
          <div className="space-y-6">
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight drop-shadow-sm">
              智慧理財 簡單生活
            </h1>
            <p className="text-lg xl:text-xl text-white/80 max-w-md leading-relaxed">
              讓 KoKo.AI 成為您的智慧理財夥伴，輕鬆掌握每一筆收支，實現財務自由的第一步。
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {[
              '輕鬆記錄每日收支',
              '智慧分析消費習慣',
              '設定目標達成理財夢想'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-6 left-12 xl:left-20 text-white/50 text-sm">
          © 2026 KoKo.AI. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-background relative overflow-y-auto overflow-x-hidden">
        {/* Subtle background glow for registration */}
        {!isLogin && (
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] rounded-full animate-in fade-in duration-1000 pointer-events-none" />
        )}

        <div className="flex-1 flex items-center justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-8 relative z-10 min-h-full">
          {/* Key on this div ensures animations re-run when toggling mode */}
          <div key={isLogin ? 'login' : 'register'} className="w-full max-w-md animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-500 ease-out">
            <div className={`mb-6 flex flex-col items-center transition-transform duration-500 ${!isLogin ? 'scale-90 origin-top' : ''}`}>
              <div className="mb-4 transform transition-transform duration-500 hover:scale-105">
                <Image
                  src="/images/kokoai_icon.png"
                  alt="Ko.AI"
                  width={100}
                  height={100}
                  className="w-40 h-auto"
                  priority
                />
              </div>
              <h2 className="text-2xl font-bold text-foreground text-center tracking-tight">
                {isLogin ? '歡迎回來' : '立即加入'}
              </h2>
              <p className="mt-2 text-muted-foreground text-sm text-center max-w-[320px] leading-relaxed">
                {isLogin
                  ? '請輸入帳號密碼以管理您的財務'
                  : '建立您的智慧理財帳戶，開啟財務自由之旅'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Name field */}
              {!isLogin && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-300">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-medium text-foreground">姓名</label>
                    {nameStatus === 'valid' && <Check className="w-3.5 h-3.5 text-green-500" />}
                    {nameStatus === 'invalid' && <span className="text-[10px] text-red-500">請輸入姓名</span>}
                  </div>
                  <Input
                    type="text"
                    placeholder="您的稱呼"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      if (e.target.value.length >= 1) setNameStatus('valid')
                      else setNameStatus('invalid')
                    }}
                    onBlur={() => { if (name.length < 1) setNameStatus('invalid') }}
                    className="h-11 bg-card/50 border-border focus:ring-primary/20 transition-all"
                    required
                  />
                </div>
              )}

              {/* Email */}
              <div className="space-y-1">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-medium text-foreground">電子郵件</label>
                  {!isLogin && (
                    <>
                      {emailStatus === 'valid' && <Check className="w-3.5 h-3.5 text-green-500" />}
                      {emailStatus === 'taken' && <span className="text-[10px] text-red-500">此信箱已在使用</span>}
                      {emailStatus === 'invalid' && <span className="text-[10px] text-red-500">格式不正確</span>}
                      {emailStatus === 'checking' && <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
                    </>
                  )}
                </div>
                <Input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    // 當使用者在輸入時，先重設狀態，避免紅字卡住
                    if (emailStatus !== 'idle') setEmailStatus('idle')
                  }}
                  onBlur={() => {
                    if (!isLogin && email) {
                      checkEmailAvailability(email)
                    }
                  }}
                  className="h-11 bg-card/50 border-border focus:ring-primary/20 transition-all"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-medium text-foreground">密碼</label>
                  {!isLogin && (
                    <>
                      {passwordStatus === 'valid' && <Check className="w-3.5 h-3.5 text-green-500" />}
                      {passwordStatus === 'invalid' && <span className="text-[10px] text-red-500">至少 8 位數</span>}
                    </>
                  )}
                  {isLogin && (
                    <Link href="#" className="text-[11px] text-primary hover:underline">忘記密碼？</Link>
                  )}
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="請輸入密碼"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (!isLogin) validatePassword(e.target.value)
                    }}
                    onBlur={() => !isLogin && validatePassword(password)}
                    className="h-11 bg-card/50 border-border pr-10 focus:ring-primary/20 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              {!isLogin && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-400">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-medium text-foreground">確認密碼</label>
                    {confirmStatus === 'valid' && <Check className="w-3.5 h-3.5 text-green-500" />}
                    {confirmStatus === 'invalid' && <span className="text-[10px] text-red-500">密碼不一致</span>}
                  </div>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="請再次輸入密碼"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      validateConfirmPassword(e.target.value)
                    }}
                    onBlur={() => validateConfirmPassword(confirmPassword)}
                    className="h-11 bg-card/50 border-border focus:ring-primary/20 transition-all"
                    required
                  />
                </div>
              )}

              {/* Remember me (login only) */}
              {isLogin && (
                <div className="flex items-center gap-2 ml-1 py-1">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer select-none">
                    記住我
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 text-sm font-semibold mt-2 shadow-lg shadow-primary/20 transition-all duration-300"
                disabled={isLoading || (!isLogin && !isFormValid)}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    處理中...
                  </span>
                ) : (
                  isLogin ? '立即登入' : '免費註冊'
                )}
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="px-4 bg-background text-muted-foreground tracking-widest">或透過以下方式</span>
                </div>
              </div>

              {/* Google Login */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 text-sm font-medium gap-3 border-border hover:bg-secondary/50 transition-all"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google {isLogin ? '登入' : '註冊'}
              </Button>
            </form>

            {/* Toggle Login/Register */}
            <p className="mt-8 text-center text-sm text-muted-foreground">
              {isLogin ? '還沒有帳號嗎？' : '已經有帳號了？'}
              <button
                type="button"
                onClick={toggleMode}
                className="ml-2 text-primary font-bold hover:underline transition-all"
              >
                {isLogin ? '立即註冊' : '返回登入'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
