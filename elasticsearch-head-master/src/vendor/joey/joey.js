(function() {

	var joey = this.joey = function joey(elementDef, parentNode) {
		// 创建DOM节点 默认父节点为document
		return createNode( elementDef, parentNode, parentNode ? parentNode.ownerDocument : this.document );
	};

	// 自定义模板标签属性简写和真实标签中的属性的映射关系
	var shortcuts = joey.shortcuts = {
		"text" : "textContent",
		"cls" : "className"
	};

	// 创建HTML节点 [创建文本节点,自定义模板类型转换成HTML标签]
	var plugins = joey.plugins = [
		function( obj, context ) {
			if( typeof obj === 'string' ) {
				// 创建文本节点
				return context.createTextNode( obj );
			}
		},
		function( obj, context ) {
			// 如果对象中含有tag属性，那么标志位自定义模板
			if( "tag" in obj ) {
				var el = context.createElement( obj.tag );
				for( var attr in obj ) {
					addAttr( el, attr, obj[ attr ], context );
				}
				return el;
			}
		}
	];

	// 为自定义标签添加属性
	function addAttr( el, attr, value, context ) {
		attr = shortcuts[attr] || attr;
		if( attr === 'children' ) {
			// 循环children数组中的对象转换成HTML标签
			for( var i = 0; i < value.length; i++) {
				createNode( value[i], el, context );
			}
		} else if( attr === 'style' || attr === 'dataset' ) {
			for( var prop in value ) {
				el[ attr ][ prop ] = value[ prop ];
			}
		} else if( attr.indexOf("on") === 0 ) {
			// 为HTML标签添加时间监听
			el.addEventListener( attr.substr(2), value, false );
		} else if( value !== undefined ) {
			// 其它值作为默认添加
			el[ attr ] = value;
		}
	}

	// 创建DOM节点
	function createNode( obj, parent, context ) {
		var el;
		if( obj != null ) {
			plugins.some( function( plug ) {
				return ( el = plug( obj, context ) );
			});
			parent && parent.appendChild( el );
			return el;
		}
	}

}());
