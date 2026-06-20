export default defineAppConfig({
  pages: [
    'pages/create/index',
    'pages/trips/index',
    'pages/profile/index',
    'pages/detail/index',
    'pages/manage/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTitleText: 'DM发车助手',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#722ED1',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/create/index',
        text: '发车'
      },
      {
        pagePath: 'pages/trips/index',
        text: '行程'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的'
      }
    ]
  }
})
