import { useGoogleLogin } from '@react-oauth/google'
import { useState } from 'react'
import { authService } from '../services/authService'
import logoUrl from '../assets/images/logo.png'

export function LoginPage({ onLoginSuccess, onLoginError }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [legalModal, setLegalModal] = useState(null)
  const [hoveredChar, setHoveredChar] = useState(null)

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    // Calculate normalized relative position from -1 to 1 relative to center
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2
    setMousePos({ x, y })
  }

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 })
  }

  const handleGoogleSuccess = async (response) => {
    console.log('GOOGLE SUCCESS:', response)
    try {
      const accessToken = response?.access_token
      if (!accessToken) {
        throw new Error('Access token tidak diterima dari Google')
      }
      const backendResponse = await authService.googleLogin(accessToken)
      if (onLoginSuccess) {
        onLoginSuccess(backendResponse)
      }
    } catch (err) {
      console.error('GOOGLE LOGIN FLOW ERROR:', err)
      if (onLoginError) {
        onLoginError(err)
      }
    }
  }

  const login = useGoogleLogin({
    flow: 'implicit',
    onSuccess: handleGoogleSuccess,
    onError: (error) => {
      console.error('GOOGLE OAUTH ERROR:', error)
      if (onLoginError) {
        onLoginError(error)
      }
    },
  })

  const handleDemoLogin = () => {
    localStorage.setItem('demo_mode', 'true')
    localStorage.setItem('auth_token', 'mock-demo-jwt-token')
    localStorage.setItem('user', JSON.stringify({
      name: 'Mulyono Jokowi',
      email: 'mulyonojokowi90@gmail.com',
      profile_picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'
    }))
    if (onLoginSuccess) {
      onLoginSuccess()
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1000px] overflow-hidden rounded-[32px] bg-white border border-slate-100/80 shadow-[0_20px_60px_-10px_rgba(8,37,80,0.18)] transition duration-500 lg:grid lg:grid-cols-[1.18fr_1fr]">
      {/* Left Animated Character Panel */}
      <div
        className="relative hidden flex-col items-center justify-center bg-white p-10 select-none lg:flex min-h-[580px] overflow-hidden border-r border-slate-100"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Top-left Company Logo */}
        <div className="absolute top-[-76px] left-[16px] z-0">
          {logoUrl ? (
            <img src={logoUrl} alt="InternLog Logo" className="w-[320px] h-auto object-contain" />
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-black">
              <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
            </svg>
          )}
        </div>

        <div className="relative w-[270px] h-[320px] mt-10 z-10">

          {/* 1. Tall Navy Blue Rectangle Character */}
          <div
            onMouseEnter={() => setHoveredChar('navy')}
            onMouseLeave={() => setHoveredChar(null)}
            className="absolute left-[35px] bottom-0 w-[100px] h-[230px] bg-[#4285F4] rounded-t-[20px] transition-all duration-500 ease-out hover:scale-y-[1.04] hover:-translate-y-2 origin-bottom flex flex-col items-center pt-8 cursor-pointer"
          >
            {/* Chat Bubble Tooltip (MacBook Window Style) */}
            {hoveredChar === 'navy' && (
              <div className="absolute bottom-[240px] left-1/2 -translate-x-1/2 w-[190px] bg-white text-slate-800 rounded-2xl shadow-xl shadow-slate-900/10 z-30 overflow-hidden modal-pop border border-slate-200/60">
                {/* macOS Traffic Lights Header */}
                <div className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 border-b border-slate-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ff5f56]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ffbd2e]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#27c93f]" />
                </div>
                {/* macOS Body */}
                <div className="p-3.5 text-[11px] leading-normal select-none pointer-events-none">
                  <div className="font-bold text-blue-600 mb-2 text-center text-[12px]">Monitoring Progres</div>
                  <div className="flex flex-col gap-2 py-1">
                    {/* Live micro-bar chart */}
                    <div className="flex items-end justify-center gap-2 h-8 mb-1 border-b border-slate-100 pb-1">
                      <div className="w-2.5 bg-blue-400 rounded-t animate-[bar-grow_1.6s_ease-in-out_infinite_0s] origin-bottom" style={{ height: '70%' }} />
                      <div className="w-2.5 bg-indigo-500 rounded-t animate-[bar-grow_1.6s_ease-in-out_infinite_0.3s] origin-bottom" style={{ height: '95%' }} />
                      <div className="w-2.5 bg-indigo-600 rounded-t animate-[bar-grow_1.6s_ease-in-out_infinite_0.6s] origin-bottom" style={{ height: '60%' }} />
                      <div className="w-2.5 bg-blue-500 rounded-t animate-[bar-grow_1.6s_ease-in-out_infinite_0.9s] origin-bottom" style={{ height: '80%' }} />
                    </div>
                    {/* Progress Slider */}
                    <div className="flex w-full items-center justify-between text-[9px] text-slate-400 font-mono">
                      <span>Progres Magang</span>
                      <span className="font-bold text-blue-600 animate-pulse">78%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-[progress-fill_3.5s_ease-in-out_infinite] origin-left" style={{ width: '78%' }} />
                    </div>
                    <span className="text-[8px] text-slate-400 text-center select-none">12 dari 15 minggu aktif</span>
                  </div>
                </div>
                {/* Pointer */}
                <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r border-b border-slate-200/60" />
              </div>
            )}

            {/* Eyes */}
            <div className="flex gap-4">
              <div className="relative w-4 h-4 bg-white rounded-full flex items-center justify-center">
                <div
                  className="w-1.5 h-1.5 bg-black rounded-full transition-transform duration-100 ease-out"
                  style={{ transform: `translate(${mousePos.x * 3.5}px, ${mousePos.y * 3.5}px)` }}
                />
              </div>
              <div className="relative w-4 h-4 bg-white rounded-full flex items-center justify-center">
                <div
                  className="w-1.5 h-1.5 bg-black rounded-full transition-transform duration-100 ease-out"
                  style={{ transform: `translate(${mousePos.x * 3.5}px, ${mousePos.y * 3.5}px)` }}
                />
              </div>
            </div>
            {/* Animated singing/whistling mouth */}
            <div className={`w-3.5 bg-black rounded-full mt-3 transition-all duration-300 ${hoveredChar === 'navy' ? 'h-4 animate-[sing-mouth_1.2s_infinite]' : 'h-1.5'}`} />
          </div>

          {/* 2. Black Medium Rectangle Character */}
          <div
            onMouseEnter={() => setHoveredChar('black')}
            onMouseLeave={() => setHoveredChar(null)}
            className="absolute left-[125px] bottom-0 w-[70px] h-[170px] bg-[#ea4335] rounded-t-[14px] transition-all duration-500 ease-out hover:scale-y-[1.05] hover:-translate-y-1.5 origin-bottom flex flex-col items-end pr-3 pt-12 cursor-pointer"
          >
            {/* Chat Bubble Tooltip (MacBook Window Style) */}
            {hoveredChar === 'black' && (
              <div className="absolute bottom-[180px] left-1/2 -translate-x-1/2 w-[180px] bg-white text-slate-800 rounded-2xl shadow-xl shadow-slate-900/10 z-30 overflow-hidden modal-pop border border-slate-200/60">
                {/* macOS Traffic Lights Header */}
                <div className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 border-b border-slate-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ff5f56]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ffbd2e]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#27c93f]" />
                </div>
                {/* macOS Body */}
                <div className="p-3.5 text-[11px] leading-normal select-none pointer-events-none">
                  <div className="font-bold text-red-500 mb-2 text-center text-[12px]">Autentikasi Aman</div>
                  <div className="flex flex-col items-center justify-center py-1">
                    <div className="relative w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center overflow-hidden border border-emerald-500/30 shadow-inner">
                      {/* Spinning dashed circle */}
                      <div className="absolute inset-1 rounded-full border border-dashed border-emerald-500/40 animate-[spin_10s_linear_infinite]" />
                      {/* Key lock */}
                      <svg viewBox="0 0 24 24" fill="none" stroke="#ea4335" strokeWidth="2.5" className="w-5.5 h-5.5 z-10 animate-[lock-wiggle_2s_infinite]">
                        <rect x="5" y="11" width="14" height="10" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      {/* Red scanning laser line */}
                      <div className="absolute left-0 right-0 h-0.5 bg-red-400 shadow-[0_0_8px_rgba(234,67,53,0.8)] animate-[laser-scan_1.8s_infinite_ease-in-out]" />
                    </div>
                    <span className="text-[8px] text-red-600 font-semibold mt-2 select-none tracking-wider animate-pulse">JWT OAUTH VERIFIED</span>
                  </div>
                </div>
                {/* Pointer */}
                <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r border-b border-slate-200/60" />
              </div>
            )}

            {/* Eyes & Mouth container */}
            <div className="flex flex-col items-center gap-1.5 mr-1.5">
              {/* Eyes looking right */}
              <div className="flex gap-1.5">
                <div className="relative w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center">
                  <div
                    className="w-1.5 h-1.5 bg-black rounded-full transition-transform duration-100 ease-out"
                    style={{ transform: `translate(${mousePos.x * 2.5 + 1.5}px, ${mousePos.y * 2.5}px)` }}
                  />
                </div>
                <div className="relative w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center">
                  <div
                    className="w-1.5 h-1.5 bg-black rounded-full transition-transform duration-100 ease-out"
                    style={{ transform: `translate(${mousePos.x * 2.5 + 1.5}px, ${mousePos.y * 2.5}px)` }}
                  />
                </div>
              </div>
              {/* Animated Shock Mouth */}
              <div className={`bg-black rounded-full transition-all duration-300 ${hoveredChar === 'black' ? 'w-2.5 h-2.5 bg-red-400 border border-black/20 animate-[shock-mouth_1s_infinite]' : 'w-2.5 h-0.5 bg-black'}`} />
            </div>
          </div>

          {/* 3. Orange Semi-Circle Character (In front) */}
          <div
            onMouseEnter={() => setHoveredChar('orange')}
            onMouseLeave={() => setHoveredChar(null)}
            className="absolute left-0 bottom-0 w-[200px] h-[100px] bg-[#34A853] rounded-t-full transition-all duration-500 ease-out hover:scale-y-[1.08] origin-bottom z-10 flex flex-col items-center pt-7 cursor-pointer"
          >
            {/* Chat Bubble Tooltip (MacBook Window Style) */}
            {hoveredChar === 'orange' && (
              <div className="absolute bottom-[110px] left-1/2 -translate-x-1/2 w-[190px] bg-white text-slate-800 rounded-2xl shadow-xl shadow-slate-900/10 z-30 overflow-hidden modal-pop border border-slate-200/60">
                {/* macOS Traffic Lights Header */}
                <div className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 border-b border-slate-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ff5f56]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ffbd2e]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#27c93f]" />
                </div>
                {/* macOS Body */}
                <div className="p-3.5 text-[11px] leading-normal select-none pointer-events-none">
                  <div className="font-bold text-green-600 mb-2 text-center text-[12px]">Catatan Logbook</div>
                  <div className="flex flex-col gap-2 py-1 px-1">
                    {/* Log card 1 */}
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-100/80 rounded-lg p-1.5 shadow-sm transform transition duration-300">
                      <div className="w-3.5 h-3.5 rounded-full border border-emerald-400 bg-emerald-50 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#34A853" strokeWidth="4" className="w-2.5 h-2.5 animate-[checkbox-check_3s_infinite_0s]">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="h-1.5 bg-slate-200 rounded w-[80%] animate-pulse" />
                        <div className="h-1 bg-slate-100 rounded w-[45%]" />
                      </div>
                    </div>
                    {/* Log card 2 */}
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-100/80 rounded-lg p-1.5 shadow-sm transform transition duration-300">
                      <div className="w-3.5 h-3.5 rounded-full border border-emerald-400 bg-emerald-50 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#34A853" strokeWidth="4" className="w-2.5 h-2.5 animate-[checkbox-check_3s_infinite_0.8s]">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="h-1.5 bg-slate-200 rounded w-[60%] animate-pulse" />
                        <div className="h-1 bg-slate-100 rounded w-[35%]" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Pointer */}
                <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r border-b border-slate-200/60" />
              </div>
            )}

            {/* Eyes */}
            <div className="flex gap-8">
              <div className="relative w-4 h-4 bg-white rounded-full flex items-center justify-center">
                <div
                  className="w-1.5 h-1.5 bg-black rounded-full transition-transform duration-100 ease-out"
                  style={{ transform: `translate(${mousePos.x * 4}px, ${mousePos.y * 4}px)` }}
                />
              </div>
              <div className="relative w-4 h-4 bg-white rounded-full flex items-center justify-center">
                <div
                  className="w-1.5 h-1.5 bg-black rounded-full transition-transform duration-100 ease-out"
                  style={{ transform: `translate(${mousePos.x * 4}px, ${mousePos.y * 4}px)` }}
                />
              </div>
            </div>
            {/* Smile/Talking Mouth */}
            <div className="mt-2.5 h-4 flex items-center justify-center overflow-visible">
              <svg className={`w-5 h-2.5 text-black fill-current transition-all duration-300 origin-top ${hoveredChar === 'orange' ? 'animate-[smile-talk_1s_infinite]' : ''}`} viewBox="0 0 24 12">
                <path d="M0,0 Q12,12 24,0 Z" />
              </svg>
            </div>
          </div>

          {/* 4. Yellow Pill Character */}
          <div
            onMouseEnter={() => setHoveredChar('yellow')}
            onMouseLeave={() => setHoveredChar(null)}
            className="absolute left-[185px] bottom-0 w-[85px] h-[130px] bg-[#FBBC05] rounded-t-full transition-all duration-500 ease-out hover:scale-[1.04] hover:rotate-3 origin-bottom flex flex-col items-center pt-8 cursor-pointer"
          >
            {/* Chat Bubble Tooltip (MacBook Window Style) */}
            {hoveredChar === 'yellow' && (
              <div className="absolute bottom-[140px] left-[40%] -translate-x-1/2 w-[190px] bg-white text-slate-800 rounded-2xl shadow-xl shadow-slate-900/10 z-30 overflow-hidden modal-pop border border-slate-200/60">
                {/* macOS Traffic Lights Header */}
                <div className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 border-b border-slate-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ff5f56]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ffbd2e]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#27c93f]" />
                </div>
                {/* macOS Body */}
                <div className="p-3.5 text-[11px] leading-normal select-none pointer-events-none">
                  <div className="font-bold text-yellow-600 mb-2.5 text-center text-[12px]">Feedback Mentor</div>
                  <div className="flex flex-col gap-2 py-1 px-1">
                    {/* Mentor Speech bubble left */}
                    <div className="flex items-start gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-yellow-100 border border-yellow-200 flex items-center justify-center font-bold text-[9px] text-yellow-700 select-none animate-bounce">
                        M
                      </div>
                      <div className="bg-yellow-50/80 border border-yellow-100/80 text-slate-700 rounded-2xl rounded-tl-none px-2 py-1.5 text-[9px] max-w-[110px] shadow-sm select-none">
                        Laporan logbook bagus! <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 inline-block text-yellow-500"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3v11z"/></svg>
                      </div>
                    </div>
                    {/* Student response speech bubble right with typing dots */}
                    <div className="flex flex-col gap-1 items-end">
                      {/* Typing indicator */}
                      <div className="flex gap-0.5 bg-slate-50 border border-slate-100 rounded-full px-2 py-1 shadow-sm select-none animate-[typing-fade_3.5s_infinite]">
                        <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                        <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                        <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                      </div>
                      {/* Response bubble */}
                      <div className="bg-blue-50 border border-blue-100/80 text-slate-700 rounded-2xl rounded-tr-none px-2 py-1.5 text-[9px] max-w-[110px] shadow-sm select-none animate-[slide-fade-heavy_3.5s_infinite]">
                        Terima kasih, Pak!
                      </div>
                    </div>
                  </div>
                </div>
                {/* Pointer */}
                <div className="absolute bottom-[-6px] left-[65%] -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r border-b border-slate-200/60" />
              </div>
            )}

            {/* Eye */}
            <div className="relative w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center mr-6">
              <div
                className="w-1.5 h-1.5 bg-black rounded-full transition-transform duration-100 ease-out"
                style={{ transform: `translate(${mousePos.x * 3 - 0.5}px, ${mousePos.y * 3}px)` }}
              />
            </div>
            {/* Upper and Lower Beak (Chirps on hover) */}
            <div className={`absolute right-[-10px] top-[45px] w-9 h-1.5 bg-black rounded-full origin-left transition-all duration-300 ${hoveredChar === 'yellow' ? 'animate-[beak-upper_0.8s_infinite]' : ''}`} />
            <div className={`absolute right-[-10px] top-[49px] w-9 h-1.5 bg-black rounded-full origin-left transition-all duration-300 ${hoveredChar === 'yellow' ? 'animate-[beak-lower_0.8s_infinite]' : ''}`} />
          </div>

        </div>

        {/* Left Side Copyright Footer */}
        <div className="absolute bottom-6 left-10 right-10 flex items-center justify-between text-[10px] text-slate-400 select-none">
          <span>© 2026 InternLog. All rights reserved.</span>
          <span className="font-mono text-[9px] opacity-60">v1.0.0</span>
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="relative flex flex-col justify-center bg-white px-8 pt-6 pb-18 md:px-14">
        {/* Company/Star Logo */}
        <div className="flex justify-center mb-1 -mt-16 md:-mt-20 lg:hidden">
          {logoUrl ? (
            <img src={logoUrl} alt="InternLog Logo" className="h-80 w-80 object-contain" />
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-56 w-56 text-black">
              <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
            </svg>
          )}
        </div>

        <div className="text-center lg:mt-2">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-800 md:text-[32px] leading-tight">
            Welcome back!
          </h2>
          <p className="mt-2 text-xs md:text-sm text-slate-400 leading-relaxed max-w-[280px] mx-auto">
            Silakan masuk dengan akun Google Anda.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => login()}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200/80 bg-white px-5 py-3.5 font-medium text-slate-700 shadow-sm transition-all duration-300 hover:bg-slate-50 hover:border-slate-300/80 hover:shadow active:scale-[0.98] cursor-pointer"
          >
            <svg className="h-5.5 w-5.5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-[14px]">Log in with Google</span>
          </button>

          <button
            onClick={handleDemoLogin}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-dashed border-violet-200 bg-violet-50/45 px-5 py-3.5 font-medium text-violet-700 shadow-sm transition-all duration-300 hover:bg-violet-50 hover:border-violet-300 hover:shadow active:scale-[0.98] cursor-pointer text-xs"
          >
            <svg className="h-4 w-4 text-violet-600 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span>Bypass / Masuk dengan Mode Demo (Lokal)</span>
          </button>
        </div>

        <div className="mt-4 text-center text-[10px] text-slate-400 leading-relaxed max-w-[270px] mx-auto select-none">
          Dengan melanjutkan, Anda menyetujui{' '}
          <button
            onClick={() => setLegalModal('terms')}
            className="bg-transparent p-0 text-slate-400 hover:text-slate-700 underline font-normal transition cursor-pointer"
          >
            Ketentuan Layanan
          </button>{' '}
          dan{' '}
          <button
            onClick={() => setLegalModal('privacy')}
            className="bg-transparent p-0 text-slate-400 hover:text-slate-700 underline font-normal transition cursor-pointer"
          >
            Kebijakan Privasi
          </button>{' '}
          InternLog.
        </div>

        {/* Right Side Modern Footer */}
        <div className="absolute bottom-6 left-8 right-8 md:left-14 md:right-14 flex items-center justify-center text-[10px] text-slate-400 select-none">
          <div className="flex items-center gap-2.5">
            <a
              href="mailto:mulyonojokowi90@gmail.com"
              className="hover:text-slate-700 underline font-normal transition"
            >
              Hubungi Kami
            </a>
            <span className="opacity-30">•</span>
            <button
              onClick={() => setLegalModal('terms')}
              className="bg-transparent p-0 text-slate-400 hover:text-slate-700 underline font-normal transition cursor-pointer"
            >
              Ketentuan
            </button>
            <span className="opacity-30">•</span>
            <button
              onClick={() => setLegalModal('privacy')}
              className="bg-transparent p-0 text-slate-400 hover:text-slate-700 underline font-normal transition cursor-pointer"
            >
              Privasi
            </button>
          </div>
        </div>
      </div>

      {legalModal && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-900/45 p-4 modal-fade"
          onClick={() => setLegalModal(null)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl modal-pop max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-4 top-3 text-slate-400 hover:text-slate-700 text-2xl transition cursor-pointer"
              onClick={() => setLegalModal(null)}
            >
              ×
            </button>

            {legalModal === 'terms' && (
              <div>
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-1">
                  Ketentuan Layanan
                </h3>
                <p className="text-[10px] text-slate-400 mb-4">Terakhir diperbarui: 25 Mei 2026</p>
                <div className="space-y-4 text-xs text-slate-600 leading-relaxed pr-1">
                  <p>
                    Selamat datang di <strong>InternLog</strong>. Dengan menggunakan platform kami, Anda menyetujui ketentuan berikut:
                  </p>
                  <div>
                    <h4 className="font-semibold text-slate-700">1. Penggunaan Layanan</h4>
                    <p>Platform InternLog disediakan khusus untuk mencatat logbook harian magang, monitoring progres, absensi, serta umpan balik dari mentor.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-700">2. Integritas Data</h4>
                    <p>Anda bertanggung jawab penuh atas keaslian laporan kegiatan harian yang diisi pada logbook magang Anda.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-700">3. Keamanan Akun</h4>
                    <p>Autentikasi diintegrasikan langsung dengan akun Google Anda. Jaga kerahasiaan dan keamanan hak akses akun Google Anda.</p>
                  </div>
                </div>
              </div>
            )}

            {legalModal === 'privacy' && (
              <div>
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-1">
                  Kebijakan Privasi
                </h3>
                <p className="text-[10px] text-slate-400 mb-4">Terakhir diperbarui: 25 Mei 2026</p>
                <div className="space-y-4 text-xs text-slate-600 leading-relaxed pr-1">
                  <p>
                    Kami menghormati keamanan privasi Anda. Berikut adalah data yang diproses pada sistem <strong>InternLog</strong>:
                  </p>
                  <div>
                    <h4 className="font-semibold text-slate-700">1. Pengambilan Informasi</h4>
                    <p>Melalui proses Google Sign-In, kami hanya mengambil informasi dasar berupa nama lengkap, email, dan URL foto profil Anda.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-700">2. Pemanfaatan Data</h4>
                    <p>Data profil Anda hanya digunakan untuk verifikasi login, penyusunan identitas magang, dan visualisasi absensi/monitoring.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-700">3. Perlindungan Keamanan</h4>
                    <p>Semua informasi disimpan dengan enkripsi aman di server kami dan tidak akan pernah diperjualbelikan kepada pihak luar mana pun.</p>
                  </div>
                </div>
              </div>
            )}

            {legalModal === 'faq' && (
              <div>
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-1">
                  Tanya Jawab (FAQ)
                </h3>
                <p className="text-[10px] text-slate-400 mb-4">Pertanyaan Umum Pengguna</p>
                <div className="space-y-4 text-xs text-slate-600 leading-relaxed pr-1">
                  <div>
                    <h4 className="font-semibold text-slate-700">Bagaimana cara login?</h4>
                    <p>Gunakan Google Login dengan akun Google yang didaftarkan secara resmi untuk institusi Anda.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-700">Bagaimana jika akun tidak dikenali?</h4>
                    <p>Pastikan email Anda sudah terdaftar di sistem. Hubungi koordinator admin atau mentor magang Anda untuk verifikasi data.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-700">Apakah progres otomatis tersimpan?</h4>
                    <p>Ya. Semua logbook harian, umpan balik dari mentor, dan monitoring progres Anda disimpan secara aman di cloud database secara waktu-nyata.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow transition cursor-pointer"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
