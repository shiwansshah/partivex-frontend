import axiosClient from './axiosClient'

export const getNotifications = () => axiosClient.get('/notifications')

export const getUnreadCount = () => axiosClient.get('/notifications/unread-count')

export const markAsRead = (id) => axiosClient.put(`/notifications/${id}/read`)
