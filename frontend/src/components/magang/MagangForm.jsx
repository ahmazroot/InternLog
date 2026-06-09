import { useState, useEffect } from 'react'

const DATA_WILAYAH = {
  Indonesia: {
    "DKI Jakarta": ["Jakarta Pusat", "Jakarta Selatan", "Jakarta Barat", "Jakarta Timur", "Jakarta Utara"],
    "Jawa Timur": ["Surabaya", "Malang", "Sidoarjo", "Gresik", "Kediri", "Madiun", "Banyuwangi"],
    "Jawa Tengah": ["Semarang", "Surakarta (Solo)", "Yogyakarta", "Magelang", "Tegal"],
    "Jawa Barat": ["Bandung", "Bogor", "Depok", "Bekasi", "Tangerang"],
    "Sumatera Utara": ["Medan", "Binjai", "Pematangsiantar", "Deli Serdang"],
    "Sulawesi Selatan": ["Makassar", "Gowa", "Maros", "Parepare"]
  },
  Singapura: {
    "Central Region": ["Downtown Core", "Bukit Merah", "Queenstown"],
    "East Region": ["Tampines", "Bedok", "Changi"]
  },
  Malaysia: {
    "Kuala Lumpur": ["Wilayah Persekutuan"],
    "Selangor": ["Shah Alam", "Petaling Jaya", "Subang Jaya", "Klang"],
    "Johor": ["Johor Bahru", "Batu Pahat", "Muar"]
  }
}

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
      <label htmlFor={id} className="text-xs font-bold uppercase tracking-widest text-slate-500">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 font-medium">
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
  `w-full rounded-xl border px-4 py-2.5 text-sm text-slate-800 bg-white outline-none placeholder-slate-400 transition duration-200 shadow-sm
   focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
   ${hasError ? 'border-red-400 bg-red-50/50' : 'border-slate-200 hover:border-slate-300'}`

export function MagangForm({ isOpen, onClose, onSubmit, initialData, loading }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [visible, setVisible] = useState(false)
  const isEdit = Boolean(initialData)

  // Dropdown States
  const [negara, setNegara] = useState('')
  const [provinsi, setProvinsi] = useState('')
  const [kota, setKota] = useState('')

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

      // Parse tempat_magang to location dropdowns if it has "Kota, Provinsi, Negara" format
      if (initialData && initialData.tempat_magang) {
        const parts = initialData.tempat_magang.split(', ')
        if (parts.length === 3) {
          setKota(parts[0])
          setProvinsi(parts[1])
          setNegara(parts[2])
        } else {
          // Fallback if it is regular custom string
          setNegara('Indonesia')
          setProvinsi('')
          setKota('')
        }
      } else {
        setNegara('')
        setProvinsi('')
        setKota('')
      }

      const t = setTimeout(() => setVisible(true), 10)
      return () => clearTimeout(t)
    } else {
      setVisible(false)
    }
  }, [isOpen, initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => {
      const updated = { ...prev, [name]: value }

      // Auto-calculate Tanggal Selesai based on Timeline & Tanggal Mulai
      if (name === 'timeline' || name === 'tanggal_mulai') {
        const timelineVal = name === 'timeline' ? value : prev.timeline
        const startDateVal = name === 'tanggal_mulai' ? value : prev.tanggal_mulai

        if (timelineVal && startDateVal) {
          const daysNum = Number(timelineVal)
          if (!isNaN(daysNum) && daysNum > 0) {
            const d = new Date(startDateVal)
            // Tambahkan (hari - 1) agar Tanggal Mulai terhitung sebagai Hari ke-1
            d.setDate(d.getDate() + (daysNum - 1))
            updated.tanggal_selesai = d.toISOString().split('T')[0]
          }
        }
      }

      return updated
    })

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }))
    if (name === 'timeline' || name === 'tanggal_mulai') {
      if (errors.tanggal_selesai) setErrors((prev) => ({ ...prev, tanggal_selesai: null }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!form.nama.trim()) newErrors.nama = 'Nama wajib diisi'
    if (!negara) newErrors.tempat_magang = 'Negara wajib terpilih'
    if (negara && !provinsi) newErrors.tempat_magang = 'Provinsi wajib terpilih'
    if (provinsi && !kota) newErrors.tempat_magang = 'Kota wajib terpilih'

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

    const locationStr = (kota && provinsi && negara)
      ? `${kota}, ${provinsi}, ${negara}`
      : form.tempat_magang.trim() || 'Indonesia'

    const payload = {
      nama: form.nama.trim(),
      timeline: form.timeline !== '' ? Number(form.timeline) : 0,
      tempat_magang: locationStr,
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
        backgroundColor: visible ? 'rgba(15,23,42,0.45)' : 'rgba(15,23,42,0)',
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
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl modal-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient header accent */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#4285F4] via-[#34A853] to-[#FBBC05]" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-800 tracking-tight">
              {isEdit ? 'Edit Data Magang' : 'Tambah Data Magang'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {isEdit ? 'Perbarui informasi program magang' : 'Isi detail program magang baru'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
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

          {/* Cascading Location Selector */}
          <div className="flex flex-col gap-3.5 border border-slate-100 rounded-2xl p-4 bg-slate-50/30">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Tempat & Lokasi Magang</p>
            
            {/* 1. Negara */}
            <InputField label="Negara" id="negara" required error={errors.tempat_magang}>
              <select
                id="negara"
                value={negara}
                onChange={(e) => {
                  setNegara(e.target.value)
                  setProvinsi('')
                  setKota('')
                  if (errors.tempat_magang) setErrors((prev) => ({ ...prev, tempat_magang: null }))
                }}
                className={inputClass(errors.tempat_magang)}
              >
                <option value="">-- Pilih Negara --</option>
                {Object.keys(DATA_WILAYAH).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </InputField>

            {/* 2. Provinsi & Kota (Grid 2-Kolom) */}
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Provinsi" id="provinsi" required>
                <select
                  id="provinsi"
                  value={provinsi}
                  disabled={!negara}
                  onChange={(e) => {
                    setProvinsi(e.target.value)
                    setKota('')
                  }}
                  className={inputClass(false) + ' disabled:opacity-50'}
                >
                  <option value="">-- Pilih Provinsi --</option>
                  {negara && Object.keys(DATA_WILAYAH[negara] || {}).map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </InputField>

              <InputField label="Kota / Kabupaten" id="kota" required>
                <select
                  id="kota"
                  value={kota}
                  disabled={!provinsi}
                  onChange={(e) => setKota(e.target.value)}
                  className={inputClass(false) + ' disabled:opacity-50'}
                >
                  <option value="">-- Pilih Kota --</option>
                  {negara && provinsi && (DATA_WILAYAH[negara][provinsi] || []).map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </InputField>
            </div>
          </div>

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
                className={inputClass(errors.tanggal_mulai) + ' cursor-pointer'}
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
                className={inputClass(errors.tanggal_selesai) + ' cursor-pointer'}
              />
            </InputField>
          </div>

          {/* Footer */}
          <div className="mt-2 flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              id={isEdit ? 'magang-save-btn' : 'magang-submit-btn'}
              disabled={loading}
              className="relative flex min-w-[140px] items-center justify-center gap-2 overflow-hidden rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-blue-600/30 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
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
