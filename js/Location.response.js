(()=>{"use strict";var t,e,s={},a={};function r(t){var e=a[t];if(void 0!==e)return e.exports;var n=a[t]={exports:{}};return s[t](n,n.exports,r),n.exports}e=Object.getPrototypeOf?t=>Object.getPrototypeOf(t):t=>t.__proto__,r.t=function(s,a){if(1&a&&(s=this(s)),8&a)return s;if("object"==typeof s&&s){if(4&a&&s.__esModule)return s;if(16&a&&"function"==typeof s.then)return s}var n=Object.create(null);r.r(n);var o={};t=t||[null,e({}),e([]),e(e)];for(var i=2&a&&s;"object"==typeof i&&!~t.indexOf(i);i=e(i))Object.getOwnPropertyNames(i).forEach((t=>o[t]=()=>s[t]));return o.default=()=>s,r.d(n,o),n},r.d=(t,e)=>{for(var s in e)r.o(e,s)&&!r.o(t,s)&&Object.defineProperty(t,s,{enumerable:!0,get:e[s]})},r.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),r.r=t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})};class n{constructor(t,e){this.name=`${t}, ENV v1.0.0`,this.http=new o(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🏁 ${this.name}, 开始!`)}Platform(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isQuanX(){return"Quantumult X"===this.Platform()}isSurge(){return"Surge"===this.Platform()}isLoon(){return"Loon"===this.Platform()}isShadowrocket(){return"Shadowrocket"===this.Platform()}isStash(){return"Stash"===this.Platform()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;if(this.getdata(t))try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise((e=>{this.get({url:t},((t,s,a)=>e(a)))}))}runScript(t,e){return new Promise((s=>{let a=this.getdata("@chavy_boxjs_userCfgs.httpapi");a=a?a.replace(/\n/g,"").trim():a;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[n,o]=a.split("@"),i={url:`http://${o}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":n,Accept:"*/*"},timeout:r};this.post(i,((t,e,a)=>s(a)))})).catch((t=>this.logErr(t)))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e);if(!s&&!a)return{};{const a=s?t:e;try{return JSON.parse(this.fs.readFileSync(a))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):a?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s=void 0){const a=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of a)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t||(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce(((t,s,a)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[a+1])>>0==+e[a+1]?[]:{}),t)[e[e.length-1]]=s),t}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,a]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,a,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,a,r]=/^@(.*?)\.(.*?)$/.exec(e),n=this.getval(a),o=a?"null"===n?null:n||"{}":"{}";try{const e=JSON.parse(o);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),a)}catch(e){const n={};this.lodash_set(n,r,t),s=this.setval(JSON.stringify(n),a)}}else s=this.setval(t,e);return s}getval(t){switch(this.Platform()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.Platform()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){switch(delete t.headers?.["Content-Length"],delete t.headers?.["content-length"],this.Platform()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&this.lodash_set(t,"headers.X-Surge-Skip-Scripting",!1),$httpClient.get(t,((t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)}));break;case"Quantumult X":this.isNeedRewrite&&this.lodash_set(t,"opts.hints",!1),$task.fetch(t).then((t=>{const{statusCode:s,statusCode:a,headers:r,body:n,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:n,bodyBytes:o},n,o)}),(t=>e(t&&t.erroror||"UndefinedError")))}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),delete t.headers?.["Content-Length"],delete t.headers?.["content-length"],this.Platform()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&this.lodash_set(t,"headers.X-Surge-Skip-Scripting",!1),$httpClient[s](t,((t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)}));break;case"Quantumult X":t.method=s,this.isNeedRewrite&&this.lodash_set(t,"opts.hints",!1),$task.fetch(t).then((t=>{const{statusCode:s,statusCode:a,headers:r,body:n,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:n,bodyBytes:o},n,o)}),(t=>e(t&&t.erroror||"UndefinedError")))}}time(t,e=null){const s=e?new Date(e):new Date;let a={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in a)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?a[e]:("00"+a[e]).substr((""+a[e]).length)));return t}msg(t=name,e="",s="",a){const r=t=>{switch(typeof t){case void 0:return t;case"string":switch(this.Platform()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t}}case"object":switch(this.Platform()){case"Surge":case"Stash":case"Shadowrocket":default:return{url:t.url||t.openUrl||t["open-url"]};case"Loon":return{openUrl:t.openUrl||t.url||t["open-url"],mediaUrl:t.mediaUrl||t["media-url"]};case"Quantumult X":return{"open-url":t["open-url"]||t.url||t.openUrl,"media-url":t["media-url"]||t.mediaUrl,"update-pasteboard":t["update-pasteboard"]||t.updatePasteboard}}default:return}};if(!this.isMute)switch(this.Platform()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(t,e,s,r(a));break;case"Quantumult X":$notify(t,e,s,r(a))}if(!this.isMuteLog){let a=["","==============📣系统通知📣=============="];a.push(t),e&&a.push(e),s&&a.push(s),console.log(a.join("\n")),this.logs=this.logs.concat(a)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t){this.Platform(),this.log("",`❗️ ${this.name}, 错误!`,t)}wait(t){return new Promise((e=>setTimeout(e,t)))}done(t={}){const e=((new Date).getTime()-this.startTime)/1e3;this.log("",`🚩 ${this.name}, 结束! 🕛 ${e} 秒`),this.log(),this.Platform(),$done(t)}getENV(t,e,s){let a=this.getjson(t,s),r={};if("undefined"!=typeof $argument&&Boolean($argument)){let t=Object.fromEntries($argument.split("&").map((t=>t.split("=").map((t=>t.replace(/\"/g,""))))));for(let e in t)this.setPath(r,e,t[e])}const n={Settings:s?.Default?.Settings||{},Configs:s?.Default?.Configs||{},Caches:{}};Array.isArray(e)||(e=[e]);for(let t of e)n.Settings={...n.Settings,...s?.[t]?.Settings,...r,...a?.[t]?.Settings},n.Configs={...n.Configs,...s?.[t]?.Configs},a?.[t]?.Caches&&"string"==typeof a?.[t]?.Caches&&(a[t].Caches=JSON.parse(a?.[t]?.Caches)),n.Caches={...n.Caches,...a?.[t]?.Caches};return this.traverseObject(n.Settings,((t,e)=>("true"===e||"false"===e?e=JSON.parse(e):"string"==typeof e&&(e=e.includes(",")?e.split(",").map((t=>this.string2number(t))):this.string2number(e)),e))),n}setPath(t,e,s){e.split(".").reduce(((t,a,r)=>t[a]=e.split(".").length===++r?s:t[a]||{}),t)}traverseObject(t,e){for(var s in t){var a=t[s];t[s]="object"==typeof a&&null!==a?this.traverseObject(a,e):e(s,a)}return t}string2number(t){return t&&!isNaN(t)&&(t=parseInt(t,10)),t}}class o{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise(((e,a)=>{s.call(this,t,((t,s,r)=>{t?a(t):e(s)}))}))}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}const i=new n(" iRingo: Set Environment Variables"),c=JSON.parse('{"Settings":{"Switch":true},"Configs":{"Storefront":[["AE","143481"],["AF","143610"],["AG","143540"],["AI","143538"],["AL","143575"],["AM","143524"],["AO","143564"],["AR","143505"],["AT","143445"],["AU","143460"],["AZ","143568"],["BA","143612"],["BB","143541"],["BD","143490"],["BE","143446"],["BF","143578"],["BG","143526"],["BH","143559"],["BJ","143576"],["BM","143542"],["BN","143560"],["BO","143556"],["BR","143503"],["BS","143539"],["BT","143577"],["BW","143525"],["BY","143565"],["BZ","143555"],["CA","143455"],["CD","143613"],["CG","143582"],["CH","143459"],["CI","143527"],["CL","143483"],["CM","143574"],["CN","143465"],["CO","143501"],["CR","143495"],["CV","143580"],["CY","143557"],["CZ","143489"],["DE","143443"],["DK","143458"],["DM","143545"],["DO","143508"],["DZ","143563"],["EC","143509"],["EE","143518"],["EG","143516"],["ES","143454"],["FI","143447"],["FJ","143583"],["FM","143591"],["FR","143442"],["GA","143614"],["GB","143444"],["GD","143546"],["GF","143615"],["GH","143573"],["GM","143584"],["GR","143448"],["GT","143504"],["GW","143585"],["GY","143553"],["HK","143463"],["HN","143510"],["HR","143494"],["HU","143482"],["ID","143476"],["IE","143449"],["IL","143491"],["IN","143467"],["IQ","143617"],["IS","143558"],["IT","143450"],["JM","143511"],["JO","143528"],["JP","143462"],["KE","143529"],["KG","143586"],["KH","143579"],["KN","143548"],["KP","143466"],["KR","143466"],["KW","143493"],["KY","143544"],["KZ","143517"],["TC","143552"],["TD","143581"],["TJ","143603"],["TH","143475"],["TM","143604"],["TN","143536"],["TO","143608"],["TR","143480"],["TT","143551"],["TW","143470"],["TZ","143572"],["LA","143587"],["LB","143497"],["LC","143549"],["LI","143522"],["LK","143486"],["LR","143588"],["LT","143520"],["LU","143451"],["LV","143519"],["LY","143567"],["MA","143620"],["MD","143523"],["ME","143619"],["MG","143531"],["MK","143530"],["ML","143532"],["MM","143570"],["MN","143592"],["MO","143515"],["MR","143590"],["MS","143547"],["MT","143521"],["MU","143533"],["MV","143488"],["MW","143589"],["MX","143468"],["MY","143473"],["MZ","143593"],["NA","143594"],["NE","143534"],["NG","143561"],["NI","143512"],["NL","143452"],["NO","143457"],["NP","143484"],["NR","143606"],["NZ","143461"],["OM","143562"],["PA","143485"],["PE","143507"],["PG","143597"],["PH","143474"],["PK","143477"],["PL","143478"],["PT","143453"],["PW","143595"],["PY","143513"],["QA","143498"],["RO","143487"],["RS","143500"],["RU","143469"],["RW","143621"],["SA","143479"],["SB","143601"],["SC","143599"],["SE","143456"],["SG","143464"],["SI","143499"],["SK","143496"],["SL","143600"],["SN","143535"],["SR","143554"],["ST","143598"],["SV","143506"],["SZ","143602"],["UA","143492"],["UG","143537"],["US","143441"],["UY","143514"],["UZ","143566"],["VC","143550"],["VE","143502"],["VG","143543"],["VN","143471"],["VU","143609"],["XK","143624"],["YE","143571"],["ZA","143472"],["ZM","143622"],["ZW","143605"]]}}');var l=r.t(c,2);const p=JSON.parse('{"Settings":{"Switch":true,"PEP":{"GCC":"US"},"Services":{"PlaceData":"CN","Directions":"AUTO","Traffic":"AUTO","RAP":"XX","Tiles":"AUTO"},"Geo_manifest":{"Dynamic":{"Config":{"Country_code":{"default":"AUTO","iOS":"CN","iPadOS":"CN","watchOS":"US","macOS":"CN"}}}},"Config":{"Announcements":{"Environment:":{"default":"AUTO","iOS":"CN","iPadOS":"CN","watchOS":"XX","macOS":"CN"}},"Defaults":{"LagunaBeach":true,"DrivingMultiWaypointRoutesEnabled":true,"GEOAddressCorrection":true,"LookupMaxParametersCount":true,"LocalitiesAndLandmarks":true,"POIBusyness":true,"PedestrianAR":true,"6694982d2b14e95815e44e970235e230":true,"OpticalHeading":true,"UseCLPedestrianMapMatchedLocations":true,"TransitPayEnabled":true,"SupportsOffline":true,"SupportsCarIntegration":true,"WiFiQualityNetworkDisabled":false,"WiFiQualityTileDisabled":false}}}}');var h=r.t(p,2);const u=JSON.parse('{"Settings":{"Switch":true,"CountryCode":"US","newsPlusUser":true}}');var d=r.t(u,2);const g=JSON.parse('{"Settings":{"Switch":true,"CountryCode":"US","canUse":true}}');var f=r.t(g,2);const S=JSON.parse('{"Settings":{"Switch":true,"CountryCode":"SG","Domains":["web","itunes","app_store","movies","restaurants","maps"],"Functions":["flightutilities","lookup","mail","messages","news","safari","siri","spotlight","visualintelligence"],"Safari_Smart_History":true},"Configs":{"VisualIntelligence":{"enabled_domains":["pets","media","books","art","nature","landmarks"],"supported_domains":["ART","BOOK","MEDIA","LANDMARK","ANIMALS","BIRDS","FOOD","SIGN_SYMBOL","AUTO_SYMBOL","DOGS","NATURE","NATURAL_LANDMARK","INSECTS","REPTILES","ALBUM","STOREFRONT","LAUNDRY_CARE_SYMBOL","CATS","OBJECT_2D","SCULPTURE","SKYLINE","MAMMALS"]}}}');var y=r.t(S,2);const m=JSON.parse('{"Settings":{"Switch":"true","CountryCode":"US","MultiAccount":"false","Universal":"true"}}');var C=r.t(m,2);const b=JSON.parse('{"Settings":{"Switch":true,"Third-Party":false,"HLSUrl":"play-edge.itunes.apple.com","ServerUrl":"play.itunes.apple.com","Tabs":["WatchNow","Originals","MLS","Sports","Kids","Store","Movies","TV","ChannelsAndApps","Library","Search"],"CountryCode":{"Configs":"AUTO","Settings":"AUTO","View":["SG","TW"],"WatchNow":"AUTO","Channels":"AUTO","Originals":"AUTO","Sports":"US","Kids":"US","Store":"AUTO","Movies":"AUTO","TV":"AUTO","Persons":"SG","Search":"AUTO","Others":"AUTO"}},"Configs":{"Locale":[["AU","en-AU"],["CA","en-CA"],["GB","en-GB"],["KR","ko-KR"],["HK","yue-Hant"],["JP","ja-JP"],["MO","zh-Hant"],["TW","zh-Hant"],["US","en-US"],["SG","zh-Hans"]],"Tabs":[{"title":"主页","type":"WatchNow","universalLinks":["https://tv.apple.com/watch-now","https://tv.apple.com/home"],"destinationType":"Target","target":{"id":"tahoma_watchnow","type":"Root","url":"https://tv.apple.com/watch-now"},"isSelected":true},{"title":"Apple TV+","type":"Originals","universalLinks":["https://tv.apple.com/channel/tvs.sbd.4000","https://tv.apple.com/atv"],"destinationType":"Target","target":{"id":"tvs.sbd.4000","type":"Brand","url":"https://tv.apple.com/us/channel/tvs.sbd.4000"}},{"title":"MLS Season Pass","type":"MLS","universalLinks":["https://tv.apple.com/mls"],"destinationType":"Target","target":{"id":"tvs.sbd.7000","type":"Brand","url":"https://tv.apple.com/us/channel/tvs.sbd.7000"}},{"title":"体育节目","type":"Sports","universalLinks":["https://tv.apple.com/sports"],"destinationType":"Target","target":{"id":"tahoma_sports","type":"Root","url":"https://tv.apple.com/sports"}},{"title":"儿童","type":"Kids","universalLinks":["https://tv.apple.com/kids"],"destinationType":"Target","target":{"id":"tahoma_kids","type":"Root","url":"https://tv.apple.com/kids"}},{"title":"电影","type":"Movies","universalLinks":["https://tv.apple.com/movies"],"destinationType":"Target","target":{"id":"tahoma_movies","type":"Root","url":"https://tv.apple.com/movies"}},{"title":"电视节目","type":"TV","universalLinks":["https://tv.apple.com/tv-shows"],"destinationType":"Target","target":{"id":"tahoma_tvshows","type":"Root","url":"https://tv.apple.com/tv-shows"}},{"title":"商店","type":"Store","universalLinks":["https://tv.apple.com/store"],"destinationType":"SubTabs","subTabs":[{"title":"电影","type":"Movies","universalLinks":["https://tv.apple.com/movies"],"destinationType":"Target","target":{"id":"tahoma_movies","type":"Root","url":"https://tv.apple.com/movies"}},{"title":"电视节目","type":"TV","universalLinks":["https://tv.apple.com/tv-shows"],"destinationType":"Target","target":{"id":"tahoma_tvshows","type":"Root","url":"https://tv.apple.com/tv-shows"}}]},{"title":"频道和 App","destinationType":"SubTabs","subTabsPlacementType":"ExpandedList","type":"ChannelsAndApps","subTabs":[]},{"title":"资料库","type":"Library","destinationType":"Client"},{"title":"搜索","type":"Search","universalLinks":["https://tv.apple.com/search"],"destinationType":"Target","target":{"id":"tahoma_search","type":"Root","url":"https://tv.apple.com/search"}}],"i18n":{"WatchNow":[["en","Home"],["zh","主页"],["zh-Hans","主頁"],["zh-Hant","主頁"]],"Movies":[["en","Movies"],["zh","电影"],["zh-Hans","电影"],["zh-Hant","電影"]],"TV":[["en","TV"],["zh","电视节目"],["zh-Hans","电视节目"],["zh-Hant","電視節目"]],"Store":[["en","Store"],["zh","商店"],["zh-Hans","商店"],["zh-Hant","商店"]],"Sports":[["en","Sports"],["zh","体育节目"],["zh-Hans","体育节目"],["zh-Hant","體育節目"]],"Kids":[["en","Kids"],["zh","儿童"],["zh-Hans","儿童"],["zh-Hant","兒童"]],"Library":[["en","Library"],["zh","资料库"],["zh-Hans","资料库"],["zh-Hant","資料庫"]],"Search":[["en","Search"],["zh","搜索"],["zh-Hans","搜索"],["zh-Hant","蒐索"]]}}}');var v=r.t(b,2);const O=new n(" iRingo: 📍 Location v3.1.5(1) response"),T=new class{constructor(t=[]){this.name="URI v1.2.6",this.opts=t,this.json={scheme:"",host:"",path:"",query:{}}}parse(t){let e=t.match(/(?:(?<scheme>.+):\/\/(?<host>[^/]+))?\/?(?<path>[^?]+)?\??(?<query>[^?]+)?/)?.groups??null;if(e?.path?e.paths=e.path.split("/"):e.path="",e?.paths){const t=e.paths[e.paths.length-1];if(t?.includes(".")){const s=t.split(".");e.format=s[s.length-1]}}return e?.query&&(e.query=Object.fromEntries(e.query.split("&").map((t=>t.split("="))))),e}stringify(t=this.json){let e="";return t?.scheme&&t?.host&&(e+=t.scheme+"://"+t.host),t?.path&&(e+=t?.host?"/"+t.path:t.path),t?.query&&(e+="?"+Object.entries(t.query).map((t=>t.join("="))).join("&")),e}},$=new class{#t="@";#e="#";#s={"&amp;":"&","&lt;":"<","&gt;":">","&apos;":"'","&quot;":'"'};#a={"&":"&amp;","<":"&lt;",">":"&gt;","'":"&apos;",'"':"&quot;"};constructor(t){this.name="XML v0.4.0-2",this.opts=t,BigInt.prototype.toJSON=()=>this.toString()}parse(t=new String,e=""){const s=this.#s,a=this.#t,r=this.#e;let n=function t(e,s){let n;switch(typeof e){case"string":case"undefined":n=e;break;case"object":const l=e.raw,p=e.name,h=e.tag,u=e.children;n=l||(h?function(t,e){if(!t)return;const s=t.split(/([^\s='"]+(?:\s*=\s*(?:'[\S\s]*?'|"[\S\s]*?"|[^\s'"]*))?)/),r=s.length;let n,o;for(let t=0;t<r;t++){let r=l(s[t]);if(!r)continue;n||(n={});const p=r.indexOf("=");if(p<0)r=a+r,o=null;else{o=r.substr(p+1).replace(/^\s+/,""),r=a+r.substr(0,p).replace(/\s+$/,"");const t=o[0];t!==o[o.length-1]||"'"!==t&&'"'!==t||(o=o.substr(1,o.length-2)),o=i(o)}e&&(o=e(r,o)),c(n,r,o)}return n;function l(t){return t?.trim?.()}}(h,s):u?{}:{[p]:void 0}),"plist"===p?n=Object.assign(n,o(u[0],s)):u?.forEach?.(((e,a)=>{"string"==typeof e?c(n,r,t(e,s),void 0):e.tag||e.children||e.raw?c(n,e.name,t(e,s),void 0):c(n,e.name,t(e,s),u?.[a-1]?.name)})),u&&0===u.length&&c(n,r,null,void 0),s&&(n=s(p||"",n))}return n;function c(t,e,s,a=e){if(void 0!==s){const r=t[a];Array.isArray(r)?r.push(s):r?t[a]=[r,s]:t[e]=s}}}(function(t){const e=t.replace(/^[ \t]+/gm,"").split(/<([^!<>?](?:'[\S\s]*?'|"[\S\s]*?"|[^'"<>])*|!(?:--[\S\s]*?--|\[[^\[\]'"<>]+\[[\S\s]*?]]|DOCTYPE[^\[<>]*?\[[\S\s]*?]|(?:ENTITY[^"<>]*?"[\S\s]*?")?[\S\s]*?)|\?[\S\s]*?\?)>/),s=e.length,a={children:[]};let r=a;const n=[];for(let t=0;t<s;){const s=e[t++];s&&c(s);const a=e[t++];a&&o(a)}return a;function o(t){const e=t.split(" "),s=e.shift(),a=e.length;let o={};switch(s[0]){case"/":const i=t.replace(/^\/|[\s\/].*$/g,"").toLowerCase();for(;n.length;){const t=r?.name?.toLowerCase?.();if(r=n.pop(),t===i)break}break;case"?":o.name=s,o.raw=e.join(" "),l(o);break;case"!":/!\[CDATA\[(.+)\]\]/.test(t)?(o.name="!CDATA",o.raw=t.match(/!\[CDATA\[(.+)\]\]/)):(o.name=s,o.raw=e.join(" ")),l(o);break;default:o=function(t){const e={children:[]},s=(t=t.replace(/\s*\/?$/,"")).search(/[\s='"\/]/);return s<0?e.name=t:(e.name=t.substr(0,s),e.tag=t.substr(s)),e}(t),l(o),"/"===(e?.[a-1]??s).slice(-1)||"link"===s?delete o.children:(n.push(r),r=o)}}function c(t){(t=function(t){return t?.replace?.(/^(\r\n|\r|\n|\t)+|(\r\n|\r|\n|\t)+$/g,"")}(t))&&l(i(t))}function l(t){r.children.push(t)}}(t),e);return n;function o(t,e){let s;switch(typeof t){case"string":case"undefined":s=t;break;case"object":const a=t.name,r=t.children;switch(s={},a){case"plist":let t=o(r[0],e);s=Object.assign(s,t);break;case"dict":let n=r.map((t=>o(t,e)));n=function(t,e){for(var s=0,a=[];s<t.length;)a.push(t.slice(s,s+=2));return a}(n),s=Object.fromEntries(n);break;case"array":Array.isArray(s)||(s=[]),s=r.map((t=>o(t,e)));break;case"key":case"string":s=r[0];break;case"true":case"false":const i=a;s=JSON.parse(i);break;case"integer":const c=r[0];s=BigInt(c);break;case"real":const l=r[0];s=parseFloat(l)}e&&(s=e(a||"",s))}return s}function i(t){return t.replace(/(&(?:lt|gt|amp|apos|quot|#(?:\d{1,6}|x[0-9a-fA-F]{1,5}));)/g,(function(t){if("#"===t[1]){const e="x"===t[2]?parseInt(t.substr(3),16):parseInt(t.substr(2),10);if(e>-1)return String.fromCharCode(e)}return s[t]||t}))}}stringify(t=new Object,e=""){this.#a;const s=this.#t,a=this.#e;let r="";for(let e in t)r+=n(t[e],e,"");return r=e?r.replace(/\t/g,e):r.replace(/\t|\n/g,""),r;function n(t,e,r){let i="";switch(typeof t){case"object":if(Array.isArray(t))i=t.reduce(((t,s)=>t+`${r}${n(s,e,`${r}\t`)}\n`),"");else{let c="",l=!1;for(let a in t)a[0]===s?(c+=` ${a.substring(1)}="${t[a].toString()}"`,delete t[a]):void 0===t[a]?e=a:l=!0;if(i+=`${r}<${e}${c}${l||"link"===e?"":"/"}>`,l){if("plist"===e)i+=o(t,e,`${r}\t`);else for(let e in t)i+=e===a?t[e]??"":n(t[e],e,`${r}\t`);i+=("\n"===i.slice(-1)?r:"")+`</${e}>`}}break;case"string":switch(e){case"?xml":i+=`${r}<${e} ${t.toString()}>`;break;case"?":i+=`${r}<${e}${t.toString()}${e}>`;break;case"!":i+=`${r}\x3c!--${t.toString()}--\x3e`;break;case"!DOCTYPE":i+=`${r}<${e} ${t.toString()}>`;break;case"!CDATA":i+=`${r}<![CDATA[${t.toString()}]]>`;break;case a:i+=t;break;default:i+=`${r}<${e}>${t.toString()}</${e}>`}break;case"undefined":i+=r+`<${e.toString()}/>`}return i}function o(t,e,s){let a="";switch(typeof t){case"boolean":a=`${s}<${t.toString()}/>`;break;case"number":a=`${s}<real>${t.toString()}</real>`;break;case"bigint":a=`${s}<integer>${t.toString()}</integer>`;break;case"string":a=`${s}<string>${t.toString()}</string>`;break;case"object":let i="";if(Array.isArray(t)){for(var r=0,n=t.length;r<n;r++)i+=`${s}${o(t[r],e,`${s}\t`)}`;a=`${s}<array>${i}${s}</array>`}else{let e="";Object.entries(t).forEach((([t,a])=>{e+=`${s}<key>${t}</key>`,e+=o(a,t,s)})),a=`${s}<dict>${e}${s}</dict>`}}return a}}},A={Default:l,Location:h,News:d,PrivateRelay:f,Siri:y,TestFlight:C,TV:v},w=T.parse($request.url);O.log(`⚠ ${O.name}`,`URL: ${JSON.stringify(w)}`,"");const E=$request.method,P=w.host,L=w.path;w.paths,O.log(`⚠ ${O.name}`,`METHOD: ${E}`,"");const N=($response.headers?.["Content-Type"]??$response.headers?.["content-type"])?.split(";")?.[0];O.log(`⚠ ${O.name}`,`FORMAT: ${N}`,""),(async()=>{const{Settings:t,Caches:e,Configs:s}=function(t,e,s){i.log(`☑️ ${i.name}`,"");let{Settings:a,Caches:r,Configs:n}=i.getENV("iRingo","Location",s);if(a?.Tabs&&!Array.isArray(a?.Tabs)&&i.lodash_set(a,"Tabs",a?.Tabs?[a.Tabs.toString()]:[]),a?.Domains&&!Array.isArray(a?.Domains)&&i.lodash_set(a,"Domains",a?.Domains?[a.Domains.toString()]:[]),a?.Functions&&!Array.isArray(a?.Functions)&&i.lodash_set(a,"Functions",a?.Functions?[a.Functions.toString()]:[]),i.log(`✅ ${i.name}`,"Settings: "+typeof a,`Settings内容: ${JSON.stringify(a)}`,""),n.Storefront=new Map(n.Storefront),n.Locale&&(n.Locale=new Map(n.Locale)),n.i18n)for(let t in n.i18n)n.i18n[t]=new Map(n.i18n[t]);return{Settings:a,Caches:r,Configs:n}}(0,0,A);switch(O.log(`⚠ ${O.name}`,`Settings.Switch: ${t?.Switch}`,""),t.Switch){case!0:default:let s={};switch(N){case void 0:break;case"application/x-www-form-urlencoded":case"text/plain":case"text/html":default:"gspe1-ssl.ls.apple.com"===P&&"pep/gcc"===L&&(await async function(t,e){if(O.log(`⚠ ${O.name}, Set GCC`,`caches.${t}.gcc = ${e?.[t]?.gcc}`,""),$response.body!==e?.[t]?.gcc){let s=e;s[t]={gcc:$response.body},O.setjson(s,"@iRingo.Location.Caches")}return O.log(`🎉 ${O.name}, Set GCC`,`caches.${t}.gcc = ${e?.[t]?.gcc}`,"")}("pep",e),"AUTO"===t.PEP.GCC||($response.body=t.PEP.GCC));break;case"application/x-mpegURL":case"application/x-mpegurl":case"application/vnd.apple.mpegurl":case"audio/mpegurl":break;case"text/xml":case"text/plist":case"application/xml":case"application/plist":case"application/x-plist":if(s=$.parse($response.body),"configuration.ls.apple.com"===P&&"config/defaults"===L){const e=s.plist;e&&(e["com.apple.GEO"].CountryProviders.CN.ShouldEnableLagunaBeach=t?.Config?.Defaults?.LagunaBeach??!0,e["com.apple.GEO"].CountryProviders.CN.DrivingMultiWaypointRoutesEnabled=t?.Config?.Defaults?.DrivingMultiWaypointRoutesEnabled??!0,e["com.apple.GEO"].CountryProviders.CN.GEOAddressCorrectionEnabled=t?.Config?.Defaults?.GEOAddressCorrection??!0,(t?.Config?.Defaults?.LookupMaxParametersCount??1)&&(delete e["com.apple.GEO"].CountryProviders.CN.GEOBatchSpatialEventLookupMaxParametersCount,delete e["com.apple.GEO"].CountryProviders.CN.GEOBatchSpatialPlaceLookupMaxParametersCount),e["com.apple.GEO"].CountryProviders.CN.LocalitiesAndLandmarksSupported=t?.Config?.Defaults?.LocalitiesAndLandmarks??!0,e["com.apple.GEO"].CountryProviders.CN.POIBusynessDifferentialPrivacy=t?.Config?.Defaults?.POIBusyness??!0,e["com.apple.GEO"].CountryProviders.CN.POIBusynessRealTime=t?.Config?.Defaults?.POIBusyness??!0,e["com.apple.GEO"].CountryProviders.CN.TransitPayEnabled=t?.Config?.Defaults?.TransitPayEnabled??!0,e["com.apple.GEO"].CountryProviders.CN.SupportsOffline=t?.Config?.Defaults?.SupportsOffline??!0,e["com.apple.GEO"].CountryProviders.CN.SupportsCarIntegration=t?.Config?.Defaults?.SupportsCarIntegration??!0,e["com.apple.GEO"].CountryProviders.CN["6694982d2b14e95815e44e970235e230"]=t?.Config?.Defaults?.["6694982d2b14e95815e44e970235e230"]??!0,e["com.apple.GEO"].CountryProviders.CN.PedestrianAREnabled=t?.Config?.Defaults?.PedestrianAR??!0,e["com.apple.GEO"].CountryProviders.CN.OpticalHeadingEnabled=t?.Config?.Defaults?.OpticalHeading??!0,e["com.apple.GEO"].CountryProviders.CN.UseCLPedestrianMapMatchedLocations=t?.Config?.Defaults?.UseCLPedestrianMapMatchedLocations??!0)}$response.body=$.stringify(s);case"text/vtt":case"application/vtt":case"text/json":case"application/json":case"application/protobuf":case"application/x-protobuf":case"application/vnd.google.protobuf":case"application/grpc":case"application/grpc+proto":case"applecation/octet-stream":}case!1:}})().catch((t=>O.logErr(t))).finally((()=>{if(void 0!==$response)if(O.log(`🎉 ${O.name}, finally`,"$response",`FORMAT: ${N}`,""),$response?.headers?.["Content-Encoding"]&&($response.headers["Content-Encoding"]="identity"),$response?.headers?.["content-encoding"]&&($response.headers["content-encoding"]="identity"),O.isQuanX())switch(N){case void 0:O.done({status:$response.status,headers:$response.headers});break;default:O.done({status:$response.status,headers:$response.headers,body:$response.body});break;case"application/protobuf":case"application/x-protobuf":case"application/vnd.google.protobuf":case"application/grpc":case"application/grpc+proto":case"applecation/octet-stream":O.done({status:$response.status,headers:$response.headers,bodyBytes:$response.bodyBytes.buffer.slice($response.bodyBytes.byteOffset,$response.bodyBytes.byteLength+$response.bodyBytes.byteOffset)})}else O.done($response)}))})();