// pages/home/home.js
var util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    headerHeight:0,
    isPopUpShow:false, //分享组件
    // path:'../../public/image',
    // path:'https://t-html.mmuugg.com/vbibi/public/image',
    path:'https://hfc-static.mmuugg.com/image',//正式
    coverPath:'',
    isIpx:util.iphoneXSize(),
    isScale:1,
    screenH:wx.getSystemInfoSync().windowHeight,
    screenW:wx.getSystemInfoSync().windowWidth,
    audioArr:[
      {id:0,src:"",text:"大家好，我是赵丽颖。在这里给大家拜年啦，祝大家新年快乐"},
      {id:1,src:"",text:"大家好，我是赵丽颖。过新年，好美味，让我为大家用美味点亮幸福时刻"},
      {id:2,src:"",text:"大家好，我是赵丽颖。由我来给大家发糖啦,新年新惊喜，“颖”你才甜蜜"},
      {id:3,src:"",text:"大家好，我是赵丽颖。这个春节，让我为大家送上红火的事业运"},
      {id:4,src:"",text:"大家好，我是赵丽颖。过年也给你发糖，来吃颗糖甜一下"},
    ],
    isLogin:true, //是否授权登录
    fukaId:null,
    audioId:null,
    audioUrl:'',
    shareId:null,
    showGoHomeBtn:false,
    audioCtx:null,
    isplay:false,
    dialogData:{
      txt:[],
      isHidden:false,
    },
    posterDataInfo:null,
    isMessageShow:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var new_options = options; //获取参数
    
    if(options.scene && decodeURIComponent(options.scene).indexOf('&') > -1){
      // 海报二维码进入
      console.log(decodeURIComponent(options.scene))
      const value = decodeURIComponent(options.scene); //乱码数据转译
      var optionsArr = value.split('&'); // 把原有需要的参数解析
      var keyObj = {}; //新的对象存参数
      optionsArr.map((m,n) => {
        var key = m.split("=");
        keyObj[key[0]] = key[1];
      })
      new_options = keyObj
    }
    console.log(new_options)
    // 设置分享按钮
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage']
    })

    if(new_options.sd){
      if(wx.getStorageSync('shareId') == new_options.sd){// 自己进入
        this.shareCountFunc()
      }else {// 朋友进入
        this.setData({
          showGoHomeBtn:true, //跳转首页按钮
        })
        this.shareInPage(new_options.sd);
      }
    }else{
      if(wx.getStorageSync('posterInfo')){
        var poster = JSON.parse(wx.getStorageSync('posterInfo'));
        this.setData({ posterDataInfo:poster})
      }else {
        util.getPosterInfo().then( (res) => {
          this.setData({posterDataInfo:res.data})
        })
      }
     
    }
    this.setData({
      isIpx:util.iphoneXSize(),
      fukaId:new_options.fk, //福卡id
      audioId:new_options.ad || 0, //音频id
      audioUrl:'https://hfc-static.mmuugg.com/voice/vo'+new_options.ad+'.mp3', //音频地址
      coverPath:this.data.path+'/detail/cover'+new_options.fk+'.png?v=1', //海报图片
      shareId:wx.getStorageSync('shareId'), //本人id 或者是分享人id
      headerHeight:util.getBarHeight()
    })

  },
  audioPlay:function(){
    if(this.data.audioCtx == null){
      this.data.audioCtx= wx.createAudioContext('myAudio');
    }
    const that = this;
    if(that.data.isplay){
      that.data.audioCtx.pause();
    }else{
      that.data.audioCtx.play();
      // that.data.audioCtx.seek(0)
    }
    that.setData({
      isplay:!that.data.isplay,
      audioCtx:that.data.audioCtx
    })
  },
  // 监听音频播放完成
  funended :function(){
    this.setData({
      isplay:false
    })
  },
  // 接受组件参数
  getChiild:function(e){
    const data = e.detail;
    this.setData({
      isPopUpShow:data.popHidden
    })
    // // 保存海报和分享后调起订阅消息
    if(data.share == 1 || data.poster == 1){
      setTimeout(() => {
        wx.redirectTo({
          url:'/pages/fukaResult/fukaResult'
        })
      },300);
      
    }
  },
  getTip :function(){
    // 分享前的判断
    const that = this;
    const poster = that.data.posterDataInfo;
    const dialog = that.data.dialogData;
    if(poster.receive_coupon_count > 1){
      dialog.isHidden = true;
      dialog.txt[0] = '活动期间每人领券共两次。'
      dialog.txt[1] = '若您的两张券已领完，'
      dialog.txt[2] = '分享给好友，好友也可参与领券哦。'
    }else if(poster.today_receive === 1){
      dialog.isHidden = true;
      dialog.txt[0] = '每人一天领券一次。'
      dialog.txt[1] = '若您今天的领券次数已用完，'
      dialog.txt[2] = '分享给好友，好友也可参与领券哦。'
    }else {
      that.setData({
        isPopUpShow:true
      })
    }
    
    that.setData({
      dialogData:dialog
    })
  },
  // 提示弹窗组件
  getDialog:function(e){
    const that = this;
    that.data.dialogData.isHidden = e.detail;
    that.setData({
      dialogData:that.data.dialogData,
      isPopUpShow:true
    })
  },
  onMessageFunc:function(){
    console.log("订阅消息")
    const that = this;
    wx.requestSubscribeMessage({
      tmplIds: ['kS-X_ZcC1DbrnqWjdkIwcvDsdCJn6hdAZ0L-DR20fws','NSWqU7wh7zJ6A77R1j43lv16qfQVjP6rYELFqS0uKpY','kcJOTaQZsdjCgIAYCibIrZ_egWR88rL0FIHVr5GSNBk'],           
      success (res) { 
        if (res["kS-X_ZcC1DbrnqWjdkIwcvDsdCJn6hdAZ0L-DR20fws"] == "accept") {
          that.data.isMessageShow = true
        } else if(res["kS-X_ZcC1DbrnqWjdkIwcvDsdCJn6hdAZ0L-DR20fws"] == "reject") {
          that.data.isMessageShow = false
        }
      },
      fail (res) {
        console.log(res)
        // if(res.errCode == 20004) {
        //   wx.showModal({
        //     title: '提示',
        //     content: "检测到您没有开启订阅消息的权限，是否去设置？",
        //     showCancel: true,
        //     cancelText: "否",
        //     confirmText: "是",
        //     success: function (res1) {
        //       if (res1.confirm) { //用户点击确定'
        //         wx.getSetting({
        //           withSubscriptions: true,
        //           success: res3 => {
        //             console.log(res3)
        //             let {
        //               authSetting = {},
        //               subscriptionsSetting: { mainSwitch = false, itemSettings = {} } = {}
        //             } = res3;
            
        //             if ( (authSetting['scope.subscribeMessage'] || mainSwitch) && itemSettings[pushReservationTmplIds] === 'accept') {
        //               that.onMessageFunc();
        //               console.log('用户手动开启同意了，订阅消息');
        //             } else {
        //               console.log("您没有同意授权订阅消息")
        //             }
        //           }
        //         })
        //       } else {
                
        //       }
        //     }
        //   })
        // }
        
      },
      complete (res) {
        console.log(res)
        that.setData({
          isMessageShow:that.data.isMessageShow
        })
        that.getTip()
      }
    })
  },
  // 分享成功设置信息
  onShareAppMessage:function(res) {
    console.log("触发分享")
    const that = this;
    if (res.from == 'button') {
        console.log(res.target, res)
    }
    return {
      title:'我为你定制了赵丽颖原声祝福，快来听听吧！',
      path:'/pages/detail/detail?sd='+that.data.shareId+'&fk='+that.data.fukaId+'&ad='+that.data.audioId,//这里是被分享的人点击进来之后的页面
      imageUrl: that.data.path+'/poster.jpg',//这里是图片的路径
      success: function (res) { 
    
      }
    }
  },
  // 分享链接进入
  shareInPage:function(id){
    console.log("朋友进入触发接口")
    const that = this;
    util.wxRequest({
      url:'/Activity/acceptShare',
      method:"POST",
      params:{share_member_id:id}
    }).then( (res)=>{
        
    })
  },
  // 自己进入
  shareCountFunc:function(){
    this.getPageShow();
  },
  // 用于判断页面跳转
  getPageShow(){
    const that = this;
    util.getPosterInfo().then( (res) => {
      const data = res.data;
      that.setData({
        posterDataInfo:data
      })
      if(data.is_create == 1){
        wx.redirectTo({
          url:"/pages/fukaResult/fukaResult"
        })
      }else {
        wx.redirectTo({
          url:"/pages/index/index"
        })
      }
    })
  },
  friendShowBtn(){
    getApp().mtj.trackEvent('frienddraw');
    this.getPageShow();
  },
  // 订阅消息
  bindShareBox:function(){
    getApp().mtj.trackEvent('share');
    if(this.data.isMessageShow){
      this.setData({
        isPopUpShow:true
      })
    } else {
      this.onMessageFunc();
    }
  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.hideHomeButton();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },


})