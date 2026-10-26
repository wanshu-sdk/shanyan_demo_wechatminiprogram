module.exports = {
  content: `# 微信小程序集成文档

# 

## 1  产品概述

闪验 SDK 是基于运营商网关认证能力的一键登录解决方案。用户只需点击"一键登录"按钮，即可自动获取本机手机号码，完成登录/注册，无需手动输入手机号和短信验证码。

## 2 核心能力

- **一键登录**：用户在授权页点击确认，SDK自动获取当前流量卡对应的token，通过服务端可置换完整手机号码。

- **三网支持**：自动适配移动、联通、电信三大运营商，一套配置三网共用。

- **网络支持：**自动选择网络通道，支持WiFi\\+数据网络和纯数据网络。

## 3 接入准备

### 3\\.1 平台申请

1. 在微信公众平台申请微信小程序能力，获取 **wxappid**

2. 在创蓝平台注册账号，创建应用并获取 **appId** 和 **appkey**

3. 在腾讯公众平台小程序后台添加取号插件：\`"设置" → "第三方服务" → "插件管理"\` → 搜索 **"号码认证"** 申请添加

### 3\\.2 重要参数说明

|参数|说明|
|---|---|
|**wxappid**|微信平台分配的微信小程序ID|
|**appId**|创蓝平台分配的应用AppId，用于 SDK 初始化|
|**appkey**|创蓝平台分配的密钥，用于服务端 token 校验及手机号 AES 解密|

## 4 SDK 快速接入

### 4\\.0 版本说明

| 组件 | 推荐版本 | 说明 |
|---|---|---|
| npm SDK（\`shanyan-miniprogram-sdk\`） | 1.1.3 | 通过 \`npm install shanyan-miniprogram-sdk@<version>\` 安装 |
| 取号插件（\`auth-plugin\`） | 2.3.5 | 在 \`app.json\` 的 \`plugins\` 中配置 \`version\` 字段 |

> **注意**：1.0.3 版本存在语法错误（\`getNetworkType\` 方法缺少函数声明，报错 \`'return' outside of function\`），请暂时不要升级。

**更新 SDK**：运行 \`npm install shanyan-miniprogram-sdk@latest\`，然后在微信开发者工具中重新构建 npm。

### 4\\.1 安装 SDK

在小程序项目根目录下执行：

\`\`\`Bash
npm install shanyan-miniprogram-sdk
\`\`\`

安装完成后，在微信开发者工具中点击 **工具 → 构建 npm**，生成 npm 依赖。

### 4\\.2 引入插件包

**注意：下面4项必须全部配置，否则可能无法启动授权页。**

**① app\\.json 中引用插件：**

\`\`\`JSON
{
  "pages": [
    "pages/index/index"
  ],
  "plugins": {
    "auth-plugin": {
      "version": "2.3.5",
      "provider": "wx35678fec06d475b4"
    }
  }
}
\`\`\`

**② 页面 json 文件中声明插件组件：**

\`\`\`JSON
{
  "usingComponents": {
    "onekeylogin": "plugin://auth-plugin/onekeylogin"
  }
}
\`\`\`

**③ ****wxml文件引用：**

\`\`\`JSON
<onekeylogin/>
\`\`\`

**④ js 文件中引入 SDK：**

\`\`\`JavaScript
const SDK = require('../sdk/index');
\`\`\`

### 4\\.3 初始化 SDK

**初始化SDK，为后续取号功能做准备。**
\`● 初始化会采集信息，建议放到同意隐私协议后调用。\`
\`● 调用SDK其他流程方法前，请确保已调用过初始化。\`
\`● 初始化首次调用有网络请求，后续会使用缓存，如果不使用缓存可以调用clearScripCache方法清理缓存。\`

\`\`\`JavaScript
SDK.init({ appId: 'YOUR_APP_ID' }, (res) => {
  if (res.code === '200000') {
    console.log('初始化成功, msgId:', res.msgId);
  } else {
    console.log('初始化失败:', res.message);
  }
});
\`\`\`

**回调参数：**

|参数|类型|说明|
|---|---|---|
|code|string|\`'200000'\`=成功，其他=失败|
|message|string|结果描述|
|msgId|string|消息 ID（成功时返回，即本次请求追踪 ID）|

### 4\\.4 打开授权页

调用此方法会启动一键登录授权页，用户授权后将返回认证token。

● 拉起授权页方法会启一键登录授权页面，\`已登录状态请勿调用 。\`
● 一键登录成功率会受网络环境、SIM卡状态等影响，\`不能作为唯一登录方式，建议在拉起授权页失败回调处做降级逻辑处理，\`避免造成自身APP功能异常。
●\`不要连续调用或者在授权页已经展示时调用，\`否则可能会有异常。
● 如果需要修改授权页界面配置，请传入可选界面配置入参\`option\`，详见授权页自定义配置。

\`\`\`JavaScript
SDK.openLoginAuth((res) => {
  if (res.code === '200000') {
    console.log('取号成功, token:', res.token);
    console.log('msgId:', res.msgId);
    // 将 token 发送到业务服务端校验换取手机号
  } else if (res.code === '501') {
    console.log('用户取消授权');
  } else {
    console.log('取号失败:', res.message);
  }
});
\`\`\`

**回调参数：**

|参数|类型|说明|
|---|---|---|
|code|string|\`'200000'\`=成功，\`'501'\`=用户取消，\`'502'\`=用户选择其他登录方式（点击自定义控件），其他=失败|
|message|string|结果描述|
|token|string|取号凭证（成功时返回，用于服务端校验）|
|msgId|string|消息 ID（成功时返回）|
|id|string|自定义控件 ID（\`code='502'\` 且点击的是 customControlStyle 配置的控件时返回，用于区分点击的控件）|

**cfg 可选入参：**

|参数|类型|说明|
|---|---|---|
|option|Object|授权页 UI 配置，详见「6 授权页自定义配置」|
|authLoadSuccess|Function|授权弹窗加载成功回调（V1.1.6 新增），见下文|
|clickListenerCallback|Function|点击登录按钮/协议勾选框监听（V1.1.6 新增），见下文|
|hotspotCheck|number|是否开启热点检测：\`1\`-开启，\`0\`-关闭。SDK 默认策略：已通过 \`preCheckMobile\` 预检查自动传 \`0\`，未预检查自动传 \`1\`；显式传入时优先（V1.1.6 新增）|
|expandParams|string|扩展参数，格式：\`参数名=值\`，多个用 \\| 分割，透传给插件|

> 重试参数 \`retryCount\`/\`retryInterval\` 仅 \`preCheckMobile\` 支持，\`openLoginAuth\` 不提供重试配置。

#### 4\\.4\\.1 授权页事件回调（V1.1.6 新增）

插件 2.3.4 起支持授权页加载成功、勾选协议和用户点击登录按钮的回调，通过 \`openLoginAuth\` 的 cfg 传入：

\`\`\`JavaScript
SDK.openLoginAuth({
  // UI 配置（可选）
  option: { ... },
  // 授权弹窗加载成功
  authLoadSuccess: (res) => {
    console.log('授权页加载成功, msgId:', res.msgId);
    // 适合在这里关闭拉起授权页前的 loading
  },
  // 点击登录按钮和协议勾选框的监听
  clickListenerCallback: (res) => {
    if (res.code === '1') {
      console.log('用户点击登录按钮');
    } else if (res.code === '2') {
      console.log('用户点击协议勾选框, 勾选状态:', res.checked);
    }
  }
}, (res) => {
  // 授权结果回调（同上文）
});
\`\`\`

**authLoadSuccess 回调参数：**

|参数|类型|说明|
|---|---|---|
|code|string|\`'103000'\`|
|message|string|\`'弹窗加载成功'\`|
|msgId|string|消息 ID|

**clickListenerCallback 回调参数：**

|参数|类型|说明|
|---|---|---|
|code|string|\`'1'\`=用户点击登录按钮，\`'2'\`=用户点击协议勾选框|
|checked|boolean|协议勾选状态（仅 \`code='2'\` 时返回）|
|message|string|\`'用户点击登录按钮'\` / \`'用户点击协议勾选框'\`|
|msgId|string|消息 ID|

### 4\\.5 完整调用流程示例

\`\`\`JavaScript
// 1. 初始化
SDK.init({ appId: 'your_app_id' }, (initRes) => {
  if (initRes.code !== '200000') {
    wx.showToast({ title: '初始化失败', icon: 'none' });
    return;
  }

  // 2. 打开授权页（cfg 中可传入授权页事件回调与取号参数，均为可选）
  SDK.openLoginAuth({
    authLoadSuccess: (loadRes) => {
      // 授权弹窗加载成功（V1.1.6 新增），可在此关闭 loading
      wx.hideLoading();
    },
    clickListenerCallback: (clickRes) => {
      // 点击登录按钮 / 协议勾选框监听（V1.1.6 新增）
      console.log('授权页点击事件:', clickRes.code, clickRes.checked);
    }
  }, (authRes) => {
    if (authRes.code === '200000') {
      // 3. 将 token 发送到你的业务服务端
      wx.request({
        url: 'https://your-server.com/api/verify-token',
        method: 'POST',
        data: { token: authRes.token },
        success: (res) => {
          // 4. 登录成功，进入你的业务逻辑
          wx.navigateTo({ url: '/pages/home/home' });
        }
      });
    } else if (authRes.code === '501') {
      wx.showToast({ title: '已取消授权', icon: 'none' });
    } else {
      wx.showToast({ title: authRes.message, icon: 'none' });
    }
  });
});
\`\`\`

## 5 SDK 其他API 说明

### 5\\.1 设置日志开关

通过SDK\\.setLog\\(flag\\)可以设置 SDK 内部 console 日志输出开关。

|参数|类型|说明|
|---|---|---|
|flag|boolean|\`true\`=开启日志，\`false\`=关闭（默认）|

### 5\\.2 设置初始化超时时间

通过SDK\\.setInitTimeout\\(ms\\)可以设置 init 接口超时时间，单位毫秒。

|参数|类型|说明|
|---|---|---|
|ms|number|超时时间（毫秒），默认 \`6000\`|

超时后返回 \`code: '001023', message: '超时'\`。

### 5\\.3 清理初始化缓存

通过SDK\\.clearScripCache\\(\\)可以清理本地初始化缓存。调用后下次 \`init\` 将重新请求服务端获取参数。

## 6 授权页自定义配置

授权页通过 \`SDK.openLoginAuth({ option: { ... } }, callback)\` 传入配置。

### 6\\.1 配置项示例

\`\`\`JavaScript
SDK.openLoginAuth({
  option: {
    logoStyle: {
      src: 'https://example.com/logo.png',
      width: '200rpx',
      height: '200rpx',
    },
    sureBtnStyle: {
      text: '一键登录',
      bgColor: '#2b7de0',
    },
  }
}, (res) => { ... });
\`\`\`

**未勾选协议二次确认弹窗示例（新增于插件 2.3.5 / 移动文档 V1.1.8）：**

默认（\`msgType='0'\`）未勾选协议点击按钮时出现箭头提示框；配置 \`msgType='1'\` 切换为底部提示框：

\`\`\`JavaScript
SDK.openLoginAuth({
  option: {
    msgType: '1',
    msgMaskStyle: { ifShow: true, bgColor: 'rgba(0, 0, 0, 0.5)' },
    msgPanelStyle: { width: '100%', height: '364rpx', bottom: 'center', left: 'center', bgColor: '#FFFFFF', radius: '40rpx' },
    // 其余可选：msgTextStyle / msgLinkStyle / msgSureBtnStyle / msgCancelBtnStyle，详见 6.2
  }
}, (res) => { ... });
\`\`\`

### 6\\.2 配置项详细说明

|配置模块|字段|含义|值|说明|
|---|---|---|---|---|
|**logo**|logoStyle\\.width<br>|Logo 宽度|百分比或数值，如 \`200rpx\`|可选|
||logoStyle\\.height|Logo 高度|百分比或数值|可选|
||logoStyle\\.src|Logo 图片路径|URL 路径|可选，默认创蓝 logo|
||logoStyle\\.top|logo 距页面上边框距离|百分比或数值，如 \`20rpx\`|可选|
||logoStyle\\.left|logo 距页面左边框距离|数值或 \`center\`|可选|
|**小程序名称**|bussinessNameStyle\\.text|小程序名称文案|string|可选|
||bussinessNameStyle\\.fontFamily|文案的字体|string，如\`serif/monospace\`等|可选|
||bussinessNameStyle\\.fontColor|字体颜色|十六进制颜色码，如\`“#FFFFFF”\`|可选|
||bussinessNameStyle\\.fontSize|字体大小|数值，如 \`32rpx\`|可选|
||bussinessNameStyle\\.top|距上边框距离|百分比或数值|可选|
||bussinessNameStyle\\.left|距左边框距离|数值或 \`center\`|可选|
|**授权栏**<br>|authTextStyle\\.fontFamily|文案的字体|string，如\`serif/monospace\`等|可选|
||authTextStyle\\.fontColor|字体颜色|十六进制颜色码，如\`“#FFFFFF”\`|可选|
||authTextStyle\\.fontSize|字体大小|数值|可选|
||authTextStyle\\.top|距上边框距离|百分比或数值|可选|
||authTextStyle\\.left|距左边框距离|数值或 \`center\`|可选|
|**授权提示栏**|authTipStyle\\.ifShow|是否展示提示栏|boolean|可选|
||authTipStyle\\.text|提示栏文案|string|可选|
||authTipStyle\\.width|提示栏宽度|百分比或数值，如 \`200rpx\`|可选|
||authTipStyle\\.fontFamily|文案的字体|string，如\`serif/monospace\`等|可选|
||authTipStyle\\.fontColor|文案的字体颜色|十六进制颜色码，如\`“#FFFFFF”\`|可选|
||authTipStyle\\.fontSize|文案的字体大小|数值<br>|可选|
||authTipStyle\\.top|距上边框距离|百分比或数值|可选|
||authTipStyle\\.left|距左边框距离|数值或 \`center\`|可选|
|**号码栏**|phoneStyle\\.fontFamily|文案的字体|string，如\`serif/monospace\`等|可选|
||phoneStyle\\.fontColor|字体颜色|十六进制颜色码，如\`“#FFFFFF”\`|可选|
||phoneStyle\\.fontSize|文案的字体大小|数值<br>|可选|
||phoneStyle\\.top|距上边框距离|百分比或数值|可选|
||phoneStyle\\.left|距左边框距离|数值或 \`center\`|可选|
|**取消按钮**<br>|cancleBtnStyle\\.text|按钮文案（默认"拒绝"）|string，≤6字|可选|
||cancleBtnStyle\\.textAlign|文案对齐选项|\`“center/left/right”\`|可选|
||cancleBtnStyle\\.fontFamily|文案的字体<br>|string，如\`serif/monospace\`等|可选|
||cancleBtnStyle\\.fontColor|字体颜色|十六进制颜色码，如\`“#FFFFFF”\`|可选|
||cancleBtnStyle\\.fontSize|文案的字体大小|数值<br>|可选|
||cancleBtnStyle\\.top|距上边框距离|百分比或数值|可选|
||cancleBtnStyle\\.left|距左边框距离|数值或 \`center\`|可选|
||cancleBtnStyle\\.width|按钮宽度|百分比或数值|可选|
||cancleBtnStyle\\.height|按钮高度|百分比或数值|可选|
||cancleBtnStyle\\.bgColor|按钮颜色|十六进制颜色码，如\`“#FFFFFF”\`|可选|
||cancleBtnStyle\\.radius|按钮圆角|百分比或数值|可选|
||cancleBtnStyle\\.borderColor|按钮边框颜色|十六进制颜色码，如\`“#FFFFFF”\`|可选|
||cancleBtnStyle\\.borderWidth|按钮边框线宽|数值，如\`“1px”\`|可选|
|**登录按钮**|sureBtnStyle\\.text|按钮文案（默认"授权登录"）|string，≤6字<br>|可选|
||sureBtnStyle\\.textAlign|文案对齐选项|\`“center/left/right”\`|可选|
||sureBtnStyle\\.fontFamily|文案的字体<br>|string，如\`serif/monospace\`等|可选|
||sureBtnStyle\\.fontColor|字体颜色|十六进制颜色码，如\`“#FFFFFF”\`|可选|
||sureBtnStyle\\.fontSize|文案的字体大小|数值<br>|可选|
||sureBtnStyle\\.top|距上边框距离|百分比或数值|可选|
||sureBtnStyle\\.left|距左边框距离|数值或 \`center\`|可选|
||sureBtnStyle\\.width|按钮宽度|百分比或数值|可选|
||sureBtnStyle\\.height|按钮高度|百分比或数值|可选|
||sureBtnStyle\\.bgColor|按钮颜色|十六进制颜色码，如\`“#FFFFFF”\`|可选|
||sureBtnStyle\\.radius|按钮圆角|百分比或数值|可选|
||sureBtnStyle\\.borderColor|按钮边框颜色|十六进制颜色码，如\`“#FFFFFF”\`|可选|
||sureBtnStyle\\.borderWidth|按钮边框线宽|数值，如\`“1px”\`|可选|
|**协议栏**|agreeLineStyle\\.textAlign|文案对齐选项|\`“center/left/right”\`|可选|
||agreeLineStyle\\.fontFamily|文案的字体<br>|string，如\`serif/monospace\`等|可选|
||agreeLineStyle\\.fontColor|字体颜色<br>|十六进制颜色码，如\`“#FFFFFF”\`|可选|
||agreeLineStyle\\.fontSize|文案的字体大小|数值<br>|可选|
||agreeLineStyle\\.top|距上边框距离|百分比或数值|可选|
||agreeLineStyle\\.left|距左边框距离|数值或 \`center\`|可选|
||agreeLineStyle\\.width|文案宽度<br>|百分比或数值|可选|
|**协议勾选****框**|checkBtnStyle\\.uncheck|未选中图标 URL|string|可选|
||checkBtnStyle\\.checked|选中图标 URL|string|可选|
||checkBtnStyle\\.width|图标宽度|百分比或数值|可选|
||checkBtnStyle\\.height|图标高度|百分比或数值|可选|
|**协议名称**|agreeStyle\\.contracts|协议数组<br>|\`[{name:"协议名", url:"链接"}]\`仅支持小程序原生协议页面如：\`url: "/pages/contract/index"\`|可选|
||agreeStyle\\.fontFamily|文案的字体<br>|string，如\`serif/monospace\`等|可选|
||agreeStyle\\.fontColor|字体颜色<br>|十六进制颜色码，如\`“#FFFFFF”\`|可选|
|**自定义控件**|customControlStyle|数组格式|详见下方说明|可选|
|**弹窗**|layerStyle\\.height|弹窗高度|百分比或数值|可选|
||layerStyle\\.radius|弹窗圆角|数值|可选|
||layerStyle\\.bgColor|弹窗背景色|十六进制颜色码|可选|
|**蒙层**|maskStyle\\.ifShowMask|是否显示蒙层|boolean，默认 true|可选|
||maskStyle\\.bgColor|蒙层背景色|十六进制颜色码|可选|
||maskStyle\\.opacity|蒙层透明度|数值|可选|
|**协议提示框类型**|msgType|未勾选协议点击按钮时的提示框类型|\`0\`=箭头提示框（默认），\`1\`=底部提示框|可选（新增于插件 2.3.5 / 移动文档 V1.1.8）|
|**协议提示框蒙层**|msgMaskStyle\\.ifShow|是否展示蒙层|boolean，默认 true|可选|
||msgMaskStyle\\.bgColor|蒙层背景颜色|颜色码，如 \`rgba(0, 0, 0, 0.5)\`|可选|
|**协议提示框面板**|msgPanelStyle\\.width|面板宽度|百分比或数值|可选|
||msgPanelStyle\\.height|面板高度|百分比或数值，如 \`364rpx\`|可选|
||msgPanelStyle\\.bottom|面板距可视区域底部距离|\`center\` / 百分比 / 数值|可选|
||msgPanelStyle\\.left|面板距左边距离|\`center\` / 百分比 / 数值|可选|
||msgPanelStyle\\.bgColor|面板背景颜色|十六进制颜色码|可选|
||msgPanelStyle\\.radius|面板圆角|百分比或数值|可选|
|**协议提示框协议栏**|msgTextStyle\\.fontFamily|文案字体|string|可选|
||msgTextStyle\\.top|文案距面板顶部高度|百分比或数值|可选|
||msgTextStyle\\.left|文案距面板左边框距离|百分比或数值|可选|
||msgTextStyle\\.textAlign|文案对齐|\`center/left/right\`|可选|
||msgTextStyle\\.fontColor|文案字体颜色|十六进制颜色码|可选|
|**协议提示框协议样式**|msgLinkStyle\\.fontFamily|协议名称字体|string|可选|
||msgLinkStyle\\.fontColor|协议名称字体颜色|十六进制颜色码|可选|
|**协议提示框确认按钮**|msgSureBtnStyle\\.top|按钮距面板顶部高度|百分比或数值|可选|
||msgSureBtnStyle\\.left|按钮距面板左边距离|百分比或数值|可选|
||msgSureBtnStyle\\.text|按钮文案|string，不超过 6 字|可选|
||msgSureBtnStyle\\.fontSize|字体大小|数值，如 \`32rpx\`|可选|
||msgSureBtnStyle\\.fontColor|文案字体颜色|十六进制颜色码|可选|
||msgSureBtnStyle\\.textAlign|文案对齐|\`center/left/right\`|可选|
||msgSureBtnStyle\\.bgColor|按钮背景颜色|十六进制颜色码|可选|
||msgSureBtnStyle\\.radius|按钮圆角|百分比或数值|可选|
||msgSureBtnStyle\\.bgImage|按钮背景图像|url|可选|
||msgSureBtnStyle\\.bgPosition|背景图像起始位置|string，默认 \`center\`|可选|
||msgSureBtnStyle\\.bgRepeat|是否及如何重复背景图像|string，默认 \`no-repeat\`|可选|
||msgSureBtnStyle\\.bgSize|背景图像尺寸|string，默认 \`contain\`|可选|
|**协议提示框取消按钮**|msgCancelBtnStyle\\.top|按钮距面板顶部高度|百分比或数值|可选|
||msgCancelBtnStyle\\.left|按钮距面板左边距离|百分比或数值|可选|
||msgCancelBtnStyle\\.text|按钮文案|string，不超过 6 字|可选|
||msgCancelBtnStyle\\.fontSize|字体大小|数值，如 \`32rpx\`|可选|
||msgCancelBtnStyle\\.fontColor|文案字体颜色|十六进制颜色码|可选|
||msgCancelBtnStyle\\.textAlign|文案对齐|\`center/left/right\`|可选|
||msgCancelBtnStyle\\.bgColor|按钮背景颜色|十六进制颜色码|可选|
||msgCancelBtnStyle\\.radius|按钮圆角|百分比或数值|可选|
||msgCancelBtnStyle\\.bgImage|按钮背景图像|url|可选|
||msgCancelBtnStyle\\.bgPosition|背景图像起始位置|string，默认 \`center\`|可选|
||msgCancelBtnStyle\\.bgRepeat|是否及如何重复背景图像|string，默认 \`no-repeat\`|可选|
||msgCancelBtnStyle\\.bgSize|背景图像尺寸|string，默认 \`contain\`|可选|

### 6\\.3 自定义控件说明

\`customControlStyle\` 为数组格式，支持在授权页添加自定义按钮控件。

|字段|含义|值|说明|
|---|---|---|---|
|ifShow|是否展示|boolean，默认 false|必选|
|id|控件 ID|string|可选；用户点击该控件返回 \`code='502'\` 时，id 会随 openLoginAuth 回调返回，用于区分点击的是哪个控件|
|openType|跳转方式|\`navigate/redirect/switchTab/reLaunch/navigateBack\`，取值说明见下表|可选|
|name|显示文案|string|可选|
|width|宽度|百分比或数值|可选|
|height|高度|百分比或数值|可选|
|top|距弹窗上边框距离|百分比或数值|可选|
|left|距弹窗左边框距离|百分比或数值|可选|
|fontFamily|文案的字体<br>|string，如\`serif/monospace\`等|可选|
|fontColor|字体颜色<br>|十六进制颜色码，如\`“#FFFFFF”\`|可选|
|fontSize|字体大小|数值|可选|
|bgColor|背景颜色|十六进制颜色码，如\`“#FFFFFF”\`|可选|
|textAlign|文本对齐|\`center/left/right\`|可选|
|radius|圆角|数值|可选|
|url|跳转 URL|URL 链接，如 \`/pages/contract/index\`|跳转类控件必选；\`openType='navigateBack'\`（返回）时无需传|

**openType 取值说明**（对应微信小程序标准页面跳转 API）：

|取值|对应 API|行为|
|---|---|---|
|\`navigate\`|\`wx.navigateTo\`|保留当前页跳转到应用内页面（新页面入栈，可返回）|
|\`redirect\`|\`wx.redirectTo\`|关闭当前页跳转（替换当前页面，不可返回授权前页面）|
|\`switchTab\`|\`wx.switchTab\`|跳转到 tabBar 页（同时关闭其他非 tabBar 页面）|
|\`reLaunch\`|\`wx.reLaunch\`|关闭所有页面后跳转（重置导航栈）|
|\`navigateBack\`|\`wx.navigateBack\`|返回上一页（无需传 \`url\`），常用于授权页左上角"返回"按钮|

> 移动官方文档未标注 openType 默认值，建议显式传入。跳转目标页面需在小程序 \`app.json\` 的 \`pages\` 中注册（tabBar 页需在 \`tabBar.list\` 中）。

## 7 返回码说明

### 7\\.1 SDK 返回码

|返回码|描述|说明|
|---|---|---|
|200000|成功|初始化/取号成功|
|001023|超时|init 接口超时|
|000400|服务端响应为空|服务端未返回有效数据|
|000401|请求服务端失败|网络请求异常|
|000402|初始化失败|init 请求返回业务失败（详细 retCode/retMsg 见日志上报 inner 层）|
|000500|请先调用 init 初始化|openLoginAuth 前未调用 init|
|000501|移动 appId 未初始化|cmccAppId 未获取到|
|000520|appId 必传|init 未传入 appId|
|000600|SDK 初始化异常|初始化过程发生异常|
|000601|SDK 响应处理异常|处理服务端响应时发生异常|
|000602|Token 签名计算异常|签名计算过程发生异常|
|000603|Token UUID 生成异常|UUID 生成失败|
|000604|Token 处理异常|Token 处理过程发生异常|
|000605|Token 插件调用异常|调用取号插件时发生异常|
|000606|网络类型处理异常|网络类型处理时发生异常|
|000607|网络类型调用异常|网络类型调用时发生异常|
|000001|获取网络类型失败|获取网络类型失败|
|000002|运营商返回失败：{运营商原始返回信息}|运营商返回无 code 的失败结构（如 YDData/CTData/CUData 三网聚合错误），message 拼接运营商原始返回 JSON|

### 7\\.2 运营商返回码

**移动取号：**

|返回码|描述|
|---|---|
|103000|成功|
|500|网络异常，请检查网络设置|
|503|参数缺失|
|130010|参数为空|
|105002|移动网关取号失败|
|105112|时间戳非法|
|105113|APPID 非法或为空|
|103101|错误的请求签名|
|110023|应用没有权益|
|110025|权益已失效|
|110029|微信 appid 校验失败|

**电信取号：**

|返回码|描述|
|---|---|
|103000|成功|
|301|参数错误|
|500|网络异常|
|502|电信/联通取号能力关闭|
|105003|电信网关取号失败|
|110023|应用没有权益|
|110025|权益已失效|

**联通取号：**

|返回码|描述|
|---|---|
|103000|成功|
|500|网络异常|
|502|电信/联通取号能力关闭|
|105001|联通网关取号失败|
|110023|应用没有权益|
|110025|权益已失效|

**获取 token：**

|返回码|描述|
|---|---|
|501|用户取消授权|
|502|用户选择其他登录方式|
|103002|没有填写必传参数|
|104000|app 不存在|
|104001|businessType 校验失败|
|104003|应用没有权益|
|104004|权益已失效|
|104007|accessToken 不存在（token 有效期 2 分钟）|
|104008|accessToken 校验失败|
|104011|手机号不能为空|
|104012|本机号码校验失败|`
};
