import { useState, useCallback } from 'react'
import { magangService } from '../services/magangService'

const MOCK_SEEDS = [
  {
    id: 'mock-1',
    nama: 'Software Engineer Intern',
    tempat_magang: 'Google Indonesia',
    timeline: 90,
    tanggal_mulai: '2026-06-01',
    tanggal_selesai: '2026-08-30'
  },
  {
    id: 'mock-2',
    nama: 'UI/UX Designer Intern',
    tempat_magang: 'Tokopedia',
    timeline: 60,
    tanggal_mulai: '2026-07-01',
    tanggal_selesai: '2026-08-30'
  }
]

export function useMagang() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState(null)

  const isDemo = localStorage.getItem('demo_mode') === 'true'

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (isDemo) {
        // Wait 300ms to simulate network latency beautifully
        await new Promise((resolve) => setTimeout(resolve, 300))
        const stored = localStorage.getItem('mock_magang_items')
        if (stored) {
          setItems(JSON.parse(stored))
        } else {
          localStorage.setItem('mock_magang_items', JSON.stringify(MOCK_SEEDS))
          setItems(MOCK_SEEDS)
        }
      } else {
        const data = await magangService.getAll()
        setItems(Array.isArray(data) ? data : data?.data ?? [])
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Gagal memuat data magang')
    } finally {
      setLoading(false)
    }
  }, [isDemo])

  const create = useCallback(async (data) => {
    setActionLoading(true)
    setError(null)
    try {
      if (isDemo) {
        await new Promise((resolve) => setTimeout(resolve, 300))
        const stored = localStorage.getItem('mock_magang_items')
        const currentList = stored ? JSON.parse(stored) : MOCK_SEEDS
        const newItem = {
          ...data,
          id: 'mock-' + Date.now(),
          timeline: Number(data.timeline) || 0
        }
        const updatedList = [newItem, ...currentList]
        localStorage.setItem('mock_magang_items', JSON.stringify(updatedList))
        setItems(updatedList)
        return { success: true }
      } else {
        const created = await magangService.create(data)
        const newItem = created?.data ?? created
        setItems((prev) => [newItem, ...prev])
        return { success: true }
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Gagal menambah data magang'
      setError(msg)
      return { success: false, message: msg }
    } finally {
      setActionLoading(false)
    }
  }, [isDemo])

  const update = useCallback(async (id, data) => {
    setActionLoading(true)
    setError(null)
    try {
      if (isDemo) {
        await new Promise((resolve) => setTimeout(resolve, 300))
        const stored = localStorage.getItem('mock_magang_items')
        const currentList = stored ? JSON.parse(stored) : MOCK_SEEDS
        const updatedList = currentList.map((item) =>
          item.id === id ? { ...item, ...data, timeline: Number(data.timeline) || 0 } : item
        )
        localStorage.setItem('mock_magang_items', JSON.stringify(updatedList))
        setItems(updatedList)
        return { success: true }
      } else {
        const updated = await magangService.update(id, data)
        const updatedItem = updated?.data ?? updated
        setItems((prev) => prev.map((item) => (item.id === id ? updatedItem : item)))
        return { success: true }
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Gagal memperbarui data magang'
      setError(msg)
      return { success: false, message: msg }
    } finally {
      setActionLoading(false)
    }
  }, [isDemo])

  const remove = useCallback(async (id) => {
    setActionLoading(true)
    setError(null)
    try {
      if (isDemo) {
        await new Promise((resolve) => setTimeout(resolve, 300))
        const stored = localStorage.getItem('mock_magang_items')
        const currentList = stored ? JSON.parse(stored) : MOCK_SEEDS
        const updatedList = currentList.filter((item) => item.id !== id)
        localStorage.setItem('mock_magang_items', JSON.stringify(updatedList))
        setItems(updatedList)
        return { success: true }
      } else {
        await magangService.delete(id)
        setItems((prev) => prev.filter((item) => item.id !== id))
        return { success: true }
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Gagal menghapus data magang'
      setError(msg)
      return { success: false, message: msg }
    } finally {
      setActionLoading(false)
    }
  }, [isDemo])

  return { items, loading, actionLoading, error, fetchAll, create, update, remove }
}
