/* README: https://github.com/VirgilClyne/iRingo */
/* https://www.lodashjs.com */
class Lodash {
	static name = "Lodash";
	static version = "1.2.2";
	static about() { return console.log(`\n🟧 ${this.name} v${this.version}\n`) };

	static get(object = {}, path = "", defaultValue = undefined) {
		// translate array case to dot case, then split with .
		// a[0].b -> a.0.b -> ['a', '0', 'b']
		if (!Array.isArray(path)) path = this.toPath(path);

		const result = path.reduce((previousValue, currentValue) => {
			return Object(previousValue)[currentValue]; // null undefined get attribute will throwError, Object() can return a object 
		}, object);
		return (result === undefined) ? defaultValue : result;
	}

	static set(object = {}, path = "", value) {
		if (!Array.isArray(path)) path = this.toPath(path);
		path
			.slice(0, -1)
			.reduce(
				(previousValue, currentValue, currentIndex) =>
					(Object(previousValue[currentValue]) === previousValue[currentValue])
						? previousValue[currentValue]
						: previousValue[currentValue] = (/^\d+$/.test(path[currentIndex + 1]) ? [] : {}),
				object
			)[path[path.length - 1]] = value;
		return object
	}

	static unset(object = {}, path = "") {
		if (!Array.isArray(path)) path = this.toPath(path);
		let result = path.reduce((previousValue, currentValue, currentIndex) => {
			if (currentIndex === path.length - 1) {
				delete previousValue[currentValue];
				return true
			}
			return Object(previousValue)[currentValue]
		}, object);
		return result
	}

	static toPath(value) {
		return value.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
	}

	static escape(string) {
		const map = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#39;',
		};
		return string.replace(/[&<>"']/g, m => map[m])
	};

	static unescape(string) {
		const map = {
			'&amp;': '&',
			'&lt;': '<',
			'&gt;': '>',
			'&quot;': '"',
			'&#39;': "'",
		};
		return string.replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, m => map[m])
	}

}

/* https://developer.mozilla.org/zh-CN/docs/Web/API/Storage/setItem */
class $Storage {
	static name = "$Storage";
	static version = "1.0.9";
	static about() { return console.log(`\n🟧 ${this.name} v${this.version}\n`) };
	static data = null
	static dataFile = 'box.dat'
	static #nameRegex = /^@(?<key>[^.]+)(?:\.(?<path>.*))?$/;

	static #platform() {
		if ('undefined' !== typeof $environment && $environment['surge-version'])
			return 'Surge'
		if ('undefined' !== typeof $environment && $environment['stash-version'])
			return 'Stash'
		if ('undefined' !== typeof module && !!module.exports) return 'Node.js'
		if ('undefined' !== typeof $task) return 'Quantumult X'
		if ('undefined' !== typeof $loon) return 'Loon'
		if ('undefined' !== typeof $rocket) return 'Shadowrocket'
		if ('undefined' !== typeof Egern) return 'Egern'
	}

    static getItem(keyName = new String, defaultValue = null) {
        let keyValue = defaultValue;
        // 如果以 @
		switch (keyName.startsWith('@')) {
			case true:
				const { key, path } = keyName.match(this.#nameRegex)?.groups;
				//console.log(`1: ${key}, ${path}`);
				keyName = key;
				let value = this.getItem(keyName, {});
				//console.log(`2: ${JSON.stringify(value)}`)
				if (typeof value !== "object") value = {};
				//console.log(`3: ${JSON.stringify(value)}`)
				keyValue = Lodash.get(value, path);
				//console.log(`4: ${JSON.stringify(keyValue)}`)
				try {
					keyValue = JSON.parse(keyValue);
				} catch (e) {
					// do nothing
				}				//console.log(`5: ${JSON.stringify(keyValue)}`)
				break;
			default:
				switch (this.#platform()) {
					case 'Surge':
					case 'Loon':
					case 'Stash':
					case 'Egern':
					case 'Shadowrocket':
						keyValue = $persistentStore.read(keyName);
						break;
					case 'Quantumult X':
						keyValue = $prefs.valueForKey(keyName);
						break;
					case 'Node.js':
						this.data = this.#loaddata(this.dataFile);
						keyValue = this.data?.[keyName];
						break;
					default:
						keyValue = this.data?.[keyName] || null;
						break;
				}				try {
					keyValue = JSON.parse(keyValue);
				} catch (e) {
					// do nothing
				}				break;
		}		return keyValue ?? defaultValue;
    };

	static setItem(keyName = new String, keyValue = new String) {
		let result = false;
		//console.log(`0: ${typeof keyValue}`);
		switch (typeof keyValue) {
			case "object":
				keyValue = JSON.stringify(keyValue);
				break;
			default:
				keyValue = String(keyValue);
				break;
		}		switch (keyName.startsWith('@')) {
			case true:
				const { key, path } = keyName.match(this.#nameRegex)?.groups;
				//console.log(`1: ${key}, ${path}`);
				keyName = key;
				let value = this.getItem(keyName, {});
				//console.log(`2: ${JSON.stringify(value)}`)
				if (typeof value !== "object") value = {};
				//console.log(`3: ${JSON.stringify(value)}`)
				Lodash.set(value, path, keyValue);
				//console.log(`4: ${JSON.stringify(value)}`)
				result = this.setItem(keyName, value);
				//console.log(`5: ${result}`)
				break;
			default:
				switch (this.#platform()) {
					case 'Surge':
					case 'Loon':
					case 'Stash':
					case 'Egern':
					case 'Shadowrocket':
						result = $persistentStore.write(keyValue, keyName);
						break;
					case 'Quantumult X':
						result =$prefs.setValueForKey(keyValue, keyName);
						break;
					case 'Node.js':
						this.data = this.#loaddata(this.dataFile);
						this.data[keyName] = keyValue;
						this.#writedata(this.dataFile);
						result = true;
						break;
					default:
						result = this.data?.[keyName] || null;
						break;
				}				break;
		}		return result;
	};

    static removeItem(keyName){
		let result = false;
		switch (keyName.startsWith('@')) {
			case true:
				const { key, path } = keyName.match(this.#nameRegex)?.groups;
				keyName = key;
				let value = this.getItem(keyName);
				if (typeof value !== "object") value = {};
				keyValue = Lodash.unset(value, path);
				result = this.setItem(keyName, value);
				break;
			default:
				switch (this.#platform()) {
					case 'Surge':
					case 'Loon':
					case 'Stash':
					case 'Egern':
					case 'Shadowrocket':
						result = false;
						break;
					case 'Quantumult X':
						result = $prefs.removeValueForKey(keyName);
						break;
					case 'Node.js':
						result = false;
						break;
					default:
						result = false;
						break;
				}				break;
		}		return result;
    }

    static clear() {
		let result = false;
		switch (this.#platform()) {
			case 'Surge':
			case 'Loon':
			case 'Stash':
			case 'Egern':
			case 'Shadowrocket':
				result = false;
				break;
			case 'Quantumult X':
				result = $prefs.removeAllValues();
				break;
			case 'Node.js':
				result = false;
				break;
			default:
				result = false;
				break;
		}		return result;
    }

	static #loaddata(dataFile) {
		if (this.isNode()) {
			this.fs = this.fs ? this.fs : require('fs');
			this.path = this.path ? this.path : require('path');
			const curDirDataFilePath = this.path.resolve(dataFile);
			const rootDirDataFilePath = this.path.resolve(
				process.cwd(),
				dataFile
			);
			const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath);
			const isRootDirDataFile =
				!isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath);
			if (isCurDirDataFile || isRootDirDataFile) {
				const datPath = isCurDirDataFile
					? curDirDataFilePath
					: rootDirDataFilePath;
				try {
					return JSON.parse(this.fs.readFileSync(datPath))
				} catch (e) {
					return {}
				}
			} else return {}
		} else return {}
	}

	static #writedata(dataFile = this.dataFile) {
		if (this.isNode()) {
			this.fs = this.fs ? this.fs : require('fs');
			this.path = this.path ? this.path : require('path');
			const curDirDataFilePath = this.path.resolve(dataFile);
			const rootDirDataFilePath = this.path.resolve(
				process.cwd(),
				dataFile
			);
			const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath);
			const isRootDirDataFile =
				!isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath);
			const jsondata = JSON.stringify(this.data);
			if (isCurDirDataFile) {
				this.fs.writeFileSync(curDirDataFilePath, jsondata);
			} else if (isRootDirDataFile) {
				this.fs.writeFileSync(rootDirDataFilePath, jsondata);
			} else {
				this.fs.writeFileSync(curDirDataFilePath, jsondata);
			}
		}
	};

}

class ENV {
	static name = "ENV"
	static version = '1.8.2'
	static about() { return console.log(`\n🟧 ${this.name} v${this.version}\n`) }

	constructor(name, opts) {
		console.log(`\n🟧 ${ENV.name} v${ENV.version}\n`);
		this.name = name;
		this.logs = [];
		this.isMute = false;
		this.isMuteLog = false;
		this.logSeparator = '\n';
		this.encoding = 'utf-8';
		this.startTime = new Date().getTime();
		Object.assign(this, opts);
		this.log(`\n🚩 开始!\n${name}\n`);
	}
	
	environment() {
		switch (this.platform()) {
			case 'Surge':
				$environment.app = 'Surge';
				return $environment
			case 'Stash':
				$environment.app = 'Stash';
				return $environment
			case 'Egern':
				$environment.app = 'Egern';
				return $environment
			case 'Loon':
				let environment = $loon.split(' ');
				return {
					"device": environment[0],
					"ios": environment[1],
					"loon-version": environment[2],
					"app": "Loon"
				};
			case 'Quantumult X':
				return {
					"app": "Quantumult X"
				};
			case 'Node.js':
				process.env.app = 'Node.js';
				return process.env
			default:
				return {}
		}
	}

	platform() {
		if ('undefined' !== typeof $environment && $environment['surge-version'])
			return 'Surge'
		if ('undefined' !== typeof $environment && $environment['stash-version'])
			return 'Stash'
		if ('undefined' !== typeof module && !!module.exports) return 'Node.js'
		if ('undefined' !== typeof $task) return 'Quantumult X'
		if ('undefined' !== typeof $loon) return 'Loon'
		if ('undefined' !== typeof $rocket) return 'Shadowrocket'
		if ('undefined' !== typeof Egern) return 'Egern'
	}

	isNode() {
		return 'Node.js' === this.platform()
	}

	isQuanX() {
		return 'Quantumult X' === this.platform()
	}

	isSurge() {
		return 'Surge' === this.platform()
	}

	isLoon() {
		return 'Loon' === this.platform()
	}

	isShadowrocket() {
		return 'Shadowrocket' === this.platform()
	}

	isStash() {
		return 'Stash' === this.platform()
	}

	isEgern() {
		return 'Egern' === this.platform()
	}

	async getScript(url) {
		return await this.fetch(url).then(response => response.body);
	}

	async runScript(script, runOpts) {
		let httpapi = $Storage.getItem('@chavy_boxjs_userCfgs.httpapi');
		httpapi = httpapi?.replace?.(/\n/g, '')?.trim();
		let httpapi_timeout = $Storage.getItem('@chavy_boxjs_userCfgs.httpapi_timeout');
		httpapi_timeout = (httpapi_timeout * 1) ?? 20;
		httpapi_timeout = runOpts?.timeout ?? httpapi_timeout;
		const [password, address] = httpapi.split('@');
		const request = {
			url: `http://${address}/v1/scripting/evaluate`,
			body: {
				script_text: script,
				mock_type: 'cron',
				timeout: httpapi_timeout
			},
			headers: { 'X-Key': password, 'Accept': '*/*' },
			timeout: httpapi_timeout
		};
		await this.fetch(request).then(response => response.body, error => this.logErr(error));
	}

	initGotEnv(opts) {
		this.got = this.got ? this.got : require('got');
		this.cktough = this.cktough ? this.cktough : require('tough-cookie');
		this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar();
		if (opts) {
			opts.headers = opts.headers ? opts.headers : {};
			if (undefined === opts.headers.Cookie && undefined === opts.cookieJar) {
				opts.cookieJar = this.ckjar;
			}
		}
	}

	async fetch(request = {} || "", option = {}) {
		// 初始化参数
		switch (request.constructor) {
			case Object:
				request = { ...request, ...option };
				break;
			case String:
				request = { "url": request, ...option };
				break;
		}		// 自动判断请求方法
		if (!request.method) {
			request.method = "GET";
			if (request.body ?? request.bodyBytes) request.method = "POST";
		}		// 移除请求头中的部分参数, 让其自动生成
		delete request.headers?.Host;
		delete request.headers?.[":authority"];
		delete request.headers?.['Content-Length'];
		delete request.headers?.['content-length'];
		// 定义请求方法（小写）
		const method = request.method.toLocaleLowerCase();
		// 判断平台
		switch (this.platform()) {
			case 'Loon':
			case 'Surge':
			case 'Stash':
			case 'Egern':
			case 'Shadowrocket':
			default:
				// 转换请求参数
				if (request.timeout) {
					request.timeout = parseInt(request.timeout, 10);
					if (this.isSurge()) ; else request.timeout = request.timeout * 1000;
				}				if (request.policy) {
					if (this.isLoon()) request.node = request.policy;
					if (this.isStash()) Lodash.set(request, "headers.X-Stash-Selected-Proxy", encodeURI(request.policy));
					if (this.isShadowrocket()) Lodash.set(request, "headers.X-Surge-Proxy", request.policy);
				}				if (typeof request.redirection === "boolean") request["auto-redirect"] = request.redirection;
				// 转换请求体
				if (request.bodyBytes && !request.body) {
					request.body = request.bodyBytes;
					delete request.bodyBytes;
				}				// 发送请求
				return await new Promise((resolve, reject) => {
					$httpClient[method](request, (error, response, body) => {
						if (error) reject(error);
						else {
							response.ok = /^2\d\d$/.test(response.status);
							response.statusCode = response.status;
							if (body) {
								response.body = body;
								if (request["binary-mode"] == true) response.bodyBytes = body;
							}							resolve(response);
						}
					});
				});
			case 'Quantumult X':
				// 转换请求参数
				if (request.policy) Lodash.set(request, "opts.policy", request.policy);
				if (typeof request["auto-redirect"] === "boolean") Lodash.set(request, "opts.redirection", request["auto-redirect"]);
				// 转换请求体
				if (request.body instanceof ArrayBuffer) {
					request.bodyBytes = request.body;
					delete request.body;
				} else if (ArrayBuffer.isView(request.body)) {
					request.bodyBytes = request.body.buffer.slice(request.body.byteOffset, request.body.byteLength + request.body.byteOffset);
					delete object.body;
				} else if (request.body) delete request.bodyBytes;
				// 发送请求
				return await $task.fetch(request).then(
					response => {
						response.ok = /^2\d\d$/.test(response.statusCode);
						response.status = response.statusCode;
						return response;
					},
					reason => Promise.reject(reason.error));
			case 'Node.js':
				let iconv = require('iconv-lite');
				this.initGotEnv(request);
				const { url, ...option } = request;
				return await this.got[method](url, option)
					.on('redirect', (response, nextOpts) => {
						try {
							if (response.headers['set-cookie']) {
								const ck = response.headers['set-cookie']
									.map(this.cktough.Cookie.parse)
									.toString();
								if (ck) {
									this.ckjar.setCookieSync(ck, null);
								}
								nextOpts.cookieJar = this.ckjar;
							}
						} catch (e) {
							this.logErr(e);
						}
						// this.ckjar.setCookieSync(response.headers['set-cookie'].map(Cookie.parse).toString())
					})
					.then(
						response => {
							response.statusCode = response.status;
							response.body = iconv.decode(response.rawBody, this.encoding);
							response.bodyBytes = response.rawBody;
							return response;
						},
						error => Promise.reject(error.message));
		}	};

	/**
	 *
	 * 示例:$.time('yyyy-MM-dd qq HH:mm:ss.S')
	 *    :$.time('yyyyMMddHHmmssS')
	 *    y:年 M:月 d:日 q:季 H:时 m:分 s:秒 S:毫秒
	 *    其中y可选0-4位占位符、S可选0-1位占位符，其余可选0-2位占位符
	 * @param {string} format 格式化参数
	 * @param {number} ts 可选: 根据指定时间戳返回格式化日期
	 *
	 */
	time(format, ts = null) {
		const date = ts ? new Date(ts) : new Date();
		let o = {
			'M+': date.getMonth() + 1,
			'd+': date.getDate(),
			'H+': date.getHours(),
			'm+': date.getMinutes(),
			's+': date.getSeconds(),
			'q+': Math.floor((date.getMonth() + 3) / 3),
			'S': date.getMilliseconds()
		};
		if (/(y+)/.test(format))
			format = format.replace(
				RegExp.$1,
				(date.getFullYear() + '').substr(4 - RegExp.$1.length)
			);
		for (let k in o)
			if (new RegExp('(' + k + ')').test(format))
				format = format.replace(
					RegExp.$1,
					RegExp.$1.length == 1
						? o[k]
						: ('00' + o[k]).substr(('' + o[k]).length)
				);
		return format
	}

	/**
	 * 系统通知
	 *
	 * > 通知参数: 同时支持 QuanX 和 Loon 两种格式, EnvJs根据运行环境自动转换, Surge 环境不支持多媒体通知
	 *
	 * 示例:
	 * $.msg(title, subt, desc, 'twitter://')
	 * $.msg(title, subt, desc, { 'open-url': 'twitter://', 'media-url': 'https://github.githubassets.com/images/modules/open_graph/github-mark.png' })
	 * $.msg(title, subt, desc, { 'open-url': 'https://bing.com', 'media-url': 'https://github.githubassets.com/images/modules/open_graph/github-mark.png' })
	 *
	 * @param {*} title 标题
	 * @param {*} subt 副标题
	 * @param {*} desc 通知详情
	 * @param {*} opts 通知参数
	 *
	 */
	msg(title = name, subt = '', desc = '', opts) {
		const toEnvOpts = (rawopts) => {
			switch (typeof rawopts) {
				case undefined:
					return rawopts
				case 'string':
					switch (this.platform()) {
						case 'Surge':
						case 'Stash':
						case 'Egern':
						default:
							return { url: rawopts }
						case 'Loon':
						case 'Shadowrocket':
							return rawopts
						case 'Quantumult X':
							return { 'open-url': rawopts }
						case 'Node.js':
							return undefined
					}
				case 'object':
					switch (this.platform()) {
						case 'Surge':
						case 'Stash':
						case 'Egern':
						case 'Shadowrocket':
						default: {
							let openUrl =
								rawopts.url || rawopts.openUrl || rawopts['open-url'];
							return { url: openUrl }
						}
						case 'Loon': {
							let openUrl =
								rawopts.openUrl || rawopts.url || rawopts['open-url'];
							let mediaUrl = rawopts.mediaUrl || rawopts['media-url'];
							return { openUrl, mediaUrl }
						}
						case 'Quantumult X': {
							let openUrl =
								rawopts['open-url'] || rawopts.url || rawopts.openUrl;
							let mediaUrl = rawopts['media-url'] || rawopts.mediaUrl;
							let updatePasteboard =
								rawopts['update-pasteboard'] || rawopts.updatePasteboard;
							return {
								'open-url': openUrl,
								'media-url': mediaUrl,
								'update-pasteboard': updatePasteboard
							}
						}
						case 'Node.js':
							return undefined
					}
				default:
					return undefined
			}
		};
		if (!this.isMute) {
			switch (this.platform()) {
				case 'Surge':
				case 'Loon':
				case 'Stash':
				case 'Egern':
				case 'Shadowrocket':
				default:
					$notification.post(title, subt, desc, toEnvOpts(opts));
					break
				case 'Quantumult X':
					$notify(title, subt, desc, toEnvOpts(opts));
					break
				case 'Node.js':
					break
			}
		}
		if (!this.isMuteLog) {
			let logs = ['', '==============📣系统通知📣=============='];
			logs.push(title);
			subt ? logs.push(subt) : '';
			desc ? logs.push(desc) : '';
			console.log(logs.join('\n'));
			this.logs = this.logs.concat(logs);
		}
	}

	log(...logs) {
		if (logs.length > 0) {
			this.logs = [...this.logs, ...logs];
		}
		console.log(logs.join(this.logSeparator));
	}

	logErr(error) {
		switch (this.platform()) {
			case 'Surge':
			case 'Loon':
			case 'Stash':
			case 'Egern':
			case 'Shadowrocket':
			case 'Quantumult X':
			default:
				this.log('', `❗️ ${this.name}, 错误!`, error);
				break
			case 'Node.js':
				this.log('', `❗️${this.name}, 错误!`, error.stack);
				break
		}
	}

	wait(time) {
		return new Promise((resolve) => setTimeout(resolve, time))
	}

	done(object = {}) {
		const endTime = new Date().getTime();
		const costTime = (endTime - this.startTime) / 1000;
		this.log("", `🚩 ${this.name}, 结束! 🕛 ${costTime} 秒`, "");
		switch (this.platform()) {
			case 'Surge':
				if (object.policy) Lodash.set(object, "headers.X-Surge-Policy", object.policy);
				$done(object);
				break;
			case 'Loon':
				if (object.policy) object.node = object.policy;
				$done(object);
				break;
			case 'Stash':
				if (object.policy) Lodash.set(object, "headers.X-Stash-Selected-Proxy", encodeURI(object.policy));
				$done(object);
				break;
			case 'Egern':
				$done(object);
				break;
			case 'Shadowrocket':
			default:
				$done(object);
				break;
			case 'Quantumult X':
				if (object.policy) Lodash.set(object, "opts.policy", object.policy);
				// 移除不可写字段
				delete object["auto-redirect"];
				delete object["auto-cookie"];
				delete object["binary-mode"];
				delete object.charset;
				delete object.host;
				delete object.insecure;
				delete object.method; // 1.4.x 不可写
				delete object.opt; // $task.fetch() 参数, 不可写
				delete object.path; // 可写, 但会与 url 冲突
				delete object.policy;
				delete object["policy-descriptor"];
				delete object.scheme;
				delete object.sessionIndex;
				delete object.statusCode;
				delete object.timeout;
				if (object.body instanceof ArrayBuffer) {
					object.bodyBytes = object.body;
					delete object.body;
				} else if (ArrayBuffer.isView(object.body)) {
					object.bodyBytes = object.body.buffer.slice(object.body.byteOffset, object.body.byteLength + object.body.byteOffset);
					delete object.body;
				} else if (object.body) delete object.bodyBytes;
				$done(object);
				break;
			case 'Node.js':
				process.exit(1);
				break;
		}
	}
}

var Settings$7 = {
	Switch: true
};
var Configs$3 = {
	Storefront: [
		[
			"AE",
			"143481"
		],
		[
			"AF",
			"143610"
		],
		[
			"AG",
			"143540"
		],
		[
			"AI",
			"143538"
		],
		[
			"AL",
			"143575"
		],
		[
			"AM",
			"143524"
		],
		[
			"AO",
			"143564"
		],
		[
			"AR",
			"143505"
		],
		[
			"AT",
			"143445"
		],
		[
			"AU",
			"143460"
		],
		[
			"AZ",
			"143568"
		],
		[
			"BA",
			"143612"
		],
		[
			"BB",
			"143541"
		],
		[
			"BD",
			"143490"
		],
		[
			"BE",
			"143446"
		],
		[
			"BF",
			"143578"
		],
		[
			"BG",
			"143526"
		],
		[
			"BH",
			"143559"
		],
		[
			"BJ",
			"143576"
		],
		[
			"BM",
			"143542"
		],
		[
			"BN",
			"143560"
		],
		[
			"BO",
			"143556"
		],
		[
			"BR",
			"143503"
		],
		[
			"BS",
			"143539"
		],
		[
			"BT",
			"143577"
		],
		[
			"BW",
			"143525"
		],
		[
			"BY",
			"143565"
		],
		[
			"BZ",
			"143555"
		],
		[
			"CA",
			"143455"
		],
		[
			"CD",
			"143613"
		],
		[
			"CG",
			"143582"
		],
		[
			"CH",
			"143459"
		],
		[
			"CI",
			"143527"
		],
		[
			"CL",
			"143483"
		],
		[
			"CM",
			"143574"
		],
		[
			"CN",
			"143465"
		],
		[
			"CO",
			"143501"
		],
		[
			"CR",
			"143495"
		],
		[
			"CV",
			"143580"
		],
		[
			"CY",
			"143557"
		],
		[
			"CZ",
			"143489"
		],
		[
			"DE",
			"143443"
		],
		[
			"DK",
			"143458"
		],
		[
			"DM",
			"143545"
		],
		[
			"DO",
			"143508"
		],
		[
			"DZ",
			"143563"
		],
		[
			"EC",
			"143509"
		],
		[
			"EE",
			"143518"
		],
		[
			"EG",
			"143516"
		],
		[
			"ES",
			"143454"
		],
		[
			"FI",
			"143447"
		],
		[
			"FJ",
			"143583"
		],
		[
			"FM",
			"143591"
		],
		[
			"FR",
			"143442"
		],
		[
			"GA",
			"143614"
		],
		[
			"GB",
			"143444"
		],
		[
			"GD",
			"143546"
		],
		[
			"GF",
			"143615"
		],
		[
			"GH",
			"143573"
		],
		[
			"GM",
			"143584"
		],
		[
			"GR",
			"143448"
		],
		[
			"GT",
			"143504"
		],
		[
			"GW",
			"143585"
		],
		[
			"GY",
			"143553"
		],
		[
			"HK",
			"143463"
		],
		[
			"HN",
			"143510"
		],
		[
			"HR",
			"143494"
		],
		[
			"HU",
			"143482"
		],
		[
			"ID",
			"143476"
		],
		[
			"IE",
			"143449"
		],
		[
			"IL",
			"143491"
		],
		[
			"IN",
			"143467"
		],
		[
			"IQ",
			"143617"
		],
		[
			"IS",
			"143558"
		],
		[
			"IT",
			"143450"
		],
		[
			"JM",
			"143511"
		],
		[
			"JO",
			"143528"
		],
		[
			"JP",
			"143462"
		],
		[
			"KE",
			"143529"
		],
		[
			"KG",
			"143586"
		],
		[
			"KH",
			"143579"
		],
		[
			"KN",
			"143548"
		],
		[
			"KP",
			"143466"
		],
		[
			"KR",
			"143466"
		],
		[
			"KW",
			"143493"
		],
		[
			"KY",
			"143544"
		],
		[
			"KZ",
			"143517"
		],
		[
			"TC",
			"143552"
		],
		[
			"TD",
			"143581"
		],
		[
			"TJ",
			"143603"
		],
		[
			"TH",
			"143475"
		],
		[
			"TM",
			"143604"
		],
		[
			"TN",
			"143536"
		],
		[
			"TO",
			"143608"
		],
		[
			"TR",
			"143480"
		],
		[
			"TT",
			"143551"
		],
		[
			"TW",
			"143470"
		],
		[
			"TZ",
			"143572"
		],
		[
			"LA",
			"143587"
		],
		[
			"LB",
			"143497"
		],
		[
			"LC",
			"143549"
		],
		[
			"LI",
			"143522"
		],
		[
			"LK",
			"143486"
		],
		[
			"LR",
			"143588"
		],
		[
			"LT",
			"143520"
		],
		[
			"LU",
			"143451"
		],
		[
			"LV",
			"143519"
		],
		[
			"LY",
			"143567"
		],
		[
			"MA",
			"143620"
		],
		[
			"MD",
			"143523"
		],
		[
			"ME",
			"143619"
		],
		[
			"MG",
			"143531"
		],
		[
			"MK",
			"143530"
		],
		[
			"ML",
			"143532"
		],
		[
			"MM",
			"143570"
		],
		[
			"MN",
			"143592"
		],
		[
			"MO",
			"143515"
		],
		[
			"MR",
			"143590"
		],
		[
			"MS",
			"143547"
		],
		[
			"MT",
			"143521"
		],
		[
			"MU",
			"143533"
		],
		[
			"MV",
			"143488"
		],
		[
			"MW",
			"143589"
		],
		[
			"MX",
			"143468"
		],
		[
			"MY",
			"143473"
		],
		[
			"MZ",
			"143593"
		],
		[
			"NA",
			"143594"
		],
		[
			"NE",
			"143534"
		],
		[
			"NG",
			"143561"
		],
		[
			"NI",
			"143512"
		],
		[
			"NL",
			"143452"
		],
		[
			"NO",
			"143457"
		],
		[
			"NP",
			"143484"
		],
		[
			"NR",
			"143606"
		],
		[
			"NZ",
			"143461"
		],
		[
			"OM",
			"143562"
		],
		[
			"PA",
			"143485"
		],
		[
			"PE",
			"143507"
		],
		[
			"PG",
			"143597"
		],
		[
			"PH",
			"143474"
		],
		[
			"PK",
			"143477"
		],
		[
			"PL",
			"143478"
		],
		[
			"PT",
			"143453"
		],
		[
			"PW",
			"143595"
		],
		[
			"PY",
			"143513"
		],
		[
			"QA",
			"143498"
		],
		[
			"RO",
			"143487"
		],
		[
			"RS",
			"143500"
		],
		[
			"RU",
			"143469"
		],
		[
			"RW",
			"143621"
		],
		[
			"SA",
			"143479"
		],
		[
			"SB",
			"143601"
		],
		[
			"SC",
			"143599"
		],
		[
			"SE",
			"143456"
		],
		[
			"SG",
			"143464"
		],
		[
			"SI",
			"143499"
		],
		[
			"SK",
			"143496"
		],
		[
			"SL",
			"143600"
		],
		[
			"SN",
			"143535"
		],
		[
			"SR",
			"143554"
		],
		[
			"ST",
			"143598"
		],
		[
			"SV",
			"143506"
		],
		[
			"SZ",
			"143602"
		],
		[
			"UA",
			"143492"
		],
		[
			"UG",
			"143537"
		],
		[
			"US",
			"143441"
		],
		[
			"UY",
			"143514"
		],
		[
			"UZ",
			"143566"
		],
		[
			"VC",
			"143550"
		],
		[
			"VE",
			"143502"
		],
		[
			"VG",
			"143543"
		],
		[
			"VN",
			"143471"
		],
		[
			"VU",
			"143609"
		],
		[
			"XK",
			"143624"
		],
		[
			"YE",
			"143571"
		],
		[
			"ZA",
			"143472"
		],
		[
			"ZM",
			"143622"
		],
		[
			"ZW",
			"143605"
		]
	]
};
var Default = {
	Settings: Settings$7,
	Configs: Configs$3
};

var Default$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Configs: Configs$3,
	Settings: Settings$7,
	default: Default
});

var Settings$6 = {
	Switch: true,
	PEP: {
		GCC: "US"
	}
};
var Location = {
	Settings: Settings$6
};

var Location$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Settings: Settings$6,
	default: Location
});

var Settings$5 = {
	Switch: true,
	UrlInfoSet: {
		Dispatcher: "AutoNavi",
		Directions: "AutoNavi",
		RAP: "Apple",
		LocationShift: "AUTO"
	},
	TileSet: {
		"Map": "CN",
		Satellite: "HYBRID",
		Traffic: "CN",
		POI: "CN",
		Flyover: "XX",
		Munin: "XX"
	},
	GeoManifest: {
		Dynamic: {
			Config: {
				CountryCode: {
					"default": "CN",
					iOS: "AUTO",
					iPadOS: "AUTO",
					watchOS: "US",
					macOS: "AUTO"
				}
			}
		}
	},
	Config: {
		Announcements: {
			"Environment:": {
				"default": "AUTO",
				iOS: "AUTO",
				iPadOS: "AUTO",
				watchOS: "AUTO",
				macOS: "AUTO"
			}
		}
	}
};
var Configs$2 = {
	CN: {
		attribution: [
			{
				region: [
				],
				name: "AutoNavi",
				url: "https://gspe21-ssl.ls.apple.com/html/attribution-cn2-66.html",
				resource: [
					{
						region: [
						],
						filter: [
						],
						checksum: {
							"0": 61,
							"1": 130,
							"2": 126,
							"3": 203,
							"4": 170,
							"5": 234,
							"6": 91,
							"7": 182,
							"8": 191,
							"9": 120,
							"10": 72,
							"11": 19,
							"12": 46,
							"13": 58,
							"14": 235,
							"15": 55,
							"16": 221,
							"17": 53,
							"18": 252,
							"19": 219
						},
						updateMethod: 0,
						validationMethod: 0,
						filename: "autonavi-4.png",
						resourceType: 6
					},
					{
						region: [
						],
						filter: [
						],
						checksum: {
							"0": 101,
							"1": 191,
							"2": 219,
							"3": 234,
							"4": 178,
							"5": 237,
							"6": 6,
							"7": 231,
							"8": 236,
							"9": 110,
							"10": 3,
							"11": 82,
							"12": 194,
							"13": 129,
							"14": 29,
							"15": 221,
							"16": 225,
							"17": 55,
							"18": 26,
							"19": 203
						},
						updateMethod: 0,
						validationMethod: 0,
						filename: "autonavi-4@2x.png",
						resourceType: 6
					},
					{
						region: [
						],
						filter: [
						],
						checksum: {
							"0": 101,
							"1": 191,
							"2": 219,
							"3": 234,
							"4": 178,
							"5": 237,
							"6": 6,
							"7": 231,
							"8": 236,
							"9": 110,
							"10": 3,
							"11": 82,
							"12": 194,
							"13": 129,
							"14": 29,
							"15": 221,
							"16": 225,
							"17": 55,
							"18": 26,
							"19": 203
						},
						updateMethod: 0,
						validationMethod: 0,
						filename: "autonavi-4@2x.png",
						resourceType: 6
					},
					{
						region: [
						],
						filter: [
						],
						checksum: {
							"0": 247,
							"1": 152,
							"2": 81,
							"3": 90,
							"4": 135,
							"5": 206,
							"6": 171,
							"7": 138,
							"8": 151,
							"9": 37,
							"10": 167,
							"11": 77,
							"12": 112,
							"13": 223,
							"14": 89,
							"15": 164,
							"16": 242,
							"17": 201,
							"18": 164,
							"19": 74
						},
						updateMethod: 0,
						validationMethod: 0,
						filename: "autonavi-logo-mask-1.png",
						resourceType: 5
					},
					{
						region: [
						],
						filter: [
						],
						checksum: {
							"0": 54,
							"1": 203,
							"2": 95,
							"3": 5,
							"4": 82,
							"5": 108,
							"6": 189,
							"7": 170,
							"8": 124,
							"9": 255,
							"10": 39,
							"11": 153,
							"12": 245,
							"13": 47,
							"14": 224,
							"15": 93,
							"16": 202,
							"17": 181,
							"18": 11,
							"19": 127
						},
						updateMethod: 0,
						validationMethod: 0,
						filename: "autonavi-logo-mask-1@2x.png",
						resourceType: 5
					},
					{
						region: [
						],
						filter: [
						],
						checksum: {
							"0": 131,
							"1": 225,
							"2": 158,
							"3": 241,
							"4": 69,
							"5": 218,
							"6": 172,
							"7": 162,
							"8": 166,
							"9": 241,
							"10": 48,
							"11": 174,
							"12": 31,
							"13": 104,
							"14": 225,
							"15": 155,
							"16": 97,
							"17": 143,
							"18": 15,
							"19": 99
						},
						updateMethod: 0,
						validationMethod: 0,
						filename: "autonavi-logo-mask-1@3x.png",
						resourceType: 5
					}
				]
			},
			{
				region: [
					{
						maxX: 225,
						minZ: 8,
						minX: 218,
						maxY: 104,
						minY: 102,
						maxZ: 21
					},
					{
						maxX: 228,
						minZ: 8,
						minX: 221,
						maxY: 101,
						minY: 98,
						maxZ: 21
					},
					{
						maxX: 231,
						minZ: 8,
						minX: 226,
						maxY: 97,
						minY: 91,
						maxZ: 21
					}
				],
				name: "© GeoTechnologies, Inc.",
				url: "https://gspe21-ssl.ls.apple.com/html/attribution-cn2-66.html",
				resource: [
				]
			}
		],
		releaseInfo: "PROD-CN (24.20)",
		tileSet: [
			{
				scale: 0,
				style: 1,
				checksumType: 0,
				countryRegionWhitelist: [
					{
						countryCode: "AE",
						region: "AE"
					},
					{
						countryCode: "AE",
						region: "SA"
					},
					{
						countryCode: "IN",
						region: "IN"
					},
					{
						countryCode: "JP",
						region: "JP"
					},
					{
						countryCode: "KR",
						region: "KR"
					},
					{
						countryCode: "MA",
						region: "MA"
					},
					{
						countryCode: "RU",
						region: "RU"
					},
					{
						countryCode: "SA",
						region: "AE"
					},
					{
						countryCode: "SA",
						region: "SA"
					}
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles?flags=8",
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							}
						],
						identifier: 2197,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 1,
				style: 7,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 1,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe11-2-cn-ssl.ls.apple.com/2/tiles",
				validVersion: [
					{
						genericTile: [
							{
								resourceIndex: 1971,
								textureIndex: 0,
								tileType: 2
							}
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 224,
								minZ: 8,
								minX: 179,
								maxY: 128,
								minY: 80,
								maxZ: 8
							},
							{
								maxX: 449,
								minZ: 9,
								minX: 359,
								maxY: 257,
								minY: 161,
								maxZ: 9
							},
							{
								maxX: 898,
								minZ: 10,
								minX: 719,
								maxY: 915,
								minY: 323,
								maxZ: 10
							},
							{
								maxX: 1797,
								minZ: 11,
								minX: 1438,
								maxY: 1031,
								minY: 646,
								maxZ: 11
							},
							{
								maxX: 3594,
								minZ: 12,
								minX: 2876,
								maxY: 2062,
								minY: 1292,
								maxZ: 12
							},
							{
								maxX: 7188,
								minZ: 13,
								minX: 5752,
								maxY: 4124,
								minY: 2584,
								maxZ: 13
							},
							{
								maxX: 14376,
								minZ: 14,
								minX: 11504,
								maxY: 8248,
								minY: 5168,
								maxZ: 14
							},
							{
								maxX: 28752,
								minZ: 15,
								minX: 23008,
								maxY: 16496,
								minY: 10336,
								maxZ: 15
							},
							{
								maxX: 57504,
								minZ: 16,
								minX: 46016,
								maxY: 32992,
								minY: 20672,
								maxZ: 16
							},
							{
								maxX: 115008,
								minZ: 17,
								minX: 92032,
								maxY: 65984,
								minY: 41344,
								maxZ: 17
							},
							{
								maxX: 230016,
								minZ: 18,
								minX: 184064,
								maxY: 131976,
								minY: 82668,
								maxZ: 18
							}
						],
						identifier: 52
					}
				]
			},
			{
				scale: 2,
				style: 7,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 1,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe11-2-cn-ssl.ls.apple.com/2/tiles",
				validVersion: [
					{
						genericTile: [
							{
								resourceIndex: 1971,
								textureIndex: 0,
								tileType: 2
							}
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 224,
								minZ: 8,
								minX: 179,
								maxY: 128,
								minY: 80,
								maxZ: 8
							},
							{
								maxX: 449,
								minZ: 9,
								minX: 359,
								maxY: 257,
								minY: 161,
								maxZ: 9
							},
							{
								maxX: 898,
								minZ: 10,
								minX: 719,
								maxY: 915,
								minY: 323,
								maxZ: 10
							},
							{
								maxX: 1797,
								minZ: 11,
								minX: 1438,
								maxY: 1031,
								minY: 646,
								maxZ: 11
							},
							{
								maxX: 3594,
								minZ: 12,
								minX: 2876,
								maxY: 2062,
								minY: 1292,
								maxZ: 12
							},
							{
								maxX: 7188,
								minZ: 13,
								minX: 5752,
								maxY: 4124,
								minY: 2584,
								maxZ: 13
							},
							{
								maxX: 14376,
								minZ: 14,
								minX: 11504,
								maxY: 8248,
								minY: 5168,
								maxZ: 14
							},
							{
								maxX: 28752,
								minZ: 15,
								minX: 23008,
								maxY: 16496,
								minY: 10336,
								maxZ: 15
							},
							{
								maxX: 57504,
								minZ: 16,
								minX: 46016,
								maxY: 32992,
								minY: 20672,
								maxZ: 16
							},
							{
								maxX: 115008,
								minZ: 17,
								minX: 92032,
								maxY: 65984,
								minY: 41344,
								maxZ: 17
							},
							{
								maxX: 230016,
								minZ: 18,
								minX: 184064,
								maxY: 131976,
								minY: 82668,
								maxZ: 18
							}
						],
						identifier: 52
					}
				]
			},
			{
				scale: 0,
				style: 11,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles?flags=1",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 476
					}
				]
			},
			{
				scale: 0,
				style: 12,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe12-cn-ssl.ls.apple.com/traffic",
				validVersion: [
					{
						availableTiles: [
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							}
						],
						identifier: 2196,
						timeToLiveSeconds: 120,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 13,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles?flags=2",
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 15
							},
							{
								maxX: 65535,
								minZ: 16,
								minX: 0,
								maxY: 65535,
								minY: 0,
								maxZ: 16
							},
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 2176,
						timeToLiveSeconds: 604800,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 18,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 2197,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 20,
				checksumType: 0,
				countryRegionWhitelist: [
					{
						countryCode: "AE",
						region: "AE"
					},
					{
						countryCode: "AE",
						region: "SA"
					},
					{
						countryCode: "IN",
						region: "IN"
					},
					{
						countryCode: "JP",
						region: "JP"
					},
					{
						countryCode: "KR",
						region: "KR"
					},
					{
						countryCode: "MA",
						region: "MA"
					},
					{
						countryCode: "RU",
						region: "RU"
					},
					{
						countryCode: "SA",
						region: "AE"
					},
					{
						countryCode: "SA",
						region: "SA"
					}
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 2197,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 22,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 2197
					}
				]
			},
			{
				scale: 0,
				style: 30,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							},
							{
								maxX: 262143,
								minZ: 18,
								minX: 0,
								maxY: 262143,
								minY: 0,
								maxZ: 18
							}
						],
						identifier: 152,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 37,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles?flags=2",
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 1983,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 47,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 1983,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 48,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 1983
					}
				]
			},
			{
				scale: 0,
				style: 53,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 2197,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 54,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 2197
					}
				]
			},
			{
				scale: 0,
				style: 56,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 16,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 57,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gsp76-cn-ssl.ls.apple.com/api/tile",
				validVersion: [
					{
						availableTiles: [
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 0,
						timeToLiveSeconds: 3600,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 58,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							},
							{
								maxX: 65535,
								minZ: 16,
								minX: 0,
								maxY: 65535,
								minY: 0,
								maxZ: 16
							},
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 149
					}
				]
			},
			{
				scale: 0,
				style: 59,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/asset/v3/model",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							}
						],
						identifier: 86
					}
				]
			},
			{
				scale: 0,
				style: 60,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/asset/v3/material",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							}
						],
						identifier: 30
					}
				]
			},
			{
				scale: 0,
				style: 61,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							}
						],
						identifier: 30
					}
				]
			},
			{
				scale: 0,
				style: 64,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							}
						],
						identifier: 16,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 65,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe79-cn-ssl.ls.apple.com/65/v1",
				validVersion: [
					{
						availableTiles: [
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							}
						],
						identifier: 2,
						timeToLiveSeconds: 3600,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 66,
				checksumType: 0,
				countryRegionWhitelist: [
					{
						countryCode: "AE",
						region: "AE"
					},
					{
						countryCode: "AE",
						region: "SA"
					},
					{
						countryCode: "IN",
						region: "IN"
					},
					{
						countryCode: "JP",
						region: "JP"
					},
					{
						countryCode: "KR",
						region: "KR"
					},
					{
						countryCode: "MA",
						region: "MA"
					},
					{
						countryCode: "RU",
						region: "RU"
					},
					{
						countryCode: "SA",
						region: "AE"
					},
					{
						countryCode: "SA",
						region: "SA"
					}
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 2197,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 67,
				checksumType: 0,
				countryRegionWhitelist: [
					{
						countryCode: "AE",
						region: "AE"
					},
					{
						countryCode: "AE",
						region: "SA"
					},
					{
						countryCode: "IN",
						region: "IN"
					},
					{
						countryCode: "JP",
						region: "JP"
					},
					{
						countryCode: "KR",
						region: "KR"
					},
					{
						countryCode: "MA",
						region: "MA"
					},
					{
						countryCode: "RU",
						region: "RU"
					},
					{
						countryCode: "SA",
						region: "AE"
					},
					{
						countryCode: "SA",
						region: "SA"
					}
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							}
						],
						identifier: 2197,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 68,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							},
							{
								maxX: 65535,
								minZ: 16,
								minX: 0,
								maxY: 65535,
								minY: 0,
								maxZ: 16
							},
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 2176,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 69,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 21
					}
				]
			},
			{
				scale: 0,
				style: 72,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				validVersion: [
					{
						availableTiles: [
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							}
						],
						identifier: 2,
						timeToLiveSeconds: 3600,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 73,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 476
					}
				]
			},
			{
				scale: 0,
				style: 76,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe79-cn-ssl.ls.apple.com/sis/v1",
				validVersion: [
					{
						availableTiles: [
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 524287,
								minZ: 19,
								minX: 0,
								maxY: 524287,
								minY: 0,
								maxZ: 19
							}
						],
						identifier: 0,
						timeToLiveSeconds: 86400,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 79,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							}
						],
						identifier: 29
					}
				]
			},
			{
				scale: 0,
				style: 83,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 0,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-cn-ssl.ls.apple.com/tiles",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							}
						],
						identifier: 3
					}
				]
			},
			{
				scale: 0,
				style: 84,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe19-2-cn-ssl.ls.apple.com/poi_update",
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							},
							{
								maxX: 65535,
								minZ: 16,
								minX: 0,
								maxY: 65535,
								minY: 0,
								maxZ: 16
							},
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 2176,
						timeToLiveSeconds: 1800,
						genericTile: [
						]
					}
				]
			}
		],
		urlInfoSet: [
			{
				backgroundRevGeoURL: {
					url: "https://dispatcher.is.autonavi.com/dispatcher",
					supportsMultipathTCP: false
				},
				searchAttributionManifestURL: {
					url: "https://gspe21-ssl.ls.apple.com/config/search-attribution-1323",
					supportsMultipathTCP: false
				},
				analyticsSessionlessURL: {
					url: "https://gsp64-ssl.ls.apple.com/hvr/v3/use",
					supportsMultipathTCP: false
				},
				poiBusynessActivityCollectionURL: {
					url: "https://gsp53-ssl.ls.apple.com/hvr/rt_poi_activity",
					supportsMultipathTCP: false
				},
				offlineDataDownloadBaseURL: {
					url: "https://gspe121-cn-ssl.ls.apple.com",
					supportsMultipathTCP: false
				},
				wifiConnectionQualityProbeURL: {
					url: "https://gsp10-ssl-cn.ls.apple.com/hvr/wcq",
					supportsMultipathTCP: false
				},
				junctionImageServiceURL: {
					url: "https://direction2.is.autonavi.com/direction",
					supportsMultipathTCP: false
				},
				etaURL: {
					url: "https://direction2.is.autonavi.com/direction",
					supportsMultipathTCP: false
				},
				analyticsCohortSessionURL: {
					url: "https://gsp64-ssl.ls.apple.com/hvr/v3/use",
					supportsMultipathTCP: false
				},
				resourcesURL: {
					url: "https://gspe21-ssl.ls.apple.com/",
					supportsMultipathTCP: false
				},
				feedbackLookupURL: {
					url: "https://rap.is.autonavi.com/lookup",
					supportsMultipathTCP: false
				},
				batchTrafficProbeURL: {
					url: "https://gsp10-ssl.ls.apple.com/hvr/v2/loc",
					supportsMultipathTCP: false
				},
				batchReverseGeocoderURL: {
					url: "https://batch-rgeo.is.autonavi.com/batchRGeo",
					supportsMultipathTCP: false
				},
				spatialLookupURL: {
					url: "https://spatialsearch.is.autonavi.com/spatialsearch",
					supportsMultipathTCP: false
				},
				realtimeTrafficProbeURL: {
					url: "https://gsp9-ssl.apple.com/hvr/v2/rtloc",
					supportsMultipathTCP: false
				},
				wifiQualityTileURL: {
					url: "https://gspe85-cn-ssl.ls.apple.com/wifi_request_tile",
					supportsMultipathTCP: false
				},
				problemSubmissionURL: {
					url: "https://rap.is.autonavi.com/rap",
					supportsMultipathTCP: false
				},
				reverseGeocoderVersionsURL: {
					url: "https://gspe21-ssl.ls.apple.com/config/revgeo-version-11.plist",
					supportsMultipathTCP: false
				},
				problemCategoriesURL: {
					url: "https://gspe21-ssl.ls.apple.com/config/com.apple.GEO.BusinessLocalizedCategories-482.plist",
					supportsMultipathTCP: false
				},
				batchReverseGeocoderPlaceRequestURL: {
					url: "https://dispatcher.is.autonavi.com/dispatcher",
					supportsMultipathTCP: false
				},
				wifiQualityURL: {
					url: "https://gsp85-cn-ssl.ls.apple.com/wifi_request",
					supportsMultipathTCP: false
				},
				polyLocationShiftURL: {
					url: "https://shift.is.autonavi.com/localshift",
					supportsMultipathTCP: false
				},
				problemStatusURL: {
					url: "https://rap.is.autonavi.com/rapstatus",
					supportsMultipathTCP: false
				},
				feedbackSubmissionURL: {
					url: "https://rap.is.autonavi.com/rap",
					supportsMultipathTCP: false
				},
				offlineDataBatchListURL: {
					url: "https://ods.is.autonavi.com/api/batchesForRegion",
					supportsMultipathTCP: false
				},
				offlineDataSizeURL: {
					url: "https://ods.is.autonavi.com/api/sizeForRegion",
					supportsMultipathTCP: false
				},
				analyticsShortSessionURL: {
					url: "https://gsp64-ssl.ls.apple.com/hvr/v3/use",
					supportsMultipathTCP: false
				},
				alternateResourcesURL: [
					{
						url: "https://cdn.apple-mapkit.com/rap",
						supportsMultipathTCP: false
					},
					{
						url: "https://limit-rule.is.autonavi.com/lpr/rules/download",
						supportsMultipathTCP: false
					}
				],
				abExperimentURL: {
					url: "https://gsp-ssl.ls.apple.com/cn/ab.arpc",
					supportsMultipathTCP: false
				},
				logMessageUsageURL: {
					url: "https://gsp64-ssl.ls.apple.com/a/v2/use",
					supportsMultipathTCP: false
				},
				rapWebBundleURL: {
					url: "https://cdn.apple-mapkit.com/rap",
					supportsMultipathTCP: false
				},
				dispatcherURL: {
					url: "https://dispatcher.is.autonavi.com/dispatcher",
					supportsMultipathTCP: false
				},
				simpleETAURL: {
					url: "https://direction2.is.autonavi.com/direction",
					supportsMultipathTCP: false
				},
				analyticsLongSessionURL: {
					url: "https://gsp64-ssl.ls.apple.com/hvr/v3/use",
					supportsMultipathTCP: false
				},
				backgroundDispatcherURL: {
					url: "https://dispatcher.is.autonavi.com/dispatcher",
					supportsMultipathTCP: false
				},
				webModuleBaseURL: {
					url: "https://placecard-server-wm.is.autonavi.com",
					supportsMultipathTCP: false
				},
				directionsURL: {
					url: "https://direction2.is.autonavi.com/direction",
					supportsMultipathTCP: false
				},
				logMessageUsageV3URL: {
					url: "https://gsp64-ssl.ls.apple.com/hvr/v3/use",
					supportsMultipathTCP: false
				},
				announcementsURL: {
					url: "https://gspe35-ssl.ls.apple.com/config/announcements?environment=prod-cn",
					supportsMultipathTCP: false
				}
			}
		],
		muninBucket: [
			{
				bucketID: 2,
				bucketURL: "https://gspe72-cn-ssl.ls.apple.com/mnn_us"
			},
			{
				bucketID: 6,
				bucketURL: "https://gspe72-cn-ssl.ls.apple.com/mnn_us"
			}
		]
	},
	XX: {
		attribution: [
			{
				region: [
				],
				name: "‎",
				url: "https://gspe21-ssl.ls.apple.com/html/attribution-279.html",
				resource: [
				],
				linkDisplayStringIndex: 0,
				plainTextURL: "https://gspe21-ssl.ls.apple.com/html/attribution-278.txt",
				plainTextURLSHA256Checksum: {
					"0": 124,
					"1": 102,
					"2": 134,
					"3": 184,
					"4": 40,
					"5": 189,
					"6": 231,
					"7": 39,
					"8": 109,
					"9": 244,
					"10": 228,
					"11": 192,
					"12": 151,
					"13": 223,
					"14": 17,
					"15": 129,
					"16": 158,
					"17": 253,
					"18": 70,
					"19": 5,
					"20": 123,
					"21": 187,
					"22": 50,
					"23": 87,
					"24": 25,
					"25": 122,
					"26": 38,
					"27": 36,
					"28": 33,
					"29": 149,
					"30": 18,
					"31": 234
				}
			},
			{
				region: [
					{
						maxX: 183,
						minZ: 8,
						minX: 176,
						maxY: 122,
						minY: 110,
						maxZ: 21
					},
					{
						maxX: 188,
						minZ: 8,
						minX: 178,
						maxY: 107,
						minY: 107,
						maxZ: 21
					},
					{
						maxX: 183,
						minZ: 8,
						minX: 178,
						maxY: 109,
						minY: 108,
						maxZ: 21
					},
					{
						maxX: 180,
						minZ: 8,
						minX: 180,
						maxY: 106,
						minY: 105,
						maxZ: 21
					},
					{
						maxX: 183,
						minZ: 8,
						minX: 181,
						maxY: 106,
						minY: 104,
						maxZ: 21
					},
					{
						maxX: 182,
						minZ: 8,
						minX: 182,
						maxY: 103,
						minY: 103,
						maxZ: 21
					},
					{
						maxX: 184,
						minZ: 8,
						minX: 184,
						maxY: 106,
						minY: 104,
						maxZ: 21
					},
					{
						maxX: 195,
						minZ: 8,
						minX: 184,
						maxY: 110,
						minY: 108,
						maxZ: 21
					},
					{
						maxX: 194,
						minZ: 8,
						minX: 184,
						maxY: 111,
						minY: 111,
						maxZ: 21
					},
					{
						maxX: 191,
						minZ: 8,
						minX: 184,
						maxY: 120,
						minY: 112,
						maxZ: 21
					},
					{
						maxX: 184,
						minZ: 8,
						minX: 184,
						maxY: 121,
						minY: 121,
						maxZ: 21
					},
					{
						maxX: 185,
						minZ: 8,
						minX: 185,
						maxY: 106,
						minY: 105,
						maxZ: 21
					},
					{
						maxX: 190,
						minZ: 8,
						minX: 190,
						maxY: 107,
						minY: 107,
						maxZ: 21
					},
					{
						maxX: 194,
						minZ: 8,
						minX: 193,
						maxY: 123,
						minY: 118,
						maxZ: 21
					},
					{
						maxX: 195,
						minZ: 8,
						minX: 195,
						maxY: 118,
						minY: 118,
						maxZ: 21
					}
				],
				linkDisplayStringIndex: 0,
				name: "MMI",
				url: "https://gspe21-ssl.ls.apple.com/html/attribution-279.html",
				resource: [
					{
						region: [
						],
						filter: [
						],
						checksum: {
							"0": 35,
							"1": 54,
							"2": 2,
							"3": 219,
							"4": 218,
							"5": 184,
							"6": 124,
							"7": 50,
							"8": 35,
							"9": 32,
							"10": 86,
							"11": 20,
							"12": 147,
							"13": 223,
							"14": 7,
							"15": 41,
							"16": 209,
							"17": 238,
							"18": 32,
							"19": 41
						},
						updateMethod: 0,
						validationMethod: 0,
						filename: "mmi-mask-2.png",
						resourceType: 5
					},
					{
						region: [
						],
						filter: [
						],
						checksum: {
							"0": 5,
							"1": 160,
							"2": 112,
							"3": 185,
							"4": 3,
							"5": 255,
							"6": 7,
							"7": 75,
							"8": 78,
							"9": 139,
							"10": 52,
							"11": 81,
							"12": 151,
							"13": 231,
							"14": 143,
							"15": 29,
							"16": 187,
							"17": 109,
							"18": 220,
							"19": 80
						},
						updateMethod: 0,
						validationMethod: 0,
						filename: "mmi-mask-2@2x.png",
						resourceType: 5
					},
					{
						region: [
						],
						filter: [
						],
						checksum: {
							"0": 240,
							"1": 170,
							"2": 204,
							"3": 91,
							"4": 161,
							"5": 113,
							"6": 81,
							"7": 101,
							"8": 136,
							"9": 205,
							"10": 115,
							"11": 2,
							"12": 192,
							"13": 97,
							"14": 106,
							"15": 34,
							"16": 227,
							"17": 214,
							"18": 74,
							"19": 220
						},
						updateMethod: 0,
						validationMethod: 0,
						filename: "mmi-mask-2@3x.png",
						resourceType: 5
					}
				]
			},
			{
				region: [
					{
						maxX: 225,
						minZ: 8,
						minX: 218,
						maxY: 104,
						minY: 102,
						maxZ: 21
					},
					{
						maxX: 228,
						minZ: 8,
						minX: 221,
						maxY: 101,
						minY: 98,
						maxZ: 21
					},
					{
						maxX: 231,
						minZ: 8,
						minX: 226,
						maxY: 97,
						minY: 91,
						maxZ: 21
					}
				],
				linkDisplayStringIndex: 0,
				name: "© GeoTechnologies, Inc.",
				url: "https://gspe21-ssl.ls.apple.com/html/attribution-279.html",
				resource: [
				]
			}
		],
		releaseInfo: "PROD (24.20)",
		tileSet: [
			{
				scale: 0,
				style: 1,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							}
						],
						identifier: 16388440,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
					{
						countryCode: "AE",
						region: "AE"
					},
					{
						countryCode: "AE",
						region: "SA"
					},
					{
						countryCode: "IN",
						region: ""
					},
					{
						countryCode: "JP",
						region: "JP"
					},
					{
						countryCode: "KR",
						region: "KR"
					},
					{
						countryCode: "MA",
						region: "MA"
					},
					{
						countryCode: "RU",
						region: "RU"
					},
					{
						countryCode: "SA",
						region: "AE"
					},
					{
						countryCode: "SA",
						region: "SA"
					},
					{
						countryCode: "VN",
						region: "VN"
					}
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf?flags=8"
			},
			{
				scale: 0,
				style: 1,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							}
						],
						identifier: 16389156,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
					{
						countryCode: "AE",
						region: "AE"
					},
					{
						countryCode: "AE",
						region: "SA"
					},
					{
						countryCode: "IN",
						region: ""
					},
					{
						countryCode: "JP",
						region: "JP"
					},
					{
						countryCode: "KR",
						region: "KR"
					},
					{
						countryCode: "MA",
						region: "MA"
					},
					{
						countryCode: "RU",
						region: "RU"
					},
					{
						countryCode: "SA",
						region: "AE"
					},
					{
						countryCode: "SA",
						region: "SA"
					},
					{
						countryCode: "VN",
						region: "VN"
					}
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf?flags=8"
			},
			{
				scale: 1,
				style: 7,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 1,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe11-ssl.ls.apple.com/tile",
				validVersion: [
					{
						genericTile: [
							{
								resourceIndex: 1971,
								textureIndex: 0,
								tileType: 2
							}
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 22
							}
						],
						identifier: 9751
					}
				]
			},
			{
				scale: 2,
				style: 7,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 1,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe11-ssl.ls.apple.com/tile",
				validVersion: [
					{
						genericTile: [
							{
								resourceIndex: 1971,
								textureIndex: 0,
								tileType: 2
							}
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 22
							}
						],
						identifier: 9751
					}
				]
			},
			{
				scale: 0,
				style: 11,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16388440
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf?flags=1"
			},
			{
				scale: 0,
				style: 11,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16389156
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf?flags=1"
			},
			{
				scale: 0,
				style: 12,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						availableTiles: [
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							}
						],
						identifier: 16388440,
						timeToLiveSeconds: 120,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe12-ssl.ls.apple.com/traffic"
			},
			{
				scale: 0,
				style: 12,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						availableTiles: [
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							}
						],
						identifier: 16389156,
						timeToLiveSeconds: 120,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe12-kittyhawk-ssl.ls.apple.com/traffic"
			},
			{
				scale: 0,
				style: 13,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							},
							{
								maxX: 65535,
								minZ: 16,
								minX: 0,
								maxY: 65535,
								minY: 0,
								maxZ: 16
							},
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 16388440,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf?flags=2"
			},
			{
				scale: 0,
				style: 13,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							},
							{
								maxX: 65535,
								minZ: 16,
								minX: 0,
								maxY: 65535,
								minY: 0,
								maxZ: 16
							},
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 16389156,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf?flags=2"
			},
			{
				scale: 0,
				style: 14,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe11-ssl.ls.apple.com/tile",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
						],
						identifier: 1
					}
				]
			},
			{
				scale: 0,
				style: 15,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe11-ssl.ls.apple.com/tile",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
						],
						identifier: 1
					}
				]
			},
			{
				scale: 0,
				style: 16,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe11-ssl.ls.apple.com/tile",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
						],
						identifier: 1
					}
				]
			},
			{
				scale: 0,
				style: 17,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe11-ssl.ls.apple.com/tile",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							}
						],
						identifier: 0
					}
				]
			},
			{
				scale: 1,
				style: 17,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 1,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe11-ssl.ls.apple.com/tile",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 2583,
								minZ: 13,
								minX: 408,
								maxY: 3659,
								minY: 2760,
								maxZ: 13
							},
							{
								maxX: 4535,
								minZ: 13,
								minX: 3848,
								maxY: 3235,
								minY: 2332,
								maxZ: 13
							}
						],
						identifier: 32
					}
				]
			},
			{
				scale: 0,
				style: 18,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16388440,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 18,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16389156,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 20,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16388440,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
					{
						countryCode: "AE",
						region: "AE"
					},
					{
						countryCode: "AE",
						region: "SA"
					},
					{
						countryCode: "IN",
						region: ""
					},
					{
						countryCode: "JP",
						region: "JP"
					},
					{
						countryCode: "KR",
						region: "KR"
					},
					{
						countryCode: "MA",
						region: "MA"
					},
					{
						countryCode: "RU",
						region: "RU"
					},
					{
						countryCode: "SA",
						region: "AE"
					},
					{
						countryCode: "SA",
						region: "SA"
					},
					{
						countryCode: "VN",
						region: "VN"
					}
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 20,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16389156,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
					{
						countryCode: "AE",
						region: "AE"
					},
					{
						countryCode: "AE",
						region: "SA"
					},
					{
						countryCode: "IN",
						region: ""
					},
					{
						countryCode: "JP",
						region: "JP"
					},
					{
						countryCode: "KR",
						region: "KR"
					},
					{
						countryCode: "MA",
						region: "MA"
					},
					{
						countryCode: "RU",
						region: "RU"
					},
					{
						countryCode: "SA",
						region: "AE"
					},
					{
						countryCode: "SA",
						region: "SA"
					},
					{
						countryCode: "VN",
						region: "VN"
					}
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 22,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16388440
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 22,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16389156
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 30,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							},
							{
								maxX: 262143,
								minZ: 18,
								minX: 0,
								maxY: 262143,
								minY: 0,
								maxZ: 18
							}
						],
						identifier: 16388440,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 30,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							},
							{
								maxX: 262143,
								minZ: 18,
								minX: 0,
								maxY: 262143,
								minY: 0,
								maxZ: 18
							}
						],
						identifier: 16389156,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 1,
				style: 33,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 1,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe11-ssl.ls.apple.com/tile",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 7
							}
						],
						identifier: 4
					}
				]
			},
			{
				scale: 0,
				style: 37,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16388440,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf?flags=2"
			},
			{
				scale: 0,
				style: 37,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16389156,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf?flags=2"
			},
			{
				scale: 0,
				style: 42,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe11-ssl.ls.apple.com/tile",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
						],
						identifier: 1
					}
				]
			},
			{
				scale: 0,
				style: 43,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe11-ssl.ls.apple.com/tile",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
						],
						identifier: 1
					}
				]
			},
			{
				scale: 0,
				style: 44,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe11-ssl.ls.apple.com/tile",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
						],
						identifier: 1
					}
				]
			},
			{
				scale: 0,
				style: 47,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16388440,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 47,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16389156,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 48,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 11201196
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 48,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 11201196
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 52,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe11-ssl.ls.apple.com/tile",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
						],
						identifier: 1
					}
				]
			},
			{
				scale: 0,
				style: 53,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16388440,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 53,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16389156,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 54,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 13658945
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 54,
				checksumType: 0,
				requestStyle: 1,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 13659050
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 56,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 16388440,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 56,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 16389156,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 57,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe76-ssl.ls.apple.com/api/tile",
				validVersion: [
					{
						availableTiles: [
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 0,
						timeToLiveSeconds: 3600,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 58,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							},
							{
								maxX: 65535,
								minZ: 16,
								minX: 0,
								maxY: 65535,
								minY: 0,
								maxZ: 16
							},
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 16388440
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 58,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							},
							{
								maxX: 65535,
								minZ: 16,
								minX: 0,
								maxY: 65535,
								minY: 0,
								maxZ: 16
							},
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 16389156
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 59,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							}
						],
						identifier: 16388440
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/asset/v3/model"
			},
			{
				scale: 0,
				style: 59,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							}
						],
						identifier: 16389156
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/asset/v3/model"
			},
			{
				scale: 0,
				style: 60,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							}
						],
						identifier: 16388440
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/asset/v3/material"
			},
			{
				scale: 0,
				style: 60,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							}
						],
						identifier: 16389156
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/asset/v3/material"
			},
			{
				scale: 0,
				style: 61,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							}
						],
						identifier: 16388440
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 61,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							}
						],
						identifier: 16389156
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 62,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							}
						],
						identifier: 16388440
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 62,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							}
						],
						identifier: 16389156
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 64,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							}
						],
						identifier: 16388440,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 64,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							}
						],
						identifier: 16389156,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 65,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe79-ssl.ls.apple.com/65/v1",
				validVersion: [
					{
						availableTiles: [
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							}
						],
						identifier: 2,
						timeToLiveSeconds: 3600,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 66,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16388440,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
					{
						countryCode: "AE",
						region: "AE"
					},
					{
						countryCode: "AE",
						region: "SA"
					},
					{
						countryCode: "IN",
						region: ""
					},
					{
						countryCode: "JP",
						region: "JP"
					},
					{
						countryCode: "KR",
						region: "KR"
					},
					{
						countryCode: "MA",
						region: "MA"
					},
					{
						countryCode: "RU",
						region: "RU"
					},
					{
						countryCode: "SA",
						region: "AE"
					},
					{
						countryCode: "SA",
						region: "SA"
					},
					{
						countryCode: "VN",
						region: "VN"
					}
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 66,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16389156,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
					{
						countryCode: "AE",
						region: "AE"
					},
					{
						countryCode: "AE",
						region: "SA"
					},
					{
						countryCode: "IN",
						region: ""
					},
					{
						countryCode: "JP",
						region: "JP"
					},
					{
						countryCode: "KR",
						region: "KR"
					},
					{
						countryCode: "MA",
						region: "MA"
					},
					{
						countryCode: "RU",
						region: "RU"
					},
					{
						countryCode: "SA",
						region: "AE"
					},
					{
						countryCode: "SA",
						region: "SA"
					},
					{
						countryCode: "VN",
						region: "VN"
					}
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 67,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							}
						],
						identifier: 16388440,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
					{
						countryCode: "AE",
						region: "AE"
					},
					{
						countryCode: "AE",
						region: "SA"
					},
					{
						countryCode: "IN",
						region: ""
					},
					{
						countryCode: "JP",
						region: "JP"
					},
					{
						countryCode: "KR",
						region: "KR"
					},
					{
						countryCode: "MA",
						region: "MA"
					},
					{
						countryCode: "RU",
						region: "RU"
					},
					{
						countryCode: "SA",
						region: "AE"
					},
					{
						countryCode: "SA",
						region: "SA"
					},
					{
						countryCode: "VN",
						region: "VN"
					}
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 67,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							}
						],
						identifier: 16389156,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
					{
						countryCode: "AE",
						region: "AE"
					},
					{
						countryCode: "AE",
						region: "SA"
					},
					{
						countryCode: "IN",
						region: ""
					},
					{
						countryCode: "JP",
						region: "JP"
					},
					{
						countryCode: "KR",
						region: "KR"
					},
					{
						countryCode: "MA",
						region: "MA"
					},
					{
						countryCode: "RU",
						region: "RU"
					},
					{
						countryCode: "SA",
						region: "AE"
					},
					{
						countryCode: "SA",
						region: "SA"
					},
					{
						countryCode: "VN",
						region: "VN"
					}
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 68,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							},
							{
								maxX: 65535,
								minZ: 16,
								minX: 0,
								maxY: 65535,
								minY: 0,
								maxZ: 16
							},
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 16388440,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 68,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							},
							{
								maxX: 65535,
								minZ: 16,
								minX: 0,
								maxY: 65535,
								minY: 0,
								maxZ: 16
							},
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 16389156,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 69,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16388440
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 69,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16389156
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 70,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe76-ssl.ls.apple.com/api/vltile",
				validVersion: [
					{
						availableTiles: [
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							}
						],
						identifier: 1,
						timeToLiveSeconds: 86400,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 71,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe92-ssl.ls.apple.com",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 2097151,
								minZ: 21,
								minX: 0,
								maxY: 2097151,
								minY: 0,
								maxZ: 21
							}
						],
						identifier: 1
					}
				]
			},
			{
				scale: 0,
				style: 72,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe79-ssl.ls.apple.com/72/v2",
				validVersion: [
					{
						availableTiles: [
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							}
						],
						identifier: 2,
						timeToLiveSeconds: 3600,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 73,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16388440
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 73,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16389156
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 74,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe79-ssl.ls.apple.com/pbz/v1",
				validVersion: [
					{
						availableTiles: [
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2097151,
								minZ: 21,
								minX: 0,
								maxY: 2097151,
								minY: 0,
								maxZ: 21
							}
						],
						identifier: 0,
						timeToLiveSeconds: 86400,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 76,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe79-ssl.ls.apple.com/sis/v1",
				validVersion: [
					{
						availableTiles: [
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 524287,
								minZ: 19,
								minX: 0,
								maxY: 524287,
								minY: 0,
								maxZ: 19
							}
						],
						identifier: 0,
						timeToLiveSeconds: 86400,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 78,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							}
						],
						identifier: 16388440
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 78,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							}
						],
						identifier: 16389156
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 79,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							}
						],
						identifier: 16388440
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 79,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							}
						],
						identifier: 16389156
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 80,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe79-ssl.ls.apple.com/sdm/v1",
				validVersion: [
					{
						availableTiles: [
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 65535,
								minZ: 16,
								minX: 0,
								maxY: 65535,
								minY: 0,
								maxZ: 16
							}
						],
						identifier: 0,
						timeToLiveSeconds: 86400,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 82,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							}
						],
						identifier: 16388440
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/asset/v3/model-occlusion"
			},
			{
				scale: 0,
				style: 82,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							}
						],
						identifier: 16389156
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/asset/v3/model-occlusion"
			},
			{
				scale: 0,
				style: 83,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 0,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							},
							{
								maxX: 65535,
								minZ: 16,
								minX: 0,
								maxY: 65535,
								minY: 0,
								maxZ: 16
							},
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 16357893
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 83,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 0,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							},
							{
								maxX: 65535,
								minZ: 16,
								minX: 0,
								maxY: 65535,
								minY: 0,
								maxZ: 16
							},
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 16361517
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 84,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							},
							{
								maxX: 65535,
								minZ: 16,
								minX: 0,
								maxY: 65535,
								minY: 0,
								maxZ: 16
							},
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 16388440,
						timeToLiveSeconds: 1800,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-2-ssl.ls.apple.com/poi_update"
			},
			{
				scale: 0,
				style: 84,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							},
							{
								maxX: 65535,
								minZ: 16,
								minX: 0,
								maxY: 65535,
								minY: 0,
								maxZ: 16
							},
							{
								maxX: 131071,
								minZ: 17,
								minX: 0,
								maxY: 131071,
								minY: 0,
								maxZ: 17
							}
						],
						identifier: 16389156,
						timeToLiveSeconds: 1800,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-2-ssl.ls.apple.com/poi_update"
			},
			{
				scale: 0,
				style: 85,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							}
						],
						identifier: 16388440
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-2-ssl.ls.apple.com/live_tile.vf"
			},
			{
				scale: 0,
				style: 85,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							}
						],
						identifier: 16389156
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-2-ssl.ls.apple.com/live_tile.vf"
			},
			{
				scale: 0,
				style: 87,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16388440,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 87,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
					{
						language: [
							"ar",
							"ca",
							"cs",
							"da",
							"de",
							"el",
							"en",
							"en-AU",
							"en-GB",
							"es",
							"es-MX",
							"es-US",
							"fi",
							"fr",
							"fr-CA",
							"he",
							"hi",
							"hr",
							"hu",
							"id",
							"it",
							"ja",
							"ko",
							"ms",
							"nb",
							"nl",
							"pl",
							"pt",
							"pt-PT",
							"ro",
							"ru",
							"sk",
							"sv",
							"th",
							"tr",
							"uk",
							"vi",
							"zh-Hans",
							"zh-Hant",
							"zh-HK"
						],
						identifier: 1
					}
				],
				validVersion: [
					{
						supportedLanguagesVersion: 1,
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							},
							{
								maxX: 31,
								minZ: 5,
								minX: 0,
								maxY: 31,
								minY: 0,
								maxZ: 5
							},
							{
								maxX: 63,
								minZ: 6,
								minX: 0,
								maxY: 63,
								minY: 0,
								maxZ: 6
							},
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 255,
								minZ: 8,
								minX: 0,
								maxY: 255,
								minY: 0,
								maxZ: 8
							},
							{
								maxX: 511,
								minZ: 9,
								minX: 0,
								maxY: 511,
								minY: 0,
								maxZ: 9
							},
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							},
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 16383,
								minZ: 14,
								minX: 0,
								maxY: 16383,
								minY: 0,
								maxZ: 14
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16389156,
						genericTile: [
						]
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 88,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							}
						],
						identifier: 16388440
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 88,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 4095,
								minZ: 12,
								minX: 0,
								maxY: 4095,
								minY: 0,
								maxZ: 12
							}
						],
						identifier: 16389156
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 89,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 1,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe79-ssl.ls.apple.com/ray/v1",
				validVersion: [
					{
						availableTiles: [
							{
								maxX: 262143,
								minZ: 18,
								minX: 0,
								maxY: 262143,
								minY: 0,
								maxZ: 18
							}
						],
						identifier: 1,
						timeToLiveSeconds: 86400,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 90,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 0,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16388440
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 90,
				checksumType: 0,
				requestStyle: 0,
				supportsMultipathTCP: false,
				dataSet: 1,
				size: 2,
				supportedLanguage: [
				],
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 8191,
								minZ: 13,
								minX: 0,
								maxY: 8191,
								minY: 0,
								maxZ: 13
							},
							{
								maxX: 32767,
								minZ: 15,
								minX: 0,
								maxY: 32767,
								minY: 0,
								maxZ: 15
							}
						],
						identifier: 16389156
					}
				],
				deviceSKUWhitelist: [
				],
				countryRegionWhitelist: [
				],
				baseURL: "https://gspe19-kittyhawk-ssl.ls.apple.com/tile.vf"
			},
			{
				scale: 0,
				style: 91,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe11-ssl-vss.ls.apple.com/tile",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							}
						],
						identifier: 2
					}
				]
			},
			{
				scale: 1,
				style: 92,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 1,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe11-ssl-vss.ls.apple.com/tile",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 127,
								minZ: 7,
								minX: 0,
								maxY: 127,
								minY: 0,
								maxZ: 7
							},
							{
								maxX: 2047,
								minZ: 11,
								minX: 0,
								maxY: 2047,
								minY: 0,
								maxZ: 11
							},
							{
								maxX: 2583,
								minZ: 13,
								minX: 408,
								maxY: 3659,
								minY: 2760,
								maxZ: 13
							},
							{
								maxX: 4535,
								minZ: 13,
								minX: 3848,
								maxY: 3235,
								minY: 2332,
								maxZ: 13
							}
						],
						identifier: 32
					}
				]
			},
			{
				scale: 0,
				style: 94,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 0,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe79-ssl.ls.apple.com/ccc/v1",
				validVersion: [
					{
						availableTiles: [
							{
								maxX: 1023,
								minZ: 10,
								minX: 0,
								maxY: 1023,
								minY: 0,
								maxZ: 10
							},
							{
								maxX: 262143,
								minZ: 18,
								minX: 0,
								maxY: 262143,
								minY: 0,
								maxZ: 18
							}
						],
						identifier: 1,
						timeToLiveSeconds: 86400,
						genericTile: [
						]
					}
				]
			},
			{
				scale: 0,
				style: 95,
				checksumType: 0,
				countryRegionWhitelist: [
				],
				size: 2,
				requestStyle: 0,
				deviceSKUWhitelist: [
				],
				supportedLanguage: [
				],
				supportsMultipathTCP: false,
				baseURL: "https://gspe11-ssl-vss.ls.apple.com/tile",
				validVersion: [
					{
						genericTile: [
						],
						availableTiles: [
							{
								maxX: 1,
								minZ: 1,
								minX: 0,
								maxY: 1,
								minY: 0,
								maxZ: 1
							},
							{
								maxX: 3,
								minZ: 2,
								minX: 0,
								maxY: 3,
								minY: 0,
								maxZ: 2
							},
							{
								maxX: 7,
								minZ: 3,
								minX: 0,
								maxY: 7,
								minY: 0,
								maxZ: 3
							},
							{
								maxX: 15,
								minZ: 4,
								minX: 0,
								maxY: 15,
								minY: 0,
								maxZ: 4
							}
						],
						identifier: 1
					}
				]
			}
		],
		dataSet: [
			{
				identifier: 0,
				dataSetDescription: "TomTom"
			},
			{
				identifier: 1,
				dataSetDescription: "KittyHawk"
			}
		],
		urlInfoSet: [
			{
				backgroundRevGeoURL: {
					url: "https://gsp57-ssl-revgeo.ls.apple.com/dispatcher.arpc",
					supportsMultipathTCP: false
				},
				announcementsURL: {
					url: "https://gspe35-ssl.ls.apple.com/config/announcements?environment=prod",
					supportsMultipathTCP: false
				},
				searchAttributionManifestURL: {
					url: "https://gspe21-ssl.ls.apple.com/config/search-attribution-1322",
					supportsMultipathTCP: false
				},
				analyticsSessionlessURL: {
					url: "https://gsp64-ssl.ls.apple.com/hvr/v3/use",
					supportsMultipathTCP: false
				},
				proactiveAppClipURL: {
					url: "https://gspe79-ssl.ls.apple.com/72/v2",
					supportsMultipathTCP: false
				},
				enrichmentSubmissionURL: {
					url: "https://sundew.ls.apple.com/v1/feedback/submission.arpc",
					supportsMultipathTCP: false
				},
				wifiConnectionQualityProbeURL: {
					url: "https://gsp10-ssl.ls.apple.com/hvr/wcq",
					supportsMultipathTCP: false
				},
				poiBusynessActivityCollectionURL: {
					url: "https://gsp53-ssl.ls.apple.com/hvr/rt_poi_activity",
					supportsMultipathTCP: false
				},
				offlineDataDownloadBaseURL: {
					url: "https://gspe121-ssl.ls.apple.com",
					supportsMultipathTCP: false
				},
				etaURL: {
					url: "https://gsp-ssl.ls.apple.com/directions.arpc",
					supportsMultipathTCP: true,
					alternativeMultipathTCPPort: 5228
				},
				analyticsCohortSessionURL: {
					url: "https://gsp64-ssl.ls.apple.com/hvr/v3/use",
					supportsMultipathTCP: false
				},
				resourcesURL: {
					url: "https://gspe21-ssl.ls.apple.com/",
					supportsMultipathTCP: false
				},
				problemOptInURL: {
					url: "https://sundew.ls.apple.com/grp/oi",
					supportsMultipathTCP: false
				},
				proactiveRoutingURL: {
					url: "https://gsp-ssl-commute.ls.apple.com/directions.arpc",
					supportsMultipathTCP: true,
					alternativeMultipathTCPPort: 5228
				},
				feedbackLookupURL: {
					url: "https://gsp-ssl.ls.apple.com/feedback.arpc",
					supportsMultipathTCP: false
				},
				bluePOIDispatcherURL: {
					url: "https://gsp57-ssl-locus.ls.apple.com/dispatcher.arpc",
					supportsMultipathTCP: true,
					alternativeMultipathTCPPort: 5228
				},
				batchTrafficProbeURL: {
					url: "https://gsp10-ssl.ls.apple.com/hvr/v2/loc",
					supportsMultipathTCP: false
				},
				batchReverseGeocoderURL: {
					url: "https://gsp36-ssl.ls.apple.com/revgeo.arpc",
					supportsMultipathTCP: false
				},
				spatialLookupURL: {
					url: "https://gsp51-ssl.ls.apple.com/api/v1.0/poi/data",
					supportsMultipathTCP: false
				},
				realtimeTrafficProbeURL: {
					url: "https://gsp9-ssl.apple.com/hvr/v2/rtloc",
					supportsMultipathTCP: false
				},
				addressCorrectionTaggedLocationURL: {
					url: "https://gsp47-ssl.ls.apple.com/ac",
					supportsMultipathTCP: false
				},
				problemSubmissionURL: {
					url: "https://sundew.ls.apple.com/v1/feedback/submission.arpc",
					supportsMultipathTCP: false
				},
				reverseGeocoderVersionsURL: {
					url: "https://gspe21-ssl.ls.apple.com/config/revgeo-version-11.plist",
					supportsMultipathTCP: false
				},
				wifiQualityTileURL: {
					url: "https://gspe85-ssl.ls.apple.com/wifi_request_tile",
					supportsMultipathTCP: false
				},
				problemCategoriesURL: {
					url: "https://gspe21-ssl.ls.apple.com/config/com.apple.GEO.BusinessLocalizedCategories-482.plist",
					supportsMultipathTCP: false
				},
				batchReverseGeocoderPlaceRequestURL: {
					url: "https://gsp36-ssl.ls.apple.com/revgeo_pr.arpc",
					supportsMultipathTCP: false
				},
				wifiQualityURL: {
					url: "https://gsp85-ssl.ls.apple.com/wifi_request",
					supportsMultipathTCP: false
				},
				problemStatusURL: {
					url: "https://sundew.ls.apple.com/grp/st",
					supportsMultipathTCP: false
				},
				feedbackSubmissionURL: {
					url: "https://sundew.ls.apple.com/v1/feedback/submission.arpc",
					supportsMultipathTCP: false
				},
				pressureProbeDataURL: {
					url: "https://gsp10-ssl.ls.apple.com/hvr/cpr",
					supportsMultipathTCP: false
				},
				offlineDataBatchListURL: {
					url: "https://gspe121-ssl.ls.apple.com/api/batchesForRegion",
					supportsMultipathTCP: false
				},
				offlineDataSizeURL: {
					url: "https://gspe121-ssl.ls.apple.com/api/sizeForRegion",
					supportsMultipathTCP: false
				},
				analyticsShortSessionURL: {
					url: "https://gsp64-ssl.ls.apple.com/hvr/v3/use",
					supportsMultipathTCP: false
				},
				bcxDispatcherURL: {
					url: "https://gsp57-ssl-bcx.ls.apple.com/dispatcher.arpc",
					supportsMultipathTCP: false
				},
				alternateResourcesURL: [
					{
						url: "https://cdn.apple-mapkit.com/rap",
						supportsMultipathTCP: false
					}
				],
				abExperimentURL: {
					url: "https://gsp-ssl.ls.apple.com/ab.arpc",
					supportsMultipathTCP: false
				},
				logMessageUsageURL: {
					url: "https://gsp64-ssl.ls.apple.com/a/v2/use",
					supportsMultipathTCP: false
				},
				addressCorrectionInitURL: {
					url: "https://gsp47-ssl.ls.apple.com/ac",
					supportsMultipathTCP: false
				},
				dispatcherURL: {
					url: "https://gsp-ssl.ls.apple.com/dispatcher.arpc",
					supportsMultipathTCP: true,
					alternativeMultipathTCPPort: 5228
				},
				ugcLogDiscardURL: {
					url: "https://sundew.ls.apple.com/v1/log_message",
					supportsMultipathTCP: false
				},
				rapWebBundleURL: {
					url: "https://cdn.apple-mapkit.com/rap",
					supportsMultipathTCP: false
				},
				networkSelectionHarvestURL: {
					url: "https://gsp10-ssl.ls.apple.com/hvr/strn",
					supportsMultipathTCP: false
				},
				simpleETAURL: {
					url: "https://gsp-ssl.ls.apple.com/directions.arpc",
					supportsMultipathTCP: true,
					alternativeMultipathTCPPort: 5228
				},
				businessPortalBaseURL: {
					url: "https://mapsconnect.apple.com/business/ui/claimPlace",
					supportsMultipathTCP: false
				},
				analyticsLongSessionURL: {
					url: "https://gsp64-ssl.ls.apple.com/hvr/v3/use",
					supportsMultipathTCP: false
				},
				backgroundDispatcherURL: {
					url: "https://gsp57-ssl-background.ls.apple.com/dispatcher.arpc",
					supportsMultipathTCP: true,
					alternativeMultipathTCPPort: 5228
				},
				webModuleBaseURL: {
					url: "https://maps.apple.com",
					supportsMultipathTCP: false
				},
				directionsURL: {
					url: "https://gsp-ssl.ls.apple.com/directions.arpc",
					supportsMultipathTCP: true,
					alternativeMultipathTCPPort: 5228
				},
				addressCorrectionUpdateURL: {
					url: "https://gsp47-ssl.ls.apple.com/ac",
					supportsMultipathTCP: false
				},
				logMessageUsageV3URL: {
					url: "https://gsp64-ssl.ls.apple.com/hvr/v3/use",
					supportsMultipathTCP: false
				}
			}
		],
		muninBucket: [
			{
				bucketID: 2,
				bucketURL: "https://gspe72-ssl.ls.apple.com/mnn_us"
			},
			{
				bucketID: 6,
				bucketURL: "https://gspe72-ssl.ls.apple.com/mnn_us"
			}
		]
	}
};
var Maps = {
	Settings: Settings$5,
	Configs: Configs$2
};

var Maps$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Configs: Configs$2,
	Settings: Settings$5,
	default: Maps
});

var Settings$4 = {
	Switch: true,
	CountryCode: "US",
	NewsPlusUser: true
};
var News = {
	Settings: Settings$4
};

var News$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Settings: Settings$4,
	default: News
});

var Settings$3 = {
	Switch: true,
	CountryCode: "US",
	canUse: true
};
var PrivateRelay = {
	Settings: Settings$3
};

var PrivateRelay$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Settings: Settings$3,
	default: PrivateRelay
});

var Settings$2 = {
	Switch: true,
	CountryCode: "SG",
	Domains: [
		"web",
		"itunes",
		"app_store",
		"movies",
		"restaurants",
		"maps"
	],
	Functions: [
		"flightutilities",
		"lookup",
		"mail",
		"messages",
		"news",
		"safari",
		"siri",
		"spotlight",
		"visualintelligence"
	],
	Safari_Smart_History: true
};
var Configs$1 = {
	VisualIntelligence: {
		enabled_domains: [
			"pets",
			"media",
			"books",
			"art",
			"nature",
			"landmarks"
		],
		supported_domains: [
			"ART",
			"BOOK",
			"MEDIA",
			"LANDMARK",
			"ANIMALS",
			"BIRDS",
			"FOOD",
			"SIGN_SYMBOL",
			"AUTO_SYMBOL",
			"DOGS",
			"NATURE",
			"NATURAL_LANDMARK",
			"INSECTS",
			"REPTILES",
			"ALBUM",
			"STOREFRONT",
			"LAUNDRY_CARE_SYMBOL",
			"CATS",
			"OBJECT_2D",
			"SCULPTURE",
			"SKYLINE",
			"MAMMALS"
		]
	}
};
var Siri = {
	Settings: Settings$2,
	Configs: Configs$1
};

var Siri$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Configs: Configs$1,
	Settings: Settings$2,
	default: Siri
});

var Settings$1 = {
	Switch: "true",
	CountryCode: "US",
	MultiAccount: "false",
	Universal: "true"
};
var TestFlight = {
	Settings: Settings$1
};

var TestFlight$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Settings: Settings$1,
	default: TestFlight
});

var Settings = {
	Switch: true,
	"Third-Party": false,
	HLSUrl: "play-edge.itunes.apple.com",
	ServerUrl: "play.itunes.apple.com",
	Tabs: [
		"WatchNow",
		"Originals",
		"MLS",
		"Sports",
		"Kids",
		"Store",
		"Movies",
		"TV",
		"ChannelsAndApps",
		"Library",
		"Search"
	],
	CountryCode: {
		Configs: "AUTO",
		Settings: "AUTO",
		View: [
			"SG",
			"TW"
		],
		WatchNow: "AUTO",
		Channels: "AUTO",
		Originals: "AUTO",
		Sports: "US",
		Kids: "US",
		Store: "AUTO",
		Movies: "AUTO",
		TV: "AUTO",
		Persons: "SG",
		Search: "AUTO",
		Others: "AUTO"
	}
};
var Configs = {
	Locale: [
		[
			"AU",
			"en-AU"
		],
		[
			"CA",
			"en-CA"
		],
		[
			"GB",
			"en-GB"
		],
		[
			"KR",
			"ko-KR"
		],
		[
			"HK",
			"yue-Hant"
		],
		[
			"JP",
			"ja-JP"
		],
		[
			"MO",
			"zh-Hant"
		],
		[
			"TW",
			"zh-Hant"
		],
		[
			"US",
			"en-US"
		],
		[
			"SG",
			"zh-Hans"
		]
	],
	Tabs: [
		{
			title: "主页",
			type: "WatchNow",
			universalLinks: [
				"https://tv.apple.com/watch-now",
				"https://tv.apple.com/home"
			],
			destinationType: "Target",
			target: {
				id: "tahoma_watchnow",
				type: "Root",
				url: "https://tv.apple.com/watch-now"
			},
			isSelected: true
		},
		{
			title: "Apple TV+",
			type: "Originals",
			universalLinks: [
				"https://tv.apple.com/channel/tvs.sbd.4000",
				"https://tv.apple.com/atv"
			],
			destinationType: "Target",
			target: {
				id: "tvs.sbd.4000",
				type: "Brand",
				url: "https://tv.apple.com/us/channel/tvs.sbd.4000"
			}
		},
		{
			title: "MLS Season Pass",
			type: "MLS",
			universalLinks: [
				"https://tv.apple.com/mls"
			],
			destinationType: "Target",
			target: {
				id: "tvs.sbd.7000",
				type: "Brand",
				url: "https://tv.apple.com/us/channel/tvs.sbd.7000"
			}
		},
		{
			title: "体育节目",
			type: "Sports",
			universalLinks: [
				"https://tv.apple.com/sports"
			],
			destinationType: "Target",
			target: {
				id: "tahoma_sports",
				type: "Root",
				url: "https://tv.apple.com/sports"
			}
		},
		{
			title: "儿童",
			type: "Kids",
			universalLinks: [
				"https://tv.apple.com/kids"
			],
			destinationType: "Target",
			target: {
				id: "tahoma_kids",
				type: "Root",
				url: "https://tv.apple.com/kids"
			}
		},
		{
			title: "电影",
			type: "Movies",
			universalLinks: [
				"https://tv.apple.com/movies"
			],
			destinationType: "Target",
			target: {
				id: "tahoma_movies",
				type: "Root",
				url: "https://tv.apple.com/movies"
			}
		},
		{
			title: "电视节目",
			type: "TV",
			universalLinks: [
				"https://tv.apple.com/tv-shows"
			],
			destinationType: "Target",
			target: {
				id: "tahoma_tvshows",
				type: "Root",
				url: "https://tv.apple.com/tv-shows"
			}
		},
		{
			title: "商店",
			type: "Store",
			universalLinks: [
				"https://tv.apple.com/store"
			],
			destinationType: "SubTabs",
			subTabs: [
				{
					title: "电影",
					type: "Movies",
					universalLinks: [
						"https://tv.apple.com/movies"
					],
					destinationType: "Target",
					target: {
						id: "tahoma_movies",
						type: "Root",
						url: "https://tv.apple.com/movies"
					}
				},
				{
					title: "电视节目",
					type: "TV",
					universalLinks: [
						"https://tv.apple.com/tv-shows"
					],
					destinationType: "Target",
					target: {
						id: "tahoma_tvshows",
						type: "Root",
						url: "https://tv.apple.com/tv-shows"
					}
				}
			]
		},
		{
			title: "频道和 App",
			destinationType: "SubTabs",
			subTabsPlacementType: "ExpandedList",
			type: "ChannelsAndApps",
			subTabs: [
			]
		},
		{
			title: "资料库",
			type: "Library",
			destinationType: "Client"
		},
		{
			title: "搜索",
			type: "Search",
			universalLinks: [
				"https://tv.apple.com/search"
			],
			destinationType: "Target",
			target: {
				id: "tahoma_search",
				type: "Root",
				url: "https://tv.apple.com/search"
			}
		}
	],
	i18n: {
		WatchNow: [
			[
				"en",
				"Home"
			],
			[
				"zh",
				"主页"
			],
			[
				"zh-Hans",
				"主頁"
			],
			[
				"zh-Hant",
				"主頁"
			]
		],
		Movies: [
			[
				"en",
				"Movies"
			],
			[
				"zh",
				"电影"
			],
			[
				"zh-Hans",
				"电影"
			],
			[
				"zh-Hant",
				"電影"
			]
		],
		TV: [
			[
				"en",
				"TV"
			],
			[
				"zh",
				"电视节目"
			],
			[
				"zh-Hans",
				"电视节目"
			],
			[
				"zh-Hant",
				"電視節目"
			]
		],
		Store: [
			[
				"en",
				"Store"
			],
			[
				"zh",
				"商店"
			],
			[
				"zh-Hans",
				"商店"
			],
			[
				"zh-Hant",
				"商店"
			]
		],
		Sports: [
			[
				"en",
				"Sports"
			],
			[
				"zh",
				"体育节目"
			],
			[
				"zh-Hans",
				"体育节目"
			],
			[
				"zh-Hant",
				"體育節目"
			]
		],
		Kids: [
			[
				"en",
				"Kids"
			],
			[
				"zh",
				"儿童"
			],
			[
				"zh-Hans",
				"儿童"
			],
			[
				"zh-Hant",
				"兒童"
			]
		],
		Library: [
			[
				"en",
				"Library"
			],
			[
				"zh",
				"资料库"
			],
			[
				"zh-Hans",
				"资料库"
			],
			[
				"zh-Hant",
				"資料庫"
			]
		],
		Search: [
			[
				"en",
				"Search"
			],
			[
				"zh",
				"搜索"
			],
			[
				"zh-Hans",
				"搜索"
			],
			[
				"zh-Hant",
				"蒐索"
			]
		]
	}
};
var TV = {
	Settings: Settings,
	Configs: Configs
};

var TV$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Configs: Configs,
	Settings: Settings,
	default: TV
});

var Database$1 = Database = {
	"Default": Default$1,
	"Location": Location$1,
	"Maps": Maps$1,
	"News": News$1,
	"PrivateRelay": PrivateRelay$1,
	"Siri": Siri$1,
	"TestFlight": TestFlight$1,
	"TV": TV$1,
};

/**
 * Get Storage Variables
 * @link https://github.com/NanoCat-Me/ENV/blob/main/getStorage.mjs
 * @author VirgilClyne
 * @param {String} key - Persistent Store Key
 * @param {Array} names - Platform Names
 * @param {Object} database - Default Database
 * @return {Object} { Settings, Caches, Configs }
 */
function getStorage(key, names, database) {
    //console.log(`☑️ ${this.name}, Get Environment Variables`, "");
    /***************** BoxJs *****************/
    // 包装为局部变量，用完释放内存
    // BoxJs的清空操作返回假值空字符串, 逻辑或操作符会在左侧操作数为假值时返回右侧操作数。
    let BoxJs = $Storage.getItem(key, database);
    //console.log(`🚧 ${this.name}, Get Environment Variables`, `BoxJs类型: ${typeof BoxJs}`, `BoxJs内容: ${JSON.stringify(BoxJs)}`, "");
    /***************** Argument *****************/
    let Argument = {};
    if (typeof $argument !== "undefined") {
        if (Boolean($argument)) {
            //console.log(`🎉 ${this.name}, $Argument`);
            let arg = Object.fromEntries($argument.split("&").map((item) => item.split("=").map(i => i.replace(/\"/g, ''))));
            //console.log(JSON.stringify(arg));
            for (let item in arg) Lodash.set(Argument, item, arg[item]);
            //console.log(JSON.stringify(Argument));
        }        //console.log(`✅ ${this.name}, Get Environment Variables`, `Argument类型: ${typeof Argument}`, `Argument内容: ${JSON.stringify(Argument)}`, "");
    }    /***************** Store *****************/
    const Store = { Settings: database?.Default?.Settings || {}, Configs: database?.Default?.Configs || {}, Caches: {} };
    if (!Array.isArray(names)) names = [names];
    //console.log(`🚧 ${this.name}, Get Environment Variables`, `names类型: ${typeof names}`, `names内容: ${JSON.stringify(names)}`, "");
    for (let name of names) {
        Store.Settings = { ...Store.Settings, ...database?.[name]?.Settings, ...Argument, ...BoxJs?.[name]?.Settings };
        Store.Configs = { ...Store.Configs, ...database?.[name]?.Configs };
        if (BoxJs?.[name]?.Caches && typeof BoxJs?.[name]?.Caches === "string") BoxJs[name].Caches = JSON.parse(BoxJs?.[name]?.Caches);
        Store.Caches = { ...Store.Caches, ...BoxJs?.[name]?.Caches };
    }    //console.log(`🚧 ${this.name}, Get Environment Variables`, `Store.Settings类型: ${typeof Store.Settings}`, `Store.Settings: ${JSON.stringify(Store.Settings)}`, "");
    traverseObject(Store.Settings, (key, value) => {
        //console.log(`🚧 ${this.name}, traverseObject`, `${key}: ${typeof value}`, `${key}: ${JSON.stringify(value)}`, "");
        if (value === "true" || value === "false") value = JSON.parse(value); // 字符串转Boolean
        else if (typeof value === "string") {
            if (value.includes(",")) value = value.split(",").map(item => string2number(item)); // 字符串转数组转数字
            else value = string2number(value); // 字符串转数字
        }        return value;
    });
    //console.log(`✅ ${this.name}, Get Environment Variables`, `Store: ${typeof Store.Caches}`, `Store内容: ${JSON.stringify(Store)}`, "");
    return Store;

    /***************** function *****************/
    function traverseObject(o, c) { for (var t in o) { var n = o[t]; o[t] = "object" == typeof n && null !== n ? traverseObject(n, c) : c(t, n); } return o }
    function string2number(string) { if (string && !isNaN(string)) string = parseInt(string, 10); return string }
}

/**
 * Set Environment Variables
 * @author VirgilClyne
 * @param {Object} $ - ENV
 * @param {String} name - Persistent Store Key
 * @param {Array} platforms - Platform Names
 * @param {Object} database - Default DataBase
 * @return {Object} { Settings, Caches, Configs }
 */
function setENV(name, platforms, database) {
	console.log(`☑️ Set Environment Variables`, "");
	let { Settings, Caches, Configs } = getStorage(name, platforms, database);
	/***************** Settings *****************/
	if (Settings?.Tabs && !Array.isArray(Settings?.Tabs)) Lodash.set(Settings, "Tabs", (Settings?.Tabs) ? [Settings.Tabs.toString()] : []);
	if (Settings?.Domains && !Array.isArray(Settings?.Domains)) Lodash.set(Settings, "Domains", (Settings?.Domains) ? [Settings.Domains.toString()] : []);
	if (Settings?.Functions && !Array.isArray(Settings?.Functions)) Lodash.set(Settings, "Functions", (Settings?.Functions) ? [Settings.Functions.toString()] : []);
	console.log(`✅ Set Environment Variables, Settings: ${typeof Settings}, Settings内容: ${JSON.stringify(Settings)}`, "");
	/***************** Caches *****************/
	//console.log(`✅ Set Environment Variables, Caches: ${typeof Caches}, Caches内容: ${JSON.stringify(Caches)}`, "");
	/***************** Configs *****************/
	Configs.Storefront = new Map(Configs.Storefront);
	if (Configs.Locale) Configs.Locale = new Map(Configs.Locale);
	if (Configs.i18n) for (let type in Configs.i18n) Configs.i18n[type] = new Map(Configs.i18n[type]);
	return { Settings, Caches, Configs };
}

/*! pako 2.1.0 https://github.com/nodeca/pako @license (MIT AND Zlib) */
// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

/* eslint-disable space-unary-ops */

/* Public constants ==========================================================*/
/* ===========================================================================*/


//const Z_FILTERED          = 1;
//const Z_HUFFMAN_ONLY      = 2;
//const Z_RLE               = 3;
const Z_FIXED$1               = 4;
//const Z_DEFAULT_STRATEGY  = 0;

/* Possible values of the data_type field (though see inflate()) */
const Z_BINARY              = 0;
const Z_TEXT                = 1;
//const Z_ASCII             = 1; // = Z_TEXT
const Z_UNKNOWN$1             = 2;

/*============================================================================*/


function zero$1(buf) { let len = buf.length; while (--len >= 0) { buf[len] = 0; } }

// From zutil.h

const STORED_BLOCK = 0;
const STATIC_TREES = 1;
const DYN_TREES    = 2;
/* The three kinds of block type */

const MIN_MATCH$1    = 3;
const MAX_MATCH$1    = 258;
/* The minimum and maximum match lengths */

// From deflate.h
/* ===========================================================================
 * Internal compression state.
 */

const LENGTH_CODES$1  = 29;
/* number of length codes, not counting the special END_BLOCK code */

const LITERALS$1      = 256;
/* number of literal bytes 0..255 */

const L_CODES$1       = LITERALS$1 + 1 + LENGTH_CODES$1;
/* number of Literal or Length codes, including the END_BLOCK code */

const D_CODES$1       = 30;
/* number of distance codes */

const BL_CODES$1      = 19;
/* number of codes used to transfer the bit lengths */

const HEAP_SIZE$1     = 2 * L_CODES$1 + 1;
/* maximum heap size */

const MAX_BITS$1      = 15;
/* All codes must not exceed MAX_BITS bits */

const Buf_size      = 16;
/* size of bit buffer in bi_buf */


/* ===========================================================================
 * Constants
 */

const MAX_BL_BITS = 7;
/* Bit length codes must not exceed MAX_BL_BITS bits */

const END_BLOCK   = 256;
/* end of block literal code */

const REP_3_6     = 16;
/* repeat previous bit length 3-6 times (2 bits of repeat count) */

const REPZ_3_10   = 17;
/* repeat a zero length 3-10 times  (3 bits of repeat count) */

const REPZ_11_138 = 18;
/* repeat a zero length 11-138 times  (7 bits of repeat count) */

/* eslint-disable comma-spacing,array-bracket-spacing */
const extra_lbits =   /* extra bits for each length code */
  new Uint8Array([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0]);

const extra_dbits =   /* extra bits for each distance code */
  new Uint8Array([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13]);

const extra_blbits =  /* extra bits for each bit length code */
  new Uint8Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7]);

const bl_order =
  new Uint8Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]);
/* eslint-enable comma-spacing,array-bracket-spacing */

/* The lengths of the bit length codes are sent in order of decreasing
 * probability, to avoid transmitting the lengths for unused bit length codes.
 */

/* ===========================================================================
 * Local data. These are initialized only once.
 */

// We pre-fill arrays with 0 to avoid uninitialized gaps

const DIST_CODE_LEN = 512; /* see definition of array dist_code below */

// !!!! Use flat array instead of structure, Freq = i*2, Len = i*2+1
const static_ltree  = new Array((L_CODES$1 + 2) * 2);
zero$1(static_ltree);
/* The static literal tree. Since the bit lengths are imposed, there is no
 * need for the L_CODES extra codes used during heap construction. However
 * The codes 286 and 287 are needed to build a canonical tree (see _tr_init
 * below).
 */

const static_dtree  = new Array(D_CODES$1 * 2);
zero$1(static_dtree);
/* The static distance tree. (Actually a trivial tree since all codes use
 * 5 bits.)
 */

const _dist_code    = new Array(DIST_CODE_LEN);
zero$1(_dist_code);
/* Distance codes. The first 256 values correspond to the distances
 * 3 .. 258, the last 256 values correspond to the top 8 bits of
 * the 15 bit distances.
 */

const _length_code  = new Array(MAX_MATCH$1 - MIN_MATCH$1 + 1);
zero$1(_length_code);
/* length code for each normalized match length (0 == MIN_MATCH) */

const base_length   = new Array(LENGTH_CODES$1);
zero$1(base_length);
/* First normalized length for each code (0 = MIN_MATCH) */

const base_dist     = new Array(D_CODES$1);
zero$1(base_dist);
/* First normalized distance for each code (0 = distance of 1) */


function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {

  this.static_tree  = static_tree;  /* static tree or NULL */
  this.extra_bits   = extra_bits;   /* extra bits for each code or NULL */
  this.extra_base   = extra_base;   /* base index for extra_bits */
  this.elems        = elems;        /* max number of elements in the tree */
  this.max_length   = max_length;   /* max bit length for the codes */

  // show if `static_tree` has data or dummy - needed for monomorphic objects
  this.has_stree    = static_tree && static_tree.length;
}


let static_l_desc;
let static_d_desc;
let static_bl_desc;


function TreeDesc(dyn_tree, stat_desc) {
  this.dyn_tree = dyn_tree;     /* the dynamic tree */
  this.max_code = 0;            /* largest code with non zero frequency */
  this.stat_desc = stat_desc;   /* the corresponding static tree */
}



const d_code = (dist) => {

  return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
};


/* ===========================================================================
 * Output a short LSB first on the stream.
 * IN assertion: there is enough room in pendingBuf.
 */
const put_short = (s, w) => {
//    put_byte(s, (uch)((w) & 0xff));
//    put_byte(s, (uch)((ush)(w) >> 8));
  s.pending_buf[s.pending++] = (w) & 0xff;
  s.pending_buf[s.pending++] = (w >>> 8) & 0xff;
};


/* ===========================================================================
 * Send a value on a given number of bits.
 * IN assertion: length <= 16 and value fits in length bits.
 */
const send_bits = (s, value, length) => {

  if (s.bi_valid > (Buf_size - length)) {
    s.bi_buf |= (value << s.bi_valid) & 0xffff;
    put_short(s, s.bi_buf);
    s.bi_buf = value >> (Buf_size - s.bi_valid);
    s.bi_valid += length - Buf_size;
  } else {
    s.bi_buf |= (value << s.bi_valid) & 0xffff;
    s.bi_valid += length;
  }
};


const send_code = (s, c, tree) => {

  send_bits(s, tree[c * 2]/*.Code*/, tree[c * 2 + 1]/*.Len*/);
};


/* ===========================================================================
 * Reverse the first len bits of a code, using straightforward code (a faster
 * method would use a table)
 * IN assertion: 1 <= len <= 15
 */
const bi_reverse = (code, len) => {

  let res = 0;
  do {
    res |= code & 1;
    code >>>= 1;
    res <<= 1;
  } while (--len > 0);
  return res >>> 1;
};


/* ===========================================================================
 * Flush the bit buffer, keeping at most 7 bits in it.
 */
const bi_flush = (s) => {

  if (s.bi_valid === 16) {
    put_short(s, s.bi_buf);
    s.bi_buf = 0;
    s.bi_valid = 0;

  } else if (s.bi_valid >= 8) {
    s.pending_buf[s.pending++] = s.bi_buf & 0xff;
    s.bi_buf >>= 8;
    s.bi_valid -= 8;
  }
};


/* ===========================================================================
 * Compute the optimal bit lengths for a tree and update the total bit length
 * for the current block.
 * IN assertion: the fields freq and dad are set, heap[heap_max] and
 *    above are the tree nodes sorted by increasing frequency.
 * OUT assertions: the field len is set to the optimal bit length, the
 *     array bl_count contains the frequencies for each bit length.
 *     The length opt_len is updated; static_len is also updated if stree is
 *     not null.
 */
const gen_bitlen = (s, desc) => {
//    deflate_state *s;
//    tree_desc *desc;    /* the tree descriptor */

  const tree            = desc.dyn_tree;
  const max_code        = desc.max_code;
  const stree           = desc.stat_desc.static_tree;
  const has_stree       = desc.stat_desc.has_stree;
  const extra           = desc.stat_desc.extra_bits;
  const base            = desc.stat_desc.extra_base;
  const max_length      = desc.stat_desc.max_length;
  let h;              /* heap index */
  let n, m;           /* iterate over the tree elements */
  let bits;           /* bit length */
  let xbits;          /* extra bits */
  let f;              /* frequency */
  let overflow = 0;   /* number of elements with bit length too large */

  for (bits = 0; bits <= MAX_BITS$1; bits++) {
    s.bl_count[bits] = 0;
  }

  /* In a first pass, compute the optimal bit lengths (which may
   * overflow in the case of the bit length tree).
   */
  tree[s.heap[s.heap_max] * 2 + 1]/*.Len*/ = 0; /* root of the heap */

  for (h = s.heap_max + 1; h < HEAP_SIZE$1; h++) {
    n = s.heap[h];
    bits = tree[tree[n * 2 + 1]/*.Dad*/ * 2 + 1]/*.Len*/ + 1;
    if (bits > max_length) {
      bits = max_length;
      overflow++;
    }
    tree[n * 2 + 1]/*.Len*/ = bits;
    /* We overwrite tree[n].Dad which is no longer needed */

    if (n > max_code) { continue; } /* not a leaf node */

    s.bl_count[bits]++;
    xbits = 0;
    if (n >= base) {
      xbits = extra[n - base];
    }
    f = tree[n * 2]/*.Freq*/;
    s.opt_len += f * (bits + xbits);
    if (has_stree) {
      s.static_len += f * (stree[n * 2 + 1]/*.Len*/ + xbits);
    }
  }
  if (overflow === 0) { return; }

  // Tracev((stderr,"\nbit length overflow\n"));
  /* This happens for example on obj2 and pic of the Calgary corpus */

  /* Find the first bit length which could increase: */
  do {
    bits = max_length - 1;
    while (s.bl_count[bits] === 0) { bits--; }
    s.bl_count[bits]--;      /* move one leaf down the tree */
    s.bl_count[bits + 1] += 2; /* move one overflow item as its brother */
    s.bl_count[max_length]--;
    /* The brother of the overflow item also moves one step up,
     * but this does not affect bl_count[max_length]
     */
    overflow -= 2;
  } while (overflow > 0);

  /* Now recompute all bit lengths, scanning in increasing frequency.
   * h is still equal to HEAP_SIZE. (It is simpler to reconstruct all
   * lengths instead of fixing only the wrong ones. This idea is taken
   * from 'ar' written by Haruhiko Okumura.)
   */
  for (bits = max_length; bits !== 0; bits--) {
    n = s.bl_count[bits];
    while (n !== 0) {
      m = s.heap[--h];
      if (m > max_code) { continue; }
      if (tree[m * 2 + 1]/*.Len*/ !== bits) {
        // Tracev((stderr,"code %d bits %d->%d\n", m, tree[m].Len, bits));
        s.opt_len += (bits - tree[m * 2 + 1]/*.Len*/) * tree[m * 2]/*.Freq*/;
        tree[m * 2 + 1]/*.Len*/ = bits;
      }
      n--;
    }
  }
};


/* ===========================================================================
 * Generate the codes for a given tree and bit counts (which need not be
 * optimal).
 * IN assertion: the array bl_count contains the bit length statistics for
 * the given tree and the field len is set for all tree elements.
 * OUT assertion: the field code is set for all tree elements of non
 *     zero code length.
 */
const gen_codes = (tree, max_code, bl_count) => {
//    ct_data *tree;             /* the tree to decorate */
//    int max_code;              /* largest code with non zero frequency */
//    ushf *bl_count;            /* number of codes at each bit length */

  const next_code = new Array(MAX_BITS$1 + 1); /* next code value for each bit length */
  let code = 0;              /* running code value */
  let bits;                  /* bit index */
  let n;                     /* code index */

  /* The distribution counts are first used to generate the code values
   * without bit reversal.
   */
  for (bits = 1; bits <= MAX_BITS$1; bits++) {
    code = (code + bl_count[bits - 1]) << 1;
    next_code[bits] = code;
  }
  /* Check that the bit counts in bl_count are consistent. The last code
   * must be all ones.
   */
  //Assert (code + bl_count[MAX_BITS]-1 == (1<<MAX_BITS)-1,
  //        "inconsistent bit counts");
  //Tracev((stderr,"\ngen_codes: max_code %d ", max_code));

  for (n = 0;  n <= max_code; n++) {
    let len = tree[n * 2 + 1]/*.Len*/;
    if (len === 0) { continue; }
    /* Now reverse the bits */
    tree[n * 2]/*.Code*/ = bi_reverse(next_code[len]++, len);

    //Tracecv(tree != static_ltree, (stderr,"\nn %3d %c l %2d c %4x (%x) ",
    //     n, (isgraph(n) ? n : ' '), len, tree[n].Code, next_code[len]-1));
  }
};


/* ===========================================================================
 * Initialize the various 'constant' tables.
 */
const tr_static_init = () => {

  let n;        /* iterates over tree elements */
  let bits;     /* bit counter */
  let length;   /* length value */
  let code;     /* code value */
  let dist;     /* distance index */
  const bl_count = new Array(MAX_BITS$1 + 1);
  /* number of codes at each bit length for an optimal tree */

  // do check in _tr_init()
  //if (static_init_done) return;

  /* For some embedded targets, global variables are not initialized: */
/*#ifdef NO_INIT_GLOBAL_POINTERS
  static_l_desc.static_tree = static_ltree;
  static_l_desc.extra_bits = extra_lbits;
  static_d_desc.static_tree = static_dtree;
  static_d_desc.extra_bits = extra_dbits;
  static_bl_desc.extra_bits = extra_blbits;
#endif*/

  /* Initialize the mapping length (0..255) -> length code (0..28) */
  length = 0;
  for (code = 0; code < LENGTH_CODES$1 - 1; code++) {
    base_length[code] = length;
    for (n = 0; n < (1 << extra_lbits[code]); n++) {
      _length_code[length++] = code;
    }
  }
  //Assert (length == 256, "tr_static_init: length != 256");
  /* Note that the length 255 (match length 258) can be represented
   * in two different ways: code 284 + 5 bits or code 285, so we
   * overwrite length_code[255] to use the best encoding:
   */
  _length_code[length - 1] = code;

  /* Initialize the mapping dist (0..32K) -> dist code (0..29) */
  dist = 0;
  for (code = 0; code < 16; code++) {
    base_dist[code] = dist;
    for (n = 0; n < (1 << extra_dbits[code]); n++) {
      _dist_code[dist++] = code;
    }
  }
  //Assert (dist == 256, "tr_static_init: dist != 256");
  dist >>= 7; /* from now on, all distances are divided by 128 */
  for (; code < D_CODES$1; code++) {
    base_dist[code] = dist << 7;
    for (n = 0; n < (1 << (extra_dbits[code] - 7)); n++) {
      _dist_code[256 + dist++] = code;
    }
  }
  //Assert (dist == 256, "tr_static_init: 256+dist != 512");

  /* Construct the codes of the static literal tree */
  for (bits = 0; bits <= MAX_BITS$1; bits++) {
    bl_count[bits] = 0;
  }

  n = 0;
  while (n <= 143) {
    static_ltree[n * 2 + 1]/*.Len*/ = 8;
    n++;
    bl_count[8]++;
  }
  while (n <= 255) {
    static_ltree[n * 2 + 1]/*.Len*/ = 9;
    n++;
    bl_count[9]++;
  }
  while (n <= 279) {
    static_ltree[n * 2 + 1]/*.Len*/ = 7;
    n++;
    bl_count[7]++;
  }
  while (n <= 287) {
    static_ltree[n * 2 + 1]/*.Len*/ = 8;
    n++;
    bl_count[8]++;
  }
  /* Codes 286 and 287 do not exist, but we must include them in the
   * tree construction to get a canonical Huffman tree (longest code
   * all ones)
   */
  gen_codes(static_ltree, L_CODES$1 + 1, bl_count);

  /* The static distance tree is trivial: */
  for (n = 0; n < D_CODES$1; n++) {
    static_dtree[n * 2 + 1]/*.Len*/ = 5;
    static_dtree[n * 2]/*.Code*/ = bi_reverse(n, 5);
  }

  // Now data ready and we can init static trees
  static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS$1 + 1, L_CODES$1, MAX_BITS$1);
  static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0,          D_CODES$1, MAX_BITS$1);
  static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0,         BL_CODES$1, MAX_BL_BITS);

  //static_init_done = true;
};


/* ===========================================================================
 * Initialize a new block.
 */
const init_block = (s) => {

  let n; /* iterates over tree elements */

  /* Initialize the trees. */
  for (n = 0; n < L_CODES$1;  n++) { s.dyn_ltree[n * 2]/*.Freq*/ = 0; }
  for (n = 0; n < D_CODES$1;  n++) { s.dyn_dtree[n * 2]/*.Freq*/ = 0; }
  for (n = 0; n < BL_CODES$1; n++) { s.bl_tree[n * 2]/*.Freq*/ = 0; }

  s.dyn_ltree[END_BLOCK * 2]/*.Freq*/ = 1;
  s.opt_len = s.static_len = 0;
  s.sym_next = s.matches = 0;
};


/* ===========================================================================
 * Flush the bit buffer and align the output on a byte boundary
 */
const bi_windup = (s) =>
{
  if (s.bi_valid > 8) {
    put_short(s, s.bi_buf);
  } else if (s.bi_valid > 0) {
    //put_byte(s, (Byte)s->bi_buf);
    s.pending_buf[s.pending++] = s.bi_buf;
  }
  s.bi_buf = 0;
  s.bi_valid = 0;
};

/* ===========================================================================
 * Compares to subtrees, using the tree depth as tie breaker when
 * the subtrees have equal frequency. This minimizes the worst case length.
 */
const smaller = (tree, n, m, depth) => {

  const _n2 = n * 2;
  const _m2 = m * 2;
  return (tree[_n2]/*.Freq*/ < tree[_m2]/*.Freq*/ ||
         (tree[_n2]/*.Freq*/ === tree[_m2]/*.Freq*/ && depth[n] <= depth[m]));
};

/* ===========================================================================
 * Restore the heap property by moving down the tree starting at node k,
 * exchanging a node with the smallest of its two sons if necessary, stopping
 * when the heap property is re-established (each father smaller than its
 * two sons).
 */
const pqdownheap = (s, tree, k) => {
//    deflate_state *s;
//    ct_data *tree;  /* the tree to restore */
//    int k;               /* node to move down */

  const v = s.heap[k];
  let j = k << 1;  /* left son of k */
  while (j <= s.heap_len) {
    /* Set j to the smallest of the two sons: */
    if (j < s.heap_len &&
      smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
      j++;
    }
    /* Exit if v is smaller than both sons */
    if (smaller(tree, v, s.heap[j], s.depth)) { break; }

    /* Exchange v with the smallest son */
    s.heap[k] = s.heap[j];
    k = j;

    /* And continue down the tree, setting j to the left son of k */
    j <<= 1;
  }
  s.heap[k] = v;
};


// inlined manually
// const SMALLEST = 1;

/* ===========================================================================
 * Send the block data compressed using the given Huffman trees
 */
const compress_block = (s, ltree, dtree) => {
//    deflate_state *s;
//    const ct_data *ltree; /* literal tree */
//    const ct_data *dtree; /* distance tree */

  let dist;           /* distance of matched string */
  let lc;             /* match length or unmatched char (if dist == 0) */
  let sx = 0;         /* running index in sym_buf */
  let code;           /* the code to send */
  let extra;          /* number of extra bits to send */

  if (s.sym_next !== 0) {
    do {
      dist = s.pending_buf[s.sym_buf + sx++] & 0xff;
      dist += (s.pending_buf[s.sym_buf + sx++] & 0xff) << 8;
      lc = s.pending_buf[s.sym_buf + sx++];
      if (dist === 0) {
        send_code(s, lc, ltree); /* send a literal byte */
        //Tracecv(isgraph(lc), (stderr," '%c' ", lc));
      } else {
        /* Here, lc is the match length - MIN_MATCH */
        code = _length_code[lc];
        send_code(s, code + LITERALS$1 + 1, ltree); /* send the length code */
        extra = extra_lbits[code];
        if (extra !== 0) {
          lc -= base_length[code];
          send_bits(s, lc, extra);       /* send the extra length bits */
        }
        dist--; /* dist is now the match distance - 1 */
        code = d_code(dist);
        //Assert (code < D_CODES, "bad d_code");

        send_code(s, code, dtree);       /* send the distance code */
        extra = extra_dbits[code];
        if (extra !== 0) {
          dist -= base_dist[code];
          send_bits(s, dist, extra);   /* send the extra distance bits */
        }
      } /* literal or match pair ? */

      /* Check that the overlay between pending_buf and sym_buf is ok: */
      //Assert(s->pending < s->lit_bufsize + sx, "pendingBuf overflow");

    } while (sx < s.sym_next);
  }

  send_code(s, END_BLOCK, ltree);
};


/* ===========================================================================
 * Construct one Huffman tree and assigns the code bit strings and lengths.
 * Update the total bit length for the current block.
 * IN assertion: the field freq is set for all tree elements.
 * OUT assertions: the fields len and code are set to the optimal bit length
 *     and corresponding code. The length opt_len is updated; static_len is
 *     also updated if stree is not null. The field max_code is set.
 */
const build_tree = (s, desc) => {
//    deflate_state *s;
//    tree_desc *desc; /* the tree descriptor */

  const tree     = desc.dyn_tree;
  const stree    = desc.stat_desc.static_tree;
  const has_stree = desc.stat_desc.has_stree;
  const elems    = desc.stat_desc.elems;
  let n, m;          /* iterate over heap elements */
  let max_code = -1; /* largest code with non zero frequency */
  let node;          /* new node being created */

  /* Construct the initial heap, with least frequent element in
   * heap[SMALLEST]. The sons of heap[n] are heap[2*n] and heap[2*n+1].
   * heap[0] is not used.
   */
  s.heap_len = 0;
  s.heap_max = HEAP_SIZE$1;

  for (n = 0; n < elems; n++) {
    if (tree[n * 2]/*.Freq*/ !== 0) {
      s.heap[++s.heap_len] = max_code = n;
      s.depth[n] = 0;

    } else {
      tree[n * 2 + 1]/*.Len*/ = 0;
    }
  }

  /* The pkzip format requires that at least one distance code exists,
   * and that at least one bit should be sent even if there is only one
   * possible code. So to avoid special checks later on we force at least
   * two codes of non zero frequency.
   */
  while (s.heap_len < 2) {
    node = s.heap[++s.heap_len] = (max_code < 2 ? ++max_code : 0);
    tree[node * 2]/*.Freq*/ = 1;
    s.depth[node] = 0;
    s.opt_len--;

    if (has_stree) {
      s.static_len -= stree[node * 2 + 1]/*.Len*/;
    }
    /* node is 0 or 1 so it does not have extra bits */
  }
  desc.max_code = max_code;

  /* The elements heap[heap_len/2+1 .. heap_len] are leaves of the tree,
   * establish sub-heaps of increasing lengths:
   */
  for (n = (s.heap_len >> 1/*int /2*/); n >= 1; n--) { pqdownheap(s, tree, n); }

  /* Construct the Huffman tree by repeatedly combining the least two
   * frequent nodes.
   */
  node = elems;              /* next internal node of the tree */
  do {
    //pqremove(s, tree, n);  /* n = node of least frequency */
    /*** pqremove ***/
    n = s.heap[1/*SMALLEST*/];
    s.heap[1/*SMALLEST*/] = s.heap[s.heap_len--];
    pqdownheap(s, tree, 1/*SMALLEST*/);
    /***/

    m = s.heap[1/*SMALLEST*/]; /* m = node of next least frequency */

    s.heap[--s.heap_max] = n; /* keep the nodes sorted by frequency */
    s.heap[--s.heap_max] = m;

    /* Create a new node father of n and m */
    tree[node * 2]/*.Freq*/ = tree[n * 2]/*.Freq*/ + tree[m * 2]/*.Freq*/;
    s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
    tree[n * 2 + 1]/*.Dad*/ = tree[m * 2 + 1]/*.Dad*/ = node;

    /* and insert the new node in the heap */
    s.heap[1/*SMALLEST*/] = node++;
    pqdownheap(s, tree, 1/*SMALLEST*/);

  } while (s.heap_len >= 2);

  s.heap[--s.heap_max] = s.heap[1/*SMALLEST*/];

  /* At this point, the fields freq and dad are set. We can now
   * generate the bit lengths.
   */
  gen_bitlen(s, desc);

  /* The field len is now set, we can generate the bit codes */
  gen_codes(tree, max_code, s.bl_count);
};


/* ===========================================================================
 * Scan a literal or distance tree to determine the frequencies of the codes
 * in the bit length tree.
 */
const scan_tree = (s, tree, max_code) => {
//    deflate_state *s;
//    ct_data *tree;   /* the tree to be scanned */
//    int max_code;    /* and its largest code of non zero frequency */

  let n;                     /* iterates over all tree elements */
  let prevlen = -1;          /* last emitted length */
  let curlen;                /* length of current code */

  let nextlen = tree[0 * 2 + 1]/*.Len*/; /* length of next code */

  let count = 0;             /* repeat count of the current code */
  let max_count = 7;         /* max repeat count */
  let min_count = 4;         /* min repeat count */

  if (nextlen === 0) {
    max_count = 138;
    min_count = 3;
  }
  tree[(max_code + 1) * 2 + 1]/*.Len*/ = 0xffff; /* guard */

  for (n = 0; n <= max_code; n++) {
    curlen = nextlen;
    nextlen = tree[(n + 1) * 2 + 1]/*.Len*/;

    if (++count < max_count && curlen === nextlen) {
      continue;

    } else if (count < min_count) {
      s.bl_tree[curlen * 2]/*.Freq*/ += count;

    } else if (curlen !== 0) {

      if (curlen !== prevlen) { s.bl_tree[curlen * 2]/*.Freq*/++; }
      s.bl_tree[REP_3_6 * 2]/*.Freq*/++;

    } else if (count <= 10) {
      s.bl_tree[REPZ_3_10 * 2]/*.Freq*/++;

    } else {
      s.bl_tree[REPZ_11_138 * 2]/*.Freq*/++;
    }

    count = 0;
    prevlen = curlen;

    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;

    } else if (curlen === nextlen) {
      max_count = 6;
      min_count = 3;

    } else {
      max_count = 7;
      min_count = 4;
    }
  }
};


/* ===========================================================================
 * Send a literal or distance tree in compressed form, using the codes in
 * bl_tree.
 */
const send_tree = (s, tree, max_code) => {
//    deflate_state *s;
//    ct_data *tree; /* the tree to be scanned */
//    int max_code;       /* and its largest code of non zero frequency */

  let n;                     /* iterates over all tree elements */
  let prevlen = -1;          /* last emitted length */
  let curlen;                /* length of current code */

  let nextlen = tree[0 * 2 + 1]/*.Len*/; /* length of next code */

  let count = 0;             /* repeat count of the current code */
  let max_count = 7;         /* max repeat count */
  let min_count = 4;         /* min repeat count */

  /* tree[max_code+1].Len = -1; */  /* guard already set */
  if (nextlen === 0) {
    max_count = 138;
    min_count = 3;
  }

  for (n = 0; n <= max_code; n++) {
    curlen = nextlen;
    nextlen = tree[(n + 1) * 2 + 1]/*.Len*/;

    if (++count < max_count && curlen === nextlen) {
      continue;

    } else if (count < min_count) {
      do { send_code(s, curlen, s.bl_tree); } while (--count !== 0);

    } else if (curlen !== 0) {
      if (curlen !== prevlen) {
        send_code(s, curlen, s.bl_tree);
        count--;
      }
      //Assert(count >= 3 && count <= 6, " 3_6?");
      send_code(s, REP_3_6, s.bl_tree);
      send_bits(s, count - 3, 2);

    } else if (count <= 10) {
      send_code(s, REPZ_3_10, s.bl_tree);
      send_bits(s, count - 3, 3);

    } else {
      send_code(s, REPZ_11_138, s.bl_tree);
      send_bits(s, count - 11, 7);
    }

    count = 0;
    prevlen = curlen;
    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;

    } else if (curlen === nextlen) {
      max_count = 6;
      min_count = 3;

    } else {
      max_count = 7;
      min_count = 4;
    }
  }
};


/* ===========================================================================
 * Construct the Huffman tree for the bit lengths and return the index in
 * bl_order of the last bit length code to send.
 */
const build_bl_tree = (s) => {

  let max_blindex;  /* index of last bit length code of non zero freq */

  /* Determine the bit length frequencies for literal and distance trees */
  scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
  scan_tree(s, s.dyn_dtree, s.d_desc.max_code);

  /* Build the bit length tree: */
  build_tree(s, s.bl_desc);
  /* opt_len now includes the length of the tree representations, except
   * the lengths of the bit lengths codes and the 5+5+4 bits for the counts.
   */

  /* Determine the number of bit length codes to send. The pkzip format
   * requires that at least 4 bit length codes be sent. (appnote.txt says
   * 3 but the actual value used is 4.)
   */
  for (max_blindex = BL_CODES$1 - 1; max_blindex >= 3; max_blindex--) {
    if (s.bl_tree[bl_order[max_blindex] * 2 + 1]/*.Len*/ !== 0) {
      break;
    }
  }
  /* Update opt_len to include the bit length tree and counts */
  s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
  //Tracev((stderr, "\ndyn trees: dyn %ld, stat %ld",
  //        s->opt_len, s->static_len));

  return max_blindex;
};


/* ===========================================================================
 * Send the header for a block using dynamic Huffman trees: the counts, the
 * lengths of the bit length codes, the literal tree and the distance tree.
 * IN assertion: lcodes >= 257, dcodes >= 1, blcodes >= 4.
 */
const send_all_trees = (s, lcodes, dcodes, blcodes) => {
//    deflate_state *s;
//    int lcodes, dcodes, blcodes; /* number of codes for each tree */

  let rank;                    /* index in bl_order */

  //Assert (lcodes >= 257 && dcodes >= 1 && blcodes >= 4, "not enough codes");
  //Assert (lcodes <= L_CODES && dcodes <= D_CODES && blcodes <= BL_CODES,
  //        "too many codes");
  //Tracev((stderr, "\nbl counts: "));
  send_bits(s, lcodes - 257, 5); /* not +255 as stated in appnote.txt */
  send_bits(s, dcodes - 1,   5);
  send_bits(s, blcodes - 4,  4); /* not -3 as stated in appnote.txt */
  for (rank = 0; rank < blcodes; rank++) {
    //Tracev((stderr, "\nbl code %2d ", bl_order[rank]));
    send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1]/*.Len*/, 3);
  }
  //Tracev((stderr, "\nbl tree: sent %ld", s->bits_sent));

  send_tree(s, s.dyn_ltree, lcodes - 1); /* literal tree */
  //Tracev((stderr, "\nlit tree: sent %ld", s->bits_sent));

  send_tree(s, s.dyn_dtree, dcodes - 1); /* distance tree */
  //Tracev((stderr, "\ndist tree: sent %ld", s->bits_sent));
};


/* ===========================================================================
 * Check if the data type is TEXT or BINARY, using the following algorithm:
 * - TEXT if the two conditions below are satisfied:
 *    a) There are no non-portable control characters belonging to the
 *       "block list" (0..6, 14..25, 28..31).
 *    b) There is at least one printable character belonging to the
 *       "allow list" (9 {TAB}, 10 {LF}, 13 {CR}, 32..255).
 * - BINARY otherwise.
 * - The following partially-portable control characters form a
 *   "gray list" that is ignored in this detection algorithm:
 *   (7 {BEL}, 8 {BS}, 11 {VT}, 12 {FF}, 26 {SUB}, 27 {ESC}).
 * IN assertion: the fields Freq of dyn_ltree are set.
 */
const detect_data_type = (s) => {
  /* block_mask is the bit mask of block-listed bytes
   * set bits 0..6, 14..25, and 28..31
   * 0xf3ffc07f = binary 11110011111111111100000001111111
   */
  let block_mask = 0xf3ffc07f;
  let n;

  /* Check for non-textual ("block-listed") bytes. */
  for (n = 0; n <= 31; n++, block_mask >>>= 1) {
    if ((block_mask & 1) && (s.dyn_ltree[n * 2]/*.Freq*/ !== 0)) {
      return Z_BINARY;
    }
  }

  /* Check for textual ("allow-listed") bytes. */
  if (s.dyn_ltree[9 * 2]/*.Freq*/ !== 0 || s.dyn_ltree[10 * 2]/*.Freq*/ !== 0 ||
      s.dyn_ltree[13 * 2]/*.Freq*/ !== 0) {
    return Z_TEXT;
  }
  for (n = 32; n < LITERALS$1; n++) {
    if (s.dyn_ltree[n * 2]/*.Freq*/ !== 0) {
      return Z_TEXT;
    }
  }

  /* There are no "block-listed" or "allow-listed" bytes:
   * this stream either is empty or has tolerated ("gray-listed") bytes only.
   */
  return Z_BINARY;
};


let static_init_done = false;

/* ===========================================================================
 * Initialize the tree data structures for a new zlib stream.
 */
const _tr_init$1 = (s) =>
{

  if (!static_init_done) {
    tr_static_init();
    static_init_done = true;
  }

  s.l_desc  = new TreeDesc(s.dyn_ltree, static_l_desc);
  s.d_desc  = new TreeDesc(s.dyn_dtree, static_d_desc);
  s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);

  s.bi_buf = 0;
  s.bi_valid = 0;

  /* Initialize the first block of the first file: */
  init_block(s);
};


/* ===========================================================================
 * Send a stored block
 */
const _tr_stored_block$1 = (s, buf, stored_len, last) => {
//DeflateState *s;
//charf *buf;       /* input block */
//ulg stored_len;   /* length of input block */
//int last;         /* one if this is the last block for a file */

  send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);    /* send block type */
  bi_windup(s);        /* align on byte boundary */
  put_short(s, stored_len);
  put_short(s, ~stored_len);
  if (stored_len) {
    s.pending_buf.set(s.window.subarray(buf, buf + stored_len), s.pending);
  }
  s.pending += stored_len;
};


/* ===========================================================================
 * Send one empty static block to give enough lookahead for inflate.
 * This takes 10 bits, of which 7 may remain in the bit buffer.
 */
const _tr_align$1 = (s) => {
  send_bits(s, STATIC_TREES << 1, 3);
  send_code(s, END_BLOCK, static_ltree);
  bi_flush(s);
};


/* ===========================================================================
 * Determine the best encoding for the current block: dynamic trees, static
 * trees or store, and write out the encoded block.
 */
const _tr_flush_block$1 = (s, buf, stored_len, last) => {
//DeflateState *s;
//charf *buf;       /* input block, or NULL if too old */
//ulg stored_len;   /* length of input block */
//int last;         /* one if this is the last block for a file */

  let opt_lenb, static_lenb;  /* opt_len and static_len in bytes */
  let max_blindex = 0;        /* index of last bit length code of non zero freq */

  /* Build the Huffman trees unless a stored block is forced */
  if (s.level > 0) {

    /* Check if the file is binary or text */
    if (s.strm.data_type === Z_UNKNOWN$1) {
      s.strm.data_type = detect_data_type(s);
    }

    /* Construct the literal and distance trees */
    build_tree(s, s.l_desc);
    // Tracev((stderr, "\nlit data: dyn %ld, stat %ld", s->opt_len,
    //        s->static_len));

    build_tree(s, s.d_desc);
    // Tracev((stderr, "\ndist data: dyn %ld, stat %ld", s->opt_len,
    //        s->static_len));
    /* At this point, opt_len and static_len are the total bit lengths of
     * the compressed block data, excluding the tree representations.
     */

    /* Build the bit length tree for the above two trees, and get the index
     * in bl_order of the last bit length code to send.
     */
    max_blindex = build_bl_tree(s);

    /* Determine the best encoding. Compute the block lengths in bytes. */
    opt_lenb = (s.opt_len + 3 + 7) >>> 3;
    static_lenb = (s.static_len + 3 + 7) >>> 3;

    // Tracev((stderr, "\nopt %lu(%lu) stat %lu(%lu) stored %lu lit %u ",
    //        opt_lenb, s->opt_len, static_lenb, s->static_len, stored_len,
    //        s->sym_next / 3));

    if (static_lenb <= opt_lenb) { opt_lenb = static_lenb; }

  } else {
    // Assert(buf != (char*)0, "lost buf");
    opt_lenb = static_lenb = stored_len + 5; /* force a stored block */
  }

  if ((stored_len + 4 <= opt_lenb) && (buf !== -1)) {
    /* 4: two words for the lengths */

    /* The test buf != NULL is only necessary if LIT_BUFSIZE > WSIZE.
     * Otherwise we can't have processed more than WSIZE input bytes since
     * the last block flush, because compression would have been
     * successful. If LIT_BUFSIZE <= WSIZE, it is never too late to
     * transform a block into a stored block.
     */
    _tr_stored_block$1(s, buf, stored_len, last);

  } else if (s.strategy === Z_FIXED$1 || static_lenb === opt_lenb) {

    send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
    compress_block(s, static_ltree, static_dtree);

  } else {
    send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
    send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
    compress_block(s, s.dyn_ltree, s.dyn_dtree);
  }
  // Assert (s->compressed_len == s->bits_sent, "bad compressed size");
  /* The above check is made mod 2^32, for files larger than 512 MB
   * and uLong implemented on 32 bits.
   */
  init_block(s);

  if (last) {
    bi_windup(s);
  }
  // Tracev((stderr,"\ncomprlen %lu(%lu) ", s->compressed_len>>3,
  //       s->compressed_len-7*last));
};

/* ===========================================================================
 * Save the match info and tally the frequency counts. Return true if
 * the current block must be flushed.
 */
const _tr_tally$1 = (s, dist, lc) => {
//    deflate_state *s;
//    unsigned dist;  /* distance of matched string */
//    unsigned lc;    /* match length-MIN_MATCH or unmatched char (if dist==0) */

  s.pending_buf[s.sym_buf + s.sym_next++] = dist;
  s.pending_buf[s.sym_buf + s.sym_next++] = dist >> 8;
  s.pending_buf[s.sym_buf + s.sym_next++] = lc;
  if (dist === 0) {
    /* lc is the unmatched char */
    s.dyn_ltree[lc * 2]/*.Freq*/++;
  } else {
    s.matches++;
    /* Here, lc is the match length - MIN_MATCH */
    dist--;             /* dist = match distance - 1 */
    //Assert((ush)dist < (ush)MAX_DIST(s) &&
    //       (ush)lc <= (ush)(MAX_MATCH-MIN_MATCH) &&
    //       (ush)d_code(dist) < (ush)D_CODES,  "_tr_tally: bad match");

    s.dyn_ltree[(_length_code[lc] + LITERALS$1 + 1) * 2]/*.Freq*/++;
    s.dyn_dtree[d_code(dist) * 2]/*.Freq*/++;
  }

  return (s.sym_next === s.sym_end);
};

var _tr_init_1  = _tr_init$1;
var _tr_stored_block_1 = _tr_stored_block$1;
var _tr_flush_block_1  = _tr_flush_block$1;
var _tr_tally_1 = _tr_tally$1;
var _tr_align_1 = _tr_align$1;

var trees = {
	_tr_init: _tr_init_1,
	_tr_stored_block: _tr_stored_block_1,
	_tr_flush_block: _tr_flush_block_1,
	_tr_tally: _tr_tally_1,
	_tr_align: _tr_align_1
};

// Note: adler32 takes 12% for level 0 and 2% for level 6.
// It isn't worth it to make additional optimizations as in original.
// Small size is preferable.

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

const adler32 = (adler, buf, len, pos) => {
  let s1 = (adler & 0xffff) |0,
      s2 = ((adler >>> 16) & 0xffff) |0,
      n = 0;

  while (len !== 0) {
    // Set limit ~ twice less than 5552, to keep
    // s2 in 31-bits, because we force signed ints.
    // in other case %= will fail.
    n = len > 2000 ? 2000 : len;
    len -= n;

    do {
      s1 = (s1 + buf[pos++]) |0;
      s2 = (s2 + s1) |0;
    } while (--n);

    s1 %= 65521;
    s2 %= 65521;
  }

  return (s1 | (s2 << 16)) |0;
};


var adler32_1 = adler32;

// Note: we can't get significant speed boost here.
// So write code to minimize size - no pregenerated tables
// and array tools dependencies.

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

// Use ordinary array, since untyped makes no boost here
const makeTable = () => {
  let c, table = [];

  for (var n = 0; n < 256; n++) {
    c = n;
    for (var k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    table[n] = c;
  }

  return table;
};

// Create table on load. Just 255 signed longs. Not a problem.
const crcTable = new Uint32Array(makeTable());


const crc32 = (crc, buf, len, pos) => {
  const t = crcTable;
  const end = pos + len;

  crc ^= -1;

  for (let i = pos; i < end; i++) {
    crc = (crc >>> 8) ^ t[(crc ^ buf[i]) & 0xFF];
  }

  return (crc ^ (-1)); // >>> 0;
};


var crc32_1 = crc32;

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

var messages = {
  2:      'need dictionary',     /* Z_NEED_DICT       2  */
  1:      'stream end',          /* Z_STREAM_END      1  */
  0:      '',                    /* Z_OK              0  */
  '-1':   'file error',          /* Z_ERRNO         (-1) */
  '-2':   'stream error',        /* Z_STREAM_ERROR  (-2) */
  '-3':   'data error',          /* Z_DATA_ERROR    (-3) */
  '-4':   'insufficient memory', /* Z_MEM_ERROR     (-4) */
  '-5':   'buffer error',        /* Z_BUF_ERROR     (-5) */
  '-6':   'incompatible version' /* Z_VERSION_ERROR (-6) */
};

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

var constants$2 = {

  /* Allowed flush values; see deflate() and inflate() below for details */
  Z_NO_FLUSH:         0,
  Z_PARTIAL_FLUSH:    1,
  Z_SYNC_FLUSH:       2,
  Z_FULL_FLUSH:       3,
  Z_FINISH:           4,
  Z_BLOCK:            5,
  Z_TREES:            6,

  /* Return codes for the compression/decompression functions. Negative values
  * are errors, positive values are used for special but normal events.
  */
  Z_OK:               0,
  Z_STREAM_END:       1,
  Z_NEED_DICT:        2,
  Z_ERRNO:           -1,
  Z_STREAM_ERROR:    -2,
  Z_DATA_ERROR:      -3,
  Z_MEM_ERROR:       -4,
  Z_BUF_ERROR:       -5,
  //Z_VERSION_ERROR: -6,

  /* compression levels */
  Z_NO_COMPRESSION:         0,
  Z_BEST_SPEED:             1,
  Z_BEST_COMPRESSION:       9,
  Z_DEFAULT_COMPRESSION:   -1,


  Z_FILTERED:               1,
  Z_HUFFMAN_ONLY:           2,
  Z_RLE:                    3,
  Z_FIXED:                  4,
  Z_DEFAULT_STRATEGY:       0,

  /* Possible values of the data_type field (though see inflate()) */
  Z_BINARY:                 0,
  Z_TEXT:                   1,
  //Z_ASCII:                1, // = Z_TEXT (deprecated)
  Z_UNKNOWN:                2,

  /* The deflate compression method */
  Z_DEFLATED:               8
  //Z_NULL:                 null // Use -1 or null inline, depending on var type
};

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

const { _tr_init, _tr_stored_block, _tr_flush_block, _tr_tally, _tr_align } = trees;




/* Public constants ==========================================================*/
/* ===========================================================================*/

const {
  Z_NO_FLUSH: Z_NO_FLUSH$2, Z_PARTIAL_FLUSH, Z_FULL_FLUSH: Z_FULL_FLUSH$1, Z_FINISH: Z_FINISH$3, Z_BLOCK: Z_BLOCK$1,
  Z_OK: Z_OK$3, Z_STREAM_END: Z_STREAM_END$3, Z_STREAM_ERROR: Z_STREAM_ERROR$2, Z_DATA_ERROR: Z_DATA_ERROR$2, Z_BUF_ERROR: Z_BUF_ERROR$1,
  Z_DEFAULT_COMPRESSION: Z_DEFAULT_COMPRESSION$1,
  Z_FILTERED, Z_HUFFMAN_ONLY, Z_RLE, Z_FIXED, Z_DEFAULT_STRATEGY: Z_DEFAULT_STRATEGY$1,
  Z_UNKNOWN,
  Z_DEFLATED: Z_DEFLATED$2
} = constants$2;

/*============================================================================*/


const MAX_MEM_LEVEL = 9;
/* Maximum value for memLevel in deflateInit2 */
const MAX_WBITS$1 = 15;
/* 32K LZ77 window */
const DEF_MEM_LEVEL = 8;


const LENGTH_CODES  = 29;
/* number of length codes, not counting the special END_BLOCK code */
const LITERALS      = 256;
/* number of literal bytes 0..255 */
const L_CODES       = LITERALS + 1 + LENGTH_CODES;
/* number of Literal or Length codes, including the END_BLOCK code */
const D_CODES       = 30;
/* number of distance codes */
const BL_CODES      = 19;
/* number of codes used to transfer the bit lengths */
const HEAP_SIZE     = 2 * L_CODES + 1;
/* maximum heap size */
const MAX_BITS  = 15;
/* All codes must not exceed MAX_BITS bits */

const MIN_MATCH = 3;
const MAX_MATCH = 258;
const MIN_LOOKAHEAD = (MAX_MATCH + MIN_MATCH + 1);

const PRESET_DICT = 0x20;

const INIT_STATE    =  42;    /* zlib header -> BUSY_STATE */
//#ifdef GZIP
const GZIP_STATE    =  57;    /* gzip header -> BUSY_STATE | EXTRA_STATE */
//#endif
const EXTRA_STATE   =  69;    /* gzip extra block -> NAME_STATE */
const NAME_STATE    =  73;    /* gzip file name -> COMMENT_STATE */
const COMMENT_STATE =  91;    /* gzip comment -> HCRC_STATE */
const HCRC_STATE    = 103;    /* gzip header CRC -> BUSY_STATE */
const BUSY_STATE    = 113;    /* deflate -> FINISH_STATE */
const FINISH_STATE  = 666;    /* stream complete */

const BS_NEED_MORE      = 1; /* block not completed, need more input or more output */
const BS_BLOCK_DONE     = 2; /* block flush performed */
const BS_FINISH_STARTED = 3; /* finish started, need only more output at next deflate */
const BS_FINISH_DONE    = 4; /* finish done, accept no more input or output */

const OS_CODE = 0x03; // Unix :) . Don't detect, use this default.

const err = (strm, errorCode) => {
  strm.msg = messages[errorCode];
  return errorCode;
};

const rank = (f) => {
  return ((f) * 2) - ((f) > 4 ? 9 : 0);
};

const zero = (buf) => {
  let len = buf.length; while (--len >= 0) { buf[len] = 0; }
};

/* ===========================================================================
 * Slide the hash table when sliding the window down (could be avoided with 32
 * bit values at the expense of memory usage). We slide even when level == 0 to
 * keep the hash table consistent if we switch back to level > 0 later.
 */
const slide_hash = (s) => {
  let n, m;
  let p;
  let wsize = s.w_size;

  n = s.hash_size;
  p = n;
  do {
    m = s.head[--p];
    s.head[p] = (m >= wsize ? m - wsize : 0);
  } while (--n);
  n = wsize;
//#ifndef FASTEST
  p = n;
  do {
    m = s.prev[--p];
    s.prev[p] = (m >= wsize ? m - wsize : 0);
    /* If n is not on any hash chain, prev[n] is garbage but
     * its value will never be used.
     */
  } while (--n);
//#endif
};

/* eslint-disable new-cap */
let HASH_ZLIB = (s, prev, data) => ((prev << s.hash_shift) ^ data) & s.hash_mask;
// This hash causes less collisions, https://github.com/nodeca/pako/issues/135
// But breaks binary compatibility
//let HASH_FAST = (s, prev, data) => ((prev << 8) + (prev >> 8) + (data << 4)) & s.hash_mask;
let HASH = HASH_ZLIB;


/* =========================================================================
 * Flush as much pending output as possible. All deflate() output, except for
 * some deflate_stored() output, goes through this function so some
 * applications may wish to modify it to avoid allocating a large
 * strm->next_out buffer and copying into it. (See also read_buf()).
 */
const flush_pending = (strm) => {
  const s = strm.state;

  //_tr_flush_bits(s);
  let len = s.pending;
  if (len > strm.avail_out) {
    len = strm.avail_out;
  }
  if (len === 0) { return; }

  strm.output.set(s.pending_buf.subarray(s.pending_out, s.pending_out + len), strm.next_out);
  strm.next_out  += len;
  s.pending_out  += len;
  strm.total_out += len;
  strm.avail_out -= len;
  s.pending      -= len;
  if (s.pending === 0) {
    s.pending_out = 0;
  }
};


const flush_block_only = (s, last) => {
  _tr_flush_block(s, (s.block_start >= 0 ? s.block_start : -1), s.strstart - s.block_start, last);
  s.block_start = s.strstart;
  flush_pending(s.strm);
};


const put_byte = (s, b) => {
  s.pending_buf[s.pending++] = b;
};


/* =========================================================================
 * Put a short in the pending buffer. The 16-bit value is put in MSB order.
 * IN assertion: the stream state is correct and there is enough room in
 * pending_buf.
 */
const putShortMSB = (s, b) => {

  //  put_byte(s, (Byte)(b >> 8));
//  put_byte(s, (Byte)(b & 0xff));
  s.pending_buf[s.pending++] = (b >>> 8) & 0xff;
  s.pending_buf[s.pending++] = b & 0xff;
};


/* ===========================================================================
 * Read a new buffer from the current input stream, update the adler32
 * and total number of bytes read.  All deflate() input goes through
 * this function so some applications may wish to modify it to avoid
 * allocating a large strm->input buffer and copying from it.
 * (See also flush_pending()).
 */
const read_buf = (strm, buf, start, size) => {

  let len = strm.avail_in;

  if (len > size) { len = size; }
  if (len === 0) { return 0; }

  strm.avail_in -= len;

  // zmemcpy(buf, strm->next_in, len);
  buf.set(strm.input.subarray(strm.next_in, strm.next_in + len), start);
  if (strm.state.wrap === 1) {
    strm.adler = adler32_1(strm.adler, buf, len, start);
  }

  else if (strm.state.wrap === 2) {
    strm.adler = crc32_1(strm.adler, buf, len, start);
  }

  strm.next_in += len;
  strm.total_in += len;

  return len;
};


/* ===========================================================================
 * Set match_start to the longest match starting at the given string and
 * return its length. Matches shorter or equal to prev_length are discarded,
 * in which case the result is equal to prev_length and match_start is
 * garbage.
 * IN assertions: cur_match is the head of the hash chain for the current
 *   string (strstart) and its distance is <= MAX_DIST, and prev_length >= 1
 * OUT assertion: the match length is not greater than s->lookahead.
 */
const longest_match = (s, cur_match) => {

  let chain_length = s.max_chain_length;      /* max hash chain length */
  let scan = s.strstart; /* current string */
  let match;                       /* matched string */
  let len;                           /* length of current match */
  let best_len = s.prev_length;              /* best match length so far */
  let nice_match = s.nice_match;             /* stop if match long enough */
  const limit = (s.strstart > (s.w_size - MIN_LOOKAHEAD)) ?
      s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0/*NIL*/;

  const _win = s.window; // shortcut

  const wmask = s.w_mask;
  const prev  = s.prev;

  /* Stop when cur_match becomes <= limit. To simplify the code,
   * we prevent matches with the string of window index 0.
   */

  const strend = s.strstart + MAX_MATCH;
  let scan_end1  = _win[scan + best_len - 1];
  let scan_end   = _win[scan + best_len];

  /* The code is optimized for HASH_BITS >= 8 and MAX_MATCH-2 multiple of 16.
   * It is easy to get rid of this optimization if necessary.
   */
  // Assert(s->hash_bits >= 8 && MAX_MATCH == 258, "Code too clever");

  /* Do not waste too much time if we already have a good match: */
  if (s.prev_length >= s.good_match) {
    chain_length >>= 2;
  }
  /* Do not look for matches beyond the end of the input. This is necessary
   * to make deflate deterministic.
   */
  if (nice_match > s.lookahead) { nice_match = s.lookahead; }

  // Assert((ulg)s->strstart <= s->window_size-MIN_LOOKAHEAD, "need lookahead");

  do {
    // Assert(cur_match < s->strstart, "no future");
    match = cur_match;

    /* Skip to next match if the match length cannot increase
     * or if the match length is less than 2.  Note that the checks below
     * for insufficient lookahead only occur occasionally for performance
     * reasons.  Therefore uninitialized memory will be accessed, and
     * conditional jumps will be made that depend on those values.
     * However the length of the match is limited to the lookahead, so
     * the output of deflate is not affected by the uninitialized values.
     */

    if (_win[match + best_len]     !== scan_end  ||
        _win[match + best_len - 1] !== scan_end1 ||
        _win[match]                !== _win[scan] ||
        _win[++match]              !== _win[scan + 1]) {
      continue;
    }

    /* The check at best_len-1 can be removed because it will be made
     * again later. (This heuristic is not always a win.)
     * It is not necessary to compare scan[2] and match[2] since they
     * are always equal when the other bytes match, given that
     * the hash keys are equal and that HASH_BITS >= 8.
     */
    scan += 2;
    match++;
    // Assert(*scan == *match, "match[2]?");

    /* We check for insufficient lookahead only every 8th comparison;
     * the 256th check will be made at strstart+258.
     */
    do {
      /*jshint noempty:false*/
    } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             scan < strend);

    // Assert(scan <= s->window+(unsigned)(s->window_size-1), "wild scan");

    len = MAX_MATCH - (strend - scan);
    scan = strend - MAX_MATCH;

    if (len > best_len) {
      s.match_start = cur_match;
      best_len = len;
      if (len >= nice_match) {
        break;
      }
      scan_end1  = _win[scan + best_len - 1];
      scan_end   = _win[scan + best_len];
    }
  } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);

  if (best_len <= s.lookahead) {
    return best_len;
  }
  return s.lookahead;
};


/* ===========================================================================
 * Fill the window when the lookahead becomes insufficient.
 * Updates strstart and lookahead.
 *
 * IN assertion: lookahead < MIN_LOOKAHEAD
 * OUT assertions: strstart <= window_size-MIN_LOOKAHEAD
 *    At least one byte has been read, or avail_in == 0; reads are
 *    performed for at least two bytes (required for the zip translate_eol
 *    option -- not supported here).
 */
const fill_window = (s) => {

  const _w_size = s.w_size;
  let n, more, str;

  //Assert(s->lookahead < MIN_LOOKAHEAD, "already enough lookahead");

  do {
    more = s.window_size - s.lookahead - s.strstart;

    // JS ints have 32 bit, block below not needed
    /* Deal with !@#$% 64K limit: */
    //if (sizeof(int) <= 2) {
    //    if (more == 0 && s->strstart == 0 && s->lookahead == 0) {
    //        more = wsize;
    //
    //  } else if (more == (unsigned)(-1)) {
    //        /* Very unlikely, but possible on 16 bit machine if
    //         * strstart == 0 && lookahead == 1 (input done a byte at time)
    //         */
    //        more--;
    //    }
    //}


    /* If the window is almost full and there is insufficient lookahead,
     * move the upper half to the lower one to make room in the upper half.
     */
    if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {

      s.window.set(s.window.subarray(_w_size, _w_size + _w_size - more), 0);
      s.match_start -= _w_size;
      s.strstart -= _w_size;
      /* we now have strstart >= MAX_DIST */
      s.block_start -= _w_size;
      if (s.insert > s.strstart) {
        s.insert = s.strstart;
      }
      slide_hash(s);
      more += _w_size;
    }
    if (s.strm.avail_in === 0) {
      break;
    }

    /* If there was no sliding:
     *    strstart <= WSIZE+MAX_DIST-1 && lookahead <= MIN_LOOKAHEAD - 1 &&
     *    more == window_size - lookahead - strstart
     * => more >= window_size - (MIN_LOOKAHEAD-1 + WSIZE + MAX_DIST-1)
     * => more >= window_size - 2*WSIZE + 2
     * In the BIG_MEM or MMAP case (not yet supported),
     *   window_size == input_size + MIN_LOOKAHEAD  &&
     *   strstart + s->lookahead <= input_size => more >= MIN_LOOKAHEAD.
     * Otherwise, window_size == 2*WSIZE so more >= 2.
     * If there was sliding, more >= WSIZE. So in all cases, more >= 2.
     */
    //Assert(more >= 2, "more < 2");
    n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
    s.lookahead += n;

    /* Initialize the hash value now that we have some input: */
    if (s.lookahead + s.insert >= MIN_MATCH) {
      str = s.strstart - s.insert;
      s.ins_h = s.window[str];

      /* UPDATE_HASH(s, s->ins_h, s->window[str + 1]); */
      s.ins_h = HASH(s, s.ins_h, s.window[str + 1]);
//#if MIN_MATCH != 3
//        Call update_hash() MIN_MATCH-3 more times
//#endif
      while (s.insert) {
        /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */
        s.ins_h = HASH(s, s.ins_h, s.window[str + MIN_MATCH - 1]);

        s.prev[str & s.w_mask] = s.head[s.ins_h];
        s.head[s.ins_h] = str;
        str++;
        s.insert--;
        if (s.lookahead + s.insert < MIN_MATCH) {
          break;
        }
      }
    }
    /* If the whole input has less than MIN_MATCH bytes, ins_h is garbage,
     * but this is not important since only literal bytes will be emitted.
     */

  } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);

  /* If the WIN_INIT bytes after the end of the current data have never been
   * written, then zero those bytes in order to avoid memory check reports of
   * the use of uninitialized (or uninitialised as Julian writes) bytes by
   * the longest match routines.  Update the high water mark for the next
   * time through here.  WIN_INIT is set to MAX_MATCH since the longest match
   * routines allow scanning to strstart + MAX_MATCH, ignoring lookahead.
   */
//  if (s.high_water < s.window_size) {
//    const curr = s.strstart + s.lookahead;
//    let init = 0;
//
//    if (s.high_water < curr) {
//      /* Previous high water mark below current data -- zero WIN_INIT
//       * bytes or up to end of window, whichever is less.
//       */
//      init = s.window_size - curr;
//      if (init > WIN_INIT)
//        init = WIN_INIT;
//      zmemzero(s->window + curr, (unsigned)init);
//      s->high_water = curr + init;
//    }
//    else if (s->high_water < (ulg)curr + WIN_INIT) {
//      /* High water mark at or above current data, but below current data
//       * plus WIN_INIT -- zero out to current data plus WIN_INIT, or up
//       * to end of window, whichever is less.
//       */
//      init = (ulg)curr + WIN_INIT - s->high_water;
//      if (init > s->window_size - s->high_water)
//        init = s->window_size - s->high_water;
//      zmemzero(s->window + s->high_water, (unsigned)init);
//      s->high_water += init;
//    }
//  }
//
//  Assert((ulg)s->strstart <= s->window_size - MIN_LOOKAHEAD,
//    "not enough room for search");
};

/* ===========================================================================
 * Copy without compression as much as possible from the input stream, return
 * the current block state.
 *
 * In case deflateParams() is used to later switch to a non-zero compression
 * level, s->matches (otherwise unused when storing) keeps track of the number
 * of hash table slides to perform. If s->matches is 1, then one hash table
 * slide will be done when switching. If s->matches is 2, the maximum value
 * allowed here, then the hash table will be cleared, since two or more slides
 * is the same as a clear.
 *
 * deflate_stored() is written to minimize the number of times an input byte is
 * copied. It is most efficient with large input and output buffers, which
 * maximizes the opportunites to have a single copy from next_in to next_out.
 */
const deflate_stored = (s, flush) => {

  /* Smallest worthy block size when not flushing or finishing. By default
   * this is 32K. This can be as small as 507 bytes for memLevel == 1. For
   * large input and output buffers, the stored block size will be larger.
   */
  let min_block = s.pending_buf_size - 5 > s.w_size ? s.w_size : s.pending_buf_size - 5;

  /* Copy as many min_block or larger stored blocks directly to next_out as
   * possible. If flushing, copy the remaining available input to next_out as
   * stored blocks, if there is enough space.
   */
  let len, left, have, last = 0;
  let used = s.strm.avail_in;
  do {
    /* Set len to the maximum size block that we can copy directly with the
     * available input data and output space. Set left to how much of that
     * would be copied from what's left in the window.
     */
    len = 65535/* MAX_STORED */;     /* maximum deflate stored block length */
    have = (s.bi_valid + 42) >> 3;     /* number of header bytes */
    if (s.strm.avail_out < have) {         /* need room for header */
      break;
    }
      /* maximum stored block length that will fit in avail_out: */
    have = s.strm.avail_out - have;
    left = s.strstart - s.block_start;  /* bytes left in window */
    if (len > left + s.strm.avail_in) {
      len = left + s.strm.avail_in;   /* limit len to the input */
    }
    if (len > have) {
      len = have;             /* limit len to the output */
    }

    /* If the stored block would be less than min_block in length, or if
     * unable to copy all of the available input when flushing, then try
     * copying to the window and the pending buffer instead. Also don't
     * write an empty block when flushing -- deflate() does that.
     */
    if (len < min_block && ((len === 0 && flush !== Z_FINISH$3) ||
                        flush === Z_NO_FLUSH$2 ||
                        len !== left + s.strm.avail_in)) {
      break;
    }

    /* Make a dummy stored block in pending to get the header bytes,
     * including any pending bits. This also updates the debugging counts.
     */
    last = flush === Z_FINISH$3 && len === left + s.strm.avail_in ? 1 : 0;
    _tr_stored_block(s, 0, 0, last);

    /* Replace the lengths in the dummy stored block with len. */
    s.pending_buf[s.pending - 4] = len;
    s.pending_buf[s.pending - 3] = len >> 8;
    s.pending_buf[s.pending - 2] = ~len;
    s.pending_buf[s.pending - 1] = ~len >> 8;

    /* Write the stored block header bytes. */
    flush_pending(s.strm);

//#ifdef ZLIB_DEBUG
//    /* Update debugging counts for the data about to be copied. */
//    s->compressed_len += len << 3;
//    s->bits_sent += len << 3;
//#endif

    /* Copy uncompressed bytes from the window to next_out. */
    if (left) {
      if (left > len) {
        left = len;
      }
      //zmemcpy(s->strm->next_out, s->window + s->block_start, left);
      s.strm.output.set(s.window.subarray(s.block_start, s.block_start + left), s.strm.next_out);
      s.strm.next_out += left;
      s.strm.avail_out -= left;
      s.strm.total_out += left;
      s.block_start += left;
      len -= left;
    }

    /* Copy uncompressed bytes directly from next_in to next_out, updating
     * the check value.
     */
    if (len) {
      read_buf(s.strm, s.strm.output, s.strm.next_out, len);
      s.strm.next_out += len;
      s.strm.avail_out -= len;
      s.strm.total_out += len;
    }
  } while (last === 0);

  /* Update the sliding window with the last s->w_size bytes of the copied
   * data, or append all of the copied data to the existing window if less
   * than s->w_size bytes were copied. Also update the number of bytes to
   * insert in the hash tables, in the event that deflateParams() switches to
   * a non-zero compression level.
   */
  used -= s.strm.avail_in;    /* number of input bytes directly copied */
  if (used) {
    /* If any input was used, then no unused input remains in the window,
     * therefore s->block_start == s->strstart.
     */
    if (used >= s.w_size) {  /* supplant the previous history */
      s.matches = 2;     /* clear hash */
      //zmemcpy(s->window, s->strm->next_in - s->w_size, s->w_size);
      s.window.set(s.strm.input.subarray(s.strm.next_in - s.w_size, s.strm.next_in), 0);
      s.strstart = s.w_size;
      s.insert = s.strstart;
    }
    else {
      if (s.window_size - s.strstart <= used) {
        /* Slide the window down. */
        s.strstart -= s.w_size;
        //zmemcpy(s->window, s->window + s->w_size, s->strstart);
        s.window.set(s.window.subarray(s.w_size, s.w_size + s.strstart), 0);
        if (s.matches < 2) {
          s.matches++;   /* add a pending slide_hash() */
        }
        if (s.insert > s.strstart) {
          s.insert = s.strstart;
        }
      }
      //zmemcpy(s->window + s->strstart, s->strm->next_in - used, used);
      s.window.set(s.strm.input.subarray(s.strm.next_in - used, s.strm.next_in), s.strstart);
      s.strstart += used;
      s.insert += used > s.w_size - s.insert ? s.w_size - s.insert : used;
    }
    s.block_start = s.strstart;
  }
  if (s.high_water < s.strstart) {
    s.high_water = s.strstart;
  }

  /* If the last block was written to next_out, then done. */
  if (last) {
    return BS_FINISH_DONE;
  }

  /* If flushing and all input has been consumed, then done. */
  if (flush !== Z_NO_FLUSH$2 && flush !== Z_FINISH$3 &&
    s.strm.avail_in === 0 && s.strstart === s.block_start) {
    return BS_BLOCK_DONE;
  }

  /* Fill the window with any remaining input. */
  have = s.window_size - s.strstart;
  if (s.strm.avail_in > have && s.block_start >= s.w_size) {
    /* Slide the window down. */
    s.block_start -= s.w_size;
    s.strstart -= s.w_size;
    //zmemcpy(s->window, s->window + s->w_size, s->strstart);
    s.window.set(s.window.subarray(s.w_size, s.w_size + s.strstart), 0);
    if (s.matches < 2) {
      s.matches++;       /* add a pending slide_hash() */
    }
    have += s.w_size;      /* more space now */
    if (s.insert > s.strstart) {
      s.insert = s.strstart;
    }
  }
  if (have > s.strm.avail_in) {
    have = s.strm.avail_in;
  }
  if (have) {
    read_buf(s.strm, s.window, s.strstart, have);
    s.strstart += have;
    s.insert += have > s.w_size - s.insert ? s.w_size - s.insert : have;
  }
  if (s.high_water < s.strstart) {
    s.high_water = s.strstart;
  }

  /* There was not enough avail_out to write a complete worthy or flushed
   * stored block to next_out. Write a stored block to pending instead, if we
   * have enough input for a worthy block, or if flushing and there is enough
   * room for the remaining input as a stored block in the pending buffer.
   */
  have = (s.bi_valid + 42) >> 3;     /* number of header bytes */
    /* maximum stored block length that will fit in pending: */
  have = s.pending_buf_size - have > 65535/* MAX_STORED */ ? 65535/* MAX_STORED */ : s.pending_buf_size - have;
  min_block = have > s.w_size ? s.w_size : have;
  left = s.strstart - s.block_start;
  if (left >= min_block ||
     ((left || flush === Z_FINISH$3) && flush !== Z_NO_FLUSH$2 &&
     s.strm.avail_in === 0 && left <= have)) {
    len = left > have ? have : left;
    last = flush === Z_FINISH$3 && s.strm.avail_in === 0 &&
         len === left ? 1 : 0;
    _tr_stored_block(s, s.block_start, len, last);
    s.block_start += len;
    flush_pending(s.strm);
  }

  /* We've done all we can with the available input and output. */
  return last ? BS_FINISH_STARTED : BS_NEED_MORE;
};


/* ===========================================================================
 * Compress as much as possible from the input stream, return the current
 * block state.
 * This function does not perform lazy evaluation of matches and inserts
 * new strings in the dictionary only for unmatched strings or for short
 * matches. It is used only for the fast compression options.
 */
const deflate_fast = (s, flush) => {

  let hash_head;        /* head of the hash chain */
  let bflush;           /* set if current block must be flushed */

  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the next match, plus MIN_MATCH bytes to insert the
     * string following the next match.
     */
    if (s.lookahead < MIN_LOOKAHEAD) {
      fill_window(s);
      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH$2) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) {
        break; /* flush the current block */
      }
    }

    /* Insert the string window[strstart .. strstart+2] in the
     * dictionary, and set hash_head to the head of the hash chain:
     */
    hash_head = 0/*NIL*/;
    if (s.lookahead >= MIN_MATCH) {
      /*** INSERT_STRING(s, s.strstart, hash_head); ***/
      s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
      s.head[s.ins_h] = s.strstart;
      /***/
    }

    /* Find the longest match, discarding those <= prev_length.
     * At this point we have always match_length < MIN_MATCH
     */
    if (hash_head !== 0/*NIL*/ && ((s.strstart - hash_head) <= (s.w_size - MIN_LOOKAHEAD))) {
      /* To simplify the code, we prevent matches with the string
       * of window index 0 (in particular we have to avoid a match
       * of the string with itself at the start of the input file).
       */
      s.match_length = longest_match(s, hash_head);
      /* longest_match() sets match_start */
    }
    if (s.match_length >= MIN_MATCH) {
      // check_match(s, s.strstart, s.match_start, s.match_length); // for debug only

      /*** _tr_tally_dist(s, s.strstart - s.match_start,
                     s.match_length - MIN_MATCH, bflush); ***/
      bflush = _tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);

      s.lookahead -= s.match_length;

      /* Insert new strings in the hash table only if the match length
       * is not too large. This saves time but degrades compression.
       */
      if (s.match_length <= s.max_lazy_match/*max_insert_length*/ && s.lookahead >= MIN_MATCH) {
        s.match_length--; /* string at strstart already in table */
        do {
          s.strstart++;
          /*** INSERT_STRING(s, s.strstart, hash_head); ***/
          s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
          /***/
          /* strstart never exceeds WSIZE-MAX_MATCH, so there are
           * always MIN_MATCH bytes ahead.
           */
        } while (--s.match_length !== 0);
        s.strstart++;
      } else
      {
        s.strstart += s.match_length;
        s.match_length = 0;
        s.ins_h = s.window[s.strstart];
        /* UPDATE_HASH(s, s.ins_h, s.window[s.strstart+1]); */
        s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + 1]);

//#if MIN_MATCH != 3
//                Call UPDATE_HASH() MIN_MATCH-3 more times
//#endif
        /* If lookahead < MIN_MATCH, ins_h is garbage, but it does not
         * matter since it will be recomputed at next deflate call.
         */
      }
    } else {
      /* No match, output a literal byte */
      //Tracevv((stderr,"%c", s.window[s.strstart]));
      /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
      bflush = _tr_tally(s, 0, s.window[s.strstart]);

      s.lookahead--;
      s.strstart++;
    }
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = ((s.strstart < (MIN_MATCH - 1)) ? s.strstart : MIN_MATCH - 1);
  if (flush === Z_FINISH$3) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.sym_next) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
};

/* ===========================================================================
 * Same as above, but achieves better compression. We use a lazy
 * evaluation for matches: a match is finally adopted only if there is
 * no better match at the next window position.
 */
const deflate_slow = (s, flush) => {

  let hash_head;          /* head of hash chain */
  let bflush;              /* set if current block must be flushed */

  let max_insert;

  /* Process the input block. */
  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the next match, plus MIN_MATCH bytes to insert the
     * string following the next match.
     */
    if (s.lookahead < MIN_LOOKAHEAD) {
      fill_window(s);
      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH$2) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) { break; } /* flush the current block */
    }

    /* Insert the string window[strstart .. strstart+2] in the
     * dictionary, and set hash_head to the head of the hash chain:
     */
    hash_head = 0/*NIL*/;
    if (s.lookahead >= MIN_MATCH) {
      /*** INSERT_STRING(s, s.strstart, hash_head); ***/
      s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
      s.head[s.ins_h] = s.strstart;
      /***/
    }

    /* Find the longest match, discarding those <= prev_length.
     */
    s.prev_length = s.match_length;
    s.prev_match = s.match_start;
    s.match_length = MIN_MATCH - 1;

    if (hash_head !== 0/*NIL*/ && s.prev_length < s.max_lazy_match &&
        s.strstart - hash_head <= (s.w_size - MIN_LOOKAHEAD)/*MAX_DIST(s)*/) {
      /* To simplify the code, we prevent matches with the string
       * of window index 0 (in particular we have to avoid a match
       * of the string with itself at the start of the input file).
       */
      s.match_length = longest_match(s, hash_head);
      /* longest_match() sets match_start */

      if (s.match_length <= 5 &&
         (s.strategy === Z_FILTERED || (s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096/*TOO_FAR*/))) {

        /* If prev_match is also MIN_MATCH, match_start is garbage
         * but we will ignore the current match anyway.
         */
        s.match_length = MIN_MATCH - 1;
      }
    }
    /* If there was a match at the previous step and the current
     * match is not better, output the previous match:
     */
    if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
      max_insert = s.strstart + s.lookahead - MIN_MATCH;
      /* Do not insert strings in hash table beyond this. */

      //check_match(s, s.strstart-1, s.prev_match, s.prev_length);

      /***_tr_tally_dist(s, s.strstart - 1 - s.prev_match,
                     s.prev_length - MIN_MATCH, bflush);***/
      bflush = _tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
      /* Insert in hash table all strings up to the end of the match.
       * strstart-1 and strstart are already inserted. If there is not
       * enough lookahead, the last two strings are not inserted in
       * the hash table.
       */
      s.lookahead -= s.prev_length - 1;
      s.prev_length -= 2;
      do {
        if (++s.strstart <= max_insert) {
          /*** INSERT_STRING(s, s.strstart, hash_head); ***/
          s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
          /***/
        }
      } while (--s.prev_length !== 0);
      s.match_available = 0;
      s.match_length = MIN_MATCH - 1;
      s.strstart++;

      if (bflush) {
        /*** FLUSH_BLOCK(s, 0); ***/
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
        /***/
      }

    } else if (s.match_available) {
      /* If there was no match at the previous position, output a
       * single literal. If there was a match but the current match
       * is longer, truncate the previous match to a single literal.
       */
      //Tracevv((stderr,"%c", s->window[s->strstart-1]));
      /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
      bflush = _tr_tally(s, 0, s.window[s.strstart - 1]);

      if (bflush) {
        /*** FLUSH_BLOCK_ONLY(s, 0) ***/
        flush_block_only(s, false);
        /***/
      }
      s.strstart++;
      s.lookahead--;
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    } else {
      /* There is no previous match to compare with, wait for
       * the next step to decide.
       */
      s.match_available = 1;
      s.strstart++;
      s.lookahead--;
    }
  }
  //Assert (flush != Z_NO_FLUSH, "no flush?");
  if (s.match_available) {
    //Tracevv((stderr,"%c", s->window[s->strstart-1]));
    /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
    bflush = _tr_tally(s, 0, s.window[s.strstart - 1]);

    s.match_available = 0;
  }
  s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
  if (flush === Z_FINISH$3) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.sym_next) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }

  return BS_BLOCK_DONE;
};


/* ===========================================================================
 * For Z_RLE, simply look for runs of bytes, generate matches only of distance
 * one.  Do not maintain a hash table.  (It will be regenerated if this run of
 * deflate switches away from Z_RLE.)
 */
const deflate_rle = (s, flush) => {

  let bflush;            /* set if current block must be flushed */
  let prev;              /* byte at distance one to match */
  let scan, strend;      /* scan goes up to strend for length of run */

  const _win = s.window;

  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the longest run, plus one for the unrolled loop.
     */
    if (s.lookahead <= MAX_MATCH) {
      fill_window(s);
      if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH$2) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) { break; } /* flush the current block */
    }

    /* See how many times the previous byte repeats */
    s.match_length = 0;
    if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
      scan = s.strstart - 1;
      prev = _win[scan];
      if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
        strend = s.strstart + MAX_MATCH;
        do {
          /*jshint noempty:false*/
        } while (prev === _win[++scan] && prev === _win[++scan] &&
                 prev === _win[++scan] && prev === _win[++scan] &&
                 prev === _win[++scan] && prev === _win[++scan] &&
                 prev === _win[++scan] && prev === _win[++scan] &&
                 scan < strend);
        s.match_length = MAX_MATCH - (strend - scan);
        if (s.match_length > s.lookahead) {
          s.match_length = s.lookahead;
        }
      }
      //Assert(scan <= s->window+(uInt)(s->window_size-1), "wild scan");
    }

    /* Emit match if have run of MIN_MATCH or longer, else emit literal */
    if (s.match_length >= MIN_MATCH) {
      //check_match(s, s.strstart, s.strstart - 1, s.match_length);

      /*** _tr_tally_dist(s, 1, s.match_length - MIN_MATCH, bflush); ***/
      bflush = _tr_tally(s, 1, s.match_length - MIN_MATCH);

      s.lookahead -= s.match_length;
      s.strstart += s.match_length;
      s.match_length = 0;
    } else {
      /* No match, output a literal byte */
      //Tracevv((stderr,"%c", s->window[s->strstart]));
      /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
      bflush = _tr_tally(s, 0, s.window[s.strstart]);

      s.lookahead--;
      s.strstart++;
    }
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = 0;
  if (flush === Z_FINISH$3) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.sym_next) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
};

/* ===========================================================================
 * For Z_HUFFMAN_ONLY, do not look for matches.  Do not maintain a hash table.
 * (It will be regenerated if this run of deflate switches away from Huffman.)
 */
const deflate_huff = (s, flush) => {

  let bflush;             /* set if current block must be flushed */

  for (;;) {
    /* Make sure that we have a literal to write. */
    if (s.lookahead === 0) {
      fill_window(s);
      if (s.lookahead === 0) {
        if (flush === Z_NO_FLUSH$2) {
          return BS_NEED_MORE;
        }
        break;      /* flush the current block */
      }
    }

    /* Output a literal byte */
    s.match_length = 0;
    //Tracevv((stderr,"%c", s->window[s->strstart]));
    /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
    bflush = _tr_tally(s, 0, s.window[s.strstart]);
    s.lookahead--;
    s.strstart++;
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = 0;
  if (flush === Z_FINISH$3) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.sym_next) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
};

/* Values for max_lazy_match, good_match and max_chain_length, depending on
 * the desired pack level (0..9). The values given below have been tuned to
 * exclude worst case performance for pathological files. Better values may be
 * found for specific files.
 */
function Config(good_length, max_lazy, nice_length, max_chain, func) {

  this.good_length = good_length;
  this.max_lazy = max_lazy;
  this.nice_length = nice_length;
  this.max_chain = max_chain;
  this.func = func;
}

const configuration_table = [
  /*      good lazy nice chain */
  new Config(0, 0, 0, 0, deflate_stored),          /* 0 store only */
  new Config(4, 4, 8, 4, deflate_fast),            /* 1 max speed, no lazy matches */
  new Config(4, 5, 16, 8, deflate_fast),           /* 2 */
  new Config(4, 6, 32, 32, deflate_fast),          /* 3 */

  new Config(4, 4, 16, 16, deflate_slow),          /* 4 lazy matches */
  new Config(8, 16, 32, 32, deflate_slow),         /* 5 */
  new Config(8, 16, 128, 128, deflate_slow),       /* 6 */
  new Config(8, 32, 128, 256, deflate_slow),       /* 7 */
  new Config(32, 128, 258, 1024, deflate_slow),    /* 8 */
  new Config(32, 258, 258, 4096, deflate_slow)     /* 9 max compression */
];


/* ===========================================================================
 * Initialize the "longest match" routines for a new zlib stream
 */
const lm_init = (s) => {

  s.window_size = 2 * s.w_size;

  /*** CLEAR_HASH(s); ***/
  zero(s.head); // Fill with NIL (= 0);

  /* Set the default configuration parameters:
   */
  s.max_lazy_match = configuration_table[s.level].max_lazy;
  s.good_match = configuration_table[s.level].good_length;
  s.nice_match = configuration_table[s.level].nice_length;
  s.max_chain_length = configuration_table[s.level].max_chain;

  s.strstart = 0;
  s.block_start = 0;
  s.lookahead = 0;
  s.insert = 0;
  s.match_length = s.prev_length = MIN_MATCH - 1;
  s.match_available = 0;
  s.ins_h = 0;
};


function DeflateState() {
  this.strm = null;            /* pointer back to this zlib stream */
  this.status = 0;            /* as the name implies */
  this.pending_buf = null;      /* output still pending */
  this.pending_buf_size = 0;  /* size of pending_buf */
  this.pending_out = 0;       /* next pending byte to output to the stream */
  this.pending = 0;           /* nb of bytes in the pending buffer */
  this.wrap = 0;              /* bit 0 true for zlib, bit 1 true for gzip */
  this.gzhead = null;         /* gzip header information to write */
  this.gzindex = 0;           /* where in extra, name, or comment */
  this.method = Z_DEFLATED$2; /* can only be DEFLATED */
  this.last_flush = -1;   /* value of flush param for previous deflate call */

  this.w_size = 0;  /* LZ77 window size (32K by default) */
  this.w_bits = 0;  /* log2(w_size)  (8..16) */
  this.w_mask = 0;  /* w_size - 1 */

  this.window = null;
  /* Sliding window. Input bytes are read into the second half of the window,
   * and move to the first half later to keep a dictionary of at least wSize
   * bytes. With this organization, matches are limited to a distance of
   * wSize-MAX_MATCH bytes, but this ensures that IO is always
   * performed with a length multiple of the block size.
   */

  this.window_size = 0;
  /* Actual size of window: 2*wSize, except when the user input buffer
   * is directly used as sliding window.
   */

  this.prev = null;
  /* Link to older string with same hash index. To limit the size of this
   * array to 64K, this link is maintained only for the last 32K strings.
   * An index in this array is thus a window index modulo 32K.
   */

  this.head = null;   /* Heads of the hash chains or NIL. */

  this.ins_h = 0;       /* hash index of string to be inserted */
  this.hash_size = 0;   /* number of elements in hash table */
  this.hash_bits = 0;   /* log2(hash_size) */
  this.hash_mask = 0;   /* hash_size-1 */

  this.hash_shift = 0;
  /* Number of bits by which ins_h must be shifted at each input
   * step. It must be such that after MIN_MATCH steps, the oldest
   * byte no longer takes part in the hash key, that is:
   *   hash_shift * MIN_MATCH >= hash_bits
   */

  this.block_start = 0;
  /* Window position at the beginning of the current output block. Gets
   * negative when the window is moved backwards.
   */

  this.match_length = 0;      /* length of best match */
  this.prev_match = 0;        /* previous match */
  this.match_available = 0;   /* set if previous match exists */
  this.strstart = 0;          /* start of string to insert */
  this.match_start = 0;       /* start of matching string */
  this.lookahead = 0;         /* number of valid bytes ahead in window */

  this.prev_length = 0;
  /* Length of the best match at previous step. Matches not greater than this
   * are discarded. This is used in the lazy match evaluation.
   */

  this.max_chain_length = 0;
  /* To speed up deflation, hash chains are never searched beyond this
   * length.  A higher limit improves compression ratio but degrades the
   * speed.
   */

  this.max_lazy_match = 0;
  /* Attempt to find a better match only when the current match is strictly
   * smaller than this value. This mechanism is used only for compression
   * levels >= 4.
   */
  // That's alias to max_lazy_match, don't use directly
  //this.max_insert_length = 0;
  /* Insert new strings in the hash table only if the match length is not
   * greater than this length. This saves time but degrades compression.
   * max_insert_length is used only for compression levels <= 3.
   */

  this.level = 0;     /* compression level (1..9) */
  this.strategy = 0;  /* favor or force Huffman coding*/

  this.good_match = 0;
  /* Use a faster search when the previous match is longer than this */

  this.nice_match = 0; /* Stop searching when current match exceeds this */

              /* used by trees.c: */

  /* Didn't use ct_data typedef below to suppress compiler warning */

  // struct ct_data_s dyn_ltree[HEAP_SIZE];   /* literal and length tree */
  // struct ct_data_s dyn_dtree[2*D_CODES+1]; /* distance tree */
  // struct ct_data_s bl_tree[2*BL_CODES+1];  /* Huffman tree for bit lengths */

  // Use flat array of DOUBLE size, with interleaved fata,
  // because JS does not support effective
  this.dyn_ltree  = new Uint16Array(HEAP_SIZE * 2);
  this.dyn_dtree  = new Uint16Array((2 * D_CODES + 1) * 2);
  this.bl_tree    = new Uint16Array((2 * BL_CODES + 1) * 2);
  zero(this.dyn_ltree);
  zero(this.dyn_dtree);
  zero(this.bl_tree);

  this.l_desc   = null;         /* desc. for literal tree */
  this.d_desc   = null;         /* desc. for distance tree */
  this.bl_desc  = null;         /* desc. for bit length tree */

  //ush bl_count[MAX_BITS+1];
  this.bl_count = new Uint16Array(MAX_BITS + 1);
  /* number of codes at each bit length for an optimal tree */

  //int heap[2*L_CODES+1];      /* heap used to build the Huffman trees */
  this.heap = new Uint16Array(2 * L_CODES + 1);  /* heap used to build the Huffman trees */
  zero(this.heap);

  this.heap_len = 0;               /* number of elements in the heap */
  this.heap_max = 0;               /* element of largest frequency */
  /* The sons of heap[n] are heap[2*n] and heap[2*n+1]. heap[0] is not used.
   * The same heap array is used to build all trees.
   */

  this.depth = new Uint16Array(2 * L_CODES + 1); //uch depth[2*L_CODES+1];
  zero(this.depth);
  /* Depth of each subtree used as tie breaker for trees of equal frequency
   */

  this.sym_buf = 0;        /* buffer for distances and literals/lengths */

  this.lit_bufsize = 0;
  /* Size of match buffer for literals/lengths.  There are 4 reasons for
   * limiting lit_bufsize to 64K:
   *   - frequencies can be kept in 16 bit counters
   *   - if compression is not successful for the first block, all input
   *     data is still in the window so we can still emit a stored block even
   *     when input comes from standard input.  (This can also be done for
   *     all blocks if lit_bufsize is not greater than 32K.)
   *   - if compression is not successful for a file smaller than 64K, we can
   *     even emit a stored file instead of a stored block (saving 5 bytes).
   *     This is applicable only for zip (not gzip or zlib).
   *   - creating new Huffman trees less frequently may not provide fast
   *     adaptation to changes in the input data statistics. (Take for
   *     example a binary file with poorly compressible code followed by
   *     a highly compressible string table.) Smaller buffer sizes give
   *     fast adaptation but have of course the overhead of transmitting
   *     trees more frequently.
   *   - I can't count above 4
   */

  this.sym_next = 0;      /* running index in sym_buf */
  this.sym_end = 0;       /* symbol table full when sym_next reaches this */

  this.opt_len = 0;       /* bit length of current block with optimal trees */
  this.static_len = 0;    /* bit length of current block with static trees */
  this.matches = 0;       /* number of string matches in current block */
  this.insert = 0;        /* bytes at end of window left to insert */


  this.bi_buf = 0;
  /* Output buffer. bits are inserted starting at the bottom (least
   * significant bits).
   */
  this.bi_valid = 0;
  /* Number of valid bits in bi_buf.  All bits above the last valid bit
   * are always zero.
   */

  // Used for window memory init. We safely ignore it for JS. That makes
  // sense only for pointers and memory check tools.
  //this.high_water = 0;
  /* High water mark offset in window for initialized bytes -- bytes above
   * this are set to zero in order to avoid memory check warnings when
   * longest match routines access bytes past the input.  This is then
   * updated to the new high water mark.
   */
}


/* =========================================================================
 * Check for a valid deflate stream state. Return 0 if ok, 1 if not.
 */
const deflateStateCheck = (strm) => {

  if (!strm) {
    return 1;
  }
  const s = strm.state;
  if (!s || s.strm !== strm || (s.status !== INIT_STATE &&
//#ifdef GZIP
                                s.status !== GZIP_STATE &&
//#endif
                                s.status !== EXTRA_STATE &&
                                s.status !== NAME_STATE &&
                                s.status !== COMMENT_STATE &&
                                s.status !== HCRC_STATE &&
                                s.status !== BUSY_STATE &&
                                s.status !== FINISH_STATE)) {
    return 1;
  }
  return 0;
};


const deflateResetKeep = (strm) => {

  if (deflateStateCheck(strm)) {
    return err(strm, Z_STREAM_ERROR$2);
  }

  strm.total_in = strm.total_out = 0;
  strm.data_type = Z_UNKNOWN;

  const s = strm.state;
  s.pending = 0;
  s.pending_out = 0;

  if (s.wrap < 0) {
    s.wrap = -s.wrap;
    /* was made negative by deflate(..., Z_FINISH); */
  }
  s.status =
//#ifdef GZIP
    s.wrap === 2 ? GZIP_STATE :
//#endif
    s.wrap ? INIT_STATE : BUSY_STATE;
  strm.adler = (s.wrap === 2) ?
    0  // crc32(0, Z_NULL, 0)
  :
    1; // adler32(0, Z_NULL, 0)
  s.last_flush = -2;
  _tr_init(s);
  return Z_OK$3;
};


const deflateReset = (strm) => {

  const ret = deflateResetKeep(strm);
  if (ret === Z_OK$3) {
    lm_init(strm.state);
  }
  return ret;
};


const deflateSetHeader = (strm, head) => {

  if (deflateStateCheck(strm) || strm.state.wrap !== 2) {
    return Z_STREAM_ERROR$2;
  }
  strm.state.gzhead = head;
  return Z_OK$3;
};


const deflateInit2 = (strm, level, method, windowBits, memLevel, strategy) => {

  if (!strm) { // === Z_NULL
    return Z_STREAM_ERROR$2;
  }
  let wrap = 1;

  if (level === Z_DEFAULT_COMPRESSION$1) {
    level = 6;
  }

  if (windowBits < 0) { /* suppress zlib wrapper */
    wrap = 0;
    windowBits = -windowBits;
  }

  else if (windowBits > 15) {
    wrap = 2;           /* write gzip wrapper instead */
    windowBits -= 16;
  }


  if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED$2 ||
    windowBits < 8 || windowBits > 15 || level < 0 || level > 9 ||
    strategy < 0 || strategy > Z_FIXED || (windowBits === 8 && wrap !== 1)) {
    return err(strm, Z_STREAM_ERROR$2);
  }


  if (windowBits === 8) {
    windowBits = 9;
  }
  /* until 256-byte window bug fixed */

  const s = new DeflateState();

  strm.state = s;
  s.strm = strm;
  s.status = INIT_STATE;     /* to pass state test in deflateReset() */

  s.wrap = wrap;
  s.gzhead = null;
  s.w_bits = windowBits;
  s.w_size = 1 << s.w_bits;
  s.w_mask = s.w_size - 1;

  s.hash_bits = memLevel + 7;
  s.hash_size = 1 << s.hash_bits;
  s.hash_mask = s.hash_size - 1;
  s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);

  s.window = new Uint8Array(s.w_size * 2);
  s.head = new Uint16Array(s.hash_size);
  s.prev = new Uint16Array(s.w_size);

  // Don't need mem init magic for JS.
  //s.high_water = 0;  /* nothing written to s->window yet */

  s.lit_bufsize = 1 << (memLevel + 6); /* 16K elements by default */

  /* We overlay pending_buf and sym_buf. This works since the average size
   * for length/distance pairs over any compressed block is assured to be 31
   * bits or less.
   *
   * Analysis: The longest fixed codes are a length code of 8 bits plus 5
   * extra bits, for lengths 131 to 257. The longest fixed distance codes are
   * 5 bits plus 13 extra bits, for distances 16385 to 32768. The longest
   * possible fixed-codes length/distance pair is then 31 bits total.
   *
   * sym_buf starts one-fourth of the way into pending_buf. So there are
   * three bytes in sym_buf for every four bytes in pending_buf. Each symbol
   * in sym_buf is three bytes -- two for the distance and one for the
   * literal/length. As each symbol is consumed, the pointer to the next
   * sym_buf value to read moves forward three bytes. From that symbol, up to
   * 31 bits are written to pending_buf. The closest the written pending_buf
   * bits gets to the next sym_buf symbol to read is just before the last
   * code is written. At that time, 31*(n-2) bits have been written, just
   * after 24*(n-2) bits have been consumed from sym_buf. sym_buf starts at
   * 8*n bits into pending_buf. (Note that the symbol buffer fills when n-1
   * symbols are written.) The closest the writing gets to what is unread is
   * then n+14 bits. Here n is lit_bufsize, which is 16384 by default, and
   * can range from 128 to 32768.
   *
   * Therefore, at a minimum, there are 142 bits of space between what is
   * written and what is read in the overlain buffers, so the symbols cannot
   * be overwritten by the compressed data. That space is actually 139 bits,
   * due to the three-bit fixed-code block header.
   *
   * That covers the case where either Z_FIXED is specified, forcing fixed
   * codes, or when the use of fixed codes is chosen, because that choice
   * results in a smaller compressed block than dynamic codes. That latter
   * condition then assures that the above analysis also covers all dynamic
   * blocks. A dynamic-code block will only be chosen to be emitted if it has
   * fewer bits than a fixed-code block would for the same set of symbols.
   * Therefore its average symbol length is assured to be less than 31. So
   * the compressed data for a dynamic block also cannot overwrite the
   * symbols from which it is being constructed.
   */

  s.pending_buf_size = s.lit_bufsize * 4;
  s.pending_buf = new Uint8Array(s.pending_buf_size);

  // It is offset from `s.pending_buf` (size is `s.lit_bufsize * 2`)
  //s->sym_buf = s->pending_buf + s->lit_bufsize;
  s.sym_buf = s.lit_bufsize;

  //s->sym_end = (s->lit_bufsize - 1) * 3;
  s.sym_end = (s.lit_bufsize - 1) * 3;
  /* We avoid equality with lit_bufsize*3 because of wraparound at 64K
   * on 16 bit machines and because stored blocks are restricted to
   * 64K-1 bytes.
   */

  s.level = level;
  s.strategy = strategy;
  s.method = method;

  return deflateReset(strm);
};

const deflateInit = (strm, level) => {

  return deflateInit2(strm, level, Z_DEFLATED$2, MAX_WBITS$1, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY$1);
};


/* ========================================================================= */
const deflate$2 = (strm, flush) => {

  if (deflateStateCheck(strm) || flush > Z_BLOCK$1 || flush < 0) {
    return strm ? err(strm, Z_STREAM_ERROR$2) : Z_STREAM_ERROR$2;
  }

  const s = strm.state;

  if (!strm.output ||
      (strm.avail_in !== 0 && !strm.input) ||
      (s.status === FINISH_STATE && flush !== Z_FINISH$3)) {
    return err(strm, (strm.avail_out === 0) ? Z_BUF_ERROR$1 : Z_STREAM_ERROR$2);
  }

  const old_flush = s.last_flush;
  s.last_flush = flush;

  /* Flush as much pending output as possible */
  if (s.pending !== 0) {
    flush_pending(strm);
    if (strm.avail_out === 0) {
      /* Since avail_out is 0, deflate will be called again with
       * more output space, but possibly with both pending and
       * avail_in equal to zero. There won't be anything to do,
       * but this is not an error situation so make sure we
       * return OK instead of BUF_ERROR at next call of deflate:
       */
      s.last_flush = -1;
      return Z_OK$3;
    }

    /* Make sure there is something to do and avoid duplicate consecutive
     * flushes. For repeated and useless calls with Z_FINISH, we keep
     * returning Z_STREAM_END instead of Z_BUF_ERROR.
     */
  } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) &&
    flush !== Z_FINISH$3) {
    return err(strm, Z_BUF_ERROR$1);
  }

  /* User must not provide more input after the first FINISH: */
  if (s.status === FINISH_STATE && strm.avail_in !== 0) {
    return err(strm, Z_BUF_ERROR$1);
  }

  /* Write the header */
  if (s.status === INIT_STATE && s.wrap === 0) {
    s.status = BUSY_STATE;
  }
  if (s.status === INIT_STATE) {
    /* zlib header */
    let header = (Z_DEFLATED$2 + ((s.w_bits - 8) << 4)) << 8;
    let level_flags = -1;

    if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
      level_flags = 0;
    } else if (s.level < 6) {
      level_flags = 1;
    } else if (s.level === 6) {
      level_flags = 2;
    } else {
      level_flags = 3;
    }
    header |= (level_flags << 6);
    if (s.strstart !== 0) { header |= PRESET_DICT; }
    header += 31 - (header % 31);

    putShortMSB(s, header);

    /* Save the adler32 of the preset dictionary: */
    if (s.strstart !== 0) {
      putShortMSB(s, strm.adler >>> 16);
      putShortMSB(s, strm.adler & 0xffff);
    }
    strm.adler = 1; // adler32(0L, Z_NULL, 0);
    s.status = BUSY_STATE;

    /* Compression must start with an empty pending buffer */
    flush_pending(strm);
    if (s.pending !== 0) {
      s.last_flush = -1;
      return Z_OK$3;
    }
  }
//#ifdef GZIP
  if (s.status === GZIP_STATE) {
    /* gzip header */
    strm.adler = 0;  //crc32(0L, Z_NULL, 0);
    put_byte(s, 31);
    put_byte(s, 139);
    put_byte(s, 8);
    if (!s.gzhead) { // s->gzhead == Z_NULL
      put_byte(s, 0);
      put_byte(s, 0);
      put_byte(s, 0);
      put_byte(s, 0);
      put_byte(s, 0);
      put_byte(s, s.level === 9 ? 2 :
                  (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
                   4 : 0));
      put_byte(s, OS_CODE);
      s.status = BUSY_STATE;

      /* Compression must start with an empty pending buffer */
      flush_pending(strm);
      if (s.pending !== 0) {
        s.last_flush = -1;
        return Z_OK$3;
      }
    }
    else {
      put_byte(s, (s.gzhead.text ? 1 : 0) +
                  (s.gzhead.hcrc ? 2 : 0) +
                  (!s.gzhead.extra ? 0 : 4) +
                  (!s.gzhead.name ? 0 : 8) +
                  (!s.gzhead.comment ? 0 : 16)
      );
      put_byte(s, s.gzhead.time & 0xff);
      put_byte(s, (s.gzhead.time >> 8) & 0xff);
      put_byte(s, (s.gzhead.time >> 16) & 0xff);
      put_byte(s, (s.gzhead.time >> 24) & 0xff);
      put_byte(s, s.level === 9 ? 2 :
                  (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
                   4 : 0));
      put_byte(s, s.gzhead.os & 0xff);
      if (s.gzhead.extra && s.gzhead.extra.length) {
        put_byte(s, s.gzhead.extra.length & 0xff);
        put_byte(s, (s.gzhead.extra.length >> 8) & 0xff);
      }
      if (s.gzhead.hcrc) {
        strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending, 0);
      }
      s.gzindex = 0;
      s.status = EXTRA_STATE;
    }
  }
  if (s.status === EXTRA_STATE) {
    if (s.gzhead.extra/* != Z_NULL*/) {
      let beg = s.pending;   /* start of bytes to update crc */
      let left = (s.gzhead.extra.length & 0xffff) - s.gzindex;
      while (s.pending + left > s.pending_buf_size) {
        let copy = s.pending_buf_size - s.pending;
        // zmemcpy(s.pending_buf + s.pending,
        //    s.gzhead.extra + s.gzindex, copy);
        s.pending_buf.set(s.gzhead.extra.subarray(s.gzindex, s.gzindex + copy), s.pending);
        s.pending = s.pending_buf_size;
        //--- HCRC_UPDATE(beg) ---//
        if (s.gzhead.hcrc && s.pending > beg) {
          strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
        }
        //---//
        s.gzindex += copy;
        flush_pending(strm);
        if (s.pending !== 0) {
          s.last_flush = -1;
          return Z_OK$3;
        }
        beg = 0;
        left -= copy;
      }
      // JS specific: s.gzhead.extra may be TypedArray or Array for backward compatibility
      //              TypedArray.slice and TypedArray.from don't exist in IE10-IE11
      let gzhead_extra = new Uint8Array(s.gzhead.extra);
      // zmemcpy(s->pending_buf + s->pending,
      //     s->gzhead->extra + s->gzindex, left);
      s.pending_buf.set(gzhead_extra.subarray(s.gzindex, s.gzindex + left), s.pending);
      s.pending += left;
      //--- HCRC_UPDATE(beg) ---//
      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      //---//
      s.gzindex = 0;
    }
    s.status = NAME_STATE;
  }
  if (s.status === NAME_STATE) {
    if (s.gzhead.name/* != Z_NULL*/) {
      let beg = s.pending;   /* start of bytes to update crc */
      let val;
      do {
        if (s.pending === s.pending_buf_size) {
          //--- HCRC_UPDATE(beg) ---//
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          //---//
          flush_pending(strm);
          if (s.pending !== 0) {
            s.last_flush = -1;
            return Z_OK$3;
          }
          beg = 0;
        }
        // JS specific: little magic to add zero terminator to end of string
        if (s.gzindex < s.gzhead.name.length) {
          val = s.gzhead.name.charCodeAt(s.gzindex++) & 0xff;
        } else {
          val = 0;
        }
        put_byte(s, val);
      } while (val !== 0);
      //--- HCRC_UPDATE(beg) ---//
      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      //---//
      s.gzindex = 0;
    }
    s.status = COMMENT_STATE;
  }
  if (s.status === COMMENT_STATE) {
    if (s.gzhead.comment/* != Z_NULL*/) {
      let beg = s.pending;   /* start of bytes to update crc */
      let val;
      do {
        if (s.pending === s.pending_buf_size) {
          //--- HCRC_UPDATE(beg) ---//
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          //---//
          flush_pending(strm);
          if (s.pending !== 0) {
            s.last_flush = -1;
            return Z_OK$3;
          }
          beg = 0;
        }
        // JS specific: little magic to add zero terminator to end of string
        if (s.gzindex < s.gzhead.comment.length) {
          val = s.gzhead.comment.charCodeAt(s.gzindex++) & 0xff;
        } else {
          val = 0;
        }
        put_byte(s, val);
      } while (val !== 0);
      //--- HCRC_UPDATE(beg) ---//
      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      //---//
    }
    s.status = HCRC_STATE;
  }
  if (s.status === HCRC_STATE) {
    if (s.gzhead.hcrc) {
      if (s.pending + 2 > s.pending_buf_size) {
        flush_pending(strm);
        if (s.pending !== 0) {
          s.last_flush = -1;
          return Z_OK$3;
        }
      }
      put_byte(s, strm.adler & 0xff);
      put_byte(s, (strm.adler >> 8) & 0xff);
      strm.adler = 0; //crc32(0L, Z_NULL, 0);
    }
    s.status = BUSY_STATE;

    /* Compression must start with an empty pending buffer */
    flush_pending(strm);
    if (s.pending !== 0) {
      s.last_flush = -1;
      return Z_OK$3;
    }
  }
//#endif

  /* Start a new block or continue the current one.
   */
  if (strm.avail_in !== 0 || s.lookahead !== 0 ||
    (flush !== Z_NO_FLUSH$2 && s.status !== FINISH_STATE)) {
    let bstate = s.level === 0 ? deflate_stored(s, flush) :
                 s.strategy === Z_HUFFMAN_ONLY ? deflate_huff(s, flush) :
                 s.strategy === Z_RLE ? deflate_rle(s, flush) :
                 configuration_table[s.level].func(s, flush);

    if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
      s.status = FINISH_STATE;
    }
    if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
      if (strm.avail_out === 0) {
        s.last_flush = -1;
        /* avoid BUF_ERROR next call, see above */
      }
      return Z_OK$3;
      /* If flush != Z_NO_FLUSH && avail_out == 0, the next call
       * of deflate should use the same flush parameter to make sure
       * that the flush is complete. So we don't have to output an
       * empty block here, this will be done at next call. This also
       * ensures that for a very small output buffer, we emit at most
       * one empty block.
       */
    }
    if (bstate === BS_BLOCK_DONE) {
      if (flush === Z_PARTIAL_FLUSH) {
        _tr_align(s);
      }
      else if (flush !== Z_BLOCK$1) { /* FULL_FLUSH or SYNC_FLUSH */

        _tr_stored_block(s, 0, 0, false);
        /* For a full flush, this empty block will be recognized
         * as a special marker by inflate_sync().
         */
        if (flush === Z_FULL_FLUSH$1) {
          /*** CLEAR_HASH(s); ***/             /* forget history */
          zero(s.head); // Fill with NIL (= 0);

          if (s.lookahead === 0) {
            s.strstart = 0;
            s.block_start = 0;
            s.insert = 0;
          }
        }
      }
      flush_pending(strm);
      if (strm.avail_out === 0) {
        s.last_flush = -1; /* avoid BUF_ERROR at next call, see above */
        return Z_OK$3;
      }
    }
  }

  if (flush !== Z_FINISH$3) { return Z_OK$3; }
  if (s.wrap <= 0) { return Z_STREAM_END$3; }

  /* Write the trailer */
  if (s.wrap === 2) {
    put_byte(s, strm.adler & 0xff);
    put_byte(s, (strm.adler >> 8) & 0xff);
    put_byte(s, (strm.adler >> 16) & 0xff);
    put_byte(s, (strm.adler >> 24) & 0xff);
    put_byte(s, strm.total_in & 0xff);
    put_byte(s, (strm.total_in >> 8) & 0xff);
    put_byte(s, (strm.total_in >> 16) & 0xff);
    put_byte(s, (strm.total_in >> 24) & 0xff);
  }
  else
  {
    putShortMSB(s, strm.adler >>> 16);
    putShortMSB(s, strm.adler & 0xffff);
  }

  flush_pending(strm);
  /* If avail_out is zero, the application will call deflate again
   * to flush the rest.
   */
  if (s.wrap > 0) { s.wrap = -s.wrap; }
  /* write the trailer only once! */
  return s.pending !== 0 ? Z_OK$3 : Z_STREAM_END$3;
};


const deflateEnd = (strm) => {

  if (deflateStateCheck(strm)) {
    return Z_STREAM_ERROR$2;
  }

  const status = strm.state.status;

  strm.state = null;

  return status === BUSY_STATE ? err(strm, Z_DATA_ERROR$2) : Z_OK$3;
};


/* =========================================================================
 * Initializes the compression dictionary from the given byte
 * sequence without producing any compressed output.
 */
const deflateSetDictionary = (strm, dictionary) => {

  let dictLength = dictionary.length;

  if (deflateStateCheck(strm)) {
    return Z_STREAM_ERROR$2;
  }

  const s = strm.state;
  const wrap = s.wrap;

  if (wrap === 2 || (wrap === 1 && s.status !== INIT_STATE) || s.lookahead) {
    return Z_STREAM_ERROR$2;
  }

  /* when using zlib wrappers, compute Adler-32 for provided dictionary */
  if (wrap === 1) {
    /* adler32(strm->adler, dictionary, dictLength); */
    strm.adler = adler32_1(strm.adler, dictionary, dictLength, 0);
  }

  s.wrap = 0;   /* avoid computing Adler-32 in read_buf */

  /* if dictionary would fill window, just replace the history */
  if (dictLength >= s.w_size) {
    if (wrap === 0) {            /* already empty otherwise */
      /*** CLEAR_HASH(s); ***/
      zero(s.head); // Fill with NIL (= 0);
      s.strstart = 0;
      s.block_start = 0;
      s.insert = 0;
    }
    /* use the tail */
    // dictionary = dictionary.slice(dictLength - s.w_size);
    let tmpDict = new Uint8Array(s.w_size);
    tmpDict.set(dictionary.subarray(dictLength - s.w_size, dictLength), 0);
    dictionary = tmpDict;
    dictLength = s.w_size;
  }
  /* insert dictionary into window and hash */
  const avail = strm.avail_in;
  const next = strm.next_in;
  const input = strm.input;
  strm.avail_in = dictLength;
  strm.next_in = 0;
  strm.input = dictionary;
  fill_window(s);
  while (s.lookahead >= MIN_MATCH) {
    let str = s.strstart;
    let n = s.lookahead - (MIN_MATCH - 1);
    do {
      /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */
      s.ins_h = HASH(s, s.ins_h, s.window[str + MIN_MATCH - 1]);

      s.prev[str & s.w_mask] = s.head[s.ins_h];

      s.head[s.ins_h] = str;
      str++;
    } while (--n);
    s.strstart = str;
    s.lookahead = MIN_MATCH - 1;
    fill_window(s);
  }
  s.strstart += s.lookahead;
  s.block_start = s.strstart;
  s.insert = s.lookahead;
  s.lookahead = 0;
  s.match_length = s.prev_length = MIN_MATCH - 1;
  s.match_available = 0;
  strm.next_in = next;
  strm.input = input;
  strm.avail_in = avail;
  s.wrap = wrap;
  return Z_OK$3;
};


var deflateInit_1 = deflateInit;
var deflateInit2_1 = deflateInit2;
var deflateReset_1 = deflateReset;
var deflateResetKeep_1 = deflateResetKeep;
var deflateSetHeader_1 = deflateSetHeader;
var deflate_2$1 = deflate$2;
var deflateEnd_1 = deflateEnd;
var deflateSetDictionary_1 = deflateSetDictionary;
var deflateInfo = 'pako deflate (from Nodeca project)';

/* Not implemented
module.exports.deflateBound = deflateBound;
module.exports.deflateCopy = deflateCopy;
module.exports.deflateGetDictionary = deflateGetDictionary;
module.exports.deflateParams = deflateParams;
module.exports.deflatePending = deflatePending;
module.exports.deflatePrime = deflatePrime;
module.exports.deflateTune = deflateTune;
*/

var deflate_1$2 = {
	deflateInit: deflateInit_1,
	deflateInit2: deflateInit2_1,
	deflateReset: deflateReset_1,
	deflateResetKeep: deflateResetKeep_1,
	deflateSetHeader: deflateSetHeader_1,
	deflate: deflate_2$1,
	deflateEnd: deflateEnd_1,
	deflateSetDictionary: deflateSetDictionary_1,
	deflateInfo: deflateInfo
};

const _has = (obj, key) => {
  return Object.prototype.hasOwnProperty.call(obj, key);
};

var assign = function (obj /*from1, from2, from3, ...*/) {
  const sources = Array.prototype.slice.call(arguments, 1);
  while (sources.length) {
    const source = sources.shift();
    if (!source) { continue; }

    if (typeof source !== 'object') {
      throw new TypeError(source + 'must be non-object');
    }

    for (const p in source) {
      if (_has(source, p)) {
        obj[p] = source[p];
      }
    }
  }

  return obj;
};


// Join array of chunks to single array.
var flattenChunks = (chunks) => {
  // calculate data length
  let len = 0;

  for (let i = 0, l = chunks.length; i < l; i++) {
    len += chunks[i].length;
  }

  // join chunks
  const result = new Uint8Array(len);

  for (let i = 0, pos = 0, l = chunks.length; i < l; i++) {
    let chunk = chunks[i];
    result.set(chunk, pos);
    pos += chunk.length;
  }

  return result;
};

var common = {
	assign: assign,
	flattenChunks: flattenChunks
};

// String encode/decode helpers


// Quick check if we can use fast array to bin string conversion
//
// - apply(Array) can fail on Android 2.2
// - apply(Uint8Array) can fail on iOS 5.1 Safari
//
let STR_APPLY_UIA_OK = true;

try { String.fromCharCode.apply(null, new Uint8Array(1)); } catch (__) { STR_APPLY_UIA_OK = false; }


// Table with utf8 lengths (calculated by first byte of sequence)
// Note, that 5 & 6-byte values and some 4-byte values can not be represented in JS,
// because max possible codepoint is 0x10ffff
const _utf8len = new Uint8Array(256);
for (let q = 0; q < 256; q++) {
  _utf8len[q] = (q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1);
}
_utf8len[254] = _utf8len[254] = 1; // Invalid sequence start


// convert string to array (typed, when possible)
var string2buf = (str) => {
  if (typeof TextEncoder === 'function' && TextEncoder.prototype.encode) {
    return new TextEncoder().encode(str);
  }

  let buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;

  // count binary size
  for (m_pos = 0; m_pos < str_len; m_pos++) {
    c = str.charCodeAt(m_pos);
    if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {
      c2 = str.charCodeAt(m_pos + 1);
      if ((c2 & 0xfc00) === 0xdc00) {
        c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        m_pos++;
      }
    }
    buf_len += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
  }

  // allocate buffer
  buf = new Uint8Array(buf_len);

  // convert
  for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
    c = str.charCodeAt(m_pos);
    if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {
      c2 = str.charCodeAt(m_pos + 1);
      if ((c2 & 0xfc00) === 0xdc00) {
        c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        m_pos++;
      }
    }
    if (c < 0x80) {
      /* one byte */
      buf[i++] = c;
    } else if (c < 0x800) {
      /* two bytes */
      buf[i++] = 0xC0 | (c >>> 6);
      buf[i++] = 0x80 | (c & 0x3f);
    } else if (c < 0x10000) {
      /* three bytes */
      buf[i++] = 0xE0 | (c >>> 12);
      buf[i++] = 0x80 | (c >>> 6 & 0x3f);
      buf[i++] = 0x80 | (c & 0x3f);
    } else {
      /* four bytes */
      buf[i++] = 0xf0 | (c >>> 18);
      buf[i++] = 0x80 | (c >>> 12 & 0x3f);
      buf[i++] = 0x80 | (c >>> 6 & 0x3f);
      buf[i++] = 0x80 | (c & 0x3f);
    }
  }

  return buf;
};

// Helper
const buf2binstring = (buf, len) => {
  // On Chrome, the arguments in a function call that are allowed is `65534`.
  // If the length of the buffer is smaller than that, we can use this optimization,
  // otherwise we will take a slower path.
  if (len < 65534) {
    if (buf.subarray && STR_APPLY_UIA_OK) {
      return String.fromCharCode.apply(null, buf.length === len ? buf : buf.subarray(0, len));
    }
  }

  let result = '';
  for (let i = 0; i < len; i++) {
    result += String.fromCharCode(buf[i]);
  }
  return result;
};


// convert array to string
var buf2string = (buf, max) => {
  const len = max || buf.length;

  if (typeof TextDecoder === 'function' && TextDecoder.prototype.decode) {
    return new TextDecoder().decode(buf.subarray(0, max));
  }

  let i, out;

  // Reserve max possible length (2 words per char)
  // NB: by unknown reasons, Array is significantly faster for
  //     String.fromCharCode.apply than Uint16Array.
  const utf16buf = new Array(len * 2);

  for (out = 0, i = 0; i < len;) {
    let c = buf[i++];
    // quick process ascii
    if (c < 0x80) { utf16buf[out++] = c; continue; }

    let c_len = _utf8len[c];
    // skip 5 & 6 byte codes
    if (c_len > 4) { utf16buf[out++] = 0xfffd; i += c_len - 1; continue; }

    // apply mask on first byte
    c &= c_len === 2 ? 0x1f : c_len === 3 ? 0x0f : 0x07;
    // join the rest
    while (c_len > 1 && i < len) {
      c = (c << 6) | (buf[i++] & 0x3f);
      c_len--;
    }

    // terminated by end of string?
    if (c_len > 1) { utf16buf[out++] = 0xfffd; continue; }

    if (c < 0x10000) {
      utf16buf[out++] = c;
    } else {
      c -= 0x10000;
      utf16buf[out++] = 0xd800 | ((c >> 10) & 0x3ff);
      utf16buf[out++] = 0xdc00 | (c & 0x3ff);
    }
  }

  return buf2binstring(utf16buf, out);
};


// Calculate max possible position in utf8 buffer,
// that will not break sequence. If that's not possible
// - (very small limits) return max size as is.
//
// buf[] - utf8 bytes array
// max   - length limit (mandatory);
var utf8border = (buf, max) => {

  max = max || buf.length;
  if (max > buf.length) { max = buf.length; }

  // go back from last position, until start of sequence found
  let pos = max - 1;
  while (pos >= 0 && (buf[pos] & 0xC0) === 0x80) { pos--; }

  // Very small and broken sequence,
  // return max, because we should return something anyway.
  if (pos < 0) { return max; }

  // If we came to start of buffer - that means buffer is too small,
  // return max too.
  if (pos === 0) { return max; }

  return (pos + _utf8len[buf[pos]] > max) ? pos : max;
};

var strings = {
	string2buf: string2buf,
	buf2string: buf2string,
	utf8border: utf8border
};

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

function ZStream() {
  /* next input byte */
  this.input = null; // JS specific, because we have no pointers
  this.next_in = 0;
  /* number of bytes available at input */
  this.avail_in = 0;
  /* total number of input bytes read so far */
  this.total_in = 0;
  /* next output byte should be put there */
  this.output = null; // JS specific, because we have no pointers
  this.next_out = 0;
  /* remaining free space at output */
  this.avail_out = 0;
  /* total number of bytes output so far */
  this.total_out = 0;
  /* last error message, NULL if no error */
  this.msg = ''/*Z_NULL*/;
  /* not visible by applications */
  this.state = null;
  /* best guess about the data type: binary or text */
  this.data_type = 2/*Z_UNKNOWN*/;
  /* adler32 value of the uncompressed data */
  this.adler = 0;
}

var zstream = ZStream;

const toString$1 = Object.prototype.toString;

/* Public constants ==========================================================*/
/* ===========================================================================*/

const {
  Z_NO_FLUSH: Z_NO_FLUSH$1, Z_SYNC_FLUSH, Z_FULL_FLUSH, Z_FINISH: Z_FINISH$2,
  Z_OK: Z_OK$2, Z_STREAM_END: Z_STREAM_END$2,
  Z_DEFAULT_COMPRESSION,
  Z_DEFAULT_STRATEGY,
  Z_DEFLATED: Z_DEFLATED$1
} = constants$2;

/* ===========================================================================*/


/**
 * class Deflate
 *
 * Generic JS-style wrapper for zlib calls. If you don't need
 * streaming behaviour - use more simple functions: [[deflate]],
 * [[deflateRaw]] and [[gzip]].
 **/

/* internal
 * Deflate.chunks -> Array
 *
 * Chunks of output data, if [[Deflate#onData]] not overridden.
 **/

/**
 * Deflate.result -> Uint8Array
 *
 * Compressed result, generated by default [[Deflate#onData]]
 * and [[Deflate#onEnd]] handlers. Filled after you push last chunk
 * (call [[Deflate#push]] with `Z_FINISH` / `true` param).
 **/

/**
 * Deflate.err -> Number
 *
 * Error code after deflate finished. 0 (Z_OK) on success.
 * You will not need it in real life, because deflate errors
 * are possible only on wrong options or bad `onData` / `onEnd`
 * custom handlers.
 **/

/**
 * Deflate.msg -> String
 *
 * Error message, if [[Deflate.err]] != 0
 **/


/**
 * new Deflate(options)
 * - options (Object): zlib deflate options.
 *
 * Creates new deflator instance with specified params. Throws exception
 * on bad params. Supported options:
 *
 * - `level`
 * - `windowBits`
 * - `memLevel`
 * - `strategy`
 * - `dictionary`
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Additional options, for internal needs:
 *
 * - `chunkSize` - size of generated data chunks (16K by default)
 * - `raw` (Boolean) - do raw deflate
 * - `gzip` (Boolean) - create gzip wrapper
 * - `header` (Object) - custom header for gzip
 *   - `text` (Boolean) - true if compressed data believed to be text
 *   - `time` (Number) - modification time, unix timestamp
 *   - `os` (Number) - operation system code
 *   - `extra` (Array) - array of bytes with extra data (max 65536)
 *   - `name` (String) - file name (binary string)
 *   - `comment` (String) - comment (binary string)
 *   - `hcrc` (Boolean) - true if header crc should be added
 *
 * ##### Example:
 *
 * ```javascript
 * const pako = require('pako')
 *   , chunk1 = new Uint8Array([1,2,3,4,5,6,7,8,9])
 *   , chunk2 = new Uint8Array([10,11,12,13,14,15,16,17,18,19]);
 *
 * const deflate = new pako.Deflate({ level: 3});
 *
 * deflate.push(chunk1, false);
 * deflate.push(chunk2, true);  // true -> last chunk
 *
 * if (deflate.err) { throw new Error(deflate.err); }
 *
 * console.log(deflate.result);
 * ```
 **/
function Deflate$1(options) {
  this.options = common.assign({
    level: Z_DEFAULT_COMPRESSION,
    method: Z_DEFLATED$1,
    chunkSize: 16384,
    windowBits: 15,
    memLevel: 8,
    strategy: Z_DEFAULT_STRATEGY
  }, options || {});

  let opt = this.options;

  if (opt.raw && (opt.windowBits > 0)) {
    opt.windowBits = -opt.windowBits;
  }

  else if (opt.gzip && (opt.windowBits > 0) && (opt.windowBits < 16)) {
    opt.windowBits += 16;
  }

  this.err    = 0;      // error code, if happens (0 = Z_OK)
  this.msg    = '';     // error message
  this.ended  = false;  // used to avoid multiple onEnd() calls
  this.chunks = [];     // chunks of compressed data

  this.strm = new zstream();
  this.strm.avail_out = 0;

  let status = deflate_1$2.deflateInit2(
    this.strm,
    opt.level,
    opt.method,
    opt.windowBits,
    opt.memLevel,
    opt.strategy
  );

  if (status !== Z_OK$2) {
    throw new Error(messages[status]);
  }

  if (opt.header) {
    deflate_1$2.deflateSetHeader(this.strm, opt.header);
  }

  if (opt.dictionary) {
    let dict;
    // Convert data if needed
    if (typeof opt.dictionary === 'string') {
      // If we need to compress text, change encoding to utf8.
      dict = strings.string2buf(opt.dictionary);
    } else if (toString$1.call(opt.dictionary) === '[object ArrayBuffer]') {
      dict = new Uint8Array(opt.dictionary);
    } else {
      dict = opt.dictionary;
    }

    status = deflate_1$2.deflateSetDictionary(this.strm, dict);

    if (status !== Z_OK$2) {
      throw new Error(messages[status]);
    }

    this._dict_set = true;
  }
}

/**
 * Deflate#push(data[, flush_mode]) -> Boolean
 * - data (Uint8Array|ArrayBuffer|String): input data. Strings will be
 *   converted to utf8 byte sequence.
 * - flush_mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE modes.
 *   See constants. Skipped or `false` means Z_NO_FLUSH, `true` means Z_FINISH.
 *
 * Sends input data to deflate pipe, generating [[Deflate#onData]] calls with
 * new compressed chunks. Returns `true` on success. The last data block must
 * have `flush_mode` Z_FINISH (or `true`). That will flush internal pending
 * buffers and call [[Deflate#onEnd]].
 *
 * On fail call [[Deflate#onEnd]] with error code and return false.
 *
 * ##### Example
 *
 * ```javascript
 * push(chunk, false); // push one of data chunks
 * ...
 * push(chunk, true);  // push last chunk
 * ```
 **/
Deflate$1.prototype.push = function (data, flush_mode) {
  const strm = this.strm;
  const chunkSize = this.options.chunkSize;
  let status, _flush_mode;

  if (this.ended) { return false; }

  if (flush_mode === ~~flush_mode) _flush_mode = flush_mode;
  else _flush_mode = flush_mode === true ? Z_FINISH$2 : Z_NO_FLUSH$1;

  // Convert data if needed
  if (typeof data === 'string') {
    // If we need to compress text, change encoding to utf8.
    strm.input = strings.string2buf(data);
  } else if (toString$1.call(data) === '[object ArrayBuffer]') {
    strm.input = new Uint8Array(data);
  } else {
    strm.input = data;
  }

  strm.next_in = 0;
  strm.avail_in = strm.input.length;

  for (;;) {
    if (strm.avail_out === 0) {
      strm.output = new Uint8Array(chunkSize);
      strm.next_out = 0;
      strm.avail_out = chunkSize;
    }

    // Make sure avail_out > 6 to avoid repeating markers
    if ((_flush_mode === Z_SYNC_FLUSH || _flush_mode === Z_FULL_FLUSH) && strm.avail_out <= 6) {
      this.onData(strm.output.subarray(0, strm.next_out));
      strm.avail_out = 0;
      continue;
    }

    status = deflate_1$2.deflate(strm, _flush_mode);

    // Ended => flush and finish
    if (status === Z_STREAM_END$2) {
      if (strm.next_out > 0) {
        this.onData(strm.output.subarray(0, strm.next_out));
      }
      status = deflate_1$2.deflateEnd(this.strm);
      this.onEnd(status);
      this.ended = true;
      return status === Z_OK$2;
    }

    // Flush if out buffer full
    if (strm.avail_out === 0) {
      this.onData(strm.output);
      continue;
    }

    // Flush if requested and has data
    if (_flush_mode > 0 && strm.next_out > 0) {
      this.onData(strm.output.subarray(0, strm.next_out));
      strm.avail_out = 0;
      continue;
    }

    if (strm.avail_in === 0) break;
  }

  return true;
};


/**
 * Deflate#onData(chunk) -> Void
 * - chunk (Uint8Array): output data.
 *
 * By default, stores data blocks in `chunks[]` property and glue
 * those in `onEnd`. Override this handler, if you need another behaviour.
 **/
Deflate$1.prototype.onData = function (chunk) {
  this.chunks.push(chunk);
};


/**
 * Deflate#onEnd(status) -> Void
 * - status (Number): deflate status. 0 (Z_OK) on success,
 *   other if not.
 *
 * Called once after you tell deflate that the input stream is
 * complete (Z_FINISH). By default - join collected chunks,
 * free memory and fill `results` / `err` properties.
 **/
Deflate$1.prototype.onEnd = function (status) {
  // On success - join
  if (status === Z_OK$2) {
    this.result = common.flattenChunks(this.chunks);
  }
  this.chunks = [];
  this.err = status;
  this.msg = this.strm.msg;
};


/**
 * deflate(data[, options]) -> Uint8Array
 * - data (Uint8Array|ArrayBuffer|String): input data to compress.
 * - options (Object): zlib deflate options.
 *
 * Compress `data` with deflate algorithm and `options`.
 *
 * Supported options are:
 *
 * - level
 * - windowBits
 * - memLevel
 * - strategy
 * - dictionary
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Sugar (options):
 *
 * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
 *   negative windowBits implicitly.
 *
 * ##### Example:
 *
 * ```javascript
 * const pako = require('pako')
 * const data = new Uint8Array([1,2,3,4,5,6,7,8,9]);
 *
 * console.log(pako.deflate(data));
 * ```
 **/
function deflate$1(input, options) {
  const deflator = new Deflate$1(options);

  deflator.push(input, true);

  // That will never happens, if you don't cheat with options :)
  if (deflator.err) { throw deflator.msg || messages[deflator.err]; }

  return deflator.result;
}


/**
 * deflateRaw(data[, options]) -> Uint8Array
 * - data (Uint8Array|ArrayBuffer|String): input data to compress.
 * - options (Object): zlib deflate options.
 *
 * The same as [[deflate]], but creates raw data, without wrapper
 * (header and adler32 crc).
 **/
function deflateRaw$1(input, options) {
  options = options || {};
  options.raw = true;
  return deflate$1(input, options);
}


/**
 * gzip(data[, options]) -> Uint8Array
 * - data (Uint8Array|ArrayBuffer|String): input data to compress.
 * - options (Object): zlib deflate options.
 *
 * The same as [[deflate]], but create gzip wrapper instead of
 * deflate one.
 **/
function gzip$1(input, options) {
  options = options || {};
  options.gzip = true;
  return deflate$1(input, options);
}


var Deflate_1$1 = Deflate$1;
var deflate_2 = deflate$1;
var deflateRaw_1$1 = deflateRaw$1;
var gzip_1$1 = gzip$1;
var constants$1 = constants$2;

var deflate_1$1 = {
	Deflate: Deflate_1$1,
	deflate: deflate_2,
	deflateRaw: deflateRaw_1$1,
	gzip: gzip_1$1,
	constants: constants$1
};

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

// See state defs from inflate.js
const BAD$1 = 16209;       /* got a data error -- remain here until reset */
const TYPE$1 = 16191;      /* i: waiting for type bits, including last-flag bit */

/*
   Decode literal, length, and distance codes and write out the resulting
   literal and match bytes until either not enough input or output is
   available, an end-of-block is encountered, or a data error is encountered.
   When large enough input and output buffers are supplied to inflate(), for
   example, a 16K input buffer and a 64K output buffer, more than 95% of the
   inflate execution time is spent in this routine.

   Entry assumptions:

        state.mode === LEN
        strm.avail_in >= 6
        strm.avail_out >= 258
        start >= strm.avail_out
        state.bits < 8

   On return, state.mode is one of:

        LEN -- ran out of enough output space or enough available input
        TYPE -- reached end of block code, inflate() to interpret next block
        BAD -- error in block data

   Notes:

    - The maximum input bits used by a length/distance pair is 15 bits for the
      length code, 5 bits for the length extra, 15 bits for the distance code,
      and 13 bits for the distance extra.  This totals 48 bits, or six bytes.
      Therefore if strm.avail_in >= 6, then there is enough input to avoid
      checking for available input while decoding.

    - The maximum bytes that a single length/distance pair can output is 258
      bytes, which is the maximum length that can be coded.  inflate_fast()
      requires strm.avail_out >= 258 for each loop to avoid checking for
      output space.
 */
var inffast = function inflate_fast(strm, start) {
  let _in;                    /* local strm.input */
  let last;                   /* have enough input while in < last */
  let _out;                   /* local strm.output */
  let beg;                    /* inflate()'s initial strm.output */
  let end;                    /* while out < end, enough space available */
//#ifdef INFLATE_STRICT
  let dmax;                   /* maximum distance from zlib header */
//#endif
  let wsize;                  /* window size or zero if not using window */
  let whave;                  /* valid bytes in the window */
  let wnext;                  /* window write index */
  // Use `s_window` instead `window`, avoid conflict with instrumentation tools
  let s_window;               /* allocated sliding window, if wsize != 0 */
  let hold;                   /* local strm.hold */
  let bits;                   /* local strm.bits */
  let lcode;                  /* local strm.lencode */
  let dcode;                  /* local strm.distcode */
  let lmask;                  /* mask for first level of length codes */
  let dmask;                  /* mask for first level of distance codes */
  let here;                   /* retrieved table entry */
  let op;                     /* code bits, operation, extra bits, or */
                              /*  window position, window bytes to copy */
  let len;                    /* match length, unused bytes */
  let dist;                   /* match distance */
  let from;                   /* where to copy match from */
  let from_source;


  let input, output; // JS specific, because we have no pointers

  /* copy state to local variables */
  const state = strm.state;
  //here = state.here;
  _in = strm.next_in;
  input = strm.input;
  last = _in + (strm.avail_in - 5);
  _out = strm.next_out;
  output = strm.output;
  beg = _out - (start - strm.avail_out);
  end = _out + (strm.avail_out - 257);
//#ifdef INFLATE_STRICT
  dmax = state.dmax;
//#endif
  wsize = state.wsize;
  whave = state.whave;
  wnext = state.wnext;
  s_window = state.window;
  hold = state.hold;
  bits = state.bits;
  lcode = state.lencode;
  dcode = state.distcode;
  lmask = (1 << state.lenbits) - 1;
  dmask = (1 << state.distbits) - 1;


  /* decode literals and length/distances until end-of-block or not enough
     input data or output space */

  top:
  do {
    if (bits < 15) {
      hold += input[_in++] << bits;
      bits += 8;
      hold += input[_in++] << bits;
      bits += 8;
    }

    here = lcode[hold & lmask];

    dolen:
    for (;;) { // Goto emulation
      op = here >>> 24/*here.bits*/;
      hold >>>= op;
      bits -= op;
      op = (here >>> 16) & 0xff/*here.op*/;
      if (op === 0) {                          /* literal */
        //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
        //        "inflate:         literal '%c'\n" :
        //        "inflate:         literal 0x%02x\n", here.val));
        output[_out++] = here & 0xffff/*here.val*/;
      }
      else if (op & 16) {                     /* length base */
        len = here & 0xffff/*here.val*/;
        op &= 15;                           /* number of extra bits */
        if (op) {
          if (bits < op) {
            hold += input[_in++] << bits;
            bits += 8;
          }
          len += hold & ((1 << op) - 1);
          hold >>>= op;
          bits -= op;
        }
        //Tracevv((stderr, "inflate:         length %u\n", len));
        if (bits < 15) {
          hold += input[_in++] << bits;
          bits += 8;
          hold += input[_in++] << bits;
          bits += 8;
        }
        here = dcode[hold & dmask];

        dodist:
        for (;;) { // goto emulation
          op = here >>> 24/*here.bits*/;
          hold >>>= op;
          bits -= op;
          op = (here >>> 16) & 0xff/*here.op*/;

          if (op & 16) {                      /* distance base */
            dist = here & 0xffff/*here.val*/;
            op &= 15;                       /* number of extra bits */
            if (bits < op) {
              hold += input[_in++] << bits;
              bits += 8;
              if (bits < op) {
                hold += input[_in++] << bits;
                bits += 8;
              }
            }
            dist += hold & ((1 << op) - 1);
//#ifdef INFLATE_STRICT
            if (dist > dmax) {
              strm.msg = 'invalid distance too far back';
              state.mode = BAD$1;
              break top;
            }
//#endif
            hold >>>= op;
            bits -= op;
            //Tracevv((stderr, "inflate:         distance %u\n", dist));
            op = _out - beg;                /* max distance in output */
            if (dist > op) {                /* see if copy from window */
              op = dist - op;               /* distance back in window */
              if (op > whave) {
                if (state.sane) {
                  strm.msg = 'invalid distance too far back';
                  state.mode = BAD$1;
                  break top;
                }

// (!) This block is disabled in zlib defaults,
// don't enable it for binary compatibility
//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
//                if (len <= op - whave) {
//                  do {
//                    output[_out++] = 0;
//                  } while (--len);
//                  continue top;
//                }
//                len -= op - whave;
//                do {
//                  output[_out++] = 0;
//                } while (--op > whave);
//                if (op === 0) {
//                  from = _out - dist;
//                  do {
//                    output[_out++] = output[from++];
//                  } while (--len);
//                  continue top;
//                }
//#endif
              }
              from = 0; // window index
              from_source = s_window;
              if (wnext === 0) {           /* very common case */
                from += wsize - op;
                if (op < len) {         /* some from window */
                  len -= op;
                  do {
                    output[_out++] = s_window[from++];
                  } while (--op);
                  from = _out - dist;  /* rest from output */
                  from_source = output;
                }
              }
              else if (wnext < op) {      /* wrap around window */
                from += wsize + wnext - op;
                op -= wnext;
                if (op < len) {         /* some from end of window */
                  len -= op;
                  do {
                    output[_out++] = s_window[from++];
                  } while (--op);
                  from = 0;
                  if (wnext < len) {  /* some from start of window */
                    op = wnext;
                    len -= op;
                    do {
                      output[_out++] = s_window[from++];
                    } while (--op);
                    from = _out - dist;      /* rest from output */
                    from_source = output;
                  }
                }
              }
              else {                      /* contiguous in window */
                from += wnext - op;
                if (op < len) {         /* some from window */
                  len -= op;
                  do {
                    output[_out++] = s_window[from++];
                  } while (--op);
                  from = _out - dist;  /* rest from output */
                  from_source = output;
                }
              }
              while (len > 2) {
                output[_out++] = from_source[from++];
                output[_out++] = from_source[from++];
                output[_out++] = from_source[from++];
                len -= 3;
              }
              if (len) {
                output[_out++] = from_source[from++];
                if (len > 1) {
                  output[_out++] = from_source[from++];
                }
              }
            }
            else {
              from = _out - dist;          /* copy direct from output */
              do {                        /* minimum length is three */
                output[_out++] = output[from++];
                output[_out++] = output[from++];
                output[_out++] = output[from++];
                len -= 3;
              } while (len > 2);
              if (len) {
                output[_out++] = output[from++];
                if (len > 1) {
                  output[_out++] = output[from++];
                }
              }
            }
          }
          else if ((op & 64) === 0) {          /* 2nd level distance code */
            here = dcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
            continue dodist;
          }
          else {
            strm.msg = 'invalid distance code';
            state.mode = BAD$1;
            break top;
          }

          break; // need to emulate goto via "continue"
        }
      }
      else if ((op & 64) === 0) {              /* 2nd level length code */
        here = lcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
        continue dolen;
      }
      else if (op & 32) {                     /* end-of-block */
        //Tracevv((stderr, "inflate:         end of block\n"));
        state.mode = TYPE$1;
        break top;
      }
      else {
        strm.msg = 'invalid literal/length code';
        state.mode = BAD$1;
        break top;
      }

      break; // need to emulate goto via "continue"
    }
  } while (_in < last && _out < end);

  /* return unused bytes (on entry, bits < 8, so in won't go too far back) */
  len = bits >> 3;
  _in -= len;
  bits -= len << 3;
  hold &= (1 << bits) - 1;

  /* update state and return */
  strm.next_in = _in;
  strm.next_out = _out;
  strm.avail_in = (_in < last ? 5 + (last - _in) : 5 - (_in - last));
  strm.avail_out = (_out < end ? 257 + (end - _out) : 257 - (_out - end));
  state.hold = hold;
  state.bits = bits;
  return;
};

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

const MAXBITS = 15;
const ENOUGH_LENS$1 = 852;
const ENOUGH_DISTS$1 = 592;
//const ENOUGH = (ENOUGH_LENS+ENOUGH_DISTS);

const CODES$1 = 0;
const LENS$1 = 1;
const DISTS$1 = 2;

const lbase = new Uint16Array([ /* Length codes 257..285 base */
  3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
  35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0
]);

const lext = new Uint8Array([ /* Length codes 257..285 extra */
  16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18,
  19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78
]);

const dbase = new Uint16Array([ /* Distance codes 0..29 base */
  1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
  257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
  8193, 12289, 16385, 24577, 0, 0
]);

const dext = new Uint8Array([ /* Distance codes 0..29 extra */
  16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22,
  23, 23, 24, 24, 25, 25, 26, 26, 27, 27,
  28, 28, 29, 29, 64, 64
]);

const inflate_table = (type, lens, lens_index, codes, table, table_index, work, opts) =>
{
  const bits = opts.bits;
      //here = opts.here; /* table entry for duplication */

  let len = 0;               /* a code's length in bits */
  let sym = 0;               /* index of code symbols */
  let min = 0, max = 0;          /* minimum and maximum code lengths */
  let root = 0;              /* number of index bits for root table */
  let curr = 0;              /* number of index bits for current table */
  let drop = 0;              /* code bits to drop for sub-table */
  let left = 0;                   /* number of prefix codes available */
  let used = 0;              /* code entries in table used */
  let huff = 0;              /* Huffman code */
  let incr;              /* for incrementing code, index */
  let fill;              /* index for replicating entries */
  let low;               /* low bits for current root entry */
  let mask;              /* mask for low root bits */
  let next;             /* next available space in table */
  let base = null;     /* base value table to use */
//  let shoextra;    /* extra bits table to use */
  let match;                  /* use base and extra for symbol >= match */
  const count = new Uint16Array(MAXBITS + 1); //[MAXBITS+1];    /* number of codes of each length */
  const offs = new Uint16Array(MAXBITS + 1); //[MAXBITS+1];     /* offsets in table for each length */
  let extra = null;

  let here_bits, here_op, here_val;

  /*
   Process a set of code lengths to create a canonical Huffman code.  The
   code lengths are lens[0..codes-1].  Each length corresponds to the
   symbols 0..codes-1.  The Huffman code is generated by first sorting the
   symbols by length from short to long, and retaining the symbol order
   for codes with equal lengths.  Then the code starts with all zero bits
   for the first code of the shortest length, and the codes are integer
   increments for the same length, and zeros are appended as the length
   increases.  For the deflate format, these bits are stored backwards
   from their more natural integer increment ordering, and so when the
   decoding tables are built in the large loop below, the integer codes
   are incremented backwards.

   This routine assumes, but does not check, that all of the entries in
   lens[] are in the range 0..MAXBITS.  The caller must assure this.
   1..MAXBITS is interpreted as that code length.  zero means that that
   symbol does not occur in this code.

   The codes are sorted by computing a count of codes for each length,
   creating from that a table of starting indices for each length in the
   sorted table, and then entering the symbols in order in the sorted
   table.  The sorted table is work[], with that space being provided by
   the caller.

   The length counts are used for other purposes as well, i.e. finding
   the minimum and maximum length codes, determining if there are any
   codes at all, checking for a valid set of lengths, and looking ahead
   at length counts to determine sub-table sizes when building the
   decoding tables.
   */

  /* accumulate lengths for codes (assumes lens[] all in 0..MAXBITS) */
  for (len = 0; len <= MAXBITS; len++) {
    count[len] = 0;
  }
  for (sym = 0; sym < codes; sym++) {
    count[lens[lens_index + sym]]++;
  }

  /* bound code lengths, force root to be within code lengths */
  root = bits;
  for (max = MAXBITS; max >= 1; max--) {
    if (count[max] !== 0) { break; }
  }
  if (root > max) {
    root = max;
  }
  if (max === 0) {                     /* no symbols to code at all */
    //table.op[opts.table_index] = 64;  //here.op = (var char)64;    /* invalid code marker */
    //table.bits[opts.table_index] = 1;   //here.bits = (var char)1;
    //table.val[opts.table_index++] = 0;   //here.val = (var short)0;
    table[table_index++] = (1 << 24) | (64 << 16) | 0;


    //table.op[opts.table_index] = 64;
    //table.bits[opts.table_index] = 1;
    //table.val[opts.table_index++] = 0;
    table[table_index++] = (1 << 24) | (64 << 16) | 0;

    opts.bits = 1;
    return 0;     /* no symbols, but wait for decoding to report error */
  }
  for (min = 1; min < max; min++) {
    if (count[min] !== 0) { break; }
  }
  if (root < min) {
    root = min;
  }

  /* check for an over-subscribed or incomplete set of lengths */
  left = 1;
  for (len = 1; len <= MAXBITS; len++) {
    left <<= 1;
    left -= count[len];
    if (left < 0) {
      return -1;
    }        /* over-subscribed */
  }
  if (left > 0 && (type === CODES$1 || max !== 1)) {
    return -1;                      /* incomplete set */
  }

  /* generate offsets into symbol table for each length for sorting */
  offs[1] = 0;
  for (len = 1; len < MAXBITS; len++) {
    offs[len + 1] = offs[len] + count[len];
  }

  /* sort symbols by length, by symbol order within each length */
  for (sym = 0; sym < codes; sym++) {
    if (lens[lens_index + sym] !== 0) {
      work[offs[lens[lens_index + sym]]++] = sym;
    }
  }

  /*
   Create and fill in decoding tables.  In this loop, the table being
   filled is at next and has curr index bits.  The code being used is huff
   with length len.  That code is converted to an index by dropping drop
   bits off of the bottom.  For codes where len is less than drop + curr,
   those top drop + curr - len bits are incremented through all values to
   fill the table with replicated entries.

   root is the number of index bits for the root table.  When len exceeds
   root, sub-tables are created pointed to by the root entry with an index
   of the low root bits of huff.  This is saved in low to check for when a
   new sub-table should be started.  drop is zero when the root table is
   being filled, and drop is root when sub-tables are being filled.

   When a new sub-table is needed, it is necessary to look ahead in the
   code lengths to determine what size sub-table is needed.  The length
   counts are used for this, and so count[] is decremented as codes are
   entered in the tables.

   used keeps track of how many table entries have been allocated from the
   provided *table space.  It is checked for LENS and DIST tables against
   the constants ENOUGH_LENS and ENOUGH_DISTS to guard against changes in
   the initial root table size constants.  See the comments in inftrees.h
   for more information.

   sym increments through all symbols, and the loop terminates when
   all codes of length max, i.e. all codes, have been processed.  This
   routine permits incomplete codes, so another loop after this one fills
   in the rest of the decoding tables with invalid code markers.
   */

  /* set up for code type */
  // poor man optimization - use if-else instead of switch,
  // to avoid deopts in old v8
  if (type === CODES$1) {
    base = extra = work;    /* dummy value--not used */
    match = 20;

  } else if (type === LENS$1) {
    base = lbase;
    extra = lext;
    match = 257;

  } else {                    /* DISTS */
    base = dbase;
    extra = dext;
    match = 0;
  }

  /* initialize opts for loop */
  huff = 0;                   /* starting code */
  sym = 0;                    /* starting code symbol */
  len = min;                  /* starting code length */
  next = table_index;              /* current table to fill in */
  curr = root;                /* current table index bits */
  drop = 0;                   /* current bits to drop from code for index */
  low = -1;                   /* trigger new sub-table when len > root */
  used = 1 << root;          /* use root table entries */
  mask = used - 1;            /* mask for comparing low */

  /* check available table space */
  if ((type === LENS$1 && used > ENOUGH_LENS$1) ||
    (type === DISTS$1 && used > ENOUGH_DISTS$1)) {
    return 1;
  }

  /* process all codes and make table entries */
  for (;;) {
    /* create table entry */
    here_bits = len - drop;
    if (work[sym] + 1 < match) {
      here_op = 0;
      here_val = work[sym];
    }
    else if (work[sym] >= match) {
      here_op = extra[work[sym] - match];
      here_val = base[work[sym] - match];
    }
    else {
      here_op = 32 + 64;         /* end of block */
      here_val = 0;
    }

    /* replicate for those indices with low len bits equal to huff */
    incr = 1 << (len - drop);
    fill = 1 << curr;
    min = fill;                 /* save offset to next table */
    do {
      fill -= incr;
      table[next + (huff >> drop) + fill] = (here_bits << 24) | (here_op << 16) | here_val |0;
    } while (fill !== 0);

    /* backwards increment the len-bit code huff */
    incr = 1 << (len - 1);
    while (huff & incr) {
      incr >>= 1;
    }
    if (incr !== 0) {
      huff &= incr - 1;
      huff += incr;
    } else {
      huff = 0;
    }

    /* go to next symbol, update count, len */
    sym++;
    if (--count[len] === 0) {
      if (len === max) { break; }
      len = lens[lens_index + work[sym]];
    }

    /* create new sub-table if needed */
    if (len > root && (huff & mask) !== low) {
      /* if first time, transition to sub-tables */
      if (drop === 0) {
        drop = root;
      }

      /* increment past last table */
      next += min;            /* here min is 1 << curr */

      /* determine length of next table */
      curr = len - drop;
      left = 1 << curr;
      while (curr + drop < max) {
        left -= count[curr + drop];
        if (left <= 0) { break; }
        curr++;
        left <<= 1;
      }

      /* check for enough space */
      used += 1 << curr;
      if ((type === LENS$1 && used > ENOUGH_LENS$1) ||
        (type === DISTS$1 && used > ENOUGH_DISTS$1)) {
        return 1;
      }

      /* point entry in root table to sub-table */
      low = huff & mask;
      /*table.op[low] = curr;
      table.bits[low] = root;
      table.val[low] = next - opts.table_index;*/
      table[low] = (root << 24) | (curr << 16) | (next - table_index) |0;
    }
  }

  /* fill in remaining table entry if code is incomplete (guaranteed to have
   at most one remaining entry, since if the code is incomplete, the
   maximum code length that was allowed to get this far is one bit) */
  if (huff !== 0) {
    //table.op[next + huff] = 64;            /* invalid code marker */
    //table.bits[next + huff] = len - drop;
    //table.val[next + huff] = 0;
    table[next + huff] = ((len - drop) << 24) | (64 << 16) |0;
  }

  /* set return parameters */
  //opts.table_index += used;
  opts.bits = root;
  return 0;
};


var inftrees = inflate_table;

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.






const CODES = 0;
const LENS = 1;
const DISTS = 2;

/* Public constants ==========================================================*/
/* ===========================================================================*/

const {
  Z_FINISH: Z_FINISH$1, Z_BLOCK, Z_TREES,
  Z_OK: Z_OK$1, Z_STREAM_END: Z_STREAM_END$1, Z_NEED_DICT: Z_NEED_DICT$1, Z_STREAM_ERROR: Z_STREAM_ERROR$1, Z_DATA_ERROR: Z_DATA_ERROR$1, Z_MEM_ERROR: Z_MEM_ERROR$1, Z_BUF_ERROR,
  Z_DEFLATED
} = constants$2;


/* STATES ====================================================================*/
/* ===========================================================================*/


const    HEAD = 16180;       /* i: waiting for magic header */
const    FLAGS = 16181;      /* i: waiting for method and flags (gzip) */
const    TIME = 16182;       /* i: waiting for modification time (gzip) */
const    OS = 16183;         /* i: waiting for extra flags and operating system (gzip) */
const    EXLEN = 16184;      /* i: waiting for extra length (gzip) */
const    EXTRA = 16185;      /* i: waiting for extra bytes (gzip) */
const    NAME = 16186;       /* i: waiting for end of file name (gzip) */
const    COMMENT = 16187;    /* i: waiting for end of comment (gzip) */
const    HCRC = 16188;       /* i: waiting for header crc (gzip) */
const    DICTID = 16189;    /* i: waiting for dictionary check value */
const    DICT = 16190;      /* waiting for inflateSetDictionary() call */
const        TYPE = 16191;      /* i: waiting for type bits, including last-flag bit */
const        TYPEDO = 16192;    /* i: same, but skip check to exit inflate on new block */
const        STORED = 16193;    /* i: waiting for stored size (length and complement) */
const        COPY_ = 16194;     /* i/o: same as COPY below, but only first time in */
const        COPY = 16195;      /* i/o: waiting for input or output to copy stored block */
const        TABLE = 16196;     /* i: waiting for dynamic block table lengths */
const        LENLENS = 16197;   /* i: waiting for code length code lengths */
const        CODELENS = 16198;  /* i: waiting for length/lit and distance code lengths */
const            LEN_ = 16199;      /* i: same as LEN below, but only first time in */
const            LEN = 16200;       /* i: waiting for length/lit/eob code */
const            LENEXT = 16201;    /* i: waiting for length extra bits */
const            DIST = 16202;      /* i: waiting for distance code */
const            DISTEXT = 16203;   /* i: waiting for distance extra bits */
const            MATCH = 16204;     /* o: waiting for output space to copy string */
const            LIT = 16205;       /* o: waiting for output space to write literal */
const    CHECK = 16206;     /* i: waiting for 32-bit check value */
const    LENGTH = 16207;    /* i: waiting for 32-bit length (gzip) */
const    DONE = 16208;      /* finished check, done -- remain here until reset */
const    BAD = 16209;       /* got a data error -- remain here until reset */
const    MEM = 16210;       /* got an inflate() memory error -- remain here until reset */
const    SYNC = 16211;      /* looking for synchronization bytes to restart inflate() */

/* ===========================================================================*/



const ENOUGH_LENS = 852;
const ENOUGH_DISTS = 592;
//const ENOUGH =  (ENOUGH_LENS+ENOUGH_DISTS);

const MAX_WBITS = 15;
/* 32K LZ77 window */
const DEF_WBITS = MAX_WBITS;


const zswap32 = (q) => {

  return  (((q >>> 24) & 0xff) +
          ((q >>> 8) & 0xff00) +
          ((q & 0xff00) << 8) +
          ((q & 0xff) << 24));
};


function InflateState() {
  this.strm = null;           /* pointer back to this zlib stream */
  this.mode = 0;              /* current inflate mode */
  this.last = false;          /* true if processing last block */
  this.wrap = 0;              /* bit 0 true for zlib, bit 1 true for gzip,
                                 bit 2 true to validate check value */
  this.havedict = false;      /* true if dictionary provided */
  this.flags = 0;             /* gzip header method and flags (0 if zlib), or
                                 -1 if raw or no header yet */
  this.dmax = 0;              /* zlib header max distance (INFLATE_STRICT) */
  this.check = 0;             /* protected copy of check value */
  this.total = 0;             /* protected copy of output count */
  // TODO: may be {}
  this.head = null;           /* where to save gzip header information */

  /* sliding window */
  this.wbits = 0;             /* log base 2 of requested window size */
  this.wsize = 0;             /* window size or zero if not using window */
  this.whave = 0;             /* valid bytes in the window */
  this.wnext = 0;             /* window write index */
  this.window = null;         /* allocated sliding window, if needed */

  /* bit accumulator */
  this.hold = 0;              /* input bit accumulator */
  this.bits = 0;              /* number of bits in "in" */

  /* for string and stored block copying */
  this.length = 0;            /* literal or length of data to copy */
  this.offset = 0;            /* distance back to copy string from */

  /* for table and code decoding */
  this.extra = 0;             /* extra bits needed */

  /* fixed and dynamic code tables */
  this.lencode = null;          /* starting table for length/literal codes */
  this.distcode = null;         /* starting table for distance codes */
  this.lenbits = 0;           /* index bits for lencode */
  this.distbits = 0;          /* index bits for distcode */

  /* dynamic table building */
  this.ncode = 0;             /* number of code length code lengths */
  this.nlen = 0;              /* number of length code lengths */
  this.ndist = 0;             /* number of distance code lengths */
  this.have = 0;              /* number of code lengths in lens[] */
  this.next = null;              /* next available space in codes[] */

  this.lens = new Uint16Array(320); /* temporary storage for code lengths */
  this.work = new Uint16Array(288); /* work area for code table building */

  /*
   because we don't have pointers in js, we use lencode and distcode directly
   as buffers so we don't need codes
  */
  //this.codes = new Int32Array(ENOUGH);       /* space for code tables */
  this.lendyn = null;              /* dynamic table for length/literal codes (JS specific) */
  this.distdyn = null;             /* dynamic table for distance codes (JS specific) */
  this.sane = 0;                   /* if false, allow invalid distance too far */
  this.back = 0;                   /* bits back of last unprocessed length/lit */
  this.was = 0;                    /* initial length of match */
}


const inflateStateCheck = (strm) => {

  if (!strm) {
    return 1;
  }
  const state = strm.state;
  if (!state || state.strm !== strm ||
    state.mode < HEAD || state.mode > SYNC) {
    return 1;
  }
  return 0;
};


const inflateResetKeep = (strm) => {

  if (inflateStateCheck(strm)) { return Z_STREAM_ERROR$1; }
  const state = strm.state;
  strm.total_in = strm.total_out = state.total = 0;
  strm.msg = ''; /*Z_NULL*/
  if (state.wrap) {       /* to support ill-conceived Java test suite */
    strm.adler = state.wrap & 1;
  }
  state.mode = HEAD;
  state.last = 0;
  state.havedict = 0;
  state.flags = -1;
  state.dmax = 32768;
  state.head = null/*Z_NULL*/;
  state.hold = 0;
  state.bits = 0;
  //state.lencode = state.distcode = state.next = state.codes;
  state.lencode = state.lendyn = new Int32Array(ENOUGH_LENS);
  state.distcode = state.distdyn = new Int32Array(ENOUGH_DISTS);

  state.sane = 1;
  state.back = -1;
  //Tracev((stderr, "inflate: reset\n"));
  return Z_OK$1;
};


const inflateReset = (strm) => {

  if (inflateStateCheck(strm)) { return Z_STREAM_ERROR$1; }
  const state = strm.state;
  state.wsize = 0;
  state.whave = 0;
  state.wnext = 0;
  return inflateResetKeep(strm);

};


const inflateReset2 = (strm, windowBits) => {
  let wrap;

  /* get the state */
  if (inflateStateCheck(strm)) { return Z_STREAM_ERROR$1; }
  const state = strm.state;

  /* extract wrap request from windowBits parameter */
  if (windowBits < 0) {
    wrap = 0;
    windowBits = -windowBits;
  }
  else {
    wrap = (windowBits >> 4) + 5;
    if (windowBits < 48) {
      windowBits &= 15;
    }
  }

  /* set number of window bits, free window if different */
  if (windowBits && (windowBits < 8 || windowBits > 15)) {
    return Z_STREAM_ERROR$1;
  }
  if (state.window !== null && state.wbits !== windowBits) {
    state.window = null;
  }

  /* update state and reset the rest of it */
  state.wrap = wrap;
  state.wbits = windowBits;
  return inflateReset(strm);
};


const inflateInit2 = (strm, windowBits) => {

  if (!strm) { return Z_STREAM_ERROR$1; }
  //strm.msg = Z_NULL;                 /* in case we return an error */

  const state = new InflateState();

  //if (state === Z_NULL) return Z_MEM_ERROR;
  //Tracev((stderr, "inflate: allocated\n"));
  strm.state = state;
  state.strm = strm;
  state.window = null/*Z_NULL*/;
  state.mode = HEAD;     /* to pass state test in inflateReset2() */
  const ret = inflateReset2(strm, windowBits);
  if (ret !== Z_OK$1) {
    strm.state = null/*Z_NULL*/;
  }
  return ret;
};


const inflateInit = (strm) => {

  return inflateInit2(strm, DEF_WBITS);
};


/*
 Return state with length and distance decoding tables and index sizes set to
 fixed code decoding.  Normally this returns fixed tables from inffixed.h.
 If BUILDFIXED is defined, then instead this routine builds the tables the
 first time it's called, and returns those tables the first time and
 thereafter.  This reduces the size of the code by about 2K bytes, in
 exchange for a little execution time.  However, BUILDFIXED should not be
 used for threaded applications, since the rewriting of the tables and virgin
 may not be thread-safe.
 */
let virgin = true;

let lenfix, distfix; // We have no pointers in JS, so keep tables separate


const fixedtables = (state) => {

  /* build fixed huffman tables if first call (may not be thread safe) */
  if (virgin) {
    lenfix = new Int32Array(512);
    distfix = new Int32Array(32);

    /* literal/length table */
    let sym = 0;
    while (sym < 144) { state.lens[sym++] = 8; }
    while (sym < 256) { state.lens[sym++] = 9; }
    while (sym < 280) { state.lens[sym++] = 7; }
    while (sym < 288) { state.lens[sym++] = 8; }

    inftrees(LENS,  state.lens, 0, 288, lenfix,   0, state.work, { bits: 9 });

    /* distance table */
    sym = 0;
    while (sym < 32) { state.lens[sym++] = 5; }

    inftrees(DISTS, state.lens, 0, 32,   distfix, 0, state.work, { bits: 5 });

    /* do this just once */
    virgin = false;
  }

  state.lencode = lenfix;
  state.lenbits = 9;
  state.distcode = distfix;
  state.distbits = 5;
};


/*
 Update the window with the last wsize (normally 32K) bytes written before
 returning.  If window does not exist yet, create it.  This is only called
 when a window is already in use, or when output has been written during this
 inflate call, but the end of the deflate stream has not been reached yet.
 It is also called to create a window for dictionary data when a dictionary
 is loaded.

 Providing output buffers larger than 32K to inflate() should provide a speed
 advantage, since only the last 32K of output is copied to the sliding window
 upon return from inflate(), and since all distances after the first 32K of
 output will fall in the output data, making match copies simpler and faster.
 The advantage may be dependent on the size of the processor's data caches.
 */
const updatewindow = (strm, src, end, copy) => {

  let dist;
  const state = strm.state;

  /* if it hasn't been done already, allocate space for the window */
  if (state.window === null) {
    state.wsize = 1 << state.wbits;
    state.wnext = 0;
    state.whave = 0;

    state.window = new Uint8Array(state.wsize);
  }

  /* copy state->wsize or less output bytes into the circular window */
  if (copy >= state.wsize) {
    state.window.set(src.subarray(end - state.wsize, end), 0);
    state.wnext = 0;
    state.whave = state.wsize;
  }
  else {
    dist = state.wsize - state.wnext;
    if (dist > copy) {
      dist = copy;
    }
    //zmemcpy(state->window + state->wnext, end - copy, dist);
    state.window.set(src.subarray(end - copy, end - copy + dist), state.wnext);
    copy -= dist;
    if (copy) {
      //zmemcpy(state->window, end - copy, copy);
      state.window.set(src.subarray(end - copy, end), 0);
      state.wnext = copy;
      state.whave = state.wsize;
    }
    else {
      state.wnext += dist;
      if (state.wnext === state.wsize) { state.wnext = 0; }
      if (state.whave < state.wsize) { state.whave += dist; }
    }
  }
  return 0;
};


const inflate$2 = (strm, flush) => {

  let state;
  let input, output;          // input/output buffers
  let next;                   /* next input INDEX */
  let put;                    /* next output INDEX */
  let have, left;             /* available input and output */
  let hold;                   /* bit buffer */
  let bits;                   /* bits in bit buffer */
  let _in, _out;              /* save starting available input and output */
  let copy;                   /* number of stored or match bytes to copy */
  let from;                   /* where to copy match bytes from */
  let from_source;
  let here = 0;               /* current decoding table entry */
  let here_bits, here_op, here_val; // paked "here" denormalized (JS specific)
  //let last;                   /* parent table entry */
  let last_bits, last_op, last_val; // paked "last" denormalized (JS specific)
  let len;                    /* length to copy for repeats, bits to drop */
  let ret;                    /* return code */
  const hbuf = new Uint8Array(4);    /* buffer for gzip header crc calculation */
  let opts;

  let n; // temporary variable for NEED_BITS

  const order = /* permutation of code lengths */
    new Uint8Array([ 16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15 ]);


  if (inflateStateCheck(strm) || !strm.output ||
      (!strm.input && strm.avail_in !== 0)) {
    return Z_STREAM_ERROR$1;
  }

  state = strm.state;
  if (state.mode === TYPE) { state.mode = TYPEDO; }    /* skip check */


  //--- LOAD() ---
  put = strm.next_out;
  output = strm.output;
  left = strm.avail_out;
  next = strm.next_in;
  input = strm.input;
  have = strm.avail_in;
  hold = state.hold;
  bits = state.bits;
  //---

  _in = have;
  _out = left;
  ret = Z_OK$1;

  inf_leave: // goto emulation
  for (;;) {
    switch (state.mode) {
      case HEAD:
        if (state.wrap === 0) {
          state.mode = TYPEDO;
          break;
        }
        //=== NEEDBITS(16);
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if ((state.wrap & 2) && hold === 0x8b1f) {  /* gzip header */
          if (state.wbits === 0) {
            state.wbits = 15;
          }
          state.check = 0/*crc32(0L, Z_NULL, 0)*/;
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          state.check = crc32_1(state.check, hbuf, 2, 0);
          //===//

          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          state.mode = FLAGS;
          break;
        }
        if (state.head) {
          state.head.done = false;
        }
        if (!(state.wrap & 1) ||   /* check if zlib header allowed */
          (((hold & 0xff)/*BITS(8)*/ << 8) + (hold >> 8)) % 31) {
          strm.msg = 'incorrect header check';
          state.mode = BAD;
          break;
        }
        if ((hold & 0x0f)/*BITS(4)*/ !== Z_DEFLATED) {
          strm.msg = 'unknown compression method';
          state.mode = BAD;
          break;
        }
        //--- DROPBITS(4) ---//
        hold >>>= 4;
        bits -= 4;
        //---//
        len = (hold & 0x0f)/*BITS(4)*/ + 8;
        if (state.wbits === 0) {
          state.wbits = len;
        }
        if (len > 15 || len > state.wbits) {
          strm.msg = 'invalid window size';
          state.mode = BAD;
          break;
        }

        // !!! pako patch. Force use `options.windowBits` if passed.
        // Required to always use max window size by default.
        state.dmax = 1 << state.wbits;
        //state.dmax = 1 << len;

        state.flags = 0;               /* indicate zlib header */
        //Tracev((stderr, "inflate:   zlib header ok\n"));
        strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;
        state.mode = hold & 0x200 ? DICTID : TYPE;
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        break;
      case FLAGS:
        //=== NEEDBITS(16); */
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.flags = hold;
        if ((state.flags & 0xff) !== Z_DEFLATED) {
          strm.msg = 'unknown compression method';
          state.mode = BAD;
          break;
        }
        if (state.flags & 0xe000) {
          strm.msg = 'unknown header flags set';
          state.mode = BAD;
          break;
        }
        if (state.head) {
          state.head.text = ((hold >> 8) & 1);
        }
        if ((state.flags & 0x0200) && (state.wrap & 4)) {
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          state.check = crc32_1(state.check, hbuf, 2, 0);
          //===//
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = TIME;
        /* falls through */
      case TIME:
        //=== NEEDBITS(32); */
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if (state.head) {
          state.head.time = hold;
        }
        if ((state.flags & 0x0200) && (state.wrap & 4)) {
          //=== CRC4(state.check, hold)
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          hbuf[2] = (hold >>> 16) & 0xff;
          hbuf[3] = (hold >>> 24) & 0xff;
          state.check = crc32_1(state.check, hbuf, 4, 0);
          //===
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = OS;
        /* falls through */
      case OS:
        //=== NEEDBITS(16); */
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if (state.head) {
          state.head.xflags = (hold & 0xff);
          state.head.os = (hold >> 8);
        }
        if ((state.flags & 0x0200) && (state.wrap & 4)) {
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          state.check = crc32_1(state.check, hbuf, 2, 0);
          //===//
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = EXLEN;
        /* falls through */
      case EXLEN:
        if (state.flags & 0x0400) {
          //=== NEEDBITS(16); */
          while (bits < 16) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.length = hold;
          if (state.head) {
            state.head.extra_len = hold;
          }
          if ((state.flags & 0x0200) && (state.wrap & 4)) {
            //=== CRC2(state.check, hold);
            hbuf[0] = hold & 0xff;
            hbuf[1] = (hold >>> 8) & 0xff;
            state.check = crc32_1(state.check, hbuf, 2, 0);
            //===//
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
        }
        else if (state.head) {
          state.head.extra = null/*Z_NULL*/;
        }
        state.mode = EXTRA;
        /* falls through */
      case EXTRA:
        if (state.flags & 0x0400) {
          copy = state.length;
          if (copy > have) { copy = have; }
          if (copy) {
            if (state.head) {
              len = state.head.extra_len - state.length;
              if (!state.head.extra) {
                // Use untyped array for more convenient processing later
                state.head.extra = new Uint8Array(state.head.extra_len);
              }
              state.head.extra.set(
                input.subarray(
                  next,
                  // extra field is limited to 65536 bytes
                  // - no need for additional size check
                  next + copy
                ),
                /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
                len
              );
              //zmemcpy(state.head.extra + len, next,
              //        len + copy > state.head.extra_max ?
              //        state.head.extra_max - len : copy);
            }
            if ((state.flags & 0x0200) && (state.wrap & 4)) {
              state.check = crc32_1(state.check, input, copy, next);
            }
            have -= copy;
            next += copy;
            state.length -= copy;
          }
          if (state.length) { break inf_leave; }
        }
        state.length = 0;
        state.mode = NAME;
        /* falls through */
      case NAME:
        if (state.flags & 0x0800) {
          if (have === 0) { break inf_leave; }
          copy = 0;
          do {
            // TODO: 2 or 1 bytes?
            len = input[next + copy++];
            /* use constant limit because in js we should not preallocate memory */
            if (state.head && len &&
                (state.length < 65536 /*state.head.name_max*/)) {
              state.head.name += String.fromCharCode(len);
            }
          } while (len && copy < have);

          if ((state.flags & 0x0200) && (state.wrap & 4)) {
            state.check = crc32_1(state.check, input, copy, next);
          }
          have -= copy;
          next += copy;
          if (len) { break inf_leave; }
        }
        else if (state.head) {
          state.head.name = null;
        }
        state.length = 0;
        state.mode = COMMENT;
        /* falls through */
      case COMMENT:
        if (state.flags & 0x1000) {
          if (have === 0) { break inf_leave; }
          copy = 0;
          do {
            len = input[next + copy++];
            /* use constant limit because in js we should not preallocate memory */
            if (state.head && len &&
                (state.length < 65536 /*state.head.comm_max*/)) {
              state.head.comment += String.fromCharCode(len);
            }
          } while (len && copy < have);
          if ((state.flags & 0x0200) && (state.wrap & 4)) {
            state.check = crc32_1(state.check, input, copy, next);
          }
          have -= copy;
          next += copy;
          if (len) { break inf_leave; }
        }
        else if (state.head) {
          state.head.comment = null;
        }
        state.mode = HCRC;
        /* falls through */
      case HCRC:
        if (state.flags & 0x0200) {
          //=== NEEDBITS(16); */
          while (bits < 16) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          if ((state.wrap & 4) && hold !== (state.check & 0xffff)) {
            strm.msg = 'header crc mismatch';
            state.mode = BAD;
            break;
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
        }
        if (state.head) {
          state.head.hcrc = ((state.flags >> 9) & 1);
          state.head.done = true;
        }
        strm.adler = state.check = 0;
        state.mode = TYPE;
        break;
      case DICTID:
        //=== NEEDBITS(32); */
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        strm.adler = state.check = zswap32(hold);
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = DICT;
        /* falls through */
      case DICT:
        if (state.havedict === 0) {
          //--- RESTORE() ---
          strm.next_out = put;
          strm.avail_out = left;
          strm.next_in = next;
          strm.avail_in = have;
          state.hold = hold;
          state.bits = bits;
          //---
          return Z_NEED_DICT$1;
        }
        strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;
        state.mode = TYPE;
        /* falls through */
      case TYPE:
        if (flush === Z_BLOCK || flush === Z_TREES) { break inf_leave; }
        /* falls through */
      case TYPEDO:
        if (state.last) {
          //--- BYTEBITS() ---//
          hold >>>= bits & 7;
          bits -= bits & 7;
          //---//
          state.mode = CHECK;
          break;
        }
        //=== NEEDBITS(3); */
        while (bits < 3) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.last = (hold & 0x01)/*BITS(1)*/;
        //--- DROPBITS(1) ---//
        hold >>>= 1;
        bits -= 1;
        //---//

        switch ((hold & 0x03)/*BITS(2)*/) {
          case 0:                             /* stored block */
            //Tracev((stderr, "inflate:     stored block%s\n",
            //        state.last ? " (last)" : ""));
            state.mode = STORED;
            break;
          case 1:                             /* fixed block */
            fixedtables(state);
            //Tracev((stderr, "inflate:     fixed codes block%s\n",
            //        state.last ? " (last)" : ""));
            state.mode = LEN_;             /* decode codes */
            if (flush === Z_TREES) {
              //--- DROPBITS(2) ---//
              hold >>>= 2;
              bits -= 2;
              //---//
              break inf_leave;
            }
            break;
          case 2:                             /* dynamic block */
            //Tracev((stderr, "inflate:     dynamic codes block%s\n",
            //        state.last ? " (last)" : ""));
            state.mode = TABLE;
            break;
          case 3:
            strm.msg = 'invalid block type';
            state.mode = BAD;
        }
        //--- DROPBITS(2) ---//
        hold >>>= 2;
        bits -= 2;
        //---//
        break;
      case STORED:
        //--- BYTEBITS() ---// /* go to byte boundary */
        hold >>>= bits & 7;
        bits -= bits & 7;
        //---//
        //=== NEEDBITS(32); */
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if ((hold & 0xffff) !== ((hold >>> 16) ^ 0xffff)) {
          strm.msg = 'invalid stored block lengths';
          state.mode = BAD;
          break;
        }
        state.length = hold & 0xffff;
        //Tracev((stderr, "inflate:       stored length %u\n",
        //        state.length));
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = COPY_;
        if (flush === Z_TREES) { break inf_leave; }
        /* falls through */
      case COPY_:
        state.mode = COPY;
        /* falls through */
      case COPY:
        copy = state.length;
        if (copy) {
          if (copy > have) { copy = have; }
          if (copy > left) { copy = left; }
          if (copy === 0) { break inf_leave; }
          //--- zmemcpy(put, next, copy); ---
          output.set(input.subarray(next, next + copy), put);
          //---//
          have -= copy;
          next += copy;
          left -= copy;
          put += copy;
          state.length -= copy;
          break;
        }
        //Tracev((stderr, "inflate:       stored end\n"));
        state.mode = TYPE;
        break;
      case TABLE:
        //=== NEEDBITS(14); */
        while (bits < 14) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.nlen = (hold & 0x1f)/*BITS(5)*/ + 257;
        //--- DROPBITS(5) ---//
        hold >>>= 5;
        bits -= 5;
        //---//
        state.ndist = (hold & 0x1f)/*BITS(5)*/ + 1;
        //--- DROPBITS(5) ---//
        hold >>>= 5;
        bits -= 5;
        //---//
        state.ncode = (hold & 0x0f)/*BITS(4)*/ + 4;
        //--- DROPBITS(4) ---//
        hold >>>= 4;
        bits -= 4;
        //---//
//#ifndef PKZIP_BUG_WORKAROUND
        if (state.nlen > 286 || state.ndist > 30) {
          strm.msg = 'too many length or distance symbols';
          state.mode = BAD;
          break;
        }
//#endif
        //Tracev((stderr, "inflate:       table sizes ok\n"));
        state.have = 0;
        state.mode = LENLENS;
        /* falls through */
      case LENLENS:
        while (state.have < state.ncode) {
          //=== NEEDBITS(3);
          while (bits < 3) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.lens[order[state.have++]] = (hold & 0x07);//BITS(3);
          //--- DROPBITS(3) ---//
          hold >>>= 3;
          bits -= 3;
          //---//
        }
        while (state.have < 19) {
          state.lens[order[state.have++]] = 0;
        }
        // We have separate tables & no pointers. 2 commented lines below not needed.
        //state.next = state.codes;
        //state.lencode = state.next;
        // Switch to use dynamic table
        state.lencode = state.lendyn;
        state.lenbits = 7;

        opts = { bits: state.lenbits };
        ret = inftrees(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
        state.lenbits = opts.bits;

        if (ret) {
          strm.msg = 'invalid code lengths set';
          state.mode = BAD;
          break;
        }
        //Tracev((stderr, "inflate:       code lengths ok\n"));
        state.have = 0;
        state.mode = CODELENS;
        /* falls through */
      case CODELENS:
        while (state.have < state.nlen + state.ndist) {
          for (;;) {
            here = state.lencode[hold & ((1 << state.lenbits) - 1)];/*BITS(state.lenbits)*/
            here_bits = here >>> 24;
            here_op = (here >>> 16) & 0xff;
            here_val = here & 0xffff;

            if ((here_bits) <= bits) { break; }
            //--- PULLBYTE() ---//
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
            //---//
          }
          if (here_val < 16) {
            //--- DROPBITS(here.bits) ---//
            hold >>>= here_bits;
            bits -= here_bits;
            //---//
            state.lens[state.have++] = here_val;
          }
          else {
            if (here_val === 16) {
              //=== NEEDBITS(here.bits + 2);
              n = here_bits + 2;
              while (bits < n) {
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              //--- DROPBITS(here.bits) ---//
              hold >>>= here_bits;
              bits -= here_bits;
              //---//
              if (state.have === 0) {
                strm.msg = 'invalid bit length repeat';
                state.mode = BAD;
                break;
              }
              len = state.lens[state.have - 1];
              copy = 3 + (hold & 0x03);//BITS(2);
              //--- DROPBITS(2) ---//
              hold >>>= 2;
              bits -= 2;
              //---//
            }
            else if (here_val === 17) {
              //=== NEEDBITS(here.bits + 3);
              n = here_bits + 3;
              while (bits < n) {
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              //--- DROPBITS(here.bits) ---//
              hold >>>= here_bits;
              bits -= here_bits;
              //---//
              len = 0;
              copy = 3 + (hold & 0x07);//BITS(3);
              //--- DROPBITS(3) ---//
              hold >>>= 3;
              bits -= 3;
              //---//
            }
            else {
              //=== NEEDBITS(here.bits + 7);
              n = here_bits + 7;
              while (bits < n) {
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              //--- DROPBITS(here.bits) ---//
              hold >>>= here_bits;
              bits -= here_bits;
              //---//
              len = 0;
              copy = 11 + (hold & 0x7f);//BITS(7);
              //--- DROPBITS(7) ---//
              hold >>>= 7;
              bits -= 7;
              //---//
            }
            if (state.have + copy > state.nlen + state.ndist) {
              strm.msg = 'invalid bit length repeat';
              state.mode = BAD;
              break;
            }
            while (copy--) {
              state.lens[state.have++] = len;
            }
          }
        }

        /* handle error breaks in while */
        if (state.mode === BAD) { break; }

        /* check for end-of-block code (better have one) */
        if (state.lens[256] === 0) {
          strm.msg = 'invalid code -- missing end-of-block';
          state.mode = BAD;
          break;
        }

        /* build code tables -- note: do not change the lenbits or distbits
           values here (9 and 6) without reading the comments in inftrees.h
           concerning the ENOUGH constants, which depend on those values */
        state.lenbits = 9;

        opts = { bits: state.lenbits };
        ret = inftrees(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
        // We have separate tables & no pointers. 2 commented lines below not needed.
        // state.next_index = opts.table_index;
        state.lenbits = opts.bits;
        // state.lencode = state.next;

        if (ret) {
          strm.msg = 'invalid literal/lengths set';
          state.mode = BAD;
          break;
        }

        state.distbits = 6;
        //state.distcode.copy(state.codes);
        // Switch to use dynamic table
        state.distcode = state.distdyn;
        opts = { bits: state.distbits };
        ret = inftrees(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
        // We have separate tables & no pointers. 2 commented lines below not needed.
        // state.next_index = opts.table_index;
        state.distbits = opts.bits;
        // state.distcode = state.next;

        if (ret) {
          strm.msg = 'invalid distances set';
          state.mode = BAD;
          break;
        }
        //Tracev((stderr, 'inflate:       codes ok\n'));
        state.mode = LEN_;
        if (flush === Z_TREES) { break inf_leave; }
        /* falls through */
      case LEN_:
        state.mode = LEN;
        /* falls through */
      case LEN:
        if (have >= 6 && left >= 258) {
          //--- RESTORE() ---
          strm.next_out = put;
          strm.avail_out = left;
          strm.next_in = next;
          strm.avail_in = have;
          state.hold = hold;
          state.bits = bits;
          //---
          inffast(strm, _out);
          //--- LOAD() ---
          put = strm.next_out;
          output = strm.output;
          left = strm.avail_out;
          next = strm.next_in;
          input = strm.input;
          have = strm.avail_in;
          hold = state.hold;
          bits = state.bits;
          //---

          if (state.mode === TYPE) {
            state.back = -1;
          }
          break;
        }
        state.back = 0;
        for (;;) {
          here = state.lencode[hold & ((1 << state.lenbits) - 1)];  /*BITS(state.lenbits)*/
          here_bits = here >>> 24;
          here_op = (here >>> 16) & 0xff;
          here_val = here & 0xffff;

          if (here_bits <= bits) { break; }
          //--- PULLBYTE() ---//
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
          //---//
        }
        if (here_op && (here_op & 0xf0) === 0) {
          last_bits = here_bits;
          last_op = here_op;
          last_val = here_val;
          for (;;) {
            here = state.lencode[last_val +
                    ((hold & ((1 << (last_bits + last_op)) - 1))/*BITS(last.bits + last.op)*/ >> last_bits)];
            here_bits = here >>> 24;
            here_op = (here >>> 16) & 0xff;
            here_val = here & 0xffff;

            if ((last_bits + here_bits) <= bits) { break; }
            //--- PULLBYTE() ---//
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
            //---//
          }
          //--- DROPBITS(last.bits) ---//
          hold >>>= last_bits;
          bits -= last_bits;
          //---//
          state.back += last_bits;
        }
        //--- DROPBITS(here.bits) ---//
        hold >>>= here_bits;
        bits -= here_bits;
        //---//
        state.back += here_bits;
        state.length = here_val;
        if (here_op === 0) {
          //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
          //        "inflate:         literal '%c'\n" :
          //        "inflate:         literal 0x%02x\n", here.val));
          state.mode = LIT;
          break;
        }
        if (here_op & 32) {
          //Tracevv((stderr, "inflate:         end of block\n"));
          state.back = -1;
          state.mode = TYPE;
          break;
        }
        if (here_op & 64) {
          strm.msg = 'invalid literal/length code';
          state.mode = BAD;
          break;
        }
        state.extra = here_op & 15;
        state.mode = LENEXT;
        /* falls through */
      case LENEXT:
        if (state.extra) {
          //=== NEEDBITS(state.extra);
          n = state.extra;
          while (bits < n) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.length += hold & ((1 << state.extra) - 1)/*BITS(state.extra)*/;
          //--- DROPBITS(state.extra) ---//
          hold >>>= state.extra;
          bits -= state.extra;
          //---//
          state.back += state.extra;
        }
        //Tracevv((stderr, "inflate:         length %u\n", state.length));
        state.was = state.length;
        state.mode = DIST;
        /* falls through */
      case DIST:
        for (;;) {
          here = state.distcode[hold & ((1 << state.distbits) - 1)];/*BITS(state.distbits)*/
          here_bits = here >>> 24;
          here_op = (here >>> 16) & 0xff;
          here_val = here & 0xffff;

          if ((here_bits) <= bits) { break; }
          //--- PULLBYTE() ---//
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
          //---//
        }
        if ((here_op & 0xf0) === 0) {
          last_bits = here_bits;
          last_op = here_op;
          last_val = here_val;
          for (;;) {
            here = state.distcode[last_val +
                    ((hold & ((1 << (last_bits + last_op)) - 1))/*BITS(last.bits + last.op)*/ >> last_bits)];
            here_bits = here >>> 24;
            here_op = (here >>> 16) & 0xff;
            here_val = here & 0xffff;

            if ((last_bits + here_bits) <= bits) { break; }
            //--- PULLBYTE() ---//
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
            //---//
          }
          //--- DROPBITS(last.bits) ---//
          hold >>>= last_bits;
          bits -= last_bits;
          //---//
          state.back += last_bits;
        }
        //--- DROPBITS(here.bits) ---//
        hold >>>= here_bits;
        bits -= here_bits;
        //---//
        state.back += here_bits;
        if (here_op & 64) {
          strm.msg = 'invalid distance code';
          state.mode = BAD;
          break;
        }
        state.offset = here_val;
        state.extra = (here_op) & 15;
        state.mode = DISTEXT;
        /* falls through */
      case DISTEXT:
        if (state.extra) {
          //=== NEEDBITS(state.extra);
          n = state.extra;
          while (bits < n) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.offset += hold & ((1 << state.extra) - 1)/*BITS(state.extra)*/;
          //--- DROPBITS(state.extra) ---//
          hold >>>= state.extra;
          bits -= state.extra;
          //---//
          state.back += state.extra;
        }
//#ifdef INFLATE_STRICT
        if (state.offset > state.dmax) {
          strm.msg = 'invalid distance too far back';
          state.mode = BAD;
          break;
        }
//#endif
        //Tracevv((stderr, "inflate:         distance %u\n", state.offset));
        state.mode = MATCH;
        /* falls through */
      case MATCH:
        if (left === 0) { break inf_leave; }
        copy = _out - left;
        if (state.offset > copy) {         /* copy from window */
          copy = state.offset - copy;
          if (copy > state.whave) {
            if (state.sane) {
              strm.msg = 'invalid distance too far back';
              state.mode = BAD;
              break;
            }
// (!) This block is disabled in zlib defaults,
// don't enable it for binary compatibility
//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
//          Trace((stderr, "inflate.c too far\n"));
//          copy -= state.whave;
//          if (copy > state.length) { copy = state.length; }
//          if (copy > left) { copy = left; }
//          left -= copy;
//          state.length -= copy;
//          do {
//            output[put++] = 0;
//          } while (--copy);
//          if (state.length === 0) { state.mode = LEN; }
//          break;
//#endif
          }
          if (copy > state.wnext) {
            copy -= state.wnext;
            from = state.wsize - copy;
          }
          else {
            from = state.wnext - copy;
          }
          if (copy > state.length) { copy = state.length; }
          from_source = state.window;
        }
        else {                              /* copy from output */
          from_source = output;
          from = put - state.offset;
          copy = state.length;
        }
        if (copy > left) { copy = left; }
        left -= copy;
        state.length -= copy;
        do {
          output[put++] = from_source[from++];
        } while (--copy);
        if (state.length === 0) { state.mode = LEN; }
        break;
      case LIT:
        if (left === 0) { break inf_leave; }
        output[put++] = state.length;
        left--;
        state.mode = LEN;
        break;
      case CHECK:
        if (state.wrap) {
          //=== NEEDBITS(32);
          while (bits < 32) {
            if (have === 0) { break inf_leave; }
            have--;
            // Use '|' instead of '+' to make sure that result is signed
            hold |= input[next++] << bits;
            bits += 8;
          }
          //===//
          _out -= left;
          strm.total_out += _out;
          state.total += _out;
          if ((state.wrap & 4) && _out) {
            strm.adler = state.check =
                /*UPDATE_CHECK(state.check, put - _out, _out);*/
                (state.flags ? crc32_1(state.check, output, _out, put - _out) : adler32_1(state.check, output, _out, put - _out));

          }
          _out = left;
          // NB: crc32 stored as signed 32-bit int, zswap32 returns signed too
          if ((state.wrap & 4) && (state.flags ? hold : zswap32(hold)) !== state.check) {
            strm.msg = 'incorrect data check';
            state.mode = BAD;
            break;
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          //Tracev((stderr, "inflate:   check matches trailer\n"));
        }
        state.mode = LENGTH;
        /* falls through */
      case LENGTH:
        if (state.wrap && state.flags) {
          //=== NEEDBITS(32);
          while (bits < 32) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          if ((state.wrap & 4) && hold !== (state.total & 0xffffffff)) {
            strm.msg = 'incorrect length check';
            state.mode = BAD;
            break;
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          //Tracev((stderr, "inflate:   length matches trailer\n"));
        }
        state.mode = DONE;
        /* falls through */
      case DONE:
        ret = Z_STREAM_END$1;
        break inf_leave;
      case BAD:
        ret = Z_DATA_ERROR$1;
        break inf_leave;
      case MEM:
        return Z_MEM_ERROR$1;
      case SYNC:
        /* falls through */
      default:
        return Z_STREAM_ERROR$1;
    }
  }

  // inf_leave <- here is real place for "goto inf_leave", emulated via "break inf_leave"

  /*
     Return from inflate(), updating the total counts and the check value.
     If there was no progress during the inflate() call, return a buffer
     error.  Call updatewindow() to create and/or update the window state.
     Note: a memory error from inflate() is non-recoverable.
   */

  //--- RESTORE() ---
  strm.next_out = put;
  strm.avail_out = left;
  strm.next_in = next;
  strm.avail_in = have;
  state.hold = hold;
  state.bits = bits;
  //---

  if (state.wsize || (_out !== strm.avail_out && state.mode < BAD &&
                      (state.mode < CHECK || flush !== Z_FINISH$1))) {
    if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) ;
  }
  _in -= strm.avail_in;
  _out -= strm.avail_out;
  strm.total_in += _in;
  strm.total_out += _out;
  state.total += _out;
  if ((state.wrap & 4) && _out) {
    strm.adler = state.check = /*UPDATE_CHECK(state.check, strm.next_out - _out, _out);*/
      (state.flags ? crc32_1(state.check, output, _out, strm.next_out - _out) : adler32_1(state.check, output, _out, strm.next_out - _out));
  }
  strm.data_type = state.bits + (state.last ? 64 : 0) +
                    (state.mode === TYPE ? 128 : 0) +
                    (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
  if (((_in === 0 && _out === 0) || flush === Z_FINISH$1) && ret === Z_OK$1) {
    ret = Z_BUF_ERROR;
  }
  return ret;
};


const inflateEnd = (strm) => {

  if (inflateStateCheck(strm)) {
    return Z_STREAM_ERROR$1;
  }

  let state = strm.state;
  if (state.window) {
    state.window = null;
  }
  strm.state = null;
  return Z_OK$1;
};


const inflateGetHeader = (strm, head) => {

  /* check state */
  if (inflateStateCheck(strm)) { return Z_STREAM_ERROR$1; }
  const state = strm.state;
  if ((state.wrap & 2) === 0) { return Z_STREAM_ERROR$1; }

  /* save header structure */
  state.head = head;
  head.done = false;
  return Z_OK$1;
};


const inflateSetDictionary = (strm, dictionary) => {
  const dictLength = dictionary.length;

  let state;
  let dictid;
  let ret;

  /* check state */
  if (inflateStateCheck(strm)) { return Z_STREAM_ERROR$1; }
  state = strm.state;

  if (state.wrap !== 0 && state.mode !== DICT) {
    return Z_STREAM_ERROR$1;
  }

  /* check for correct dictionary identifier */
  if (state.mode === DICT) {
    dictid = 1; /* adler32(0, null, 0)*/
    /* dictid = adler32(dictid, dictionary, dictLength); */
    dictid = adler32_1(dictid, dictionary, dictLength, 0);
    if (dictid !== state.check) {
      return Z_DATA_ERROR$1;
    }
  }
  /* copy dictionary to window using updatewindow(), which will amend the
   existing dictionary if appropriate */
  ret = updatewindow(strm, dictionary, dictLength, dictLength);
  if (ret) {
    state.mode = MEM;
    return Z_MEM_ERROR$1;
  }
  state.havedict = 1;
  // Tracev((stderr, "inflate:   dictionary set\n"));
  return Z_OK$1;
};


var inflateReset_1 = inflateReset;
var inflateReset2_1 = inflateReset2;
var inflateResetKeep_1 = inflateResetKeep;
var inflateInit_1 = inflateInit;
var inflateInit2_1 = inflateInit2;
var inflate_2$1 = inflate$2;
var inflateEnd_1 = inflateEnd;
var inflateGetHeader_1 = inflateGetHeader;
var inflateSetDictionary_1 = inflateSetDictionary;
var inflateInfo = 'pako inflate (from Nodeca project)';

/* Not implemented
module.exports.inflateCodesUsed = inflateCodesUsed;
module.exports.inflateCopy = inflateCopy;
module.exports.inflateGetDictionary = inflateGetDictionary;
module.exports.inflateMark = inflateMark;
module.exports.inflatePrime = inflatePrime;
module.exports.inflateSync = inflateSync;
module.exports.inflateSyncPoint = inflateSyncPoint;
module.exports.inflateUndermine = inflateUndermine;
module.exports.inflateValidate = inflateValidate;
*/

var inflate_1$2 = {
	inflateReset: inflateReset_1,
	inflateReset2: inflateReset2_1,
	inflateResetKeep: inflateResetKeep_1,
	inflateInit: inflateInit_1,
	inflateInit2: inflateInit2_1,
	inflate: inflate_2$1,
	inflateEnd: inflateEnd_1,
	inflateGetHeader: inflateGetHeader_1,
	inflateSetDictionary: inflateSetDictionary_1,
	inflateInfo: inflateInfo
};

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

function GZheader() {
  /* true if compressed data believed to be text */
  this.text       = 0;
  /* modification time */
  this.time       = 0;
  /* extra flags (not used when writing a gzip file) */
  this.xflags     = 0;
  /* operating system */
  this.os         = 0;
  /* pointer to extra field or Z_NULL if none */
  this.extra      = null;
  /* extra field length (valid if extra != Z_NULL) */
  this.extra_len  = 0; // Actually, we don't need it in JS,
                       // but leave for few code modifications

  //
  // Setup limits is not necessary because in js we should not preallocate memory
  // for inflate use constant limit in 65536 bytes
  //

  /* space at extra (only when reading header) */
  // this.extra_max  = 0;
  /* pointer to zero-terminated file name or Z_NULL */
  this.name       = '';
  /* space at name (only when reading header) */
  // this.name_max   = 0;
  /* pointer to zero-terminated comment or Z_NULL */
  this.comment    = '';
  /* space at comment (only when reading header) */
  // this.comm_max   = 0;
  /* true if there was or will be a header crc */
  this.hcrc       = 0;
  /* true when done reading gzip header (not used when writing a gzip file) */
  this.done       = false;
}

var gzheader = GZheader;

const toString = Object.prototype.toString;

/* Public constants ==========================================================*/
/* ===========================================================================*/

const {
  Z_NO_FLUSH, Z_FINISH,
  Z_OK, Z_STREAM_END, Z_NEED_DICT, Z_STREAM_ERROR, Z_DATA_ERROR, Z_MEM_ERROR
} = constants$2;

/* ===========================================================================*/


/**
 * class Inflate
 *
 * Generic JS-style wrapper for zlib calls. If you don't need
 * streaming behaviour - use more simple functions: [[inflate]]
 * and [[inflateRaw]].
 **/

/* internal
 * inflate.chunks -> Array
 *
 * Chunks of output data, if [[Inflate#onData]] not overridden.
 **/

/**
 * Inflate.result -> Uint8Array|String
 *
 * Uncompressed result, generated by default [[Inflate#onData]]
 * and [[Inflate#onEnd]] handlers. Filled after you push last chunk
 * (call [[Inflate#push]] with `Z_FINISH` / `true` param).
 **/

/**
 * Inflate.err -> Number
 *
 * Error code after inflate finished. 0 (Z_OK) on success.
 * Should be checked if broken data possible.
 **/

/**
 * Inflate.msg -> String
 *
 * Error message, if [[Inflate.err]] != 0
 **/


/**
 * new Inflate(options)
 * - options (Object): zlib inflate options.
 *
 * Creates new inflator instance with specified params. Throws exception
 * on bad params. Supported options:
 *
 * - `windowBits`
 * - `dictionary`
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Additional options, for internal needs:
 *
 * - `chunkSize` - size of generated data chunks (16K by default)
 * - `raw` (Boolean) - do raw inflate
 * - `to` (String) - if equal to 'string', then result will be converted
 *   from utf8 to utf16 (javascript) string. When string output requested,
 *   chunk length can differ from `chunkSize`, depending on content.
 *
 * By default, when no options set, autodetect deflate/gzip data format via
 * wrapper header.
 *
 * ##### Example:
 *
 * ```javascript
 * const pako = require('pako')
 * const chunk1 = new Uint8Array([1,2,3,4,5,6,7,8,9])
 * const chunk2 = new Uint8Array([10,11,12,13,14,15,16,17,18,19]);
 *
 * const inflate = new pako.Inflate({ level: 3});
 *
 * inflate.push(chunk1, false);
 * inflate.push(chunk2, true);  // true -> last chunk
 *
 * if (inflate.err) { throw new Error(inflate.err); }
 *
 * console.log(inflate.result);
 * ```
 **/
function Inflate$1(options) {
  this.options = common.assign({
    chunkSize: 1024 * 64,
    windowBits: 15,
    to: ''
  }, options || {});

  const opt = this.options;

  // Force window size for `raw` data, if not set directly,
  // because we have no header for autodetect.
  if (opt.raw && (opt.windowBits >= 0) && (opt.windowBits < 16)) {
    opt.windowBits = -opt.windowBits;
    if (opt.windowBits === 0) { opt.windowBits = -15; }
  }

  // If `windowBits` not defined (and mode not raw) - set autodetect flag for gzip/deflate
  if ((opt.windowBits >= 0) && (opt.windowBits < 16) &&
      !(options && options.windowBits)) {
    opt.windowBits += 32;
  }

  // Gzip header has no info about windows size, we can do autodetect only
  // for deflate. So, if window size not set, force it to max when gzip possible
  if ((opt.windowBits > 15) && (opt.windowBits < 48)) {
    // bit 3 (16) -> gzipped data
    // bit 4 (32) -> autodetect gzip/deflate
    if ((opt.windowBits & 15) === 0) {
      opt.windowBits |= 15;
    }
  }

  this.err    = 0;      // error code, if happens (0 = Z_OK)
  this.msg    = '';     // error message
  this.ended  = false;  // used to avoid multiple onEnd() calls
  this.chunks = [];     // chunks of compressed data

  this.strm   = new zstream();
  this.strm.avail_out = 0;

  let status  = inflate_1$2.inflateInit2(
    this.strm,
    opt.windowBits
  );

  if (status !== Z_OK) {
    throw new Error(messages[status]);
  }

  this.header = new gzheader();

  inflate_1$2.inflateGetHeader(this.strm, this.header);

  // Setup dictionary
  if (opt.dictionary) {
    // Convert data if needed
    if (typeof opt.dictionary === 'string') {
      opt.dictionary = strings.string2buf(opt.dictionary);
    } else if (toString.call(opt.dictionary) === '[object ArrayBuffer]') {
      opt.dictionary = new Uint8Array(opt.dictionary);
    }
    if (opt.raw) { //In raw mode we need to set the dictionary early
      status = inflate_1$2.inflateSetDictionary(this.strm, opt.dictionary);
      if (status !== Z_OK) {
        throw new Error(messages[status]);
      }
    }
  }
}

/**
 * Inflate#push(data[, flush_mode]) -> Boolean
 * - data (Uint8Array|ArrayBuffer): input data
 * - flush_mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE
 *   flush modes. See constants. Skipped or `false` means Z_NO_FLUSH,
 *   `true` means Z_FINISH.
 *
 * Sends input data to inflate pipe, generating [[Inflate#onData]] calls with
 * new output chunks. Returns `true` on success. If end of stream detected,
 * [[Inflate#onEnd]] will be called.
 *
 * `flush_mode` is not needed for normal operation, because end of stream
 * detected automatically. You may try to use it for advanced things, but
 * this functionality was not tested.
 *
 * On fail call [[Inflate#onEnd]] with error code and return false.
 *
 * ##### Example
 *
 * ```javascript
 * push(chunk, false); // push one of data chunks
 * ...
 * push(chunk, true);  // push last chunk
 * ```
 **/
Inflate$1.prototype.push = function (data, flush_mode) {
  const strm = this.strm;
  const chunkSize = this.options.chunkSize;
  const dictionary = this.options.dictionary;
  let status, _flush_mode, last_avail_out;

  if (this.ended) return false;

  if (flush_mode === ~~flush_mode) _flush_mode = flush_mode;
  else _flush_mode = flush_mode === true ? Z_FINISH : Z_NO_FLUSH;

  // Convert data if needed
  if (toString.call(data) === '[object ArrayBuffer]') {
    strm.input = new Uint8Array(data);
  } else {
    strm.input = data;
  }

  strm.next_in = 0;
  strm.avail_in = strm.input.length;

  for (;;) {
    if (strm.avail_out === 0) {
      strm.output = new Uint8Array(chunkSize);
      strm.next_out = 0;
      strm.avail_out = chunkSize;
    }

    status = inflate_1$2.inflate(strm, _flush_mode);

    if (status === Z_NEED_DICT && dictionary) {
      status = inflate_1$2.inflateSetDictionary(strm, dictionary);

      if (status === Z_OK) {
        status = inflate_1$2.inflate(strm, _flush_mode);
      } else if (status === Z_DATA_ERROR) {
        // Replace code with more verbose
        status = Z_NEED_DICT;
      }
    }

    // Skip snyc markers if more data follows and not raw mode
    while (strm.avail_in > 0 &&
           status === Z_STREAM_END &&
           strm.state.wrap > 0 &&
           data[strm.next_in] !== 0)
    {
      inflate_1$2.inflateReset(strm);
      status = inflate_1$2.inflate(strm, _flush_mode);
    }

    switch (status) {
      case Z_STREAM_ERROR:
      case Z_DATA_ERROR:
      case Z_NEED_DICT:
      case Z_MEM_ERROR:
        this.onEnd(status);
        this.ended = true;
        return false;
    }

    // Remember real `avail_out` value, because we may patch out buffer content
    // to align utf8 strings boundaries.
    last_avail_out = strm.avail_out;

    if (strm.next_out) {
      if (strm.avail_out === 0 || status === Z_STREAM_END) {

        if (this.options.to === 'string') {

          let next_out_utf8 = strings.utf8border(strm.output, strm.next_out);

          let tail = strm.next_out - next_out_utf8;
          let utf8str = strings.buf2string(strm.output, next_out_utf8);

          // move tail & realign counters
          strm.next_out = tail;
          strm.avail_out = chunkSize - tail;
          if (tail) strm.output.set(strm.output.subarray(next_out_utf8, next_out_utf8 + tail), 0);

          this.onData(utf8str);

        } else {
          this.onData(strm.output.length === strm.next_out ? strm.output : strm.output.subarray(0, strm.next_out));
        }
      }
    }

    // Must repeat iteration if out buffer is full
    if (status === Z_OK && last_avail_out === 0) continue;

    // Finalize if end of stream reached.
    if (status === Z_STREAM_END) {
      status = inflate_1$2.inflateEnd(this.strm);
      this.onEnd(status);
      this.ended = true;
      return true;
    }

    if (strm.avail_in === 0) break;
  }

  return true;
};


/**
 * Inflate#onData(chunk) -> Void
 * - chunk (Uint8Array|String): output data. When string output requested,
 *   each chunk will be string.
 *
 * By default, stores data blocks in `chunks[]` property and glue
 * those in `onEnd`. Override this handler, if you need another behaviour.
 **/
Inflate$1.prototype.onData = function (chunk) {
  this.chunks.push(chunk);
};


/**
 * Inflate#onEnd(status) -> Void
 * - status (Number): inflate status. 0 (Z_OK) on success,
 *   other if not.
 *
 * Called either after you tell inflate that the input stream is
 * complete (Z_FINISH). By default - join collected chunks,
 * free memory and fill `results` / `err` properties.
 **/
Inflate$1.prototype.onEnd = function (status) {
  // On success - join
  if (status === Z_OK) {
    if (this.options.to === 'string') {
      this.result = this.chunks.join('');
    } else {
      this.result = common.flattenChunks(this.chunks);
    }
  }
  this.chunks = [];
  this.err = status;
  this.msg = this.strm.msg;
};


/**
 * inflate(data[, options]) -> Uint8Array|String
 * - data (Uint8Array|ArrayBuffer): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * Decompress `data` with inflate/ungzip and `options`. Autodetect
 * format via wrapper header by default. That's why we don't provide
 * separate `ungzip` method.
 *
 * Supported options are:
 *
 * - windowBits
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information.
 *
 * Sugar (options):
 *
 * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
 *   negative windowBits implicitly.
 * - `to` (String) - if equal to 'string', then result will be converted
 *   from utf8 to utf16 (javascript) string. When string output requested,
 *   chunk length can differ from `chunkSize`, depending on content.
 *
 *
 * ##### Example:
 *
 * ```javascript
 * const pako = require('pako');
 * const input = pako.deflate(new Uint8Array([1,2,3,4,5,6,7,8,9]));
 * let output;
 *
 * try {
 *   output = pako.inflate(input);
 * } catch (err) {
 *   console.log(err);
 * }
 * ```
 **/
function inflate$1(input, options) {
  const inflator = new Inflate$1(options);

  inflator.push(input);

  // That will never happens, if you don't cheat with options :)
  if (inflator.err) throw inflator.msg || messages[inflator.err];

  return inflator.result;
}


/**
 * inflateRaw(data[, options]) -> Uint8Array|String
 * - data (Uint8Array|ArrayBuffer): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * The same as [[inflate]], but creates raw data, without wrapper
 * (header and adler32 crc).
 **/
function inflateRaw$1(input, options) {
  options = options || {};
  options.raw = true;
  return inflate$1(input, options);
}


/**
 * ungzip(data[, options]) -> Uint8Array|String
 * - data (Uint8Array|ArrayBuffer): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * Just shortcut to [[inflate]], because it autodetects format
 * by header.content. Done for convenience.
 **/


var Inflate_1$1 = Inflate$1;
var inflate_2 = inflate$1;
var inflateRaw_1$1 = inflateRaw$1;
var ungzip$1 = inflate$1;
var constants = constants$2;

var inflate_1$1 = {
	Inflate: Inflate_1$1,
	inflate: inflate_2,
	inflateRaw: inflateRaw_1$1,
	ungzip: ungzip$1,
	constants: constants
};

const { Deflate, deflate, deflateRaw, gzip } = deflate_1$1;

const { Inflate, inflate, inflateRaw, ungzip } = inflate_1$1;



var Deflate_1 = Deflate;
var deflate_1 = deflate;
var deflateRaw_1 = deflateRaw;
var gzip_1 = gzip;
var Inflate_1 = Inflate;
var inflate_1 = inflate;
var inflateRaw_1 = inflateRaw;
var ungzip_1 = ungzip;
var constants_1 = constants$2;

var pako = {
	Deflate: Deflate_1,
	deflate: deflate_1,
	deflateRaw: deflateRaw_1,
	gzip: gzip_1,
	Inflate: Inflate_1,
	inflate: inflate_1,
	inflateRaw: inflateRaw_1,
	ungzip: ungzip_1,
	constants: constants_1
};

/**
 * Add gRPC Header
 * @author app2smile
 * @param {ArrayBuffer} header - unGzip Header
 * @param {ArrayBuffer} body - unGzip Body
 * @param {String} type - encoding type
 * @return {ArrayBuffer} new raw Body with Checksum Header
 */
function addgRPCHeader({ header, body }, encoding = undefined) {
	console.log(`☑️ Add gRPC Header`, "");
	// Header: 1位：是否校验数据 （0或者1） + 4位:校验值（数据长度）
	const flag = (encoding == "gzip") ? 1 : (encoding == "identity") ? 0 : (encoding == undefined) ? 0 : header?.[0] ?? 0; // encoding flag
	const checksum = Checksum(body.length); // 校验值为未压缩情况下的数据长度, 不是压缩后的长度
	if (encoding == "gzip") body = pako.gzip(body); // gzip压缩（有问题，别压）
	let rawBody = new Uint8Array(header.length + body.length);
	rawBody.set([flag], 0); // 0位：Encoding类型，当为1的时候, app会校验1-4位的校验值是否正确
	rawBody.set(checksum, 1); // 1-4位： 校验值(4位)
	rawBody.set(body, 5); // 5-end位：protobuf数据
	console.log(`✅ Add gRPC Header`, "");
	return rawBody;

	// 计算校验和 (B站为数据本体字节数)
	function Checksum(num) {
		let arr = new ArrayBuffer(4); // an Int32 takes 4 bytes
		let view = new DataView(arr);
		// 首位填充计算过的新数据长度
		view.setUint32(0, num, false); // byteOffset = 0; litteEndian = false
		return new Uint8Array(arr);
	}}

// lookup table from base64 character to byte
let encTable = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');
// lookup table from base64 character *code* to byte because lookup by number is fast
let decTable = [];
for (let i = 0; i < encTable.length; i++)
    decTable[encTable[i].charCodeAt(0)] = i;
// support base64url variants
decTable["-".charCodeAt(0)] = encTable.indexOf("+");
decTable["_".charCodeAt(0)] = encTable.indexOf("/");

/**
 * This handler implements the default behaviour for unknown fields.
 * When reading data, unknown fields are stored on the message, in a
 * symbol property.
 * When writing data, the symbol property is queried and unknown fields
 * are serialized into the output again.
 */
var UnknownFieldHandler;
(function (UnknownFieldHandler) {
    /**
     * The symbol used to store unknown fields for a message.
     * The property must conform to `UnknownFieldContainer`.
     */
    UnknownFieldHandler.symbol = Symbol.for("protobuf-ts/unknown");
    /**
     * Store an unknown field during binary read directly on the message.
     * This method is compatible with `BinaryReadOptions.readUnknownField`.
     */
    UnknownFieldHandler.onRead = (typeName, message, fieldNo, wireType, data) => {
        let container = is(message) ? message[UnknownFieldHandler.symbol] : message[UnknownFieldHandler.symbol] = [];
        container.push({ no: fieldNo, wireType, data });
    };
    /**
     * Write unknown fields stored for the message to the writer.
     * This method is compatible with `BinaryWriteOptions.writeUnknownFields`.
     */
    UnknownFieldHandler.onWrite = (typeName, message, writer) => {
        for (let { no, wireType, data } of UnknownFieldHandler.list(message))
            writer.tag(no, wireType).raw(data);
    };
    /**
     * List unknown fields stored for the message.
     * Note that there may be multiples fields with the same number.
     */
    UnknownFieldHandler.list = (message, fieldNo) => {
        if (is(message)) {
            let all = message[UnknownFieldHandler.symbol];
            return fieldNo ? all.filter(uf => uf.no == fieldNo) : all;
        }
        return [];
    };
    /**
     * Returns the last unknown field by field number.
     */
    UnknownFieldHandler.last = (message, fieldNo) => UnknownFieldHandler.list(message, fieldNo).slice(-1)[0];
    const is = (message) => message && Array.isArray(message[UnknownFieldHandler.symbol]);
})(UnknownFieldHandler || (UnknownFieldHandler = {}));
/**
 * Protobuf binary format wire types.
 *
 * A wire type provides just enough information to find the length of the
 * following value.
 *
 * See https://developers.google.com/protocol-buffers/docs/encoding#structure
 */
var WireType;
(function (WireType) {
    /**
     * Used for int32, int64, uint32, uint64, sint32, sint64, bool, enum
     */
    WireType[WireType["Varint"] = 0] = "Varint";
    /**
     * Used for fixed64, sfixed64, double.
     * Always 8 bytes with little-endian byte order.
     */
    WireType[WireType["Bit64"] = 1] = "Bit64";
    /**
     * Used for string, bytes, embedded messages, packed repeated fields
     *
     * Only repeated numeric types (types which use the varint, 32-bit,
     * or 64-bit wire types) can be packed. In proto3, such fields are
     * packed by default.
     */
    WireType[WireType["LengthDelimited"] = 2] = "LengthDelimited";
    /**
     * Used for groups
     * @deprecated
     */
    WireType[WireType["StartGroup"] = 3] = "StartGroup";
    /**
     * Used for groups
     * @deprecated
     */
    WireType[WireType["EndGroup"] = 4] = "EndGroup";
    /**
     * Used for fixed32, sfixed32, float.
     * Always 4 bytes with little-endian byte order.
     */
    WireType[WireType["Bit32"] = 5] = "Bit32";
})(WireType || (WireType = {}));

function detectBi() {
    const dv = new DataView(new ArrayBuffer(8));
    const ok = globalThis.BigInt !== undefined
        && typeof dv.getBigInt64 === "function"
        && typeof dv.getBigUint64 === "function"
        && typeof dv.setBigInt64 === "function"
        && typeof dv.setBigUint64 === "function";
    ok ? {
        MIN: BigInt("-9223372036854775808"),
        MAX: BigInt("9223372036854775807"),
        UMIN: BigInt("0"),
        UMAX: BigInt("18446744073709551615"),
        C: BigInt,
        V: dv,
    } : undefined;
}
detectBi();

/**
 * Scalar value types. This is a subset of field types declared by protobuf
 * enum google.protobuf.FieldDescriptorProto.Type The types GROUP and MESSAGE
 * are omitted, but the numerical values are identical.
 */
var ScalarType;
(function (ScalarType) {
    // 0 is reserved for errors.
    // Order is weird for historical reasons.
    ScalarType[ScalarType["DOUBLE"] = 1] = "DOUBLE";
    ScalarType[ScalarType["FLOAT"] = 2] = "FLOAT";
    // Not ZigZag encoded.  Negative numbers take 10 bytes.  Use TYPE_SINT64 if
    // negative values are likely.
    ScalarType[ScalarType["INT64"] = 3] = "INT64";
    ScalarType[ScalarType["UINT64"] = 4] = "UINT64";
    // Not ZigZag encoded.  Negative numbers take 10 bytes.  Use TYPE_SINT32 if
    // negative values are likely.
    ScalarType[ScalarType["INT32"] = 5] = "INT32";
    ScalarType[ScalarType["FIXED64"] = 6] = "FIXED64";
    ScalarType[ScalarType["FIXED32"] = 7] = "FIXED32";
    ScalarType[ScalarType["BOOL"] = 8] = "BOOL";
    ScalarType[ScalarType["STRING"] = 9] = "STRING";
    // Tag-delimited aggregate.
    // Group type is deprecated and not supported in proto3. However, Proto3
    // implementations should still be able to parse the group wire format and
    // treat group fields as unknown fields.
    // TYPE_GROUP = 10,
    // TYPE_MESSAGE = 11,  // Length-delimited aggregate.
    // New in version 2.
    ScalarType[ScalarType["BYTES"] = 12] = "BYTES";
    ScalarType[ScalarType["UINT32"] = 13] = "UINT32";
    // TYPE_ENUM = 14,
    ScalarType[ScalarType["SFIXED32"] = 15] = "SFIXED32";
    ScalarType[ScalarType["SFIXED64"] = 16] = "SFIXED64";
    ScalarType[ScalarType["SINT32"] = 17] = "SINT32";
    ScalarType[ScalarType["SINT64"] = 18] = "SINT64";
})(ScalarType || (ScalarType = {}));
/**
 * JavaScript representation of 64 bit integral types. Equivalent to the
 * field option "jstype".
 *
 * By default, protobuf-ts represents 64 bit types as `bigint`.
 *
 * You can change the default behaviour by enabling the plugin parameter
 * `long_type_string`, which will represent 64 bit types as `string`.
 *
 * Alternatively, you can change the behaviour for individual fields
 * with the field option "jstype":
 *
 * ```protobuf
 * uint64 my_field = 1 [jstype = JS_STRING];
 * uint64 other_field = 2 [jstype = JS_NUMBER];
 * ```
 */
var LongType;
(function (LongType) {
    /**
     * Use JavaScript `bigint`.
     *
     * Field option `[jstype = JS_NORMAL]`.
     */
    LongType[LongType["BIGINT"] = 0] = "BIGINT";
    /**
     * Use JavaScript `string`.
     *
     * Field option `[jstype = JS_STRING]`.
     */
    LongType[LongType["STRING"] = 1] = "STRING";
    /**
     * Use JavaScript `number`.
     *
     * Large values will loose precision.
     *
     * Field option `[jstype = JS_NUMBER]`.
     */
    LongType[LongType["NUMBER"] = 2] = "NUMBER";
})(LongType || (LongType = {}));
/**
 * Protobuf 2.1.0 introduced packed repeated fields.
 * Setting the field option `[packed = true]` enables packing.
 *
 * In proto3, all repeated fields are packed by default.
 * Setting the field option `[packed = false]` disables packing.
 *
 * Packed repeated fields are encoded with a single tag,
 * then a length-delimiter, then the element values.
 *
 * Unpacked repeated fields are encoded with a tag and
 * value for each element.
 *
 * `bytes` and `string` cannot be packed.
 */
var RepeatType;
(function (RepeatType) {
    /**
     * The field is not repeated.
     */
    RepeatType[RepeatType["NO"] = 0] = "NO";
    /**
     * The field is repeated and should be packed.
     * Invalid for `bytes` and `string`, they cannot be packed.
     */
    RepeatType[RepeatType["PACKED"] = 1] = "PACKED";
    /**
     * The field is repeated but should not be packed.
     * The only valid repeat type for repeated `bytes` and `string`.
     */
    RepeatType[RepeatType["UNPACKED"] = 2] = "UNPACKED";
})(RepeatType || (RepeatType = {}));

const $ = new ENV(" iRingo: 🔍 Siri & Search v4.0.0(4001) response.beta");

/***************** Processing *****************/
// 解构URL
const url = new URL($request.url);
$.log(`⚠ url: ${url.toJSON()}`, "");
// 获取连接参数
const METHOD = $request.method, HOST = url.hostname, PATH = url.pathname; url.pathname.split("/").filter(Boolean);
$.log(`⚠ METHOD: ${METHOD}, HOST: ${HOST}, PATH: ${PATH}` , "");
// 解析格式
const FORMAT = ($response.headers?.["Content-Type"] ?? $response.headers?.["content-type"])?.split(";")?.[0];
$.log(`⚠ FORMAT: ${FORMAT}`, "");
!(async () => {
	const { Settings, Caches, Configs } = setENV("iRingo", "Siri", Database$1);
	$.log(`⚠ Settings.Switch: ${Settings?.Switch}`, "");
	switch (Settings.Switch) {
		case true:
		default:
			// 创建空数据
			let body = {};
			// 格式判断
			switch (FORMAT) {
				case undefined: // 视为无body
					break;
				case "application/x-www-form-urlencoded":
				case "text/plain":
				default:
					break;
				case "application/x-mpegURL":
				case "application/x-mpegurl":
				case "application/vnd.apple.mpegurl":
				case "audio/mpegurl":
					//body = M3U8.parse($response.body);
					//$.log(`🚧 body: ${JSON.stringify(body)}`, "");
					//$response.body = M3U8.stringify(body);
					break;
				case "text/xml":
				case "text/html":
				case "text/plist":
				case "application/xml":
				case "application/plist":
				case "application/x-plist":
					//body = XML.parse($response.body);
					//$.log(`🚧 body: ${JSON.stringify(body)}`, "");
					break;
				case "text/vtt":
				case "application/vtt":
					//body = VTT.parse($response.body);
					//$.log(`🚧 body: ${JSON.stringify(body)}`, "");
					//$response.body = VTT.stringify(body);
					break;
				case "text/json":
				case "application/json":
					body = JSON.parse($response.body ?? "{}");
					// 主机判断
					switch (HOST) {
						case "api.smoot.apple.com":
						case "api.smoot.apple.cn":
							// 路径判断
							switch (PATH) {
								case "/bag": // 配置
									body.enabled = true;
									body.feedback_enabled = true;
									//body.search_url = body?.search_url || "https:\/\/api-glb-apne1c.smoot.apple.com\/search";
									//body.feedback_url = body?.feedback_url || "https:\/\/fbs.smoot.apple.com\/fb";
									if (body?.enabled_domains) {
										body.enabled_domains = [...new Set([...body?.enabled_domains ?? [], ...Settings.Domains])];
										$.log(`🎉 领域列表`, `enabled_domains: ${JSON.stringify(body.enabled_domains)}`, "");
									}
									if (body?.scene_aware_lookup_enabled_domains) {
										body.scene_aware_lookup_enabled_domains = [...new Set([...body?.scene_aware_lookup_enabled_domains ?? [], ...Settings.Domains])];
										$.log(`🎉 领域列表`, `scene_aware_lookup_enabled_domains: ${JSON.stringify(body.scene_aware_lookup_enabled_domains)}`, "");
									}
									body.min_query_len = 3;
									let Overrides = body?.overrides;
									if (Overrides) [...new Set([...Object.keys(Overrides), ...Settings.Functions])].forEach(Function => {
										$.log(`🎉 覆盖列表`, `Function: ${Function}`, "");
										//_.set(Overrides, `${Function}.enabled`, true);
										//_.set(Overrides, `${Function}.feedback_enabled`, true);
										switch (Function) {
											case "flightutilities":
												Lodash.set(Overrides, "flightutilities.enabled", true);
												Lodash.set(Overrides, "flightutilities.feedback_enabled", true);
												//_.set(Overrides, "flightutilities.flight_url",  "https:\/\/api-glb-aps1b.smoot.apple.com\/flight");
												//_.set(Overrides, "flightutilities.fallback_flight_url", "https:\/\/api-glb-apse1c.smoot.apple.com\/flight");
												break;
											case "lookup":
												Lodash.set(Overrides, "lookup.enabled", true);
												Lodash.set(Overrides, "lookup.feedback_enabled", true);
												//_.set(Overrides, "lookup.min_query_len", 2);
												//_.set(Overrides, "lookup.search_render_timeout", 2000);
												break;
											case "mail":
												Lodash.set(Overrides, "mail.enabled", true);
												Lodash.set(Overrides, "mail.feedback_enabled", true);
												break;
											case "messages":
												Lodash.set(Overrides, "messages.enabled", true);
												Lodash.set(Overrides, "messages.feedback_enabled", true);
												break;
											case "news":
												Lodash.set(Overrides, "news.enabled", true);
												Lodash.set(Overrides, "news.feedback_enabled", true);
												break;
											case "safari":
												Lodash.set(Overrides, "safari.enabled", true);
												Lodash.set(Overrides, "safari.feedback_enabled", true);
												Lodash.set(Overrides, "safari.experiments_custom_feedback_enabled", true);
												break;
											case "spotlight":
												Lodash.set(Overrides, "spotlight.enabled", true);
												Lodash.set(Overrides, "spotlight.feedback_enabled", true);
												//_.set(Overrides, "spotlight.use_twolayer_ranking", true);
												//_.set(Overrides, "spotlight.experiments_custom_feedback_enabled", true);
												//_.set(Overrides, "spotlight.min_query_len", 2);
												//_.set(Overrides, "spotlight.collect_scores", true);
												//_.set(Overrides, "spotlight.collect_anonymous_metadata", true);
												break;
											case "visualintelligence":
												Lodash.set(Overrides, "visualintelligence.enabled", true);
												Lodash.set(Overrides, "visualintelligence.feedback_enabled", true);
												Lodash.set(Overrides, "visualintelligence.enabled_domains", [...new Set([...Overrides.visualIntelligence?.enabled_domains ?? [], ...Configs.VisualIntelligence.enabled_domains])]);
												Lodash.set(Overrides, "visualintelligence.supported_domains", [...new Set([...Overrides.visualIntelligence?.supported_domains ?? [], ...Configs.VisualIntelligence.supported_domains])]);
												break;
										}
									});
									// Safari Smart History
									body.safari_smart_history_enabled = (Settings.Safari_Smart_History) ? true : false;
									body.smart_history_feature_feedback_enabled = (Settings.Safari_Smart_History) ? true : false;
									/*
									if (body?.mescal_enabled) {
										body.mescal_enabled = true;
										body.mescal_version = 200;
										body.mescal_cert_url = "https://init.itunes.apple.com/WebObjects/MZInit.woa/wa/signSapSetupCert";
										body.mescal_setup_url = "https://play.itunes.apple.com/WebObjects/MZPlay.woa/wa/signSapSetup";
									}
									let smart_search_v2 = body?.smart_search_v2_parameters;
									if (smart_search_v2) {
										smart_search_v2.smart_history_score_v2_enabled = true;
										smart_search_v2.smart_history_score_v2_enable_count = true;
									};
									body.session_experiment_metadata_enabled = true;
									//body.sample_features = true;
									//body.use_ledbelly = true;
									*/
									break;
							}							break;
					}					$response.body = JSON.stringify(body);
					break;
				case "application/protobuf":
				case "application/x-protobuf":
				case "application/vnd.google.protobuf":
				case "application/grpc":
				case "application/grpc+proto":
				case "application/octet-stream":
					//$.log(`🚧 $response.body: ${JSON.stringify($response.body)}`, "");
					let rawBody = $.isQuanX() ? new Uint8Array($response.bodyBytes ?? []) : $response.body ?? new Uint8Array();
					//$.log(`🚧 isBuffer? ${ArrayBuffer.isView(rawBody)}: ${JSON.stringify(rawBody)}`, "");
					switch (FORMAT) {
						case "application/protobuf":
						case "application/x-protobuf":
						case "application/vnd.google.protobuf":
							break;
						case "application/grpc":
						case "application/grpc+proto":
							// 先拆分B站gRPC校验头和protobuf数据体
							let header = rawBody.slice(0, 5);
							body = rawBody.slice(5);
							// 处理response压缩protobuf数据体
							switch (header?.[0]) {
								case 0: // unGzip
									break;
								case 1: // Gzip
									body = pako.ungzip(body);
									header[0] = 0; // unGzip
									break;
							}							rawBody = addgRPCHeader({ header, body }); // gzip压缩有问题，别用
							//rawBody = body;
							break;
					}					// 写入二进制数据
					$response.body = rawBody;
					break;
			}			break;
		case false:
			break;
	}})()
	.catch((e) => $.logErr(e))
	.finally(() => $.done($response));
