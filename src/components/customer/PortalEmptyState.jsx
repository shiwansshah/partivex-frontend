function PortalEmptyState({
  imageSrc,
  imageAlt,
  title,
  message,
  action,
  compact = false,
}) {
  return (
    <div className={`customer-empty-panel ${compact ? 'compact' : ''}`.trim()}>
      {imageSrc && <img src={imageSrc} alt={imageAlt || ''} />}
      <div>
        <h3>{title}</h3>
        {message && <p>{message}</p>}
        {action}
      </div>
    </div>
  )
}

export default PortalEmptyState
