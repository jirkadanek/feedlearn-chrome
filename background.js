// Generated by LiveScript 1.2.0
(function(){
  var root, postJsonExt, getCookie, getRemoteCookies, addlogfb, addlog;
  root = typeof exports != 'undefined' && exports !== null ? exports : this;
  postJsonExt = function(url, jsondata, callback){
    return $.ajax({
      type: 'POST',
      url: url,
      data: JSON.stringify(jsondata),
      success: function(data){
        if (callback != null) {
          return callback(data);
        }
      },
      contentType: 'application/json'
    });
  };
  getCookie = function(callback){
    return chrome.cookies.getAll({
      url: 'https://feedlearn.herokuapp.com/'
    }, function(cookie){
      var output, i$, len$, x, name, value;
      output = {};
      for (i$ = 0, len$ = cookie.length; i$ < len$; ++i$) {
        x = cookie[i$];
        name = decodeURIComponent(x.name);
        value = decodeURIComponent(x.value);
        output[name] = value;
      }
      return callback(output);
    });
  };
  getRemoteCookies = function(username, callback){
    if (username == null || username === 'Anonymous User' || username.length === 0) {
      return;
    }
    return $.getJSON('https://feedlearn.herokuapp.com/cookiesforuser?' + $.param({
      username: username
    }), function(cookies){
      var k, v;
      for (k in cookies) {
        v = cookies[k];
        chrome.cookies.set({
          url: 'https://feedlearn.herokuapp.com/',
          name: k,
          value: encodeURIComponent(v.toString()),
          path: '/'
        });
      }
      return callback(cookies);
    });
  };
  addlogfb = function(logdata, cookie){
    var data;
    data = $.extend({}, logdata);
    data.username = cookie.fullname;
    data.lang = cookie.lang;
    data.format = cookie.format;
    data.scriptformat = cookie.scriptformat;
    data.time = Date.now();
    data.timeloc = new Date().toString();
    return postJsonExt('https://feedlearn.herokuapp.com/addlogfb', data);
  };
  addlog = function(logdata, cookie){
    var data;
    data = $.extend({}, logdata);
    data.username = cookie.fullname;
    data.lang = cookie.lang;
    data.format = cookie.format;
    data.scriptformat = cookie.scriptformat;
    data.time = Date.now();
    data.timeloc = new Date().toString();
    return postJsonExt('https://feedlearn.herokuapp.com/addlog', data);
  };
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    var fbname, fburl;
    if (request != null && request.feedlearn === 'missingformat') {
      fbname = request.fbname;
      fburl = request.fburl;
      getCookie(function(cookie){
        var fullname;
        fullname = cookie.fullname;
        if (fullname == null || fullname === 'Anonymous User' || fullname.length === 0) {
          cookie.fullname = fbname;
        }
        return addlog({
          type: 'missingformat',
          fbname: fbname,
          fburl: fburl
        }, cookie);
      });
    }
    if (request != null && request.feedlearn === 'fbstillopen') {
      getCookie(function(cookie){
        return addlogfb({
          type: 'fbstillopen',
          mostrecentmousemove: request.mostrecentmousemove,
          timeopened: request.timeopened,
          timesincemousemove: request.timesincemousemove
        }, cookie);
      });
    }
    if (request != null && request.feedlearn === 'getformat') {
      fbname = request.fbname;
      fburl = request.fburl;
      return getCookie(function(cookie){
        var fullname;
        fullname = cookie.fullname;
        if (fullname == null || fullname === 'Anonymous User' || fullname.length === 0) {
          fullname = request.fbname;
          cookie.fullname = fullname;
          addlog({
            type: 'missingcookie',
            fbname: fbname,
            fburl: fburl
          }, cookie);
        }
        return getRemoteCookies(fullname, function(remotecookie){
          var k, v, format;
          for (k in remotecookie) {
            v = remotecookie[k];
            cookie[k] = v;
          }
          format = cookie.format;
          sendResponse({
            feedlearn: true,
            format: format
          });
          chrome.tabs.query({}, function(tabs){
            var i$, len$, tab, results$ = [];
            for (i$ = 0, len$ = tabs.length; i$ < len$; ++i$) {
              tab = tabs[i$];
              results$.push(chrome.tabs.sendMessage(tab.id, {
                feedlearn: true,
                format: cookie.format
              }));
            }
            return results$;
          });
          addlog({
            type: 'fbvisit',
            fbname: fbname,
            fburl: fburl
          }, cookie);
          return addlogfb({
            type: 'fbvisit',
            fbname: fbname,
            fburl: fburl
          }, cookie);
        });
      });
    }
  });
}).call(this);
