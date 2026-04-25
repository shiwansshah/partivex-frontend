import axios from 'axios'

const axiosClient = axios.create({
  baseURL: 'https://localhost:7000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export default axiosClient
