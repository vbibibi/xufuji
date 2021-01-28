var util = require('../../utils/util.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    homeBtn:{
      type:Boolean,
      value:true
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    path:'https://hfc-static.mmuugg.com/image',//正式
    screenH:wx.getSystemInfoSync().windowHeight,
    screenW:wx.getSystemInfoSync().windowWidth,
    dialogHidden:false,
    statusBarHeight: getApp().globalData.statusBarHeight,
    isIpx:util.iphoneXSize(),
  },

  ready(){
    const that = this;
    console.log(this.data.isIpx)
    console.log(this.data.homeBtn)
  },
  onload(){
   
  },
  /**
   * 组件的方法列表
   */
  methods: {
    goHome(){
      wx.redirectTo({
        url: '/pages/index/index?create=0',
      })
    },
  },
})