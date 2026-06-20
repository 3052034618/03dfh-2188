import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Tag from '@/components/Tag';
import type { Trip } from '@/types';
import { formatDate } from '@/utils';
import styles from './index.module.scss';

interface InvitationCardProps {
  trip: Trip;
  variant?: 'normal' | 'compact';
}

const InvitationCard: React.FC<InvitationCardProps> = ({ trip, variant = 'normal' }) => {
  const confirmedCount = trip.players.filter(p => p.status === 'confirmed').length;
  const selectedSlot = trip.selectedSlot || trip.timeSlots[0];

  const getTagType = (tag: string): 'horror' | 'emotion' | 'mechanism' | 'default' => {
    if (tag === '恐怖') return 'horror';
    if (tag === '情感' || tag === '欢乐') return 'emotion';
    if (tag === '机制' || tag === '阵营' || tag === '推理') return 'mechanism';
    return 'default';
  };

  if (variant === 'compact') {
    return (
      <View className={styles.compactCard}>
        <View className={styles.compactHeader}>
          <Text className={styles.compactTitle}>{trip.scriptName}</Text>
          <View className={styles.compactTags}>
            {trip.tags.slice(0, 2).map(tag => (
              <Tag key={tag} text={tag} type={getTagType(tag)} size="sm" />
            ))}
          </View>
        </View>
        <View className={styles.compactInfo}>
          <Text className={styles.compactLocation}>{trip.district} · {trip.location.slice(0, 12)}...</Text>
          <View className={styles.compactFooter}>
            <Text className={styles.compactTime}>
              {selectedSlot ? `${formatDate(selectedSlot.date)} ${selectedSlot.startTime}` : '多时段可选'}
            </Text>
            <Text className={styles.compactSeats}>
              剩{trip.availableSeats}座
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.card}>
      <View className={styles.header}>
        <View className={styles.titleRow}>
          <Text className={styles.title}>{trip.scriptName}</Text>
          {trip.newbieFriendly && (
            <Tag text="新手友好" type="newbie" size="sm" />
          )}
        </View>
        <View className={styles.tagsRow}>
          {trip.tags.map(tag => (
            <Tag key={tag} text={tag} type={getTagType(tag)} size="sm" />
          ))}
        </View>
      </View>

      <View className={styles.divider} />

      <View className={styles.infoSection}>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>📍 地点</Text>
          <Text className={styles.infoValue}>{trip.city} {trip.district}</Text>
          <Text className={styles.infoSub}>{trip.location}</Text>
        </View>

        <View className={styles.infoRow}>
          <View className={styles.infoItemHalf}>
            <Text className={styles.infoLabel}>⏰ 时长</Text>
            <Text className={styles.infoValue}>{trip.duration}</Text>
          </View>
          <View className={styles.infoItemHalf}>
            <Text className={styles.infoLabel}>👥 人数</Text>
            <Text className={styles.infoValue}>{trip.totalSeats}人本</Text>
          </View>
        </View>

        <View className={styles.timeSlotContainer}>
          <Text className={styles.infoLabel}>📅 可约场次</Text>
          <View className={styles.timeSlots}>
            {trip.timeSlots.map((slot, index) => (
              <View
                key={index}
                className={styles.timeSlot}
              >
                <Text className={styles.timeSlotDate}>{formatDate(slot.date)}</Text>
                <Text className={styles.timeSlotTime}>{slot.startTime} - {slot.endTime}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.divider} />

      <View className={styles.footer}>
        <View className={styles.priceSection}>
          <Text className={styles.priceLabel}>车费</Text>
          <Text className={styles.price}>¥{trip.price}</Text>
          <Text className={styles.priceUnit}>/人</Text>
        </View>
        <View className={styles.seatsSection}>
          <Text className={styles.seatsText}>
            已确认 <Text className={styles.seatsNum}>{confirmedCount}</Text>/{trip.totalSeats}人
          </Text>
          <View className={styles.seatsProgress}>
            <View
              className={styles.seatsProgressBar}
              style={{ width: `${(confirmedCount / trip.totalSeats) * 100}%` }}
            />
          </View>
        </View>
      </View>

      <View className={styles.dmSection}>
        <Image
          className={styles.dmAvatar}
          src={trip.dm.avatar}
          mode="aspectFill"
        />
        <View className={styles.dmInfo}>
          <Text className={styles.dmName}>{trip.dm.name}</Text>
          <View className={styles.dmStats}>
            <Text className={styles.dmRating}>★ {trip.dm.rating}</Text>
            <Text className={styles.dmTrips}>带本 {trip.dm.totalTrips} 场</Text>
          </View>
        </View>
        <View className={styles.shareCode}>
          <Text className={styles.shareCodeLabel}>邀约码</Text>
          <Text className={styles.shareCodeValue}>{trip.shareCode}</Text>
        </View>
      </View>
    </View>
  );
};

export default InvitationCard;
