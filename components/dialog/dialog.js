Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isData: {
      type: Object,
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    // path:'../../public/image',
    // path:'https://t-html.mmuugg.com/vbibi/public/image',
    path:'https://hfc-static.mmuugg.com/image',//正式
    screenH:wx.getSystemInfoSync().windowHeight,
    screenW:wx.getSystemInfoSync().windowWidth,
    dialogHidden:false,

  },

  ready(){
    const that = this;


    wx.getUserInfo({
      success: function(res) {
        that.setData({
          userInfo: res.userInfo
        })
      }
    })

    console.log(this.data.isData.txt)
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 取消
    closeDialog:function(){
      const that = this;
      // that.triggerEvent('myevent',this.data.popHidden)
      that.setData({
        dialogHidden:that.data.dialogHidden
      })
      that.triggerEvent('myevent',that.data.dialogHidden)
    },
  },
})