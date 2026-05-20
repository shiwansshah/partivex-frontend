import axiosClient from './axiosClient'

export const getFinancialReport = ({ period, referenceDate }) =>
  axiosClient.get('/api/financial-reports', {
    params: { period, referenceDate },
  })
