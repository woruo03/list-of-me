// 日期时间工具函数

export const formatDate = (dateString: string | null, format: 'short' | 'long' | 'relative' = 'short'): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  switch (format) {
    case 'short':
      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
      });
      
    case 'long':
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      
    case 'relative':
      return getRelativeTime(date);
      
    default:
      return date.toLocaleDateString('zh-CN');
  }
};

const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      if (diffMinutes === 0) return '现在';
      return diffMinutes > 0 ? `${diffMinutes}分钟后` : `${-diffMinutes}分钟前`;
    }
    return diffHours > 0 ? `${diffHours}小时后` : `${-diffHours}小时前`;
  }
  
  return diffDays > 0 ? `${diffDays}天后` : `${-diffDays}天前`;
};

export const isToday = (dateString: string | null): boolean => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  const today = new Date();
  
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const isOverdue = (dateString: string | null): boolean => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  const now = new Date();
  
  return date < now;
};

export const isDueSoon = (dateString: string | null, hoursThreshold = 24): boolean => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  return diffHours > 0 && diffHours <= hoursThreshold;
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}小时`;
  }
  
  return `${hours}小时${remainingMinutes}分钟`;
};

export const getStartOfDay = (date: Date = new Date()): Date => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

export const getEndOfDay = (date: Date = new Date()): Date => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

export const addDays = (date: Date, days: number): Date => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

export const formatTime = (dateString: string | null): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};