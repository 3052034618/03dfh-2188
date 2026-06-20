import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import { TripProvider } from './store/tripStore';
import './app.scss';

function App(props) {
  useEffect(() => {});

  useDidShow(() => {});

  useDidHide(() => {});

  return (
    <TripProvider>
      {props.children}
    </TripProvider>
  );
}

export default App;
