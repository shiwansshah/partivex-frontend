export const STAFF_FEATURES = [
  {
    key: 'CustomerManagement',
    label: 'Customer Management',
    path: '/staff/customers',
  },
  {
    key: 'Vehicles',
    label: 'Vehicles',
    path: '/staff/vehicles',
  },
  {
    key: 'CustomerReports',
    label: 'Customer Reports',
    path: '/staff/customers/reports',
  },
  {
    key: 'PartRequestApprovals',
    label: 'Part Request Approvals',
    path: '/staff/part-requests',
  },
  {
    key: 'CustomerPartInvoices',
    label: 'Customer Part Invoices',
    path: '/staff/customer-part-invoices',
  },
  {
    key: 'AppointmentInvoices',
    label: 'Appointment Invoices',
    path: '/staff/appointment-invoices',
  },
]

export function getFirstEnabledStaffFeature(features = []) {
  const enabledKeys = new Set(
    features.filter((feature) => feature.isEnabled).map((feature) => feature.featureKey),
  )

  return STAFF_FEATURES.find((feature) => enabledKeys.has(feature.key))
}
