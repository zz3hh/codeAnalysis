(function( app ) {
	// 把ut对象挂载到app对象上
	var ut = app.ns("ut");
	// 下拉选择框的模板
	ut.option_template = function(v) { return { tag: "OPTION", value: v, text: v }; };
	// 必须输入提示 填充span标签 <span class="reuire">*</span>
	ut.require_template = function(f) { return f.require ? { tag: "SPAN", cls: "require", text: "*" } : null; };

	// 字节大小添加在后面字母索引
	var sib_prefix = ['B','ki','Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi', 'Yi'];
	// 字节大小模板
	ut.byteSize_template = function(n) {
		var i = 0;
		while( n >= 1000 ) {
			i++;
			n /= 1024;
		}
		return (i === 0 ? n.toString() : n.toFixed( 3 - parseInt(n,10).toString().length )) + ( sib_prefix[ i ] || "..E" );
	};
	// 数字大小添加在后面字母索引
	var sid_prefix = ['','k','M', 'G', 'T', 'P', 'E', 'Z', 'Y'];

	ut.count_template = function(n) {
		var i = 0;
		while( n >= 1000 ) {
			i++;
			n /= 1000;
		}
		return i === 0 ? n.toString() : ( n.toFixed( 3 - parseInt(n,10).toString().length ) + ( sid_prefix[ i ] || "..E" ) );
	};

})( this.app );
