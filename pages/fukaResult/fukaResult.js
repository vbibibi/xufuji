// pages/home/home.js
var util = require('../../utils/util.js');
Page({
  /*** 页面的初始数据*/
  data: {
    headerHeight:0,
    isPopUpShow:false, //分享组件
    // path:'../../public/image',
    path:'https://hfc-static.mmuugg.com/image',//正式
    isIpx:util.iphoneXSize(),
    isScale:1,
    screenH:wx.getSystemInfoSync().windowHeight,
    screenW:wx.getSystemInfoSync().windowWidth,
    fukaArr:[
      {id:0,src: '/fukaResult/fuka1.png',text:"",hidden:false},
      {id:1,src: '/fukaResult/fuka2.png',text:"",hidden:false},
      {id:2,src: '/fukaResult/fuka3.png',text:"",hidden:true},
      {id:3,src: '/fukaResult/fuka4.png',text:"",hidden:true},
      {id:4,src: '/fukaResult/fuka5.png',text:"",hidden:true},
    ],
    btnPath:'',
    shareId:0,
    dialogData:{
      txt:[],
      isHidden:false,
    },
    posterDataInfo:{
      image_id: 0,
      is_create: 0,
      receive_coupon_count: 0,
      share_count: 0,
      today_receive: 0,
      voice_id: 0,
      voice_url: "",
    },
    setTimer:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    // const utm = getApp().globalData.utm;
    // util.setmtjMethod(utm)
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage']
    })

    that.setData({
      isIpx:util.iphoneXSize(),
      shareId:wx.getStorageSync('shareId'),
      headerHeight:util.getBarHeight()
    })
  
    that.getPosterData();
    that.data.setTimer = setInterval(() => {
      that.getPosterData();
    }, 8000)
  },
  getPosterData:function(){
    const that = this;
    util.getPosterInfo().then( (res) => {
        that.data.fukaArr.forEach(function(item,index){
          item.hidden = (index-1 <= res.data.share_count) ? false : true;
        })
        that.setData({
          posterDataInfo:res.data,
          fukaArr:that.data.fukaArr,
        })
    })
  },
  goCoupon:function(){
    const that = this;
    getApp().mtj.trackEvent('draw');
    wx.navigateToMiniProgram({
      appId: 'wxffb7d80f8c50ac5c',
      path: 'pages/home/home?activityId=12038128&type=12&business=xfjfk',
      envVersion: 'release',// 打开正式版
      success(res) {
        // 当前只允许可以领券才触发接口
        console.log(res)
        util.wxRequest({
          url:'/Activity/receive_coupon',
          method:'GET',
        }).then( (res)=>{   
          wx.redirectTo({
            url: '/pages/index/index',
          })
        })
      },
      fail: function (err) {
          console.log(err);
        }
    })
  },
  // 接受组件参数
  getChiild:function(e){
    const data = e.detail;
    const that = this;
    that.setData({
      isPopUpShow:data.popHidden
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
  bindShareInfo:function(){
    this.setData({
      isPopUpShow:true
    })
  },
  // 分享成功设置信息
  onShareAppMessage:function(res) {
    const that = this;
    const shareId = wx.getStorageSync('shareId')
    const poster = that.data.posterDataInfo; //海报信息
    if (res.from == 'button') {
        console.log(res.target, res)
    }
    return {
      title:'我为你定制了赵丽颖原声祝福，快来听听吧！',
      path:'/pages/detail/detail?sd='+shareId+'&fk='+poster.image_id+'&ad='+poster.voice_id,//这里是被分享的人点击进来之后的页面
      imageUrl: that.data.path+'/poster.jpg',//这里是图片的路径
      success: function (res) { 
        // 其他逻辑实现 
      }
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
    clearInterval(this.data.setTimer)
    this.data.setTimer = null
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