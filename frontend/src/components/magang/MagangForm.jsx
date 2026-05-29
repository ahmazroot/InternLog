import { useState, useEffect } from 'react'

const EMPTY_FORM = {
  nama: '',
  timeline: '',
  tempat_magang: '',
  tanggal_mulai: '',
  tanggal_selesai: '',
}

function InputField({ label, id, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-widest text-slate-400">
        {label} {required && <span className="text-violet-400">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-400">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3 w-3">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

const inputClass = (hasError) =>
  `w-full rounded-xl border px-4 py-2.5 text-sm text-slate-100 bg-slate-800/80 outline-none placeholder-slate-600 transition duration-150
   focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/60
   ${hasError ? 'border-red-500/60 bg-red-900/10' : 'border-slate-700/80 hover:border-slate-600'}`

export function MagangForm({ isOpen, onClose, onSubmit, initialData, loading }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [visible, setVisible] = useState(false)
  const isEdit = Boolean(initialData)

  useEffect(() => {
    if (isOpen) {
      setForm(
        initialData
          ? {
              nama: initialData.nama ?? '',
              timeline: initialData.timeline ?? '',
              tempat_magang: initialData.tempat_magang ?? '',
              tanggal_mulai: initialData.tanggal_mulai ?? '',
              tanggal_selesai: initialData.tanggal_selesai ?? '',
            }
          : EMPTY_FORM,
      )
      setErrors({})
      const t = setTimeout(() => setVisible(true), 10)
      return () => clearTimeout(t)
    } else {
      setVisible(false)
    }
  }, [isOpen, initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }))
  }

  const validate = () => {
    const newErrors = {}
    if (!form.nama.trim()) newErrors.nama = 'Nama wajib diisi'
    if (form.timeline !== '' && (isNaN(Number(form.timeline)) || Number(form.timeline) < 0))
      newErrors.timeline = 'Timeline harus berupa angka positif'
    if (form.tanggal_mulai && form.tanggal_selesai && form.tanggal_selesai < form.tanggal_mulai)
      newErrors.tanggal_selesai = 'Tanggal selesai harus setelah tanggal mulai'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    const payload = {
      nama: form.nama.trim(),
      timeline: form.timeline !== '' ? Number(form.timeline) : 0,
      tempat_magang: form.tempat_magang.trim(),
      tanggal_mulai: form.tanggal_mulai,
      tanggal_selesai: form.tanggal_selesai,
    }
    await onSubmit(payload)
  }

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: visible ? 'rgba(2,6,23,0.75)' : 'rgba(2,6,23,0)',
        backdropFilter: visible ? 'blur(8px)' : 'blur(0px)',
        transition: 'background-color 300ms ease, backdrop-filter 300ms ease',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.96)',
          opacity: visible ? 1 : 0,
          transition: 'all 300ms cubic-bezier(0.22,1,0.36,1)',
        }}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-900 shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient header accent */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              {isEdit ? 'Edit Data Magang' : 'Tambah Data Magang'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {isEdit ? 'Perbarui informasi program magang' : 'Isi detail program magang baru'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-800 hover:text-slate-300"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <InputField label="Nama" id="nama" required error={errors.nama}>
            <input
              id="nama"
              name="nama"
              type="text"
              placeholder="Contoh: Magang PT Teknologi Maju"
              value={form.nama}
              onChange={handleChange}
              className={inputClass(errors.nama)}
              autoFocus
            />
          </InputField>

          <InputField label="Tempat Magang" id="tempat_magang" error={errors.tempat_magang}>
            <input
              id="tempat_magang"
              name="tempat_magang"
              type="text"
              placeholder="Contoh: Jakarta Selatan"
              value={form.tempat_magang}
              onChange={handleChange}
              className={inputClass(false)}
            />
          </InputField>

          <InputField label="Timeline (hari)" id="timeline" error={errors.timeline}>
            <input
              id="timeline"
              name="timeline"
              type="number"
              min="0"
              placeholder="Contoh: 90"
              value={form.timeline}
              onChange={handleChange}
              className={inputClass(errors.timeline)}
            />
          </InputField>

          <div className="grid grid-cols-2 gap-3">
            <InputField label="Tanggal Mulai" id="tanggal_mulai" error={errors.tanggal_mulai}>
              <input
                id="tanggal_mulai"
                name="tanggal_mulai"
                type="date"
                value={form.tanggal_mulai}
                onChange={handleChange}
                className={inputClass(errors.tanggal_mulai) + ' cursor-pointer [color-scheme:dark]'}
              />
            </InputField>

            <InputField label="Tanggal Selesai" id="tanggal_selesai" error={errors.tanggal_selesai}>
              <input
                id="tanggal_selesai"
                name="tanggal_selesai"
                type="date"
                value={form.tanggal_selesai}
                min={form.tanggal_mulai || undefined}
                onChange={handleChange}
                className={inputClass(errors.tanggal_selesai) + ' cursor-pointer [color-scheme:dark]'}
              />
            </InputField>
          </div>

          {/* Footer */}
          <div className="mt-2 flex items-center justify-end gap-2 border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-400 transition hover:border-slate-600 hover:text-slate-200 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              id={isEdit ? 'magang-save-btn' : 'magang-submit-btn'}
              disabled={loading}
              className="relative flex min-w-[120px] items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition duration-200 hover:-translate-y-0.5 hover:shadow-violet-900/60 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Menyimpan...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
                    {isEdit ? (
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8" />
                    ) : (
                      <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>
                    )}
                  </svg>
                  {isEdit ? 'Simpan Perubahan' : 'Tambah Magang'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
