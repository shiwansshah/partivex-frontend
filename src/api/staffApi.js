import axiosClient from './axiosClient'

export const getStaff = () => axiosClient.get('/staff')
