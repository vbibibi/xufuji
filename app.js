//app.js
const mtjwxsdk = require("./utils/mtj-wx-sdk.js");
const {sourceMapping , mediumMapping} = require('./utils/utmMapping.js');
const util = require('./utils/util.js');
App({
  onLaunch: function (options) {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    // 首次进入必须调用登录接口
    // wx.login({
    //   success: res => {
    //     // 发送 res.code 到后台换取 openId, sessionKey, unionId
    //     console.log(res)
    //     util.wxRequest({
    //       url:'/auth/login',
    //       params:{code:res.code}
    //     }).then( (res)=>{
    //       console.log(res)
    //       wx.hideLoading();
    //       if(res.code == 0){
    //         wx.setStorageSync('token',res.data.token);   
    //         wx.setStorageSync('shareId',res.data.member_info.id);
    //         console.log(wx.getStorageSync('shareId'))
    //       }else{
    //       }
    //     })
    //   }
    // })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
    // console.log(decodeURIComponent('share_id=100010&fk=1&aid=1'))
    // options.query.scene = 's=100010&fk=1&ad=1&sc=S01~M01';
    if (options.query.scene) {
        // console.log(options.query.scene)
        console.log(decodeURIComponent(options.query.scene))
        options.query.scene = decodeURIComponent(options.query.scene)
      // 扫描小程序码进入 -- 解析携带参数
      // 太阳码地址如：https://content-mini.amway.com.cn/api/code/wechat?page=pages/index/index&scene=S01~M01
      // 实际解析到小程序的路径如：/pages/index/index?scene=S01~M01
      // console.log(decodeURIComponent(options.query.scene).indexOf('~'))
      if(decodeURIComponent(options.query.scene).indexOf('~') > -1){
        const [s, m] = decodeURIComponent(options.query.scene).split('~')
        const utm = {
          utm_source:s.toLowerCase().slice(-3),
          utm_medium:m.toLowerCase().slice(0,3)
        }
        console.log(utm)
        this.globalData.utm = utm;
        setTimeout(() => {
          util.setmtjMethod(utm)
        }, 500);
      }
    }
  },
  globalData: {
    userInfo: null,
    isIpx: false, // 是否是iphoneX尺寸
    isScale:1,//缩放
    utm:null,
    statusBarHeight:wx.getSystemInfoSync()['statusBarHeight'],
    getAllBarHeight:wx.getSystemInfoSync()['statusBarHeight']*2
  }
})