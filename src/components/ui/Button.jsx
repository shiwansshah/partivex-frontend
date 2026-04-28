function Button({ children, type = 'button', variant = 'primary', className = '', ...props }) {
  const variantClass = variant !== 'primary' ? `button-${variant}` : ''
  return (
    <button type={type} className={`button ${variantClass} ${className}`.trim()} {...props}>
      {children}
    </button>
  )
}

export default Button
