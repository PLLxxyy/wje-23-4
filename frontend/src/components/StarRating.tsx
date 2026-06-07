import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  onChange?: (rating: number) => void
  size?: number
}

export default function StarRating({ rating, onChange, size = 20 }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          disabled={!onChange}
          className={onChange ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
        >
          <Star
            size={size}
            className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
          />
        </button>
      ))}
    </div>
  )
}
