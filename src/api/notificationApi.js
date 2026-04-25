import axiosClient from './axiosClient'

export const getNotifications = () => axiosClient.get('/notifications')
