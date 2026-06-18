import { useEffect, useState, useCallback } from 'react'
import { useMagang } from '../hooks/useMagang'
import { MagangTable } from '../components/magang/MagangTable'
import { MagangForm } from '../components/magang/MagangForm'
import { DeleteConfirmModal } from '../components/magang/DeleteConfirmModal'
import { ToastContainer, useToast } from '../components/Toast'
import logoUrl from '../assets/images/logo.png'

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 px-5 py-4 flex items-center gap-4 hover:border-slate-200 transition-all duration-200 hover:shadow-sm">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
        style={{ background: color + '14' }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 leading-none">{value}</p>
        <p className="text-xs text-slate-400 mt-1 font-medium">{label}</p>
      </div>
    </div>
  )
}

export function MagangPage({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)

  const { items, loading, actionLoading, fetchAll, create, update, remove } = useMagang()
  const { toasts, removeToast, toast } = useToast()

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleOpenCreate = () => { setEditItem(null); setFormOpen(true) }
  const handleOpenEdit = (item) => { setEditItem(item); setFormOpen(true) }
  const handleOpenDelete = (item) => { setDeleteItem(item) }

  const handleFormSubmit = useCallback(async (data) => {
    const result = editItem ? await update(editItem.id, data) : await create(data)
    if (result.success) {
      setFormOpen(false)
      toast.success(editItem ? 'Data magang berhasil diperbarui!' : 'Data magang berhasil ditambahkan!')
    } else {
      toast.error(result.message || 'Terjadi kesalahan')
    }
  }, [editItem, create, update, toast])

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteItem) return
    const result = await remove(deleteItem.id)
    if (result.success) {
      toast.success(`"${deleteItem.nama}" berhasil dihapus`)
      setDeleteItem(null)
    } else {
      toast.error(result.message || 'Gagal menghapus data')
    }
  }, [deleteItem, remove, toast])

  const now = new Date()
  const activeCount = items.filter(i => new Date(i.tanggal_mulai) <= now && new Date(i.tanggal_selesai) >= now).length
  const doneCount = items.filter(i => new Date(i.tanggal_selesai) < now).length
  const totalTimeline = items.reduce((sum, i) => sum + (Number(i.timeline) || 0), 0)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans antialiased">

      {/* ─── Sidebar ─── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-white border-r border-slate-100 transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center px-5 h-24 overflow-hidden border-b border-slate-50 relative">
          <img src={logoUrl} alt="Logo" className="h-64 w-auto object-contain" />
          <span className="absolute right-3 top-3 text-[9px] font-bold text-blue-500 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5 uppercase tracking-wide">Beta</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 px-3 mb-3">Menu</p>
          <button
            id="nav-magang"
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold bg-slate-50 text-slate-700 transition duration-200"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 text-blue-500 flex-shrink-0">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
            Magang
            {items.length > 0 && (
              <span className="ml-auto text-[10px] font-bold bg-blue-100 text-blue-600 rounded-full px-2 py-0.5">{items.length}</span>
            )}
          </button>
        </nav>

        {/* User profile */}
        <div className="p-3 border-t border-slate-50">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-slate-50">
            {user?.profile_picture ? (
              <img src={user.profile_picture} alt="Avatar" className="h-8 w-8 rounded-xl object-cover ring-1 ring-slate-100" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 text-[11px] font-bold text-white flex-shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-700">{user?.name ?? 'User'}</p>
              <p className="truncate text-[10px] text-slate-400">{user?.email ?? ''}</p>
            </div>
            <button
              id="logout-btn"
              onClick={onLogout}
              title="Logout"
              className="shrink-0 rounded-lg p-1.5 text-slate-300 transition hover:bg-red-50 hover:text-red-400"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3.5 w-3.5">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/10 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ─── Main Content ─── */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Top bar */}
        <header className="flex items-center gap-4 border-b border-slate-100 bg-white px-6 py-4 z-20 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-100 text-slate-400 transition hover:bg-slate-50 lg:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div>
            <h1 className="text-base font-bold text-slate-800">Program Magang</h1>
            <p className="text-xs text-slate-400">Kelola dan pantau seluruh data magang Anda</p>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button
              id="tambah-magang-btn"
              onClick={handleOpenCreate}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span className="hidden sm:inline">Tambah Data</span>
              <span className="sm:hidden">Tambah</span>
            </button>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-5xl space-y-5">

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard
                label="Total Magang"
                value={loading ? '—' : items.length}
                color="#3b82f6"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                  </svg>
                }
              />
              <StatCard
                label="Sedang Aktif"
                value={loading ? '—' : activeCount}
                color="#10b981"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-5 w-5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                }
              />
              <StatCard
                label="Selesai"
                value={loading ? '—' : doneCount}
                color="#64748b"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                }
              />
              <StatCard
                label="Total Hari"
                value={loading ? '—' : totalTimeline}
                color="#f59e0b"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                }
              />
            </div>

            {/* Table section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-700">Daftar Program Magang</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {loading ? 'Memuat data...' : `${items.length} program ditemukan`}
                  </p>
                </div>
                <button
                  id="refresh-btn"
                  onClick={fetchAll}
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 disabled:opacity-40 cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}>
                    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                  Refresh
                </button>
              </div>

              <MagangTable
                items={items}
                loading={loading}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
              />
            </div>

          </div>
        </main>
      </div>

      {/* ─── Modals ─── */}
      <MagangForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editItem}
        loading={actionLoading}
      />
      <DeleteConfirmModal
        isOpen={Boolean(deleteItem)}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleConfirmDelete}
        item={deleteItem}
        loading={actionLoading}
      />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
