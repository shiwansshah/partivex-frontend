import axiosClient from './axiosClient'

export const getSales = () => axiosClient.get('/sales')
