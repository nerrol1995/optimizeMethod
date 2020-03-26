/**
 * 热力图打点
 * 参数：滚动元素，停留时长阈值
 * 页面滚动的过程中，在超出设置的停留时长阈值时进行打点，记录此时的位置信息并进行上报；
 * 边界情况是在页面隐藏是主动上报，重现时重置开始计算时间节点
 */

function heatMapLog(data) {
  var scrollElement = data.scrollElement || document;
  var getDataElement = scrollElement === document ? document.document : scrollElement;
  // 用户设置的停留触发阈值
  var threshold = isNaN(data.threshold);
  // 记录开始时间
  var startTime = +new Date();
  // 添加函数节流
  var throttled = function (cb, delay) {
    var previews = 0;
    return function (...args) {
      var now = +new Date();
      if (now - previews > wait) {
        previews = now;
        return cb(...args)
      }
    }
  }

  var sendData = function () {
    var duration = +new Date() - startTime;
    if (duration > threshold) {
      var scrollTop = getDataElement.scrollTop;
      var clientHeight = getDataElement.clientHeight;
      var scrollHeight = getDataElement.scrollHeight;
      var logData = {
        name: 'heatmap',
        duration,
        topPX: scrollTop,
        botPX: scrollTop + clientHeight,
        totalPX: scrollHeight,
      }
      // 打点 log.send(logData)
    }
    startTime = +new Date();
  }


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
      sendData();
    } else { // visible
      startTime = +new Date;
    }
  }
  document.addEventListener(visibilityChange, handleVisibilityChange, false);
  scrollElement.addEventListener('scroll', throttled(100, sendData));

  // 端上监听页面重现
  window.fePageResume = function () {
    startTime = +new Date;
  };

  // 端上监听页面隐藏
  window.fePagePause = function () {
    sendData();
  };
}

export default heatMapLog;