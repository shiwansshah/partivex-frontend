function PortalWorkflowSteps({ steps, ariaLabel }) {
  const currentIndex = steps.findIndex((step) => step.current)
  const completedCount = steps.filter((step) => step.completed).length
  const activeIndex = currentIndex >= 0 ? currentIndex : Math.min(completedCount, steps.length - 1)
  const progressPercent = Math.round(((activeIndex + 1) / steps.length) * 100)
  const activeStep = steps[activeIndex] || steps[0]

  return (
    <div className="workflow-progress" aria-label={ariaLabel}>
      <div className="workflow-progress-meta" aria-hidden="true">
        <span>Step {activeIndex + 1}/{steps.length} - {activeStep?.label}</span>
        <span>{progressPercent}%</span>
      </div>
      <ol className="workflow-steps" style={{ '--workflow-step-count': steps.length }}>
        {steps.map((step, index) => (
          <li
            key={step.label}
            className={`${index <= activeIndex ? 'is-complete' : ''} ${index === activeIndex ? 'is-current' : ''}`.trim()}
          >
            <span className="workflow-step-index">{index + 1}</span>
            <span className="workflow-step-label">{step.label}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default PortalWorkflowSteps
