import axiosClient from './axiosClient'

export const getInventoryItems = () => axiosClient.get('/inventory')
