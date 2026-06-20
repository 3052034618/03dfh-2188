import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, Input, Textarea, Button, Switch, ScrollView } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import InvitationCard from '@/components/InvitationCard';
import { useTripStore } from '@/store/tripStore';
import type { ScriptTag, TimeSlot, CreateTripForm, Trip } from '@/types';
import { mockDM } from '@/data/mock';
import { generateId, generateShareCode, generateShareContent, getNowTimeString } from '@/utils';
import styles from './index.module.scss';

const TAG_OPTIONS: ScriptTag[] = ['恐怖', '情感', '机制', '推理', '欢乐', '阵营'];

const CreatePage: React.FC = () => {
  const router = useRouter();
  const { createTrip, updateTrip, getTripById, refreshTrips } = useTripStore();
  const [showPreview, setShowPreview] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editTripId, setEditTripId] = useState<string | null>(null);
  const [originalTrip, setOriginalTrip] = useState<Trip | null>(null);

  const [form, setForm] = useState<CreateTripForm>({
    scriptName: '',
    city: '上海',
    district: '',
    location: '',
    totalSeats: 6,
    duration: '4小时',
    tags: [],
    newbieFriendly: false,
    timeSlots: [
      { date: '', startTime: '14:00', endTime: '18:00' }
    ],
    price: 128,
    feeNote: '',
    suitableFor: '',
    notes: '',
    latePolicy: ''
  });

  const loadEditData = useCallback(() => {
    const tripId = router.params.id;
    const mode = router.params.mode;

    if (mode === 'edit' && tripId) {
      refreshTrips();
      const trip = getTripById(tripId);
      if (trip) {
        setIsEdit(true);
        setEditTripId(tripId);
        setOriginalTrip(trip);
        setForm({
          scriptName: trip.scriptName,
          city: trip.city,
          district: trip.district,
          location: trip.location,
          totalSeats: trip.totalSeats,
          duration: trip.duration,
          tags: trip.tags,
          newbieFriendly: trip.newbieFriendly,
          timeSlots: trip.timeSlots.length > 0 ? trip.timeSlots : [
            { date: '', startTime: '14:00', endTime: '18:00' }
          ],
          price: trip.price,
          feeNote: trip.feeNote,
          suitableFor: trip.suitableFor,
          notes: trip.notes,
          latePolicy: trip.latePolicy
        });
        console.log('[CreatePage] 加载编辑数据:', tripId, trip.scriptName);
      } else {
        Taro.showToast({ title: '行程不存在', icon: 'none' });
        setTimeout(() => Taro.navigateBack(), 1500);
      }
    }
  }, [router.params, refreshTrips, getTripById]);

  useEffect(() => {
    loadEditData();
  }, [loadEditData]);

  useDidShow(() => {
    if (router.params.mode === 'edit' && router.params.id) {
      loadEditData();
    }
  });

  const updateForm = <K extends keyof CreateTripForm>(key: K, value: CreateTripForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const toggleTag = (tag: ScriptTag) => {
    setForm(prev => {
      const tags = prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag];
      return { ...prev, tags };
    });
  };

  const addTimeSlot = () => {
    setForm(prev => ({
      ...prev,
      timeSlots: [...prev.timeSlots, { date: '', startTime: '14:00', endTime: '18:00' }]
    }));
  };

  const removeTimeSlot = (index: number) => {
    if (form.timeSlots.length <= 1) return;
    setForm(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((_, i) => i !== index)
    }));
  };

  const updateTimeSlot = (index: number, key: keyof TimeSlot, value: string) => {
    setForm(prev => {
      const timeSlots = [...prev.timeSlots];
      timeSlots[index] = { ...timeSlots[index], [key]: value };
      return { ...prev, timeSlots };
    });
  };

  const adjustSeats = (delta: number) => {
    setForm(prev => ({
      ...prev,
      totalSeats: Math.max(3, Math.min(12, prev.totalSeats + delta))
    }));
  };

  const previewTrip = useMemo((): Trip => {
    const baseTrip: Trip = {
      id: isEdit && originalTrip ? originalTrip.id : generateId(),
      scriptName: form.scriptName || '剧本名称',
      city: form.city || '城市',
      district: form.district || '商圈',
      location: form.location || '门店/集合点地址',
      totalSeats: form.totalSeats,
      availableSeats: isEdit && originalTrip ? originalTrip.availableSeats : form.totalSeats,
      duration: form.duration || '4小时',
      tags: form.tags.length > 0 ? form.tags : ['推理'],
      newbieFriendly: form.newbieFriendly,
      timeSlots: form.timeSlots.filter(s => s.date),
      price: form.price,
      feeNote: form.feeNote || '包含剧本费+DM费+茶水小吃',
      suitableFor: form.suitableFor || '喜欢剧本杀的玩家们',
      notes: form.notes || '请提前15分钟到店，请勿迟到。',
      latePolicy: form.latePolicy || '迟到15分钟以上押金不退。',
      dm: mockDM,
      players: isEdit && originalTrip ? originalTrip.players : [],
      notifications: isEdit && originalTrip ? originalTrip.notifications : [],
      status: isEdit && originalTrip ? originalTrip.status : 'recruiting',
      createdAt: isEdit && originalTrip ? originalTrip.createdAt : getNowTimeString(),
      shareCode: isEdit && originalTrip ? originalTrip.shareCode : generateShareCode()
    };
    return baseTrip;
  }, [form, isEdit, originalTrip]);

  const handlePreview = () => {
    if (!form.scriptName) {
      Taro.showToast({ title: '请填写剧本名', icon: 'none' });
      return;
    }
    setShowPreview(true);
  };

  const handleSubmit = () => {
    if (!form.scriptName) {
      Taro.showToast({ title: '请填写剧本名', icon: 'none' });
      return;
    }
    if (!form.location) {
      Taro.showToast({ title: '请填写门店/集合点', icon: 'none' });
      return;
    }
    if (form.tags.length === 0) {
      Taro.showToast({ title: '请选择题材标签', icon: 'none' });
      return;
    }
    const validSlots = form.timeSlots.filter(s => s.date);
    if (validSlots.length === 0) {
      Taro.showToast({ title: '请添加可约时段', icon: 'none' });
      return;
    }

    const validForm: CreateTripForm = {
      ...form,
      timeSlots: validSlots
    };

    if (isEdit && editTripId) {
      updateTrip(editTripId, validForm);
      Taro.showToast({ title: '保存成功！', icon: 'success' });
      setTimeout(() => {
        Taro.navigateBack();
      }, 1000);
    } else {
      const newTrip = createTrip(validForm);
      Taro.showToast({ title: '发车成功！', icon: 'success' });
      setTimeout(() => {
        Taro.navigateTo({
          url: `/pages/detail/index?id=${newTrip.id}`
        });
      }, 1000);
    }
  };

  const handleShare = (type: 'moments' | 'group' | 'plaza') => {
    const channelMap = {
      moments: 'moments' as const,
      group: 'group' as const,
      plaza: 'plaza' as const
    };
    const channel = channelMap[type] || 'group';
    const shareData = generateShareContent(previewTrip, channel);

    Taro.setClipboardData({
      data: shareData.content,
      success: () => {
        console.log('[CreatePage] 分享文案已复制:', type);
        const channelNames: Record<string, string> = {
          moments: '朋友圈',
          group: '玩家群',
          plaza: '平台广场'
        };
        Taro.showToast({
          title: `${channelNames[type] || ''}文案已复制`,
          icon: 'success',
          duration: 2000
        });
      },
      fail: (err) => {
        console.error('[CreatePage] 复制失败:', err);
        Taro.showToast({ title: '复制失败，请重试', icon: 'none' });
      }
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.headerSection}>
        <Text className={styles.headerTitle}>
          {isEdit ? '✏️ 编辑邀约' : '🚗 发一辆车'}
        </Text>
        <Text className={styles.headerSubtitle}>
          {isEdit ? '修改邀约信息，玩家状态不丢失' : '填写信息，一键生成精美邀约卡'}
        </Text>
      </View>

      <ScrollView className={styles.formContainer} scrollY>
        {/* 基本信息 */}
        <View className={styles.formSection}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionRequired}>*</Text>
            <Text className={styles.sectionTitle}>基本信息</Text>
          </View>

          <View className={styles.inputRow}>
            <Text className={styles.inputLabel}>剧本名</Text>
            <Input
              className={styles.inputField}
              placeholder="如：《午夜铃响》"
              value={form.scriptName}
              onInput={e => updateForm('scriptName', e.detail.value)}
            />
          </View>

          <View className={styles.locationRow}>
            <View className={classnames(styles.locationItem, styles.inputRow)}>
              <Text className={styles.inputLabel}>城市</Text>
              <Input
                className={styles.inputField}
                placeholder="城市"
                value={form.city}
                onInput={e => updateForm('city', e.detail.value)}
              />
            </View>
            <View className={classnames(styles.locationItem, styles.inputRow)}>
              <Text className={styles.inputLabel}>商圈/区域</Text>
              <Input
                className={styles.inputField}
                placeholder="如：静安区"
                value={form.district}
                onInput={e => updateForm('district', e.detail.value)}
              />
            </View>
          </View>

          <View className={styles.inputRow}>
            <Text className={styles.inputLabel}>门店/集合点</Text>
            <Input
              className={styles.inputField}
              placeholder="剧本杀馆名称或详细地址"
              value={form.location}
              onInput={e => updateForm('location', e.detail.value)}
            />
          </View>
        </View>

        {/* 剧本配置 */}
        <View className={styles.formSection}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionRequired}>*</Text>
            <Text className={styles.sectionTitle}>剧本配置</Text>
          </View>

          <View className={styles.inputRow}>
            <Text className={styles.inputLabel}>题材标签</Text>
            <View className={styles.tagsContainer}>
              {TAG_OPTIONS.map(tag => (
                <View
                  key={tag}
                  className={classnames(styles.tagItem, form.tags.includes(tag) && styles.active)}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </View>
              ))}
            </View>
          </View>

          <View className={styles.counterRow}>
            <View>
              <Text className={styles.counterLabel}>人数配置</Text>
            </View>
            <View className={styles.counter}>
              <View className={styles.counterBtn} onClick={() => adjustSeats(-1)}>-</View>
              <Text className={styles.counterValue}>{form.totalSeats}</Text>
              <View className={styles.counterBtn} onClick={() => adjustSeats(1)}>+</View>
            </View>
          </View>

          <View className={styles.inputRow}>
            <Text className={styles.inputLabel}>预估时长</Text>
            <Input
              className={styles.inputField}
              placeholder="如：4.5小时"
              value={form.duration}
              onInput={e => updateForm('duration', e.detail.value)}
            />
          </View>

          <View className={styles.switchRow}>
            <View>
              <Text className={styles.switchLabel}>新手友好</Text>
              <Text className={styles.switchDesc}>适合第一次玩的玩家</Text>
            </View>
            <Switch
              checked={form.newbieFriendly}
              onChange={e => updateForm('newbieFriendly', e.detail.value)}
              color="#722ED1"
            />
          </View>
        </View>

        {/* 可约时段 */}
        <View className={styles.formSection}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionRequired}>*</Text>
            <Text className={styles.sectionTitle}>可约时段</Text>
          </View>

          <View className={styles.timeSlotsContainer}>
            {form.timeSlots.map((slot, index) => (
              <View key={index} className={styles.timeSlotItem}>
                <Input
                  className={classnames(styles.timeSlotDate, styles.timeSlotInput)}
                  placeholder="日期（如：01月20日）"
                  value={slot.date}
                  onInput={e => updateTimeSlot(index, 'date', e.detail.value)}
                />
                <View className={styles.timeSlotTimes}>
                  <Input
                    className={styles.timeSlotInput}
                    placeholder="开始"
                    value={slot.startTime}
                    onInput={e => updateTimeSlot(index, 'startTime', e.detail.value)}
                  />
                  <Input
                    className={styles.timeSlotInput}
                    placeholder="结束"
                    value={slot.endTime}
                    onInput={e => updateTimeSlot(index, 'endTime', e.detail.value)}
                  />
                </View>
                {form.timeSlots.length > 1 && (
                  <View
                    className={styles.timeSlotDelete}
                    onClick={() => removeTimeSlot(index)}
                  >
                    ×
                  </View>
                )}
              </View>
            ))}
          </View>

          <Button className={styles.addTimeSlotBtn} onClick={addTimeSlot}>
            + 添加时段
          </Button>
        </View>

        {/* 费用与说明 */}
        <View className={styles.formSection}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>费用与说明</Text>
          </View>

          <View className={styles.inputRow}>
            <Text className={styles.inputLabel}>车费</Text>
            <View className={styles.priceRow}>
              <Input
                className={styles.priceInput}
                type="number"
                placeholder="0"
                value={String(form.price)}
                onInput={e => updateForm('price', Number(e.detail.value) || 0)}
              />
              <Text className={styles.priceUnit}>元/人</Text>
            </View>
          </View>

          <View className={styles.inputRow}>
            <Text className={styles.inputLabel}>费用说明</Text>
            <Textarea
              className={styles.textareaField}
              placeholder="费用包含哪些内容，是否有押金等"
              value={form.feeNote}
              onInput={e => updateForm('feeNote', e.detail.value)}
              maxlength={100}
            />
          </View>

          <View className={styles.inputRow}>
            <Text className={styles.inputLabel}>适合人群</Text>
            <Textarea
              className={styles.textareaField}
              placeholder="什么样的玩家适合这个本"
              value={form.suitableFor}
              onInput={e => updateForm('suitableFor', e.detail.value)}
              maxlength={100}
            />
          </View>
        </View>

        {/* 注意事项 */}
        <View className={styles.formSection}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>注意事项</Text>
          </View>

          <View className={styles.inputRow}>
            <Text className={styles.inputLabel}>开本前提醒</Text>
            <Textarea
              className={styles.textareaField}
              placeholder="玩家需要提前知道的事情"
              value={form.notes}
              onInput={e => updateForm('notes', e.detail.value)}
              maxlength={200}
            />
          </View>

          <View className={styles.inputRow}>
            <Text className={styles.inputLabel}>迟到处理规则</Text>
            <Textarea
              className={styles.textareaField}
              placeholder="迟到了怎么处理"
              value={form.latePolicy}
              onInput={e => updateForm('latePolicy', e.detail.value)}
              maxlength={200}
            />
          </View>
        </View>
      </ScrollView>

      {/* 底部操作栏 */}
      <View className={styles.bottomBar}>
        <Button className={styles.previewBtn} onClick={handlePreview}>
          预览邀约
        </Button>
        <Button className={styles.submitBtn} onClick={handleSubmit}>
          {isEdit ? '保存修改' : '立即发车'}
        </Button>
      </View>

      {/* 预览弹窗 */}
      {showPreview && (
        <View className={styles.previewModal} onClick={() => setShowPreview(false)}>
          <View className={styles.previewContent} onClick={e => e.stopPropagation()}>
            <View className={styles.previewHeader}>
              <Text className={styles.previewTitle}>邀约卡预览</Text>
              <View className={styles.previewClose} onClick={() => setShowPreview(false)}>
                ×
              </View>
            </View>
            <InvitationCard trip={previewTrip} />
            <View className={styles.shareSection}>
              <Button className={styles.shareBtn} onClick={() => handleShare('moments')}>
                <Text className={styles.shareBtnIcon}>🟢</Text>
                <Text className={styles.shareBtnText}>朋友圈</Text>
              </Button>
              <Button className={styles.shareBtn} onClick={() => handleShare('group')}>
                <Text className={styles.shareBtnIcon}>💬</Text>
                <Text className={styles.shareBtnText}>玩家群</Text>
              </Button>
              <Button className={styles.shareBtn} onClick={() => handleShare('plaza')}>
                <Text className={styles.shareBtnIcon}>🏪</Text>
                <Text className={styles.shareBtnText}>平台广场</Text>
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default CreatePage;
