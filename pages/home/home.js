//index.js
//获取应用实例
const app = getApp()
Page({
  data: {
    kv_src:'',
    isX:false,
    pageW:0,
    pageH:0,
    p:"",
  },
  //事件处理函数
  bindViewTap: function() {
    
  },
  onLoad: function () {
    var h = wx.getSystemInfoSync().windowHeight;
    var w = wx.getSystemInfoSync().windowWidth;
    console.log(h/w)
    if(h/w > 16/9){
      this.setData({
        kv_src:'../../public/image/index_x.jpg',
        isX:true
      })
    }else{
      this.setData({
        kv_src:'../../public/image/index.jpg',
        isX:false
      })
    }
  }
})
