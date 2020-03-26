/*
 * @Author: your name
 * @Date: 2020-03-24 17:12:55
 * @LastEditTime: 2020-03-25 21:46:10
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /optimizeMethod/cache-axios.js
 */

/**
 * 全局缓存对象
 */
var ajaxCache = Object.create(null);
var baseURL = '';
if (window.IS_DEVELOPMENT) {
  axios.defaults.withCredentials = true;
  window.RUNTIME_CONFIG = window.RUNTIME_CONFIG || JSON.parse(window.localStorage.getItem('RUNTIME_CONFIG'));
  baseURL = window.RUNTIME_CONFIG ? window.RUNTIME_CONFIG.value : '';
}

axios.create({
  baseURL,
  params: {
    
  },
  adapter: cacheAdapter(axios.defaults.adapter)
})

/**
 * axios拦截器：拦截vue中发起的相同请求
 */
window.axios.interceptors.response.use(
  response => response.data,
  error => {
    if (error && error.response) {
      // 处理error逻辑
    }
    return Promise.reject(error);
  }
)


/**
 * 将promise为value放进缓存对象中，用axios默认的adapter处理一遍config
 */
function cacheAdapter(adapter) {
  return (config) => {
    var ajaxPrefetch = config.ajaxPrefetch;
    var url = config.url;
    var params = config.params;
    var method = config.method;
    if (ajaxPrefetch && method === 'get') {
      var cacheKey = buildCacheKey(url,params);
      if(!(cacheKey in ajaxCache)){
        ajaxCache[cacheKey] = adapter(config);
      } 
      return ajaxCache[cacheKey];
    }
    return adapter(config);
  }
}
/**
 * 创建缓存key：key为携带拼接参数的请求地址
 */
function buildCacheKey(url,params) {
  if(!params) {
    return url;
  }
  var keys = [];
  for(var key in params) {
    keys.push(key)
  }
  var sortedKeys = keys.sort();
  var connet = url.indexOf('?') === -1 ? '?' : '&';
  var len = sortedKeys.length;
  var tempUrl = url + connet + sortedKeys[0] + '=' + params[sortedKeys[0]];
  if (len === 1) {
    return tempUrl;
  }
  for(var i=1;i<len;i++){
    tempUrl += '&' + sortedKeys[i] + '=' + params[sortedKeys[i]];
  }
  return tempUrl;
}