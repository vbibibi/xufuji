// pages/home/home.js
var util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // path:'../../public/image',
    // path:'https://t-html.mmuugg.com/vbibi/public/image',
    path:'https://hfc-static.mmuugg.com/image',//正式
    isIpx:false,
    screenH:wx.getSystemInfoSync().windowHeight,
    screenW:wx.getSystemInfoSync().windowWidth,
    imagePath:'',//canvas生成图片路径
    canvasHidden:false,
    userInfo:null,
    posterSrc:"",//封面图片
    fukaIndex:1,//福卡索引
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // var userInfo = wx.getStorageSync('userInfo'); //本地缓存资料
    const that = this;
    wx.getUserInfo({
      success: function(res) {
        console.log(res.userInfo)
        that.setData({
          userInfo: res.userInfo
        })
        that.setCanvasImage(); //触发canvas
      }
    })
    
    that.setData({
      isIpx:util.iphoneXSize(that.screenH),
    })
  },
  // 设置canvas
  setCanvasImage:function(){
    const that = this;
    var ctx = wx.createCanvasContext('mycanvas');
    var canvasWidth = that.data.screenW;
    var canvasHeight = that.data.screenH;
     
    

    ctx.fillRect(0, 0, 750, 1334);
    // 背景
    var path = '../../public/image/cover/bg.jpg';
    ctx.drawImage(path, 0, 0, 750, 1334)
    // 封面
    var path1 = '../../public/image/cover/cover3.png';
    ctx.drawImage(path1,15, 15, 720 , 954)
   //昵称 
    ctx.setFontSize(16);
    ctx.setFillStyle('#5e1a0e');
    ctx.setTextAlign('left');
    ctx.fillText(that.data.userInfo.nickName,110, 1010 , 750 - 130 );
    //文案
    ctx.setFontSize(16);
    ctx.setFillStyle('#5e1a0e');
    ctx.setTextAlign('left');
    ctx.fillText('“一起来收听赵丽颖新年原声祝福，定制原声福卡吧。”', 110, 1040, 750 -130);
    //线条
    ctx.moveTo(15,1070)
    ctx.lineTo(750 - 15 , 1070)
    ctx.setStrokeStyle("#5e1a0e")
    ctx.stroke()
    // 底部
    var path2 = '../../public/image/cover/bottom.png';
    ctx.drawImage(path2, 60, 1090 , 475 ,141)
    var codepath = '../../public/image/cover/code.png';
    ctx.drawImage(codepath,554, 1090,170, 162);

    // 头像
    ctx.save();
    ctx.beginPath();
    ctx.arc(53, 1022, 38, 0, 2 * Math.PI)
    ctx.setFillStyle('#EEEEEE');
    ctx.stroke();
    ctx.clip();
    // console.log()
    var imgpath = that.data.userInfo.avatarUrl;
    // wx.getImageInfo({
    //   src: imgpath,//服务器返回的图片地址
    //   success: function (res) {
    //     //res.path是网络图片的本地地址
    //     let Path = res.path;
    //     ctx.drawImage(Path,15, 984, 76 , 76)
    //   }
    // });
    ctx.drawImage('../../public/image/cover/head.jpg',15, 984, 76 , 76)
    ctx.restore();
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
            canvasHidden:true
          });
        },
        fail: function (res) {
          console.log(res);
        }
      })
    },300)
    
  },
  //点击保存到相册
  baocun: function(){
    var that = this;
    console.log(that.data.imagePath)
    wx.saveImageToPhotosAlbum({
      filePath: that.data.imagePath,
      success(res) {
        console.log(res)
        wx.showModal({
          content: '图片已保存到相册，赶紧晒一下吧~',
          showCancel: false,
          confirmText: '好的',
          confirmColor: '#333',
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定');
              /* 该隐藏的隐藏 */
              that.setData({
                maskHidden: false
              })
            }
          },fail:function(res){
            console.log(11111)
          }
        })
      }
    })
  },
  // 分享成功设置信息
  // onShareAppMessage:function(res) {
  //   console.log(res)
  //   if (res.from == 'button') {
  //       console.log(res.target, res)
  //   }
  //   return {
  //     title:'徐福记福卡送30元',
  //     path:'/pages/detail/detail',//这里是被分享的人点击进来之后的页面
  //     imageUrl: '',//这里是图片的路径
  //     success: function (res) { 
  //       console.log(res)
  //       // 其他逻辑实现
  //     }
  //   }
  // },
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