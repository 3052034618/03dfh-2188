import React from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import Tag from '@/components/Tag';
import { mockDM, mockReviews } from '@/data/mock';
import { useTripStore } from '@/store/tripStore';
import styles from './index.module.scss';

const ProfilePage: React.FC = () => {
  const { trips } = useTripStore();

  const stats = {
    totalTrips: trips.length + mockDM.totalTrips,
    totalPlayers: trips.reduce((sum, t) =>
      sum + t.players.filter(p => p.status === 'confirmed').length, 0),
    rating: mockDM.rating
  };

  const menuItems = [
    {
      icon: '📝',
      iconClass: 'purple',
      title: '我的剧本库',
      desc: '管理常用剧本信息',
      action: () => Taro.showToast({ title: '功能开发中', icon: 'none' })
    },
    {
      icon: '⏰',
      iconClass: 'orange',
      title: '排班管理',
      desc: '设置可接单时间',
      action: () => Taro.showToast({ title: '功能开发中', icon: 'none' })
    },
    {
      icon: '💰',
      iconClass: 'green',
      title: '收入统计',
      desc: '查看带本收入明细',
      action: () => Taro.showToast({ title: '功能开发中', icon: 'none' })
    },
    {
      icon: '⚙️',
      iconClass: 'blue',
      title: '设置',
      desc: '账号与偏好设置',
      action: () => Taro.showToast({ title: '功能开发中', icon: 'none' })
    }
  ];

  const renderStars = (rating: number) => {
    return '★'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '☆' : '');
  };

  return (
    <ScrollView className={styles.page} scrollY>
      {/* 顶部个人信息 */}
      <View className={styles.header}>
        <View className={styles.profileCard}>
          <Image
            className={styles.avatar}
            src={mockDM.avatar}
            mode="aspectFill"
          />
          <View className={styles.profileInfo}>
            <Text className={styles.dmName}>{mockDM.name}</Text>
            <Text className={styles.dmBio}>{mockDM.bio}</Text>
            <View className={styles.ratingRow}>
              <Text className={styles.ratingStar}>{renderStars(stats.rating)}</Text>
              <Text className={styles.ratingNum}>{stats.rating}</Text>
              <Text className={styles.ratingText}>分</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 数据统计卡片 */}
      <View className={styles.statsCard}>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{stats.totalTrips}</Text>
          <Text className={styles.statLabel}>累计带本</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{stats.totalPlayers}</Text>
          <Text className={styles.statLabel}>服务玩家</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{stats.rating}</Text>
          <Text className={styles.statLabel}>综合评分</Text>
        </View>
      </View>

      {/* 擅长标签 */}
      <View className={styles.tagsSection}>
        <Text className={styles.sectionTitle}>擅长题材</Text>
        <View className={styles.tagsRow}>
          {mockDM.tags.map((tag, index) => (
            <Tag
              key={index}
              text={tag}
              type={index === 0 ? 'horror' : index === 1 ? 'emotion' : 'mechanism'}
            />
          ))}
        </View>
      </View>

      {/* 功能菜单 */}
      <View className={styles.menuSection}>
        <View className={styles.menuCard}>
          {menuItems.map((item, index) => (
            <View
              key={index}
              className={styles.menuItem}
              onClick={item.action}
            >
              <View className={`${styles.menuIcon} ${styles[item.iconClass]}`}>
                {item.icon}
              </View>
              <View className={styles.menuContent}>
                <Text className={styles.menuTitle}>{item.title}</Text>
                <Text className={styles.menuDesc}>{item.desc}</Text>
              </View>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 玩家评价 */}
      <View className={styles.reviewsSection}>
        <Text className={styles.sectionTitle}>玩家评价</Text>
        {mockReviews.map(review => (
          <View key={review.id} className={styles.reviewCard}>
            <View className={styles.reviewHeader}>
              <Image
                className={styles.reviewAvatar}
                src={review.playerAvatar}
                mode="aspectFill"
              />
              <View className={styles.reviewInfo}>
                <Text className={styles.reviewName}>{review.playerName}</Text>
                <Text className={styles.reviewMeta}>{review.date}</Text>
              </View>
              <Text className={styles.reviewRating}>
                {renderStars(review.rating)}
              </Text>
            </View>
            <Text className={styles.reviewContent}>{review.content}</Text>
            <Text className={styles.reviewScript}>{review.scriptName}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default ProfilePage;
