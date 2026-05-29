import { useState, useCallback } from 'react'
import { magangService } from '../services/magangService'

export function useMagang() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await magangService.getAll()
      setItems(Array.isArray(data) ? data : data?.data ?? [])
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Gagal memuat data magang')
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(async (data) => {
    setActionLoading(true)
    setError(null)
    try {
      const created = await magangService.create(data)
      const newItem = created?.data ?? created
      setItems((prev) => [newItem, ...prev])
      return { success: true }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Gagal menambah data magang'
      setError(msg)
      return { success: false, message: msg }
    } finally {
      setActionLoading(false)
    }
  }, [])

  const update = useCallback(async (id, data) => {
    setActionLoading(true)
    setError(null)
    try {
      const updated = await magangService.update(id, data)
      const updatedItem = updated?.data ?? updated
      setItems((prev) => prev.map((item) => (item.id === id ? updatedItem : item)))
      return { success: true }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Gagal memperbarui data magang'
      setError(msg)
      return { success: false, message: msg }
    } finally {
      setActionLoading(false)
    }
  }, [])

  const remove = useCallback(async (id) => {
    setActionLoading(true)
    setError(null)
    try {
      await magangService.delete(id)
      setItems((prev) => prev.filter((item) => item.id !== id))
      return { success: true }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Gagal menghapus data magang'
      setError(msg)
      return { success: false, message: msg }
    } finally {
      setActionLoading(false)
    }
  }, [])

  return { items, loading, actionLoading, error, fetchAll, create, update, remove }
}
