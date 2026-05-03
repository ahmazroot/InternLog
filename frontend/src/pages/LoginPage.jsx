import { useGoogleLogin } from '@react-oauth/google'
import { useState } from 'react'
import { authService } from '../services/authService'

export function LoginPage({ onLoginSuccess, onLoginError }) {
  const [activeModal, setActiveModal] = useState(null)
  const [heroTilt, setHeroTilt] = useState({ x: 0, y: 0 })

  const scrollToSection = (id) => {
    const section = document.getElementById(id)
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const openModal = (type) => setActiveModal(type)
  const closeModal = () => setActiveModal(null)
  const resetTilt = () => setHeroTilt({ x: 0, y: 0 })

  const handleHeroMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width
    const py = (event.clientY - rect.top) / rect.height
    setHeroTilt({
      x: (px - 0.5) * 10,
      y: (py - 0.5) * 10,
    })
  }

  const handleGoogleSuccess = async (response) => {
    console.log('GOOGLE SUCCESS:', response)

    try {
      const accessToken = response?.access_token

      if (!accessToken) {
        throw new Error('Access token tidak diterima dari Google')
      }

      const backendResponse = await authService.googleLogin(accessToken)
      console.log('BACKEND RESPONSE:', backendResponse)

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

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/55 bg-[#bb88ff]/70 p-3">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-16 h-72 w-72 rounded-full bg-[#d8b7ff]/45 blur-3xl" />
      <div className="pointer-events-none absolute left-[6%] top-[12%] h-6 w-6 bubble-float rounded-full bg-white/45" />
      <div className="pointer-events-none absolute right-[11%] top-[18%] h-4 w-4 bubble-float-slow rounded-full bg-violet-100/80" />
      <div className="pointer-events-none absolute left-[14%] bottom-[16%] h-3 w-3 bubble-float rounded-full bg-violet-100/70" />
      <div className="pointer-events-none absolute right-[22%] bottom-[10%] h-8 w-8 bubble-float-slow rounded-full bg-white/25" />

      <div className="relative mx-auto max-w-[940px] rounded-2xl bg-white p-3 shadow-xl shadow-violet-900/10 md:p-4">
        <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-white px-4 py-2.5">
          <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />
            <span>InternLog</span>
          </div>
          <div className="hidden items-center gap-5 md:inline-flex">
            <button
              type="button"
              className="bg-transparent p-0 text-sm text-slate-600 hover:text-slate-900"
              onClick={() => scrollToSection('products')}
            >
              Products
            </button>
            <button
              type="button"
              className="bg-transparent p-0 text-sm text-slate-600 hover:text-slate-900"
              onClick={() => openModal('app')}
            >
              App
            </button>
            <button
              type="button"
              className="bg-transparent p-0 text-sm text-slate-600 hover:text-slate-900"
              onClick={() => scrollToSection('about')}
            >
              About
            </button>
            <button
              type="button"
              className="bg-transparent p-0 text-sm text-slate-600 hover:text-slate-900"
              onClick={() => openModal('faq')}
            >
              FAQ
            </button>
          </div>
          <button
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            onClick={() => login()}
          >
            Log in
          </button>
        </div>

        <div className="mt-3 grid gap-3.5">
          <section className="grid gap-3 lg:grid-cols-[1.45fr_1fr]">
            <article className="rounded-2xl bg-[#caa2ff] p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-900/10 md:min-h-[276px] md:p-6">
              <p className="text-[11px] font-semibold tracking-[0.11em] text-slate-500">
                STRATEGY SCULPTORS
              </p>
              <h2 className="mt-2 text-3xl leading-[1.05] font-semibold text-slate-800 md:text-[44px]">
                Помогаем командам расти и выводим бизнес на новый уровень
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                Login untuk sinkronisasi logbook, feedback mentor, attendance,
                dan progress internship dalam satu dashboard.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                <button
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/30"
                  onClick={() => login()}
                >
                  Continue with Google
                </button>
                <button
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:bg-violet-50"
                  onClick={() => openModal('app')}
                >
                  Lihat fitur app
                </button>
              </div>
            </article>

            <article
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#d7b6ff] via-[#bc8dff] to-[#9f6dff] p-5 transition duration-300 hover:shadow-lg hover:shadow-violet-900/20 md:min-h-[276px]"
              onMouseMove={handleHeroMove}
              onMouseLeave={resetTilt}
            >
              <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/35" />
              <div className="absolute -bottom-10 left-8 h-28 w-28 rounded-full bg-slate-900/20" />
              <div
                className="relative transition-transform duration-150 ease-out"
                style={{
                  transform: `perspective(900px) rotateX(${-heroTilt.y}deg) rotateY(${heroTilt.x}deg)`,
                }}
              >
                <p className="text-xs font-semibold text-slate-700">WORLD OF INTERNSHIP</p>
                <h3 className="mt-4 text-[34px] leading-[1.02] font-semibold text-slate-900">
                  Work smart
                  <br />
                  with InternLog
                </h3>
                <button
                  type="button"
                  className="mt-6 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition duration-300 hover:-translate-y-0.5 hover:bg-violet-50"
                  onClick={() => openModal('faq')}
                >
                  FAQ & Help
                </button>
              </div>
            </article>
          </section>

          <div className="grid gap-2.5 md:grid-cols-3" id="products">
            <article className="rounded-xl bg-[#f3e8ff] p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-violet-900/10">
              <h3 className="m-0 text-2xl font-bold text-slate-800">150+</h3>
              <p className="mt-1.5 text-sm text-slate-600">Tasks processed per week</p>
            </article>
            <article className="rounded-xl bg-white p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-900/10">
              <h3 className="m-0 text-2xl font-bold text-slate-800">300+</h3>
              <p className="mt-1.5 text-sm text-slate-600">Active internship users</p>
            </article>
            <article className="rounded-xl bg-[#d9f779] p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-lime-900/15">
              <h3 className="m-0 text-2xl font-bold text-slate-800">7 Years</h3>
              <p className="mt-1.5 text-sm text-slate-700">Monitoring workflow experience</p>
            </article>
          </div>

          <section className="rounded-2xl bg-white p-5 md:p-6" id="about">
            <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
              <div>
                <h4 className="m-0 text-[31px] leading-[1.08] font-semibold text-slate-800">
                  Стратегия полезна всем: от владельцев компаний до руководителей отделов
                </h4>
                <p className="mt-2 text-sm text-slate-600">
                  InternLog membantu mahasiswa, mentor, dan admin melihat progress kerja secara real-time.
                </p>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <article className="rounded-xl bg-violet-100 p-3.5 transition duration-300 hover:-translate-y-0.5">
                  <h5 className="m-0 text-sm font-semibold text-slate-800">Mahasiswa</h5>
                  <ul className="mb-0 mt-2 list-disc pl-4 text-xs leading-6 text-slate-700">
                    <li>Logbook harian cepat</li>
                    <li>Riwayat progres rapi</li>
                    <li>Reminder tugas</li>
                  </ul>
                </article>
                <article className="rounded-xl bg-slate-100 p-3.5 transition duration-300 hover:-translate-y-0.5">
                  <h5 className="m-0 text-sm font-semibold text-slate-800">Mentor/Admin</h5>
                  <ul className="mb-0 mt-2 list-disc pl-4 text-xs leading-6 text-slate-700">
                    <li>Monitoring peserta</li>
                    <li>Feedback terstruktur</li>
                    <li>Rekap siap ekspor</li>
                  </ul>
                </article>
              </div>
            </div>
          </section>

          <section className="grid gap-2.5 md:grid-cols-3">
            <article className="rounded-xl bg-white p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-900/10">
              <p className="text-xs font-semibold tracking-wide text-slate-500">TOOLS</p>
              <h5 className="mt-1.5 text-base font-semibold text-slate-800">Integrasi harian</h5>
              <p className="mt-1 text-sm text-slate-600">
                Export laporan ke Google Sheet, Notion, atau format internal perusahaan.
              </p>
            </article>
            <article className="rounded-xl bg-white p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-900/10">
              <p className="text-xs font-semibold tracking-wide text-slate-500">WORKFLOW</p>
              <h5 className="mt-1.5 text-base font-semibold text-slate-800">Status real-time</h5>
              <p className="mt-1 text-sm text-slate-600">
                Semua update tersinkron untuk mahasiswa, mentor, dan admin di satu tempat.
              </p>
            </article>
            <article className="rounded-xl bg-[#caa2ff] p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-violet-900/15">
              <p className="text-xs font-semibold tracking-wide text-slate-600">SUPPORT</p>
              <h5 className="mt-1.5 text-base font-semibold text-slate-900">Need help?</h5>
              <button
                type="button"
                className="mt-3 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/25"
                onClick={() => openModal('faq')}
              >
                Open FAQ popup
              </button>
            </article>
          </section>

          <section
            className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-gradient-to-r from-[#c79bff] to-[#ecd9ff] p-5 md:flex-row md:items-center"
            id="faq"
          >
            <div>
              <h4 className="m-0 text-[33px] leading-[1.06] font-semibold text-slate-800">
                Узнайте, как сделать ваш рабочий процесс максимально эффективным
              </h4>
              <p className="mt-2 text-sm text-slate-600">
                Cek troubleshooting OAuth, validasi token JWT, dan status integrasi backend.
              </p>
            </div>
            <button
              type="button"
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/25"
              onClick={() => openModal('faq')}
            >
              FAQ
            </button>
          </section>
        </div>
      </div>

      {activeModal && (
        <div
          className="fixed inset-0 z-20 grid place-items-center bg-slate-900/45 p-4 modal-fade"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl modal-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-3 top-2 bg-transparent text-2xl text-slate-500"
              onClick={closeModal}
            >
              ×
            </button>
            {activeModal === 'app' ? (
              <>
                <h3 className="m-0 text-xl font-semibold text-slate-800">
                  Fitur App InternLog
                </h3>
                <ul className="mb-0 mt-3 list-disc pl-5 text-sm leading-7 text-slate-700">
                  <li>Catat logbook harian dengan cepat</li>
                  <li>Pantau progres dan feedback mentor</li>
                  <li>Session login tetap aktif saat refresh</li>
                </ul>
              </>
            ) : (
              <>
                <h3 className="m-0 text-xl font-semibold text-slate-800">
                  FAQ Login
                </h3>
                <ul className="mb-0 mt-3 list-disc pl-5 text-sm leading-7 text-slate-700">
                  <li>Pastikan `VITE_GOOGLE_CLIENT_ID` valid di `.env.local`</li>
                  <li>Tambahkan origin localhost di Google Console</li>
                  <li>Periksa request `POST /api/auth/google` di Network</li>
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
