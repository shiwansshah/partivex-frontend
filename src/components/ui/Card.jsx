function Card({ children, variant = 'default', className = '', ...props }) {
  const baseClass = variant === 'customer' ? 'customer-card' : 'card'
  return (
    <div className={`${baseClass} ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}

export default Card
