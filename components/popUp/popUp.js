var util = require('../../utils/util.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isHidden: {
      type: Boolean,
      value: false
    },
    shareId: {
      type: String,
      value:''
    },
    coverPathId: {
      type: Number,
      value:0
    },
    audioId: {
      type: Number,
      value:0
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    // path:'https://t-html.mmuugg.com/vbibi/public/image', //'../../public/image',
    path:'https://hfc-static.mmuugg.com/image',//正式
    path1:'../../public/image' ,
    screenH:wx.getSystemInfoSync().windowHeight,
    screenW:wx.getSystemInfoSync().windowWidth,
    imagePath:'',//canvas生成图片路径
    saveBtn:false,
    userInfo:null,
    canvasHidden:false,
    isPoster:false,
    popHidden:false,
    shareId:'',
    codeUrl:'',//二维码图片
    avatarUrl:'',
    isIpx:util.iphoneXSize(),
    statusBarHeight: getApp().globalData.statusBarHeight,
    headerHeight:0,
    
  },

  onload(){
    const that = this;
    // 设置分享按钮
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage']
    })
    
    that.downloadImage();
    // that.setCanvasImage()
  },
  /**
   * 组件的方法列表
   */
  methods: {
    downloadImage:function(){
      const that = this;
      wx.getUserInfo({
        success: function(res) {
          that.setData({
            userInfo: res.userInfo,
          })
          wx.downloadFile({
            url:res.userInfo.avatarUrl , //仅为示例，并非真实的资源
            success (res) {
              if (res.statusCode === 200) {
                that.setData({
                  avatarUrl:res.tempFilePath
                })
              }
            }
          })
          // 生成二维码
          that.getCode();
        }
      })      
    },
    // 生成海报
    sendCover:function(){
      getApp().mtj.trackEvent('generateposter');
      this.downloadImage();
      this.setData({
        saveBtn:true,
        isPoster:true,
        headerHeight:util.getBarHeight()
      })
    },
    // 取消
    cancelPop:function(){
      const that = this;
      that.data.popHidden = false;
      // that.triggerEvent('myevent',this.data.popHidden)
      that.setData({
         saveBtn:false,
         isPoster:false,
         popHidden:false
      })
      that.getTrigger(that.data.popHidden,0,0);
    },
    getTrigger:function(pop,share,poster){
      const that = this;
      const isData = {
        popHidden:pop,
        share:share,
        poster:poster,
      }
      that.triggerEvent('myevent',isData)
    },
    // 分享朋友
    bindShareInfo:function(){
      getApp().mtj.trackEvent('sharewechat');
      // this.bindSendMessage();
      this.getTrigger(this.data.popHidden,1,0)
      
    },
    // 获取海报二维码接口
    getCode:function(){
      const that = this;
      console.log("二维码")
      // console.log('sd='+that.data.shareId+'&fk='+that.data.coverPathId+'&ad='+that.data.audioId+'&sc=S05~M03')
      // const str = 'sd='+that.data.shareId+'&fk='+that.data.coverPathId+'&ad='+that.data.audioId+'&sc=S05~M03'
      // console.log(str.length)
      util.wxRequest({
        url:'/Poster/getPoster',
        method:"POST",
        params:{
          path: `pages/detail/detail`,
          scene: 'sd='+that.data.shareId+'&fk='+that.data.coverPathId+'&ad='+that.data.audioId+'&sc=S05~M03'
        }
      }).then( (res)=>{
          // console.log(res)
          if(res.pic_url != ''){
            wx.downloadFile({
              url:res.pic_url , //仅为示例，并非真实的资源
              success (res) {
                console.log(res)
                // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
                // var url = '';
                if (res.statusCode === 200) {
                  that.setData({
                    codeUrl:res.tempFilePath
                  })
                  that.setCanvasImage()
                }
              }
            })
            
            
          }else {
            that.setCanvasImage()
          }
          
      })
    },
    checkAuthentication: function() {
      console.log('相册授权')
      var that = this;
      // var url = that.data.imagePath;
      // wx.getSetting获取用户的当前设置。返回值中只会出现小程序已经向用户请求过的权限
      wx.getSetting({
          success: (res) => {
            console.log(res)
              //检查是否有访问相册的权限，如果没有则通过wx.authorize方法授权
              console.log(res.authSetting['scope.writePhotosAlbum'])
              if (!res.authSetting['scope.writePhotosAlbum'] || res.authSetting['scope.writePhotosAlbum'] == false) {
                console.log("去授权")
                  wx.authorize({
                      scope: 'scope.writePhotosAlbum',
                      success: (res) => {
                          //用户点击允许获取相册信息后进入下载保存逻辑
                          that.saveCanvasImage()
                      },
                      fail: (res) => {
                        console.log(res)
                        wx.hideLoading()
                        wx.showModal({
                          title: '提示',
                          content: "小程序需要您的微信授权保存图片，是否重新授权？",
                          showCancel: true,
                          cancelText: "否",
                          confirmText: "是",
                          success: function (res2) {
                            if (res2.confirm) { //用户点击确定'
                              wx.openSetting({
                                success: (res3) => {
                                  if (res3.authSetting['scope.writePhotosAlbum']) {
                                    //已授权
                                    that.saveCanvasImage()
                                  } 
                                }
                              })
                            } else {
                              
                            }
                          }
                        })
                      }
                  })
              } else {
                that.saveCanvasImage()
              }
            }
      })
    },
    //点击保存到相册
    saveCanvasImage: function(){
      getApp().mtj.trackEvent('save');
      var that = this;
      wx.showLoading()
      wx.saveImageToPhotosAlbum({
        filePath: that.data.imagePath,
        success(res) {
          wx.hideLoading()
          wx.showToast({
            title:"保存成功",
          })
          setTimeout(() => {
            that.setData({
              maskHidden: false,
              saveBtn:false,
              isPoster:false
            })
            that.getTrigger(that.data.popHidden,0,1)
          }, 2000);
          
        }
      })
    },
    // 设置canvas
    setCanvasImage:function(){
      console.log("sss")
      const that = this;
      if(that.data.imagePath == ''){
        wx.showToast({
          title: '海报生成中...',
          icon: 'none'
        })
      }
      var ctx = wx.createCanvasContext('mycanvas',this);
      var canvasWidth = that.data.screenW;
      var canvasHeight = that.data.screenH;
      // ctx.fillRect(0, 0, 750, 1334);
      // 背景
      var path = that.data.path1+'/cover/bg.jpg';
      ctx.drawImage(path, 0, 0, 750, 1334)
      // 封面
      var path1 = that.data.path1+'/cover/cover'+that.data.coverPathId+'.jpg';
      // var path1 = coverPath
      ctx.drawImage(path1,21, 15, 708 , 1012)
      //昵称 
      ctx.setFontSize(26);
      ctx.setFillStyle('#5e1a0e');
      ctx.setTextAlign('left');
      ctx.fillText(that.data.userInfo.nickName,110, 1082 , 750 - 130 );
      //文案
      ctx.setFontSize(24);
      ctx.setFillStyle('#5e1a0e');
      ctx.setTextAlign('left');
      ctx.fillText('“一起来收听赵丽颖新年原声祝福，定制原声福卡吧。”', 110, 1118, 750 -130);
      //线条
      ctx.moveTo(15,1146)
      ctx.lineTo(750 - 15 , 1146)
      ctx.setStrokeStyle("#5e1a0e")
      ctx.stroke()
      // 底部
      var path2 = that.data.path1+'/cover/bottom.png';
      ctx.drawImage(path2, 50, 1170 , 482 ,141)
      // var codepath = that.data.path1+'/cover/code.png';
      // var codepath = that.data.path1+'/cover/code.png';
      console.log(that.data.codeUrl)
      if(that.data.codeUrl.length>0){
        var codepath = that.data.codeUrl;
        console.log(codepath)
        ctx.save();
        ctx.beginPath();
        ctx.arc(639, 1245, 80, 0, 2 * Math.PI)
        ctx.setStrokeStyle('#af865b');
        ctx.setFillStyle('white');
        ctx.setLineWidth(4)
        ctx.fill()
        ctx.stroke();
        ctx.drawImage(codepath,566, 1172,145, 145); //二维码
        ctx.restore();
      }
      
      // 头像
      ctx.save();
      ctx.beginPath();
      ctx.arc(53, 1090, 38, 0, 2 * Math.PI)
      ctx.setFillStyle('#EEEEEE');
      ctx.setLineWidth(1)
      ctx.stroke();
      ctx.clip();
      ctx.drawImage(that.data.avatarUrl,15, 1053, 76 , 76)
      ctx.restore();
      // ctx.save();
      ctx.draw();
      //将生成好的图片保存到本地，需要延迟一会，绘制期间耗时
      setTimeout(function () {
        wx.canvasToTempFilePath({
          canvasId: 'mycanvas',
          success: function (res) {
            var tempFilePath = res.tempFilePath;
            console.log(res)
            that.setData({
              imagePath: tempFilePath,
            });
            wx.hideToast()
          },
          fail: function (res) {
            console.log(res);
            wx.hideToast()
          }
        },that)
        
      },500)
      
    },
  },
})