import axiosInstance from '../api/axios'

export const authService = {
  googleLogin: async (googleAccessToken) => {
    const response = await axiosInstance.post('/auth/google', {
      access_token: googleAccessToken,
    })

    const backendToken = response?.data?.data?.access_token

    if (!backendToken) {
      throw new Error('Backend JWT tidak ditemukan pada respons login')
    }

    localStorage.setItem('auth_token', backendToken)
    return response.data
  },

  fetchMe: async () => {
    const response = await axiosInstance.get('/user/me')
    const user = response?.data?.data?.user

    if (!user) {
      throw new Error('Data user tidak ditemukan pada respons profile')
    }

    localStorage.setItem('user', JSON.stringify(user))
    return user
  },

  logout: () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  },

  getUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  getToken: () => localStorage.getItem('auth_token'),

  isLoggedIn: () => Boolean(localStorage.getItem('auth_token')),
}
