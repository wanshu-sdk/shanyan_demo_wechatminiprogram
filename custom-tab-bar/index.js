Component({
  data: {
    selected: 0,
    color: '#999999',
    selectedColor: '#2b7de0',
    list: [
      {
        pagePath: '/pages/index/index',
        text: '一键登录',
        iconPath: '/images/home_login_unchecked.png',
        selectedIconPath: '/images/home_login_checked.png'
      },
      {
        pagePath: '/pages/page-captcha/index',
        text: '行为验证码',
        iconPath: '/images/home_captcha_unchecked.png',
        selectedIconPath: '/images/home_captcha_checked.png'
      },
      {
        pagePath: '/pages/page-mine/index',
        text: '个人中心',
        iconPath: '/images/home_mine_unchecked.png',
        selectedIconPath: '/images/home_mine_checked.png'
      }
    ]
  },

  methods: {
    switchTab(e) {
      const path = e.currentTarget.dataset.path;

      // 非首次启动：点击"一键登录"tab 时初始化 SDK 并预检查网络环境
      // （首次启动已由隐私弹窗"同意并继续"触发过；init 二次调用走本地缓存，无额外开销）
      if (path === '/pages/index/index') {
        const app = getApp();
        if (app && typeof app.initSDKAndPreCheck === 'function') {
          app.initSDKAndPreCheck();
        }
      }

      wx.switchTab({ url: path });
    }
  }
});
