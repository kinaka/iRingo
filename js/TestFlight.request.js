class e{constructor(e,s){this.name=e,this.version="1.2.0",this.http=new t(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,s),this.log("",`🏁 开始! ENV v${this.version}, ${this.name}`,"")}platform(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.platform()}isQuanX(){return"Quantumult X"===this.platform()}isSurge(){return"Surge"===this.platform()}isLoon(){return"Loon"===this.platform()}isShadowrocket(){return"Shadowrocket"===this.platform()}isStash(){return"Stash"===this.platform()}toObj(e,t=null){try{return JSON.parse(e)}catch{return t}}toStr(e,t=null){try{return JSON.stringify(e)}catch{return t}}getjson(e,t){let s=t;if(this.getdata(e))try{s=JSON.parse(this.getdata(e))}catch{}return s}setjson(e,t){try{return this.setdata(JSON.stringify(e),t)}catch{return!1}}getScript(e){return new Promise((t=>{this.get({url:e},((e,s,a)=>t(a)))}))}runScript(e,t){return new Promise((s=>{let a=this.getdata("@chavy_boxjs_userCfgs.httpapi");a=a?a.replace(/\n/g,"").trim():a;let i=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");i=i?1*i:20,i=t&&t.timeout?t.timeout:i;const[o,r]=a.split("@"),n={url:`http://${r}/v1/scripting/evaluate`,body:{script_text:e,mock_type:"cron",timeout:i},headers:{"X-Key":o,Accept:"*/*"},timeout:i};this.post(n,((e,t,a)=>s(a)))})).catch((e=>this.logErr(e)))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const e=this.path.resolve(this.dataFile),t=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(e),a=!s&&this.fs.existsSync(t);if(!s&&!a)return{};{const a=s?e:t;try{return JSON.parse(this.fs.readFileSync(a))}catch(e){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const e=this.path.resolve(this.dataFile),t=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(e),a=!s&&this.fs.existsSync(t),i=JSON.stringify(this.data);s?this.fs.writeFileSync(e,i):a?this.fs.writeFileSync(t,i):this.fs.writeFileSync(e,i)}}lodash_get(e={},t="",s=void 0){Array.isArray(t)||(t=t.replace(/\[(\d+)\]/g,".$1").split(".").filter(Boolean));const a=t.reduce(((e,t)=>Object(e)[t]),e);return void 0===a?s:a}lodash_set(e={},t="",s){return Array.isArray(t)||(t=t.replace(/\[(\d+)\]/g,".$1").split(".").filter(Boolean)),t.slice(0,-1).reduce(((e,s,a)=>Object(e[s])===e[s]?e[s]:e[s]=/^\d+$/.test(t[a+1])?[]:{}),e)[t[t.length-1]]=s,e}getdata(e){let t=this.getval(e);if(/^@/.test(e)){const[,s,a]=/^@(.*?)\.(.*?)$/.exec(e),i=s?this.getval(s):"";if(i)try{const e=JSON.parse(i);t=e?this.lodash_get(e,a,""):t}catch(e){t=""}}return t}setdata(e,t){let s=!1;if(/^@/.test(t)){const[,a,i]=/^@(.*?)\.(.*?)$/.exec(t),o=this.getval(a),r=a?"null"===o?null:o||"{}":"{}";try{const t=JSON.parse(r);this.lodash_set(t,i,e),s=this.setval(JSON.stringify(t),a)}catch(t){const o={};this.lodash_set(o,i,e),s=this.setval(JSON.stringify(o),a)}}else s=this.setval(e,t);return s}getval(e){switch(this.platform()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(e);case"Quantumult X":return $prefs.valueForKey(e);case"Node.js":return this.data=this.loaddata(),this.data[e];default:return this.data&&this.data[e]||null}}setval(e,t){switch(this.platform()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(e,t);case"Quantumult X":return $prefs.setValueForKey(e,t);case"Node.js":return this.data=this.loaddata(),this.data[t]=e,this.writedata(),!0;default:return this.data&&this.data[t]||null}}initGotEnv(e){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,e&&(e.headers=e.headers?e.headers:{},void 0===e.headers.Cookie&&void 0===e.cookieJar&&(e.cookieJar=this.ckjar))}get(e,t=(()=>{})){switch(delete e?.headers?.["Content-Length"],delete e?.headers?.["content-length"],this.platform()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&this.lodash_set(e,"headers.X-Surge-Skip-Scripting",!1),$httpClient.get(e,((e,s,a)=>{!e&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),t(e,s,a)}));break;case"Quantumult X":this.isNeedRewrite&&this.lodash_set(e,"opts.hints",!1),$task.fetch(e).then((e=>{const{statusCode:s,statusCode:a,headers:i,body:o,bodyBytes:r}=e;t(null,{status:s,statusCode:a,headers:i,body:o,bodyBytes:r},o,r)}),(e=>t(e&&e.error||"UndefinedError")));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(e),this.got(e).on("redirect",((e,t)=>{try{if(e.headers["set-cookie"]){const s=e.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),t.cookieJar=this.ckjar}}catch(e){this.logErr(e)}})).then((e=>{const{statusCode:a,statusCode:i,headers:o,rawBody:r}=e,n=s.decode(r,this.encoding);t(null,{status:a,statusCode:i,headers:o,rawBody:r,body:n},n)}),(e=>{const{message:a,response:i}=e;t(a,i,i&&s.decode(i.rawBody,this.encoding))}))}}post(e,t=(()=>{})){const s=e.method?e.method.toLocaleLowerCase():"post";switch(e.body&&e.headers&&!e.headers["Content-Type"]&&!e.headers["content-type"]&&(e.headers["content-type"]="application/x-www-form-urlencoded"),delete e?.headers?.["Content-Length"],delete e?.headers?.["content-length"],this.platform()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&this.lodash_set(e,"headers.X-Surge-Skip-Scripting",!1),$httpClient[s](e,((e,s,a)=>{!e&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),t(e,s,a)}));break;case"Quantumult X":e.method=s,this.isNeedRewrite&&this.lodash_set(e,"opts.hints",!1),$task.fetch(e).then((e=>{const{statusCode:s,statusCode:a,headers:i,body:o,bodyBytes:r}=e;t(null,{status:s,statusCode:a,headers:i,body:o,bodyBytes:r},o,r)}),(e=>t(e&&e.error||"UndefinedError")));break;case"Node.js":let a=require("iconv-lite");this.initGotEnv(e);const{url:i,...o}=e;this.got[s](i,o).then((e=>{const{statusCode:s,statusCode:i,headers:o,rawBody:r}=e,n=a.decode(r,this.encoding);t(null,{status:s,statusCode:i,headers:o,rawBody:r,body:n},n)}),(e=>{const{message:s,response:i}=e;t(s,i,i&&a.decode(i.rawBody,this.encoding))}))}}time(e,t=null){const s=t?new Date(t):new Date;let a={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(e)&&(e=e.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let t in a)new RegExp("("+t+")").test(e)&&(e=e.replace(RegExp.$1,1==RegExp.$1.length?a[t]:("00"+a[t]).substr((""+a[t]).length)));return e}msg(e=name,t="",s="",a){const i=e=>{switch(typeof e){case void 0:return e;case"string":switch(this.platform()){case"Surge":case"Stash":default:return{url:e};case"Loon":case"Shadowrocket":return e;case"Quantumult X":return{"open-url":e};case"Node.js":return}case"object":switch(this.platform()){case"Surge":case"Stash":case"Shadowrocket":default:return{url:e.url||e.openUrl||e["open-url"]};case"Loon":return{openUrl:e.openUrl||e.url||e["open-url"],mediaUrl:e.mediaUrl||e["media-url"]};case"Quantumult X":return{"open-url":e["open-url"]||e.url||e.openUrl,"media-url":e["media-url"]||e.mediaUrl,"update-pasteboard":e["update-pasteboard"]||e.updatePasteboard};case"Node.js":return}default:return}};if(!this.isMute)switch(this.platform()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,t,s,i(a));break;case"Quantumult X":$notify(e,t,s,i(a));case"Node.js":}if(!this.isMuteLog){let a=["","==============📣系统通知📣=============="];a.push(e),t&&a.push(t),s&&a.push(s),console.log(a.join("\n")),this.logs=this.logs.concat(a)}}log(...e){e.length>0&&(this.logs=[...this.logs,...e]),console.log(e.join(this.logSeparator))}logErr(e){switch(this.platform()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`❗️ ${this.name}, 错误!`,e);break;case"Node.js":this.log("",`❗️${this.name}, 错误!`,e.stack)}}wait(e){return new Promise((t=>setTimeout(t,e)))}done(e={}){const t=((new Date).getTime()-this.startTime)/1e3;switch(this.log("",`🚩 ${this.name}, 结束! 🕛 ${t} 秒`),this.log(),this.platform()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(e);break;case"Node.js":process.exit(1)}}getENV(e,t,s){let a=this.getjson(e,s),i={};if("undefined"!=typeof $argument&&Boolean($argument)){let e=Object.fromEntries($argument.split("&").map((e=>e.split("=").map((e=>e.replace(/\"/g,""))))));for(let t in e)this.lodash_set(i,t,e[t])}const o={Settings:s?.Default?.Settings||{},Configs:s?.Default?.Configs||{},Caches:{}};Array.isArray(t)||(t=[t]);for(let e of t)o.Settings={...o.Settings,...s?.[e]?.Settings,...i,...a?.[e]?.Settings},o.Configs={...o.Configs,...s?.[e]?.Configs},a?.[e]?.Caches&&"string"==typeof a?.[e]?.Caches&&(a[e].Caches=JSON.parse(a?.[e]?.Caches)),o.Caches={...o.Caches,...a?.[e]?.Caches};return this.traverseObject(o.Settings,((e,t)=>("true"===t||"false"===t?t=JSON.parse(t):"string"==typeof t&&(t=t.includes(",")?t.split(",").map((e=>this.string2number(e))):this.string2number(t)),t))),o}traverseObject(e,t){for(var s in e){var a=e[s];e[s]="object"==typeof a&&null!==a?this.traverseObject(a,t):t(s,a)}return e}string2number(e){return e&&!isNaN(e)&&(e=parseInt(e,10)),e}}class t{constructor(e){this.env=e}send(e,t="GET"){e="string"==typeof e?{url:e}:e;let s=this.get;return"POST"===t&&(s=this.post),new Promise(((t,a)=>{s.call(this,e,((e,s,i)=>{e?a(e):t(s)}))}))}get(e){return this.send.call(this.env,e)}post(e){return this.send.call(this.env,e,"POST")}}var s={Switch:!0},a={Storefront:[["AE","143481"],["AF","143610"],["AG","143540"],["AI","143538"],["AL","143575"],["AM","143524"],["AO","143564"],["AR","143505"],["AT","143445"],["AU","143460"],["AZ","143568"],["BA","143612"],["BB","143541"],["BD","143490"],["BE","143446"],["BF","143578"],["BG","143526"],["BH","143559"],["BJ","143576"],["BM","143542"],["BN","143560"],["BO","143556"],["BR","143503"],["BS","143539"],["BT","143577"],["BW","143525"],["BY","143565"],["BZ","143555"],["CA","143455"],["CD","143613"],["CG","143582"],["CH","143459"],["CI","143527"],["CL","143483"],["CM","143574"],["CN","143465"],["CO","143501"],["CR","143495"],["CV","143580"],["CY","143557"],["CZ","143489"],["DE","143443"],["DK","143458"],["DM","143545"],["DO","143508"],["DZ","143563"],["EC","143509"],["EE","143518"],["EG","143516"],["ES","143454"],["FI","143447"],["FJ","143583"],["FM","143591"],["FR","143442"],["GA","143614"],["GB","143444"],["GD","143546"],["GF","143615"],["GH","143573"],["GM","143584"],["GR","143448"],["GT","143504"],["GW","143585"],["GY","143553"],["HK","143463"],["HN","143510"],["HR","143494"],["HU","143482"],["ID","143476"],["IE","143449"],["IL","143491"],["IN","143467"],["IQ","143617"],["IS","143558"],["IT","143450"],["JM","143511"],["JO","143528"],["JP","143462"],["KE","143529"],["KG","143586"],["KH","143579"],["KN","143548"],["KP","143466"],["KR","143466"],["KW","143493"],["KY","143544"],["KZ","143517"],["TC","143552"],["TD","143581"],["TJ","143603"],["TH","143475"],["TM","143604"],["TN","143536"],["TO","143608"],["TR","143480"],["TT","143551"],["TW","143470"],["TZ","143572"],["LA","143587"],["LB","143497"],["LC","143549"],["LI","143522"],["LK","143486"],["LR","143588"],["LT","143520"],["LU","143451"],["LV","143519"],["LY","143567"],["MA","143620"],["MD","143523"],["ME","143619"],["MG","143531"],["MK","143530"],["ML","143532"],["MM","143570"],["MN","143592"],["MO","143515"],["MR","143590"],["MS","143547"],["MT","143521"],["MU","143533"],["MV","143488"],["MW","143589"],["MX","143468"],["MY","143473"],["MZ","143593"],["NA","143594"],["NE","143534"],["NG","143561"],["NI","143512"],["NL","143452"],["NO","143457"],["NP","143484"],["NR","143606"],["NZ","143461"],["OM","143562"],["PA","143485"],["PE","143507"],["PG","143597"],["PH","143474"],["PK","143477"],["PL","143478"],["PT","143453"],["PW","143595"],["PY","143513"],["QA","143498"],["RO","143487"],["RS","143500"],["RU","143469"],["RW","143621"],["SA","143479"],["SB","143601"],["SC","143599"],["SE","143456"],["SG","143464"],["SI","143499"],["SK","143496"],["SL","143600"],["SN","143535"],["SR","143554"],["ST","143598"],["SV","143506"],["SZ","143602"],["UA","143492"],["UG","143537"],["US","143441"],["UY","143514"],["UZ","143566"],["VC","143550"],["VE","143502"],["VG","143543"],["VN","143471"],["VU","143609"],["XK","143624"],["YE","143571"],["ZA","143472"],["ZM","143622"],["ZW","143605"]]},i={Settings:s,Configs:a},o={Switch:!0,PEP:{GCC:"US"},Services:{PlaceData:"CN",Directions:"AUTO",Traffic:"AUTO",RAP:"XX",Tiles:"AUTO"},Geo_manifest:{Dynamic:{Config:{Country_code:{default:"AUTO",iOS:"CN",iPadOS:"CN",watchOS:"US",macOS:"CN"}}}},Config:{Announcements:{"Environment:":{default:"AUTO",iOS:"CN",iPadOS:"CN",watchOS:"XX",macOS:"CN"}},Defaults:{LagunaBeach:!0,DrivingMultiWaypointRoutesEnabled:!0,GEOAddressCorrection:!0,LookupMaxParametersCount:!0,LocalitiesAndLandmarks:!0,POIBusyness:!0,PedestrianAR:!0,"6694982d2b14e95815e44e970235e230":!0,OpticalHeading:!0,UseCLPedestrianMapMatchedLocations:!0,TransitPayEnabled:!0,SupportsOffline:!0,SupportsCarIntegration:!0,WiFiQualityNetworkDisabled:!1,WiFiQualityTileDisabled:!1}}},r={Settings:o},n={Switch:!0,CountryCode:"US",newsPlusUser:!0},c={Settings:n},h={Switch:!0,CountryCode:"US",canUse:!0},l={Settings:h},d={Switch:!0,CountryCode:"SG",Domains:["web","itunes","app_store","movies","restaurants","maps"],Functions:["flightutilities","lookup","mail","messages","news","safari","siri","spotlight","visualintelligence"],Safari_Smart_History:!0},u={VisualIntelligence:{enabled_domains:["pets","media","books","art","nature","landmarks"],supported_domains:["ART","BOOK","MEDIA","LANDMARK","ANIMALS","BIRDS","FOOD","SIGN_SYMBOL","AUTO_SYMBOL","DOGS","NATURE","NATURAL_LANDMARK","INSECTS","REPTILES","ALBUM","STOREFRONT","LAUNDRY_CARE_SYMBOL","CATS","OBJECT_2D","SCULPTURE","SKYLINE","MAMMALS"]}},p={Settings:d,Configs:u},g={Switch:"true",CountryCode:"US",MultiAccount:"false",Universal:"true"},S={Settings:g},f={Switch:!0,"Third-Party":!1,HLSUrl:"play-edge.itunes.apple.com",ServerUrl:"play.itunes.apple.com",Tabs:["WatchNow","Originals","MLS","Sports","Kids","Store","Movies","TV","ChannelsAndApps","Library","Search"],CountryCode:{Configs:"AUTO",Settings:"AUTO",View:["SG","TW"],WatchNow:"AUTO",Channels:"AUTO",Originals:"AUTO",Sports:"US",Kids:"US",Store:"AUTO",Movies:"AUTO",TV:"AUTO",Persons:"SG",Search:"AUTO",Others:"AUTO"}},m={Locale:[["AU","en-AU"],["CA","en-CA"],["GB","en-GB"],["KR","ko-KR"],["HK","yue-Hant"],["JP","ja-JP"],["MO","zh-Hant"],["TW","zh-Hant"],["US","en-US"],["SG","zh-Hans"]],Tabs:[{title:"主页",type:"WatchNow",universalLinks:["https://tv.apple.com/watch-now","https://tv.apple.com/home"],destinationType:"Target",target:{id:"tahoma_watchnow",type:"Root",url:"https://tv.apple.com/watch-now"},isSelected:!0},{title:"Apple TV+",type:"Originals",universalLinks:["https://tv.apple.com/channel/tvs.sbd.4000","https://tv.apple.com/atv"],destinationType:"Target",target:{id:"tvs.sbd.4000",type:"Brand",url:"https://tv.apple.com/us/channel/tvs.sbd.4000"}},{title:"MLS Season Pass",type:"MLS",universalLinks:["https://tv.apple.com/mls"],destinationType:"Target",target:{id:"tvs.sbd.7000",type:"Brand",url:"https://tv.apple.com/us/channel/tvs.sbd.7000"}},{title:"体育节目",type:"Sports",universalLinks:["https://tv.apple.com/sports"],destinationType:"Target",target:{id:"tahoma_sports",type:"Root",url:"https://tv.apple.com/sports"}},{title:"儿童",type:"Kids",universalLinks:["https://tv.apple.com/kids"],destinationType:"Target",target:{id:"tahoma_kids",type:"Root",url:"https://tv.apple.com/kids"}},{title:"电影",type:"Movies",universalLinks:["https://tv.apple.com/movies"],destinationType:"Target",target:{id:"tahoma_movies",type:"Root",url:"https://tv.apple.com/movies"}},{title:"电视节目",type:"TV",universalLinks:["https://tv.apple.com/tv-shows"],destinationType:"Target",target:{id:"tahoma_tvshows",type:"Root",url:"https://tv.apple.com/tv-shows"}},{title:"商店",type:"Store",universalLinks:["https://tv.apple.com/store"],destinationType:"SubTabs",subTabs:[{title:"电影",type:"Movies",universalLinks:["https://tv.apple.com/movies"],destinationType:"Target",target:{id:"tahoma_movies",type:"Root",url:"https://tv.apple.com/movies"}},{title:"电视节目",type:"TV",universalLinks:["https://tv.apple.com/tv-shows"],destinationType:"Target",target:{id:"tahoma_tvshows",type:"Root",url:"https://tv.apple.com/tv-shows"}}]},{title:"频道和 App",destinationType:"SubTabs",subTabsPlacementType:"ExpandedList",type:"ChannelsAndApps",subTabs:[]},{title:"资料库",type:"Library",destinationType:"Client"},{title:"搜索",type:"Search",universalLinks:["https://tv.apple.com/search"],destinationType:"Target",target:{id:"tahoma_search",type:"Root",url:"https://tv.apple.com/search"}}],i18n:{WatchNow:[["en","Home"],["zh","主页"],["zh-Hans","主頁"],["zh-Hant","主頁"]],Movies:[["en","Movies"],["zh","电影"],["zh-Hans","电影"],["zh-Hant","電影"]],TV:[["en","TV"],["zh","电视节目"],["zh-Hans","电视节目"],["zh-Hant","電視節目"]],Store:[["en","Store"],["zh","商店"],["zh-Hans","商店"],["zh-Hant","商店"]],Sports:[["en","Sports"],["zh","体育节目"],["zh-Hans","体育节目"],["zh-Hant","體育節目"]],Kids:[["en","Kids"],["zh","儿童"],["zh-Hans","儿童"],["zh-Hant","兒童"]],Library:[["en","Library"],["zh","资料库"],["zh-Hans","资料库"],["zh-Hant","資料庫"]],Search:[["en","Search"],["zh","搜索"],["zh-Hans","搜索"],["zh-Hant","蒐索"]]}},y={Settings:f,Configs:m},v=Database={Default:Object.freeze({__proto__:null,Configs:a,Settings:s,default:i}),Location:Object.freeze({__proto__:null,Settings:o,default:r}),News:Object.freeze({__proto__:null,Settings:n,default:c}),PrivateRelay:Object.freeze({__proto__:null,Settings:h,default:l}),Siri:Object.freeze({__proto__:null,Configs:u,Settings:d,default:p}),TestFlight:Object.freeze({__proto__:null,Settings:g,default:S}),TV:Object.freeze({__proto__:null,Configs:m,Settings:f,default:y})};const T=new e(" iRingo: Set Environment Variables");const b=new e(" iRingo: ✈ TestFlight v3.1.1(2) request"),C=new class{constructor(e=[]){this.name="URI v1.2.6",this.opts=e,this.json={scheme:"",host:"",path:"",query:{}}}parse(e){let t=e.match(/(?:(?<scheme>.+):\/\/(?<host>[^/]+))?\/?(?<path>[^?]+)?\??(?<query>[^?]+)?/)?.groups??null;if(t?.path?t.paths=t.path.split("/"):t.path="",t?.paths){const e=t.paths[t.paths.length-1];if(e?.includes(".")){const s=e.split(".");t.format=s[s.length-1]}}return t?.query&&(t.query=Object.fromEntries(t.query.split("&").map((e=>e.split("="))))),t}stringify(e=this.json){let t="";return e?.scheme&&e?.host&&(t+=e.scheme+"://"+e.host),e?.path&&(t+=e?.host?"/"+e.path:e.path),e?.query&&(t+="?"+Object.entries(e.query).map((e=>e.join("="))).join("&")),t}};let $;const w=C.parse($request.url);b.log(`⚠ ${b.name}`,`URL: ${JSON.stringify(w)}`,"");const O=$request.method,A=w.host,N=w.path,L=w.paths;b.log(`⚠ ${b.name}`,`METHOD: ${O}`,"");const k=($request.headers?.["Content-Type"]??$request.headers?.["content-type"])?.split(";")?.[0];b.log(`⚠ ${b.name}`,`FORMAT: ${k}`,""),(async()=>{const{Settings:e,Caches:t,Configs:s}=function(e,t,s){T.log(`☑️ ${T.name}`,"");let{Settings:a,Caches:i,Configs:o}=T.getENV(e,t,s);if(a?.Tabs&&!Array.isArray(a?.Tabs)&&T.lodash_set(a,"Tabs",a?.Tabs?[a.Tabs.toString()]:[]),a?.Domains&&!Array.isArray(a?.Domains)&&T.lodash_set(a,"Domains",a?.Domains?[a.Domains.toString()]:[]),a?.Functions&&!Array.isArray(a?.Functions)&&T.lodash_set(a,"Functions",a?.Functions?[a.Functions.toString()]:[]),T.log(`✅ ${T.name}`,"Settings: "+typeof a,`Settings内容: ${JSON.stringify(a)}`,""),o.Storefront=new Map(o.Storefront),o.Locale&&(o.Locale=new Map(o.Locale)),o.i18n)for(let e in o.i18n)o.i18n[e]=new Map(o.i18n[e]);return{Settings:a,Caches:i,Configs:o}}("iRingo","TestFlight",v);switch(b.log(`⚠ ${b.name}`,`Settings.Switch: ${e?.Switch}`,""),e.Switch){case!0:default:let a={};switch(O){case"POST":case"PUT":case"PATCH":case"DELETE":switch(k){case void 0:case"application/x-www-form-urlencoded":case"text/plain":case"text/html":default:case"application/x-mpegURL":case"application/x-mpegurl":case"application/vnd.apple.mpegurl":case"audio/mpegurl":case"text/xml":case"text/plist":case"application/xml":case"application/plist":case"application/x-plist":case"text/vtt":case"application/vtt":break;case"text/json":case"application/json":if(a=JSON.parse($request.body??"{}"),"testflight.apple.com"===A)switch(N){case"v1/session/authenticate":"AUTO"!==e.CountryCode&&(a.storeFrontIdentifier=a.storeFrontIdentifier.replace(/\d{6}/,s.Storefront.get(e.CountryCode)));break;case"v1/properties/testflight":case"v1/devices":case"v1/devices/apns":case"v1/devices/add":case"v1/devices/remove":break;default:switch(L[0]){case"v1":case"v2":case"v3":if("accounts"===L[1])if("settings"===L[2]);else if("apps"===L[3])if(b.log(`🚧 ${b.name}, ${L[0]}/accounts/${L[2]}/apps/`,""),L[4],"builds"===L[5])switch(L[7]){case void 0:b.log(`🚧 ${b.name}, ${L[0]}/accounts/${L[2]}/apps/${L[4]}/builds/${L[6]}`,"");break;case"install":b.log(`🚧 ${b.name}, ${L[0]}/accounts/${L[2]}/apps/${L[4]}/builds/${L[6]}/install`,""),"AUTO"!==e.CountryCode&&(a.storefrontId=a.storefrontId.replace(/\d{6}/,s.Storefront.get(e.CountryCode)));break;default:b.log(`🚧 ${b.name}, ${L[0]}/accounts/${L[2]}/apps/${L[4]}/builds/${L[6]}/${L[7]}`,"")}}}$request.body=JSON.stringify(a);case"application/protobuf":case"application/x-protobuf":case"application/vnd.google.protobuf":case"application/grpc":case"application/grpc+proto":case"applecation/octet-stream":}case"GET":case"HEAD":case"OPTIONS":case void 0:default:if("testflight.apple.com"===A)switch(N){case"v1/session/authenticate":case"v1/properties/testflight":case"v1/devices":case"v1/devices/apns":case"v1/devices/add":case"v1/devices/remove":break;default:switch(e.MultiAccount){case!0:b.log(`⚠ ${b.name}, 启用多账号支持`,"");const e=$request?.headers?.["If-None-Match"]??$request?.headers?.["if-none-match"],s=$request?.headers?.["X-Request-Id"]??$request?.headers?.["x-request-id"],a=$request?.headers?.["X-Session-Id"]??$request?.headers?.["x-session-id"],i=$request?.headers?.["X-Session-Digest"]??$request?.headers?.["x-session-digest"];if(t.data){switch(b.log(`⚠ ${b.name}, Caches.data存在，读取`,""),L[0]){case"v1":case"v2":case"v3":switch(L[1]){case"accounts":case"messages":case"apps":default:switch(L[2]){case"settings":case void 0:default:switch(/[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}/.test(L[2])){case!0:b.log(`⚠ ${b.name}, PATHs[2]是UUID，替换URL.path`,""),w.path=N.replace(/\/[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}\//i,`/${t.data.accountId}/`);case!1:a!==t.headers["X-Session-Id"]&&(b.log(`⚠ ${b.name}, sessionId不同，替换$request.headers`,""),e&&(delete $request.headers?.["If-None-Match"],delete $request.headers?.["if-none-match"]),s&&($request.headers?.["X-Request-Id"]&&($request.headers["X-Request-Id"]=t.headers["X-Request-Id"]),$request.headers?.["x-request-id"]&&($request.headers["x-request-id"]=t.headers["X-Request-Id"])),a&&($request.headers?.["X-Session-Id"]&&($request.headers["X-Session-Id"]=t.headers["X-Session-Id"]),$request.headers?.["x-session-id"]&&($request.headers["x-session-id"]=t.headers["X-Session-Id"])),i&&($request.headers?.["X-Session-Digest"]&&($request.headers["X-Session-Digest"]=t.headers["X-Session-Digest"]),$request.headers?.["x-session-digest"]&&($request.headers["x-session-digest"]=t.headers["X-Session-Digest"])))}break;case t?.data?.accountId:b.log(`⚠ ${b.name}, PATHs[2]与accountId相同，更新Caches`,""),t.headers={"X-Request-Id":s,"X-Session-Id":a,"X-Session-Digest":i},b.setjson(t,"@iRingo.TestFlight.Caches")}case"tc":}}break}b.log(`⚠ ${b.name}, Caches空，新写入`,""),t.headers={"X-Request-Id":s,"X-Session-Id":a,"X-Session-Digest":i},/[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}/.test(L[2])&&(t.data={accountId:L[2],sessionId:a}),b.setjson(t,"@iRingo.TestFlight.Caches")}}case"CONNECT":case"TRACE":}$request.headers?.Host&&($request.headers.Host=w.host),$request.url=C.stringify(w);case!1:}})().catch((e=>b.logErr(e))).finally((()=>{switch($){default:{const e=($?.headers?.["content-type"])?.split(";")?.[0];if(b.log(`🎉 ${b.name}, finally`,"echo $response",`FORMAT: ${e}`,""),b.isQuanX())switch($.status="HTTP/1.1 200 OK",delete $?.headers?.["Content-Length"],delete $?.headers?.["content-length"],delete $?.headers?.["Transfer-Encoding"],e){case void 0:b.done({status:$.status,headers:$.headers});break;default:b.done({status:$.status,headers:$.headers,body:$.body});break;case"application/protobuf":case"application/x-protobuf":case"application/vnd.google.protobuf":case"application/grpc":case"application/grpc+proto":case"applecation/octet-stream":b.done({status:$.status,headers:$.headers,bodyBytes:$.bodyBytes})}else b.done({response:$});break}case void 0:if(b.log(`🎉 ${b.name}, finally`,"$request",`FORMAT: ${k}`,""),b.isQuanX())switch(k){case void 0:b.done({url:$request.url,headers:$request.headers});break;default:b.done({url:$request.url,headers:$request.headers,body:$request.body});break;case"application/protobuf":case"application/x-protobuf":case"application/vnd.google.protobuf":case"application/grpc":case"application/grpc+proto":case"applecation/octet-stream":b.done({url:$request.url,headers:$request.headers,bodyBytes:$request.bodyBytes.buffer.slice($request.bodyBytes.byteOffset,$request.bodyBytes.byteLength+$request.bodyBytes.byteOffset)})}else b.done($request)}}));
