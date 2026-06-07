export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('zh-CN')
}

export const DIFFICULTY_LABELS: Record<string, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难'
}

export const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700'
}

export const CUISINE_OPTIONS = [
  '川菜', '粤菜', '湘菜', '鲁菜', '苏菜', '浙菜', '闽菜', '徽菜',
  '家常菜', '西餐', '日料', '韩餐', '东南亚', '烘焙', '其他'
]
