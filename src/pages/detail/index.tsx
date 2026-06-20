import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, Image, Button, Input, Textarea, ScrollView } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import InvitationCard from '@/components/InvitationCard';
import { useTripStore } from '@/store/tripStore';
import { mockReviews } from '@/data/mock';
import { formatDate } from '@/utils';
import type { Trip, ApplyForm } from '@/types';
import styles from './index.module.scss';

const DetailPage: React.FC = () => {
  const router = useRouter();
  const { addPlayer, refreshTrips } = useTripStore();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [dataState, setDataState] = useState<'loading' | 'loaded' | 'not_found'>('loading');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);

  const [applyForm, setApplyForm] = useState<ApplyForm>({
    name: '',
    gender: 'male',
    rolePreference: '',
    carpool: false,
    crossDress: false,
    note: ''
  });

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

  const handleGoEdit = () => {
    if (!trip) return;
    Taro.navigateTo({ url: `/pages/create/index?id=${trip.id}&mode=edit` });
  };

  const handleGoManage = () => {
    if (!trip) return;
    Taro.navigateTo({ url: `/pages/manage/index?id=${trip.id}` });
  };

  const confirmedCount = useMemo(() => {
    return trip?.players.filter(p => p.status === 'confirmed').length || 0;
  }, [trip]);

  const seatsPercent = useMemo(() => {
    if (!trip) return 0;
    return (confirmedCount / trip.totalSeats) * 100;
  }, [trip, confirmedCount]);

  const handleSlotSelect = (index: number) => {
    setSelectedSlotIndex(index);
  };

  const handleApply = () => {
    if (!trip) return;
    if (trip.status === 'full') {
      Taro.showToast({ title: '该车次已满员', icon: 'none' });
      return;
    }
    setShowApplyModal(true);
  };

  const updateApplyForm = <K extends keyof ApplyForm>(key: K, value: ApplyForm[K]) => {
    setApplyForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmitApply = () => {
    if (!trip) return;
    if (!applyForm.name.trim()) {
      Taro.showToast({ title: '请填写昵称', icon: 'none' });
      return;
    }

    const updatedTrip = addPlayer(trip.id, {
      name: applyForm.name,
      avatar: 'https://picsum.photos/id/64/200/200',
      gender: applyForm.gender,
      rolePreference: applyForm.rolePreference || '都行',
      carpool: applyForm.carpool,
      crossDress: applyForm.crossDress,
      note: applyForm.note
    });

    console.log('[DetailPage] 提交报名:', applyForm.name);
    setShowApplyModal(false);

    if (updatedTrip) {
      setTrip(updatedTrip);
    }

    Taro.showToast({ title: '报名成功，等待DM确认', icon: 'success' });
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '☆' : '');
  };

  return (
    <ScrollView className={styles.page} scrollY>
      {/* 邀约卡 */}
      <View className={styles.invitationSection}>
        {trip ? (
          <InvitationCard trip={trip} />
        ) : dataState === 'not_found' ? (
          <View className={styles.skeletonCard}>
            <Text className={styles.emptyText}>行程不存在或已被删除</Text>
          </View>
        ) : (
          <View className={styles.skeletonCard}>
            <View className={styles.skeletonText} />
            <View className={styles.skeletonText} />
            <View className={styles.skeletonText} />
          </View>
        )}
      </View>

      {/* 操作按钮 */}
      {trip && (
        <View className={styles.actionBar}>
          <Button className={styles.actionBarBtn} onClick={handleGoEdit}>
            ✏️ 编辑邀约
          </Button>
          <Button className={classnames(styles.actionBarBtn, styles.primary)} onClick={handleGoManage}>
            👥 报名管理
          </Button>
        </View>
      )}

      {trip && (
        <>
          {/* 场次选择 */}
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>📅</Text>
              选择场次
            </Text>
            <View className={styles.timeSlots}>
              {trip.timeSlots.map((slot, index) => (
                <View
                  key={index}
                  className={classnames(styles.timeSlotItem, selectedSlotIndex === index && styles.active)}
                  onClick={() => handleSlotSelect(index)}
                >
                  <View>
                    <Text className={styles.timeSlotDate}>{formatDate(slot.date)}</Text>
                    <Text className={styles.timeSlotTime}>
                      {slot.startTime} - {slot.endTime}
                    </Text>
                  </View>
                  <View className={classnames(styles.timeSlotCheck, selectedSlotIndex === index && styles.active)}>
                    {selectedSlotIndex === index ? '✓' : ''}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* 座位情况 */}
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>👥</Text>
              座位情况
            </Text>
            <View className={styles.playersPreview}>
              <View className={styles.playerAvatars}>
                {trip.players.slice(0, 5).map(player => (
                  <Image
                    key={player.id}
                    className={styles.playerAvatar}
                    src={player.avatar}
                    mode="aspectFill"
                  />
                ))}
              </View>
              <View className={styles.playersText}>
                已确认 <Text className={styles.playersNum}>{confirmedCount}</Text>/{trip.totalSeats} 人
              </View>
            </View>
            <View className={styles.seatsBar}>
              <View className={styles.seatsBarFill} style={{ width: `${seatsPercent}%` }} />
            </View>
          </View>

          {/* DM信息 */}
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>🎭</Text>
              本场DM
            </Text>
            <View className={styles.dmSection}>
              <Image
                className={styles.dmAvatar}
                src={trip.dm.avatar}
                mode="aspectFill"
              />
              <View className={styles.dmInfo}>
                <Text className={styles.dmName}>{trip.dm.name}</Text>
                <View className={styles.dmStats}>
                  <Text className={styles.dmStat}>
                    ★ <strong>{trip.dm.rating}</strong>
                  </Text>
                  <Text className={styles.dmStat}>
                    带本 <strong>{trip.dm.totalTrips}</strong> 场
                  </Text>
                </View>
              </View>
            </View>
            <Text className={styles.dmBio}>{trip.dm.bio}</Text>
          </View>

          {/* 费用说明 */}
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>💰</Text>
              费用说明
            </Text>
            <View className={styles.infoList}>
              <View className={styles.infoItem}>
                <Text className={styles.infoLabel}>车费</Text>
                <Text className={styles.infoValue}>¥{trip.price} /人</Text>
              </View>
              <View className={styles.infoItem}>
                <Text className={styles.infoLabel}>包含</Text>
                <Text className={styles.infoValue}>{trip.feeNote}</Text>
              </View>
            </View>
          </View>

          {/* 适合人群 */}
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>🎯</Text>
              适合人群
            </Text>
            <Text className={styles.infoValue} style={{ lineHeight: 1.8 }}>
              {trip.suitableFor}
            </Text>
          </View>

          {/* 注意事项 */}
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>📝</Text>
              注意事项
            </Text>
            <View className={styles.tipsBox}>
              <Text className={styles.tipsText}>{trip.notes}</Text>
            </View>
          </View>

          {/* 迟到规则 */}
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>⏰</Text>
              迟到处理规则
            </Text>
            <Text className={styles.infoValue} style={{ lineHeight: 1.8 }}>
              {trip.latePolicy}
            </Text>
          </View>

          {/* 通知记录 */}
          {trip.notifications && trip.notifications.length > 0 && (
            <View className={styles.section}>
              <Text className={styles.sectionTitle}>
                <Text className={styles.sectionIcon}>📢</Text>
                DM通知
              </Text>
              {trip.notifications.map(notification => (
                <View key={notification.id} className={styles.noticeCard}>
                  <View className={styles.noticeHeader}>
                    <Text className={styles.noticeType}>{notification.typeName}</Text>
                    <Text className={styles.noticeTime}>{notification.sentAt}</Text>
                  </View>
                  <Text className={styles.noticeContent}>{notification.content}</Text>
                  <View className={styles.noticeFooter}>
                    <View className={styles.noticeRecipientsRow}>
                      <Text className={styles.noticeRecipientsLabel}>发给：</Text>
                      <View className={styles.noticeRecipientTags}>
                        {notification.recipients.map((name, idx) => (
                          <View
                            key={idx}
                            className={styles.noticeRecipientTag}
                            onClick={() => {
                              const message = `@${name}\n${notification.content}`;
                              Taro.setClipboardData({
                                data: message,
                                success: () => {
                                  Taro.showToast({ title: '已复制可直接发送', icon: 'success' });
                                }
                              });
                            }}
                          >
                            {name}
                          </View>
                        ))}
                      </View>
                    </View>
                    <Button
                      className={styles.noticeRecipientAction}
                      onClick={() => {
                        Taro.setClipboardData({
                          data: notification.content,
                          success: () => {
                            Taro.showToast({ title: '内容已复制', icon: 'success' });
                          }
                        });
                      }}
                    >
                      📋 复制全部内容
                    </Button>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* 玩家评价 */}
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>⭐</Text>
              玩家评价
            </Text>
            {mockReviews.slice(0, 2).map(review => (
              <View key={review.id} className={styles.reviewCard}>
                <View className={styles.reviewHeader}>
                  <Image
                    className={styles.reviewAvatar}
                    src={review.playerAvatar}
                    mode="aspectFill"
                  />
                  <Text className={styles.reviewName}>{review.playerName}</Text>
                  <Text className={styles.reviewRating}>
                    {renderStars(review.rating)}
                  </Text>
                </View>
                <Text className={styles.reviewContent}>{review.content}</Text>
              </View>
            ))}
            <Text className={styles.viewMore}>查看全部评价 ›</Text>
          </View>
        </>
      )}

      {/* 底部报名栏 */}
      {trip ? (
        <View className={styles.bottomBar}>
          <View className={styles.priceInfo}>
            <Text className={styles.priceLabel}>车费</Text>
            <View>
              <Text className={styles.priceValue}>¥{trip.price}</Text>
              <Text className={styles.priceUnit}>/人</Text>
            </View>
          </View>
          <Button
            className={classnames(styles.applyBtn, trip.status === 'full' && styles.disabled)}
            onClick={handleApply}
            disabled={trip.status === 'full'}
          >
            {trip.status === 'full' ? '已满员' : '立即报名'}
          </Button>
        </View>
      ) : dataState === 'not_found' ? null : (
        <View className={styles.bottomBar}>
          <View className={styles.skeletonPrice} />
          <View className={styles.skeletonBtn} />
        </View>
      )}

      {/* 报名弹窗 */}
      {showApplyModal && (
        <View className={styles.applyModal} onClick={() => setShowApplyModal(false)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>填写报名信息</Text>
              <View className={styles.modalClose} onClick={() => setShowApplyModal(false)}>
                ×
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>
                <Text className={styles.formRequired}>*</Text>昵称
              </Text>
              <Input
                className={styles.formInput}
                placeholder="请输入你的昵称"
                value={applyForm.name}
                onInput={e => updateApplyForm('name', e.detail.value)}
              />
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>
                <Text className={styles.formRequired}>*</Text>性别
              </Text>
              <View className={styles.genderOptions}>
                <View
                  className={classnames(styles.genderOption, applyForm.gender === 'male' && styles.active)}
                  onClick={() => updateApplyForm('gender', 'male')}
                >
                  ♂ 男生
                </View>
                <View
                  className={classnames(styles.genderOption, applyForm.gender === 'female' && styles.active)}
                  onClick={() => updateApplyForm('gender', 'female')}
                >
                  ♀ 女生
                </View>
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>角色偏好</Text>
              <Input
                className={styles.formInput}
                placeholder="如：情感线、推理位、凶手位等"
                value={applyForm.rolePreference}
                onInput={e => updateApplyForm('rolePreference', e.detail.value)}
              />
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>其他选项</Text>
              <View className={styles.switchOptions}>
                <View
                  className={classnames(styles.switchItem, applyForm.carpool && styles.active)}
                  onClick={() => updateApplyForm('carpool', !applyForm.carpool)}
                >
                  {applyForm.carpool ? '✓ ' : ''}可拼车
                </View>
                <View
                  className={classnames(styles.switchItem, applyForm.crossDress && styles.active)}
                  onClick={() => updateApplyForm('crossDress', !applyForm.crossDress)}
                >
                  {applyForm.crossDress ? '✓ ' : ''}可反串
                </View>
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>备注（选填）</Text>
              <Textarea
                className={styles.formTextarea}
                placeholder="有什么想告诉DM的"
                value={applyForm.note}
                onInput={e => updateApplyForm('note', e.detail.value)}
                maxlength={100}
              />
            </View>

            <Button className={styles.submitBtn} onClick={handleSubmitApply}>
              提交报名
            </Button>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default DetailPage;
