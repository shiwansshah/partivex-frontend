function StatusMessage({ type = 'loading', message, className = '' }) {
  if (type === 'error') {
    return (
      <div className={`customer-form-alert ${className}`.trim()}>
        {message}
      </div>
    )
  }

  if (type === 'loading') {
    return (
      <div className={`loading-state ${className}`.trim()}>
        <div className="loading-spinner" />
        {message}
      </div>
    )
  }

  // empty
  return (
    <div className={`customer-empty ${className}`.trim()}>
      {message}
    </div>
  )
}

export default StatusMessage
