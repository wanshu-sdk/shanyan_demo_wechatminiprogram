/**
 * 隐私政策弹窗组件
 * 首次启动时显示，用户同意后才允许继续使用。
 */
Component({
  data: {
    visible: false,
  },

  methods: {
    checkAndShow() {
      const agreed = wx.getStorageSync('privacyAgreed');
      if (!agreed) {
        this.setData({ visible: true });
      }
    },

    forceShow() {
      this.setData({ visible: true });
    },

    onAgree() {
      wx.setStorageSync('privacyAgreed', true);
      this.setData({ visible: false });
      this.triggerEvent('agree');

      // 首次启动：用户同意隐私政策后，初始化 SDK 并预检查网络环境（隐私合规要求）
      const app = getApp();
      if (app && typeof app.initSDKAndPreCheck === 'function') {
        app.initSDKAndPreCheck();
      }
    },

    onDisagree() {
      this.setData({ visible: false });
      wx.exitMiniProgram();
    },

    onReadPrivacy() {
      wx.navigateTo({ url: '/pages/contract/index?type=privacy' });
    },

    onReadService() {
      wx.navigateTo({ url: '/pages/contract/index?type=service' });
    },

    stopPropagation() {
      // 阻止遮罩层点击事件冒泡
    },
  },
});
