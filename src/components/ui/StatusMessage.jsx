function StatusMessage({ type = 'loading', message, className = '' }) {
  if (type === 'error') {
    return (
      <div className={`customer-form-alert ${className}`.trim()} role="alert">
        {message}
      </div>
    )
  }

  // loading or empty
  const stateClass = type === 'loading' ? 'customer-loading' : 'customer-empty'
  return (
    <div className={`${stateClass} ${className}`.trim()} aria-live={type === 'loading' ? 'polite' : undefined}>
      {message}
    </div>
  )
}

export default StatusMessage
