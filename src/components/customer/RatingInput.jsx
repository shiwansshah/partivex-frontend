function RatingInput({ value, onChange, disabled = false }) {
  return (
    <div className="rating-control" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          className={`rating-button ${Number(value) >= rating ? 'is-active' : ''}`}
          role="radio"
          aria-checked={Number(value) === rating}
          aria-label={`${rating} out of 5`}
          disabled={disabled}
          onClick={() => onChange(rating)}
        >
          <span aria-hidden="true">★</span>
        </button>
      ))}
    </div>
  )
}

export default RatingInput
