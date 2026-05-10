import axiosClient from './axiosClient'

export const getInventoryMonitoring = () => axiosClient.get('/inventory')

export const getInventoryItems = () => axiosClient.get('/inventory/items')

export const getInventoryStockChanges = () => axiosClient.get('/inventory/changes')

export const createInventoryItem = (data) => axiosClient.post('/inventory', data)

export const updateInventoryItem = (id, data) => axiosClient.put(`/inventory/${id}`, data)

export const deleteInventoryItem = (id) => axiosClient.delete(`/inventory/${id}`)
