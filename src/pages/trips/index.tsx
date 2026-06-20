import React, { useState, useMemo } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import Tag from '@/components/Tag';
import { useTripStore } from '@/store/tripStore';
import { formatDate, getTagColor } from '@/utils';
import type { Trip } from '@/types';
import styles from './index.module.scss';

type TabType = 'all' | 'recruiting' | 'full' | 'finished';

const TripsPage: React.FC = () => {
  const { trips } = useTripStore();
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'recruiting', label: '招募中' },
    { key: 'full', label: '已满员' },
    { key: 'finished', label: '已结束' }
  ];

  const filteredTrips = useMemo(() => {
    if (activeTab === 'all') return trips;
    return trips.filter(trip => trip.status === activeTab);
  }, [trips, activeTab]);

  const stats = useMemo(() => ({
    total: trips.length,
    recruiting: trips.filter(t => t.status === 'recruiting').length,
    confirmed: trips.reduce((sum, t) =>
      sum + t.players.filter(p => p.status === 'confirmed').length, 0)
  }), [trips]);

  const getStatusClass = (status: string) => {
    const map: Record<string, string> = {
      recruiting: styles.recruiting,
      full: styles.full,
      ongoing: styles.ongoing,
      finished: styles.finished
    };
    return map[status] || '';
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      recruiting: '招募中',
      full: '已满员',
      ongoing: '进行中',
      finished: '已结束'
    };
    return map[status] || status;
  };

  const handleTripClick = (trip: Trip) => {
    Taro.navigateTo({
      url: `/pages/detail/index?id=${trip.id}`
    });
  };

  const handleManage = (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation();
    Taro.navigateTo({
      url: `/pages/manage/index?id=${tripId}`
    });
  };

  const handleGoCreate = () => {
    Taro.switchTab({
      url: '/pages/create/index'
    });
  };

  const handleRefresh = () => {
    console.log('[TripsPage] 下拉刷新');
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 500);
  };

  const getTagType = (tag: string): 'horror' | 'emotion' | 'mechanism' | 'default' => {
    if (tag === '恐怖') return 'horror';
    if (tag === '情感' || tag === '欢乐') return 'emotion';
    if (tag === '机制' || tag === '阵营' || tag === '推理') return 'mechanism';
    return 'default';
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>📋 我的行程</Text>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{stats.total}</Text>
            <Text className={styles.statLabel}>总车次</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{stats.recruiting}</Text>
            <Text className={styles.statLabel}>招募中</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{stats.confirmed}</Text>
            <Text className={styles.statLabel}>已确认玩家</Text>
          </View>
        </View>
      </View>

      <View className={styles.tabBar}>
        {tabs.map(tab => (
          <View
            key={tab.key}
            className={classnames(styles.tabItem, activeTab === tab.key && styles.active)}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </View>
        ))}
      </View>

      <ScrollView
        className={styles.tripList}
        scrollY
        refresherEnabled
        onRefresherRefresh={handleRefresh}
      >
        {filteredTrips.length > 0 ? (
          filteredTrips.map(trip => {
            const confirmedCount = trip.players.filter(p => p.status === 'confirmed').length;
            const selectedSlot = trip.selectedSlot || trip.timeSlots[0];

            return (
              <View
                key={trip.id}
                className={styles.tripCard}
                onClick={() => handleTripClick(trip)}
              >
                <View className={styles.cardHeader}>
                  <Text className={styles.scriptName}>{trip.scriptName}</Text>
                  <View className={classnames(styles.statusBadge, getStatusClass(trip.status))}>
                    {getStatusText(trip.status)}
                  </View>
                </View>

                <View className={styles.tagsRow}>
                  {trip.tags.map(tag => (
                    <Tag key={tag} text={tag} type={getTagType(tag)} size="sm" />
                  ))}
                  {trip.newbieFriendly && (
                    <Tag text="新手友好" type="newbie" size="sm" />
                  )}
                </View>

                <View className={styles.infoRow}>
                  <Text className={styles.infoIcon}>📍</Text>
                  <Text className={styles.infoText}>
                    {trip.city} {trip.district} · {trip.location}
                  </Text>
                </View>

                <View className={styles.infoRow}>
                  <Text className={styles.infoIcon}>📅</Text>
                  <Text className={styles.infoText}>
                    {selectedSlot
                      ? `${formatDate(selectedSlot.date)} ${selectedSlot.startTime}`
                      : '多时段可选'}
                  </Text>
                </View>

                <View className={styles.infoRow}>
                  <Text className={styles.infoIcon}>⏱️</Text>
                  <Text className={styles.infoText}>{trip.duration}</Text>
                </View>

                <View className={styles.cardFooter}>
                  <View className={styles.seatsInfo}>
                    <Text className={styles.seatsText}>座位</Text>
                    <Text className={styles.seatsNum}>
                      {confirmedCount}/{trip.totalSeats}
                    </Text>
                    <Text className={styles.seatsText}>人</Text>
                  </View>
                  <Button
                    className={styles.manageBtn}
                    onClick={(e) => handleManage(e as any, trip.id)}
                  >
                    候车名单
                  </Button>
                </View>
              </View>
            );
          })
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🎭</Text>
            <Text className={styles.emptyText}>暂无行程，快去发一辆车吧～</Text>
            <Button className={styles.emptyBtn} onClick={handleGoCreate}>
              立即发车
            </Button>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default TripsPage;
