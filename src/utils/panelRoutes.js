export function getPanelBasePath(pathname = '') {
  if (pathname.startsWith('/admin')) return '/admin'
  if (pathname.startsWith('/staff')) return '/staff'

  return ''
}

export function buildPanelPath(pathname, suffix = '') {
  const basePath = getPanelBasePath(pathname)

  return `${basePath}${suffix}` || suffix || '/'
}
