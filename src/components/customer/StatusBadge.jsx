function normalizeStatus(status) {
  return String(status || 'unknown').trim().toLowerCase()
}

function StatusBadge({ status }) {
  return (
    <span className={`portal-status-badge is-${normalizeStatus(status)}`}>
      {status || 'Unknown'}
    </span>
  )
}

export default StatusBadge
