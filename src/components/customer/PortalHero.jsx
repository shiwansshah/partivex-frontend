function PortalHero({
  eyebrow,
  title,
  description,
  imageSrc,
  imageAlt,
  actions,
  meta,
  className = '',
}) {
  return (
    <section className={`portal-hero ${className}`.trim()}>
      <div className="portal-hero-copy">
        {eyebrow && <span className="customer-eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
        {actions && <div className="portal-hero-actions">{actions}</div>}
        {meta && <div className="portal-hero-meta">{meta}</div>}
      </div>
      {imageSrc && (
        <div className="portal-hero-media">
          <img src={imageSrc} alt={imageAlt || ''} />
        </div>
      )}
    </section>
  )
}

export default PortalHero
