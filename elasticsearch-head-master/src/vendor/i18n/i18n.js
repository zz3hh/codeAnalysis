(function() {
	/**
	 * provides text formatting and i18n key storage features<br>
	 * implements most of the Sun Java MessageFormat functionality.
	 * @see <a href="http://java.sun.com/j2se/1.5.0/docs/api/java/text/MessageFormat.html" target="sun">Sun's Documentation</a>
	 */

	var keys = {};

	var format = function(message, args) {
		var substitute = function() {
			var format = arguments[1].split(',');
			var substr = escape(args[format.shift()]);
			if(format.length === 0) {
				return substr; // simple substitution eg {0}
			}
			switch(format.shift()) {
				case "number" : return (new Number(substr)).toLocaleString();
				case "date" : return (new Date(+substr)).toLocaleDateString(); // date and time require milliseconds since epoch
				case "time" : return (new Date(+substr)).toLocaleTimeString(); //  eg i18n.text("Key", +(new Date())); for current time
			}
			var styles = format.join("").split("|").map(function(style) {
				return style.match(/(-?[\.\d]+)(#|<)([^{}]*)/);
			});
			var match = styles[0][3];
			for(var i=0; i<styles.length; i++) {
				if((styles[i][2] === "#" && (+styles[i][1]) === (+substr)) ||
						(styles[i][2] === "<" && ((+styles[i][1]) < (+substr)))) {
					match = styles[i][3];
				}
			}
			return match;
		};

		return message && message.replace(/'(')|'([^']+)'|([^{']+)|([^']+)/g, function(x, sq, qs, ss, sub) {
			do {} while(sub && (sub !== (sub = (sub.replace(/\{([^{}]+)\}/, substitute)))));
			return sq || qs || ss || unescape(sub);
		});
	};

	this.i18n = {
		// 变换成语言包对象，并利用闭包完成
		setKeys: function(strings) {
			for(var key in strings) {
				keys[key] = strings[key];
			}
		},
		// 获取语言包中对应语言的值
		text: function() {
			var args = Array.prototype.slice.call(arguments),
				key = keys[args.shift()];
			// 如果参数数量为1，那么直接返回语言标示的值
			if(args.length === 0) {
				return key;
			}
			// 格式化后返回参数
			return format(key, args);
		},

		complex: function() {
			var args = Array.prototype.slice.call(arguments),
				key = keys[args.shift()],
				ret = [],
				replacer = function(x, pt, sub) { ret.push(pt || args[+sub]); return ""; };
			do {
				
			} while(key && key !== (key = key.replace(/([^{]+)|\{(\d+)\}/, replacer )));
			return ret;
		}

	};

})();

(function() {
	var nav = window.navigator;
	var userLang = ( nav.languages && nav.languages[0] ) || nav.language || nav.userLanguage;
	// 获取浏览器的语言环境
	var scripts = document.getElementsByTagName('script');
	var data = scripts[ scripts.length - 1].dataset;
	if( ! data["langs"] ) {
		return;
	}
	var langs = data["langs"].split(/\s*,\s*/);
	var script0 = scripts[0];
	function install( lang ) {
		var s = document.createElement("script");
		s.src = data["basedir"] + "/" + lang + '_strings.js';
		s.async = false;
		script0.parentNode.appendChild(s);
		script0 = s;
	}
	// 安装项目依赖的语言包
	install( langs.shift() ); // always install primary language
	userLang && langs
		.filter( function( lang ) { return userLang.indexOf( lang ) === 0; } )
		.forEach( install );
}());
