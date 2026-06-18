import axiosInstance from '../api/axios'

export const timelineService = {
  getAllTimeline: async (magangId) => {
    const response = await axiosInstance.get(`/magang/${magangId}/timeline`)
    return response.data
  },

  getDay: async (magangId, dayNumber) => {
    const response = await axiosInstance.get(`/magang/${magangId}/day/${dayNumber}`)
    return response.data
  },

  saveDay: async (magangId, dayNumber, description, title) => {
    // description is a JSON string of BlockNote blocks
    // title is auto-generated from the first paragraph (max 50 chars)
    const response = await axiosInstance.post(`/magang/${magangId}/day/${dayNumber}`, {
      title: title || `Catatan Hari ke-${dayNumber}`,
      description
    })
    return response.data
  },

  generateWeeklySummary: async (magangId, weekNumber) => {
    const response = await axiosInstance.post(`/magang/${magangId}/weekly-summary`, {
      week_number: Number(weekNumber)
    })
    return response.data
  },

  generateFinalReport: async (magangId) => {
    const response = await axiosInstance.post(`/magang/${magangId}/final-report`)
    return response.data
  }
}
