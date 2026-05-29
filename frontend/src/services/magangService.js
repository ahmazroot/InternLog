import axiosInstance from '../api/axios'

export const magangService = {
  getAll: async () => {
    const response = await axiosInstance.get('/magang')
    return response.data
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/magang/${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await axiosInstance.post('/magang', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/magang/${id}`, data)
    return response.data
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/magang/${id}`)
    return response.data
  },
}
