export default {
  pages: [
    'pages/kanban/index',
    'pages/eisenhower/index',
    'pages/analytics/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#6200EE',
    navigationBarTitleText: 'FocusBoard',
    navigationBarTextStyle: 'white',
    backgroundColor: '#121212'
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#6200EE',
    backgroundColor: '#1E1E1E',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/kanban/index',
        text: 'Kanban'
      },
      {
        pagePath: 'pages/eisenhower/index',
        text: 'Eisenhower'
      },
      {
        pagePath: 'pages/analytics/index',
        text: 'Analytics'
      }
    ]
  },
  darkMode: true,
  themeLocation: 'theme.json'
}
