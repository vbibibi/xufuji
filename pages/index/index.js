// pages/home/home.js
var util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    homeBtn:false, //头部导航是否显示返回按钮
    headerHeight:0,//头部导航总高度
    isIpx:false,
    // path:'../../public/image/home',
    // path:'https://t-html.mmuugg.com/vbibi/public/image',
    path:'https://hfc-static.mmuugg.com/image',//正式
    isLogin:false,//登录状态
    isAuthor:false,//授权状态
    screenH:wx.getSystemInfoSync().windowHeight,
    screenW:wx.getSystemInfoSync().windowWidth,
    audioArr:[],
    fukaArr:[
      {id:1},
      {id:2},
      {id:3},
      {id:4},
      {id:5},
    ],
    currentAduio:null,//当前播放音频
    currentFukaId:null,
    currentAudioId:null,
    currentAduioUrl:null,
    rule:false,
    dialogData:{
      txt:[],
      isHidden:false,
    },
    isHome:false,
    is_clean:1, //默认清楚点亮数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    // 渠道监听
    // const utm = getApp().globalData.utm;
    // util.setmtjMethod(utm)
    
    if(options.create && options.create == 0) {
      console.log("已生成状态回首页")
      // 返回首页不清空点亮数
      that.fukaInfo();
      that.setData({
        is_clean:0
      })
    }else{
      console.log("未生成状态回首页")
      util.getPosterInfo().then( (res) => {
        const data = res.data;
        wx.setStorageSync('posterInfo',JSON.stringify(data)) //保存信息
        if(data.is_create === 1){
          // 自己再次进入先获取生成状态
          wx.redirectTo({
            url: '/pages/fukaResult/fukaResult'
          })    
        }else{
          that.fukaInfo();
        }
      })
      
    }
    that.setData({
      isIpx:util.iphoneXSize(this.screenH),
      isHome:true,
      headerHeight:util.getBarHeight()
    })
  },
  // 提示弹窗组件
  getDialog:function(e){
    const that = this;
    that.data.dialogData.isHidden = e.detail;
    this.setData({
      dialogData:that.data.dialogData
    })
  },
  // 获取福卡信息
  fukaInfo:function(){
    const that = this;
    // /System/getVoiceList
    util.wxRequest({
      url:'/System/getVoiceList',
      method:"POST",
    }).then( (res)=>{
      const list = res.data.list
      that.data.audioArr = list.map((m,n) => {
        m.isplay = false;
        m.audioCtx = null;
        return m
      })
      that.setData({
        audioArr:that.data.audioArr
      })
      that.creatAudio();
    })
  },
  // 创建音频
  creatAudio:function(){
    const that = this;
    that.data.audioArr.map(function(m,n){
      m.audioCtx = wx.createAudioContext('myAudio'+m.id);
    })
    console.log(that.data.audioArr)
  },
  audioPlay: function (id) {
    const that = this;
    const index = id;
    const audio = that.data.audioArr;

    audio.map((m,n) => {
      if(index != m.id) {
        audio[n].isplay  = false;
        audio[n].audioCtx.pause();
      }
    })

    if(audio[index-1].isplay){
      audio[index-1].audioCtx.pause();
    }else{
      audio[index-1].audioCtx.play();
      audio[index-1].audioCtx.seek(0)
    }

    audio[index-1].isplay = !audio[index-1].isplay;

    that.setData({
      audioArr:audio,
      currentAduio:index
    })

  },
  // 监听音频播放完成
  funended :function(){
    console.log("播放完成");
    this.data.audioArr[this.data.currentAudioId-1].isplay = false;
    this.setData({
      audioArr:this.data.audioArr
    })
  },
  // 福卡选择事件
  fukaClick:function(e){
    let index = e.currentTarget.dataset['index'];
    console.log(`card${index+1}`)
    getApp().mtj.trackEvent(`card${index+1}`);

    this.setData({
      currentFukaId:index+1
    })
  },
  // 音频选择事件
  audioClick:function(e){
    let id = e.currentTarget.dataset['index'];
    getApp().mtj.trackEvent(`sound${id}`);
    this.setData({
      currentAudioId:id,
      currentAduioUrl:this.data.audioArr[id-1].url
    })
    this.audioPlay(id);
  },
  // 授权 下一步生成
  bindgetuserinfo:function(res){
    const that = this;
    getApp().mtj.trackEvent('generatecard');

    if (res.detail.userInfo) {
      wx.setStorageSync('userInfo', JSON.stringify(res.detail.userInfo))
      that.setData({
        isAuthor : true,
        userInfo:res.detail.userInfo
      })
   
      if(that.data.currentFukaId && that.data.currentAudioId){
        // 判断是否已选择福卡和音频
        util.wxRequest({
          url:'/activity/create_poster',
          method:"POST",
          params:{
            voice_id:that.data.currentAudioId,
            image_id:that.data.currentFukaId,
            is_clean:that.data.is_clean
          }
        }).then( (res)=>{
            const audioId = that.data.currentAudioId;
            //跳转前切断音频
            if(that.data.audioArr[audioId-1].isplay){
              that.audioPlay(audioId)
            }
            wx.redirectTo({
              url:"/pages/detail/detail?fk="+that.data.currentFukaId+"&ad="+that.data.currentAudioId
              // url:'/pages/detail/detail?sd%3D10010%26fk%3D2%26ad%3D4'
            })
        })
      }else{
        // 未选择福卡或者音频
        that.data.dialogData.isHidden = true;
        that.data.dialogData.txt[0] = '请选择你要生成的福卡和音频!';
        that.setData({
          dialogData:that.data.dialogData
        })
      }
      // next 下一步
    }else{
      wx.showToast({
        title: '小程序需要您的微信授权信息才能进入。',
        icon:'none',
        duration:3000
      })
      this.setData({
        isLogin : false,
        userInfo:null
      })
      // return； 提示不授权不允许下一步
    }
  },
  ruleShow:function(){
    getApp().mtj.trackEvent('rule');
    this.setData({rule:true})
  },
  ruleHide:function(){
    this.setData({
      rule:false
    })
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})