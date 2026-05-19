import axiosClient from './axiosClient'

export const getParts = () => axiosClient.get('/parts')

export const getPartById = (id) => axiosClient.get(`/parts/${id}`)

export const createPart = (partData) => axiosClient.post('/parts', partData, {
  headers: { 'Content-Type': 'multipart/form-data' },
})

export const updatePart = (id, partData) => axiosClient.put(`/parts/${id}`, partData, {
  headers: { 'Content-Type': 'multipart/form-data' },
})

export const deletePart = (id) => axiosClient.delete(`/parts/${id}`)
