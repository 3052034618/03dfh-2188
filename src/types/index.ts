export type ScriptTag = '恐怖' | '情感' | '机制' | '推理' | '欢乐' | '阵营';

export type PlayerStatus = 'pending' | 'confirmed' | 'waitlist' | 'rejected';

export type NotificationType = 'reminder' | 'notes' | 'policy';

export interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
}

export interface DMInfo {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  totalTrips: number;
  tags: string[];
  bio: string;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  gender: 'male' | 'female';
  rolePreference: string;
  carpool: boolean;
  crossDress: boolean;
  status: PlayerStatus;
  applyTime: string;
  note?: string;
}

export interface NotificationRecord {
  id: string;
  type: NotificationType;
  typeName: string;
  content: string;
  sentAt: string;
  recipientCount: number;
  recipients: string[];
}

export interface Trip {
  id: string;
  scriptName: string;
  city: string;
  district: string;
  location: string;
  totalSeats: number;
  availableSeats: number;
  duration: string;
  tags: ScriptTag[];
  newbieFriendly: boolean;
  timeSlots: TimeSlot[];
  selectedSlot?: TimeSlot;
  price: number;
  feeNote: string;
  suitableFor: string;
  notes: string;
  latePolicy: string;
  dm: DMInfo;
  players: Player[];
  notifications: NotificationRecord[];
  status: 'recruiting' | 'full' | 'ongoing' | 'finished';
  createdAt: string;
  shareCode: string;
}

export interface CreateTripForm {
  scriptName: string;
  city: string;
  district: string;
  location: string;
  totalSeats: number;
  duration: string;
  tags: ScriptTag[];
  newbieFriendly: boolean;
  timeSlots: TimeSlot[];
  price: number;
  feeNote: string;
  suitableFor: string;
  notes: string;
  latePolicy: string;
}

export interface ApplyForm {
  name: string;
  gender: 'male' | 'female';
  rolePreference: string;
  carpool: boolean;
  crossDress: boolean;
  note: string;
}
