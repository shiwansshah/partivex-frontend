import axiosClient from './axiosClient'

export const getInventoryMonitoring = () => axiosClient.get('/inventory')

export const getInventoryItems = () => axiosClient.get('/inventory/items')

export const getInventoryStockChanges = () => axiosClient.get('/inventory/changes')

export const addInventoryStock = (data) => axiosClient.post('/inventory/stock', data)
