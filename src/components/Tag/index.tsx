import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface TagProps {
  text: string;
  type?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'horror' | 'emotion' | 'mechanism' | 'newbie';
  size?: 'sm' | 'md';
  className?: string;
}

const Tag: React.FC<TagProps> = ({ text, type = 'default', size = 'md', className }) => {
  const tagClass = classnames(
    styles.tag,
    styles[type],
    styles[size],
    className
  );

  return (
    <View className={tagClass}>
      <Text className={styles.tagText}>{text}</Text>
    </View>
  );
};

export default Tag;
