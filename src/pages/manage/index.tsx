import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  const { updatePlayerStatus, updatePlayer, sendNotification, refreshTrips } = useTripStore();
  const [trip, setTrip] = useState<Trip | undefined>(undefined);
  const [dataState, setDataState] = useState<'loading' | 'loaded' | 'not_found'>('loading');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyType, setNotifyType] = useState<NotificationType>('reminder');
  const [customMessage, setCustomMessage] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [editNote, setEditNote] = useState('');
  const [editStatus, setEditStatus] = useState<PlayerStatus>('pending');

  const loadTrip = useCallback(() => {
    const tripId = router.params.id;
    if (!tripId) { setDataState('not_found'); return; }
    setDataState('loading');
    const latestTrips = refreshTrips();
    const found = latestTrips.find(t => t.id === tripId);
    if (found) {
      setTrip(found);
      setDataState('loaded');
    } else {
      setTimeout(() => {
        const retryTrips = refreshTrips();
        const retry = retryTrips.find(t => t.id === tripId);
        if (retry) {
          setTrip(retry);
          setDataState('loaded');
        } else {
          setDataState('not_found');
        }
      }, 200);
    }
  }, [router.params.id, refreshTrips]);

  useEffect(() => { loadTrip(); }, [loadTrip]);
  useDidShow(() => { loadTrip(); });

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待确认' },
    { key: 'confirmed', label: '已确认' },
    { key: 'waitlist', label: '候补' }
  ];

  const sortedPlayers = useMemo(() => {
    if (!trip) return [];
    const order: Record<PlayerStatus, number> = { confirmed: 0, pending: 1, waitlist: 2, rejected: 3 };
    return [...trip.players].sort((a, b) => {
      if (a.status !== b.status) return order[a.status] - order[b.status];
      return new Date(a.applyTime).getTime() - new Date(b.applyTime).getTime();
    });
  }, [trip]);

  const filteredPlayers = useMemo(() => {
    if (activeTab === 'all') return sortedPlayers;
    return sortedPlayers.filter(p => p.status === activeTab);
  }, [sortedPlayers, activeTab]);

  const confirmedPlayers = useMemo(() => sortedPlayers.filter(p => p.status === 'confirmed'), [sortedPlayers]);
  const waitlistPlayers = useMemo(() => sortedPlayers.filter(p => p.status === 'waitlist'), [sortedPlayers]);

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
    const updated = updatePlayerStatus(trip.id, playerId, status);
    if (updated) setTrip(updated);
    const label: Record<string, string> = { confirmed: '已确认', waitlist: '已设为候补', rejected: '已婉拒' };
    Taro.showToast({ title: label[status] || '操作成功', icon: 'success' });
  };

  const handleSendNotify = (type: NotificationType) => {
    setNotifyType(type);
    setCustomMessage('');
    setShowNotifyModal(true);
  };

  const handleConfirmSend = () => {
    if (!trip) return;
    const content = customMessage || getDefaultMessage();
    const updated = sendNotification(trip.id, notifyType, content);
    if (updated) setTrip(updated);
    setShowNotifyModal(false);
    setCustomMessage('');
    Taro.showToast({ title: '通知已发送', icon: 'success' });
  };

  const handleShare = () => {
    if (!trip) return;
    const shareData = generateShareContent(trip, 'group');
    Taro.setClipboardData({ data: shareData.content, success: () => Taro.showToast({ title: '邀约文案已复制', icon: 'success' }) });
  };

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
    setEditNote(player.note || '');
    setEditStatus(player.status);
    setShowPlayerModal(true);
  };

  const handleSavePlayer = () => {
    if (!trip || !selectedPlayer) return;
    const updated = updatePlayer(trip.id, selectedPlayer.id, { note: editNote, status: editStatus });
    if (updated) setTrip(updated);
    setShowPlayerModal(false);
    Taro.showToast({ title: '保存成功', icon: 'success' });
  };

  const handleCopyForPlayer = (playerName: string, content: string) => {
    Taro.setClipboardData({
      data: `@${playerName}\n${content}`,
      success: () => Taro.showToast({ title: '已复制可直接发送', icon: 'success' })
    });
  };

  const handleCopyNotification = (content: string) => {
    Taro.setClipboardData({ data: content, success: () => Taro.showToast({ title: '内容已复制', icon: 'success' }) });
  };

  const handleRefresh = () => {
    loadTrip();
    setTimeout(() => Taro.stopPullDownRefresh(), 500);
  };

  const handleGoEdit = () => {
    if (!trip) return;
    Taro.navigateTo({ url: `/pages/create/index?id=${trip.id}&mode=edit` });
  };

  const getStatusClass = (status: string) => {
    const map: Record<string, string> = { confirmed: styles.confirmed, pending: styles.pending, waitlist: styles.waitlist, rejected: styles.rejected };
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

  const selectedSlot = trip ? (trip.selectedSlot || trip.timeSlots[0]) : null;

  return (
    <View className={styles.page}>
      {/* 顶部信息 */}
      <View className={styles.header}>
        <View className={styles.headerTop}>
          {trip ? (
            <>
              <Text className={styles.scriptName}>{trip.scriptName}</Text>
              <Button className={styles.editBtn} onClick={handleGoEdit}>✏️ 编辑</Button>
            </>
          ) : (
            <>
              <View className={styles.skeletonLine} style={{ width: '60%' }} />
              <View className={styles.skeletonLine} style={{ width: '120rpx', height: '56rpx' }} />
            </>
          )}
        </View>
        {trip ? (
          <>
            <Text className={styles.scriptInfo}>
              {selectedSlot ? `${formatDate(selectedSlot.date)} ${selectedSlot.startTime}` : '多时段可选'}
            </Text>
            <Text className={styles.scriptInfo}>{trip.location}</Text>
          </>
        ) : (
          <>
            <View className={styles.skeletonLine} style={{ width: '70%' }} />
            <View className={styles.skeletonLine} style={{ width: '80%' }} />
          </>
        )}
        {trip && (
          <View className={styles.seatsSummary}>
            <View className={styles.seatsSummaryItem}>
              <Text className={styles.seatsSummaryNum}>{trip.availableSeats}</Text>
              <Text className={styles.seatsSummaryLabel}>剩余座位</Text>
            </View>
            <View className={styles.seatsSummaryDivider} />
            <View className={styles.seatsSummaryItem}>
              <Text className={styles.seatsSummaryNum}>{stats.confirmed}</Text>
              <Text className={styles.seatsSummaryLabel}>已确认</Text>
            </View>
            <View className={styles.seatsSummaryDivider} />
            <View className={styles.seatsSummaryItem}>
              <Text className={styles.seatsSummaryNum}>{stats.pending}</Text>
              <Text className={styles.seatsSummaryLabel}>待确认</Text>
            </View>
            <View className={styles.seatsSummaryDivider} />
            <View className={styles.seatsSummaryItem}>
              <Text className={styles.seatsSummaryNum}>{stats.waitlist}</Text>
              <Text className={styles.seatsSummaryLabel}>候补</Text>
            </View>
          </View>
        )}
      </View>

      {/* 已确认名单看板 */}
      {trip && confirmedPlayers.length > 0 && (
        <View className={styles.dashboardSection}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>✅ 已确认名单</Text>
          </View>
          <ScrollView className={styles.confirmedScroll} scrollX>
            {confirmedPlayers.map(player => (
              <View key={player.id} className={styles.confirmedAvatarItem} onClick={() => handlePlayerClick(player)}>
                <Image className={styles.confirmedAvatar} src={player.avatar} mode="aspectFill" />
                <Text className={styles.confirmedName}>{player.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 候补顺序看板 */}
      {trip && waitlistPlayers.length > 0 && (
        <View className={styles.dashboardSection}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>⏳ 候补顺序</Text>
          </View>
          <View className={styles.waitlistList}>
            {waitlistPlayers.map((player, index) => (
              <View key={player.id} className={styles.waitlistItem} onClick={() => handlePlayerClick(player)}>
                <Text className={styles.waitlistRank}>#{index + 1}</Text>
                <Image className={styles.waitlistAvatar} src={player.avatar} mode="aspectFill" />
                <View className={styles.waitlistInfo}>
                  <Text className={styles.waitlistName}>{player.name}</Text>
                  <Text className={styles.waitlistTime}>{player.applyTime}</Text>
                </View>
                <Text className={styles.waitlistArrow}>›</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Tab 切换 */}
      {trip && (
        <View className={styles.tabBar}>
          {tabs.map(tab => (
            <View key={tab.key} className={classnames(styles.tabItem, activeTab === tab.key && styles.active)} onClick={() => setActiveTab(tab.key)}>
              {tab.label}
            </View>
          ))}
        </View>
      )}

      {/* 玩家列表 */}
      <ScrollView className={styles.playerList} scrollY refresherEnabled onRefresherRefresh={handleRefresh}>
        {trip && filteredPlayers.length > 0 ? (
          filteredPlayers.map(player => {
            const wlIdx = player.status === 'waitlist' ? waitlistPlayers.findIndex(p => p.id === player.id) + 1 : 0;
            return (
              <View key={player.id} className={styles.playerCard} onClick={() => handlePlayerClick(player)}>
                <View className={styles.playerMain}>
                  {player.status === 'waitlist' && wlIdx > 0 && (
                    <View className={styles.waitlistBadge}><Text className={styles.waitlistBadgeText}>#{wlIdx}</Text></View>
                  )}
                  <Image className={styles.playerAvatar} src={player.avatar} mode="aspectFill" />
                  <View className={styles.playerInfo}>
                    <View className={styles.playerNameRow}>
                      <Text className={styles.playerName}>{player.name}</Text>
                      <View className={classnames(styles.statusBadge, getStatusClass(player.status))}>{getStatusText(player.status)}</View>
                    </View>
                    <Text className={styles.playerDetail}>{player.gender === 'male' ? '♂' : '♀'} · {player.rolePreference}</Text>
                    <View className={styles.playerTags}>
                      {player.carpool && <Tag text="可拼车" type="primary" size="sm" />}
                      {player.crossDress && <Tag text="可反串" type="default" size="sm" />}
                    </View>
                    {player.note && <Text className={styles.playerNote}>"{player.note}"</Text>}
                    <Text className={styles.applyTime}>申请时间：{player.applyTime}</Text>
                  </View>
                  <Text className={styles.playerArrow}>›</Text>
                </View>
                <View className={styles.actionRow} onClick={e => e.stopPropagation()}>
                  {player.status === 'pending' ? (
                    <>
                      <Button className={classnames(styles.actionBtn, styles.btnConfirm)} onClick={() => { handleUpdateStatus(player.id, 'confirmed'); }}>确认</Button>
                      <Button className={classnames(styles.actionBtn, styles.btnWaitlist)} onClick={() => { handleUpdateStatus(player.id, 'waitlist'); }}>候补</Button>
                      <Button className={classnames(styles.actionBtn, styles.btnReject)} onClick={() => { handleUpdateStatus(player.id, 'rejected'); }}>婉拒</Button>
                    </>
                  ) : (
                    <>
                      <Button className={classnames(styles.actionBtn, styles.btnConfirm)} onClick={() => { handleUpdateStatus(player.id, 'confirmed'); }}>设为确认</Button>
                      <Button className={classnames(styles.actionBtn, styles.btnWaitlist)} onClick={() => { handleUpdateStatus(player.id, 'waitlist'); }}>设为候补</Button>
                    </>
                  )}
                </View>
              </View>
            );
          })
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📭</Text>
            <Text className={styles.emptyText}>{dataState === 'not_found' ? '行程不存在或已被删除' : '加载中...'}</Text>
          </View>
        )}
      </ScrollView>

      {/* 底部操作栏 */}
      <View className={styles.bottomBar}>
        <Button className={styles.notifyBtn} onClick={() => handleSendNotify('reminder')}>
          <Text className={styles.notifyBtnIcon}>📢</Text><Text className={styles.notifyBtnText}>发通知</Text>
        </Button>
        <Button className={styles.notifyBtn} onClick={() => handleSendNotify('notes')}>
          <Text className={styles.notifyBtnIcon}>📝</Text><Text className={styles.notifyBtnText}>注意事项</Text>
        </Button>
        <Button className={styles.notifyBtn} onClick={() => setShowNotifications(true)}>
          <Text className={styles.notifyBtnIcon}>📋</Text><Text className={styles.notifyBtnText}>通知记录</Text>
        </Button>
        <Button className={styles.shareBtn} onClick={handleShare}>分享邀约</Button>
      </View>

      {/* 通知弹窗 */}
      {showNotifyModal && (
        <View className={styles.modalMask} onClick={() => setShowNotifyModal(false)}>
          <View className={styles.modalBody} onClick={e => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>发送通知</Text>
              <View className={styles.modalClose} onClick={() => setShowNotifyModal(false)}>×</View>
            </View>
            <View className={styles.notifyOptions}>
              {notifyOptions.map(option => (
                <View key={option.type} className={classnames(styles.notifyOption, notifyType === option.type && styles.active)} onClick={() => setNotifyType(option.type)}>
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
            <Textarea className={styles.notifyTextarea} placeholder="通知内容（可编辑）" value={customMessage || getDefaultMessage()} onInput={e => setCustomMessage(e.detail.value)} maxlength={500} autoHeight />
            <Button className={styles.sendBtn} onClick={handleConfirmSend}>发送给所有已确认玩家</Button>
          </View>
        </View>
      )}

      {/* 通知记录弹窗 */}
      {showNotifications && (
        <View className={styles.modalMask} onClick={() => setShowNotifications(false)}>
          <View className={styles.modalBody} onClick={e => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>通知记录</Text>
              <View className={styles.modalClose} onClick={() => setShowNotifications(false)}>×</View>
            </View>
            <ScrollView className={styles.notificationList} scrollY>
              {trip && trip.notifications && trip.notifications.length > 0 ? (
                trip.notifications.map(notification => (
                  <View key={notification.id} className={styles.notificationItem}>
                    <View className={styles.notificationItemHeader}>
                      <Text className={styles.notificationType}>{getNotificationTypeName(notification.type)}</Text>
                      <Text className={styles.notificationTime}>{notification.sentAt}</Text>
                    </View>
                    <Text className={styles.notificationContent}>{notification.content}</Text>
                    <View className={styles.notificationFooter}>
                      <View className={styles.notificationRecipientsRow}>
                        <Text className={styles.notificationRecipientsLabel}>收件人：</Text>
                        <View className={styles.recipientTags}>
                          {notification.recipients.map((name, idx) => (
                            <View key={idx} className={styles.recipientTag} onClick={() => handleCopyForPlayer(name, notification.content)}>
                              {name}
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>
                    <View className={styles.notificationActions}>
                      <Button className={styles.notifActionBtn} onClick={() => handleCopyNotification(notification.content)}>📋 复制全部内容</Button>
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

      {/* 玩家详情弹窗 */}
      {showPlayerModal && selectedPlayer && (
        <View className={styles.modalMask} onClick={() => setShowPlayerModal(false)}>
          <View className={styles.modalBody} onClick={e => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>玩家详情</Text>
              <View className={styles.modalClose} onClick={() => setShowPlayerModal(false)}>×</View>
            </View>
            <ScrollView className={styles.playerModalContent} scrollY>
              <View className={styles.playerModalHeader}>
                <Image className={styles.playerModalAvatar} src={selectedPlayer.avatar} mode="aspectFill" />
                <View className={styles.playerModalInfo}>
                  <Text className={styles.playerModalName}>{selectedPlayer.name}</Text>
                  <View className={classnames(styles.statusBadge, getStatusClass(selectedPlayer.status))}>{getStatusText(selectedPlayer.status)}</View>
                </View>
              </View>
              <View className={styles.playerModalSection}>
                <Text className={styles.playerModalLabel}>基本信息</Text>
                <View className={styles.playerModalInfoGrid}>
                  <View className={styles.playerModalInfoItem}>
                    <Text className={styles.playerModalInfoLabel}>性别</Text>
                    <Text className={styles.playerModalInfoValue}>{selectedPlayer.gender === 'male' ? '男' : '女'}</Text>
                  </View>
                  <View className={styles.playerModalInfoItem}>
                    <Text className={styles.playerModalInfoLabel}>角色偏好</Text>
                    <Text className={styles.playerModalInfoValue}>{selectedPlayer.rolePreference}</Text>
                  </View>
                  <View className={styles.playerModalInfoItem}>
                    <Text className={styles.playerModalInfoLabel}>可拼车</Text>
                    <Text className={styles.playerModalInfoValue}>{selectedPlayer.carpool ? '是' : '否'}</Text>
                  </View>
                  <View className={styles.playerModalInfoItem}>
                    <Text className={styles.playerModalInfoLabel}>可反串</Text>
                    <Text className={styles.playerModalInfoValue}>{selectedPlayer.crossDress ? '是' : '否'}</Text>
                  </View>
                </View>
              </View>
              {selectedPlayer.note && (
                <View className={styles.playerModalSection}>
                  <Text className={styles.playerModalLabel}>玩家备注</Text>
                  <Text className={styles.playerModalNote}>"{selectedPlayer.note}"</Text>
                </View>
              )}
              <View className={styles.playerModalSection}>
                <Text className={styles.playerModalLabel}>调整状态</Text>
                <View className={styles.statusOptions}>
                  {(['pending', 'confirmed', 'waitlist', 'rejected'] as PlayerStatus[]).map(status => (
                    <View key={status} className={classnames(styles.statusOption, editStatus === status && styles.active)} onClick={() => setEditStatus(status)}>
                      {getStatusText(status)}
                    </View>
                  ))}
                </View>
              </View>
              <View className={styles.playerModalSection}>
                <Text className={styles.playerModalLabel}>DM备注</Text>
                <Textarea className={styles.playerModalTextarea} placeholder="添加备注，如角色分配、特殊需求等" value={editNote} onInput={e => setEditNote(e.detail.value)} maxlength={200} autoHeight />
              </View>
              <View className={styles.playerModalActions}>
                <Button className={styles.playerModalBtnSecondary} onClick={() => setShowPlayerModal(false)}>取消</Button>
                <Button className={styles.playerModalBtnPrimary} onClick={handleSavePlayer}>保存修改</Button>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};

export default ManagePage;
