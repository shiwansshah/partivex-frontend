function PortalWorkflowSteps({ steps, ariaLabel }) {
  const completedCount = steps.filter((step) => step.completed).length
  const explicitCurrentIndex = steps.findIndex((step) => step.current)
  const firstIncompleteIndex = steps.findIndex((step) => !step.completed)
  const activeIndex = explicitCurrentIndex >= 0
    ? explicitCurrentIndex
    : firstIncompleteIndex >= 0
      ? firstIncompleteIndex
      : steps.length - 1
  const progressPercent = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0
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
            className={`${step.completed ? 'is-complete' : ''} ${index === activeIndex ? 'is-current' : ''}`.trim()}
            aria-current={index === activeIndex ? 'step' : undefined}
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
