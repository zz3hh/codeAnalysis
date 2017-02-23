/**
  * vue-router v2.1.1
  * (c) 2016 Evan You
  * @license MIT
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.VueRouter = factory());
}(this, (function () { 'use strict';

// 创建router-view组件
var View = {
  name: 'router-view', // 组件名称
  functional: true, // 功能组件 纯粹渲染
  props: {
    name: {
      type: String,
      default: 'default'
    }
  }, // 接收的参数
  render: function render (h, ref) {
    // render 函数
    /**
     * 在Vuejs库中createFunctionalComponent方法调用的，具体代码
     * var h = function (a, b, c, d) { return createElement(_context, a, b, c, d, true); };
     * var vnode = Ctor.options.render.call(null, h, {
     *   props: props,
     *   data: data,
     *   parent: context,
     *   children: children,
     *   slots: function () { return resolveSlots(children, context); }
     * });
     */
    var props = ref.props;
    var children = ref.children;
    var parent = ref.parent;
    var data = ref.data;
    // 解决嵌套深度问题
    data.routerView = true
    // route 对象
    var route = parent.$route
    // 缓存
    var cache = parent._routerViewCache || (parent._routerViewCache = {})
    var depth = 0
    var inactive = false

    // 循环查找父级
    while (parent) {
      if (parent.$vnode && parent.$vnode.data.routerView) {
        depth++
      }
      // 处理 keepalive 逻辑
      if (parent._inactive) {
        inactive = true
      }
      parent = parent.$parent
    }
    // routerViewDepth
    data.routerViewDepth = depth
    // 得到相匹配的当前组件层级的 路由记录
    var matched = route.matched[depth]
    if (!matched) {
      return h()
    }
    // 得到要渲染组件
    var name = props.name
    var component = inactive
      ? cache[name]
      : (cache[name] = matched.components[name])
    
    if (!inactive) {
      // 非 keepalive 模式下 每次都需要设置钩子
      // 进而更新（赋值&销毁）匹配了的实例元素
      var hooks = data.hook || (data.hook = {})
      hooks.init = function (vnode) {
        matched.instances[name] = vnode.child
      }
      hooks.prepatch = function (oldVnode, vnode) {
        matched.instances[name] = vnode.child
      }
      hooks.destroy = function (vnode) {
        if (matched.instances[name] === vnode.child) {
          matched.instances[name] = undefined
        }
      }
    }
    // 调用 createElement 函数 渲染匹配的组件
    return h(component, data, children)
  }
}

/*  */

/**
 * 抛出vue-router错误信息
 * @description 抛出vue-router错误信息
 * @param condition [表达式]
 * @param message [错误信息]
 */
function assert (condition, message) {
  if (!condition) {
    throw new Error(("[vue-router] " + message))
  }
}

/**
 * 抛出vue-router警告信息
 * @description 抛出vue-router警告信息
 * @param condition [表达式]
 * @param message [警告信息]
 */
function warn (condition, message) {
  if (!condition) {
    typeof console !== 'undefined' && console.warn(("[vue-router] " + message))
  }
}

/*  */
// 解码
/**
 * encodeURIComponent("前端白小白") "%E5%89%8D%E7%AB%AF%E7%99%BD%E5%B0%8F%E7%99%BD"
 * decodeURIComponent("%E5%89%8D%E7%AB%AF%E7%99%BD%E5%B0%8F%E7%99%BD") "前端白小白"
 */
var encode = encodeURIComponent
var decode = decodeURIComponent

/**
 * 分解query字符串
 * @description 分解query字符串
 * @param query [query字符串]
 * @param extraQuery [额外query字符串]
 */
function resolveQuery (
  query,
  extraQuery
) {
  if ( extraQuery === void 0 ) extraQuery = {};

  if (query) {
    var parsedQuery
    try {
      parsedQuery = parseQuery(query)
    } catch (e) {
      "development" !== 'production' && warn(false, e.message)
      parsedQuery = {}
    }
    for (var key in extraQuery) {
      parsedQuery[key] = extraQuery[key]
    }
    return parsedQuery
  } else {
    return extraQuery
  }
}

/**
 * 解析query字符串成为对象
 * @description 解析query字符串成为对象
 * @param query [query字符串]
 */
function parseQuery (query) {
  var res = {}
  // 祛除开头字符
  query = query.trim().replace(/^(\?|#|&)/, '')

  if (!query) {
    return res
  }
  // 以&切割成数组，然后遍历
  query.split('&').forEach(function (param) {
    // 继续以=分割成数组
    var parts = param.replace(/\+/g, ' ').split('=')
    // 取出数组的首个元素作为key
    var key = decode(parts.shift())
    var val = parts.length > 0
      ? decode(parts.join('='))
      : null

    if (res[key] === undefined) {
      // 第一次赋值
      res[key] = val
    } else if (Array.isArray(res[key])) {
      // 第n次赋值
      res[key].push(val)
    } else {
      // 第二次赋值，如果已经有值那么，转换成数组，并把上个值作为第一个值
      res[key] = [res[key], val]
    }
  })

  return res
}

/**
 * query对象转换成字符串
 * @description query对象转换成字符串
 * @param obj [obj]
 */
function stringifyQuery (obj) {
  // 首先运用三元符进行运算,而后调用数组的map函数后返回一个数组，
  // 再后进行filter过滤出有效的字符串并返回一个数组，然后调用数组的join函数组成字符串
  var res = obj ? Object.keys(obj).map(function (key) {
    // obj存在，得到key数组，而后进行map
    var val = obj[key]

    if (val === undefined) {
      return ''
    }

    if (val === null) {
      return encode(key)
    }

    if (Array.isArray(val)) {
      var result = []
      val.slice().forEach(function (val2) {
        if (val2 === undefined) {
          return
        }
        if (val2 === null) {
          result.push(encode(key))
        } else {
          result.push(encode(key) + '=' + encode(val2))
        }
      })
      return result.join('&')
    }

    return encode(key) + '=' + encode(val)
  }).filter(function (x) { return x.length > 0; }).join('&') : null
  return res ? ("?" + res) : ''
}

/*  */

/**
 * 创建router对象
 * @description 创建router对象
 * @param record [记录]
 * @param location [location]
 * @param redirectedFrom [redirectedFrom]
 */
function createRoute (
  record,
  location,
  redirectedFrom
) {
  // 返回一个被冻结的对象
  var route = {
    name: location.name || (record && record.name),
    meta: (record && record.meta) || {},
    path: location.path || '/',
    hash: location.hash || '',
    query: location.query || {},
    params: location.params || {},
    fullPath: getFullPath(location),
    matched: record ? formatMatch(record) : []
  }
  if (redirectedFrom) {
    route.redirectedFrom = getFullPath(redirectedFrom)
  }
  return Object.freeze(route)
}

// the starting route that represents the initial state
// 表示初始状态的起始路由
var START = createRoute(null, {
  path: '/'
})

/**
 * 格式化match成为数组
 * @param 格式化match成为数组
 * @param record [record]
 */
function formatMatch (record) {
  var res = []
  while (record) {
    res.unshift(record)
    record = record.parent
  }
  return res
}

/**
 * 得到全路径
 * @description 得到全路径
 * @param ref [location]
 */
function getFullPath (ref) {
  var path = ref.path;
  var query = ref.query; if ( query === void 0 ) query = {};
  var hash = ref.hash; if ( hash === void 0 ) hash = '';

  return (path || '/') + stringifyQuery(query) + hash
}

// /正则式
var trailingSlashRE = /\/$/
/**
 * 是否为相同的route
 * @description 是否为相同的route
 * @param a [route]
 * @param b [route]
 */
function isSameRoute (a, b) {
  if (b === START) {
    return a === b
  } else if (!b) {
    return false
  } else if (a.path && b.path) {
    return (
      a.path.replace(trailingSlashRE, '') === b.path.replace(trailingSlashRE, '') &&
      a.hash === b.hash &&
      isObjectEqual(a.query, b.query)
    )
  } else if (a.name && b.name) {
    return (
      a.name === b.name &&
      a.hash === b.hash &&
      isObjectEqual(a.query, b.query) &&
      isObjectEqual(a.params, b.params)
    )
  } else {
    return false
  }
}

/**
 * 对象是否相等
 * @description 对象是否相等
 * @param a [object]
 * @param b [object]
 */
function isObjectEqual (a, b) {
  if ( a === void 0 ) a = {};
  if ( b === void 0 ) b = {};

  var aKeys = Object.keys(a)
  var bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) {
    return false
  }
  return aKeys.every(function (key) { return String(a[key]) === String(b[key]); })
}


function isIncludedRoute (current, target) {
  return (
    current.path.indexOf(target.path.replace(/\/$/, '')) === 0 &&
    (!target.hash || current.hash === target.hash) &&
    queryIncludes(current.query, target.query)
  )
}

function queryIncludes (current, target) {
  for (var key in target) {
    if (!(key in current)) {
      return false
    }
  }
  return true
}

/*  */

// work around weird flow bug
var toTypes = [String, Object]

// router-link组件
var Link = {
  name: 'router-link',
  // 传入的组件属性列表
  props: {
    // 目标路由的链接
    to: {
      type: toTypes,
      required: true
    },
    // 创建的html标签
    tag: {
      type: String,
      default: 'a'
    },
    // 完整模式，如果为 true 那么也就意味着
    // 绝对相等的路由才会增加 activeClass
    // 否则是包含关系
    exact: Boolean,
    // 在当前（相对）路径附加路径
    append: Boolean,
    // 如果为 true 则调用 router.replace() 做替换历史操作
    replace: Boolean,
    // 链接激活时使用的 CSS 类名
    activeClass: String,
    // 事件
    event: {
      type: [String, Array],
      default: 'click'
    }
  },
  render: function render (h) {
    var this$1 = this;
    // 得到 router 实例以及当前激活的 route 对象
    var router = this.$router
    var current = this.$route
    var ref = router.resolve(this.to, current, this.append);
    var normalizedTo = ref.normalizedTo;
    var resolved = ref.resolved;
    var href = ref.href;
    var classes = {}
    var activeClass = this.activeClass || router.options.linkActiveClass || 'router-link-active'
    var compareTarget = normalizedTo.path ? createRoute(null, normalizedTo) : resolved
    classes[activeClass] = this.exact
      ? isSameRoute(current, compareTarget)
      : isIncludedRoute(current, compareTarget)
    
    // 点击处理函数
    var handler = function (e) {
      if (guardEvent(e)) {
        if (this$1.replace) {
          router.replace(normalizedTo)
        } else {
          router.push(normalizedTo)
        }
      }
    }

    var on = { click: guardEvent }
    if (Array.isArray(this.event)) {
      this.event.forEach(function (e) { on[e] = handler })
    } else {
      on[this.event] = handler
    }

    var data = {
      class: classes
    }

    if (this.tag === 'a') {
      data.on = on
      data.attrs = { href: href }
    } else {
      // find the first <a> child and apply listener and href
      // 找到第一个 <a> 给予这个元素事件绑定和href属性
      var a = findAnchor(this.$slots.default)
      if (a) {
        // in case the <a> is a static node
        a.isStatic = false
        var extend = _Vue.util.extend
        var aData = a.data = extend({}, a.data)
        aData.on = on
        var aAttrs = a.data.attrs = extend({}, a.data.attrs)
        aAttrs.href = href
      } else {
        // doesn't have <a> child, apply listener to self
        // 没有 <a> 的话就给当前元素自身绑定事件
        data.on = on
      }
    }
    // 创建元素
    return h(this.tag, data, this.$slots.default)
  }
}

/**
 * 监测事件
 * @description 监测事件
 * @param e [event]
 */
function guardEvent (e) {
  // don't redirect with control keys
  /* istanbul ignore if */
  // 忽略带有功能键的点击
  if (e.metaKey || e.ctrlKey || e.shiftKey) { return }
  // don't redirect when preventDefault called
  /* istanbul ignore if */
  // 已阻止的返回
  if (e.defaultPrevented) { return }
  // don't redirect on right click
  /* istanbul ignore if */
  // 右击
  if (e.button !== 0) { return }
  // don't redirect if `target="_blank"`
  /* istanbul ignore if */
  // `target="_blank"` 忽略
  var target = e.target.getAttribute('target')
  if (/\b_blank\b/i.test(target)) { return }

  e.preventDefault()
  return true
}

/**
 * 发现锚点
 * @description 发现锚点
 * @param children [children]
 */
function findAnchor (children) {
  if (children) {
    var child
    for (var i = 0; i < children.length; i++) {
      child = children[i]
      if (child.tag === 'a') {
        return child
      }
      if (child.children && (child = findAnchor(child.children))) {
        return child
      }
    }
  }
}

/**
 * 为什么要定义一个_Vue？
 * 
 * 插件在打包的时候是肯定不希望把 vue 作为一个依赖包打进去的，但是又希望使用 Vue 对象本身的一些方法，此时就可以采用上边类似的做法，
 * 在 install 的时候把这个变量赋值 Vue ，这样就可以在其他地方使用 Vue 的一些方法而不必引入 vue 依赖包（前提是保证 install 后才会使用）
 * 
 * install函数的第一参数为什么是Vue对象？
 * 
 * 是因为Vue.use函数调用时改变了install的参数列表，代码如下
 * var args = toArray(arguments, 1);
 * // 此处是把Vue对象放入第一个参数里
 * args.unshift(this);
 * if (typeof plugin.install === 'function') {
 *   plugin.install.apply(plugin, args);
 * } else {
 *   plugin.apply(null, args);
 * }
 */
var _Vue

/**
 * VueRouter作为插件引入到Vue中需要调用的函数
 * 利用 Vue.js 提供的插件机制 .use(plugin) 来安装 VueRouter，而这个插件机制则会调用该 plugin 对象的 install 方法（当然如果该 plugin 没有该方法的话会把 plugin 自身作为函数来调用）
 * 
 */
function install (Vue) {
  // 如果按照过即立即跳出函数
  if (install.installed) { return }
  install.installed = true
  // 添加_Vue对Vue对象的引用
  _Vue = Vue
  // 为Vue原型添加$touter属性，取值指向Vue实例对象的$root._router
  Object.defineProperty(Vue.prototype, '$router', {
    get: function get () { return this.$root._router }
  })
  // 为Vue原型添加$route属性，取值指向Vue实例对象的$root._route
  Object.defineProperty(Vue.prototype, '$route', {
    get: function get$1 () { return this.$root._route }
  })

  // 混入beforeCreate函数
  // beforeCreate注入到options属性beforeCreate属性中
  // beforeCreate的合并注入策略为数组形式注入，追加在数组列表中,代码如下
  // config._lifecycleHooks.forEach(function (hook) {
  //    strats[hook] = mergeHook;
  // });
  Vue.mixin({
    beforeCreate: function beforeCreate () {
      // 在Vue对象实例化时，执行_init函数时，会被唤醒钩子函数
      // callHook(vm, 'beforeCreate');
      // 在callHook函数执行时会把this指向Vue实例对象

      // 判断是否有router
      if (this.$options.router) {
        // 赋值 _router
        this._router = this.$options.router
        // 初始化 init
        this._router.init(this)
        // 定义响应式的 _route 对象
        // 见Vue.js源码defineReactive$$1方法
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      }
    }
  })
  // 注册组件
  Vue.component('router-view', View)
  Vue.component('router-link', Link)
  // 获取Vue.js合并策略对象
  var strats = Vue.config.optionMergeStrategies
  // use the same hook merging strategy for route hooks
  // 使用相同的钩子合并策略的路由钩子,对象引用，源码位置
  // config._lifecycleHooks.forEach(function (hook) {
  //   strats[hook] = mergeHook;
  // });
  // 采用数组形式注入，追加在数组列表中
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.created
}

/*  */

/**
 * 分解路由路径
 * @description 分解路由路径
 * @param relative [相对路径]
 * @param base [base路径]
 * @param append [是否追加]
 */
function resolvePath (
  relative,
  base,
  append
) {
  if (relative.charAt(0) === '/') {
    return relative
  }

  if (relative.charAt(0) === '?' || relative.charAt(0) === '#') {
    return base + relative
  }

  var stack = base.split('/')

  // remove trailing segment if:
  // - not appending
  // - appending to trailing slash (last segment is empty)
  if (!append || !stack[stack.length - 1]) {
    stack.pop()
  }

  // resolve relative path
  var segments = relative.replace(/^\//, '').split('/')
  for (var i = 0; i < segments.length; i++) {
    var segment = segments[i]
    if (segment === '.') {
      continue
    } else if (segment === '..') {
      stack.pop()
    } else {
      stack.push(segment)
    }
  }

  // ensure leading slash
  if (stack[0] !== '') {
    stack.unshift('')
  }

  return stack.join('/')
}

/**
 * 解析路由路径
 * @description 解析路由路径
 * @param path [路径]
 */
function parsePath (path) {
  var hash = ''
  var query = ''
  /**
   * String.slice(start,[end])
   * 返回字符串的片段
   */

  // 首先获取的hash值
  var hashIndex = path.indexOf('#')
  if (hashIndex >= 0) {
    // 获取hash值
    hash = path.slice(hashIndex)
    // 改变path值
    path = path.slice(0, hashIndex)
  }
  // 获取query值
  var queryIndex = path.indexOf('?')
  if (queryIndex >= 0) {
    // 获取query值
    query = path.slice(queryIndex + 1)
    // 改变path值
    path = path.slice(0, queryIndex)
  }

  return {
    path: path,
    query: query,
    hash: hash
  }
}

/**
 * 双斜杠替换成单斜杠
 * @description 双斜杠替换成单斜杠
 * @param path [路径]
 */
function cleanPath (path) {
  return path.replace(/\/\//g, '/')
}

/*  */

/**
 * 创建路由map
 * @description 创建路由map
 * @param routes [routes]
 */
function createRouteMap (routes) {
  // path 路由 map
  var pathMap = Object.create(null)
  // name 路由 map
  var nameMap = Object.create(null)
  // 遍历路由配置对象 增加 路由记录
  routes.forEach(function (route) {
    addRouteRecord(pathMap, nameMap, route)
  })

  return {
    pathMap: pathMap,
    nameMap: nameMap
  }
}
/**
 * 增加路由记录
 * @description 增加路由记录
 * @param pathMap [pathMap]
 * @param nameMap [nameMap]
 * @param route [route]
 * @param parent [parent]
 * @param matchAs [matchAs]
 */
function addRouteRecord (
  pathMap,
  nameMap,
  route,
  parent,
  matchAs
) {
  // 获取path、name 
  var path = route.path;
  var name = route.name;
  if ("development" !== 'production') {
    // 必须含有path 因为assert第一个参数为false才会打印错误信息
    assert(path != null, "\"path\" is required in a route configuration.")
    // component不能为字符串
    assert(
      typeof route.component !== 'string',
      "route config \"component\" for path: " + (String(path || name)) + " cannot be a " +
      "string id. Use an actual component instead."
    )
  }
  // 路由记录 对象
  var record = {
    path: normalizePath(path, parent),
    components: route.components || { default: route.component },
    instances: {},
    name: name,
    parent: parent,
    matchAs: matchAs,
    redirect: route.redirect,
    beforeEnter: route.beforeEnter,
    meta: route.meta || {}
  }

  // 嵌套子路由 则递归增加 记录
  if (route.children) {
    // Warn if route is named and has a default child route.
    // If users navigate to this route by name, the default child will
    // not be rendered (GH Issue #629)
    if ("development" !== 'production') {
      if (route.name && route.children.some(function (child) { return /^\/?$/.test(child.path); })) {
        warn(false, ("Named Route '" + (route.name) + "' has a default child route.\n          When navigating to this named route (:to=\"{name: '" + (route.name) + "'\"), the default child route will not be rendered.\n          Remove the name from this route and use the name of the default child route for named links instead.")
        )
      }
    }
    route.children.forEach(function (child) {
      addRouteRecord(pathMap, nameMap, child, record)
    })
  }

  // 处理别名 alias 逻辑 增加对应的 记录
  if (route.alias !== undefined) {
    if (Array.isArray(route.alias)) {
      route.alias.forEach(function (alias) {
        addRouteRecord(pathMap, nameMap, { path: alias }, parent, record.path)
      })
    } else {
      addRouteRecord(pathMap, nameMap, { path: route.alias }, parent, record.path)
    }
  }
  // 更新path map
  if (!pathMap[record.path]) {
    pathMap[record.path] = record
  }
  // 更新name map
  if (name) {
    if (!nameMap[name]) {
      nameMap[name] = record
    } else if ("development" !== 'production') {
      warn(false, ("Duplicate named routes definition: { name: \"" + name + "\", path: \"" + (record.path) + "\" }"))
    }
  }
}

/**
 * path标准化
 * @description path标准化
 * @param path [path]
 * @param parent [parent]
 */
function normalizePath (path, parent) {
  // 去掉路径最后一个’/‘
  path = path.replace(/\/$/, '')
  // 这里少去了indexOf方法判断，也算一个经典,直接返回path
  if (path[0] === '/') { return path }
  if (parent == null) { return path }
  // 返回父级路径加+’/‘并拼接路径;这也和上面第一段代码相对应
  return cleanPath(((parent.path) + "/" + path))
}

var __moduleExports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

var isarray = __moduleExports

/**
 * Expose `pathToRegexp`.
 */
var index = pathToRegexp
var parse_1 = parse
var compile_1 = compile
var tokensToFunction_1 = tokensToFunction
var tokensToRegExp_1 = tokensToRegExp

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
var PATH_REGEXP = new RegExp([
  // Match escaped characters that would otherwise appear in future matches.
  // This allows the user to escape special characters that won't transform.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))'
].join('|'), 'g')

/**
 * Parse a string for the raw tokens.
 * 解析原始标记的字符串
 * @param  {string}  str
 * @param  {Object=} options
 * @return {!Array}
 */
function parse (str, options) {
  var tokens = []
  var key = 0
  var index = 0
  var path = ''
  var defaultDelimiter = options && options.delimiter || '/'
  var res

  while ((res = PATH_REGEXP.exec(str)) != null) {
    var m = res[0]
    var escaped = res[1]
    var offset = res.index
    path += str.slice(index, offset)
    index = offset + m.length

    // Ignore already escaped sequences.
    if (escaped) {
      path += escaped[1]
      continue
    }

    var next = str[index]
    var prefix = res[2]
    var name = res[3]
    var capture = res[4]
    var group = res[5]
    var modifier = res[6]
    var asterisk = res[7]

    // Push the current path onto the tokens.
    if (path) {
      tokens.push(path)
      path = ''
    }

    var partial = prefix != null && next != null && next !== prefix
    var repeat = modifier === '+' || modifier === '*'
    var optional = modifier === '?' || modifier === '*'
    var delimiter = res[2] || defaultDelimiter
    var pattern = capture || group

    tokens.push({
      name: name || key++,
      prefix: prefix || '',
      delimiter: delimiter,
      optional: optional,
      repeat: repeat,
      partial: partial,
      asterisk: !!asterisk,
      pattern: pattern ? escapeGroup(pattern) : (asterisk ? '.*' : '[^' + escapeString(delimiter) + ']+?')
    })
  }

  // Match any characters still remaining.
  // 匹配任何剩余字符
  if (index < str.length) {
    path += str.substr(index)
  }

  // If the path exists, push it onto the end.
  // 如果存在则放在数组的结尾
  if (path) {
    tokens.push(path)
  }

  return tokens
}

/**
 * Compile a string to a template function for the path.
 *
 * @param  {string}             str
 * @param  {Object=}            options
 * @return {!function(Object=, Object=)}
 */
function compile (str, options) {
  return tokensToFunction(parse(str, options))
}

/**
 * Prettier encoding of URI path segments.
 *
 * @param  {string}
 * @return {string}
 */
function encodeURIComponentPretty (str) {
  return encodeURI(str).replace(/[\/?#]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
  })
}

/**
 * Encode the asterisk parameter. Similar to `pretty`, but allows slashes.
 *
 * @param  {string}
 * @return {string}
 */
function encodeAsterisk (str) {
  return encodeURI(str).replace(/[?#]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
  })
}

/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction (tokens) {
  // Compile all the tokens into regexps.
  var matches = new Array(tokens.length)

  // Compile all the patterns before compilation.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] === 'object') {
      matches[i] = new RegExp('^(?:' + tokens[i].pattern + ')$')
    }
  }

  return function (obj, opts) {
    var path = ''
    var data = obj || {}
    var options = opts || {}
    var encode = options.pretty ? encodeURIComponentPretty : encodeURIComponent

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i]

      if (typeof token === 'string') {
        path += token

        continue
      }

      var value = data[token.name]
      var segment

      if (value == null) {
        if (token.optional) {
          // Prepend partial segment prefixes.
          if (token.partial) {
            path += token.prefix
          }

          continue
        } else {
          throw new TypeError('Expected "' + token.name + '" to be defined')
        }
      }

      if (isarray(value)) {
        if (!token.repeat) {
          throw new TypeError('Expected "' + token.name + '" to not repeat, but received `' + JSON.stringify(value) + '`')
        }

        if (value.length === 0) {
          if (token.optional) {
            continue
          } else {
            throw new TypeError('Expected "' + token.name + '" to not be empty')
          }
        }

        for (var j = 0; j < value.length; j++) {
          segment = encode(value[j])

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received `' + JSON.stringify(segment) + '`')
          }

          path += (j === 0 ? token.prefix : token.delimiter) + segment
        }

        continue
      }

      segment = token.asterisk ? encodeAsterisk(value) : encode(value)

      if (!matches[i].test(segment)) {
        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
      }

      path += token.prefix + segment
    }

    return path
  }
}

/**
 * Escape a regular expression string.
 * 逃逸正则表达式串
 * @param  {string} str
 * @return {string}
 */
function escapeString (str) {
  return str.replace(/([.+*?=^!:${}()[\]|\/\\])/g, '\\$1')
}

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {string} group
 * @return {string}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$\/()])/g, '\\$1')
}

/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {!RegExp} re
 * @param  {Array}   keys
 * @return {!RegExp}
 */
function attachKeys (re, keys) {
  re.keys = keys
  return re
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {string}
 */
function flags (options) {
  return options.sensitive ? '' : 'i'
}

/**
 * Pull out keys from a regexp.
 *
 * @param  {!RegExp} path
 * @param  {!Array}  keys
 * @return {!RegExp}
 */
function regexpToRegexp (path, keys) {
  // Use a negative lookahead to match only capturing groups.
  var groups = path.source.match(/\((?!\?)/g)

  if (groups) {
    for (var i = 0; i < groups.length; i++) {
      keys.push({
        name: i,
        prefix: null,
        delimiter: null,
        optional: false,
        repeat: false,
        partial: false,
        asterisk: false,
        pattern: null
      })
    }
  }

  return attachKeys(path, keys)
}

/**
 * Transform an array into a regexp.
 *
 * @param  {!Array}  path
 * @param  {Array}   keys
 * @param  {!Object} options
 * @return {!RegExp}
 */
function arrayToRegexp (path, keys, options) {
  var parts = []

  for (var i = 0; i < path.length; i++) {
    parts.push(pathToRegexp(path[i], keys, options).source)
  }

  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options))

  return attachKeys(regexp, keys)
}

/**
 * Create a path regexp from string input.
 * 创建字符串输入的路径表达的正则信息
 * @param  {string}  path
 * @param  {!Array}  keys
 * @param  {!Object} options
 * @return {!RegExp}
 */
function stringToRegexp (path, keys, options) {
  return tokensToRegExp(parse(path, options), keys, options)
}

/**
 * Expose a function for taking tokens and returning a RegExp.
 *
 * @param  {!Array}          tokens
 * @param  {(Array|Object)=} keys
 * @param  {Object=}         options
 * @return {!RegExp}
 */
function tokensToRegExp (tokens, keys, options) {
  if (!isarray(keys)) {
    options = /** @type {!Object} */ (keys || options)
    keys = []
  }

  options = options || {}

  var strict = options.strict
  var end = options.end !== false
  var route = ''

  // Iterate over the tokens and create our regexp string.
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i]

    if (typeof token === 'string') {
      route += escapeString(token)
    } else {
      var prefix = escapeString(token.prefix)
      var capture = '(?:' + token.pattern + ')'

      keys.push(token)

      if (token.repeat) {
        capture += '(?:' + prefix + capture + ')*'
      }

      if (token.optional) {
        if (!token.partial) {
          capture = '(?:' + prefix + '(' + capture + '))?'
        } else {
          capture = prefix + '(' + capture + ')?'
        }
      } else {
        capture = prefix + '(' + capture + ')'
      }

      route += capture
    }
  }

  var delimiter = escapeString(options.delimiter || '/')
  var endsWithDelimiter = route.slice(-delimiter.length) === delimiter

  // In non-strict mode we allow a slash at the end of match. If the path to
  // match already ends with a slash, we remove it for consistency. The slash
  // is valid at the end of a path match, not in the middle. This is important
  // in non-ending mode, where "/test/" shouldn't match "/test//route".
  if (!strict) {
    route = (endsWithDelimiter ? route.slice(0, -delimiter.length) : route) + '(?:' + delimiter + '(?=$))?'
  }

  if (end) {
    route += '$'
  } else {
    // In non-ending mode, we need the capturing groups to match as much as
    // possible by using a positive lookahead to the end or next path segment.
    route += strict && endsWithDelimiter ? '' : '(?=' + delimiter + '|$)'
  }

  return attachKeys(new RegExp('^' + route, flags(options)), keys)
}

/**
 * Normalize the given path string, returning a regular expression.
 * 规范给定路径字符串，返回正则表达式
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(string|RegExp|Array)} path
 * @param  {(Array|Object)=}       keys
 * @param  {Object=}               options
 * @return {!RegExp}
 */
function pathToRegexp (path, keys, options) {
  if (!isarray(keys)) {
    options = /** @type {!Object} */ (keys || options)
    keys = []
  }

  options = options || {}

  if (path instanceof RegExp) {
    return regexpToRegexp(path, /** @type {!Array} */ (keys))
  }

  if (isarray(path)) {
    return arrayToRegexp(/** @type {!Array} */ (path), /** @type {!Array} */ (keys), options)
  }

  return stringToRegexp(/** @type {string} */ (path), /** @type {!Array} */ (keys), options)
}

index.parse = parse_1;
index.compile = compile_1;
index.tokensToFunction = tokensToFunction_1;
index.tokensToRegExp = tokensToRegExp_1;

/*  */

// 正则信息缓存哈希列表 
var regexpCache = Object.create(null)

/**
 * 获取路由的正则信息
 * @description 获取路由的正则信息
 * @param path [path]
 */
function getRouteRegex (path) {
  var hit = regexpCache[path]
  var keys, regexp
  // 既然从换从中取得数据为什么不直接返回呢
  if (hit) {
    keys = hit.keys
    regexp = hit.regexp
  } else {
    keys = []
    regexp = index(path, keys)
    regexpCache[path] = { keys: keys, regexp: regexp }
  }

  return { keys: keys, regexp: regexp }
}

var regexpCompileCache = Object.create(null)

/**
 * 填充参数
 * @description 填充参数
 * @param path [path]
 * @param params [params]
 * @param routeMsg [routeMsg]
 */
function fillParams (
  path,
  params,
  routeMsg
) {
  try {
    var filler =
      regexpCompileCache[path] ||
      (regexpCompileCache[path] = index.compile(path))
    return filler(params || {}, { pretty: true })
  } catch (e) {
    if ("development" !== 'production') {
      warn(false, ("missing param for " + routeMsg + ": " + (e.message)))
    }
    return ''
  }
}

/*  */

/**
 * location规范化
 * @description location规范化
 * @param raw [原生路由信息]
 * @param current [当前路由信息]
 * @param append [是否附加]
 */
function normalizeLocation (
  raw,
  current,
  append
) {
  // 如果是字符串则转换为{path:raw},否则使用原生路由信息
  var next = typeof raw === 'string' ? { path: raw } : raw
  // named target
  // 指定目标
  if (next.name || next._normalized) {
    return next
  }

  // relative params
  // 相关参数
  if (!next.path && next.params && current) {
    next = assign({}, next)
    next._normalized = true
    var params = assign(assign({}, current.params), next.params)
    if (current.name) {
      next.name = current.name
      next.params = params
    } else if (current.matched) {
      var rawPath = current.matched[current.matched.length - 1].path
      next.path = fillParams(rawPath, params, ("path " + (current.path)))
    } else if ("development" !== 'production') {
      warn(false, "relative params navigation requires a current route.")
    }
    return next
  }

  // 解析下个路由的path
  var parsedPath = parsePath(next.path || '')
  // 获取当前的path
  var basePath = (current && current.path) || '/'
  var path = parsedPath.path
    ? resolvePath(parsedPath.path, basePath, append || next.append)
    : (current && current.path) || '/'
  var query = resolveQuery(parsedPath.query, next.query)
  var hash = next.hash || parsedPath.hash
  if (hash && hash.charAt(0) !== '#') {
    hash = "#" + hash
  }

  return {
    _normalized: true,
    path: path,
    query: query,
    hash: hash
  }
}

/**
 * 对象归属(附加)
 * @description 对象归属(附加)
 * @param a [object]
 * @param b [object]
 */
function assign (a, b) {
  for (var key in b) {
    a[key] = b[key]
  }
  return a
}

/*  */

/**
 * 可以看出主要做的事情就是根据用户路由配置对象生成普通的根据 path 来对应的路由记录
 * 以及根据 name 来对应的路由记录的 map，方便后续匹配对应
 * 创建match匹配函数
 * @description 创建match匹配函数
 * @param routes [routes]
 */
function createMatcher (routes) {
  // 创建路由map
  var ref = createRouteMap(routes);
  // 利用闭包把pathMap和nameMap缓存下来
  var pathMap = ref.pathMap;
  var nameMap = ref.nameMap;

  /**
   * 匹配路由
   * @description 匹配路由
   * @param raw [原生location信息]
   * @param currentRoute [当前选中的路由]
   * @param redirectedFrom [跳转路径]
   */
  function match (
    raw,
    currentRoute,
    redirectedFrom
  ) {
    // 格式化raw后的信息
    var location = normalizeLocation(raw, currentRoute)
    // 获取路径name
    var name = location.name;

    if (name) {
      var record = nameMap[name]
      var paramNames = getRouteRegex(record.path).keys
        .filter(function (key) { return !key.optional; })
        .map(function (key) { return key.name; })

      if (typeof location.params !== 'object') {
        location.params = {}
      }

      if (currentRoute && typeof currentRoute.params === 'object') {
        for (var key in currentRoute.params) {
          if (!(key in location.params) && paramNames.indexOf(key) > -1) {
            location.params[key] = currentRoute.params[key]
          }
        }
      }

      if (record) {
        location.path = fillParams(record.path, location.params, ("named route \"" + name + "\""))
        return _createRoute(record, location, redirectedFrom)
      }
    } else if (location.path) {
      location.params = {}
      for (var path in pathMap) {
        if (matchRoute(path, location.params, location.path)) {
          return _createRoute(pathMap[path], location, redirectedFrom)
        }
      }
    }
    // no match
    return _createRoute(null, location)
  }

  /**
   * 路由转发
   * @description 路由转发
   * @param record [record]
   * @param location [location]
   */
  function redirect (
    record,
    location
  ) {
    var originalRedirect = record.redirect
    var redirect = typeof originalRedirect === 'function'
        ? originalRedirect(createRoute(record, location))
        : originalRedirect

    if (typeof redirect === 'string') {
      redirect = { path: redirect }
    }

    if (!redirect || typeof redirect !== 'object') {
      "development" !== 'production' && warn(
        false, ("invalid redirect option: " + (JSON.stringify(redirect)))
      )
      return _createRoute(null, location)
    }

    var re = redirect
    var name = re.name;
    var path = re.path;
    var query = location.query;
    var hash = location.hash;
    var params = location.params;
    query = re.hasOwnProperty('query') ? re.query : query
    hash = re.hasOwnProperty('hash') ? re.hash : hash
    params = re.hasOwnProperty('params') ? re.params : params

    if (name) {
      // resolved named direct
      var targetRecord = nameMap[name]
      if ("development" !== 'production') {
        assert(targetRecord, ("redirect failed: named route \"" + name + "\" not found."))
      }
      return match({
        _normalized: true,
        name: name,
        query: query,
        hash: hash,
        params: params
      }, undefined, location)
    } else if (path) {
      // 1. resolve relative redirect
      var rawPath = resolveRecordPath(path, record)
      // 2. resolve params
      var resolvedPath = fillParams(rawPath, params, ("redirect route with path \"" + rawPath + "\""))
      // 3. rematch with existing query and hash
      return match({
        _normalized: true,
        path: resolvedPath,
        query: query,
        hash: hash
      }, undefined, location)
    } else {
      warn(false, ("invalid redirect option: " + (JSON.stringify(redirect))))
      return _createRoute(null, location)
    }
  }

  function alias (
    record,
    location,
    matchAs
  ) {
    var aliasedPath = fillParams(matchAs, location.params, ("aliased route with path \"" + matchAs + "\""))
    var aliasedMatch = match({
      _normalized: true,
      path: aliasedPath
    })
    if (aliasedMatch) {
      var matched = aliasedMatch.matched
      var aliasedRecord = matched[matched.length - 1]
      location.params = aliasedMatch.params
      return _createRoute(aliasedRecord, location)
    }
    return _createRoute(null, location)
  }

  /**
   * 创建router信息
   * @description 创建ruoter信息
   * @param record [record]
   * @param location [location]
   * @param redirectedFrom [redirectedFrom]
   */
  function _createRoute (
    record,
    location,
    redirectedFrom
  ) {
    if (record && record.redirect) {
      return redirect(record, redirectedFrom || location)
    }
    if (record && record.matchAs) {
      return alias(record, location, record.matchAs)
    }
    return createRoute(record, location, redirectedFrom)
  }

  return match
}

/**
 * 匹配router信息
 * @description 匹配router信息
 * @param path [path]
 * @param params [params]
 * @param pathname [pathname]
 */
function matchRoute (
  path,
  params,
  pathname
) {
  // 获取router的正则表达式信息,并且getRouterRegex运用了缓存，速度会更快些
  var ref = getRouteRegex(path);
  var regexp = ref.regexp;
  var keys = ref.keys;
  var m = pathname.match(regexp)

  if (!m) {
    return false
  } else if (!params) {
    return true
  }

  for (var i = 1, len = m.length; i < len; ++i) {
    var key = keys[i - 1]
    var val = typeof m[i] === 'string' ? decodeURIComponent(m[i]) : m[i]
    if (key) { params[key.name] = val }
  }

  return true
}

function resolveRecordPath (path, record) {
  return resolvePath(path, record.parent ? record.parent.path : '/', true)
}

/*  */
// 检验是否是浏览器端
var inBrowser = typeof window !== 'undefined'
// 检测是否支持History
var supportsHistory = inBrowser && (function () {
  var ua = window.navigator.userAgent

  if (
    (ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) &&
    ua.indexOf('Mobile Safari') !== -1 &&
    ua.indexOf('Chrome') === -1 &&
    ua.indexOf('Windows Phone') === -1
  ) {
    return false
  }
  // 支持性判断
  return window.history && 'pushState' in window.history
})()

/*  */

/**
 * 运行队列
 * @description 运行队列
 * @param queue [队列]
 * @param fn [function]
 * @param cb [callback]
 */
function runQueue (queue, fn, cb) {
  var step = function (index) {
    if (index >= queue.length) {
      cb()
    } else {
      if (queue[index]) {
        fn(queue[index], function () {
          step(index + 1)
        })
      } else {
        step(index + 1)
      }
    }
  }
  step(0)
}

/*  */

/**
 * History函数
 * @description History函数
 * @param router [router]
 * @param base [base]
 */
var History = function History (router, base) {
  // 存储router、base、current、pending信息
  this.router = router
  // 规范base参数
  this.base = normalizeBase(base)
  // start with a route object that stands for "nowhere"
  this.current = START 
  this.pending = null
};

/**
 * 监听事件函数
 * @description 监听事件函数
 * @param cb [callback]
 */
History.prototype.listen = function listen (cb) {
  this.cb = cb
};

/**
 * 路由过渡到函数
 * @description 路由过渡到函数
 * @param location [location]
 * @param onComplete [完成函数]
 * @param onAbort [取消函数]
 */
History.prototype.transitionTo = function transitionTo (location, onComplete, onAbort) {
  var this$1 = this;
  // 调用 match 得到匹配的 route 对象
  var route = this.router.match(location, this.current)
  // 确认过渡
  this.confirmTransition(route, function () {
    // 更新当前 route 对象
    this$1.updateRoute(route)
    onComplete && onComplete(route)
    // 子类实现的更新url地址
    // 对于 hash 模式的话 就是更新 hash 的值
    // 对于 history 模式的话 就是利用 pushstate / replacestate 来更新浏览器地址
    this$1.ensureURL()
  }, onAbort)
};

/**
 * 确认过渡
 * @description 确认过渡
 * @param route [route]
 * @param onComplete [完成函数]
 * @param onAbort [取消函数]
 */
History.prototype.confirmTransition = function confirmTransition (route, onComplete, onAbort) {
  var this$1 = this;
  // 取得当前路由
  var current = this.current
  // 定义取消回调函数
  var abort = function () { onAbort && onAbort() }
  // 如果是相同的路由则直接返回
  if (isSameRoute(route, current)) {
    // 如果是相同路由，则直接跳过onComplete函数，直接调用ensureURL函数
    this.ensureURL()
    // 调用取消函数
    return abort()
  }

  // 交叉比对当前路由的路由记录和现在的这个路由的路由记录
	// 以便能准确得到父子路由更新的情况下可以确切的知道
	// 哪些组件需要更新 哪些不需要更新
  var ref = resolveQueue(this.current.matched, route.matched);
  var deactivated = ref.deactivated;
  var activated = ref.activated;

  // 整个切换周期的队列
  var queue = [].concat(
    // in-component leave guards
    // leave 的钩子
    extractLeaveGuards(deactivated),
    // global before hooks
    // 全局 router before hooks
    this.router.beforeHooks,
    // enter guards
    // 将要更新的路由的 beforeEnter 钩子
    activated.map(function (m) { return m.beforeEnter; }),
    // async components
    // 异步组件
    resolveAsyncComponents(activated)
  )

  this.pending = route
  // 每一个队列执行的 iterator 函数, 迭代器
  var iterator = function (hook, next) {
    // 此处的hook为queue数组中取到的函数，index
    // 此处的next为继续调用setp(index+1);
    if (this$1.pending !== route) {
      return abort()
    }
    /**
     * 调用钩子函数
     * @description 调用钩子函数
     * @param route [to]
     * @param current [from]
     * @param callback [callback]
     */
    hook(route, current, function (to) {
      if (to === false) {
        // next(false) -> abort navigation, ensure current URL
        // 中止导航，确保当前网址
        this$1.ensureURL(true)
        abort()
      } else if (typeof to === 'string' || typeof to === 'object') {
        // next('/') or next({ path: '/' }) -> redirect
        // 更改URL,做二次跳转
        (typeof to === 'object' && to.replace) ? this$1.replace(to) : this$1.push(to)
        abort()
      } else {
        // confirm transition and pass on the value
        // 确认过渡和传递值
        next(to)
      }
    })
  }

  // 执行队列
  runQueue(queue, iterator, function () {
    var postEnterCbs = []
    // 组件内的钩子
    var enterGuards = extractEnterGuards(activated, postEnterCbs, function () {
      return this$1.current === route
    })
    // wait until async components are resolved before
    // extracting in-component enter guards
    // 在上次的队列执行完成后再执行组件内的钩子
    // 因为需要等异步组件以及是OK的情况下才能执行
    runQueue(enterGuards, iterator, function () {
      // 确保期间还是当前路由
      if (this$1.pending !== route) {
        return abort()
      }
      this$1.pending = null
      onComplete(route)
      if (this$1.router.app) {
        this$1.router.app.$nextTick(function () {
          postEnterCbs.forEach(function (cb) { return cb(); })
        })
      }
    })
  })
};

/**
 * 更新路由
 * @description 更新路由
 * @param route [route]
 */
History.prototype.updateRoute = function updateRoute (route) {
  // 获取当前route
  var prev = this.current
  // 把当前选择的route指向参数route
  this.current = route
  // 如果含有callback函数，那么调用callback函数，callback函数是由listen函数提供的；
  this.cb && this.cb(route)
  // router切换以后，执行 after hooks 回调
  this.router.afterHooks.forEach(function (hook) {
    hook && hook(route, prev)
  })
};

/**
 * 规范base参数
 * @description 规范base参数
 * @param base [base]
 */
function normalizeBase (base) {
  if (!base) {
    // 在浏览器中获取base标签中的href属性
    if (inBrowser) {
      // respect <base> tag
      var baseEl = document.querySelector('base')
      base = baseEl ? baseEl.getAttribute('href') : '/'
    } else {
      base = '/'
    }
  }
  // make sure there's the starting slash
  // 确保有开始斜线
  if (base.charAt(0) !== '/') {
    base = '/' + base
  }
  // remove trailing slash
  // 移除最后的斜线
  return base.replace(/\/$/, '')
}

/**
 * 交叉比对当前路由的路由记录和现在的这个路由的路由记录
 * @description 交叉比对当前路由的路由记录和现在的这个路由的路由记录
 * @param current [当前路由]
 * @param next [下一个路由]
 */
function resolveQueue (
  current,
  next
) {
  var i
  var max = Math.max(current.length, next.length)
  for (i = 0; i < max; i++) {
    if (current[i] !== next[i]) {
      break
    }
  }
  // 返回活动与不活动的
  return {
    activated: next.slice(i),
    deactivated: current.slice(i)
  }
}

/**
 * 提取钩子函数
 * @description 提取钩子函数
 * @param def [obj]
 * @param key [key]
 */
function extractGuard (
  def,
  key
) {
  if (typeof def !== 'function') {
    // extend now so that global mixins are applied.
    def = _Vue.extend(def)
  }
  return def.options[key]
}

/**
 * 提取beforeRouteLeave钩子函数
 * @description 提取beforeRouteLeave钩子函数
 * @param matched [match]
 */
function extractLeaveGuards (matched) {
  return flatten(flatMapComponents(matched, function (def, instance) {
    var guard = extractGuard(def, 'beforeRouteLeave')
    if (guard) {
      return Array.isArray(guard)
        ? guard.map(function (guard) { return wrapLeaveGuard(guard, instance); })
        : wrapLeaveGuard(guard, instance)
    }
  }).reverse())
}

/**
 * 包裹beforeRouteLeave钩子函数
 * @description 包裹beforeRouteLeave钩子函数
 * @param guard [回调函数]
 * @param instance [instance]
 */
function wrapLeaveGuard (
  guard,
  instance
) {
  return function routeLeaveGuard () {
    return guard.apply(instance, arguments)
  }
}

/**
 * 提取beforeRouteEnter钩子函数列表
 * @description 提取beforeRouteEnter钩子函数列表
 * @param matched [matched]
 * @param cbs [callbacks]
 * @param isValid [isValid]
 */
function extractEnterGuards (
  matched,
  cbs,
  isValid
) {
  return flatten(flatMapComponents(matched, function (def, _, match, key) {
    var guard = extractGuard(def, 'beforeRouteEnter')
    if (guard) {
      return Array.isArray(guard)
        ? guard.map(function (guard) { return wrapEnterGuard(guard, cbs, match, key, isValid); })
        : wrapEnterGuard(guard, cbs, match, key, isValid)
    }
  }))
}

/**
 * 包裹beforeRouteEnter钩子函数
 * @description 包裹beforeRouteEnter钩子函数
 * @param guard [guard]
 * @param cbs [callbacks]
 * @param match [match]
 * @param key [key]
 * @param isValid [isValid]
 */
function wrapEnterGuard (
  guard,
  cbs,
  match,
  key,
  isValid
) {
  return function routeEnterGuard (to, from, next) {
    return guard(to, from, function (cb) {
      next(cb)
      if (typeof cb === 'function') {
        cbs.push(function () {
          // #750
          // if a router-view is wrapped with an out-in transition,
          // the instance may not have been registered at this time.
          // we will need to poll for registration until current route
          // is no longer valid.
          poll(cb, match.instances, key, isValid)
        })
      }
    })
  }
}

function poll (
  cb, // somehow flow cannot infer this is a function
  instances,
  key,
  isValid
) {
  if (instances[key]) {
    cb(instances[key])
  } else if (isValid()) {
    setTimeout(function () {
      poll(cb, instances, key, isValid)
    }, 16)
  }
}

function resolveAsyncComponents (matched) {
  return flatMapComponents(matched, function (def, _, match, key) {
    // if it's a function and doesn't have Vue options attached,
    // assume it's an async component resolve function.
    // we are not using Vue's default async resolving mechanism because
    // we want to halt the navigation until the incoming component has been
    // resolved.
    if (typeof def === 'function' && !def.options) {
      return function (to, from, next) {
        var resolve = function (resolvedDef) {
          match.components[key] = resolvedDef
          next()
        }

        var reject = function (reason) {
          warn(false, ("Failed to resolve async component " + key + ": " + reason))
          next(false)
        }

        var res = def(resolve, reject)
        if (res && typeof res.then === 'function') {
          res.then(resolve, reject)
        }
      }
    }
  })
}

function flatMapComponents (
  matched,
  fn
) {
  return flatten(matched.map(function (m) {
    return Object.keys(m.components).map(function (key) { return fn(
      m.components[key],
      m.instances[key],
      m, key
    ); })
  }))
}

/**
 * 处理成数组
 * @description 处理成数组
 * @param arr [array]
 */
function flatten (arr) {
  return Array.prototype.concat.apply([], arr)
}

/*  */

// 滚动位置信息的哈希列表
var positionStore = Object.create(null)

/**
 * 保存滚动位置信息
 * @description 保存滚动位置信息
 * @param key [主键]
 */
function saveScrollPosition (key) {
  if (!key) { return }
  positionStore[key] = {
    x: window.pageXOffset,
    y: window.pageYOffset
  }
}

/**
 * 得到滚动位置信息
 * @description 得到滚动位置信息
 * @param key [主键]
 */
function getScrollPosition (key) {
  if (!key) { return }
  return positionStore[key]
}

/**
 * 得到元素的位置信息
 * @description 得到元素的位置信息
 */
function getElementPosition (el) {
  var docRect = document.documentElement.getBoundingClientRect()
  var elRect = el.getBoundingClientRect()
  return {
    x: elRect.left - docRect.left,
    y: elRect.top - docRect.top
  }
}

/**
 * 判断是否为有效的位置信息
 * @description 判断是否为有效的位置信息
 * @param obj [位置信息]
 */
function isValidPosition (obj) {
  return isNumber(obj.x) || isNumber(obj.y)
}

/**
 * 格式化位置信息
 * @description 格式化位置信息
 * @param obj [位置信息]
 */
function normalizePosition (obj) {
  return {
    x: isNumber(obj.x) ? obj.x : window.pageXOffset,
    y: isNumber(obj.y) ? obj.y : window.pageYOffset
  }
}

/**
 * 判断是否为数值
 * @description 判断是否为数值
 * @param v [v]
 */
function isNumber (v) {
  return typeof v === 'number'
}

/*  */

/**
 * 生成的key,以当前时间戳为key
 */
var genKey = function () { return String(Date.now()); }
var _key = genKey()

/**
 * HTML5History函数
 */
var HTML5History = (function (History) {
  /**
   * HTML5History函数
   * @description HTML5History函数
   * @param router [router]
   * @param base [base]
   */
  function HTML5History (router, base) {
    var this$1 = this;
    // 用call调用父级的构造函数
    History.call(this, router, base)
    // 是否期望滚动
    var expectScroll = router.options.scrollBehavior
    
    /**
     * 桌面浏览器兼容性
     * Feature	Chrome	Firefox (Gecko)	Internet Explorer	Opera	 Safari
     * Basic    support	 Yes	4.0 (2)	     10.0	           Yes	 limited
     * 
     * 手机兼容性
     * Feature	          Android	                  Firefox Mobile (Gecko)	    IE Mobile	 Opera Mobile	 Safari Mobile
     * Basic    support	3.0 (buggy in 2.2 and 2.3)	     4.0 (2)	                 10.0	        Yes	        limited
     */

    /**
     * 注意：
     * 调用history.pushState()或者history.replaceState()不会触发popstate事件，
     * 只有在作出浏览器动作时，才会触发该事件，如用户点击浏览器回退按钮会调用history.back()
     * 激活历史项时会触发popstate事件。
     */
    // 监听popstate
    window.addEventListener('popstate', function (e) {
      // e = history 
      // 当前URL下对应的状态信息，如果当前URL不是通过pushState或者replaceState产生的，那么history.state是null
      _key = e.state && e.state.key
      var current = this$1.current
      // 路由过渡到函数
      this$1.transitionTo(getLocation(this$1.base), function (next) {
        if (expectScroll) {
          this$1.handleScroll(next, current, true)
        }
      })
    })
    
    // 如果滚动则监听浏览器滚动事件
    if (expectScroll) {
      window.addEventListener('scroll', function () {
        saveScrollPosition(_key)
      })
    }
  }

  // __proto__指向History 
  if ( History ) HTML5History.__proto__ = History;
  // 运用原型链继承
  HTML5History.prototype = Object.create( History && History.prototype );
  // 该原型对象对应的构造函数
  HTML5History.prototype.constructor = HTML5History;
  /**
   * 移动到历史记录中的特定位置
   * @description 移动到历史记录中的特定位置
   * @param n [number]
   */
  HTML5History.prototype.go = function go (n) {
    window.history.go(n)
  };
  /**
   * 插入路由
   * @description 插入路由
   * @param location [location]
   */
  HTML5History.prototype.push = function push (location) {
    var this$1 = this;
    // 存储当前路由信息
    var current = this.current
    // 路由过渡到制定URL
    this.transitionTo(location, function (route) {
      pushState(cleanPath(this$1.base + route.fullPath))
      this$1.handleScroll(route, current, false)
    })
  };
  /**
   * 路由替换
   * @description 路由替换
   * @param location [location]
   */
  HTML5History.prototype.replace = function replace (location) {
    var this$1 = this;

    var current = this.current
    this.transitionTo(location, function (route) {
      replaceState(cleanPath(this$1.base + route.fullPath))
      this$1.handleScroll(route, current, false)
    })
  };

  /**
   * 确保当前URL
   * @description 确保当前URL
   * @param push [是否push]
   */
  HTML5History.prototype.ensureURL = function ensureURL (push) {
    // 如果URL不是当前URL则继续改变路由
    if (getLocation(this.base) !== this.current.fullPath) {
      var current = cleanPath(this.base + this.current.fullPath)
      push ? pushState(current) : replaceState(current)
    }
  };

  /**
   * 使用前端路由，当切换到新路由时，想要页面滚动到底部，或者保持原先的滚动位置，就像重新加载页面那样
   * 它让你自定义路由切换时页面如何滚动
   * 处理滚动事件
   * @description 处理滚动事件
   * @param to [to]
   * @param from [from]
   * @param isPop [isPop]
   */
  HTML5History.prototype.handleScroll = function handleScroll (to, from, isPop) {
    // 获取router
    var router = this.router
    if (!router.app) {
      return
    }
    // 是否含有滚动动作
    var behavior = router.options.scrollBehavior
    if (!behavior) {
      return
    }
    if ("development" !== 'production') {
      assert(typeof behavior === 'function', "scrollBehavior must be a function")
    }

    // wait until re-render finishes before scrolling
    // 等到重新渲染完成之前滚动
    router.app.$nextTick(function () {
      var position = getScrollPosition(_key)
      var shouldScroll = behavior(to, from, isPop ? position : null)
      if (!shouldScroll) {
        return
      }
      var isObject = typeof shouldScroll === 'object'
      if (isObject && typeof shouldScroll.selector === 'string') {
        var el = document.querySelector(shouldScroll.selector)
        if (el) {
          position = getElementPosition(el)
        } else if (isValidPosition(shouldScroll)) {
          position = normalizePosition(shouldScroll)
        }
      } else if (isObject && isValidPosition(shouldScroll)) {
        position = normalizePosition(shouldScroll)
      }
      // 如果含有位置信息，则滚动到相应的位置
      if (position) {
        window.scrollTo(position.x, position.y)
      }
    })
  };
  // 返回HTML5History函数
  return HTML5History;
}(History));

/**
 * 得到当前的路由信息
 * @description 得到当前的路由信息
 * @param base [base]
 */
function getLocation (base) {
  var path = window.location.pathname
  if (base && path.indexOf(base) === 0) {
    path = path.slice(base.length)
  }
  return (path || '/') + window.location.search + window.location.hash
}

/**
 * 添加state
 * @description 添加state
 * @param url [url]
 * @param replace [是否替换]
 */
function pushState (url, replace) {
  // try...catch the pushState call to get around Safari
  // DOM Exception 18 where it limits to 100 pushState calls
  // 尝试捕获Safari浏览器pushState调用次数的限制
  var history = window.history
  try {
    if (replace) {
      /* history.replaceState(state,title,url);
       * 用新的state和URL替换当前，不会造成页面刷新
       * state:与要跳转到的URL对应的状态信息
       * title:暂时传空字符就行
       * url:要跳转到的URL地址，不能跨域
       */
      history.replaceState({ key: _key }, '', url)
    } else {
      /* history.pushState(state,title,url);
       * 将当前URL和history.state加入到history中，并用新的state和URL替换当前，不会造成页面刷新
       * state:与要跳转到的URL对应的状态信息
       * title:暂时传空字符就行
       * url:要跳转到的URL地址，不能跨域
       */
      _key = genKey()
      history.pushState({ key: _key }, '', url)
    }
    saveScrollPosition(_key)
  } catch (e) {
    window.location[replace ? 'assign' : 'replace'](url)
  }
}

/**
 * 替换state
 * @description 替换state
 * @param url [url]
 */
function replaceState (url) {
  pushState(url, true)
}

/*  */

/**
 * HashHistory函数
 */
var HashHistory = (function (History) {
  /**
   * HashHistory函数
   * @description HashHistory函数
   * @param router [router]
   * @param base [base]
   * @param fallback [fallback]
   */
  function HashHistory (router, base, fallback) {
    History.call(this, router, base)
    // check history fallback deeplinking
    if (fallback && this.checkFallback()) {
      return
    }
    ensureSlash()
  }
  // __proto__指向History 
  if ( History ) HashHistory.__proto__ = History;
  // 运用原型链继承
  HashHistory.prototype = Object.create( History && History.prototype );
  // 该原型对象对应的构造函数
  HashHistory.prototype.constructor = HashHistory;

  /**
   * 检测依赖条件并且改变路由
   * @description 检测依赖条件并且改变路由信息
   */
  HashHistory.prototype.checkFallback = function checkFallback () {
    var location = getLocation(this.base)
    if (!/^\/#/.test(location)) {
      window.location.replace(
        cleanPath(this.base + '/#' + location)
      )
      return true
    }
  };

  /**
   * 监测Hash值的变化
   * @description 监听Hash值的变化
   */
  HashHistory.prototype.onHashChange = function onHashChange () {
    /**
     * 浏览器端支持情况
     *  Feature	       Chrome	    Firefox (Gecko)	                   
     * Basic support	   5.0	  3.6 (1.9.2) Firefox 6 中加入对 oldURL/newURL 属性的支持.	
     * Internet Explorer	   Opera	 Safari
     *    8.0	                10.6	   5.0
     * 移动端支持情况
     * Feature	      Android	   Firefox Mobile (Gecko)	   IE Mobile	 Opera Mobile	  Safari Mobile
     * Basic support	  2.2	        1.0 (1.9.2)	              9.0	         11.0	          5.
     */
    if (!ensureSlash()) {
      return
    }
    // 过渡到hash
    this.transitionTo(getHash(), function (route) {
      replaceHash(route.fullPath)
    })
  };

  /**
   * 插入路由
   * @description 插入路由
   * @param location [location]
   */
  HashHistory.prototype.push = function push (location) {
    this.transitionTo(location, function (route) {
      pushHash(route.fullPath)
    })
  };

  /**
   * 替换路由
   * @description 替换路由
   * @param location [location]
   */
  HashHistory.prototype.replace = function replace (location) {
    this.transitionTo(location, function (route) {
      replaceHash(route.fullPath)
    })
  };
  
  /**
   * 移动到历史记录中的特定位置
   * @description 移动到历史记录中的特定位置
   * @param n [number]
   */
  HashHistory.prototype.go = function go (n) {
    window.history.go(n)
  };

  /**
   * 确保当前的Hash
   * @description 确保当前Hash
   * @param push [push]
   */
  HashHistory.prototype.ensureURL = function ensureURL (push) {
    var current = this.current.fullPath
    if (getHash() !== current) {
      push ? pushHash(current) : replaceHash(current)
    }
  };

  // 返回HashHistory函数
  return HashHistory;
}(History));

/**
 * 确保当前Hash
 */
function ensureSlash () {
  var path = getHash()
  if (path.charAt(0) === '/') {
    return true
  }
  replaceHash('/' + path)
  return false
}

/**
 * 获取hash字符串
 * @description 获取hash字符串
 */
function getHash () {
  // We can't use window.location.hash here because it's not
  // consistent across browsers - Firefox will pre-decode it!
  // 我们在这里不能利用window.location.hash获取值，因为在firefox浏览器中表现的不一致的，将预解码！
  var href = window.location.href
  var index = href.indexOf('#')
  return index === -1 ? '' : href.slice(index + 1)
}
// 添加hash
function pushHash (path) {
  window.location.hash = path
}
// 替换hash
function replaceHash (path) {
  var i = window.location.href.indexOf('#')
  window.location.replace(
    window.location.href.slice(0, i >= 0 ? i : 0) + '#' + path
  )
}

/*  */

/**
 * AbstractHistory函数
 */
var AbstractHistory = (function (History) {
  /**
   * AbstractHistory函数
   * @description AbstractHistory函数
   * @param router [router]
   */
  function AbstractHistory (router) {
    History.call(this, router)
    // 用数组模仿History
    this.stack = []
    this.index = -1
  }

  // __proto__指向History 
  if ( History ) AbstractHistory.__proto__ = History;
  // 运用原型链继承
  AbstractHistory.prototype = Object.create( History && History.prototype );
  // 该原型对象对应的构造函数
  AbstractHistory.prototype.constructor = AbstractHistory;

  /**
   * 添加路由
   * @description 添加路由
   * @param location [location]
   */
  AbstractHistory.prototype.push = function push (location) {
    var this$1 = this;

    this.transitionTo(location, function (route) {
      this$1.stack = this$1.stack.slice(0, this$1.index + 1).concat(route)
      this$1.index++
    })
  };
  
  /**
   * 替换路由
   * @description 替换路由
   * @param location [location]
   */
  AbstractHistory.prototype.replace = function replace (location) {
    var this$1 = this;

    this.transitionTo(location, function (route) {
      this$1.stack = this$1.stack.slice(0, this$1.index).concat(route)
    })
  };

  /**
   * 移动到历史记录中的特定位置
   * @description 移动到历史记录中的特定位置
   * @param n [number]
   */
  AbstractHistory.prototype.go = function go (n) {
    var this$1 = this;

    var targetIndex = this.index + n
    if (targetIndex < 0 || targetIndex >= this.stack.length) {
      return
    }
    var route = this.stack[targetIndex]
    this.confirmTransition(route, function () {
      this$1.index = targetIndex
      this$1.updateRoute(route)
    })
  };

  AbstractHistory.prototype.ensureURL = function ensureURL () {
    // noop
  };
  // 返回AbstractHistory函数
  return AbstractHistory;
}(History));

/*  */

/**
 * VueRouter构造函数
 * @description VueRouter构造函数
 * @param options [options]
 */
var VueRouter = function VueRouter (options) {
  if ( options === void 0 ) options = {};
  // 初始化一些属性
  this.app = null
  this.options = options
  this.beforeHooks = []
  this.afterHooks = []
  // 创建 match 匹配函数
  this.match = createMatcher(options.routes || [])
  // 路由方式，根据 mode 实例化具体的History
  var mode = options.mode || 'hash'
  this.fallback = mode === 'history' && !supportsHistory
  if (this.fallback) {
    mode = 'hash'
  }
  if (!inBrowser) {
    mode = 'abstract'
  }
  this.mode = mode

  switch (mode) {
    case 'history':
      this.history = new HTML5History(this, options.base)
      break
    case 'hash':
      this.history = new HashHistory(this, options.base, this.fallback)
      break
    case 'abstract':
      this.history = new AbstractHistory(this)
      break
    default:
      "development" !== 'production' && assert(false, ("invalid mode: " + mode))
  }
};

// 原型的访问器
var prototypeAccessors = { currentRoute: {} };
// get函数 返回为history.current
prototypeAccessors.currentRoute.get = function () {
  return this.history && this.history.current
};

/**
 * VueRouter实例对象的初始化
 * @description VueRouter实例对象的初始化
 * @param app [Vue实例对象]
 */
VueRouter.prototype.init = function init (app /* Vue component instance */) {

  // 针对于 HTML5History 和 HashHistory 特殊处理，
  // 因为在这两种模式下才有可能存在进入时候的不是默认页，需要根据当前浏览器地址栏里的path 或者 hash 来激活对应的路由，
  // 此时就是通过调用 transitionTo 来达到目的；而且此时还有个注意点是针对于 HashHistory 有特殊处理，
  // 为什么不直接在初始化 HashHistory 的时候监听 hashchange 事件呢？
  // 这个是为了修复https://github.com/vuejs/vue-router#725这个 bug 而这样做的，
  // 简要来说就是说如果在 beforeEnter 这样的钩子函数中是异步的话，beforeEnter 钩子就会被触发两次，
  // 原因是因为在初始化的时候如果此时的 hash 值不是以 / 开头的话就会补上 #/，这个过程会触发 hashchange 事件，
  // 所以会再走一次生命周期钩子，也就意味着会再次调用 beforeEnter 钩子函数。


  // this指向的为VueRouter实例对象
  var this$1 = this;

  "development" !== 'production' && assert(
    install.installed,
    "not installed. Make sure to call `Vue.use(VueRouter)` " +
    "before creating root instance."
  )
  // 把Vue实例对象挂载到VueRouter实例对象的app属性上
  this.app = app
  // History实例化对象 ，根据mode参数及后续代码判断而采取的history具体实例
  var history = this.history

  if (history instanceof HTML5History) {
    history.transitionTo(getLocation(history.base))
  } else if (history instanceof HashHistory) {
    // hashchange事件兼容性见HashHistory原型onHashChange方法
    var setupHashListener = function () {
      window.addEventListener('hashchange', function () {
        history.onHashChange()
      })
    }
    history.transitionTo(getHash(), setupHashListener, setupHashListener)
  }
  // history监听路由改变事件
  history.listen(function (route) {
    this$1.app._route = route
  })
};

/**
 * router遍历之前调用的钩子函数
 * @description router遍历之前调用的钩子函数
 * @param fn [function]
 */
VueRouter.prototype.beforeEach = function beforeEach (fn) {
  this.beforeHooks.push(fn)
};

/**
 * router遍历之后调用的钩子函数
 * @description router遍历之后调用的钩子函数
 * @param fn [function]
 */
VueRouter.prototype.afterEach = function afterEach (fn) {
  this.afterHooks.push(fn)
};

/**
 * 路由改变调用的函数
 * @description 路由改变调用的函数
 * @param location [location]
 */
VueRouter.prototype.push = function push (location) {
  this.history.push(location)
};

/**
 * 替换路由
 * @description 替换路由
 * @param location [location]
 */
VueRouter.prototype.replace = function replace (location) {
  this.history.replace(location)
};

/**
 * 移动到历史记录中的特定位置
 * @description 移动到历史记录中的特定位置
 * @param n [number]
 */
VueRouter.prototype.go = function go (n) {
  this.history.go(n)
};

/**
 * 返回上个路由
 * @description 返回上个路由
 */
VueRouter.prototype.back = function back () {
  this.go(-1)
};

/**
 * 进入下个路由
 * @description 进入下个路由
 */
VueRouter.prototype.forward = function forward () {
  this.go(1)
};

VueRouter.prototype.getMatchedComponents = function getMatchedComponents (to) {
  var route = to
    ? this.resolve(to).resolved
    : this.currentRoute
  if (!route) {
    return []
  }
  return [].concat.apply([], route.matched.map(function (m) {
    return Object.keys(m.components).map(function (key) {
      return m.components[key]
    })
  }))
};

/**
 * 解析路由
 * @description 解析路由
 * @param to [to]
 * @param current [current]
 * @param append [append]
 */
VueRouter.prototype.resolve = function resolve (
  to,
  current,
  append
) {
  // 路由规范化
  var normalizedTo = normalizeLocation(to, current || this.history.current, append)
  var resolved = this.match(normalizedTo, current)
  var fullPath = resolved.redirectedFrom || resolved.fullPath
  var base = this.history.base
  var href = createHref(base, fullPath, this.mode)
  return {
    normalizedTo: normalizedTo,
    resolved: resolved,
    href: href
  }
};

// 扩展VueRouter原型，增加currentRoute属性
Object.defineProperties( VueRouter.prototype, prototypeAccessors );

/**
 * 创建一个链接地址
 * @description 创建一个链接地址
 * @param base [base]
 * @param fullPath [fullPath]
 * @param mode [mode]
 */
function createHref (base, fullPath, mode) {
  var path = mode === 'hash' ? '#' + fullPath : fullPath
  return base ? cleanPath(base + '/' + path) : path
}
// 插件安装,Vue.use会用到此函数
VueRouter.install = install

// 如果在浏览器渲染并且VueJs库已经引用，那么调用Vue.use函数
if (inBrowser && window.Vue) {
  window.Vue.use(VueRouter)
}
// 返回一个VueRouter对象
return VueRouter;

})));