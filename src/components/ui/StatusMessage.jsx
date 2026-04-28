function StatusMessage({ type = 'loading', message, className = '' }) {
  if (type === 'error') {
    return (
      <div className={`customer-form-alert ${className}`.trim()}>
        {message}
      </div>
    )
  }

  // loading or empty
  const stateClass = type === 'loading' ? 'customer-loading' : 'customer-empty'
  return (
    <div className={`${stateClass} ${className}`.trim()}>
      {message}
    </div>
  )
}

export default StatusMessage
