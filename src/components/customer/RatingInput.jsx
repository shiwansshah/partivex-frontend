function RatingInput({ value, onChange, disabled = false }) {
  return (
    <div className="rating-control" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          className={`rating-button ${Number(value) === rating ? 'is-active' : ''}`}
          aria-pressed={Number(value) === rating}
          disabled={disabled}
          onClick={() => onChange(rating)}
        >
          {rating}
        </button>
      ))}
    </div>
  )
}

export default RatingInput
