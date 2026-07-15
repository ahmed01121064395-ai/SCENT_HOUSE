export const getStatusBadgeStyle = (status: string): string => {
  switch (status) {
    case 'جديد':
      return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
    case 'قيد التجهيز':
      return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    case 'تم الشحن':
      return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
    case 'تم التسليم':
      return 'bg-green-500/10 text-green-400 border border-green-500/20';
    case 'ملغي':
      return 'bg-red-500/10 text-red-400 border border-red-500/20';
    case 'سلة المهملات':
      return 'bg-red-950/40 text-red-400 border border-red-800/40';
    default:
      return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
  }
};
