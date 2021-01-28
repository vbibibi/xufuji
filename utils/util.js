const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

// 判断屏幕尺寸，是否属于iphoneX类型
const iphoneXSize = function () {
  wx.getSystemInfo({
    success: res => {
      var isIpx = res.screenHeight > 750
      getApp().globalData.isIpx = isIpx;
    }
  })
  return getApp().globalData.isIpx;
}

const getBarHeight = function (){
  var isx = iphoneXSize();
  if(isx){
    getApp().globalData.getAllBarHeight = getApp().globalData.statusBarHeight*2+5
  }else{
    getApp().globalData.getAllBarHeight = getApp().globalData.statusBarHeight*2+20
  }
  return getApp().globalData.getAllBarHeight;
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 调用查看当前生成状态
const getPosterInfo = function () {
  // is_create ==1 已创建// is_receive' => 1 已领取 0 未领取// 
  // 'share_count' => 0, //目前点亮数 // 'receive_count' => 0,//领取了多少张券// voice_id' => // image_id' 
  return new Promise(function (resolve, reject) {
    wxRequest({
      url:'/activity/get_poster_status',
      load:false
    })
    .then(resolve)
    .catch(reject)
  })
  
}

// 监听渠道
const setmtjMethod = function(utm){
  console.log(utm)
  if(utm == null || !utm) return false ;
  if(utm.utm_source){
    getApp().mtj.trackEvent(utm.utm_source);
  }
  if(utm.utm_medium){
    getApp().mtj.trackEvent(utm.utm_medium);
  }
}

const wxRequest = function (data){
  // https://hfc-lucky-card-qa.mmuugg.com/api //dev
  // https://hfc-lucky-card.mmuugg.com/api    //product
  const basePath = 'https://hfc-lucky-card.mmuugg.com/api';
  const token = wx.getStorageSync('token');
  const oldops = data;
  var header = { 'content-type': 'application/x-www-form-urlencoded'};
  if(token){
    header.Authorization = token
  }
  console.log(header)
  if(data.load != false) {
    wx.showLoading()
  }
  // 封装的API调用方法
  return new Promise(function (resolve, reject) {
    wx.request({
        url: basePath+data.url,
        method: data.method ? data.method : 'GET',
        data: data.params ? data.params : {},
        header: header,
        success: function (res){
          wx.hideLoading();
          console.log(res)
          if(res.data.code == '10020'){
            console.log("token过期");
            wx.login({
              success: res1 => {
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
                wx.request({
                  url:basePath+'/auth/login',
                  method:'POST',
                  data:{code:res1.code},
                  header:{ 'content-type': 'application/x-www-form-urlencoded'},
                  success: function(res2){
                    wx.setStorageSync('token',res2.data.data.token);   
                    wx.setStorageSync('shareId',res2.data.data.member_info.id);
                    wxRequest(oldops).then(resolve);
                  }
                })
              }
            })
          }else{
            console.log(res.data)
            resolve(res.data)
          }
        },
        fail: function (res) {
          // console.log(res)
          wx.hideLoading()
          reject(res.data)
        },
        complete: function () {
          wx.hideLoading()
        }
    })
   
  })
  .catch((res) => { })
}

module.exports = {
  formatTime: formatTime,
  iphoneXSize:iphoneXSize,
  wxRequest:wxRequest,
  getPosterInfo:getPosterInfo,
  setmtjMethod:setmtjMethod,
  getBarHeight:getBarHeight
}
