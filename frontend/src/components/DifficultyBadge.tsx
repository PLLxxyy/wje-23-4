import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/utils/format'

interface DifficultyBadgeProps {
  difficulty: string
}

export default function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${DIFFICULTY_COLORS[difficulty] || 'bg-gray-100 text-gray-600'}`}>
      {DIFFICULTY_LABELS[difficulty] || difficulty}
    </span>
  )
}
