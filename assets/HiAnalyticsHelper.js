(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var envHosts = {
  pro: [// 国内现网
  "tips-p01-drcn.dbankcdn.com", "tips-res-drcn.dbankcdn.com", "resourcephs1.vmall.com", "iservice.vmall.com",
  // ],
  // joint: [ // 国内测试网
  "lftipstest01.hwcloudtest.cn", "lfmemberdev.hwcloudtest.cn", "tips-test-001-cn.obs.myhwclouds.com"] };
var evnReportAddress = {
  pro: {
    getAddr: "https://metrics-drcn.dt.hicloud.com:6447/webv1",
    postAddr: "https://metrics-drcn.dt.hicloud.com:6447/webv2" },
  // joint: {
  //   getAddr: 'https://cloudbackup.hwcloudtest.cn:6447/webv1',
  //   postAddr: 'https://cloudbackup.hwcloudtest.cn:6447/webv2',
  // },
  // debug: {
  //   getAddr: '/favicon.ioc',
  //   postAddr: '/favicon.ioc',
  // },
  mismatch: {
    getAddr: "/favicon.ioc",
    postAddr: "/favicon.ioc" }
};

var haAddress = {
  getReportAddress: function getReportAddress() {
    var hostName = window.location.hostname.toLocaleLowerCase();
    for (var key in envHosts) {
      var hosts = envHosts[key];
      for (var index in hosts) {
        if (hosts[index] === hostName) {
          return evnReportAddress[key];
        }
      };
    }
    return evnReportAddress.mismatch;
  }
};

module.exports = haAddress;

// debug: [ // 本地调试
//   'localhost',
//   '127.0.0.1',
//   '',
// ]

},{}],2:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var addressSelector = _interopRequire(require("./AddressConfig"));

var paramMapper = _interopRequire(require("./ParamMapping"));

var _hasdk = window._hasdk || {};
var reportAddress = addressSelector.getReportAddress();
var canUse = Object.keys(_hasdk).length !== 0;
var USE_XHR = window.XMLHttpRequest && "withCredentials" in new XMLHttpRequest();

function readMetaContent(name) {
  var metaDom = document.querySelector("meta[name=" + name + "]");
  if (metaDom) {
    return metaDom.getAttribute("content");
  } else {
    return undefined;
  }
};

function notBlank(str) {
  return typeof str === "string" && str.trim() !== "";
}

function doNothing() {};

/**
 * 使用自定义上报地址，切换GET/POST上报方式时，需要重新传入reportUrl，否则取系统默认的地址
 * @param {*} conf
 */
function config(conf) {
  if (canUse) {
    // 默认用post请求，仅在用get时需要切换地址
    if (conf.reportByGet) {
      // 没特别指定reportUrl则用本util预定义的
      if (!conf.reportUrl) {
        conf.reportUrl = reportAddress.getAddr;
      }
    } else {
      if (!conf.reportUrl) {
        conf.reportUrl = reportAddress.postAddr;
      }
    }
    configInternel(conf, HAReportUtil);
  } else {
    console.error("log: sdk not provided.");
  }
}

function configDefault(util) {
  var defaultConfig = {
    businessLabel: "GT2",
    reportByGet: false,
    // 默认仅USE_XHR时用Post自动上报，其他情况会在URL后面拼参数，不自动上报
    reportOnEnter: USE_XHR,
    reportOnLeave: USE_XHR,
    reportUrl: reportAddress.postAddr,
    sessionTimeout: 30 * 60 * 1000 };

  var funNum = readMetaContent("funNum");
  var businessLabel = readMetaContent("businessLabel");

  if (notBlank(funNum)) {
    defaultConfig.businessLabel = "hwtips";
    defaultConfig.extra = JSON.stringify({
      funNum: funNum,
      "user-agent": window.navigator.userAgent });
  } else if (notBlank(businessLabel)) {
    defaultConfig.businessLabel = businessLabel;
  }

  configInternel(defaultConfig, util);
}

function configInternel(conf, util) {
  paramMapper.configSdk(_hasdk, conf);
  patchReportMethod(conf.reportByGet, util);
}

/**
 * 默认情况下，仅在reportByGet: false, USE_XHR: true 时
 * 将打点方法暴露，否则调打点方法不做任何事
 * @param {*} util
 */
function patchReportMethod(reportByGet, util) {
  if (reportByGet || USE_XHR) {
    util.sendData = _hasdk.sendData;
    util.sendClickData = _hasdk.sendClickData;
    util.sendOnClick = _hasdk.bindclick;
  } else {
    util.sendData = doNothing;
    util.sendClickData = doNothing;
    util.sendOnClick = doNothing;
  }
}

var HAReportUtil = (function () {
  var util = {
    config: config,
    getParamNames: paramMapper.getParamNames };
  // 默认仅开启POST请求
  if (canUse) {
    configDefault(util);
  }
  window._hasdk = util;
  return util;
})();
module.exports = HAReportUtil;

},{"./AddressConfig":1,"./ParamMapping":3}],3:[function(require,module,exports){
"use strict";

var paramsMap = {
  reportUrl: "setOnReportUrl", // 上报地址，string
  businessLabel: "setIdsite",             // 业务标识，自定义区分业务类型
  reportByGet: "setReportMethod",         // 使用img-src的get请求打点，默认false
  reportOnEnter: "setBaseinfotypeSwitch", // 进入页面时打点开关，boolean默认false
  reportOnLeave: "setWindowCloseSwitch",  // 离开页面时打点开关，boolean默认false
  sessionTimeout: "setSessionTimeoutDuration", // 两次上报数据超过该ms值会生成新的sessionID，默认39min
  pageTitle: "setTitle", // 默认取页面中title
  userAccount: "setUserAccount", // 设置用户标识，未设置则用随机串
  countryCode: "setCXX", // 业务根据需求设置，未设置上报空值
  uId: "setUid", // 业务含义不明，未设置上报空值
  extra: "setPageData" };

var paramMapper = {
  configSdk: function configSdk(_hasdk, configParams) {
    var paramMapKeys = this.getParamNames();
    for (var paramName in configParams) {
      if (paramMapKeys.includes(paramName)) {
        var paramValue = configParams[paramName];
        if (paramValue) {
          _hasdk[paramsMap[paramName]](paramValue);
        }
      }
    }
  },
  getParamNames: function getParamNames() {
    return Object.keys(paramsMap);
  }
};
module.exports = paramMapper;
// 页面自定义参数

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJEOi93b3Jrc3BhY2UvMTcu546p5py65oqA5benXzAxLuWuouaIt+err18xMC53ZWLliY3nq69fd2ViL0VNVUkxMC9zcmMvaDVfbW9kdWxlL2pzL0hpQW5hbHl0aWNzL0FkZHJlc3NDb25maWcuanMiLCJEOi93b3Jrc3BhY2UvMTcu546p5py65oqA5benXzAxLuWuouaIt+err18xMC53ZWLliY3nq69fd2ViL0VNVUkxMC9zcmMvaDVfbW9kdWxlL2pzL0hpQW5hbHl0aWNzL0hpQW5hbHl0aWNzVXRpbC5qcyIsIkQ6L3dvcmtzcGFjZS8xNy7njqnmnLrmioDlt6dfMDEu5a6i5oi356uvXzEwLndlYuWJjeerr193ZWIvRU1VSTEwL3NyYy9oNV9tb2R1bGUvanMvSGlBbmFseXRpY3MvUGFyYW1NYXBwaW5nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFNLFFBQVEsR0FBRztBQUNmLEtBQUcsRUFBRTtBQUNILDhCQUE0QixFQUM1Qiw0QkFBNEIsRUFDNUIsd0JBQXdCLEVBQ3hCLG9CQUFvQjs7O0FBR3BCLCtCQUE2QixFQUM3Qiw0QkFBNEIsRUFDNUIscUNBQXFDLENBQ3RDLEVBTUYsQ0FBQTtBQUNELElBQU0sZ0JBQWdCLEdBQUc7QUFDdkIsS0FBRyxFQUFFO0FBQ0gsV0FBTyxFQUFFLGdEQUFnRDtBQUN6RCxZQUFRLEVBQUUsZ0RBQWdELEVBQzNEOzs7Ozs7Ozs7QUFTRCxVQUFRLEVBQUU7QUFDUixXQUFPLEVBQUUsY0FBYztBQUN2QixZQUFRLEVBQUUsY0FBYyxFQUN6QjtDQUNGLENBQUE7O0FBRUQsSUFBTSxTQUFTLEdBQUc7QUFDaEIsa0JBQWdCLEVBQUEsNEJBQUc7QUFDakIsUUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztBQUM5RCxTQUFLLElBQUksR0FBRyxJQUFJLFFBQVEsRUFBRTtB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O0FBQ3RDLGVBQWEsRUFBRSxzQkFBc0I7QUFDckMsZ0JBQWMsRUFBRSwyQkFBMkI7QUFDM0MsV0FBUyxFQUFFLFVBQVU7QUFDckIsYUFBVyxFQUFFLGdCQUFnQjtBQUM3QixhQUFXLEVBQUUsUUFBUTtBQUNyQixLQUFHLEVBQUUsUUFBUTtBQUNiLE9BQUssRUFBRSxhQUFhLEVBQ3JCLENBQUE7O0FBRUQsSUFBTSxXQUFXLEdBQUc7QUFDbEIsV0FBUyxFQUFBLG1CQUFDLE1BQU0sRUFBRSxZQUFZLEVBQUU7QUFDOUIsUUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0FBQzFDLFNBQUssSUFBSSxTQUFTLElBQUksWUFBWSxFQUFFO0FBQ2xDLFVBQUksWUFBWSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRTtBQUNwQyxZQUFJLFVBQVUsR0FBRyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDekMsWUFBSSxVQUFVLEVBQUU7QUFDZCxnQkFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQzFDO09BQ0Y7S0FDRjtHQUNGO0FBQ0QsZUFBYSxFQUFBLHlCQUFHO0FBQ2QsV0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0dBQy9CO0NBQ0YsQ0FBQTtpQkFDYyxXQUFXIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgZW52SG9zdHMgPSB7XG4gIHBybzogWyAvLyDlm73lhoXnjrDnvZFcbiAgICAndGlwcy1wMDEtZHJjbi5kYmFua2Nkbi5jb20nLFxuICAgICd0aXBzLXJlcy1kcmNuLmRiYW5rY2RuLmNvbScsXG4gICAgJ3Jlc291cmNlcGhzMS52bWFsbC5jb20nLFxuICAgICdpc2VydmljZS52bWFsbC5jb20nLFxuICAgIC8vIF0sXG4gICAgLy8gam9pbnQ6IFsgLy8g5Zu95YaF5rWL6K+V572RXG4gICAgJ2xmdGlwc3Rlc3QwMS5od2Nsb3VkdGVzdC5jbicsXG4gICAgJ2xmbWVtYmVyZGV2Lmh3Y2xvdWR0ZXN0LmNuJyxcbiAgICAndGlwcy10ZXN0LTAwMS1jbi5vYnMubXlod2Nsb3Vkcy5jb20nLFxuICBdLFxuICAvLyBkZWJ1ZzogWyAvLyDmnKzlnLDosIPor5VcbiAgLy8gICAnbG9jYWxob3N0JyxcbiAgLy8gICAnMTI3LjAuMC4xJyxcbiAgLy8gICAnJyxcbiAgLy8gXVxufVxuY29uc3QgZXZuUmVwb3J0QWRkcmVzcyA9IHtcbiAgcHJvOiB7XG4gICAgZ2V0QWRkcjogJ2h0dHBzOi8vbWV0cmljcy1kcmNuLmR0LmhpY2xvdWQuY29tOjY0NDcvd2VidjEnLFxuICAgIHBvc3RBZGRyOiAnaHR0cHM6Ly9tZXRyaWNzLWRyY24uZHQuaGljbG91ZC5jb206NjQ0Ny93ZWJ2MicsXG4gIH0sXG4gIC8vIGpvaW50OiB7XG4gIC8vICAgZ2V0QWRkcjogJ2h0dHBzOi8vY2xvdWRiYWNrdXAuaHdjbG91ZHRlc3QuY246NjQ0Ny93ZWJ2MScsXG4gIC8vICAgcG9zdEFkZHI6ICdodHRwczovL2Nsb3VkYmFja3VwLmh3Y2xvdWR0ZXN0LmNuOjY0NDcvd2VidjInLFxuICAvLyB9LFxuICAvLyBkZWJ1Zzoge1xuICAvLyAgIGdldEFkZHI6ICcvZmF2aWNvbi5pb2MnLFxuICAvLyAgIHBvc3RBZGRyOiAnL2Zhdmljb24uaW9jJyxcbiAgLy8gfSxcbiAgbWlzbWF0Y2g6IHtcbiAgICBnZXRBZGRyOiAnL2Zhdmljb24uaW9jJyxcbiAgICBwb3N0QWRkcjogJy9mYXZpY29uLmlvYycsXG4gIH1cbn1cblxuY29uc3QgaGFBZGRyZXNzID0ge1xuICBnZXRSZXBvcnRBZGRyZXNzKCkge1xuICAgIGNvbnN0IGhvc3ROYW1lID0gd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLnRvTG9jYWxlTG93ZXJDYXNlKCk7XG4gICAgZm9yIChsZXQga2V5IGluIGVudkhvc3RzKSB7XG4gICAgICBsZXQgaG9zdHMgPSBlbnZIb3N0c1trZXldO1xuICAgICAgZm9yIChsZXQgaW5kZXggaW4gaG9zdHMpIHtcbiAgICAgICAgaWYgKGhvc3RzW2luZGV4XSA9PT0gaG9zdE5hbWUpIHtcbiAgICAgICAgICByZXR1cm4gZXZuUmVwb3J0QWRkcmVzc1trZXldO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gZXZuUmVwb3J0QWRkcmVzc1snbWlzbWF0Y2gnXTtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgaGFBZGRyZXNzOyIsImltcG9ydCBhZGRyZXNzU2VsZWN0b3IgZnJvbSAnLi9BZGRyZXNzQ29uZmlnJztcbmltcG9ydCBwYXJhbU1hcHBlciBmcm9tICcuL1BhcmFtTWFwcGluZyc7XG5cbmNvbnN0IF9oYXNkayA9IHdpbmRvdy5faGFzZGsgfHwge307XG5jb25zdCByZXBvcnRBZGRyZXNzID0gYWRkcmVzc1NlbGVjdG9yLmdldFJlcG9ydEFkZHJlc3MoKTtcbmNvbnN0IGNhblVzZSA9IE9iamVjdC5rZXlzKF9oYXNkaykubGVuZ3RoICE9PSAwO1xuY29uc3QgVVNFX1hIUiA9ICh3aW5kb3cuWE1MSHR0cFJlcXVlc3QgJiYgJ3dpdGhDcmVkZW50aWFscycgaW4gbmV3IFhNTEh0dHBSZXF1ZXN0KCkpO1xuXG5mdW5jdGlvbiByZWFkTWV0YUNvbnRlbnQobmFtZSkge1xuICBjb25zdCBtZXRhRG9tID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgbWV0YVtuYW1lPSR7bmFtZX1dYCk7XG4gIGlmIChtZXRhRG9tKSB7XG4gICAgcmV0dXJuIG1ldGFEb20uZ2V0QXR0cmlidXRlKCdjb250ZW50Jyk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxufTtcblxuZnVuY3Rpb24gbm90Qmxhbmsoc3RyKSB7XG4gIHJldHVybiB0eXBlb2Ygc3RyID09PSAnc3RyaW5nJyAmJiBzdHIudHJpbSgpICE9PSAnJztcbn1cblxuZnVuY3Rpb24gZG9Ob3RoaW5nKCkge307XG5cbi8qKlxuICog5L2/55So6Ieq5a6a5LmJ5LiK5oql5Zyw5Z2A77yM5YiH5o2iR0VUL1BPU1TkuIrmiqXmlrnlvI/ml7bvvIzpnIDopoHph43mlrDkvKDlhaVyZXBvcnRVcmzvvIzlkKbliJnlj5bns7vnu5/pu5jorqTnmoTlnLDlnYBcbiAqIEBwYXJhbSB7Kn0gY29uZiBcbiAqL1xuZnVuY3Rpb24gY29uZmlnKGNvbmYpIHtcbiAgaWYgKGNhblVzZSkge1xuICAgIC8vIOm7mOiupOeUqHBvc3Tor7fmsYLvvIzku4XlnKjnlKhnZXTml7bpnIDopoHliIfmjaLlnLDlnYBcbiAgICBpZiAoY29uZlsncmVwb3J0QnlHZXQnXSkge1xuICAgICAgLy8g5rKh54m55Yir5oyH5a6acmVwb3J0VXJs5YiZ55So5pysdXRpbOmihOWumuS5ieeahFxuICAgICAgaWYgKCFjb25mWydyZXBvcnRVcmwnXSkge1xuICAgICAgICBjb25mWydyZXBvcnRVcmwnXSA9IHJlcG9ydEFkZHJlc3NbJ2dldEFkZHInXTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFjb25mWydyZXBvcnRVcmwnXSkge1xuICAgICAgICBjb25mWydyZXBvcnRVcmwnXSA9IHJlcG9ydEFkZHJlc3NbJ3Bvc3RBZGRyJ107XG4gICAgICB9XG4gICAgfVxuICAgIGNvbmZpZ0ludGVybmVsKGNvbmYsIEhBUmVwb3J0VXRpbCk7XG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5lcnJvcihgbG9nOiBzZGsgbm90IHByb3ZpZGVkLmApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvbmZpZ0RlZmF1bHQodXRpbCkge1xuICBsZXQgZGVmYXVsdENvbmZpZyA9IHtcbiAgICBidXNpbmVzc0xhYmVsOiAnaHdvdGhlcnMnLFxuICAgIHJlcG9ydEJ5R2V0OiBmYWxzZSxcbiAgICAvLyDpu5jorqTku4VVU0VfWEhS5pe255SoUG9zdOiHquWKqOS4iuaKpe+8jOWFtuS7luaDheWGteS8muWcqFVSTOWQjumdouaLvOWPguaVsO+8jOS4jeiHquWKqOS4iuaKpVxuICAgIHJlcG9ydE9uRW50ZXI6IFVTRV9YSFIsXG4gICAgcmVwb3J0T25MZWF2ZTogVVNFX1hIUixcbiAgICByZXBvcnRVcmw6IHJlcG9ydEFkZHJlc3NbJ3Bvc3RBZGRyJ10sXG4gICAgc2Vzc2lvblRpbWVvdXQ6IDMwICogNjAgKiAxMDAwLFxuICB9O1xuXG4gIGNvbnN0IGZ1bk51bSA9IHJlYWRNZXRhQ29udGVudCgnZnVuTnVtJyk7XG4gIGNvbnN0IGJ1c2luZXNzTGFiZWwgPSByZWFkTWV0YUNvbnRlbnQoJ2J1c2luZXNzTGFiZWwnKTtcblxuICBpZiAobm90QmxhbmsoZnVuTnVtKSkge1xuICAgIGRlZmF1bHRDb25maWdbJ2J1c2luZXNzTGFiZWwnXSA9ICdod3RpcHMnO1xuICAgIGRlZmF1bHRDb25maWdbJ2V4dHJhJ10gPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAnZnVuTnVtJzogZnVuTnVtLFxuICAgICAgJ3VzZXItYWdlbnQnOiB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudCxcbiAgICB9KTtcbiAgfSBlbHNlIGlmIChub3RCbGFuayhidXNpbmVzc0xhYmVsKSkge1xuICAgIGRlZmF1bHRDb25maWdbJ2J1c2luZXNzTGFiZWwnXSA9IGJ1c2luZXNzTGFiZWw7XG4gIH1cblxuICBjb25maWdJbnRlcm5lbChkZWZhdWx0Q29uZmlnLCB1dGlsKTtcbn1cblxuZnVuY3Rpb24gY29uZmlnSW50ZXJuZWwoY29uZiwgdXRpbCkge1xuICBwYXJhbU1hcHBlci5jb25maWdTZGsoX2hhc2RrLCBjb25mKTtcbiAgcGF0Y2hSZXBvcnRNZXRob2QoY29uZlsncmVwb3J0QnlHZXQnXSwgdXRpbCk7XG59XG5cbi8qKlxuICog6buY6K6k5oOF5Ya15LiL77yM5LuF5ZyocmVwb3J0QnlHZXQ6IGZhbHNlLCBVU0VfWEhSOiB0cnVlIOaXtlxuICog5bCG5omT54K55pa55rOV5pq06Zyy77yM5ZCm5YiZ6LCD5omT54K55pa55rOV5LiN5YGa5Lu75L2V5LqLXG4gKiBAcGFyYW0geyp9IHV0aWxcbiAqL1xuZnVuY3Rpb24gcGF0Y2hSZXBvcnRNZXRob2QocmVwb3J0QnlHZXQsIHV0aWwpIHtcbiAgaWYgKHJlcG9ydEJ5R2V0IHx8IFVTRV9YSFIpIHtcbiAgICB1dGlsWydzZW5kRGF0YSddID0gX2hhc2RrLnNlbmREYXRhO1xuICAgIHV0aWxbJ3NlbmRDbGlja0RhdGEnXSA9IF9oYXNkay5zZW5kQ2xpY2tEYXRhO1xuICAgIHV0aWxbJ3NlbmRPbkNsaWNrJ10gPSBfaGFzZGsuYmluZGNsaWNrO1xuICB9IGVsc2Uge1xuICAgIHV0aWxbJ3NlbmREYXRhJ10gPSBkb05vdGhpbmc7XG4gICAgdXRpbFsnc2VuZENsaWNrRGF0YSddID0gZG9Ob3RoaW5nO1xuICAgIHV0aWxbJ3NlbmRPbkNsaWNrJ10gPSBkb05vdGhpbmc7XG4gIH1cbn1cblxuY29uc3QgSEFSZXBvcnRVdGlsID0gKCgpID0+IHtcbiAgY29uc3QgdXRpbCA9IHtcbiAgICBjb25maWc6IGNvbmZpZyxcbiAgICBnZXRQYXJhbU5hbWVzOiBwYXJhbU1hcHBlci5nZXRQYXJhbU5hbWVzLFxuICB9XG4gIC8vIOm7mOiupOS7heW8gOWQr1BPU1Tor7fmsYJcbiAgaWYgKGNhblVzZSkge1xuICAgIGNvbmZpZ0RlZmF1bHQodXRpbCk7XG4gIH1cbiAgd2luZG93Ll9oYXNkayA9IHV0aWw7XG4gIHJldHVybiB1dGlsO1xufSkoKTtcbmV4cG9ydCBkZWZhdWx0IEhBUmVwb3J0VXRpbDsiLCJjb25zdCBwYXJhbXNNYXAgPSB7XG4gIHJlcG9ydFVybDogJ3NldE9uUmVwb3J0VXJsJywgLy8g5LiK5oql5Zyw5Z2A77yMc3RyaW5nXG4gIGJ1c2luZXNzTGFiZWw6ICdzZXRJZHNpdGUnLCAvLyDkuJrliqHmoIfor4bvvIzoh6rlrprkuYnljLrliIbkuJrliqHnsbvlnotcbiAgcmVwb3J0QnlHZXQ6ICdzZXRSZXBvcnRNZXRob2QnLCAvLyDkvb/nlKhpbWctc3Jj55qEZ2V06K+35rGC5omT54K577yM6buY6K6kZmFsc2VcbiAgcmVwb3J0T25FbnRlcjogJ3NldEJhc2VpbmZvdHlwZVN3aXRjaCcsIC8vIOi/m+WFpemhtemdouaXtuaJk+eCueW8gOWFs++8jGJvb2xlYW7pu5jorqRmYWxzZVxuICByZXBvcnRPbkxlYXZlOiAnc2V0V2luZG93Q2xvc2VTd2l0Y2gnLCAvLyDnprvlvIDpobXpnaLml7bmiZPngrnlvIDlhbPvvIxib29sZWFu6buY6K6kZmFsc2VcbiAgc2Vzc2lvblRpbWVvdXQ6ICdzZXRTZXNzaW9uVGltZW91dER1cmF0aW9uJywgLy8g5Lik5qyh5LiK5oql5pWw5o2u6LaF6L+H6K+lbXPlgLzkvJrnlJ/miJDmlrDnmoRzZXNzaW9uSUTvvIzpu5jorqQzOW1pblxuICBwYWdlVGl0bGU6ICdzZXRUaXRsZScsIC8vIOm7mOiupOWPlumhtemdouS4rXRpdGxlXG4gIHVzZXJBY2NvdW50OiAnc2V0VXNlckFjY291bnQnLCAvLyDorr7nva7nlKjmiLfmoIfor4bvvIzmnKrorr7nva7liJnnlKjpmo/mnLrkuLJcbiAgY291bnRyeUNvZGU6ICdzZXRDWFgnLCAvLyDkuJrliqHmoLnmja7pnIDmsYLorr7nva7vvIzmnKrorr7nva7kuIrmiqXnqbrlgLxcbiAgdUlkOiAnc2V0VWlkJywgLy8g5Lia5Yqh5ZCr5LmJ5LiN5piO77yM5pyq6K6+572u5LiK5oql56m65YC8XG4gIGV4dHJhOiAnc2V0UGFnZURhdGEnLCAvLyDpobXpnaLoh6rlrprkuYnlj4LmlbBcbn1cblxuY29uc3QgcGFyYW1NYXBwZXIgPSB7XG4gIGNvbmZpZ1NkayhfaGFzZGssIGNvbmZpZ1BhcmFtcykge1xuICAgIGNvbnN0IHBhcmFtTWFwS2V5cyA9IHRoaXMuZ2V0UGFyYW1OYW1lcygpO1xuICAgIGZvciAobGV0IHBhcmFtTmFtZSBpbiBjb25maWdQYXJhbXMpIHtcbiAgICAgIGlmIChwYXJhbU1hcEtleXMuaW5jbHVkZXMocGFyYW1OYW1lKSkge1xuICAgICAgICBsZXQgcGFyYW1WYWx1ZSA9IGNvbmZpZ1BhcmFtc1twYXJhbU5hbWVdO1xuICAgICAgICBpZiAocGFyYW1WYWx1ZSkge1xuICAgICAgICAgIF9oYXNka1twYXJhbXNNYXBbcGFyYW1OYW1lXV0ocGFyYW1WYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGdldFBhcmFtTmFtZXMoKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHBhcmFtc01hcCk7XG4gIH1cbn1cbmV4cG9ydCBkZWZhdWx0IHBhcmFtTWFwcGVyOyJdfQ==
