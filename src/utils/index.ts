import type { Trip } from '@/types';

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '日期待定';

  let date: Date;

  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    date = new Date(dateStr);
  } else if (/(\d{1,2})月(\d{1,2})日/.test(dateStr)) {
    const match = dateStr.match(/(\d{1,2})月(\d{1,2})日/);
    if (match) {
      const month = parseInt(match[1], 10);
      const day = parseInt(match[2], 10);
      const now = new Date();
      let year = now.getFullYear();
      if (month < now.getMonth() + 1) {
        year++;
      }
      date = new Date(year, month - 1, day);
    } else {
      return dateStr;
    }
  } else {
    const parsedDate = new Date(dateStr);
    if (isNaN(parsedDate.getTime())) {
      return dateStr;
    }
    date = parsedDate;
  }

  if (isNaN(date.getTime())) {
    return dateStr;
  }

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekDay = weekDays[date.getDay()];
  return `${month}月${day}日 ${weekDay}`;
};

export const formatTime = (time: string): string => {
  return time || '';
};

export const formatDateTime = (dateStr: string, timeStr: string): string => {
  const datePart = formatDate(dateStr);
  if (!timeStr) return datePart;
  return `${datePart} ${timeStr}`;
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
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

export const generateShareContent = (
  trip: Trip,
  channel: 'moments' | 'group' | 'plaza'
): { title: string; content: string; image?: string } => {
  const slot = trip.selectedSlot || trip.timeSlots[0];
  const timeText = slot
    ? `${formatDate(slot.date)} ${slot.startTime}`
    : '多时段可选';
  const tagsText = trip.tags.join(' · ');
  const newbieText = trip.newbieFriendly ? '  |  新手友好' : '';
  const confirmedCount = trip.players.filter(p => p.status === 'confirmed').length;

  if (channel === 'moments') {
    return {
      title: `${trip.scriptName} - ${tagsText}`,
      content: `🎭 ${trip.scriptName}\n\n📍 ${trip.city} ${trip.district}\n   ${trip.location}\n\n📅 ${timeText}\n⏱️ ${trip.duration}\n🏷️ ${tagsText}${newbieText}\n\n👥 已确认 ${confirmedCount}/${trip.totalSeats} 人\n💰 ¥${trip.price}/人\n\n${trip.feeNote}\n\n✨ 邀约码：${trip.shareCode}\n快来一起玩剧本杀！`
    };
  }

  if (channel === 'group') {
    return {
      title: `【发车】${trip.scriptName}`,
      content: `📢 DM发车啦！\n\n🎭 剧本：${trip.scriptName}\n📍 地点：${trip.city} ${trip.district} - ${trip.location}\n📅 时间：${timeText}\n⏱️ 时长：${trip.duration}\n🏷️ 类型：${tagsText}${newbieText}\n👥 人数：${confirmedCount}/${trip.totalSeats} 人\n💰 车费：¥${trip.price}/人\n\n${trip.suitableFor}\n\n📝 ${trip.notes}\n\n邀约码：${trip.shareCode}\n有兴趣的小伙伴快来报名！`
    };
  }

  return {
    title: trip.scriptName,
    content: `【${trip.scriptName}】\n\n📌 ${trip.city} ${trip.district}\n🕐 ${timeText}\n🎭 ${tagsText}${newbieText}\n👥 ${confirmedCount}/${trip.totalSeats}人\n💰 ¥${trip.price}/人\n\n${trip.feeNote}\n\n${trip.suitableFor}\n\n💡 DM：${trip.dm.name}\n⭐ 评分 ${trip.dm.rating} · 带本${trip.dm.totalTrips}场\n\n邀约码：${trip.shareCode}`
  };
};

export const getNotificationTypeName = (type: string): string => {
  const map: Record<string, string> = {
    reminder: '集合提醒',
    notes: '开本注意事项',
    policy: '迟到处理规则'
  };
  return map[type] || type;
};

export const getNowTimeString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};
