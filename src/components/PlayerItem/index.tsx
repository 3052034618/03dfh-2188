import React from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import classnames from 'classnames';
import Tag from '@/components/Tag';
import type { Player } from '@/types';
import { getStatusText } from '@/utils';
import styles from './index.module.scss';

interface PlayerItemProps {
  player: Player;
  showActions?: boolean;
  onConfirm?: (playerId: string) => void;
  onWaitlist?: (playerId: string) => void;
  onReject?: (playerId: string) => void;
}

const PlayerItem: React.FC<PlayerItemProps> = ({
  player,
  showActions = false,
  onConfirm,
  onWaitlist,
  onReject
}) => {
  const getStatusType = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'waitlist': return 'primary';
      case 'rejected': return 'default';
      default: return 'default';
    }
  };

  return (
    <View className={styles.playerItem}>
      <View className={styles.playerInfo}>
        <Image
          className={styles.avatar}
          src={player.avatar}
          mode="aspectFill"
        />
        <View className={styles.infoContent}>
          <View className={styles.nameRow}>
            <Text className={styles.playerName}>{player.name}</Text>
            <Tag text={getStatusText(player.status)} type={getStatusType(player.status) as any} size="sm" />
          </View>
          <View className={styles.detailRow}>
            <Text className={styles.detailText}>
              {player.gender === 'male' ? '♂' : '♀'} · {player.rolePreference}
            </Text>
          </View>
          <View className={styles.tagsRow}>
            {player.carpool && (
              <Tag text="可拼车" type="primary" size="sm" />
            )}
            {player.crossDress && (
              <Tag text="可反串" type="default" size="sm" />
            )}
          </View>
          {player.note && (
            <Text className={styles.noteText}>"{player.note}"</Text>
          )}
          <Text className={styles.applyTime}>申请时间：{player.applyTime}</Text>
        </View>
      </View>

      {showActions && player.status === 'pending' && (
        <View className={styles.actionRow}>
          <Button
            className={classnames(styles.actionBtn, styles.btnConfirm)}
            onClick={() => onConfirm?.(player.id)}
          >
            确认
          </Button>
          <Button
            className={classnames(styles.actionBtn, styles.btnWaitlist)}
            onClick={() => onWaitlist?.(player.id)}
          >
            候补
          </Button>
          <Button
            className={classnames(styles.actionBtn, styles.btnReject)}
            onClick={() => onReject?.(player.id)}
          >
            婉拒
          </Button>
        </View>
      )}

      {showActions && player.status !== 'pending' && (
        <View className={styles.actionRow}>
          <Button
            className={classnames(styles.actionBtn, styles.btnSecondary)}
            onClick={() => onConfirm?.(player.id)}
          >
            改为确认
          </Button>
        </View>
      )}
    </View>
  );
};

export default PlayerItem;
