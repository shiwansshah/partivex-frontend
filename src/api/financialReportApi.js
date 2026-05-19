import axiosClient from './axiosClient'

export const getFinancialReport = ({ period, referenceDate }) =>
  axiosClient.get('/financial-reports', {
    params: { period, referenceDate },
  })
