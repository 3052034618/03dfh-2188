export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekDay = weekDays[date.getDay()];
  return `${month}月${day}日 ${weekDay}`;
};

export const formatTime = (time: string): string => {
  return time;
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const generateShareCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const getStatusText = (status: string): string => {
  const map: Record<string, string> = {
    recruiting: '招募中',
    full: '已满员',
    ongoing: '进行中',
    finished: '已结束',
    pending: '待确认',
    confirmed: '已确认',
    waitlist: '候补',
    rejected: '已婉拒'
  };
  return map[status] || status;
};

export const getTagColor = (tag: string): { bg: string; text: string } => {
  const colorMap: Record<string, { bg: string; text: string }> = {
    '恐怖': { bg: '#FFECE8', text: '#F53F3F' },
    '情感': { bg: '#FFF3E8', text: '#FF7D00' },
    '机制': { bg: '#E8F3FF', text: '#165DFF' },
    '推理': { bg: '#E8F3FF', text: '#722ED1' },
    '欢乐': { bg: '#FFF7E8', text: '#FF7D00' },
    '阵营': { bg: '#F0F5FF', text: '#165DFF' }
  };
  return colorMap[tag] || { bg: '#F2F3F5', text: '#4E5969' };
};
