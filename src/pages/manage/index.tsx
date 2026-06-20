import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, Button, Textarea, ScrollView } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import Tag from '@/components/Tag';
import { useTripStore } from '@/store/tripStore';
import type { Trip, Player, PlayerStatus, NotificationType } from '@/types';
import { getStatusText, formatDate, generateShareContent, getNotificationTypeName } from '@/utils';
import styles from './index.module.scss';

type TabType = 'all' | 'pending' | 'confirmed' | 'waitlist';

const ManagePage: React.FC = () => {
  const router = useRouter();
  const { getTripById, updatePlayerStatus, sendNotification, refreshTrips } = useTripStore();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyType, setNotifyType] = useState<NotificationType>('reminder');
  const [customMessage, setCustomMessage] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const loadTrip = () => {
    const tripId = router.params.id;
    if (tripId) {
      refreshTrips();
      const foundTrip = getTripById(tripId);
      if (foundTrip) {
        setTrip(foundTrip);
        console.log('[ManagePage] 加载行程:', tripId);
      } else {
        Taro.showToast({ title: '行程不存在', icon: 'none' });
      }
    }
  };

  useEffect(() => {
    loadTrip();
  }, [router.params.id]);

  useDidShow(() => {
    console.log('[ManagePage] 页面显示，刷新数据');
    loadTrip();
  });

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待确认' },
    { key: 'confirmed', label: '已确认' },
    { key: 'waitlist', label: '候补' }
  ];

  const filteredPlayers = useMemo(() => {
    if (!trip) return [];
    if (activeTab === 'all') return trip.players;
    return trip.players.filter(p => p.status === activeTab);
  }, [trip, activeTab]);

  const stats = useMemo(() => {
    if (!trip) return { total: 0, pending: 0, confirmed: 0, waitlist: 0 };
    return {
      total: trip.players.length,
      pending: trip.players.filter(p => p.status === 'pending').length,
      confirmed: trip.players.filter(p => p.status === 'confirmed').length,
      waitlist: trip.players.filter(p => p.status === 'waitlist').length
    };
  }, [trip]);

  const handleUpdateStatus = (playerId: string, status: PlayerStatus) => {
    if (!trip) return;
    const updatedTrip = updatePlayerStatus(trip.id, playerId, status);
    if (updatedTrip) {
      setTrip(updatedTrip);
    }
    const statusText = {
      confirmed: '已确认',
      waitlist: '已设为候补',
      rejected: '已婉拒'
    }[status] || '操作成功';
    Taro.showToast({ title: statusText, icon: 'success' });
  };

  const handleSendNotify = (type: NotificationType) => {
    setNotifyType(type);
    setCustomMessage('');
    setShowNotifyModal(true);
  };

  const handleConfirmSend = () => {
    if (!trip) return;
    const content = customMessage || getDefaultMessage();
    const updatedTrip = sendNotification(trip.id, notifyType, content);
    if (updatedTrip) {
      setTrip(updatedTrip);
    }
    console.log('[ManagePage] 发送通知:', { type: notifyType, content });
    setShowNotifyModal(false);
    setCustomMessage('');
    Taro.showToast({ title: '通知已发送', icon: 'success' });
  };

  const handleShare = () => {
    if (!trip) return;
    const shareData = generateShareContent(trip, 'group');
    Taro.setClipboardData({
      data: shareData.content,
      success: () => {
        Taro.showToast({ title: '邀约文案已复制', icon: 'success' });
      }
    });
  };

  const handleRefresh = () => {
    console.log('[ManagePage] 下拉刷新');
    loadTrip();
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 500);
  };

  const getStatusClass = (status: string) => {
    const map: Record<string, string> = {
      confirmed: styles.confirmed,
      pending: styles.pending,
      waitlist: styles.waitlist,
      rejected: styles.rejected
    };
    return map[status] || '';
  };

  const notifyOptions: { type: NotificationType; icon: string; title: string; desc: string }[] = [
    { type: 'reminder', icon: '📍', title: '集合提醒', desc: '发送集合时间地点提醒' },
    { type: 'notes', icon: '📝', title: '开本前注意事项', desc: '发送开本前的准备事项' },
    { type: 'policy', icon: '⏰', title: '迟到处理规则', desc: '再次强调迟到处理规则' }
  ];

  const getDefaultMessage = () => {
    if (!trip) return '';
    const slot = trip.selectedSlot || trip.timeSlots[0];
    const messages: Record<NotificationType, string> = {
      reminder: `【${trip.scriptName}】集合提醒\n时间：${slot ? formatDate(slot.date) + ' ' + slot.startTime : '待定'}\n地点：${trip.location}\n请提前15分钟到达，不要迟到哦～`,
      notes: `【${trip.scriptName}】开本前注意事项\n${trip.notes}\n有任何问题请随时联系DM～`,
      policy: `【${trip.scriptName}】迟到处理规则\n${trip.latePolicy}\n请大家合理安排时间，准时到达！`
    };
    return messages[notifyType];
  };

  if (!trip) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    );
  }

  const selectedSlot = trip.selectedSlot || trip.timeSlots[0];

  return (
    <View className={styles.page}>
      {/* 顶部信息 */}
      <View className={styles.header}>
        <Text className={styles.scriptName}>{trip.scriptName}</Text>
        <Text className={styles.scriptInfo}>
          {selectedSlot
            ? `${formatDate(selectedSlot.date)} ${selectedSlot.startTime}`
            : '多时段可选'}
        </Text>
        <Text className={styles.scriptInfo}>{trip.location}</Text>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{stats.total}</Text>
            <Text className={styles.statLabel}>总报名</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{stats.confirmed}/{trip.totalSeats}</Text>
            <Text className={styles.statLabel}>已确认</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{stats.pending}</Text>
            <Text className={styles.statLabel}>待确认</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{stats.waitlist}</Text>
            <Text className={styles.statLabel}>候补</Text>
          </View>
        </View>
      </View>

      {/* Tab 切换 */}
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

      {/* 玩家列表 */}
      <ScrollView
        className={styles.playerList}
        scrollY
        refresherEnabled
        onRefresherRefresh={handleRefresh}
      >
        {filteredPlayers.length > 0 ? (
          filteredPlayers.map(player => (
            <View key={player.id} className={styles.playerCard}>
              <View className={styles.playerMain}>
                <Image
                  className={styles.playerAvatar}
                  src={player.avatar}
                  mode="aspectFill"
                />
                <View className={styles.playerInfo}>
                  <View className={styles.playerNameRow}>
                    <Text className={styles.playerName}>{player.name}</Text>
                    <View className={classnames(styles.statusBadge, getStatusClass(player.status))}>
                      {getStatusText(player.status)}
                    </View>
                  </View>
                  <Text className={styles.playerDetail}>
                    {player.gender === 'male' ? '♂' : '♀'} · {player.rolePreference}
                  </Text>
                  <View className={styles.playerTags}>
                    {player.carpool && (
                      <Tag text="可拼车" type="primary" size="sm" />
                    )}
                    {player.crossDress && (
                      <Tag text="可反串" type="default" size="sm" />
                    )}
                  </View>
                  {player.note && (
                    <Text className={styles.playerNote}>"{player.note}"</Text>
                  )}
                  <Text className={styles.applyTime}>申请时间：{player.applyTime}</Text>
                </View>
              </View>

              {player.status === 'pending' && (
                <View className={styles.actionRow}>
                  <Button
                    className={classnames(styles.actionBtn, styles.btnConfirm)}
                    onClick={() => handleUpdateStatus(player.id, 'confirmed')}
                  >
                    确认
                  </Button>
                  <Button
                    className={classnames(styles.actionBtn, styles.btnWaitlist)}
                    onClick={() => handleUpdateStatus(player.id, 'waitlist')}
                  >
                    候补
                  </Button>
                  <Button
                    className={classnames(styles.actionBtn, styles.btnReject)}
                    onClick={() => handleUpdateStatus(player.id, 'rejected')}
                  >
                    婉拒
                  </Button>
                </View>
              )}

              {player.status !== 'pending' && (
                <View className={styles.actionRow}>
                  <Button
                    className={classnames(styles.actionBtn, styles.btnConfirm)}
                    onClick={() => handleUpdateStatus(player.id, 'confirmed')}
                  >
                    设为确认
                  </Button>
                  <Button
                    className={classnames(styles.actionBtn, styles.btnWaitlist)}
                    onClick={() => handleUpdateStatus(player.id, 'waitlist')}
                  >
                    设为候补
                  </Button>
                </View>
              )}
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📭</Text>
            <Text className={styles.emptyText}>暂无玩家报名</Text>
          </View>
        )}
      </ScrollView>

      {/* 底部操作栏 */}
      <View className={styles.bottomBar}>
        <Button
          className={styles.notifyBtn}
          onClick={() => handleSendNotify('reminder')}
        >
          <Text className={styles.notifyBtnIcon}>📢</Text>
          <Text className={styles.notifyBtnText}>发通知</Text>
        </Button>
        <Button
          className={styles.notifyBtn}
          onClick={() => handleSendNotify('notes')}
        >
          <Text className={styles.notifyBtnIcon}>📝</Text>
          <Text className={styles.notifyBtnText}>注意事项</Text>
        </Button>
        <Button
          className={styles.notifyBtn}
          onClick={() => setShowNotifications(true)}
        >
          <Text className={styles.notifyBtnIcon}>📋</Text>
          <Text className={styles.notifyBtnText}>通知记录</Text>
        </Button>
        <Button
          className={styles.shareBtn}
          onClick={handleShare}
        >
          分享邀约
        </Button>
      </View>

      {/* 通知弹窗 */}
      {showNotifyModal && (
        <View className={styles.notifyModal} onClick={() => setShowNotifyModal(false)}>
          <View className={styles.notifyContent} onClick={e => e.stopPropagation()}>
            <View className={styles.notifyHeader}>
              <Text className={styles.notifyTitle}>发送通知</Text>
              <View className={styles.notifyClose} onClick={() => setShowNotifyModal(false)}>
                ×
              </View>
            </View>

            <View className={styles.notifyOptions}>
              {notifyOptions.map(option => (
                <View
                  key={option.type}
                  className={classnames(styles.notifyOption, notifyType === option.type && styles.active)}
                  onClick={() => setNotifyType(option.type)}
                >
                  <Text className={styles.notifyOptionIcon}>{option.icon}</Text>
                  <View className={styles.notifyOptionInfo}>
                    <Text className={styles.notifyOptionTitle}>{option.title}</Text>
                    <Text className={styles.notifyOptionDesc}>{option.desc}</Text>
                  </View>
                  <View className={classnames(styles.notifyOptionCheck, notifyType === option.type && styles.active)}>
                    {notifyType === option.type ? '✓' : ''}
                  </View>
                </View>
              ))}
            </View>

            <Textarea
              className={styles.notifyTextarea}
              placeholder="通知内容（可编辑）"
              value={customMessage || getDefaultMessage()}
              onInput={e => setCustomMessage(e.detail.value)}
              maxlength={500}
              autoHeight
            />

            <Button className={styles.sendBtn} onClick={handleConfirmSend}>
              发送给所有已确认玩家
            </Button>
          </View>
        </View>
      )}

      {/* 通知记录弹窗 */}
      {showNotifications && (
        <View className={styles.notifyModal} onClick={() => setShowNotifications(false)}>
          <View className={styles.notifyContent} onClick={e => e.stopPropagation()}>
            <View className={styles.notifyHeader}>
              <Text className={styles.notifyTitle}>通知记录</Text>
              <View className={styles.notifyClose} onClick={() => setShowNotifications(false)}>
                ×
              </View>
            </View>

            <ScrollView className={styles.notificationList} scrollY>
              {trip && trip.notifications && trip.notifications.length > 0 ? (
                trip.notifications.map(notification => (
                  <View key={notification.id} className={styles.notificationItem}>
                    <View className={styles.notificationItemHeader}>
                      <Text className={styles.notificationType}>
                        {getNotificationTypeName(notification.type)}
                      </Text>
                      <Text className={styles.notificationTime}>{notification.sentAt}</Text>
                    </View>
                    <Text className={styles.notificationContent}>{notification.content}</Text>
                    <View className={styles.notificationFooter}>
                      <Text className={styles.notificationRecipients}>
                        已发送给 {notification.recipientCount} 位玩家
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View className={styles.emptyState}>
                  <Text className={styles.emptyIcon}>📭</Text>
                  <Text className={styles.emptyText}>暂无通知记录</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};

export default ManagePage;
