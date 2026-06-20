import type { Trip, DMInfo, Player } from '@/types';

export const mockDM: DMInfo = {
  id: 'dm001',
  name: 'DM 暗夜',
  avatar: 'https://picsum.photos/id/177/200/200',
  rating: 4.9,
  totalTrips: 128,
  tags: ['恐怖本专业', '情感沉浸', '机制控场'],
  bio: '5年剧本杀DM经验，擅长恐怖本氛围营造和情感本沉浸演绎。带本风格严谨，细节控，致力于给每位玩家带来最佳游戏体验。'
};

export const mockPlayers: Player[] = [
  {
    id: 'p001',
    name: '小林同学',
    avatar: 'https://picsum.photos/id/64/200/200',
    gender: 'female',
    rolePreference: '情感线角色',
    carpool: false,
    crossDress: false,
    status: 'confirmed',
    applyTime: '2024-01-15 10:30'
  },
  {
    id: 'p002',
    name: '剧本杀手',
    avatar: 'https://picsum.photos/id/91/200/200',
    gender: 'male',
    rolePreference: '硬核推理位',
    carpool: true,
    crossDress: true,
    status: 'confirmed',
    applyTime: '2024-01-15 11:20'
  },
  {
    id: 'p003',
    name: '萌新玩家',
    avatar: 'https://picsum.photos/id/338/200/200',
    gender: 'female',
    rolePreference: '简单角色',
    carpool: false,
    crossDress: false,
    status: 'pending',
    applyTime: '2024-01-15 14:05',
    note: '第一次玩，求带飞～'
  },
  {
    id: 'p004',
    name: '推理达人',
    avatar: 'https://picsum.photos/id/1027/200/200',
    gender: 'male',
    rolePreference: '凶手位',
    carpool: true,
    crossDress: false,
    status: 'pending',
    applyTime: '2024-01-15 15:30'
  },
  {
    id: 'p005',
    name: '胆小鬼',
    avatar: 'https://picsum.photos/id/237/200/200',
    gender: 'female',
    rolePreference: '边缘角色',
    carpool: false,
    crossDress: true,
    status: 'waitlist',
    applyTime: '2024-01-15 16:00',
    note: '胆子小，但想尝试恐怖本'
  }
];

export const mockTrips: Trip[] = [
  {
    id: 't001',
    scriptName: '《午夜铃响》',
    city: '上海',
    district: '静安区',
    location: '推理之门剧本杀馆（南京西路店）',
    totalSeats: 6,
    availableSeats: 2,
    duration: '4.5小时',
    tags: ['恐怖', '推理'],
    newbieFriendly: false,
    timeSlots: [
      { date: '2024-01-20', startTime: '14:00', endTime: '18:30' },
      { date: '2024-01-20', startTime: '19:00', endTime: '23:30' },
      { date: '2024-01-21', startTime: '13:00', endTime: '17:30' }
    ],
    selectedSlot: { date: '2024-01-20', startTime: '19:00', endTime: '23:30' },
    price: 128,
    feeNote: '包含剧本费+DM费+茶水小吃，到店另付30元押金',
    suitableFor: '喜欢恐怖题材、追求刺激的玩家；不建议胆子过小或心脏病玩家参与',
    notes: '本场为微恐+推理本，有单人搜证环节，胆小者慎入。建议提前15分钟到店，请勿迟到。',
    latePolicy: '迟到15分钟内正常开本，超过15分钟押金不退；迟到30分钟以上取消名额且不退费。',
    dm: mockDM,
    players: mockPlayers.slice(0, 4),
    status: 'recruiting',
    createdAt: '2024-01-15 09:00',
    shareCode: 'DM2024'
  },
  {
    id: 't002',
    scriptName: '《春日情书》',
    city: '上海',
    district: '徐汇区',
    location: '时光剧场（衡山路店）',
    totalSeats: 6,
    availableSeats: 6,
    duration: '5小时',
    tags: ['情感', '欢乐'],
    newbieFriendly: true,
    timeSlots: [
      { date: '2024-01-22', startTime: '14:00', endTime: '19:00' },
      { date: '2024-01-23', startTime: '18:00', endTime: '23:00' }
    ],
    price: 158,
    feeNote: '城限情感本，包含换装+道具+精美下午茶',
    suitableFor: '情侣、闺蜜、喜欢情感沉浸的玩家，新手友好',
    notes: '本场为城限情感本，有换装环节，建议女生穿方便换衣服的内搭。',
    latePolicy: '情感本迟到会影响沉浸体验，请务必准时到达。迟到20分钟以上取消名额。',
    dm: mockDM,
    players: [],
    status: 'recruiting',
    createdAt: '2024-01-16 10:00',
    shareCode: 'SPRING'
  },
  {
    id: 't003',
    scriptName: '《权力的游戏》',
    city: '上海',
    district: '黄浦区',
    location: '局中局推理社（人民广场店）',
    totalSeats: 8,
    availableSeats: 0,
    duration: '6小时',
    tags: ['机制', '阵营'],
    newbieFriendly: false,
    timeSlots: [
      { date: '2024-01-18', startTime: '13:00', endTime: '19:00' }
    ],
    selectedSlot: { date: '2024-01-18', startTime: '13:00', endTime: '19:00' },
    price: 198,
    feeNote: '独家机制本，包含午餐+全天茶水',
    suitableFor: '喜欢策略博弈、阵营对抗的进阶玩家',
    notes: '大型机制阵营本，时长较长，请合理安排时间。可自带零食。',
    latePolicy: '机制本全员到齐才能开始，请务必准时。迟到影响全车体验需补偿。',
    dm: mockDM,
    players: [
      ...mockPlayers,
      {
        id: 'p006',
        name: '策略王',
        avatar: 'https://picsum.photos/id/119/200/200',
        gender: 'male',
        rolePreference: '强力角色',
        carpool: false,
        crossDress: false,
        status: 'confirmed',
        applyTime: '2024-01-14 20:00'
      },
      {
        id: 'p007',
        name: '小狐狸',
        avatar: 'https://picsum.photos/id/1025/200/200',
        gender: 'female',
        rolePreference: '中立角色',
        carpool: true,
        crossDress: false,
        status: 'confirmed',
        applyTime: '2024-01-14 21:30'
      },
      {
        id: 'p008',
        name: '酱油君',
        avatar: 'https://picsum.photos/id/237/200/200',
        gender: 'male',
        rolePreference: '都行',
        carpool: false,
        crossDress: true,
        status: 'confirmed',
        applyTime: '2024-01-15 08:00'
      }
    ],
    status: 'full',
    createdAt: '2024-01-14 18:00',
    shareCode: 'GAME2024'
  }
];

export const mockReviews = [
  {
    id: 'r001',
    playerName: '小林同学',
    playerAvatar: 'https://picsum.photos/id/64/200/200',
    rating: 5,
    content: 'DM太专业了！恐怖氛围拉满，全程沉浸感超强。下次还来！',
    scriptName: '《午夜铃响》',
    date: '2024-01-10'
  },
  {
    id: 'r002',
    playerName: '剧本杀手',
    playerAvatar: 'https://picsum.photos/id/91/200/200',
    rating: 5,
    content: '机制本控场能力一流，节奏把握得刚刚好，体验满分！',
    scriptName: '《权力的游戏》',
    date: '2024-01-05'
  },
  {
    id: 'r003',
    playerName: '萌新玩家',
    playerAvatar: 'https://picsum.photos/id/338/200/200',
    rating: 4,
    content: '第一次玩剧本杀，DM很有耐心，讲解很清楚，体验很棒～',
    scriptName: '《春日情书》',
    date: '2024-01-01'
  }
];
