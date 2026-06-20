import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface FormSectionProps {
  title: string;
  required?: boolean;
  children: React.ReactNode;
  extra?: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ title, required = false, children, extra }) => {
  return (
    <View className={styles.section}>
      <View className={styles.header}>
        <View className={styles.titleRow}>
          {required && <Text className={styles.required}>*</Text>}
          <Text className={styles.titleText}>{title}</Text>
        </View>
        {extra && <View className={styles.extra}>{extra}</View>}
      </View>
      <View className={styles.content}>
        {children}
      </View>
    </View>
  );
};

export default FormSection;
