/*
 * @Author: your name
 * @Date: 2020-03-26 16:23:16
 * @LastEditTime: 2020-03-26 16:24:48
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /optimizeMethod/stayTimeLog.js
 */
var staytimeLog = {
  startTime : + new Date(), // 记录开始时间
  _sendData : function ( data ) { // 发送数据逻辑
    var duration = + new Date() - this.startTime;
    // 此处打点逻辑
    log.send(Object.assign(data, { duration }));
    // reset start time 
    this.startTime = + new Date();
  },
  autoSend: function ( data ) { // 端上,自动发送数据
    if (!data.name) {
      return false;
    }
    var that = this;
    // 端外监听用户后台运行页面,端内跳转页面也会触发这个事件, 因为端内是打开新页面 copy from mdn
    var hidden, visibilityChange;
    if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
      hidden = "hidden";
      visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
      hidden = "msHidden";
      visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
      hidden = "webkitHidden";
      visibilityChange = "webkitvisibilitychange";
    }
    function handleVisibilityChange() {
      if (document[hidden]) { // hidden
        that._sendData( data );
      } else { // visible
        that.startTime = + new Date;
      }
    }
    document.addEventListener( visibilityChange, handleVisibilityChange, false );
    // 端上监听页面复原
    window.fePageResume = function () {
        that.startTime = + new Date;
    };
    // 端上监听页面隐藏
    window.fePagePause = function() {
      that._sendData( data );
    };
  },
  manualSend: function ( data ) { // 手动发送
    if ( data.forceSend || !terminalCheck.isInApp) {
      this._sendData( data );
    } else {
      return false;
    }
  }
}

export default staytimeLog;
