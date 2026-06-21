import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import logoUrl from '../assets/images/logo.png'

// ── Animated counter ────────────────────────────────────────────────────────

function AnimatedNumber({ target, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          let start = 0
          const duration = 1400
          const step = Math.ceil(target / (duration / 16))
          const timer = setInterval(() => {
            start = Math.min(start + step, target)
            setCount(start)
            if (start >= target) clearInterval(timer)
          }, 16)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return (
    <span ref={ref}>
      {count.toLocaleString('id-ID')}
      {suffix}
    </span>
  )
}

// ── Feature card ─────────────────────────────────────────────────────────────

function FeatureCard({ icon, title, description, gradient, delay }) {
  return (
    <div
      className="group relative flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-slate-200"
      style={{ animationDelay: delay }}
    >
      {/* Subtle gradient orb behind icon */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: gradient, filter: 'blur(40px)', zIndex: 0 }}
      />
      <div
        className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-sm"
        style={{ background: gradient }}
      >
        {icon}
      </div>
      <div className="relative z-10">
        <h3 className="text-base font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

// ── Step row ─────────────────────────────────────────────────────────────────

function StepItem({ number, title, description, isLast }) {
  return (
    <div className="flex gap-5">
      <div className="flex flex-col items-center">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold shadow-md shadow-blue-200">
          {number}
        </div>
        {!isLast && <div className="mt-2 w-px flex-1 bg-gradient-to-b from-blue-200 to-transparent" />}
      </div>
      <div className={`${!isLast ? 'pb-10' : ''}`}>
        <h4 className="text-base font-bold text-slate-800 mb-1">{title}</h4>
        <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

// ── Testimonial card ──────────────────────────────────────────────────────────

function TestimonialCard({ quote, name, role, initial, color }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Stars */}
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <svg key={i} viewBox="0 0 24 24" fill="#f59e0b" className="h-4 w-4">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <p className="text-sm text-slate-600 leading-relaxed italic">"{quote}"</p>
      <div className="flex items-center gap-3 mt-auto">
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-white text-sm font-bold"
          style={{ background: color }}
        >
          {initial}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">{name}</p>
          <p className="text-xs text-slate-400">{role}</p>
        </div>
      </div>
    </div>
  )
}

// ── Main Landing Page ─────────────────────────────────────────────────────────

export function LandingPage({ isAuthenticated }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const ctaHref = isAuthenticated ? '/magang' : '/login'
  const ctaLabel = isAuthenticated ? 'Ke Dashboard →' : 'Mulai Gratis →'
  const navCtaLabel = isAuthenticated ? 'Ke Dashboard' : 'Masuk'

  const features = [
    {
      gradient: 'linear-gradient(135deg, #3b82f6, #6366f1)',
      title: 'Logbook Harian',
      description:
        'Catat aktivitas magang setiap hari dengan mudah. Tandai status, tambahkan keterangan, dan pantau progres dalam satu tempat yang rapi.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      delay: '0ms',
    },
    {
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      title: 'Analisis Harian AI',
      description:
        'AI menganalisis catatan logbook harianmu secara otomatis, memberikan insight mendalam tentang produktivitas dan perkembangan kompetensimu.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4l3 3" />
          <path d="M3.05 11a9 9 0 1 0 .5-2.6" />
        </svg>
      ),
      delay: '80ms',
    },
    {
      gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
      title: 'Rangkuman Mingguan AI',
      description:
        'Setiap minggu, AI merangkum seluruh pencapaianmu menjadi laporan komprehensif yang siap dibagikan ke mentor atau supervisor.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
        </svg>
      ),
      delay: '160ms',
    },
    {
      gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
      title: 'Generator Laporan Akhir',
      description:
        'Buat laporan akhir magang profesional dalam hitungan menit. AI menyusun seluruh data logbookmu menjadi dokumen yang terstruktur dan berkualitas.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      ),
      delay: '240ms',
    },
  ]

  return (
    <div className="min-h-screen bg-white font-sans antialiased overflow-x-hidden">
      {/* ── SEO Title (hidden visually but for bots) ── */}
      <title>InternLog – Platform Manajemen Magang Berbasis AI</title>

      {/* ── Navbar ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? 'bg-white/97 backdrop-blur-md border-slate-200 shadow-[0_2px_16px_-2px_rgba(15,23,42,0.10)]'
            : 'bg-white/90 backdrop-blur-sm border-slate-100 shadow-[0_1px_8px_-2px_rgba(15,23,42,0.06)]'
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          {/* Logo */}
          <Link to="/" className="relative flex items-center select-none" id="nav-logo" style={{ height: '64px', width: '200px' }}>
            <img
              src={logoUrl}
              alt="InternLog Logo"
              className="absolute object-contain"
              style={{ height: '200px', width: 'auto', top: '50%', left: '0', transform: 'translateY(-50%)' }}
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a href="#fitur" className="hover:text-blue-600 transition-colors duration-200" id="nav-fitur">
              Fitur
            </a>
            <a href="#cara-kerja" className="hover:text-blue-600 transition-colors duration-200" id="nav-cara-kerja">
              Cara Kerja
            </a>
            <a href="#testimoni" className="hover:text-blue-600 transition-colors duration-200" id="nav-testimoni">
              Testimoni
            </a>
          </div>

          {/* CTA Button */}
          <div className="flex items-center gap-3">
            <Link
              to={ctaHref}
              id="nav-cta-btn"
              className="hidden md:inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all duration-200 hover:bg-blue-700 hover:shadow-blue-300 active:scale-95"
            >
              {navCtaLabel}
            </Link>

            {/* Mobile hamburger */}
            <button
              id="mobile-menu-btn"
              className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-500 transition hover:bg-slate-50"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                {menuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white/98 backdrop-blur-md px-5 py-4 flex flex-col gap-4 shadow-lg">
            <a
              href="#fitur"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Fitur
            </a>
            <a
              href="#cara-kerja"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Cara Kerja
            </a>
            <a
              href="#testimoni"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Testimoni
            </a>
            <Link
              to={ctaHref}
              id="mobile-cta-btn"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
              onClick={() => setMenuOpen(false)}
            >
              {navCtaLabel}
            </Link>
          </div>
        )}
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pt-20 pb-16 px-5">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {/* Large blue gradient top-left */}
          <div
            className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full opacity-[0.07]"
            style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}
          />
          {/* Purple blob bottom-right */}
          <div
            className="absolute -bottom-20 -right-20 h-[500px] w-[500px] rounded-full opacity-[0.06]"
            style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }}
          />
          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-rule='evenodd'%3E%3Ccircle cx='1' cy='1' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          {/* Headline */}
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-slate-900 leading-tight md:text-6xl lg:text-[68px]">
            Kelola Magang{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Lebih Cerdas
              </span>
              {/* Underline decoration */}
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M2 9C60 4 120 2 180 4C240 6 270 8 298 7"
                  stroke="url(#heroUnderlineGrad)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="heroUnderlineGrad" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#3b82f6" />
                    <stop offset="1" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>
            </span>{' '}
            dengan AI
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-500 leading-relaxed md:text-xl">
            InternLog adalah platform manajemen magang yang dilengkapi kecerdasan buatan. Catat logbook harian,
            dapatkan analisis otomatis, dan hasilkan laporan akhir profesional tanpa repot.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={ctaHref}
              id="hero-cta-primary"
              className="group inline-flex items-center gap-2.5 rounded-2xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-blue-200 transition-all duration-200 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-300 hover:-translate-y-0.5 active:scale-95"
            >
              {ctaLabel}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>

            {!isAuthenticated && (
              <a
                href="#fitur"
                id="hero-cta-secondary"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-0.5 active:scale-95"
              >
                Pelajari Fitur
              </a>
            )}
          </div>

          {/* Social proof pill */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="flex -space-x-2.5">
              {['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#8b5cf6'].map((color, i) => (
                <div
                  key={i}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-white text-xs font-bold shadow-sm"
                  style={{ background: color }}
                >
                  {['A', 'B', 'R', 'D', 'S'][i]}
                </div>
              ))}
            </div>
            <div className="text-sm text-slate-500">
              <span className="font-semibold text-slate-800">200+ mahasiswa</span> telah menggunakan InternLog
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-300">
          <span className="text-[10px] font-medium uppercase tracking-widest select-none">Scroll</span>
          <div className="flex h-8 w-5 items-start justify-center rounded-full border-2 border-slate-200 p-1">
            <div className="h-2 w-1 rounded-full bg-slate-300 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="border-y border-slate-100 bg-slate-50/60 py-10 px-5">
        <div className="mx-auto max-w-5xl grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { value: 200, suffix: '+', label: 'Mahasiswa Aktif' },
            { value: 15000, suffix: '+', label: 'Log Harian Dibuat' },
            { value: 98, suffix: '%', label: 'Tingkat Kepuasan' },
            { value: 50, suffix: '+', label: 'Universitas Mitra' },
          ].map(({ value, suffix, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-extrabold text-slate-800 tracking-tight md:text-4xl">
                <AnimatedNumber target={value} suffix={suffix} />
              </p>
              <p className="mt-1 text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="fitur" className="py-24 px-5">
        <div className="mx-auto max-w-6xl">
          {/* Section header */}
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight md:text-4xl">
              Semua yang kamu butuhkan,{' '}
              <span className="text-blue-600">dalam satu platform</span>
            </h2>
            <p className="mt-4 mx-auto max-w-xl text-slate-500 leading-relaxed">
              Dirancang khusus untuk mahasiswa magang dan supervisor, InternLog menyederhanakan seluruh proses
              dokumentasi dan pelaporan.
            </p>
          </div>

          {/* Feature cards grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feat) => (
              <FeatureCard key={feat.title} {...feat} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="cara-kerja" className="py-24 px-5 bg-slate-50/60">
        <div className="mx-auto max-w-5xl grid gap-12 lg:grid-cols-2 items-center">
          {/* Left: Steps */}
          <div>
            <h2 className="mb-10 text-3xl font-extrabold text-slate-900 tracking-tight md:text-4xl">
              Mulai dalam <span className="text-indigo-600">3 langkah mudah</span>
            </h2>
            <div>
              <StepItem
                number="1"
                title="Login dengan Google"
                description="Daftarkan diri menggunakan akun Google Anda. Tidak perlu membuat akun baru, cukup satu klik."
              />
              <StepItem
                number="2"
                title="Buat & isi logbook harian"
                description="Catat aktivitas magang setiap hari. Tambahkan deskripsi kegiatan, status, dan catatan tambahan."
              />
              <StepItem
                number="3"
                title="Biarkan AI bekerja"
                description="AI kami otomatis menganalisis catatan harianmu, menyusun rangkuman mingguan, dan menghasilkan laporan akhir profesional."
                isLast
              />
            </div>
          </div>

          {/* Right: Preview card */}
          <div className="relative flex items-center justify-center">
            {/* Glow */}
            <div
              className="absolute inset-0 rounded-3xl opacity-20 blur-2xl"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
            />
            <div className="relative w-full max-w-sm rounded-2xl border border-slate-100 bg-white shadow-xl p-5 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Logbook</p>
                  <p className="text-sm font-bold text-slate-800">Senin, 16 Jun 2026</p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-100">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth={2.5} className="h-4 w-4">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>
              {/* Log entries */}
              {[
                { time: '09:00', activity: 'Code review modul autentikasi', done: true },
                { time: '11:00', activity: 'Meeting dengan tim backend', done: true },
                { time: '14:00', activity: 'Implementasi fitur logbook', done: false },
              ].map(({ time, activity, done }) => (
                <div
                  key={time}
                  className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                >
                  <div
                    className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${
                      done ? 'border-green-300 bg-green-100' : 'border-slate-200 bg-white'
                    }`}
                  >
                    {done && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth={3} className="h-3 w-3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold ${done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                      {activity}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{time}</p>
                  </div>
                </div>
              ))}
              {/* AI badge */}
              <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-3">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="h-3.5 w-3.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-700">Analisis AI Tersedia</p>
                  <p className="text-[9px] text-blue-500 flex items-center gap-1">Produktivitas hari ini: Sangat Baik <svg viewBox="0 0 24 24" fill="#6366f1" className="h-2.5 w-2.5 flex-shrink-0"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimoni" className="py-24 px-5">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight md:text-4xl">
              Dipercaya <span className="text-amber-600">mahasiswa aktif</span>
            </h2>
            <p className="mt-4 mx-auto max-w-xl text-slate-500 leading-relaxed">
              Lihat apa yang mahasiswa dan supervisor rasakan setelah menggunakan InternLog.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <TestimonialCard
              quote="InternLog mengubah cara saya mendokumentasikan magang. Laporan akhir yang dulu butuh seminggu, kini selesai dalam hitungan jam!"
              name="Aisyah Putri"
              role="Mahasiswa Informatika, UI"
              initial="A"
              color="linear-gradient(135deg, #4285F4, #6366f1)"
            />
            <TestimonialCard
              quote="Fitur analisis AI-nya luar biasa. Saya bisa melihat perkembangan kompetensi peserta magang saya secara real-time."
              name="Budi Santoso"
              role="Supervisor Magang, PT Teknologi Nusantara"
              initial="B"
              color="linear-gradient(135deg, #10b981, #059669)"
            />
            <TestimonialCard
              quote="Rangkuman mingguan otomatis sangat membantu. Mentor saya selalu terkesan dengan laporan yang tersusun rapi dan terstruktur."
              name="Rizky Firmansyah"
              role="Mahasiswa Sistem Informasi, ITS"
              initial="R"
              color="linear-gradient(135deg, #f59e0b, #ef4444)"
            />
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-16 px-5">
        <div className="mx-auto max-w-3xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-10 text-center shadow-2xl shadow-blue-200">
            {/* Decorative blobs */}
            <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="relative z-10">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-200">
                Mulai Sekarang · Gratis
              </p>
              <h2 className="mb-4 text-3xl font-extrabold text-white tracking-tight md:text-4xl">
                Siap memulai perjalanan{' '}
                <span className="text-blue-200">magangmu?</span>
              </h2>
              <p className="mb-8 text-blue-100 leading-relaxed max-w-md mx-auto">
                Bergabunglah dengan ratusan mahasiswa yang sudah mempercayakan dokumentasi magang mereka kepada
                InternLog.
              </p>
              <Link
                to={ctaHref}
                id="cta-banner-btn"
                className="group inline-flex items-center gap-2.5 rounded-2xl bg-white px-8 py-4 text-base font-bold text-blue-700 shadow-lg transition-all duration-200 hover:bg-blue-50 hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
              >
                {isAuthenticated ? 'Ke Dashboard' : 'Daftar dengan Google — Gratis!'}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 bg-white py-10 px-5">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo + Brand */}
            <div className="relative select-none" style={{ height: '48px', width: '200px' }}>
              <img
                src={logoUrl}
                alt="InternLog"
                className="absolute object-contain"
                style={{ height: '200px', width: 'auto', top: '50%', left: '0', transform: 'translateY(-50%)' }}
              />
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <a href="#fitur" className="hover:text-slate-700 transition-colors">
                Fitur
              </a>
              <a href="#cara-kerja" className="hover:text-slate-700 transition-colors">
                Cara Kerja
              </a>
              <a href="#testimoni" className="hover:text-slate-700 transition-colors">
                Testimoni
              </a>
              <a href="mailto:hello@internlog.id" className="hover:text-slate-700 transition-colors">
                Kontak
              </a>
            </div>

            {/* Copyright */}
            <p className="text-xs text-slate-400 select-none">© 2026 InternLog. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
