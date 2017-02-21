/*!
 * Vue.js v2.1.8
 * (c) 2014-2016 Evan You
 * Released under the MIT License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Vue = factory());
}(this, (function () { 'use strict';

/*  */

/**
 * Convert a value to a string that is actually rendered.
 * 转换成字符串，JSON.stringify 存在兼容性问题
 */
function _toString (val) {
  return val == null
    ? ''
    : typeof val === 'object'
      ? JSON.stringify(val, null, 2)
      : String(val)
}

/**
 * Convert a input value to a number for persistence.
 * 把输入值转化成数字，若转换失败则返回原始字符串
 * If the conversion fails, return original string.
 */
function toNumber (val) {
  var n = parseFloat(val, 10);
  // 此处保证数字0能被正常解析成数字
  return (n || n === 0) ? n : val
}

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 * 创建一个map对象并返回一个函数，以检查键是否在该对象中.
 */
function makeMap (
  str,
  expectsLowerCase
) {
  var map = Object.create(null);
  var list = str.split(',');
  for (var i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase
    ? function (val) { return map[val.toLowerCase()]; }
    : function (val) { return map[val]; }
}

/**
 * Check if a tag is a built-in tag.
 */
var isBuiltInTag = makeMap('slot,component', true);

/**
 * Remove an item from an array
 * 移除数组中存在的元素
 */
function remove$1 (arr, item) {
  if (arr.length) {
    var index = arr.indexOf(item);
    // if(~index){
    //   return arr.splice(index,1);
    // }
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

/**
 * Check whether the object has the property.
 * 检查对象是否具有属性，亦可用for in 循环遍历，此处代码更少
 */
var hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}

/**
 * Check if value is primitive
 * 检查是否为原始的
 */
function isPrimitive (value) {
  return typeof value === 'string' || typeof value === 'number'
}

/**
 * Create a cached version of a pure function.
 * 利用闭包创建缓存方法
 */
function cached (fn) {
  var cache = Object.create(null);
  return (function cachedFn (str) {
    var hit = cache[str];
    return hit || (cache[str] = fn(str))
  })
}

/**
 * Camelize a hyphen-delmited string.
 * 含有拼接“-”的字符串转换成驼峰
 * 如：say-hello-world sayHelloWorld
 */
var camelizeRE = /-(\w)/g;
var camelize = cached(function (str) {
  return str.replace(camelizeRE, function (_, c) { return c ? c.toUpperCase() : ''; })
});

/**
 * Capitalize a string.
 * 首字母大写
 */
var capitalize = cached(function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
});

/**
 * Hyphenate a camelCase string.
 * 驼峰命名的字符串用-连接
 * 如：sayHelloWorld say-hello-world
 */
var hyphenateRE = /([^-])([A-Z])/g;
var hyphenate = cached(function (str) {
  // 疑问 为什么要用两个replace
  return str
    .replace(hyphenateRE, '$1-$2')
    .replace(hyphenateRE, '$1-$2')
    .toLowerCase()
});

/**
 * Simple bind, faster than native
 * 简单绑定,主要用于改变this的指向，指向Vue实例对象
 */
function bind$1 (fn, ctx) {
  function boundFn (a) {
    var l = arguments.length;
    return l
      ? l > 1
        ? fn.apply(ctx, arguments)
        : fn.call(ctx, a)
      : fn.call(ctx)
  }
  // record original fn length
  boundFn._length = fn.length;
  return boundFn
}

/**
 * Convert an Array-like object to a real Array.
 * 把类数组的对象转换成真正的数组
 */
function toArray (list, start) {
  start = start || 0;
  var i = list.length - start;
  var ret = new Array(i);
  while (i--) {
    ret[i] = list[i + start];
  }
  return ret
}

/**
 * Mix properties into target object.
 * 混合属性到目标对象，属于完全覆盖
 */
function extend (to, _from) {
  for (var key in _from) {
    to[key] = _from[key];
  }
  return to
}

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 */
function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 * 严格object类型检查
 */
var toString = Object.prototype.toString;
var OBJECT_STRING = '[object Object]';
function isPlainObject (obj) {
  return toString.call(obj) === OBJECT_STRING
}

/**
 * Merge an Array of Objects into a single Object.
 * 将对象数组合并到单个对象中
 */
function toObject (arr) {
  var res = {};
  for (var i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i]);
    }
  }
  return res
}

/**
 * Perform no operation.
 * 不执行什么操作
 */
function noop () {}

/**
 * Always return false.
 * 始终返回false
 */
var no = function () { return false; };

/**
 * Return same value
 * 返回相同的值（原值）
 */
var identity = function (_) { return _; };

/**
 * Generate a static keys string from compiler modules.
 * 从编译器模块生成静态字符串
 */
function genStaticKeys (modules) {
  return modules.reduce(function (keys, m) {
    return keys.concat(m.staticKeys || [])
  }, []).join(',')
}

/**
 * Check if two values are loosely equal - that is,
 * if they are plain objects, do they have the same shape?
 * 检查两个值是否相等，转换成字符串后比较
 */
function looseEqual (a, b) {
  var isObjectA = isObject(a);
  var isObjectB = isObject(b);
  if (isObjectA && isObjectB) {
    return JSON.stringify(a) === JSON.stringify(b)
  } else if (!isObjectA && !isObjectB) {
    return String(a) === String(b)
  } else {
    return false
  }
}
/**
 * 获取某个元素在数组中的位置，调用looseEqual进行对比
 */
function looseIndexOf (arr, val) {
  // 没有空值判断和是否为数组，
  for (var i = 0; i < arr.length; i++) {
    if (looseEqual(arr[i], val)) { return i }
  }
  return -1
}

/*  */
// 配置参数
var config = {
  /**
   * Option merge strategies (used in core/util/options)
   * 合并策略选项
   */
  optionMergeStrategies: Object.create(null),

  /**
   * Whether to suppress warnings.
   * 是否禁止警告信息，默认值为false
   */
  silent: false,

  /**
   * Whether to enable devtools
   * 是否启用开发工具，默认值true
   */
  devtools: "development" !== 'production',

  /**
   * Error handler for watcher errors
   * 错误处理程序
   */
  errorHandler: null,

  /**
   * Ignore certain custom elements
   * 忽略某些自定义元素
   */
  ignoredElements: [],

  /**
   * Custom user key aliases for v-on
   * 自定义别名
   */
  keyCodes: Object.create(null),

  /**
   * Check if a tag is reserved so that it cannot be registered as a
   * component. This is platform-dependent and may be overwritten.
   * 检查标签是否属于保留字段，不能被注册成组件，属于平台依赖并且会被覆盖 默认false
   */
  isReservedTag: no,

  /**
   * Check if a tag is an unknown element.
   * 检查标签是否属于未知元素
   * Platform-dependent.
   */
  isUnknownElement: no,

  /**
   * Get the namespace of an element
   * 获取元素的命名空间
   */
  getTagNamespace: noop,

  /**
   * Parse the real tag name for the specific platform.
   * 解析成平台特定的真实标签
   */
  parsePlatformTagName: identity,

  /**
   * Check if an attribute must be bound using property, e.g. value
   * Platform-dependent.
   */
  mustUseProp: no,

  /**
   * List of asset types that a component can own.
   * 一个组件可以拥有的属性列表
   */
  _assetTypes: [
    'component',
    'directive',
    'filter'
  ],

  /**
   * List of lifecycle hooks.
   * 钩子函数生命周期列表
   */
  _lifecycleHooks: [
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'updated',
    'beforeDestroy',
    'destroyed',
    'activated',
    'deactivated'
  ],

  /**
   * Max circular updates allowed in a scheduler flush cycle.
   * 允许调度刷新周期更新的最大值
   */
  _maxUpdateCount: 100
};

/*  */

/**
 * Check if a string starts with $ or _
 * 检查字符串是否以$或者_开始
 * $ 36 0044 0x24 和 _ 95 0137 0x5f 
 */
function isReserved (str) {
  var c = (str + '').charCodeAt(0);
  return c === 0x24 || c === 0x5F
}

/**
 * Define a property.
 * 为指定对象添加一个属性
 */
function def (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  });
}

/**
 * Parse simple path.
 * 解析一个简单的路径
 */
var bailRE = /[^\w.$]/;
function parsePath (path) {
  if (bailRE.test(path)) {
    return
  } else {
    var segments = path.split('.');
    return function (obj) {
      for (var i = 0; i < segments.length; i++) {
        if (!obj) { return }
        obj = obj[segments[i]];
      }
      return obj
    }
  }
}

/*  */
/* globals MutationObserver */
// 全局变化观察者

// can we use __proto__?
var hasProto = '__proto__' in {};

// Browser environment sniffing
// 浏览器环境嗅探
var inBrowser = typeof window !== 'undefined';
var UA = inBrowser && window.navigator.userAgent.toLowerCase();
var isIE = UA && /msie|trident/.test(UA);
var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
var isEdge = UA && UA.indexOf('edge/') > 0;
var isAndroid = UA && UA.indexOf('android') > 0;
var isIOS = UA && /iphone|ipad|ipod|ios/.test(UA);

// this needs to be lazy-evaled because vue may be required before
// vue-server-renderer can set VUE_ENV
var _isServer;
var isServerRendering = function () {
  if (_isServer === undefined) {
    /* istanbul ignore if */
    if (!inBrowser && typeof global !== 'undefined') {
      // detect presence of vue-server-renderer and avoid
      // Webpack shimming the process
      _isServer = global['process'].env.VUE_ENV === 'server';
    } else {
      _isServer = false;
    }
  }
  return _isServer
};

// detect devtools
// 检测开发者工具
var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

/* istanbul ignore next */
function isNative (Ctor) {
  return /native code/.test(Ctor.toString())
}

/**
 * Defer a task to execute it asynchronously.
 * 延迟一个任务并做异步处理
 */
var nextTick = (function () {
  var callbacks = [];
  var pending = false;
  var timerFunc;

  function nextTickHandler () {
    pending = false;
    var copies = callbacks.slice(0);
    callbacks.length = 0;
    for (var i = 0; i < copies.length; i++) {
      copies[i]();
    }
  }

  // the nextTick behavior leverages the microtask queue, which can be accessed
  // via either native Promise.then or MutationObserver.
  // MutationObserver has wider support, however it is seriously bugged in
  // UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
  // completely stops working after triggering a few times... so, if native
  // Promise is available, we will use it:
  /* istanbul ignore if */

  // nexttick行为利用微任务队列，
  // 它可以通过访问promise.then 或者 MutationObserver。
  // MutationObserver有更广泛的支持，然而它有严重的bug在iOS > = 9.3.3当触摸事件处理程序引发的UIWebView。
  // 触发几次后完全停止工作…所以，
  // 如果Promise是可用的，我们将使用它：
  if (typeof Promise !== 'undefined' && isNative(Promise)) {
    var p = Promise.resolve();
    var logError = function (err) { console.error(err); };
    timerFunc = function () {
      p.then(nextTickHandler).catch(logError);
      // in problematic UIWebViews, Promise.then doesn't completely break, but
      // it can get stuck in a weird state where callbacks are pushed into the
      // microtask queue but the queue isn't being flushed, until the browser
      // needs to do some other work, e.g. handle a timer. Therefore we can
      // "force" the microtask queue to be flushed by adding an empty timer.
      if (isIOS) { setTimeout(noop); }
    };
  } else if (typeof MutationObserver !== 'undefined' && (
    isNative(MutationObserver) ||
    // PhantomJS and iOS 7.x
    MutationObserver.toString() === '[object MutationObserverConstructor]'
  )) {
    // use MutationObserver where native Promise is not available,
    // e.g. PhantomJS IE11, iOS7, Android 4.4
    var counter = 1;
    var observer = new MutationObserver(nextTickHandler);
    var textNode = document.createTextNode(String(counter));
    observer.observe(textNode, {
      characterData: true
    });
    timerFunc = function () {
      counter = (counter + 1) % 2;
      textNode.data = String(counter);
    };
  } else {
    // fallback to setTimeout
    /* istanbul ignore next */
    timerFunc = function () {
      setTimeout(nextTickHandler, 0);
    };
  }

  return function queueNextTick (cb, ctx) {
    var _resolve;
    callbacks.push(function () {
      if (cb) { cb.call(ctx); }
      if (_resolve) { _resolve(ctx); }
    });
    if (!pending) {
      pending = true;
      timerFunc();
    }
    if (!cb && typeof Promise !== 'undefined') {
      return new Promise(function (resolve) {
        _resolve = resolve;
      })
    }
  }
})();

var _Set;
/* istanbul ignore if */
if (typeof Set !== 'undefined' && isNative(Set)) {
  // use native Set when available.
  // 当原生的可以用即用原生的
  _Set = Set;
} else {
  // a non-standard Set polyfill that only works with primitive keys.
  _Set = (function () {
    function Set () {
      this.set = Object.create(null);
    }
    Set.prototype.has = function has (key) {
      return this.set[key] === true
    };
    Set.prototype.add = function add (key) {
      this.set[key] = true;
    };
    Set.prototype.clear = function clear () {
      this.set = Object.create(null);
    };

    return Set;
  }());
}

var warn = noop;
var formatComponentName;

{
  var hasConsole = typeof console !== 'undefined';
  // 警告信息
  warn = function (msg, vm) {
    if (hasConsole && (!config.silent)) {
      console.error("[Vue warn]: " + msg + " " + (
        vm ? formatLocation(formatComponentName(vm)) : ''
      ));
    }
  };
  // 格式化组件名称
  formatComponentName = function (vm) {
    if (vm.$root === vm) {
      // 根实例
      return 'root instance'
    }
    var name = vm._isVue
      ? vm.$options.name || vm.$options._componentTag
      : vm.name;
    return (
      (name ? ("component <" + name + ">") : "anonymous component") +
      (vm._isVue && vm.$options.__file ? (" at " + (vm.$options.__file)) : '')
    )
  };
  // 格式化显示
  var formatLocation = function (str) {
    if (str === 'anonymous component') {
      str += " - use the \"name\" option for better debugging messages.";
    }
    return ("\n(found in " + str + ")")
  };
}

/*  */


var uid$1 = 0;

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 * dep是一个观察者，接受多模块订阅
 */
var Dep = function Dep () {
  this.id = uid$1++;
  this.subs = [];
};

// 添加订阅
Dep.prototype.addSub = function addSub (sub) {
  this.subs.push(sub);
};
// 移除订阅
Dep.prototype.removeSub = function removeSub (sub) {
  remove$1(this.subs, sub);
};
// 依赖
Dep.prototype.depend = function depend () {
  if (Dep.target) {
    Dep.target.addDep(this);
  }
};
// 通知/广播
Dep.prototype.notify = function notify () {
  // stablize the subscriber list first
  var subs = this.subs.slice();
  for (var i = 0, l = subs.length; i < l; i++) {
    subs[i].update();
  }
};

// the current target watcher being evaluated.
// this is globally unique because there could be only one
// watcher being evaluated at any time.
// 当前目标观察者被赋值
Dep.target = null;
var targetStack = [];

function pushTarget (_target) {
  if (Dep.target) { targetStack.push(Dep.target); }
  Dep.target = _target;
}

function popTarget () {
  Dep.target = targetStack.pop();
}

/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

var arrayProto = Array.prototype;
var arrayMethods = Object.create(arrayProto);
[
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]
.forEach(function (method) {
  // cache original method
  var original = arrayProto[method];
  def(arrayMethods, method, function mutator () {
    var arguments$1 = arguments;

    // avoid leaking arguments:
    // http://jsperf.com/closure-with-arguments
    var i = arguments.length;
    var args = new Array(i);
    while (i--) {
      args[i] = arguments$1[i];
    }
    var result = original.apply(this, args);
    var ob = this.__ob__;
    var inserted;
    switch (method) {
      case 'push':
        inserted = args;
        break
      case 'unshift':
        inserted = args;
        break
      case 'splice':
        inserted = args.slice(2);
        break
    }
    if (inserted) { ob.observeArray(inserted); }
    // notify change
    ob.dep.notify();
    return result
  });
});

/*  */
// 返回对象自己的属性的名称。一个对象的自己的属性是指直接对该对象定义的属性，
// 而不是从该对象的原型继承的属性。对象的属性包括字段（对象）和函数。
/**
 * arrayKeys = ['push','pop','shift','unshift','splice','sort','reverse'];
 */
var arrayKeys = Object.getOwnPropertyNames(arrayMethods);

/**
 * By default, when a reactive property is set, the new value is
 * also converted to become reactive. However when passing down props,
 * we don't want to force conversion because the value may be a nested value
 * under a frozen data structure. Converting it would defeat the optimization.
 */
var observerState = {
  shouldConvert: true,
  isSettingProps: false
};

/**
 * Observer class that are attached to each observed
 * object. Once attached, the observer converts target
 * object's property keys into getter/setters that
 * collect dependencies and dispatches updates.
 * Observe对象是连接每个观察者对象，一旦连接，观察者转换目标
 * 对象属性的getter和setter 收集并分发更新
 */
var Observer = function Observer (value) {
  this.value = value;
  this.dep = new Dep();
  this.vmCount = 0;
  // 添加__ob__属性，并指向此对象
  def(value, '__ob__', this);
  if (Array.isArray(value)) {
    // question 此处每次调用都会询问采用哪种方式增加目标对象或者数组
    var augment = hasProto ? protoAugment : copyAugment;
    augment(value, arrayMethods, arrayKeys);
    // 观察数组中每个元素
    this.observeArray(value);
  } else {
    // 转换对象属性
    this.walk(value);
  }
};

/**
 * Walk through each property and convert them into
 * getter/setters. This method should only be called when
 * value type is Object.
 * 递归每个属性getter和setter并转换
 * 只在值类型为对象时调用此方法
 */
Observer.prototype.walk = function walk (obj) {
  // 返回对象的可枚举属性和方法的名称。
  var keys = Object.keys(obj);
  for (var i = 0; i < keys.length; i++) {
    defineReactive$$1(obj, keys[i], obj[keys[i]]);
  }
};

/**
 * Observe a list of Array items.
 * 观察数组元素列表
 */
Observer.prototype.observeArray = function observeArray (items) {
  for (var i = 0, l = items.length; i < l; i++) {
    observe(items[i]);
  }
};

// helpers

/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 * 利用__proto__原型链增加目标对象或数组
 */
function protoAugment (target, src) {
  /* eslint-disable no-proto */
  target.__proto__ = src;
  /* eslint-enable no-proto */
}

/**
 * Augment an target Object or Array by defining
 * hidden properties.
 * 通过定义隐藏属性来增加目标对象或数组
 */
/* istanbul ignore next */
function copyAugment (target, src, keys) {
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i];
    def(target, key, src[key]);
  }
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 * 尝试为值创建一个观察实例，如果成功地观察到了新的观察者，或者该值已经有一个。
 */
function observe (value, asRootData) {
  // 需验证值是否为对象
  if (!isObject(value)) {
    return
  }
  var ob;
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else if (
    observerState.shouldConvert &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    ob = new Observer(value);
  }
  if (asRootData && ob) {
    ob.vmCount++;
  }
  return ob
}

/**
 * Define a reactive property on an Object.
 * 在一个对象上定义一个响应式属性
 * @description 在一个对象上定义一个响应式属性
 * @param obj [对象]
 * @param key [键]
 * @param val [值]
 * @param customSetter [自定义设置]
 */
function defineReactive$$1 (
  obj,
  key,
  val,
  customSetter
) {
  var dep = new Dep();
  // 获取指定对象的自身属性描述符
  var property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  // 缓存下预定义方法
  var getter = property && property.get;
  var setter = property && property.set;

  var childOb = observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      var value = getter ? getter.call(obj) : val;
      if (Dep.target) {
        dep.depend();
        if (childOb) {
          childOb.dep.depend();
        }
        if (Array.isArray(value)) {
          dependArray(value);
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      var value = getter ? getter.call(obj) : val;
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if ("development" !== 'production' && customSetter) {
        customSetter();
      }
      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }
      childOb = observe(newVal);
      dep.notify();
    }
  });
}

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 * 在对象上设置属性。如果属性不存在，则添加新属性并引发更改通知
 */
function set$1 (obj, key, val) {
  if (Array.isArray(obj)) {
    // 如果是数组即首先设置数组的个数
    // 从数组中移除元素，在所移除元素的位置上插入新元素，并返回所移除的元素。
    obj.length = Math.max(obj.length, key);
    obj.splice(key, 1, val);
    return val
  }
  if (hasOwn(obj, key)) {
    // 如果是对象原有属性或方法，直接做替换操作
    obj[key] = val;
    return
  }

  var ob = obj.__ob__;
  if (obj._isVue || (ob && ob.vmCount)) {
    "development" !== 'production' && warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    );
    return
  }
  if (!ob) {
    obj[key] = val;
    return
  }
  defineReactive$$1(ob.value, key, val);
  ob.dep.notify();
  return val
}

/**
 * Delete a property and trigger change if necessary.
 * 删除一个属性并在必要时触发更改
 */
function del (obj, key) {
  var ob = obj.__ob__;
  if (obj._isVue || (ob && ob.vmCount)) {
    "development" !== 'production' && warn(
      'Avoid deleting properties on a Vue instance or its root $data ' +
      '- just set it to null.'
    );
    return
  }
  if (!hasOwn(obj, key)) {
    return
  }
  delete obj[key];
  if (!ob) {
    return
  }
  ob.dep.notify();
}

/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 */
function dependArray (value) {
  for (var e = (void 0), i = 0, l = value.length; i < l; i++) {
    e = value[i];
    e && e.__ob__ && e.__ob__.dep.depend();
    if (Array.isArray(e)) {
      dependArray(e);
    }
  }
}

/*  */

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 * 选项合并策略
 */
var strats = config.optionMergeStrategies;

/**
 * Options with restrictions
 */
{
  strats.el = strats.propsData = function (parent, child, vm, key) {
    if (!vm) {
      warn(
        "option \"" + key + "\" can only be used during instance " +
        'creation with the `new` keyword.'
      );
    }
    return defaultStrat(parent, child)
  };
}

/**
 * Helper that recursively merges two data objects together.
 * 将两个对象递归地合并在一起
 */
function mergeData (to, from) {
  if (!from) { return to }
  var key, toVal, fromVal;
  var keys = Object.keys(from);
  for (var i = 0; i < keys.length; i++) {
    key = keys[i];
    toVal = to[key];
    fromVal = from[key];
    if (!hasOwn(to, key)) {
      set$1(to, key, fromVal);
    } else if (isPlainObject(toVal) && isPlainObject(fromVal)) {
      mergeData(toVal, fromVal);
    }
  }
  return to
}

/**
 * Data
 */
strats.data = function (
  parentVal,
  childVal,
  vm
) {
  if (!vm) {
    // in a Vue.extend merge, both should be functions
    // 进行Vue.extend扩展合并时，全部应该是函数
    if (!childVal) {
      return parentVal
    }
    if (typeof childVal !== 'function') {
      "development" !== 'production' && warn(
        'The "data" option should be a function ' +
        'that returns a per-instance value in component ' +
        'definitions.',
        vm
      );
      return parentVal
    }
    if (!parentVal) {
      return childVal
    }
    // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.
    //当parentval和childval都存在，我们需要返回一个函数返回的结果的合并
    //不需要检测parentval是否是一个函数，因为它在上次合并已经验证是函数。
    return function mergedDataFn () {
      return mergeData(
        childVal.call(this),
        parentVal.call(this)
      )
    }
  } else if (parentVal || childVal) {
    return function mergedInstanceDataFn () {
      // instance merge
      // 实例合并
      // 按照正常理解此代码，childVal如果是function,则调用自己并且改变作用域，如果不是函数则返回对象自己
      var instanceData = typeof childVal === 'function'
        ? childVal.call(vm)
        : childVal;
      // parentVal如果是function,则调用自己并且改变作用域，如果不是函数则返回undefined
      var defaultData = typeof parentVal === 'function'
        ? parentVal.call(vm)
        : undefined;
      if (instanceData) {
        return mergeData(instanceData, defaultData)
      } else {
        return defaultData
      }
    }
  }
};

/**
 * Hooks and param attributes are merged as arrays.
 * 钩子和参数属性合并为数组
 */
function mergeHook (
  parentVal,
  childVal
) {
  return childVal ? parentVal ? parentVal.concat(childVal) : Array.isArray(childVal) ? childVal : [childVal]: parentVal
}

/**
 * strats.beforeCreate = mergeHook;
 * strats.created = mergeHook;
 * strats.beforeMount = mergeHook;
 * strats.mounted = mergeHook;
 * strats.beforeUpdate = mergeHook;
 * strats.updated = mergeHook;
 * strats.beforeDestroy = mergeHook;
 * strats.destroyed = mergeHook;
 * strats.activated = mergeHook;
 * strats.deactivated = mergeHook;
 */
config._lifecycleHooks.forEach(function (hook) {
  strats[hook] = mergeHook;
});

/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 * 当存在一个VM（实例创建）时，我们需要在构造函数选项、实例选项和父选项之间进行三路合并。
 */
function mergeAssets (parentVal, childVal) {
  var res = Object.create(parentVal || null);
  // 此处属于属性完全覆写
  return childVal
    ? extend(res, childVal)
    : res
}

/**
 * strats.component = mergeAssets;
 * strats.directive = mergeAssets;
 * strats.filter = mergeAssets;
 */
config._assetTypes.forEach(function (type) {
  strats[type + 's'] = mergeAssets;
});

/**
 * Watchers.
 * 守望者
 *
 * Watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 * 守望者的哈希值不应覆盖另一个，所以我们将它们合并为数组。
 * 既守望者的属性不应该被覆写
 */
strats.watch = function (parentVal, childVal) {
  /* istanbul ignore if */
  if (!childVal) { return parentVal }
  if (!parentVal) { return childVal }
  var ret = {};
  extend(ret, parentVal);
  for (var key in childVal) {
    var parent = ret[key];
    var child = childVal[key];
    if (parent && !Array.isArray(parent)) {
      parent = [parent];
    }
    ret[key] = parent
      ? parent.concat(child)
      : [child];
  }
  return ret
};

/**
 * Other object hashes.
 * 其它对象的哈希值
 * 属于属性完全覆写并返回一个新对象
 */
strats.props =
strats.methods =
strats.computed = function (parentVal, childVal) {
  if (!childVal) { return parentVal }
  if (!parentVal) { return childVal }
  var ret = Object.create(null);
  extend(ret, parentVal);
  extend(ret, childVal);
  return ret
};

/**
 * Default strategy.
 * 默认策略
 */
var defaultStrat = function (parentVal, childVal) {
  return childVal === undefined
    ? parentVal
    : childVal
};

/**
 * Validate component names
 * 验证组件名称
 */
function checkComponents (options) {
  for (var key in options.components) {
    var lower = key.toLowerCase();
    //slot,component 不能作为组件名称 || 原始标签不能作为组件名称
    if (isBuiltInTag(lower) || config.isReservedTag(lower)) {
      // 不要使用内置的或保留的HTML元素作为组件名称
      warn(
        'Do not use built-in or reserved HTML elements as component ' +
        'id: ' + key
      );
    }
  }
}

/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 * 确保所有属性选项语法归为基于对象的格式。
 */
function normalizeProps (options) {
  var props = options.props;
  if (!props) { return }
  var res = {};
  var i, val, name;
  if (Array.isArray(props)) {
    i = props.length;
    while (i--) {
      val = props[i];
      if (typeof val === 'string') {
        // name 转换成驼峰命名规则的字符串 如sayHelloWorld
        name = camelize(val);
        res[name] = { type: null };
      } else {
        warn('props must be strings when using array syntax.');
      }
    }
  } else if (isPlainObject(props)) {
    // 如果是对象
    for (var key in props) {
      val = props[key];
      // name 转换成驼峰命名规则的字符串 如sayHelloWorld
      name = camelize(key);
      // 如果val是对象那么直接返回，但如果val={type:null}的时候不知道怎么处理的
      res[name] = isPlainObject(val)
        ? val
        : { type: val };
    }
  }
  options.props = res;
}

/**
 * Normalize raw function directives into object format.
 * 将原始指令函数转换为对象格式
 */
function normalizeDirectives (options) {
  var dirs = options.directives;
  if (dirs) {
    for (var key in dirs) {
      var def = dirs[key];
      if (typeof def === 'function') {
        dirs[key] = { bind: def, update: def };
      }
    }
  }
}

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 * 两个对象合并成一个新的。用于实例化和继承
 */
function mergeOptions (
  parent,
  child,
  vm
) {
  // 验证组件名称，格式化props和directives
  {
    checkComponents(child);
  }
  normalizeProps(child);
  normalizeDirectives(child);
  var extendsFrom = child.extends;
  // 处理child.extends
  if (extendsFrom) {
    parent = typeof extendsFrom === 'function'
      ? mergeOptions(parent, extendsFrom.options, vm)
      : mergeOptions(parent, extendsFrom, vm);
  }
  // 处理child.mixins
  if (child.mixins) {
    for (var i = 0, l = child.mixins.length; i < l; i++) {
      var mixin = child.mixins[i];
      if (mixin.prototype instanceof Vue$3) {
        mixin = mixin.options;
      }
      parent = mergeOptions(parent, mixin, vm);
    }
  }
  var options = {};
  var key;
  for (key in parent) {
    mergeField(key);
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key);
    }
  }
  function mergeField (key) {
    var strat = strats[key] || defaultStrat;
    options[key] = strat(parent[key], child[key], vm, key);
  }
  return options
}

/**
 * Resolve an asset.
 * This function is used because child instances need access
 * to assets defined in its ancestor chain.
 * 此函数被使用，子实例需要访问原型链。
 */
function resolveAsset (
  options,
  type,
  id,
  warnMissing
) {
  /* istanbul ignore if */
  if (typeof id !== 'string') {
    return
  }
  var assets = options[type];
  // check local registration variations first
  if (hasOwn(assets, id)) { return assets[id] }
  var camelizedId = camelize(id);
  if (hasOwn(assets, camelizedId)) { return assets[camelizedId] }
  var PascalCaseId = capitalize(camelizedId);
  if (hasOwn(assets, PascalCaseId)) { return assets[PascalCaseId] }
  // fallback to prototype chain
  var res = assets[id] || assets[camelizedId] || assets[PascalCaseId];
  if ("development" !== 'production' && warnMissing && !res) {
    warn(
      'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
      options
    );
  }
  return res
}

/*  */
/**
 * 验证prop
 */
function validateProp (
  key,
  propOptions,
  propsData,
  vm
) {
  var prop = propOptions[key];
  // 是否为原型链上的属性
  var absent = !hasOwn(propsData, key);
  var value = propsData[key];
  // handle boolean props
  if (isType(Boolean, prop.type)) {
    if (absent && !hasOwn(prop, 'default')) {
      value = false;
    } else if (!isType(String, prop.type) && (value === '' || value === hyphenate(key))) {
      value = true;
    }
  }
  // check default value
  if (value === undefined) {
    value = getPropDefaultValue(vm, prop, key);
    // since the default value is a fresh copy,
    // make sure to observe it.
    // 由于默认值是一个新的副本，确保观察它。
    var prevShouldConvert = observerState.shouldConvert;
    observerState.shouldConvert = true;
    observe(value);
    observerState.shouldConvert = prevShouldConvert;
  }
  {
    assertProp(prop, key, value, vm, absent);
  }
  return value
}

/**
 * Get the default value of a prop.
 * 获取prop的默认值
 */
function getPropDefaultValue (vm, prop, key) {
  // no default, return undefined
  if (!hasOwn(prop, 'default')) {
    return undefined
  }
  var def = prop.default;
  // warn against non-factory defaults for Object & Array
  if (isObject(def)) {
    "development" !== 'production' && warn(
      'Invalid default value for prop "' + key + '": ' +
      'Props with type Object/Array must use a factory function ' +
      'to return the default value.',
      vm
    );
  }
  // the raw prop value was also undefined from previous render,
  // return previous default value to avoid unnecessary watcher trigger
  // 原始prop值在父级也未被定义，则返回父级的默认值，以避免不必要的触发观察者
  if (vm && vm.$options.propsData &&
    vm.$options.propsData[key] === undefined &&
    vm[key] !== undefined) {
    return vm[key]
  }
  // call factory function for non-Function types
  return typeof def === 'function' && prop.type !== Function
    ? def.call(vm)
    : def
}

/**
 * Assert whether a prop is valid.
 * 验证prop是否正确
 */
function assertProp (
  prop,
  name,
  value,
  vm,
  absent
) {
  if (prop.required && absent) {
    warn(
      'Missing required prop: "' + name + '"',
      vm
    );
    return
  }
  if (value == null && !prop.required) {
    return
  }
  var type = prop.type;
  var valid = !type || type === true;
  var expectedTypes = [];
  if (type) {
    if (!Array.isArray(type)) {
      type = [type];
    }
    for (var i = 0; i < type.length && !valid; i++) {
      var assertedType = assertType(value, type[i]);
      expectedTypes.push(assertedType.expectedType || '');
      valid = assertedType.valid;
    }
  }
  if (!valid) {
    warn(
      'Invalid prop: type check failed for prop "' + name + '".' +
      ' Expected ' + expectedTypes.map(capitalize).join(', ') +
      ', got ' + Object.prototype.toString.call(value).slice(8, -1) + '.',
      vm
    );
    return
  }
  var validator = prop.validator;
  if (validator) {
    if (!validator(value)) {
      warn(
        'Invalid prop: custom validator check failed for prop "' + name + '".',
        vm
      );
    }
  }
}

/**
 * Assert the type of a value
 * 值得声明类型
 */
function assertType (value, type) {
  var valid;
  var expectedType = getType(type);
  if (expectedType === 'String') {
    valid = typeof value === (expectedType = 'string');
  } else if (expectedType === 'Number') {
    valid = typeof value === (expectedType = 'number');
  } else if (expectedType === 'Boolean') {
    valid = typeof value === (expectedType = 'boolean');
  } else if (expectedType === 'Function') {
    valid = typeof value === (expectedType = 'function');
  } else if (expectedType === 'Object') {
    valid = isPlainObject(value);
  } else if (expectedType === 'Array') {
    valid = Array.isArray(value);
  } else {
    valid = value instanceof type;
  }
  return {
    valid: valid, // 是否正确
    expectedType: expectedType // 预期类型
  }
}

/**
 * Use function string name to check built-in types,
 * because a simple equality check will fail when running
 * across different vms / iframes.
 * 利用函数的字符串名称检查内置类型，
 * 当运行在不同的虚拟机或内置页框中时等式检查将失败。
 * function sayHello(){} 得到的结果为sayHello
 * var sayHello = function(){} 虽然也是一个function 但是调用toString()
 * 返回的是function(){} 所以得不到类型
 */
function getType (fn) {
  var match = fn && fn.toString().match(/^\s*function (\w+)/);
  return match && match[1]
}

/**
 * String,Number,Boolean,Function,Object,Array 等toString() 
 * 返回的都是function xxx() { [native code] }
 * 所以调用getType都是返回的相对应的类型
 */
function isType (type, fn) {
  if (!Array.isArray(fn)) {
    return getType(fn) === getType(type)
  }
  for (var i = 0, len = fn.length; i < len; i++) {
    if (getType(fn[i]) === getType(type)) {
      return true
    }
  }
  /* istanbul ignore next */
  return false
}


//Object.freeze 阻止修改现有属性的特性和值，并阻止添加新属性。
var util = Object.freeze({
	defineReactive: defineReactive$$1,
	_toString: _toString,
	toNumber: toNumber,
	makeMap: makeMap,
	isBuiltInTag: isBuiltInTag,
	remove: remove$1,
	hasOwn: hasOwn,
	isPrimitive: isPrimitive,
	cached: cached,
	camelize: camelize,
	capitalize: capitalize,
	hyphenate: hyphenate,
	bind: bind$1,
	toArray: toArray,
	extend: extend,
	isObject: isObject,
	isPlainObject: isPlainObject,
	toObject: toObject,
	noop: noop,
	no: no,
	identity: identity,
	genStaticKeys: genStaticKeys,
	looseEqual: looseEqual,
	looseIndexOf: looseIndexOf,
	isReserved: isReserved,
	def: def,
	parsePath: parsePath,
	hasProto: hasProto,
	inBrowser: inBrowser,
	UA: UA,
	isIE: isIE,
	isIE9: isIE9,
	isEdge: isEdge,
	isAndroid: isAndroid,
	isIOS: isIOS,
	isServerRendering: isServerRendering,
	devtools: devtools,
	nextTick: nextTick,
	get _Set () { return _Set; },
	mergeOptions: mergeOptions,
	resolveAsset: resolveAsset,
	get warn () { return warn; },
	get formatComponentName () { return formatComponentName; },
	validateProp: validateProp
});

/* not type checking this file because flow doesn't play well with Proxy */

var initProxy;

{
  var allowedGlobals = makeMap(
    'Infinity,undefined,NaN,isFinite,isNaN,' +
    'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
    'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
    'require' // for Webpack/Browserify
  );
  /**
   * 警告使用了没有声明的变量
   */
  var warnNonPresent = function (target, key) {
    warn(
      "Property or method \"" + key + "\" is not defined on the instance but " +
      "referenced during render. Make sure to declare reactive data " +
      "properties in the data option.",
      target
    );
  };

  // question 为什么不用 isNative(Proxy)
  var hasProxy = typeof Proxy !== 'undefined' && Proxy.toString().match(/native code/);

  if (hasProxy) {
    var isBuiltInModifier = makeMap('stop,prevent,self,ctrl,shift,alt,meta');
    config.keyCodes = new Proxy(config.keyCodes, {
      set: function set (target, key, value) {
        if (isBuiltInModifier(key)) {
          warn(("Avoid overwriting built-in modifier in config.keyCodes: ." + key));
          return false
        } else {
          target[key] = value;
          return true
        }
      }
    });
  }

  var hasHandler = {
    has: function has (target, key) {
      var has = key in target;
      var isAllowed = allowedGlobals(key) || key.charAt(0) === '_';
      if (!has && !isAllowed) {
        warnNonPresent(target, key);
      }
      return has || !isAllowed
    }
  };

  var getHandler = {
    get: function get (target, key) {
      if (typeof key === 'string' && !(key in target)) {
        warnNonPresent(target, key);
      }
      return target[key]
    }
  };

  initProxy = function initProxy (vm) {
    if (hasProxy) {
      // determine which proxy handler to use
      var options = vm.$options;
      var handlers = options.render && options.render._withStripped
        ? getHandler
        : hasHandler;
      vm._renderProxy = new Proxy(vm, handlers);
    } else {
      vm._renderProxy = vm;
    }
  };
}

/*  */

// 队列
var queue = [];
// 是否含有
var has$1 = {};
var circular = {};
var waiting = false;
var flushing = false;
var index = 0;

/**
 * Reset the scheduler's state.
 * 重置调度程序的状态
 */
function resetSchedulerState () {
  queue.length = 0;
  has$1 = {};
  {
    circular = {};
  }
  waiting = flushing = false;
}

/**
 * Flush both queues and run the watchers.
 * 刷新全部队列并运行守望者(哨兵)
 */
function flushSchedulerQueue () {
  flushing = true;

  // Sort queue before flush.
  // This ensures that:
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.
  // 刷新队列前先做排序操作
  // 保证以下条件
  // 1. 组件更新是从父级到子级的顺序(因为父级总是在子级之前创建)
  // 2. 组件的守望者在它的渲染守望者之前运行(因为调用者的观察者在渲染守望者之前创建)
  // 3. 如果一个组件是一个父组件的监视运行期间被销毁，它的守望者可以跳过
  queue.sort(function (a, b) { return a.id - b.id; });

  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  // 不要缓存长度，因为更多的守望者可能会加入队列，因此我们运行现有的守望者
  for (index = 0; index < queue.length; index++) {
    var watcher = queue[index];
    var id = watcher.id;
    has$1[id] = null;
    watcher.run();
    // in dev build, check and stop circular updates.
    if ("development" !== 'production' && has$1[id] != null) {
      circular[id] = (circular[id] || 0) + 1;
      if (circular[id] > config._maxUpdateCount) {
        warn(
          'You may have an infinite update loop ' + (
            watcher.user
              ? ("in watcher with expression \"" + (watcher.expression) + "\"")
              : "in a component render function."
          ),
          watcher.vm
        );
        break
      }
    }
  }

  // devtool hook
  /* istanbul ignore if */
  if (devtools && config.devtools) {
    // 通知开发者工具
    devtools.emit('flush');
  }

  resetSchedulerState();
}

/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 * 守望者加入到守望者队列中。具有重复ID的Job将被跳过，除非它在队列刷新后被加入.
 */
function queueWatcher (watcher) {
  var id = watcher.id;
  if (has$1[id] == null) {
    has$1[id] = true;
    if (!flushing) {
      queue.push(watcher);
    } else {
      // if already flushing, splice the watcher based on its id
      // 如果队列在刷新中，基于守望者ID推入其到队列中
      // if already past its id, it will be run next immediately.
      // 如果已经运行过了它的ID，它将在下一个立即运行
      var i = queue.length - 1;
      while (i >= 0 && queue[i].id > watcher.id) {
        i--;
      }
      queue.splice(Math.max(i, index) + 1, 0, watcher);
    }
    // queue the flush
    if (!waiting) {
      waiting = true;
      // 进入下一个队列任务
      nextTick(flushSchedulerQueue);
    }
  }
}

/*  */

var uid$2 = 0;

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 * 一个守望者的解析表达，收集依赖，当表达式的值的变化时进行回调时间调用。这是用于$watch()API和指令
 */
var Watcher = function Watcher (
  vm,
  expOrFn,
  cb,
  options
) {
  this.vm = vm;
  vm._watchers.push(this);
  // options
  if (options) {
    this.deep = !!options.deep;
    this.user = !!options.user;
    this.lazy = !!options.lazy;
    this.sync = !!options.sync;
  } else {
    this.deep = this.user = this.lazy = this.sync = false;
  }
  this.cb = cb;
  this.id = ++uid$2; // uid for batching
  this.active = true;
  this.dirty = this.lazy; // for lazy watchers
  this.deps = [];
  this.newDeps = [];
  this.depIds = new _Set();
  this.newDepIds = new _Set();
  this.expression = expOrFn.toString();
  // parse expression for getter
  if (typeof expOrFn === 'function') {
    this.getter = expOrFn;
  } else {
    this.getter = parsePath(expOrFn);
    if (!this.getter) {
      this.getter = function () {};
      "development" !== 'production' && warn(
        "Failed watching path: \"" + expOrFn + "\" " +
        'Watcher only accepts simple dot-delimited paths. ' +
        'For full control, use a function instead.',
        vm
      );
    }
  }
  this.value = this.lazy
    ? undefined
    : this.get();
};

/**
 * Evaluate the getter, and re-collect dependencies.
 * 求值并且重新收集依赖
 */
Watcher.prototype.get = function get () {
  pushTarget(this);
  var value = this.getter.call(this.vm, this.vm);
  // "touch" every property so they are all tracked as
  // dependencies for deep watching
  if (this.deep) {
    traverse(value);
  }
  popTarget();
  this.cleanupDeps();
  return value
};

/**
 * Add a dependency to this directive.
 * 为指令添加一个依赖
 */
Watcher.prototype.addDep = function addDep (dep) {
  var id = dep.id;
  if (!this.newDepIds.has(id)) {
    this.newDepIds.add(id);
    this.newDeps.push(dep);
    if (!this.depIds.has(id)) {
      dep.addSub(this);
    }
  }
};

/**
 * Clean up for dependency collection.
 * 清除依赖集合
 */
Watcher.prototype.cleanupDeps = function cleanupDeps () {
    var this$1 = this;

  var i = this.deps.length;
  while (i--) {
    var dep = this$1.deps[i];
    if (!this$1.newDepIds.has(dep.id)) {
      dep.removeSub(this$1);
    }
  }
  var tmp = this.depIds;
  this.depIds = this.newDepIds;
  this.newDepIds = tmp;
  this.newDepIds.clear();
  tmp = this.deps;
  this.deps = this.newDeps;
  this.newDeps = tmp;
  this.newDeps.length = 0;
};

/**
 * Subscriber interface.
 * Will be called when a dependency changes.
 */
Watcher.prototype.update = function update () {
  /* istanbul ignore else */
  if (this.lazy) {
    this.dirty = true;
  } else if (this.sync) {
    this.run();
  } else {
    queueWatcher(this);
  }
};

/**
 * Scheduler job interface.
 * Will be called by the scheduler.
 */
Watcher.prototype.run = function run () {
  if (this.active) {
    var value = this.get();
    if (
      value !== this.value ||
      // Deep watchers and watchers on Object/Arrays should fire even
      // when the value is the same, because the value may
      // have mutated.
      isObject(value) ||
      this.deep
    ) {
      // set new value
      var oldValue = this.value;
      this.value = value;
      if (this.user) {
        try {
          this.cb.call(this.vm, value, oldValue);
        } catch (e) {
          /* istanbul ignore else */
          if (config.errorHandler) {
            config.errorHandler.call(null, e, this.vm);
          } else {
            "development" !== 'production' && warn(
              ("Error in watcher \"" + (this.expression) + "\""),
              this.vm
            );
            throw e
          }
        }
      } else {
        this.cb.call(this.vm, value, oldValue);
      }
    }
  }
};

/**
 * Evaluate the value of the watcher.
 * This only gets called for lazy watchers.
 */
Watcher.prototype.evaluate = function evaluate () {
  this.value = this.get();
  this.dirty = false;
};

/**
 * Depend on all deps collected by this watcher.
 */
Watcher.prototype.depend = function depend () {
    var this$1 = this;

  var i = this.deps.length;
  while (i--) {
    this$1.deps[i].depend();
  }
};

/**
 * Remove self from all dependencies' subscriber list.
 */
Watcher.prototype.teardown = function teardown () {
    var this$1 = this;

  if (this.active) {
    // remove self from vm's watcher list
    // this is a somewhat expensive operation so we skip it
    // if the vm is being destroyed.
    if (!this.vm._isBeingDestroyed) {
      remove$1(this.vm._watchers, this);
    }
    var i = this.deps.length;
    while (i--) {
      this$1.deps[i].removeSub(this$1);
    }
    this.active = false;
  }
};

/**
 * Recursively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 */
var seenObjects = new _Set();
function traverse (val) {
  seenObjects.clear();
  _traverse(val, seenObjects);
}

function _traverse (val, seen) {
  var i, keys;
  var isA = Array.isArray(val);
  if ((!isA && !isObject(val)) || !Object.isExtensible(val)) {
    return
  }
  if (val.__ob__) {
    var depId = val.__ob__.dep.id;
    if (seen.has(depId)) {
      return
    }
    seen.add(depId);
  }
  if (isA) {
    i = val.length;
    while (i--) { _traverse(val[i], seen); }
  } else {
    keys = Object.keys(val);
    i = keys.length;
    while (i--) { _traverse(val[keys[i]], seen); }
  }
}

/*  */
/**
 * 初始化Vue实例对象的状态
 * @description 初始化Vue实例对象的状态
 * @param vm [Vue实例对象]
 */
function initState (vm) {
  // 监听状态初始化为空数组
  vm._watchers = [];
  // 获取实例对象的配置信息 
  var opts = vm.$options;
  if (opts.props) {
    // 对Vue实例对象的props属性初始化 
    initProps(vm, opts.props); 
  }
  if (opts.methods) {
    // 对Vue实例对象的methods属性初始化 
    initMethods(vm, opts.methods); 
  }
  if (opts.data) {
    // 对Vue实例对象的data属性初始化
    initData(vm);
  } else {
    // 为Vue实例对象data属性创建观察者
    observe(vm._data = {}, true /* asRootData */);
  }
  if (opts.computed) {
    // 对Vue实例对象的computed属性初始化 
    initComputed(vm, opts.computed); 
  }
  if (opts.watch) {
    // 对Vue实例对象的watch属性初始化 
    initWatch(vm, opts.watch); 
  }
}

// 是否属于保留prop
var isReservedProp = { key: 1, ref: 1, slot: 1 };

/**
 * 对Vue实例对象的props属性初始化
 * @description 对Vue实例对象的props属性初始化
 * @param vm [Vue实例对象]
 * @param props [Vue实例对象的props属性]
 */
function initProps (vm, props) {
  var propsData = vm.$options.propsData || {};
  // 获取props对象可枚举属性和方法的名称
  var keys = vm.$options._propKeys = Object.keys(props);
  // 是否属于根
  var isRoot = !vm.$parent;
  // root instance props should be converted
  // 根实例对象的props属性应该被转化
  observerState.shouldConvert = isRoot;
  // 递归执行函数
  var loop = function ( i ) {
    var key = keys[i];
    /* istanbul ignore else */
    {
      if (isReservedProp[key]) {
        // 警告是一个保留属性，不能作为组件的prop对象的属性。
        warn(
          ("\"" + key + "\" is a reserved attribute and cannot be used as component prop."),
          vm
        );
      }
      // 定义响应式属性
      defineReactive$$1(vm, key, validateProp(key, props, propsData, vm), function () {
        if (vm.$parent && !observerState.isSettingProps) {
          warn(
            "Avoid mutating a prop directly since the value will be " +
            "overwritten whenever the parent component re-renders. " +
            "Instead, use a data or computed property based on the prop's " +
            "value. Prop being mutated: \"" + key + "\"",
            vm
          );
        }
      });
    }
  };

  for (var i = 0; i < keys.length; i++) {
    loop( i );
  }
  observerState.shouldConvert = true;
}

/**
 * 对Vue实例对象的data属性初始化
 * @description 对Vue实例对象的data属性初始化
 * @param vm [Vue实例对象]
 */
function initData (vm) {
  // 获取参数对象的data属性
  var data = vm.$options.data;
  // 转换成对象
  data = vm._data = typeof data === 'function'
    ? data.call(vm)
    : data || {};
  // 检测是否为对象
  if (!isPlainObject(data)) {
    data = {};
    "development" !== 'production' && warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    );
  }
  // proxy data on instance
  // 代理实例数据
  var keys = Object.keys(data);
  var props = vm.$options.props;
  var i = keys.length;
  while (i--) {
    if (props && hasOwn(props, keys[i])) {
      "development" !== 'production' && warn(
        "The data property \"" + (keys[i]) + "\" is already declared as a prop. " +
        "Use prop default value instead.",
        vm
      );
    } else {
      proxy(vm, keys[i]);
    }
  }
  // observe data 观察数据
  observe(data, true /* asRootData */);
}

// 计算共享的定义
var computedSharedDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
};

/**
 * 对Vue实例对象的computed属性初始化
 * @description 对Vue实例对象的computed属性初始化
 * @param vm [Vue实例对象]
 * @param computed [Vue实例对象的computed属性]
 */
function initComputed (vm, computed) {
  for (var key in computed) {
    /* istanbul ignore if */
    // 这里为什么调用到key in vm ？
    // 因为初始化调用了initProps方法中调用了defineReactive$$1方法
    if ("development" !== 'production' && key in vm) {
      warn(
        "existing instance property \"" + key + "\" will be " +
        "overwritten by a computed property with the same name.",
        vm
      );
    }
    var userDef = computed[key];
    if (typeof userDef === 'function') {
      computedSharedDefinition.get = makeComputedGetter(userDef, vm);
      computedSharedDefinition.set = noop;
    } else {
      computedSharedDefinition.get = userDef.get
        ? userDef.cache !== false
          ? makeComputedGetter(userDef.get, vm)
          : bind$1(userDef.get, vm)
        : noop;
      computedSharedDefinition.set = userDef.set
        ? bind$1(userDef.set, vm)
        : noop;
    }
    Object.defineProperty(vm, key, computedSharedDefinition);
  }
}

// 创建computed对象的get函数
function makeComputedGetter (getter, owner) {
  var watcher = new Watcher(owner, getter, noop, {
    lazy: true
  });
  return function computedGetter () {
    if (watcher.dirty) {
      watcher.evaluate();
    }
    if (Dep.target) {
      watcher.depend();
    }
    return watcher.value
  }
}

/**
 * 对Vue实例对象的methods属性初始化
 * @description 对Vue实例对象的methods属性初始化
 * @param vm [Vue实例对象]
 * @param methods [Vue实例对象的methods属性]
 */
function initMethods (vm, methods) {
  for (var key in methods) {
    vm[key] = methods[key] == null ? noop : bind$1(methods[key], vm);
    if ("development" !== 'production' && methods[key] == null) {
      warn(
        "method \"" + key + "\" has an undefined value in the component definition. " +
        "Did you reference the function correctly?",
        vm
      );
    }
  }
}

/**
 * 对Vue实例对象的watch属性初始化
 * @description 对Vue实例对象的watch属性初始化
 * @param vm [Vue实例对象]
 * @param watch [Vue实例对象的watch属性]
 */
function initWatch (vm, watch) {
  for (var key in watch) {
    var handler = watch[key];
    if (Array.isArray(handler)) {
      for (var i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i]);
      }
    } else {
      createWatcher(vm, key, handler);
    }
  }
}

/**
 * 创建观察者
 * @description 创建观察者
 * @param vm [Vue实例对象]
 * @param key [属性键]
 * @param handler [处理函数]
 */
function createWatcher (vm, key, handler) {
  var options;
  if (isPlainObject(handler)) {
    options = handler;
    handler = handler.handler;
  }
  if (typeof handler === 'string') {
    handler = vm[handler];
  }
  vm.$watch(key, handler, options);
}

/**
 * 状态混合
 * @description 状态混合
 * @param Vue [Vue]
 */
function stateMixin (Vue) {
  // flow somehow has problems with directly declared definition object
  // when using Object.defineProperty, so we have to procedurally build up
  // the object here.
  var dataDef = {};
  dataDef.get = function () {
    return this._data
  };
  {
    dataDef.set = function (newData) {
      // 避免替换实例根$data。使用嵌套的数据属性代替
      warn(
        'Avoid replacing instance root $data. ' +
        'Use nested data properties instead.',
        this
      );
    };
  }
  // 添加$data属性
  Object.defineProperty(Vue.prototype, '$data', dataDef);

  // 添加$set属性
  Vue.prototype.$set = set$1;
  // 添加$delete属性
  Vue.prototype.$delete = del;

  /**
   * 观察 Vue 实例变化的一个表达式或计算属性函数。回调函数得到的参数为新值和旧值。
   * 表达式只接受监督的键路径。对于更复杂的表达式，用一个函数取代
   * @param expOrFn [表达式或者函数]
   * @param cb [callback]
   * @param option [options:{deep:Boolean,//是否检测对象内部值的变化 immediate:Boolean // 是否立即以表达式的当前值触发回调}]
   */
  Vue.prototype.$watch = function (
    expOrFn,
    cb,
    options
  ) {
    var vm = this;
    options = options || {};
    options.user = true;
    var watcher = new Watcher(vm, expOrFn, cb, options);
    if (options.immediate) {
      cb.call(vm, watcher.value);
    }
    return function unwatchFn () {
      watcher.teardown();
    }
  };
}

/**
 * 代理实例数据
 * @description 代理实例数据
 * @param vm [Vue实例对象]
 * @param key [对象键]
 */
function proxy (vm, key) {
  if (!isReserved(key)) {
    Object.defineProperty(vm, key, {
      configurable: true,
      enumerable: true,
      get: function proxyGetter () {
        return vm._data[key]
      },
      set: function proxySetter (val) {
        vm._data[key] = val;
      }
    });
  }
}

/**
 * 创建Vue节点
 * @description 创建Vue节点
 * @param tag [标签]
 * @param data [数据]
 * @param children [子级]
 * @param text [文本]
 * @param elm [element]
 * @param context [上下文]
 * @param componentOptions [组件参数]
 */
var VNode = function VNode (
  tag,
  data,
  children,
  text,
  elm,
  context,
  componentOptions
) {
  this.tag = tag; // 标签
  this.data = data; // 数据
  this.children = children; // 子级
  this.text = text; // 文本
  this.elm = elm; // element
  this.ns = undefined; // 命名空间
  this.context = context; // 上下文，Vue实例对象
  this.functionalContext = undefined; // 函数上下文
  this.key = data && data.key; // key
  this.componentOptions = componentOptions; // 组件参数
  this.child = undefined; // 子级
  this.parent = undefined; // 父级
  this.raw = false; 
  this.isStatic = false;
  this.isRootInsert = true;
  this.isComment = false; // 是否属于注释
  this.isCloned = false; // 是否克隆
  this.isOnce = false; // 是否单次
};

// 创建一个空的Vue节点
var createEmptyVNode = function () {
  var node = new VNode();
  node.text = '';
  node.isComment = true;
  return node
};

// 创建文本形式的Vue节点
function createTextVNode (val) {
  return new VNode(undefined, undefined, undefined, String(val))
}

// optimized shallow clone
// used for static nodes and slot nodes because they may be reused across
// multiple renders, cloning them avoids errors when DOM manipulations rely
// on their elm reference.
// 优化浅克隆
function cloneVNode (vnode) {
  var cloned = new VNode(
    vnode.tag,
    vnode.data,
    vnode.children,
    vnode.text,
    vnode.elm,
    vnode.context,
    vnode.componentOptions
  );
  cloned.ns = vnode.ns;
  cloned.isStatic = vnode.isStatic;
  cloned.key = vnode.key;
  cloned.isCloned = true;
  return cloned
}

/**
 * 克隆一组虚拟节点
 * @description 克隆一组虚拟节点
 * @param vnodes [虚拟节点数组]
 */
function cloneVNodes (vnodes) {
  var res = new Array(vnodes.length);
  for (var i = 0; i < vnodes.length; i++) {
    res[i] = cloneVNode(vnodes[i]);
  }
  return res
}

/**
 * 合并Vue节点钩子函数
 * @description 合并Vue节点钩子函数
 * @param def [def]
 * @param hookKey [hookKey]
 * @param hook [hook]
 * @param key [key]
 */
function mergeVNodeHook (def, hookKey, hook, key) {
  key = key + hookKey;
  // 注入hash
  var injectedHash = def.__injected || (def.__injected = {});
  if (!injectedHash[key]) {
    injectedHash[key] = true;
    var oldHook = def[hookKey];
    if (oldHook) {
      def[hookKey] = function () {
        oldHook.apply(this, arguments);
        hook.apply(this, arguments);
      };
    } else {
      def[hookKey] = hook;
    }
  }
}

/**
 * 更新监听者
 * @description 更新监听者
 * @param on [新添加的监听事件]
 * @param oldOn [旧的监听事件]
 * @param add [添加DOM监听事件的函数]
 * @param remove$$1 [移除DOM监听事件的函数]
 * @param vm [Vue实例对象]
 */
function updateListeners (
  on,
  oldOn,
  add,
  remove$$1,
  vm
) {
  var name, cur, old, fn, event, capture, once;
  for (name in on) {
    cur = on[name];
    old = oldOn[name];
    if (!cur) {
      // 当前不存在
      "development" !== 'production' && warn(
        "Invalid handler for event \"" + name + "\": got " + String(cur),
        vm
      );
    } else if (!old) {
      // 旧的的不存在
      once = name.charAt(0) === '~'; // Prefixed last, checked first
      // 一次事件绑定
      event = once ? name.slice(1) : name;
      // 事件执行，事件捕获执行还是事件冒泡执行
      capture = event.charAt(0) === '!';
      event = capture ? event.slice(1) : event;
      if (Array.isArray(cur)) {
        add(event, (cur.invoker = arrInvoker(cur)), once, capture);
      } else {
        if (!cur.invoker) {
          fn = cur;
          cur = on[name] = {};
          cur.fn = fn;
          cur.invoker = fnInvoker(cur);
        }
        add(event, cur.invoker, once, capture);
      }
    } else if (cur !== old) {
      if (Array.isArray(old)) {
        old.length = cur.length;
        for (var i = 0; i < old.length; i++) { old[i] = cur[i]; }
        on[name] = old;
      } else {
        old.fn = cur;
        on[name] = old;
      }
    }
  }

  for (name in oldOn) {
    if (!on[name]) {
      once = name.charAt(0) === '~'; // Prefixed last, checked first
      event = once ? name.slice(1) : name;
      capture = event.charAt(0) === '!';
      event = capture ? event.slice(1) : event;
      remove$$1(event, oldOn[name].invoker, capture);
    }
  }
}

// 数组调用
function arrInvoker (arr) {
  return function (ev) {
    var arguments$1 = arguments;

    var single = arguments.length === 1;
    for (var i = 0; i < arr.length; i++) {
      single ? arr[i](ev) : arr[i].apply(null, arguments$1);
    }
  }
}

// 函数调用
function fnInvoker (o) {
  return function (ev) {
    var single = arguments.length === 1;
    single ? o.fn(ev) : o.fn.apply(null, arguments);
  }
}

/*  */

// The template compiler attempts to minimize the need for normalization by
// statically analyzing the template at compile time.
//
// For plain HTML markup, normalization can be completely skipped because the
// generated render function is guaranteed to return Array<VNode>. There are
// two cases where extra normalization is needed:

// 1. When the children contains components - because a functional component
// may return an Array instead of a single root. In this case, just a simple
// nomralization is needed - if any child is an Array, we flatten the whole
// thing with Array.prototype.concat. It is guaranteed to be only 1-level deep
// because functional components already normalize their own children.

// 模板编译器试图在编译时通过静态分析模板来最小化对正常化的需要
// 普通的HTML标记，标准化可以完全跳过因为生成的渲染功能是保证返回VNode数组。有两种情况需要额外的标准化
// 当子类包含组件时，因为函数组件可能返回数组而不是单个根。在这种情况下，
// 只是一个简单的nomralization是必要的-如果任何一个子类都是一个数组，
// 我们把整件事与Array.prototype.concat。这是保证只有1层深因为功能组件已经规范自己的子类
function simpleNormalizeChildren (children) {
  for (var i = 0; i < children.length; i++) {
    if (Array.isArray(children[i])) {
      return Array.prototype.concat.apply([], children)
    }
  }
  return children
}

// 2. When the children contains constrcuts that always generated nested Arrays,
// e.g. <template>, <slot>, v-for, or when the children is provided by user
// with hand-written render functions / JSX. In such cases a full normalization
// is needed to cater to all possible types of children values.
function normalizeChildren (children) {
  return isPrimitive(children)
    ? [createTextVNode(children)]
    : Array.isArray(children)
      ? normalizeArrayChildren(children)
      : undefined
}

function normalizeArrayChildren (children, nestedIndex) {
  var res = [];
  var i, c, last;
  for (i = 0; i < children.length; i++) {
    c = children[i];
    if (c == null || typeof c === 'boolean') { continue }
    last = res[res.length - 1];
    //  nested
    if (Array.isArray(c)) {
      // 数组
      res.push.apply(res, normalizeArrayChildren(c, ((nestedIndex || '') + "_" + i)));
    } else if (isPrimitive(c)) {
      // 字符串或者数字
      if (last && last.text) {
        last.text += String(c);
      } else if (c !== '') {
        // convert primitive to vnode
        res.push(createTextVNode(c));
      }
    } else {
      if (c.text && last && last.text) {
        res[res.length - 1] = createTextVNode(last.text + c.text);
      } else {
        // default key for nested array children (likely generated by v-for)
        if (c.tag && c.key == null && nestedIndex != null) {
          c.key = "__vlist" + nestedIndex + "_" + i + "__";
        }
        res.push(c);
      }
    }
  }
  return res
}

/*  */

/**
 * 得到第一个组件的子级
 * @description 得到第一个组件的子级
 * @param children [子级]
 */
function getFirstComponentChild (children) {
  return children && children.filter(function (c) { return c && c.componentOptions; })[0]
}

/*  */

/**
 * 初始化Vue实例对象的事件
 * @description 初始化Vue实例对象的事件
 * @param vm [Vue实例对象]
 */
function initEvents (vm) {
  vm._events = Object.create(null);
  vm._hasHookEvent = false;
  // init parent attached events
  // 初始化父级附加的事件
  var listeners = vm.$options._parentListeners;
  if (listeners) {
    updateComponentListeners(vm, listeners);
  }
}

// 目标
var target;

/**
 * 添加监听事件
 * @description 添加事件监听
 * @param event [事件名称]
 * @param fn [处理函数]
 * @param once [是否只触发一次]
 */
function add$1 (event, fn, once) {
  if (once) {
    target.$once(event, fn);
  } else {
    target.$on(event, fn);
  }
}

/**
 * 移除监听事件
 * @description 移除监听事件
 * @param event [事件名称]
 * @param fn [处理函数]
 */
function remove$2 (event, fn) {
  target.$off(event, fn);
}

/**
 * 更新组件事件监听
 * @description 更新组件事件监听
 * @param vm [Vue实例对象]
 * @param listeners [事件监听对象]
 * @param oldListeners [旧的事件监听对象]
 */
function updateComponentListeners (
  vm,
  listeners,
  oldListeners
) {
  target = vm;
  updateListeners(listeners, oldListeners || {}, add$1, remove$2, vm);
}

/**
 * 事件混合
 * @description 事件混合
 * @param Vue [Vue对象]
 */
function eventsMixin (Vue) {
  var hookRE = /^hook:/;
  // 为Vue对象添加$on函数
  Vue.prototype.$on = function (event, fn) {
    var vm = this;(vm._events[event] || (vm._events[event] = [])).push(fn);
    // optimize hook:event cost by using a boolean flag marked at registration
    // instead of a hash lookup
    // 优化钩子函数，用布尔值做标记代替hash
    if (hookRE.test(event)) {
      vm._hasHookEvent = true;
    }
    return vm
  };

  // 为Vue对象添加$once函数
  Vue.prototype.$once = function (event, fn) {
    var vm = this;
    function on () {
      vm.$off(event, on);
      fn.apply(vm, arguments);
    }
    on.fn = fn;
    vm.$on(event, on);
    return vm
  };

  // 为Vue对象添加$off函数
  Vue.prototype.$ff = function (event, fn) {
    var vm = this;
    // all
    if (!arguments.length) {
      vm._events = Object.create(null);
      return vm
    }
    // specific event
    var cbs = vm._events[event];
    if (!cbs) {
      return vm
    }
    if (arguments.length === 1) {
      vm._events[event] = null;
      return vm
    }
    // specific handler
    var cb;
    var i = cbs.length;
    while (i--) {
      cb = cbs[i];
      if (cb === fn || cb.fn === fn) {
        cbs.splice(i, 1);
        break
      }
    }
    return vm
  };

  Vue.prototype.$emit = function (event) {
    var vm = this;
    var cbs = vm._events[event];
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs;
      var args = toArray(arguments, 1);
      for (var i = 0, l = cbs.length; i < l; i++) {
        cbs[i].apply(vm, args);
      }
    }
    return vm
  };
}

/*  */

// 起作用的实例
var activeInstance = null;

/**
 * 对Vue实例的生命周期初始化
 * @description 对Vue实例的生命周期初始化
 * @param vm [Vue实例]
 */
function initLifecycle (vm) {
  var options = vm.$options;

  // locate first non-abstract parent
  // 定位最高级的非抽象的父级
  var parent = options.parent;
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent;
    }
    parent.$children.push(vm);
  }

  // 对实例对象父级进行赋值
  vm.$parent = parent;
  // 对实例对象根进行赋值
  vm.$root = parent ? parent.$root : vm;
  // 初始实例的子集为空数组
  vm.$children = [];
  // 初始实例的$refs属性
  vm.$refs = {};
  // 初始实例的_watcher属性
  vm._watcher = null;
  // 初始实例的_inactive属性为false inactive:闲置的,不活跃的
  vm._inactive = false;
  // 初始实例的_isMounted属性为false 为未安装
  vm._isMounted = false;
  // 初始实例的_isDestoryed属性为false 为未销毁
  vm._isDestroyed = false;
  // 初始实例的_isBeingDestroyed属性为false
  vm._isBeingDestroyed = false;
}

/**
 * 混合Vue对象生命周期
 * @description 混合Vue对象生命周期
 * @param Vue [Vue对象] 
 */
function lifecycleMixin (Vue) {
  // 为Vued对象添加_moun方法
  /**
   * Vue对象安装方法
   * @description Vue对象安装方法
   * @param el [element]
   * @param hydrating [数据填充对象的过程]
   */
  Vue.prototype._mount = function (
    el,
    hydrating
  ) {
    var vm = this;
    vm.$el = el;
    if (!vm.$options.render) {
      vm.$options.render = createEmptyVNode;
      {
        /* istanbul ignore if */
        if (vm.$options.template && vm.$options.template.charAt(0) !== '#') {
          warn(
            'You are using the runtime-only build of Vue where the template ' +
            'option is not available. Either pre-compile the templates into ' +
            'render functions, or use the compiler-included build.',
            vm
          );
        } else {
          warn(
            'Failed to mount component: template or render function not defined.',
            vm
          );
        }
      }
    }
    // 唤醒beforeMount钩子函数
    callHook(vm, 'beforeMount');
    // 初始Vue实例对象的_watcher属性
    vm._watcher = new Watcher(vm, function () {
      vm._update(vm._render(), hydrating);
    }, noop);
    hydrating = false;
    // manually mounted instance, call mounted on self
    // 手动安装实例，调用自己
    // mounted is called for render-created child components in its inserted hook
    if (vm.$vnode == null) {
      vm._isMounted = true;
      // 唤醒mounted钩子函数
      callHook(vm, 'mounted');
    }
    return vm
  };

  /**
   * Vue对象更新方法
   * @description Vue对象更新方法
   * @param vnode [虚拟节点]
   * @param hydrating [hydrating]
   */
  Vue.prototype._update = function (vnode, hydrating) {
    var vm = this;
    if (vm._isMounted) {
      // 唤醒beforeUpdate钩子函数
      callHook(vm, 'beforeUpdate');
    }
    var prevEl = vm.$el;
    var prevVnode = vm._vnode;
    var prevActiveInstance = activeInstance;
    activeInstance = vm;
    vm._vnode = vnode;
    // Vue.prototype.__patch__ is injected in entry points
    // based on the rendering backend used.
    if (!prevVnode) {
      // initial render
      vm.$el = vm.__patch__(
        vm.$el, vnode, hydrating, false /* removeOnly */,
        vm.$options._parentElm,
        vm.$options._refElm
      );
    } else {
      // updates
      vm.$el = vm.__patch__(prevVnode, vnode);
    }
    activeInstance = prevActiveInstance;
    // update __vue__ reference
    if (prevEl) {
      prevEl.__vue__ = null;
    }
    if (vm.$el) {
      vm.$el.__vue__ = vm;
    }
    // if parent is an HOC, update its $el as well
    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el;
    }
    if (vm._isMounted) {
      // 唤醒updated钩子函数
      callHook(vm, 'updated');
    }
  };

  /**
   * Vue对象更新方法
   */
  Vue.prototype._updateFromParent = function (
    propsData,
    listeners,
    parentVnode,
    renderChildren
  ) {
    var vm = this;
    var hasChildren = !!(vm.$options._renderChildren || renderChildren);
    vm.$options._parentVnode = parentVnode;
    vm.$vnode = parentVnode; // update vm's placeholder node without re-render
    if (vm._vnode) { // update child tree's parent
      vm._vnode.parent = parentVnode;
    }
    vm.$options._renderChildren = renderChildren;
    // update props
    if (propsData && vm.$options.props) {
      observerState.shouldConvert = false;
      {
        observerState.isSettingProps = true;
      }
      var propKeys = vm.$options._propKeys || [];
      for (var i = 0; i < propKeys.length; i++) {
        var key = propKeys[i];
        vm[key] = validateProp(key, vm.$options.props, propsData, vm);
      }
      observerState.shouldConvert = true;
      {
        observerState.isSettingProps = false;
      }
      vm.$options.propsData = propsData;
    }
    // update listeners
    if (listeners) {
      var oldListeners = vm.$options._parentListeners;
      vm.$options._parentListeners = listeners;
      updateComponentListeners(vm, listeners, oldListeners);
    }
    // resolve slots + force update if has children
    if (hasChildren) {
      vm.$slots = resolveSlots(renderChildren, parentVnode.context);
      vm.$forceUpdate();
    }
  };

  Vue.prototype.$forceUpdate = function () {
    var vm = this;
    if (vm._watcher) {
      vm._watcher.update();
    }
  };

  /**
   * Vue对象销毁方法
   * @description Vue对象销毁方法
   */
  Vue.prototype.$destroy = function () {
    var vm = this;
    if (vm._isBeingDestroyed) {
      return
    }
    // 唤醒beforeDestroy钩子函数
    callHook(vm, 'beforeDestroy');
    vm._isBeingDestroyed = true;
    // remove self from parent
    // 从父级中移除自己
    var parent = vm.$parent;
    if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
      remove$1(parent.$children, vm);
    }
    // teardown watchers
    // 取消观察者
    if (vm._watcher) {
      vm._watcher.teardown();
    }
    var i = vm._watchers.length;
    while (i--) {
      vm._watchers[i].teardown();
    }
    // remove reference from data ob
    // frozen object may not have observer.
    if (vm._data.__ob__) {
      vm._data.__ob__.vmCount--;
    }
    // call the last hook...
    vm._isDestroyed = true;
    // 唤醒destroyed钩子函数
    callHook(vm, 'destroyed');
    // turn off all instance listeners.
    // 关闭实例的所有事件监听
    vm.$off();
    // remove __vue__ reference
    // 移除__vue__引用
    if (vm.$el) {
      vm.$el.__vue__ = null;
    }
    // invoke destroy hooks on current rendered tree
    // 调用销毁钩子函数
    vm.__patch__(vm._vnode, null);
  };
}

/**
 * 唤醒钩子函数
 * @description 唤醒钩子函数
 * @param vm [Vue实例]
 * @param hook [钩子]
 */
function callHook (vm, hook) {
  // 获取实例参数中的钩子函数
  var handlers = vm.$options[hook];
  if (handlers) {
    for (var i = 0, j = handlers.length; i < j; i++) {
      handlers[i].call(vm);
    }
  }
  if (vm._hasHookEvent) {
    // _hasHookEvent属性是在initEvents和eventsMixin方法中赋值的
    vm.$emit('hook:' + hook);
  }
}

/*  */

/*****2017-02-15 *****/
// 钩子函数对象
var hooks = { init: init, prepatch: prepatch, insert: insert, destroy: destroy$1 };
var hooksToMerge = Object.keys(hooks);

/**
 * 创建组件
 * @description 创建组件
 * @param Ctor [Ctor]
 * @param data [data]
 * @param context [context]
 * @param children [children]
 * @param tag [tag]
 */
function createComponent (
  Ctor,
  data,
  context,
  children,
  tag
) {
  if (!Ctor) {
    return
  }

  var baseCtor = context.$options._base;
  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor);
  }

  if (typeof Ctor !== 'function') {
    {
      warn(("Invalid Component definition: " + (String(Ctor))), context);
    }
    return
  }

  // async component
  if (!Ctor.cid) {
    if (Ctor.resolved) {
      Ctor = Ctor.resolved;
    } else {
      Ctor = resolveAsyncComponent(Ctor, baseCtor, function () {
        // it's ok to queue this on every render because
        // $forceUpdate is buffered by the scheduler.
        context.$forceUpdate();
      });
      if (!Ctor) {
        // return nothing if this is indeed an async component
        // wait for the callback to trigger parent update.
        return
      }
    }
  }

  // resolve constructor options in case global mixins are applied after
  // component constructor creation
  resolveConstructorOptions(Ctor);

  data = data || {};

  // extract props
  var propsData = extractProps(data, Ctor);

  // functional component
  if (Ctor.options.functional) {
    return createFunctionalComponent(Ctor, propsData, data, context, children)
  }

  // extract listeners, since these needs to be treated as
  // child component listeners instead of DOM listeners
  var listeners = data.on;
  // replace with listeners with .native modifier
  data.on = data.nativeOn;

  if (Ctor.options.abstract) {
    // abstract components do not keep anything
    // other than props & listeners
    data = {};
  }

  // merge component management hooks onto the placeholder node
  mergeHooks(data);

  // return a placeholder vnode
  var name = Ctor.options.name || tag;
  var vnode = new VNode(
    ("vue-component-" + (Ctor.cid) + (name ? ("-" + name) : '')),
    data, undefined, undefined, undefined, context,
    { Ctor: Ctor, propsData: propsData, listeners: listeners, tag: tag, children: children }
  );
  return vnode
}

function createFunctionalComponent (
  Ctor,
  propsData,
  data,
  context,
  children
) {
  var props = {};
  var propOptions = Ctor.options.props;
  if (propOptions) {
    for (var key in propOptions) {
      props[key] = validateProp(key, propOptions, propsData);
    }
  }
  // ensure the createElement function in functional components
  // gets a unique context - this is necessary for correct named slot check
  var _context = Object.create(context);
  var h = function (a, b, c, d) { return createElement(_context, a, b, c, d, true); };
  var vnode = Ctor.options.render.call(null, h, {
    props: props,
    data: data,
    parent: context,
    children: children,
    slots: function () { return resolveSlots(children, context); }
  });
  if (vnode instanceof VNode) {
    vnode.functionalContext = context;
    if (data.slot) {
      (vnode.data || (vnode.data = {})).slot = data.slot;
    }
  }
  return vnode
}

function createComponentInstanceForVnode (
  vnode, // we know it's MountedComponentVNode but flow doesn't
  parent, // activeInstance in lifecycle state
  parentElm,
  refElm
) {
  var vnodeComponentOptions = vnode.componentOptions;
  var options = {
    _isComponent: true,
    parent: parent,
    propsData: vnodeComponentOptions.propsData,
    _componentTag: vnodeComponentOptions.tag,
    _parentVnode: vnode,
    _parentListeners: vnodeComponentOptions.listeners,
    _renderChildren: vnodeComponentOptions.children,
    _parentElm: parentElm || null,
    _refElm: refElm || null
  };
  // check inline-template render functions
  var inlineTemplate = vnode.data.inlineTemplate;
  if (inlineTemplate) {
    options.render = inlineTemplate.render;
    options.staticRenderFns = inlineTemplate.staticRenderFns;
  }
  return new vnodeComponentOptions.Ctor(options)
}

function init (
  vnode,
  hydrating,
  parentElm,
  refElm
) {
  if (!vnode.child || vnode.child._isDestroyed) {
    var child = vnode.child = createComponentInstanceForVnode(
      vnode,
      activeInstance,
      parentElm,
      refElm
    );
    child.$mount(hydrating ? vnode.elm : undefined, hydrating);
  } else if (vnode.data.keepAlive) {
    // kept-alive components, treat as a patch
    var mountedNode = vnode; // work around flow
    prepatch(mountedNode, mountedNode);
  }
}

function prepatch (
  oldVnode,
  vnode
) {
  var options = vnode.componentOptions;
  var child = vnode.child = oldVnode.child;
  child._updateFromParent(
    options.propsData, // updated props
    options.listeners, // updated listeners
    vnode, // new parent vnode
    options.children // new children
  );
}

function insert (vnode) {
  if (!vnode.child._isMounted) {
    vnode.child._isMounted = true;
    callHook(vnode.child, 'mounted');
  }
  if (vnode.data.keepAlive) {
    vnode.child._inactive = false;
    callHook(vnode.child, 'activated');
  }
}

function destroy$1 (vnode) {
  if (!vnode.child._isDestroyed) {
    if (!vnode.data.keepAlive) {
      vnode.child.$destroy();
    } else {
      vnode.child._inactive = true;
      callHook(vnode.child, 'deactivated');
    }
  }
}

function resolveAsyncComponent (
  factory,
  baseCtor,
  cb
) {
  if (factory.requested) {
    // pool callbacks
    factory.pendingCallbacks.push(cb);
  } else {
    factory.requested = true;
    var cbs = factory.pendingCallbacks = [cb];
    var sync = true;

    var resolve = function (res) {
      if (isObject(res)) {
        res = baseCtor.extend(res);
      }
      // cache resolved
      factory.resolved = res;
      // invoke callbacks only if this is not a synchronous resolve
      // (async resolves are shimmed as synchronous during SSR)
      if (!sync) {
        for (var i = 0, l = cbs.length; i < l; i++) {
          cbs[i](res);
        }
      }
    };

    var reject = function (reason) {
      "development" !== 'production' && warn(
        "Failed to resolve async component: " + (String(factory)) +
        (reason ? ("\nReason: " + reason) : '')
      );
    };

    var res = factory(resolve, reject);

    // handle promise
    if (res && typeof res.then === 'function' && !factory.resolved) {
      res.then(resolve, reject);
    }

    sync = false;
    // return in case resolved synchronously
    return factory.resolved
  }
}

function extractProps (data, Ctor) {
  // we are only extracting raw values here.
  // validation and default values are handled in the child
  // component itself.
  var propOptions = Ctor.options.props;
  if (!propOptions) {
    return
  }
  var res = {};
  var attrs = data.attrs;
  var props = data.props;
  var domProps = data.domProps;
  if (attrs || props || domProps) {
    for (var key in propOptions) {
      var altKey = hyphenate(key);
      checkProp(res, props, key, altKey, true) ||
      checkProp(res, attrs, key, altKey) ||
      checkProp(res, domProps, key, altKey);
    }
  }
  return res
}

function checkProp (
  res,
  hash,
  key,
  altKey,
  preserve
) {
  if (hash) {
    if (hasOwn(hash, key)) {
      res[key] = hash[key];
      if (!preserve) {
        delete hash[key];
      }
      return true
    } else if (hasOwn(hash, altKey)) {
      res[key] = hash[altKey];
      if (!preserve) {
        delete hash[altKey];
      }
      return true
    }
  }
  return false
}

function mergeHooks (data) {
  if (!data.hook) {
    data.hook = {};
  }
  for (var i = 0; i < hooksToMerge.length; i++) {
    var key = hooksToMerge[i];
    var fromParent = data.hook[key];
    var ours = hooks[key];
    data.hook[key] = fromParent ? mergeHook$1(ours, fromParent) : ours;
  }
}

function mergeHook$1 (one, two) {
  return function (a, b, c, d) {
    one(a, b, c, d);
    two(a, b, c, d);
  }
}

/*  */

var SIMPLE_NORMALIZE = 1;
var ALWAYS_NORMALIZE = 2;

// wrapper function for providing a more flexible interface
// without getting yelled at by flow
function createElement (
  context,
  tag,
  data,
  children,
  normalizationType,
  alwaysNormalize
) {
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children;
    children = data;
    data = undefined;
  }
  if (alwaysNormalize) { normalizationType = ALWAYS_NORMALIZE; }
  return _createElement(context, tag, data, children, normalizationType)
}

function _createElement (
  context,
  tag,
  data,
  children,
  normalizationType
) {
  if (data && data.__ob__) {
    "development" !== 'production' && warn(
      "Avoid using observed data object as vnode data: " + (JSON.stringify(data)) + "\n" +
      'Always create fresh vnode data objects in each render!',
      context
    );
    return createEmptyVNode()
  }
  if (!tag) {
    // in case of component :is set to falsy value
    return createEmptyVNode()
  }
  // support single function children as default scoped slot
  if (Array.isArray(children) &&
      typeof children[0] === 'function') {
    data = data || {};
    data.scopedSlots = { default: children[0] };
    children.length = 0;
  }
  if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children);
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children);
  }
  var vnode, ns;
  if (typeof tag === 'string') {
    var Ctor;
    ns = config.getTagNamespace(tag);
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      );
    } else if ((Ctor = resolveAsset(context.$options, 'components', tag))) {
      // component
      vnode = createComponent(Ctor, data, context, children, tag);
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      );
    }
  } else {
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children);
  }
  if (vnode) {
    if (ns) { applyNS(vnode, ns); }
    return vnode
  } else {
    return createEmptyVNode()
  }
}

function applyNS (vnode, ns) {
  vnode.ns = ns;
  if (vnode.tag === 'foreignObject') {
    // use default namespace inside foreignObject
    return
  }
  if (vnode.children) {
    for (var i = 0, l = vnode.children.length; i < l; i++) {
      var child = vnode.children[i];
      if (child.tag && !child.ns) {
        applyNS(child, ns);
      }
    }
  }
}

/*  */

/**
 * 初始化render函数
 * @description 初始化render函数
 * @param vm [Vue实例对象]
 */
function initRender (vm) {
  vm.$vnode = null; // the placeholder node in parent tree
  vm._vnode = null; // the root of the child tree
  vm._staticTrees = null;
  var parentVnode = vm.$options._parentVnode;
  var renderContext = parentVnode && parentVnode.context;
  vm.$slots = resolveSlots(vm.$options._renderChildren, renderContext);
  vm.$scopedSlots = {};
  // bind the createElement fn to this instance
  // so that we get proper render context inside it.
  // args order: tag, data, children, normalizationType, alwaysNormalize
  // internal version is used by render functions compiled from templates

  // 绑定createElement函数到Vue实例上
  // 使我们得到正确的渲染上下文
  // 参数列表，[标签，数据，子级，规范类型，alwaysNormalize]
  // 内部版本用于从模板编译的渲染函数
  vm._c = function (a, b, c, d) { return createElement(vm, a, b, c, d, false); };
  // normalization is always applied for the public version, used in
  // user-written render functions.
  // 标准化总是适用于公共版本,用于用户编写的渲染函数
  vm.$createElement = function (a, b, c, d) { return createElement(vm, a, b, c, d, true); };
  if (vm.$options.el) {
    vm.$mount(vm.$options.el);
  }
}

/**
 * 为Vue原型添加render函数['_render','_n','...']
 * @description 为Vue原型添加render函数['_render','_n','...']
 * @param Vue [Vue对象]
 */
function renderMixin (Vue) {
  Vue.prototype.$nextTick = function (fn) {
    return nextTick(fn, this)
  };

  Vue.prototype._render = function () {
    var vm = this;
    var ref = vm.$options;
    var render = ref.render;
    var staticRenderFns = ref.staticRenderFns;
    var _parentVnode = ref._parentVnode;

    if (vm._isMounted) {
      // clone slot nodes on re-renders
      for (var key in vm.$slots) {
        vm.$slots[key] = cloneVNodes(vm.$slots[key]);
      }
    }

    if (_parentVnode && _parentVnode.data.scopedSlots) {
      vm.$scopedSlots = _parentVnode.data.scopedSlots;
    }

    if (staticRenderFns && !vm._staticTrees) {
      vm._staticTrees = [];
    }
    // set parent vnode. this allows render functions to have access
    // to the data on the placeholder node.
    vm.$vnode = _parentVnode;
    // render self
    var vnode;
    try {
      vnode = render.call(vm._renderProxy, vm.$createElement);
    } catch (e) {
      /* istanbul ignore else */
      if (config.errorHandler) {
        config.errorHandler.call(null, e, vm);
      } else {
        {
          warn(("Error when rendering " + (formatComponentName(vm)) + ":"));
        }
        throw e
      }
      // return previous vnode to prevent render error causing blank component
      vnode = vm._vnode;
    }
    // return empty vnode in case the render function errored out
    if (!(vnode instanceof VNode)) {
      if ("development" !== 'production' && Array.isArray(vnode)) {
        warn(
          'Multiple root nodes returned from render function. Render function ' +
          'should return a single root node.',
          vm
        );
      }
      vnode = createEmptyVNode();
    }
    // set parent
    vnode.parent = _parentVnode;
    return vnode
  };

  // toString for mustaches
  Vue.prototype._s = _toString;
  // convert text to vnode
  Vue.prototype._v = createTextVNode;
  // number conversion
  // 转换成数字
  Vue.prototype._n = toNumber;
  // empty vnode
  // 渲染空的虚拟节点
  Vue.prototype._e = createEmptyVNode;
  // loose equal
  Vue.prototype._q = looseEqual;
  // loose indexOf
  Vue.prototype._i = looseIndexOf;

  // render static tree by index
  /**
   * 按索引渲染静态树
   * @description 按索引渲染静态树
   * @param index [index]
   * @param isInFor [isInFor]
   */
  Vue.prototype._m = function renderStatic (
    index,
    isInFor
  ) {
    var tree = this._staticTrees[index];
    // if has already-rendered static tree and not inside v-for,
    // we can reuse the same tree by doing a shallow clone.

    // 如果已经渲染静态树并且不在v-for里面，我们可以重用同一棵树上并做一个浅克隆
    if (tree && !isInFor) {
      return Array.isArray(tree)
        ? cloneVNodes(tree)
        : cloneVNode(tree)
    }
    // otherwise, render a fresh tree.
    // 否则，渲染一个新树
    tree = this._staticTrees[index] = this.$options.staticRenderFns[index].call(this._renderProxy);
    markStatic(tree, ("__static__" + index), false);
    return tree
  };

  // mark node as static (v-once)
  /**
   * 标记节点为只渲染元素和组件一次静态资源
   * @description 标记节点为只渲染元素和组件一次静态资源
   * @param tree [tree]
   * @param index [index]
   * @param key [key]
   */
  Vue.prototype._o = function markOnce (
    tree,
    index,
    key
  ) {
    // 标记为静态资源
    markStatic(tree, ("__once__" + index + (key ? ("_" + key) : "")), true);
    return tree
  };

  /**
   * 标记为静态资源
   * @description 标记为静态资源
   * @param tree [tree]
   * @param key [key]
   * @param isOnce [isOnce]
   */
  function markStatic (tree, key, isOnce) {
    if (Array.isArray(tree)) {
      for (var i = 0; i < tree.length; i++) {
        if (tree[i] && typeof tree[i] !== 'string') {
          markStaticNode(tree[i], (key + "_" + i), isOnce);
        }
      }
    } else {
      markStaticNode(tree, key, isOnce);
    }
  }

  /**
   * 标记为静态节点
   * @description 标记为静态节点
   * @param node [node]
   * @param key [key]
   * @param isOne [isOnce]
   */
  function markStaticNode (node, key, isOnce) {
    node.isStatic = true;
    node.key = key;
    node.isOnce = isOnce;
  }

  // filter resolution helper
  Vue.prototype._f = function resolveFilter (id) {
    return resolveAsset(this.$options, 'filters', id, true) || identity
  };

  // render v-for
  /**
   * 渲染v-for指令
   * @description 渲染v-for指令
   * @param val [表达式]
   * @param render [渲染函数]
   */
  Vue.prototype._l = function renderList (
    val,
    render
  ) {
    var ret, i, l, keys, key;
    if (Array.isArray(val) || typeof val === 'string') {
      ret = new Array(val.length);
      for (i = 0, l = val.length; i < l; i++) {
        ret[i] = render(val[i], i);
      }
    } else if (typeof val === 'number') {
      ret = new Array(val);
      for (i = 0; i < val; i++) {
        ret[i] = render(i + 1, i);
      }
    } else if (isObject(val)) {
      keys = Object.keys(val);
      ret = new Array(keys.length);
      for (i = 0, l = keys.length; i < l; i++) {
        key = keys[i];
        ret[i] = render(val[key], key, i);
      }
    }
    return ret
  };

  // renderSlot
  /**
   * 渲染slot指令
   * @description 渲染slot指令
   * @param name [name]
   * @param fallback [fallback]
   * @param props [props]
   * @param bindObject [bindObject]
   */
  Vue.prototype._t = function (
    name,
    fallback,
    props,
    bindObject
  ) {
    var scopedSlotFn = this.$scopedSlots[name];
    if (scopedSlotFn) { // scoped slot
      props = props || {};
      if (bindObject) {
        extend(props, bindObject);
      }
      return scopedSlotFn(props) || fallback
    } else {
      var slotNodes = this.$slots[name];
      // warn duplicate slot usage
      if (slotNodes && "development" !== 'production') {
        slotNodes._rendered && warn(
          "Duplicate presence of slot \"" + name + "\" found in the same render tree " +
          "- this will likely cause render errors.",
          this
        );
        slotNodes._rendered = true;
      }
      return slotNodes || fallback
    }
  };

  // apply v-bind object
  /**
   * 动态地绑定一个或多个特性，或一个组件 prop 到表达式
   * @description 动态地绑定一个或多个特性，或一个组件 prop 到表达式
   * @param data [data]
   * @param tag [tag]
   * @param value [value]
   * @param asProp [asProp]
   */
  Vue.prototype._b = function bindProps (
    data,
    tag,
    value,
    asProp
  ) {
    if (value) {
      if (!isObject(value)) {
        "development" !== 'production' && warn(
          'v-bind without argument expects an Object or Array value',
          this
        );
      } else {
        if (Array.isArray(value)) {
          value = toObject(value);
        }
        for (var key in value) {
          if (key === 'class' || key === 'style') {
            data[key] = value[key];
          } else {
            var hash = asProp || config.mustUseProp(tag, key)
              ? data.domProps || (data.domProps = {})
              : data.attrs || (data.attrs = {});
            hash[key] = value[key];
          }
        }
      }
    }
    return data
  };

  // check v-on keyCodes
  /**
   * 检查v-on键盘按键修饰符
   * @description 检查v-on键盘按键修饰符
   * @param eventKeyCode [键盘修饰]
   * @param key [key]
   * @builtInAlias [内置修饰符]
   */
  Vue.prototype._k = function checkKeyCodes (
    eventKeyCode,
    key,
    builtInAlias
  ) {
    var keyCodes = config.keyCodes[key] || builtInAlias;
    if (Array.isArray(keyCodes)) {
      return keyCodes.indexOf(eventKeyCode) === -1
    } else {
      return keyCodes !== eventKeyCode
    }
  };
}

function resolveSlots (
  children,
  context
) {
  var slots = {};
  if (!children) {
    return slots
  }
  var defaultSlot = [];
  var name, child;
  for (var i = 0, l = children.length; i < l; i++) {
    child = children[i];
    // named slots should only be respected if the vnode was rendered in the
    // same context.
    if ((child.context === context || child.functionalContext === context) &&
        child.data && (name = child.data.slot)) {
      var slot = (slots[name] || (slots[name] = []));
      if (child.tag === 'template') {
        slot.push.apply(slot, child.children);
      } else {
        slot.push(child);
      }
    } else {
      defaultSlot.push(child);
    }
  }
  // ignore single whitespace
  if (defaultSlot.length && !(
    defaultSlot.length === 1 &&
    (defaultSlot[0].text === ' ' || defaultSlot[0].isComment)
  )) {
    slots.default = defaultSlot;
  }
  return slots
}

/*  */

var uid = 0;

/**
 * 为Vue原型添加_init函数
 * @description 为Vue原型添加_init函数
 * @param Vue [Vue对象]
 */
function initMixin (Vue) {
  Vue.prototype._init = function (options) {
    var vm = this;
    // a uid
    vm._uid = uid++;
    // a flag to avoid this being observed
    // 一个标示，以避免被观察到
    vm._isVue = true;
    // merge options
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      
      // 优化内部组件实例化
      // 由于动态选项合并非常缓慢，并且内部组件选项没有需要特殊处理
      initInternalComponent(vm, options);
    } else {
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      );
    }
    /* istanbul ignore else */
    {
      initProxy(vm);
    }
    // expose real self
    vm._self = vm;
    initLifecycle(vm);
    initEvents(vm);
    callHook(vm, 'beforeCreate');
    initState(vm);
    callHook(vm, 'created');
    initRender(vm);
  };
}

/**
 * 初始化内部组件
 * @description 初始化内部组件
 * @param vm [Vue实例对象]
 * @param options [options]
 */
function initInternalComponent (vm, options) {
  var opts = vm.$options = Object.create(vm.constructor.options);
  // doing this because it's faster than dynamic enumeration.
  // 这样做是因为它比动态枚举快
  opts.parent = options.parent;
  opts.propsData = options.propsData;
  opts._parentVnode = options._parentVnode;
  opts._parentListeners = options._parentListeners;
  opts._renderChildren = options._renderChildren;
  opts._componentTag = options._componentTag;
  opts._parentElm = options._parentElm;
  opts._refElm = options._refElm;
  if (options.render) {
    opts.render = options.render;
    opts.staticRenderFns = options.staticRenderFns;
  }
}

/**
 * 解决构造函数参数配置
 * @description 解决构造函数参数配置
 * @param Ctor [constructor]
 */
function resolveConstructorOptions (Ctor) {
  var options = Ctor.options;
  if (Ctor.super) {
    var superOptions = Ctor.super.options;
    var cachedSuperOptions = Ctor.superOptions;
    var extendOptions = Ctor.extendOptions;
    if (superOptions !== cachedSuperOptions) {
      // super option changed
      Ctor.superOptions = superOptions;
      extendOptions.render = options.render;
      extendOptions.staticRenderFns = options.staticRenderFns;
      extendOptions._scopeId = options._scopeId;
      options = Ctor.options = mergeOptions(superOptions, extendOptions);
      if (options.name) {
        options.components[options.name] = Ctor;
      }
    }
  }
  return options
}

/**
 * Vue构造函数
 * @description Vue构造函数
 * @param options [参数] 
 */
function Vue$3 (options) {
  if ("development" !== 'production' &&
    !(this instanceof Vue$3)) {
    warn('Vue is a constructor and should be called with the `new` keyword');
  }
  this._init(options);
}

initMixin(Vue$3);
stateMixin(Vue$3);
eventsMixin(Vue$3);
lifecycleMixin(Vue$3);
renderMixin(Vue$3);

/*  */

/**
 * 初始use静态方法
 * @description 初始use静态方法
 * @param Vue [Vue对象]
 */
function initUse (Vue) {
  Vue.use = function (plugin) {
    /* istanbul ignore if */
    if (plugin.installed) {
      return
    }
    // additional parameters
    var args = toArray(arguments, 1);
    // 此处是把Vue对象放入第一个参数里
    args.unshift(this);
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args);
    } else {
      plugin.apply(null, args);
    }
    plugin.installed = true;
    return this
  };
}

/*  */

/**
 * 初始mixin静态方法
 * @description 初始mixin静态方法
 * @param Vue [Vue对象]
 */
function initMixin$1 (Vue) {
  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin);
  };
}

/*  */

/**
 * 初始Extend静态方法
 * @description 初始Extend静态方法
 * @param Vue [Vue对象]
 */
function initExtend (Vue) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   * 
   * 每个实例构造函数，包括Vue，具有独特的cid。这使我们能够创建包的孩子”子级构造函数”为原型继承和高速缓存
   */
  Vue.cid = 0;
  var cid = 1;

  /**
   * Class inheritance
   * 对象继承
   */
  Vue.extend = function (extendOptions) {
    extendOptions = extendOptions || {};
    var Super = this;
    var SuperId = Super.cid;
    var cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId]
    }
    var name = extendOptions.name || Super.options.name;
    {
      if (!/^[a-zA-Z][\w-]*$/.test(name)) {
        warn(
          'Invalid component name: "' + name + '". Component names ' +
          'can only contain alphanumeric characters and the hyphen, ' +
          'and must start with a letter.'
        );
      }
    }
    var Sub = function VueComponent (options) {
      this._init(options);
    };
    Sub.prototype = Object.create(Super.prototype);
    Sub.prototype.constructor = Sub;
    Sub.cid = cid++;
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    );
    Sub['super'] = Super;
    // allow further extension/mixin/plugin usage
    Sub.extend = Super.extend;
    Sub.mixin = Super.mixin;
    Sub.use = Super.use;
    // create asset registers, so extended classes
    // can have their private assets too.
    config._assetTypes.forEach(function (type) {
      Sub[type] = Super[type];
    });
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub;
    }
    // keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.
    Sub.superOptions = Super.options;
    Sub.extendOptions = extendOptions;
    // cache constructor
    cachedCtors[SuperId] = Sub;
    return Sub
  };
}

/*  */

/**
 * 静态资源注册 Vue['component,directive,filter']静态方法的注册
 * @description 静态资源注册
 * @param Vue [Vue对象]
 */
function initAssetRegisters (Vue) {
  /**
   * Create asset registration methods.
   */
  config._assetTypes.forEach(function (type) {
    Vue[type] = function (
      id,
      definition
    ) {
      if (!definition) {
        return this.options[type + 's'][id]
      } else {
        /* istanbul ignore if */
        {
          if (type === 'component' && config.isReservedTag(id)) {
            warn(
              'Do not use built-in or reserved HTML elements as component ' +
              'id: ' + id
            );
          }
        }
        if (type === 'component' && isPlainObject(definition)) {
          definition.name = definition.name || id;
          definition = this.options._base.extend(definition);
        }
        if (type === 'directive' && typeof definition === 'function') {
          definition = { bind: definition, update: definition };
        }
        this.options[type + 's'][id] = definition;
        return definition
      }
    };
  });
}

/*  */

var patternTypes = [String, RegExp];

function matches (pattern, name) {
  if (typeof pattern === 'string') {
    return pattern.split(',').indexOf(name) > -1
  } else {
    return pattern.test(name)
  }
}

var KeepAlive = {
  name: 'keep-alive',
  abstract: true,
  props: {
    include: patternTypes,
    exclude: patternTypes
  },
  created: function created () {
    this.cache = Object.create(null);
  },
  render: function render () {
    var vnode = getFirstComponentChild(this.$slots.default);
    if (vnode && vnode.componentOptions) {
      var opts = vnode.componentOptions;
      // check pattern
      var name = opts.Ctor.options.name || opts.tag;
      if (name && (
        (this.include && !matches(this.include, name)) ||
        (this.exclude && matches(this.exclude, name))
      )) {
        return vnode
      }
      var key = vnode.key == null
        // same constructor may get registered as different local components
        // so cid alone is not enough (#3269)
        ? opts.Ctor.cid + (opts.tag ? ("::" + (opts.tag)) : '')
        : vnode.key;
      if (this.cache[key]) {
        vnode.child = this.cache[key].child;
      } else {
        this.cache[key] = vnode;
      }
      vnode.data.keepAlive = true;
    }
    return vnode
  },
  destroyed: function destroyed () {
    var this$1 = this;

    for (var key in this.cache) {
      var vnode = this$1.cache[key];
      callHook(vnode.child, 'deactivated');
      vnode.child.$destroy();
    }
  }
};

/***** 2017-02-15 *****/
var builtInComponents = {
  KeepAlive: KeepAlive
};

/*  */

/**
 * 初始全局API
 * @description 初始全局API
 * @param Vue [Vue对象]
 */
function initGlobalAPI (Vue) {
  // config
  var configDef = {};
  configDef.get = function () { return config; };
  {
    configDef.set = function () {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      );
    };
  }
  Object.defineProperty(Vue, 'config', configDef);
  Vue.util = util;
  Vue.set = set$1;
  Vue.delete = del;
  Vue.nextTick = nextTick;

  Vue.options = Object.create(null);
  config._assetTypes.forEach(function (type) {
    Vue.options[type + 's'] = Object.create(null);
  });

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue;

  extend(Vue.options.components, builtInComponents);

  initUse(Vue);
  initMixin$1(Vue);
  initExtend(Vue);
  initAssetRegisters(Vue);
}

initGlobalAPI(Vue$3);

// 为Vue对象添加$isServer属性,是否服务端调用
Object.defineProperty(Vue$3.prototype, '$isServer', {
  get: isServerRendering
});

// 定义版本
Vue$3.version = '2.1.8';

/*  */

// attributes that should be using props for binding
var acceptValue = makeMap('input,textarea,option,select');
var mustUseProp = function (tag, attr) {
  return (
    (attr === 'value' && acceptValue(tag)) ||
    (attr === 'selected' && tag === 'option') ||
    (attr === 'checked' && tag === 'input') ||
    (attr === 'muted' && tag === 'video')
  )
};

var isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck');

var isBooleanAttr = makeMap(
  'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' +
  'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' +
  'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' +
  'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' +
  'required,reversed,scoped,seamless,selected,sortable,translate,' +
  'truespeed,typemustmatch,visible'
);

var xlinkNS = 'http://www.w3.org/1999/xlink';

var isXlink = function (name) {
  return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink'
};

var getXlinkProp = function (name) {
  return isXlink(name) ? name.slice(6, name.length) : ''
};

var isFalsyAttrValue = function (val) {
  return val == null || val === false
};

/*  */

/**
 * 获取虚拟节点上的class属性信息
 * @description 获取虚拟节点上的class属性信息
 * @param vnode [虚拟节点]
 */
function genClassForVnode (vnode) {
  var data = vnode.data;
  var parentNode = vnode;
  var childNode = vnode;
  while (childNode.child) {
    childNode = childNode.child._vnode;
    if (childNode.data) {
      data = mergeClassData(childNode.data, data);
    }
  }
  while ((parentNode = parentNode.parent)) {
    if (parentNode.data) {
      data = mergeClassData(data, parentNode.data);
    }
  }
  return genClassFromData(data)
}

/**
 * 合并class数据信息
 * @description 合并class数据信息
 * @param child [child]
 * @param Parent [parent]
 */
function mergeClassData (child, parent) {
  return {
    staticClass: concat(child.staticClass, parent.staticClass),
    class: child.class
      ? [child.class, parent.class]
      : parent.class
  }
}

/**
 * class组成字符串
 * @description class组成字符串
 * @param data [data]
 */
function genClassFromData (data) {
  var dynamicClass = data.class;
  var staticClass = data.staticClass;
  if (staticClass || dynamicClass) {
    return concat(staticClass, stringifyClass(dynamicClass))
  }
  /* istanbul ignore next */
  return ''
}

/**
 * 字符串拼接
 * @description 字符串拼接
 * @param a [a]
 * @param b [b]
 */
function concat (a, b) {
  return a ? b ? (a + ' ' + b) : a : (b || '')
}

/**
 * class格式化成字符串
 * @description class格式化成字符串
 * @param value [value]
 */
function stringifyClass (value) {
  var res = '';
  if (!value) {
    return res
  }
  if (typeof value === 'string') {
    return value
  }
  if (Array.isArray(value)) {
    var stringified;
    for (var i = 0, l = value.length; i < l; i++) {
      if (value[i]) {
        if ((stringified = stringifyClass(value[i]))) {
          res += stringified + ' ';
        }
      }
    }
    return res.slice(0, -1)
  }
  if (isObject(value)) {
    for (var key in value) {
      if (value[key]) { res += key + ' '; }
    }
    return res.slice(0, -1)
  }
  /* istanbul ignore next */
  return res
}

/*  */

var namespaceMap = {
  svg: 'http://www.w3.org/2000/svg',
  math: 'http://www.w3.org/1998/Math/MathML'
};

var isHTMLTag = makeMap(
  'html,body,base,head,link,meta,style,title,' +
  'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
  'div,dd,dl,dt,figcaption,figure,hr,img,li,main,ol,p,pre,ul,' +
  'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
  's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
  'embed,object,param,source,canvas,script,noscript,del,ins,' +
  'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
  'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
  'output,progress,select,textarea,' +
  'details,dialog,menu,menuitem,summary,' +
  'content,element,shadow,template'
);

// this map is intentionally selective, only covering SVG elements that may
// contain child elements.
var isSVG = makeMap(
  'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,' +
  'font-face,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
  'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
  true
);

var isPreTag = function (tag) { return tag === 'pre'; };

var isReservedTag = function (tag) {
  return isHTMLTag(tag) || isSVG(tag)
};

function getTagNamespace (tag) {
  if (isSVG(tag)) {
    return 'svg'
  }
  // basic support for MathML
  // note it doesn't support other MathML elements being component roots
  if (tag === 'math') {
    return 'math'
  }
}

// 未定义元素缓存对象
var unknownElementCache = Object.create(null);
/**
 * 是否属于未定义元素
 * @description 是否属于未定义元素
 */
function isUnknownElement (tag) {
  /* istanbul ignore if */
  if (!inBrowser) {
    return true
  }
  if (isReservedTag(tag)) {
    return false
  }
  tag = tag.toLowerCase();
  /* istanbul ignore if */
  if (unknownElementCache[tag] != null) {
    return unknownElementCache[tag]
  }
  var el = document.createElement(tag);
  if (tag.indexOf('-') > -1) {
    // http://stackoverflow.com/a/28210364/1070244
    return (unknownElementCache[tag] = (
      el.constructor === window.HTMLUnknownElement ||
      el.constructor === window.HTMLElement
    ))
  } else {
    return (unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString()))
  }
}

/*  */

/**
  * 查询元素选择器
 */
function query (el) {
  if (typeof el === 'string') {
    var selector = el;
    el = document.querySelector(el);
    if (!el) {
      "development" !== 'production' && warn(
        'Cannot find element: ' + selector
      );
      return document.createElement('div')
    }
  }
  return el
}

/*  */
/**
 * 创建html标签
 * @description 创建html标签
 * @param tagName [标签名称]
 * @param vnode [虚拟节点]
 */
function createElement$1 (tagName, vnode) {
  var elm = document.createElement(tagName);
  if (tagName !== 'select') {
    return elm
  }
  if (vnode.data && vnode.data.attrs && 'multiple' in vnode.data.attrs) {
    elm.setAttribute('multiple', 'multiple');
  }
  return elm
}

/**
 * 创建html标签命名空间
 * @description 创建html标签命名空间
 * @param namespace [命名空间]
 * @param tagName [标签名称]
 */
function createElementNS (namespace, tagName) {
  return document.createElementNS(namespaceMap[namespace], tagName)
}

/**
 * 创建文本节点
 * @description 创建文本节点
 * @param text [文本信息]
 */
function createTextNode (text) {
  return document.createTextNode(text)
}

/**
 * 创建注释节点
 * @description 创建注释节点
 * @param text [注释文本]
 */
function createComment (text) {
  return document.createComment(text)
}

/**
 * 指定的已有子节点之前插入新的子节点
 * @description 指定的已有子节点之前插入新的子节点
 * @param parentNode [父级节点]
 * @param newNode [需要插入的节点对象]
 * @param referenceNode [existingnode]
 */
function insertBefore (parentNode, newNode, referenceNode) {
  parentNode.insertBefore(newNode, referenceNode);
}

/**
 * 移除子节点
 * @description 移除子节点
 * @param node [节点]
 * @param child [子节点]
 */
function removeChild (node, child) {
  node.removeChild(child);
}

/**
 * 追加子节点
 * @description 追加子节点
 * @param node [节点]
 * @param child [子节点]
 */
function appendChild (node, child) {
  node.appendChild(child);
}

function parentNode (node) {
  return node.parentNode
}

function nextSibling (node) {
  return node.nextSibling
}

function tagName (node) {
  return node.tagName
}

function setTextContent (node, text) {
  node.textContent = text;
}

function setAttribute (node, key, val) {
  node.setAttribute(key, val);
}

// freeze 阻止修改现有属性的特性和值，并阻止添加新属性。
var nodeOps = Object.freeze({
	createElement: createElement$1,
	createElementNS: createElementNS,
	createTextNode: createTextNode,
	createComment: createComment,
	insertBefore: insertBefore,
	removeChild: removeChild,
	appendChild: appendChild,
	parentNode: parentNode,
	nextSibling: nextSibling,
	tagName: tagName,
	setTextContent: setTextContent,
	setAttribute: setAttribute
});

/* ref 被用来给元素或子组件注册引用信息。引用信息会根据父组件的 $refs 对象进行注册。
 * 如果在普通的DOM元素上使用，引用信息就是元素; 如果用在子组件上，引用信息就是组件实例: 
 */

var ref = {
  create: function create (_, vnode) {
    registerRef(vnode);
  },
  update: function update (oldVnode, vnode) {
    if (oldVnode.data.ref !== vnode.data.ref) {
      registerRef(oldVnode, true);
      registerRef(vnode);
    }
  },
  destroy: function destroy (vnode) {
    registerRef(vnode, true);
  }
};

/**
 * 注册编号
 * @description 注册编号
 * @param vnode [虚拟节点]
 * @param isRemoval [是否移除]
 */
function registerRef (vnode, isRemoval) {
  var key = vnode.data.ref;
  if (!key) { return }

  // Vue实例对象
  var vm = vnode.context;
  // 优先子组件或者元素
  var ref = vnode.child || vnode.elm;
  var refs = vm.$refs;
  if (isRemoval) {
    if (Array.isArray(refs[key])) {
      remove$1(refs[key], ref);
    } else if (refs[key] === ref) {
      refs[key] = undefined;
    }
  } else {
    // ref在for内
    if (vnode.data.refInFor) {
      if (Array.isArray(refs[key]) && refs[key].indexOf(ref) < 0) {
        refs[key].push(ref);
      } else {
        refs[key] = [ref];
      }
    } else {
      refs[key] = ref;
    }
  }
}

/**
 * Virtual DOM patching algorithm based on Snabbdom by
 * Simon Friis Vindum (@paldepind)
 * Licensed under the MIT License
 * https://github.com/paldepind/snabbdom/blob/master/LICENSE
 *
 * modified by Evan You (@yyx990803)
 *

/*
 * Not type-checking this because this file is perf-critical and the cost
 * of making flow understand it is not worth it.
 */

var emptyNode = new VNode('', {}, []);

var hooks$1 = ['create', 'activate', 'update', 'remove', 'destroy'];

function isUndef (s) {
  return s == null
}

function isDef (s) {
  return s != null
}

function sameVnode (vnode1, vnode2) {
  return (
    vnode1.key === vnode2.key &&
    vnode1.tag === vnode2.tag &&
    vnode1.isComment === vnode2.isComment &&
    !vnode1.data === !vnode2.data
  )
}

function createKeyToOldIdx (children, beginIdx, endIdx) {
  var i, key;
  var map = {};
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key;
    if (isDef(key)) { map[key] = i; }
  }
  return map
}

/**
 * 创建补丁函数
 * @description 创建补丁函数
 * @param backend [预设的一些对象]
 * backend:{
 *    nodeOps: nodeOps, // 内置了一些DOM操作方法 
 *    modules: modules // [attrs,klass,events,domProps,style,transition,ref,directives]
 * }
 */
function createPatchFunction (backend) {
  var i, j;
  // 回调函数(钩子函数)哈希列表
  var cbs = {};

  var modules = backend.modules;
  var nodeOps = backend.nodeOps;
  // hooks$1 = ['create', 'activate', 'update', 'remove', 'destroy']
  for (i = 0; i < hooks$1.length; ++i) {
    cbs[hooks$1[i]] = [];
    for (j = 0; j < modules.length; ++j) {
      if (modules[j][hooks$1[i]] !== undefined) { cbs[hooks$1[i]].push(modules[j][hooks$1[i]]); }
    }
  }

  /**
   * 创建虚拟节点
   * @description 创建虚拟节点
   * @param elm [elment]
   */
  function emptyNodeAt (elm) {
    return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
  }

  /**
   * 创建移除回调函数
   * @description 创建移除回调函数
   * @param childElm [子元素]
   * @param listeners [监听列表数量]
   */
  function createRmCb (childElm, listeners) {
    function remove$$1 () {
      if (--remove$$1.listeners === 0) {
        removeNode(childElm);
      }
    }
    remove$$1.listeners = listeners;
    return remove$$1
  }

  /**
   * 移除DOM节点
   * @description 移除DOM节点
   * @param el [elment] 
   */
  function removeNode (el) {
    var parent = nodeOps.parentNode(el);
    // element may have already been removed due to v-html / v-text
    if (parent) {
      nodeOps.removeChild(parent, el);
    }
  }

  var inPre = 0;
  /**
   * 创建DOM元素
   * @description 创建DOM元素
   * @param vnode [虚拟节点]
   * @param insertedVnodeQueue [插入虚拟节点队列]
   * @param refElm [refElm]
   * @param nested [nested]
   */
  function createElm (vnode, insertedVnodeQueue, parentElm, refElm, nested) {
    // 对于过渡动画进行检查
    vnode.isRootInsert = !nested; // for transition enter check
    // 尝试创建组件
    if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
      return
    }

    var data = vnode.data;
    var children = vnode.children;
    var tag = vnode.tag;
    if (isDef(tag)) {
      {
        if (data && data.pre) {
          inPre++;
        }
        if (
          !inPre &&
          !vnode.ns &&
          !(config.ignoredElements.length && config.ignoredElements.indexOf(tag) > -1) &&
          config.isUnknownElement(tag)
        ) {
          warn(
            'Unknown custom element: <' + tag + '> - did you ' +
            'register the component correctly? For recursive components, ' +
            'make sure to provide the "name" option.',
            vnode.context
          );
        }
      }

      // 虚拟节点的elm根据虚拟节点的命名空间生成相应的元素
      vnode.elm = vnode.ns
        ? nodeOps.createElementNS(vnode.ns, tag)
        : nodeOps.createElement(tag, vnode);
      // 设置作用域
      setScope(vnode);

      /* istanbul ignore if */
      {
        createChildren(vnode, children, insertedVnodeQueue);
        if (isDef(data)) {
          invokeCreateHooks(vnode, insertedVnodeQueue);
        }
        // 插入元素
        insert(parentElm, vnode.elm, refElm);
      }

      if ("development" !== 'production' && data && data.pre) {
        inPre--;
      }
    } else if (vnode.isComment) {
      // 虚拟节点的elm为注释节点
      vnode.elm = nodeOps.createComment(vnode.text);
      insert(parentElm, vnode.elm, refElm);
    } else {
      // 虚拟节点的elm为文本节点
      vnode.elm = nodeOps.createTextNode(vnode.text);
      insert(parentElm, vnode.elm, refElm);
    }
  }

  /**
   * 创建组件
   * @description 创建组件
   * @param vnode [虚拟节点]
   * @param insertedVnodeQueue [插入虚拟节点队列]
   * @param parentElm [父级元素]
   * @param refElm [refElm]
   */
  function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
    var i = vnode.data;
    if (isDef(i)) {
      // 是否重新激活
      var isReactivated = isDef(vnode.child) && i.keepAlive;
      // 有钩子函数并且有init钩子函数则执行init钩子函数
      if (isDef(i = i.hook) && isDef(i = i.init)) {
        // 调用init函数
        i(vnode, false /* hydrating */, parentElm, refElm);
      }
      // after calling the init hook, if the vnode is a child component
      // it should've created a child instance and mounted it. the child
      // component also has set the placeholder vnode's elm.
      // in that case we can just return the element and be done.
      // 调用init钩子函数后，如果该节点是子组件并且已经创造了一个子级的实例和安装它。
      // 子组件也有设置占位符节点的元素。在这种情况下，我们可以直接返回元素并结束
      if (isDef(vnode.child)) {
        initComponent(vnode, insertedVnodeQueue);
        if (isReactivated) {
          reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
        }
        return true
      }
    }
  }

  /**
   * 激活组件
   * @description 激活组件
   * @param vnode [虚拟节点]
   * @param insertedVnodeQueue [插入虚拟节点队列]
   * @param parentElm [父级元素]
   * @param refElm [refElm]
   */
  function reactivateComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
    var i;
    // hack for #4339: a reactivated component with inner transition
    // does not trigger because the inner node's created hooks are not called
    // again. It's not ideal to involve module-specific logic in here but
    // there doesn't seem to be a better way to do it.
    var innerNode = vnode;
    while (innerNode.child) {
      innerNode = innerNode.child._vnode;
      if (isDef(i = innerNode.data) && isDef(i = i.transition)) {
        for (i = 0; i < cbs.activate.length; ++i) {
          // 批量唤醒active钩子函数
          cbs.activate[i](emptyNode, innerNode);
        }
        insertedVnodeQueue.push(innerNode);
        break
      }
    }
    // unlike a newly created component,
    // a reactivated keep-alive component doesn't insert itself
    // 不像新创建的组件，保持激活组件不插入本身
    insert(parentElm, vnode.elm, refElm);
  }

  /**
   * 插入DOM元素
   * @description 插入DOM元素
   * @param parent [父级元素]
   * @param elm [elment]
   * @param ref [ref]
   */
  function insert (parent, elm, ref) {
    if (parent) {
      if (ref) {
        nodeOps.insertBefore(parent, elm, ref);
      } else {
        nodeOps.appendChild(parent, elm);
      }
    }
  }

  /**
   * 创建子节点
   * @description 创建子节点
   * @param vnode [虚拟节点]
   * @param children [子集]
   * @param insertedVnodeQueue [插入虚拟节点队列]
   */
  function createChildren (vnode, children, insertedVnodeQueue) {
    if (Array.isArray(children)) {
      for (var i = 0; i < children.length; ++i) {
        // 递归创建子元素
        createElm(children[i], insertedVnodeQueue, vnode.elm, null, true);
      }
    } else if (isPrimitive(vnode.text)) {
      // 创建文本子节点
      nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(vnode.text));
    }
  }

  /**
   * 是否修补
   * @description 是否修补
   * @param vnode [虚拟节点]
   */
  function isPatchable (vnode) {
    while (vnode.child) {
      vnode = vnode.child._vnode;
    }
    return isDef(vnode.tag)
  }

  /**
   * 调用create钩子函数
   * @description 调用create钩子函数
   * @param vnode [虚拟节点]
   * @param insertedVnodeQueue [插入虚拟节点队列]
   */
  function invokeCreateHooks (vnode, insertedVnodeQueue) {
    // 批量唤醒create钩子函数
    for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
      cbs.create[i$1](emptyNode, vnode);
    }
    i = vnode.data.hook; // Reuse variable
    if (isDef(i)) {
      if (i.create) { i.create(emptyNode, vnode); }
      if (i.insert) { insertedVnodeQueue.push(vnode); }
    }
  }

  /**
   * 初始化组件
   * @description 初始化组件
   * @param vnode [虚拟节点]
   * @param insertedVnodeQueue [插入虚拟节点队列]
   */
  function initComponent (vnode, insertedVnodeQueue) {
    if (vnode.data.pendingInsert) {
      insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
    }
    // 虚拟节点的元素赋值为虚拟节点子级的元素
    vnode.elm = vnode.child.$el;
    if (isPatchable(vnode)) {
      invokeCreateHooks(vnode, insertedVnodeQueue);
      setScope(vnode);
    } else {
      // empty component root.
      // skip all element-related modules except for ref (#3455)
      registerRef(vnode);
      // make sure to invoke the insert hook
      insertedVnodeQueue.push(vnode);
    }
  }

  // set scope id attribute for scoped CSS.
  // this is implemented as a special case to avoid the overhead
  // of going through the normal attribute patching process.

  /**
   * 设置作用域
   * @description 设置作用域
   * @param vnode [虚拟节点]
   */
  function setScope (vnode) {
    var i;
    if (isDef(i = vnode.context) && isDef(i = i.$options._scopeId)) {
      // 为元素添加属性_scopeId
      nodeOps.setAttribute(vnode.elm, i, '');
    }
    
    if (isDef(i = activeInstance) &&
        i !== vnode.context &&
        isDef(i = i.$options._scopeId)) {
      // 设置为激活的Vue实例的_scopeId
      nodeOps.setAttribute(vnode.elm, i, '');
    }
  }

  /**
   * 添加虚拟节点
   * @description 添加虚拟节点
   * @param parentElm [parentElm]
   * @param refElm [refElm]
   * @param vnode [vnode]
   * @param startIdx [startIdx]
   * @param endIdx [endIdx]
   * @param insertedVnodeQueue [insertedVnodeQueue]
   */
  function addVnodes (parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
    for (; startIdx <= endIdx; ++startIdx) {
      createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm);
    }
  }

  /**
   * 调用销毁钩子函数
   * @description 调用销毁钩子函数
   * @param vnode [虚拟节点]
   */
  function invokeDestroyHook (vnode) {
    var i, j;
    var data = vnode.data;
    if (isDef(data)) {
      // 批量唤醒destroy钩子函数
      if (isDef(i = data.hook) && isDef(i = i.destroy)) { i(vnode); }
      for (i = 0; i < cbs.destroy.length; ++i) { cbs.destroy[i](vnode); }
    }
    if (isDef(i = vnode.children)) {
      for (j = 0; j < vnode.children.length; ++j) {
        // 运用递归销毁子节点
        invokeDestroyHook(vnode.children[j]);
      }
    }
  }

  /**
   * 移除虚拟节点
   * @description 移除虚拟节点
   * @param parentElm [parentElm]
   * @param vnode [vnode]
   * @param startIdx [startIdx]
   * @param endIdx [endIdx]
   */
  function removeVnodes (parentElm, vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      var ch = vnodes[startIdx];
      if (isDef(ch)) {
        if (isDef(ch.tag)) {
          removeAndInvokeRemoveHook(ch);
          invokeDestroyHook(ch);
        } else { // Text node
          // 删除文本元素节点
          removeNode(ch.elm);
        }
      }
    }
  }

  /**
   * 移除节点并唤醒remove钩子函数
   * @description 移除节点并唤醒remove钩子函数
   * @param vnode [vnode]
   * @param rm [remove]
   */
  function removeAndInvokeRemoveHook (vnode, rm) {
    if (rm || isDef(vnode.data)) {
      var listeners = cbs.remove.length + 1;
      if (!rm) {
        // directly removing
        // 直接删除
        rm = createRmCb(vnode.elm, listeners);
      } else {
        // we have a recursively passed down rm callback
        // increase the listeners count
        rm.listeners += listeners;
      }
      // recursively invoke hooks on child component root node
      if (isDef(i = vnode.child) && isDef(i = i._vnode) && isDef(i.data)) {
        removeAndInvokeRemoveHook(i, rm);
      }
      for (i = 0; i < cbs.remove.length; ++i) {
        cbs.remove[i](vnode, rm);
      }
      if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
        i(vnode, rm);
      } else {
        rm();
      }
    } else {
      // 直接移除元素
      removeNode(vnode.elm);
    }
  }

  /**
   * 更新子节点
   * @description 更新子节点
   * @param parentElm [parentElm]
   * @param oldCh [ololdCh]
   * @param newCh [newCh]
   * @param insertedVnodeQueue [insertedVnodeQueue]
   * @param removeOnly [removeOnly]
   */
  function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
    var oldStartIdx = 0;
    var newStartIdx = 0;
    var oldEndIdx = oldCh.length - 1;
    var oldStartVnode = oldCh[0];
    var oldEndVnode = oldCh[oldEndIdx];
    var newEndIdx = newCh.length - 1;
    var newStartVnode = newCh[0];
    var newEndVnode = newCh[newEndIdx];
    var oldKeyToIdx, idxInOld, elmToMove, refElm;

    // removeOnly is a special flag used only by <transition-group>
    // to ensure removed elements stay in correct relative positions
    // during leaving transitions

    // removeonly是在离开过渡动画的特殊殊标志，<过渡组件组>用来确保移除元素保持正确的相对位置
    var canMove = !removeOnly;

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx];
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
        oldStartVnode = oldCh[++oldStartIdx];
        newStartVnode = newCh[++newStartIdx];
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
        oldEndVnode = oldCh[--oldEndIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
        oldStartVnode = oldCh[++oldStartIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
        oldEndVnode = oldCh[--oldEndIdx];
        newStartVnode = newCh[++newStartIdx];
      } else {
        if (isUndef(oldKeyToIdx)) { oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx); }
        idxInOld = isDef(newStartVnode.key) ? oldKeyToIdx[newStartVnode.key] : null;
        if (isUndef(idxInOld)) { // New element
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm);
          newStartVnode = newCh[++newStartIdx];
        } else {
          elmToMove = oldCh[idxInOld];
          /* istanbul ignore if */
          if ("development" !== 'production' && !elmToMove) {
            warn(
              'It seems there are duplicate keys that is causing an update error. ' +
              'Make sure each v-for item has a unique key.'
            );
          }
          if (sameVnode(elmToMove, newStartVnode)) {
            patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
            oldCh[idxInOld] = undefined;
            canMove && nodeOps.insertBefore(parentElm, newStartVnode.elm, oldStartVnode.elm);
            newStartVnode = newCh[++newStartIdx];
          } else {
            // same key but different element. treat as new element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm);
            newStartVnode = newCh[++newStartIdx];
          }
        }
      }
    }
    if (oldStartIdx > oldEndIdx) {
      refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
      addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
    }
  }

  /**
   * 为虚拟节点打补丁
   * @description 为虚拟节点打补丁
   * @param oldVnode [oldVnode]
   * @param vnode [vnode]
   * @param insertedVnodeQueue [insertedVnodeQueue]
   * @param removeOnly [removeOnly]
   */
  function patchVnode (oldVnode, vnode, insertedVnodeQueue, removeOnly) {
    if (oldVnode === vnode) {
      return
    }
    // reuse element for static trees.
    // note we only do this if the vnode is cloned -
    // if the new node is not cloned it means the render functions have been
    // reset by the hot-reload-api and we need to do a proper re-render.
    // 静态树重用元素。注意：我们只做这个如果这个节点属于克隆的，
    // 如果新的节点不是克隆的，意味着由于热加载API原因render函数已重置，我们需要做一个适当的重新渲染
    if (vnode.isStatic &&
        oldVnode.isStatic &&
        vnode.key === oldVnode.key &&
        (vnode.isCloned || vnode.isOnce)) {
      vnode.elm = oldVnode.elm;
      vnode.child = oldVnode.child;
      return
    }
    var i;
    var data = vnode.data;
    var hasData = isDef(data);
    if (hasData && isDef(i = data.hook) && isDef(i = i.prepatch)) {
      // 调用prepatch函数
      i(oldVnode, vnode);
    }
    var elm = vnode.elm = oldVnode.elm;
    var oldCh = oldVnode.children;
    var ch = vnode.children;
    if (hasData && isPatchable(vnode)) {
      // 批量唤醒update钩子函数
      for (i = 0; i < cbs.update.length; ++i) { cbs.update[i](oldVnode, vnode); }
      if (isDef(i = data.hook) && isDef(i = i.update)) { i(oldVnode, vnode); }
    }
    // 文本节点内容
    if (isUndef(vnode.text)) {
      if (isDef(oldCh) && isDef(ch)) {
        // 新节点和旧节点都存在的情况下，并且新节点和旧节点不相同
        if (oldCh !== ch) { updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly); }
      } else if (isDef(ch)) {
        // 优先清空元素内容
        if (isDef(oldVnode.text)) { nodeOps.setTextContent(elm, ''); }
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
      } else if (isDef(oldCh)) {
        removeVnodes(elm, oldCh, 0, oldCh.length - 1);
      } else if (isDef(oldVnode.text)) {
        // 设置元素内容为空
        nodeOps.setTextContent(elm, '');
      }
    } else if (oldVnode.text !== vnode.text) {
      // 设置元素内容
      nodeOps.setTextContent(elm, vnode.text);
    }
    if (hasData) {
      // 批量唤醒postpatch钩子函数
      if (isDef(i = data.hook) && isDef(i = i.postpatch)) { i(oldVnode, vnode); }
    }
  }

  /**
   * 调用insert钩子函数
   * @description 调用insert钩子函数
   * @param vnode [vnode]
   * @param queue [队列]
   * @param initial [initial]
   */
  function invokeInsertHook (vnode, queue, initial) {
    // delay insert hooks for component root nodes, invoke them after the
    // element is really inserted
    // 延迟插入组件根节点的钩子，在元素插入后调用它们
    if (initial && vnode.parent) {
      vnode.parent.data.pendingInsert = queue;
    } else {
      for (var i = 0; i < queue.length; ++i) {
        queue[i].data.hook.insert(queue[i]);
      }
    }
  }

  // bailed v.保释，帮助脱离困境( bail的过去式和过去分词 )
  var bailed = false;
  // list of modules that can skip create hook during hydration because they
  // are already rendered on the client or has no need for initialization

  // 在用数据填充对象的过程中可以跳过创建钩子的模块列表，因为它们已经呈现在客户端或不需要初始化
  var isRenderedModule = makeMap('attrs,style,class,staticClass,staticStyle,key');

  // Note: this is a browser-only function so we can assume elms are DOM nodes.
  
  // 提醒：这是一个仅浏览器端的函数，所以我们可以假设elms是DOM节点
  
  /**
   * 数据填充对象，返回是否填充成功
   * @description 数据填充对象，返回是否填充成功
   * @param elm [element]
   * @param vnode [虚拟节点]
   * @param insertedVnodeQueue [insertedVnodeQueue]
   */
  function hydrate (elm, vnode, insertedVnodeQueue) {
    {
      if (!assertNodeMatch(elm, vnode)) {
        return false
      }
    }
    vnode.elm = elm;
    var tag = vnode.tag;
    var data = vnode.data;
    var children = vnode.children;
    if (isDef(data)) {
      // 唤醒init钩子函数
      if (isDef(i = data.hook) && isDef(i = i.init)) { i(vnode, true /* hydrating */); }
      if (isDef(i = vnode.child)) {
        // child component. it should have hydrated its own tree.
        // 子组件，它应该有自己数据填充过的树
        initComponent(vnode, insertedVnodeQueue);
        return true
      }
    }
    if (isDef(tag)) {
      if (isDef(children)) {
        // empty element, allow client to pick up and populate children
        // 没有子节点
        if (!elm.hasChildNodes()) {
          // 创建子元素
          createChildren(vnode, children, insertedVnodeQueue);
        } else {
          var childrenMatch = true;
          var childNode = elm.firstChild;
          for (var i$1 = 0; i$1 < children.length; i$1++) {
            if (!childNode || !hydrate(childNode, children[i$1], insertedVnodeQueue)) {
              childrenMatch = false;
              break
            }
            childNode = childNode.nextSibling;
          }
          // if childNode is not null, it means the actual childNodes list is
          // longer than the virtual children list.
          // 如果子节点不为空，这意味着实际的子节点列表比虚拟子节点更长
          if (!childrenMatch || childNode) {
            if ("development" !== 'production' &&
                typeof console !== 'undefined' &&
                !bailed) {
              bailed = true;
              console.warn('Parent: ', elm);
              console.warn('Mismatching childNodes vs. VNodes: ', elm.childNodes, children);
            }
            return false
          }
        }
      }
      if (isDef(data)) {
        for (var key in data) {
          if (!isRenderedModule(key)) {
            // 唤醒create钩子函数
            invokeCreateHooks(vnode, insertedVnodeQueue);
            break
          }
        }
      }
    } else if (elm.data !== vnode.text) {
      // 标签的data赋值为虚拟节点的文本
      elm.data = vnode.text;
    }
    return true
  }

  /**
   * 判断节点匹配
   * @description 判断节点匹配
   * @param node [节点]
   * @param vnode [虚拟节点]
   */
  function assertNodeMatch (node, vnode) {
    if (vnode.tag) {
      return (
        vnode.tag.indexOf('vue-component') === 0 ||
        vnode.tag.toLowerCase() === (node.tagName && node.tagName.toLowerCase())
      )
    } else {
      return node.nodeType === (vnode.isComment ? 8 : 3)
    }
  }

  /**
   * 返回一个补丁函数
   * @description 返回一个补丁函数
   * @param oldVnode [旧的虚拟节点]
   * @param vnode [新的虚拟节点]
   * @param hydrating [数据是否填充对象的过程]
   * @param removeOnly [removeOnly]
   * @param parentElm [父级元素]
   * @param refElm [refElm]
   */
  return function patch (oldVnode, vnode, hydrating, removeOnly, parentElm, refElm) {
    if (!vnode) {
      if (oldVnode) { invokeDestroyHook(oldVnode); }
      return
    }

    var elm, parent;
    var isInitialPatch = false;
    // 插入虚拟节点队列
    var insertedVnodeQueue = [];

    if (!oldVnode) {
      // empty mount (likely as component), create new root element
      // 空挂载（可能是组件），创建新的根元素
      isInitialPatch = true;
      // 创建根元素
      createElm(vnode, insertedVnodeQueue, parentElm, refElm);
    } else {
      var isRealElement = isDef(oldVnode.nodeType);
      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        // patch existing root node
        patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly);
      } else {
        if (isRealElement) {
          // mounting to a real element
          // check if this is server-rendered content and if we can perform
          // a successful hydration.

          // 挂载到一个真实的DOM节点上
          // hydration refers to the process of filling an object with data
          // hydration是指用数据填充对象的过程
          // 检查是否服务器渲染的内容，如果我们可以执行数据填充对象的过程成功了
          if (oldVnode.nodeType === 1 && oldVnode.hasAttribute('server-rendered')) {
            oldVnode.removeAttribute('server-rendered');
            hydrating = true;
          }
          if (hydrating) {
            if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
              // 唤醒insert钩子函数 并直接返回oldVnode
              invokeInsertHook(vnode, insertedVnodeQueue, true);
              return oldVnode
            } else {
              warn(
                'The client-side rendered virtual DOM tree is not matching ' +
                'server-rendered content. This is likely caused by incorrect ' +
                'HTML markup, for example nesting block-level elements inside ' +
                '<p>, or missing <tbody>. Bailing hydration and performing ' +
                'full client-side render.'
              );
            }
          }
          // either not server-rendered, or hydration failed.
          // create an empty node and replace it
          oldVnode = emptyNodeAt(oldVnode);
        }
        // replacing existing element
        elm = oldVnode.elm;
        parent = nodeOps.parentNode(elm);
        // 创建平行节点
        createElm(vnode, insertedVnodeQueue, parent, nodeOps.nextSibling(elm));

        if (vnode.parent) {
          // component root element replaced.
          // update parent placeholder node element, recursively
          var ancestor = vnode.parent;
          while (ancestor) {
            ancestor.elm = vnode.elm;
            ancestor = ancestor.parent;
          }
          if (isPatchable(vnode)) {
            for (var i = 0; i < cbs.create.length; ++i) {
              // 调用内置模块create方法
              cbs.create[i](emptyNode, vnode.parent);
            }
          }
        }

        if (parent !== null) {
          removeVnodes(parent, [oldVnode], 0, 0);
        } else if (isDef(oldVnode.tag)) {
          // 调用销毁钩子函数
          invokeDestroyHook(oldVnode);
        }
      }
    }
    // 唤醒inserted钩子函数
    invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
    return vnode.elm
  }
}

/* 指令 */

// 指令对象
var directives = {
  create: updateDirectives,
  update: updateDirectives,
  destroy: function unbindDirectives (vnode) {
    updateDirectives(vnode, emptyNode);
  }
};

/**
 * 更新指令列表
 * @description 更新指令列表
 * @param oldVnode [旧的虚拟节点]
 * @param vnode [虚拟节点]
 */
function updateDirectives (oldVnode, vnode) {
  if (oldVnode.data.directives || vnode.data.directives) {
    _update(oldVnode, vnode);
  }
}

/**
 * 自定义指令的钩子函数
 * bind: 只调用一次，指令第一次绑定到元素时调用，用这个钩子函数可以定义一个在绑定时执行一次的初始化动作。
 * inserted: 被绑定元素插入父节点时调用（父节点存在即可调用，不必存在于 document 中）。
 * update: 被绑定元素所在的模板更新时调用，而不论绑定值是否变化。通过比较更新前后的绑定值，可以忽略不必要的模板更新（详细的钩子函数参数见下）。
 * componentUpdated: 被绑定元素所在模板完成一次更新周期时调用。
 * unbind: 只调用一次， 指令与元素解绑时调用。
 */
/**
 * 更新指令列表
 * @description 更新指令列表
 * @param oldVnode [旧的虚拟节点]
 * @param vnode [虚拟节点]
 */
function _update (oldVnode, vnode) {
  var isCreate = oldVnode === emptyNode;
  var isDestroy = vnode === emptyNode;
  var oldDirs = normalizeDirectives$1(oldVnode.data.directives, oldVnode.context);
  var newDirs = normalizeDirectives$1(vnode.data.directives, vnode.context);

  var dirsWithInsert = [];
  var dirsWithPostpatch = [];

  var key, oldDir, dir;
  for (key in newDirs) {
    oldDir = oldDirs[key];
    dir = newDirs[key];
    if (!oldDir) {
      // new directive, bind
      // 新的指令，唤醒bind钩子函数
      callHook$1(dir, 'bind', vnode, oldVnode);
      if (dir.def && dir.def.inserted) {
        // 插入新的指令列表中
        dirsWithInsert.push(dir);
      }
    } else {
      // existing directive, update
      // 存在指令 唤醒update钩子函数
      dir.oldValue = oldDir.value;
      callHook$1(dir, 'update', vnode, oldVnode);
      if (dir.def && dir.def.componentUpdated) {
        dirsWithPostpatch.push(dir);
      }
    }
  }

  if (dirsWithInsert.length) {
    var callInsert = function () {
      for (var i = 0; i < dirsWithInsert.length; i++) {
        // 批量唤醒inserted钩子函数
        callHook$1(dirsWithInsert[i], 'inserted', vnode, oldVnode);
      }
    };
    if (isCreate) {
      // 先在虚拟节点上钩子函数哈希列表中添加insert钩子函数，调用后再唤醒dir-insert函数，再然后唤醒insered钩子函数
      mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'insert', callInsert, 'dir-insert');
    } else {
      callInsert();
    }
  }

  if (dirsWithPostpatch.length) {
    mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'postpatch', function () {
      for (var i = 0; i < dirsWithPostpatch.length; i++) {
        // 批量唤醒componentUpdated钩子函数
        callHook$1(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode);
      }
    }, 'dir-postpatch');
  }

  // 如果不是创建 那么循环旧的指令列表，并且不在新的指令列表中存在，那么唤醒unbind钩子函数
  if (!isCreate) {
    for (key in oldDirs) {
      if (!newDirs[key]) {
        // no longer present, unbind
        callHook$1(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy);
      }
    }
  }
}

// 空修饰符对象
var emptyModifiers = Object.create(null);

/**
 * 使指令规范化
 * @description 使指令规范化
 * @param dirs [包含 Vue 实例可用指令的哈希表]
 * @param vm [Vue实例]
 */
function normalizeDirectives$1 (
  dirs,
  vm
) {
  var res = Object.create(null);
  if (!dirs) {
    return res
  }
  var i, dir;
  for (i = 0; i < dirs.length; i++) {
    dir = dirs[i];
    if (!dir.modifiers) {
      dir.modifiers = emptyModifiers;
    }
    res[getRawDirName(dir)] = dir;
    dir.def = resolveAsset(vm.$options, 'directives', dir.name, true);
  }
  return res
}

/**
 * 得到指令的真实名称
 * @description 得到指令的真是名称
 * @param dir [指令]
 */
function getRawDirName (dir) {
  return dir.rawName || ((dir.name) + "." + (Object.keys(dir.modifiers || {}).join('.')))
}

/**
 * 唤醒指令钩子函数
 * @description 唤醒指令钩子函数
 * @param dir [指令]
 * @param hook [钩子名称]
 * @param vnode [虚拟节点]
 * @param oldVnode [旧的虚拟节点]
 * @param isDestroy [是否销毁]
 */
function callHook$1 (dir, hook, vnode, oldVnode, isDestroy) {
  // 指令的钩子函数式存放在def对象下的，在normalizeDirectives$1()方法调用时赋值
  var fn = dir.def && dir.def[hook];
  if (fn) {
    fn(vnode.elm, dir, vnode, oldVnode, isDestroy);
  }
}

var baseModules = [
  ref,
  directives
];

/*  */

/**
 * 更新虚拟节点属性
 * @description 更新虚拟节点属性
 * @param oldVnode [旧的虚拟节点]
 * @param vnode [新的虚拟节点]
 */
function updateAttrs (oldVnode, vnode) {
  if (!oldVnode.data.attrs && !vnode.data.attrs) {
    return
  }
  var key, cur, old;
  var elm = vnode.elm;
  var oldAttrs = oldVnode.data.attrs || {};
  var attrs = vnode.data.attrs || {};
  // clone observed objects, as the user probably wants to mutate it
  // 克隆观察对象
  if (attrs.__ob__) {
    attrs = vnode.data.attrs = extend({}, attrs);
  }

  for (key in attrs) {
    cur = attrs[key];
    old = oldAttrs[key];
    if (old !== cur) {
      // 旧的属性值不等于新的属性值，则设置属性值
      setAttr(elm, key, cur);
    }
  }
  // #4391: in IE9, setting type can reset value for input[type=radio]
  /* istanbul ignore if */
  if (isIE9 && attrs.value !== oldAttrs.value) {
    setAttr(elm, 'value', attrs.value);
  }
  for (key in oldAttrs) {
    if (attrs[key] == null) {
      if (isXlink(key)) {
        elm.removeAttributeNS(xlinkNS, getXlinkProp(key));
      } else if (!isEnumeratedAttr(key)) {
        elm.removeAttribute(key);
      }
    }
  }
}

/**
 * 为元素设置属性值
 * @description 为元素设置属性值
 * @param el [elment]
 * @param key [key]
 * @param value [value]
 */
function setAttr (el, key, value) {
  if (isBooleanAttr(key)) {
    // set attribute for blank value
    // e.g. <option disabled>Select one</option>
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, key);
    }
  } else if (isEnumeratedAttr(key)) {
    el.setAttribute(key, isFalsyAttrValue(value) || value === 'false' ? 'false' : 'true');
  } else if (isXlink(key)) {
    if (isFalsyAttrValue(value)) {
      el.removeAttributeNS(xlinkNS, getXlinkProp(key));
    } else {
      el.setAttributeNS(xlinkNS, key, value);
    }
  } else {
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, value);
    }
  }
}

/** 预设的attrs模块 **/
var attrs = {
  create: updateAttrs,
  update: updateAttrs
};

/*  */

/**
 * 虚拟节点更新class属性
 * @description 虚拟节点更新class属性
 * @param oldVnode [oldVnode]
 * @param vnode [vnode]
 */
function updateClass (oldVnode, vnode) {
  var el = vnode.elm;
  var data = vnode.data;
  var oldData = oldVnode.data;
  if (!data.staticClass && !data.class &&
      (!oldData || (!oldData.staticClass && !oldData.class))) {
    return
  }

  var cls = genClassForVnode(vnode);

  // handle transition classes
  var transitionClass = el._transitionClasses;
  if (transitionClass) {
    cls = concat(cls, stringifyClass(transitionClass));
  }

  // set the class
  if (cls !== el._prevClass) {
    el.setAttribute('class', cls);
    el._prevClass = cls;
  }
}

/** 预设的klass模块 **/
var klass = {
  create: updateClass,
  update: updateClass
};

/* 预设的events模块 */

// 事件触发的DOM
var target$1;

/**
 * 添加DOM监听事件
 * @description 添加DOM监听事件
 * @param event [event]
 * @param handler [handler]
 * @param once [once]
 * @param capture [capture]
 */
function add$2 (event, handler, once, capture) {
  // 如果注册的是只执行一次的函数，那么利用闭包修改函数，移除函数后再调用函数
  if (once) {
    var oldHandler = handler;
    handler = function (ev) {
      remove$3(event, handler, capture);
      arguments.length === 1
        ? oldHandler(ev)
        : oldHandler.apply(null, arguments);
    };
  }
  // 为元素添加处理函数
  target$1.addEventListener(event, handler, capture);
}

/**
 * 移除DOM监听事件
 * @description 移除DOM监听事件
 * @param event [event]
 * @param handler [handler]
 * @param capture [capture]
 */
function remove$3 (event, handler, capture) {
  target$1.removeEventListener(event, handler, capture);
}

/**
 * 更新虚拟节点事件监听
 * @description 更新虚拟节点事件监听
 * @param oldVnode [oldVnode]
 * @param vnode [vnode]
 */
function updateDOMListeners (oldVnode, vnode) {
  if (!oldVnode.data.on && !vnode.data.on) {
    return
  }
  var on = vnode.data.on || {};
  var oldOn = oldVnode.data.on || {};
  target$1 = vnode.elm;
  updateListeners(on, oldOn, add$2, remove$3, vnode.context);
}

/* 预设的events模块 */
var events = {
  create: updateDOMListeners,
  update: updateDOMListeners
};

/*  */

/**
 * 更新DOM节点Props属性
 * @description 更新DOM节点Props属性
 * @param oldVnode [oldVnode]
 * @param vnode [vnode]
 */
function updateDOMProps (oldVnode, vnode) {
  if (!oldVnode.data.domProps && !vnode.data.domProps) {
    return
  }
  var key, cur;
  var elm = vnode.elm;
  var oldProps = oldVnode.data.domProps || {};
  var props = vnode.data.domProps || {};
  // clone observed objects, as the user probably wants to mutate it
  // 克隆观察对象
  if (props.__ob__) {
    props = vnode.data.domProps = extend({}, props);
  }

  for (key in oldProps) {
    if (props[key] == null) {
      elm[key] = '';
    }
  }

  for (key in props) {
    cur = props[key];
    // ignore children if the node has textContent or innerHTML,
    // as these will throw away existing DOM nodes and cause removal errors
    // on subsequent patches (#3360)
    if (key === 'textContent' || key === 'innerHTML') {
      // 如果含有children 把虚拟节点的children清空
      if (vnode.children) { vnode.children.length = 0; }
      if (cur === oldProps[key]) { continue }
    }
    // #4521: if a click event triggers update before the change event is
    // dispatched on a checkbox/radio input, the input's checked state will
    // be reset and fail to trigger another update.
    /* istanbul ignore next */
    if (key === 'checked' && !isDirty(elm, cur)) {
      continue
    }
    if (key === 'value') {
      // store value as _value as well since
      // non-string values will be stringified
      elm._value = cur;
      // avoid resetting cursor position when value is the same
      var strCur = cur == null ? '' : String(cur);
      if (shouldUpdateValue(elm, vnode, strCur)) {
        elm.value = strCur;
      }
    } else {
      elm[key] = cur;
    }
  }
}

// check platforms/web/util/attrs.js acceptValue

/**
 * 应该更新的值
 * @description 应该更新的值
 * @param elm [elment]
 * @param vnode [vnode]
 * @param checkVal [checkVal]
 */
function shouldUpdateValue (
  elm,
  vnode,
  checkVal
) {
  if (!elm.composing && (
    vnode.tag === 'option' ||
    isDirty(elm, checkVal) ||
    isInputChanged(vnode, checkVal)
  )) {
    return true
  }
  return false
}

/**
 * 检测是否属于脏值
 * @param elm [elm]
 * @param checkVal [checkVal]
 */
function isDirty (elm, checkVal) {
  return document.activeElement !== elm && elm.value !== checkVal
}

/**
 * 是否input的change事件
 * @param vnode [vnode]
 * @param newVal [newVal]
 */
function isInputChanged (vnode, newVal) {
  var value = vnode.elm.value;
  // 由v-model指令注入
  var modifiers = vnode.elm._vModifiers; // injected by v-model runtime
  if ((modifiers && modifiers.number) || vnode.elm.type === 'number') {
    return toNumber(value) !== toNumber(newVal)
  }
  if (modifiers && modifiers.trim) {
    return value.trim() !== newVal.trim()
  }
  return value !== newVal
}

/** 预设的domProps模块 **/
var domProps = {
  create: updateDOMProps,
  update: updateDOMProps
};

/*  */

var parseStyleText = cached(function (cssText) {
  var res = {};
  var listDelimiter = /;(?![^(]*\))/g;
  var propertyDelimiter = /:(.+)/;
  cssText.split(listDelimiter).forEach(function (item) {
    if (item) {
      var tmp = item.split(propertyDelimiter);
      tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return res
});

// merge static and dynamic style data on the same vnode
function normalizeStyleData (data) {
  var style = normalizeStyleBinding(data.style);
  // static style is pre-processed into an object during compilation
  // and is always a fresh object, so it's safe to merge into it
  return data.staticStyle
    ? extend(data.staticStyle, style)
    : style
}

// normalize possible array / string values into Object
/**
 * 将数组或字符串值转换为对象
 * @description 将数组或字符串值转换为对象
 * @param bindingStyle [bindingStyle]
 */
function normalizeStyleBinding (bindingStyle) {
  if (Array.isArray(bindingStyle)) {
    return toObject(bindingStyle)
  }
  if (typeof bindingStyle === 'string') {
    return parseStyleText(bindingStyle)
  }
  return bindingStyle
}

/**
 * parent component style should be after child's
 * so that parent component's style could override it
 */
function getStyle (vnode, checkChild) {
  var res = {};
  var styleData;

  if (checkChild) {
    var childNode = vnode;
    while (childNode.child) {
      childNode = childNode.child._vnode;
      if (childNode.data && (styleData = normalizeStyleData(childNode.data))) {
        extend(res, styleData);
      }
    }
  }

  if ((styleData = normalizeStyleData(vnode.data))) {
    extend(res, styleData);
  }

  var parentNode = vnode;
  while ((parentNode = parentNode.parent)) {
    if (parentNode.data && (styleData = normalizeStyleData(parentNode.data))) {
      extend(res, styleData);
    }
  }
  return res
}

/*  */

var cssVarRE = /^--/;
var importantRE = /\s*!important$/;
/**
 * 设置DOM元素的style属性
 * @description 设置DOM元素的style属性
 * @param el [elment]
 * @param name [name]
 * @param val [value]
 */
var setProp = function (el, name, val) {
  /* istanbul ignore if */
  if (cssVarRE.test(name)) {
    el.style.setProperty(name, val);
  } else if (importantRE.test(val)) {
    el.style.setProperty(name, val.replace(importantRE, ''), 'important');
  } else {
    el.style[normalize(name)] = val;
  }
};

// 浏览器前缀
var prefixes = ['Webkit', 'Moz', 'ms'];

var testEl;
// 标签css规范化，并且利用闭包缓存
var normalize = cached(function (prop) {
  // 只运用一次便可以一直用testE1变量
  testEl = testEl || document.createElement('div');
  // 转换成驼峰规则
  prop = camelize(prop);
  if (prop !== 'filter' && (prop in testEl.style)) {
    return prop
  }
  // 加入浏览器厂商前缀
  var upper = prop.charAt(0).toUpperCase() + prop.slice(1);
  for (var i = 0; i < prefixes.length; i++) {
    var prefixed = prefixes[i] + upper;
    if (prefixed in testEl.style) {
      return prefixed
    }
  }
});

/**
 * 更新节点的style属性
 * @description 更新节点的style属性
 * @param oldVnode [oldVnode]
 * @param vnode [vnode]
 */
function updateStyle (oldVnode, vnode) {
  var data = vnode.data;
  var oldData = oldVnode.data;

  if (!data.staticStyle && !data.style &&
      !oldData.staticStyle && !oldData.style) {
    return
  }

  var cur, name;
  var el = vnode.elm;
  var oldStaticStyle = oldVnode.data.staticStyle;
  var oldStyleBinding = oldVnode.data.style || {};

  // if static style exists, stylebinding already merged into it when doing normalizeStyleData
  var oldStyle = oldStaticStyle || oldStyleBinding;

  var style = normalizeStyleBinding(vnode.data.style) || {};
 
  vnode.data.style = style.__ob__ ? extend({}, style) : style;

  var newStyle = getStyle(vnode, true);

  for (name in oldStyle) {
    if (newStyle[name] == null) {
      setProp(el, name, '');
    }
  }
  for (name in newStyle) {
    cur = newStyle[name];
    if (cur !== oldStyle[name]) {
      // ie9 setting to null has no effect, must use empty string
      setProp(el, name, cur == null ? '' : cur);
    }
  }
}

/** 预设的style模块 **/
var style = {
  create: updateStyle,
  update: updateStyle
};

/*  */

/**
 * Add class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 * 为html标签添加class
 * @description 为html标签添加class
 * @param el [element]
 * @param cls [class]
 */
function addClass (el, cls) {
  /* istanbul ignore if */
  if (!cls || !cls.trim()) {
    return
  }

  /* istanbul ignore else */
  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(/\s+/).forEach(function (c) { return el.classList.add(c); });
    } else {
      el.classList.add(cls);
    }
  } else {
    var cur = ' ' + el.getAttribute('class') + ' ';
    if (cur.indexOf(' ' + cls + ' ') < 0) {
      el.setAttribute('class', (cur + cls).trim());
    }
  }
}

/**
 * Remove class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 * 移除html标签class
 * @description 移除html标签class
 * @param el [element]
 * @param cls [class]
 */
function removeClass (el, cls) {
  /* istanbul ignore if */
  if (!cls || !cls.trim()) {
    return
  }

  /* istanbul ignore else */
  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(/\s+/).forEach(function (c) { return el.classList.remove(c); });
    } else {
      el.classList.remove(cls);
    }
  } else {
    var cur = ' ' + el.getAttribute('class') + ' ';
    var tar = ' ' + cls + ' ';
    while (cur.indexOf(tar) >= 0) {
      cur = cur.replace(tar, ' ');
    }
    el.setAttribute('class', cur.trim());
  }
}

/*  */
// 是否有动画
var hasTransition = inBrowser && !isIE9;
// 过渡
var TRANSITION = 'transition';
// 动画
var ANIMATION = 'animation';

// Transition property/event sniffing
// 过渡属性/事件嗅探
var transitionProp = 'transition';
var transitionEndEvent = 'transitionend';
var animationProp = 'animation';
var animationEndEvent = 'animationend';
if (hasTransition) {
  /* istanbul ignore if */
  if (window.ontransitionend === undefined &&
    window.onwebkittransitionend !== undefined) {
    transitionProp = 'WebkitTransition';
    transitionEndEvent = 'webkitTransitionEnd';
  }
  if (window.onanimationend === undefined &&
    window.onwebkitanimationend !== undefined) {
    animationProp = 'WebkitAnimation';
    animationEndEvent = 'webkitAnimationEnd';
  }
}

// requestAnimationFrame不需要使用者指定循环间隔时间，浏览器会基于当前页面是否可见、CPU的负荷情况等来自行决定最佳的帧速率，从而更合理地使用CPU。
var raf = (inBrowser && window.requestAnimationFrame) || setTimeout;
/**
 * 下一帧调用的函数
 * @description 下一帧调用的函数
 * @param fn [调用函数]
 */
function nextFrame (fn) {
  raf(function () {
    raf(fn);
  });
}

/**
 * 为html标签添加过渡动画用到的class
 * @description 为html标签添加过渡动画用到的class
 * @param el [element]
 * @param cls [class]
 */
function addTransitionClass (el, cls) {
  (el._transitionClasses || (el._transitionClasses = [])).push(cls);
  addClass(el, cls);
}

/**
 * 移除html标签过渡动画用到的class
 * @description 移除html标签过渡动画用到的class
 * @param el [elment]
 * @param cls [class]
 */
function removeTransitionClass (el, cls) {
  if (el._transitionClasses) {
    remove$1(el._transitionClasses, cls);
  }
  removeClass(el, cls);
}

/**
 * 当过渡动画结束时执行的方法
 * @description 当过渡动画结束时执行的方法
 * @param el [elment]
 * @param expectedType [expectedType]
 * @param cb [callback]
 */
function whenTransitionEnds (
  el,
  expectedType,
  cb
) {
  var ref = getTransitionInfo(el, expectedType);
  var type = ref.type;
  var timeout = ref.timeout;
  var propCount = ref.propCount;
  if (!type) { return cb() }
  var event = type === TRANSITION ? transitionEndEvent : animationEndEvent;
  var ended = 0;
  var end = function () {
    el.removeEventListener(event, onEnd);
    cb();
  };
  var onEnd = function (e) {
    if (e.target === el) {
      if (++ended >= propCount) {
        end();
      }
    }
  };
  setTimeout(function () {
    if (ended < propCount) {
      end();
    }
  }, timeout + 1);
  el.addEventListener(event, onEnd);
}

var transformRE = /\b(transform|all)(,|$)/;

/**
 * 得到过渡动画信息
 * @description 得到过渡动画信息
 * @param el [element]
 * @param expectedType [expectedType]
 */
function getTransitionInfo (el, expectedType) {
  // 此处调用的window.getComputedStyle() 属于IE才支持的
  var styles = window.getComputedStyle(el);
  var transitioneDelays = styles[transitionProp + 'Delay'].split(', ');
  var transitionDurations = styles[transitionProp + 'Duration'].split(', ');
  var transitionTimeout = getTimeout(transitioneDelays, transitionDurations);
  var animationDelays = styles[animationProp + 'Delay'].split(', ');
  var animationDurations = styles[animationProp + 'Duration'].split(', ');
  var animationTimeout = getTimeout(animationDelays, animationDurations);

  var type;
  var timeout = 0;
  var propCount = 0;
  /* istanbul ignore if */
  if (expectedType === TRANSITION) {
    if (transitionTimeout > 0) {
      type = TRANSITION;
      timeout = transitionTimeout;
      propCount = transitionDurations.length;
    }
  } else if (expectedType === ANIMATION) {
    if (animationTimeout > 0) {
      type = ANIMATION;
      timeout = animationTimeout;
      propCount = animationDurations.length;
    }
  } else {
    timeout = Math.max(transitionTimeout, animationTimeout);
    type = timeout > 0
      ? transitionTimeout > animationTimeout
        ? TRANSITION
        : ANIMATION
      : null;
    propCount = type
      ? type === TRANSITION
        ? transitionDurations.length
        : animationDurations.length
      : 0;
  }
  var hasTransform =
    type === TRANSITION &&
    transformRE.test(styles[transitionProp + 'Property']);
  return {
    type: type,
    timeout: timeout,
    propCount: propCount,
    hasTransform: hasTransform
  }
}

function getTimeout (delays, durations) {
  /* istanbul ignore next */
  while (delays.length < durations.length) {
    delays = delays.concat(delays);
  }

  return Math.max.apply(null, durations.map(function (d, i) {
    return toMs(d) + toMs(delays[i])
  }))
}

function toMs (s) {
  return Number(s.slice(0, -1)) * 1000
}

/*  */

/**
 * DOM元素过渡效果
 * @description DOM元素过渡效果
 * @param vnode [虚拟节点]
 * @param toggleDisplay [callback]
 */
function enter (vnode, toggleDisplay) {
  var el = vnode.elm;

  // call leave callback now
  if (el._leaveCb) {
    el._leaveCb.cancelled = true;
    el._leaveCb();
  }

  var data = resolveTransition(vnode.data.transition);
  if (!data) {
    return
  }

  /* istanbul ignore if */
  /**
   * el.nodeType的值
   * 1	Element	代表元素	Element, Text, Comment, ProcessingInstruction, CDATASection, EntityReference
   * 2	Attr	代表属性	Text, EntityReference
   * 3	Text	代表元素或属性中的文本内容。	None
   * 4	CDATASection	代表文档中的 CDATA 部分（不会由解析器解析的文本）。	None
   * 5	EntityReference	代表实体引用。	Element, ProcessingInstruction, Comment, Text, CDATASection, EntityReference
   * 6	Entity	代表实体。	Element, ProcessingInstruction, Comment, Text, CDATASection, EntityReference
   * 7	ProcessingInstruction	代表处理指令。	None
   * 8	Comment	代表注释。	None
   * 9	Document	代表整个文档（DOM 树的根节点）。	Element, ProcessingInstruction, Comment, DocumentType
   * 10	DocumentType	向为文档定义的实体提供接口	None
   * 11	DocumentFragment	代表轻量级的 Document 对象，能够容纳文档的某个部分	Element, ProcessingInstruction, Comment, Text, CDATASection, EntityReference
   * 12	Notation	代表 DTD 中声明的符号。	None
   */
  if (el._enterCb || el.nodeType !== 1) {
    return
  }

  var css = data.css;
  var type = data.type;
  var enterClass = data.enterClass;
  var enterToClass = data.enterToClass;
  var enterActiveClass = data.enterActiveClass;
  var appearClass = data.appearClass;
  var appearToClass = data.appearToClass;
  var appearActiveClass = data.appearActiveClass;
  var beforeEnter = data.beforeEnter;
  var enter = data.enter;
  var afterEnter = data.afterEnter;
  var enterCancelled = data.enterCancelled;
  var beforeAppear = data.beforeAppear;
  var appear = data.appear;
  var afterAppear = data.afterAppear;
  var appearCancelled = data.appearCancelled;

  // activeInstance will always be the <transition> component managing this
  // transition. One edge case to check is when the <transition> is placed
  // as the root node of a child component. In that case we need to check
  // <transition>'s parent for appear check.
  var context = activeInstance;
  var transitionNode = activeInstance.$vnode;
  while (transitionNode && transitionNode.parent) {
    transitionNode = transitionNode.parent;
    context = transitionNode.context;
  }

  var isAppear = !context._isMounted || !vnode.isRootInsert;

  if (isAppear && !appear && appear !== '') {
    return
  }

  var startClass = isAppear ? appearClass : enterClass;
  var activeClass = isAppear ? appearActiveClass : enterActiveClass;
  var toClass = isAppear ? appearToClass : enterToClass;
  var beforeEnterHook = isAppear ? (beforeAppear || beforeEnter) : beforeEnter;
  var enterHook = isAppear ? (typeof appear === 'function' ? appear : enter) : enter;
  var afterEnterHook = isAppear ? (afterAppear || afterEnter) : afterEnter;
  var enterCancelledHook = isAppear ? (appearCancelled || enterCancelled) : enterCancelled;

  var expectsCSS = css !== false && !isIE9;
  var userWantsControl =
    enterHook &&
    // enterHook may be a bound method which exposes
    // the length of original fn as _length
    (enterHook._length || enterHook.length) > 1;

  var cb = el._enterCb = once(function () {
    if (expectsCSS) {
      removeTransitionClass(el, toClass);
      removeTransitionClass(el, activeClass);
    }
    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, startClass);
      }
      enterCancelledHook && enterCancelledHook(el);
    } else {
      afterEnterHook && afterEnterHook(el);
    }
    el._enterCb = null;
  });

  if (!vnode.data.show) {
    // remove pending leave element on enter by injecting an insert hook
    mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'insert', function () {
      var parent = el.parentNode;
      var pendingNode = parent && parent._pending && parent._pending[vnode.key];
      if (pendingNode &&
          pendingNode.context === vnode.context &&
          pendingNode.tag === vnode.tag &&
          pendingNode.elm._leaveCb) {
        pendingNode.elm._leaveCb();
      }
      enterHook && enterHook(el, cb);
    }, 'transition-insert');
  }

  // start enter transition
  beforeEnterHook && beforeEnterHook(el);
  if (expectsCSS) {
    addTransitionClass(el, startClass);
    addTransitionClass(el, activeClass);
    nextFrame(function () {
      addTransitionClass(el, toClass);
      removeTransitionClass(el, startClass);
      if (!cb.cancelled && !userWantsControl) {
        whenTransitionEnds(el, type, cb);
      }
    });
  }

  if (vnode.data.show) {
    toggleDisplay && toggleDisplay();
    enterHook && enterHook(el, cb);
  }

  if (!expectsCSS && !userWantsControl) {
    cb();
  }
}

function leave (vnode, rm) {
  var el = vnode.elm;

  // call enter callback now
  if (el._enterCb) {
    el._enterCb.cancelled = true;
    el._enterCb();
  }

  var data = resolveTransition(vnode.data.transition);
  if (!data) {
    return rm()
  }

  /* istanbul ignore if */
  if (el._leaveCb || el.nodeType !== 1) {
    return
  }

  var css = data.css;
  var type = data.type;
  var leaveClass = data.leaveClass;
  var leaveToClass = data.leaveToClass;
  var leaveActiveClass = data.leaveActiveClass;
  var beforeLeave = data.beforeLeave;
  var leave = data.leave;
  var afterLeave = data.afterLeave;
  var leaveCancelled = data.leaveCancelled;
  var delayLeave = data.delayLeave;

  var expectsCSS = css !== false && !isIE9;
  var userWantsControl =
    leave &&
    // leave hook may be a bound method which exposes
    // the length of original fn as _length
    (leave._length || leave.length) > 1;

  var cb = el._leaveCb = once(function () {
    if (el.parentNode && el.parentNode._pending) {
      el.parentNode._pending[vnode.key] = null;
    }
    if (expectsCSS) {
      removeTransitionClass(el, leaveToClass);
      removeTransitionClass(el, leaveActiveClass);
    }
    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, leaveClass);
      }
      leaveCancelled && leaveCancelled(el);
    } else {
      rm();
      afterLeave && afterLeave(el);
    }
    el._leaveCb = null;
  });

  if (delayLeave) {
    delayLeave(performLeave);
  } else {
    performLeave();
  }

  function performLeave () {
    // the delayed leave may have already been cancelled
    if (cb.cancelled) {
      return
    }
    // record leaving element
    if (!vnode.data.show) {
      (el.parentNode._pending || (el.parentNode._pending = {}))[vnode.key] = vnode;
    }
    beforeLeave && beforeLeave(el);
    if (expectsCSS) {
      addTransitionClass(el, leaveClass);
      addTransitionClass(el, leaveActiveClass);
      nextFrame(function () {
        addTransitionClass(el, leaveToClass);
        removeTransitionClass(el, leaveClass);
        if (!cb.cancelled && !userWantsControl) {
          whenTransitionEnds(el, type, cb);
        }
      });
    }
    leave && leave(el, cb);
    if (!expectsCSS && !userWantsControl) {
      cb();
    }
  }
}

function resolveTransition (def$$1) {
  if (!def$$1) {
    return
  }
  /* istanbul ignore else */
  if (typeof def$$1 === 'object') {
    var res = {};
    if (def$$1.css !== false) {
      extend(res, autoCssTransition(def$$1.name || 'v'));
    }
    extend(res, def$$1);
    return res
  } else if (typeof def$$1 === 'string') {
    return autoCssTransition(def$$1)
  }
}

// 利用闭包缓存返回过渡动画需要用到的class
var autoCssTransition = cached(function (name) {
  return {
    enterClass: (name + "-enter"),
    leaveClass: (name + "-leave"),
    appearClass: (name + "-enter"),
    enterToClass: (name + "-enter-to"),
    leaveToClass: (name + "-leave-to"),
    appearToClass: (name + "-enter-to"),
    enterActiveClass: (name + "-enter-active"),
    leaveActiveClass: (name + "-leave-active"),
    appearActiveClass: (name + "-enter-active")
  }
});

function once (fn) {
  var called = false;
  return function () {
    if (!called) {
      called = true;
      fn();
    }
  }
}

function _enter (_, vnode) {
  if (!vnode.data.show) {
    enter(vnode);
  }
}

/** 预设的transition模块 **/
var transition = inBrowser ? {
  create: _enter,
  activate: _enter,
  remove: function remove (vnode, rm) {
    /* istanbul ignore else */
    if (!vnode.data.show) {
      leave(vnode, rm);
    } else {
      rm();
    }
  }
} : {};

/**
 * 框架预设的模块列表
 */
var platformModules = [
  attrs,
  klass,
  events,
  domProps,
  style,
  transition
];

/*  */

// the directive module should be applied last, after all
// built-in modules have been applied.
// 指令模块最后被应用，毕竟内置模块已经被应用
var modules = platformModules.concat(baseModules);

var patch$1 = createPatchFunction({ nodeOps: nodeOps, modules: modules });

/**
 * Not type checking this file because flow doesn't like attaching
 * properties to Elements.
 */

var modelableTagRE = /^input|select|textarea|vue-component-[0-9]+(-[0-9a-zA-Z_-]*)?$/;

/* istanbul ignore if */
if (isIE9) {
  // http://www.matts411.com/post/internet-explorer-9-oninput/
  document.addEventListener('selectionchange', function () {
    var el = document.activeElement;
    if (el && el.vmodel) {
      trigger(el, 'input');
    }
  });
}

// 内置v-model指令
var model = {
  /**
   * 被绑定元素插入父节点时调用（父节点存在即可调用，不必存在于 document 中）
   * @description 被绑定元素插入父节点时调用（父节点存在即可调用，不必存在于 document 中）
   * @param el [指令所绑定的元素，可以用来直接操作 DOM]
   * @param binding [binding]
   * @param vnode [虚拟节点]
   * binding: 一个对象，包含以下属性：
      name: 指令名，不包括 v- 前缀。
      value: 指令的绑定值， 例如： v-my-directive="1 + 1", value 的值是 2。
      oldValue: 指令绑定的前一个值，仅在 update 和 componentUpdated 钩子中可用。无论值是否改变都可用。
      expression: 绑定值的字符串形式。 例如 v-my-directive="1 + 1" ， expression 的值是 "1 + 1"。
      arg: 传给指令的参数。例如 v-my-directive:foo， arg 的值是 "foo"。
      modifiers: 一个包含修饰符的对象。 例如： v-my-directive.foo.bar, 修饰符对象 modifiers 的值是 { foo: true, bar: true }。
   */
  inserted: function inserted (el, binding, vnode) {
    {
      if (!modelableTagRE.test(vnode.tag)) {
        warn(
          "v-model is not supported on element type: <" + (vnode.tag) + ">. " +
          'If you are working with contenteditable, it\'s recommended to ' +
          'wrap a library dedicated for that purpose inside a custom component.',
          vnode.context
        );
      }
    }
    if (vnode.tag === 'select') {
      var cb = function () {
        setSelected(el, binding, vnode.context);
      };
      cb();
      /* istanbul ignore if */
      if (isIE || isEdge) {
        setTimeout(cb, 0);
      }
    } else if (vnode.tag === 'textarea' || el.type === 'text') {
      el._vModifiers = binding.modifiers;
      if (!binding.modifiers.lazy) {
        if (!isAndroid) {
          // 采用compositionstart和compositionend来捕获IME（input method editor）的启动和关闭事件
          el.addEventListener('compositionstart', onCompositionStart);
          el.addEventListener('compositionend', onCompositionEnd);
        }
        /* istanbul ignore if */
        if (isIE9) {
          // 此段代码作为一个标识，
          // 会在selectionchange事件触发时用到，然后通过trigger方法调用input事件
          el.vmodel = true;
        }
      }
    }
  },
  /**
   * 被绑定元素所在模板完成一次更新周期时调用
   * @description 被绑定元素所在模板完成一次更新周期时调用
   * @param el [element]
   * @param binding [binding]
   * @param vnode [虚拟节点]
   */
  componentUpdated: function componentUpdated (el, binding, vnode) {
    if (vnode.tag === 'select') {
      setSelected(el, binding, vnode.context);
      // in case the options rendered by v-for have changed,
      // it's possible that the value is out-of-sync with the rendered options.
      // detect such cases and filter out values that no longer has a matching
      // option in the DOM.
      var needReset = el.multiple
        ? binding.value.some(function (v) { return hasNoMatchingOption(v, el.options); })
        : binding.value !== binding.oldValue && hasNoMatchingOption(binding.value, el.options);
      if (needReset) {
        // 触发change事件
        trigger(el, 'change');
      }
    }
  }
};

/**
 * 设置select标签v-model所绑定的值
 * @description 设置select标签v-model所绑定的值
 * @param el [element]
 * @param binding [binding]
 * @param vm [虚拟节点]
 */
function setSelected (el, binding, vm) {
  // 获取表达式的值
  var value = binding.value;
  // 是否属于多选
  var isMultiple = el.multiple;
  if (isMultiple && !Array.isArray(value)) {
    "development" !== 'production' && warn(
      "<select multiple v-model=\"" + (binding.expression) + "\"> " +
      "expects an Array value for its binding, but got " + (Object.prototype.toString.call(value).slice(8, -1)),
      vm
    );
    return
  }
  var selected, option;
  for (var i = 0, l = el.options.length; i < l; i++) {
    option = el.options[i];
    if (isMultiple) {
      selected = looseIndexOf(value, getValue(option)) > -1;
      if (option.selected !== selected) {
        option.selected = selected;
      }
    } else {
      if (looseEqual(getValue(option), value)) {
        if (el.selectedIndex !== i) {
          el.selectedIndex = i;
        }
        return
      }
    }
  }
  // 不是多选，默认为空
  if (!isMultiple) {
    el.selectedIndex = -1;
  }
}

/**
 * 没有匹配的选项
 * @description 没有匹配的选项
 * @param value [选项]
 * @param options [选项列表]
 */
function hasNoMatchingOption (value, options) {
  for (var i = 0, l = options.length; i < l; i++) {
    if (looseEqual(getValue(options[i]), value)) {
      return false
    }
  }
  return true
}

/**
 * 获取selecte选择项中option的值
 * @description 获取selecte选择项中option的值
 * @param option [option]
 */
function getValue (option) {
  return '_value' in option
    ? option._value
    : option.value
}

// 输入控件输入开始
function onCompositionStart (e) {
  e.target.composing = true;
}

// 输入控件输入结束
function onCompositionEnd (e) {
  e.target.composing = false;
  trigger(e.target, 'input');
}

/**
 * 触发标签事件
 * @description 触发标签事件
 * @param  el [element]
 * @param type [事件类型]
 */
function trigger (el, type) {
  var e = document.createEvent('HTMLEvents');
  e.initEvent(type, true, true);
  // 调用事件
  el.dispatchEvent(e);
}

/*  */

// recursively search for possible transition defined inside the component root
/**
 * 定位节点
 * @description 定位节点
 * @param vnode [虚拟节点]
 */
function locateNode (vnode) {
  return vnode.child && (!vnode.data || !vnode.data.transition)
    ? locateNode(vnode.child._vnode)
    : vnode
}

// 内置v-show指令
var show = {
  /**
   * 只调用一次，指令第一次绑定到元素时调用，用这个钩子函数可以定义一个在绑定时执行一次的初始化动作
   * @description 只调用一次，指令第一次绑定到元素时调用，用这个钩子函数可以定义一个在绑定时执行一次的初始化动作
   * @param el [element]
   * @param ref [binding]
   * @param vnode [虚拟节点]
   * 具体参数解析参考 https://cn.vuejs.org/v2/guide/custom-directive.html#search-query-sidebar
   */
  bind: function bind (el, ref, vnode) {
    var value = ref.value;

    vnode = locateNode(vnode);
    var transition = vnode.data && vnode.data.transition;
    // 为el添加__vOriginalDisplay属性，保存元素切换回显示时，不至于display值弄错
    var originalDisplay = el.__vOriginalDisplay =
      el.style.display === 'none' ? '' : el.style.display;
    if (value && transition && !isIE9) {
      vnode.data.show = true;
      enter(vnode, function () {
        el.style.display = originalDisplay;
      });
    } else {
      el.style.display = value ? originalDisplay : 'none';
    }
  },
  /**
   *  被绑定元素所在的模板更新时调用，而不论绑定值是否变化。通过比较更新前后的绑定值，可以忽略不必要的模板更新
   * @description  被绑定元素所在的模板更新时调用，而不论绑定值是否变化。通过比较更新前后的绑定值，可以忽略不必要的模板更新
   * @param el [element]
   * @param ref [binding]
   * @param vnode [虚拟节点]
   */
  update: function update (el, ref, vnode) {
    var value = ref.value;
    var oldValue = ref.oldValue;

    /* istanbul ignore if */
    if (value === oldValue) { return }
    vnode = locateNode(vnode);
    var transition = vnode.data && vnode.data.transition;
    if (transition && !isIE9) {
      vnode.data.show = true;
      if (value) {
        // 触发进入动画
        enter(vnode, function () {
          el.style.display = el.__vOriginalDisplay;
        });
      } else {
        // 触发离开动画
        leave(vnode, function () {
          el.style.display = 'none';
        });
      }
    } else {
      el.style.display = value ? el.__vOriginalDisplay : 'none';
    }
  },
  /**
   * 指令与元素解绑时调用
   * @description 指令与元素解绑时调用
   * @param el [element]
   * @param ref [binding]
   * @param vnode [虚拟节点]
   */
  unbind: function unbind (
    el,
    binding,
    vnode,
    oldVnode,
    isDestroy
  ) {
    if (!isDestroy) {
      el.style.display = el.__vOriginalDisplay;
    }
  }
};

// 框架预设指令
var platformDirectives = {
  model: model,
  show: show
};

/*  */

// Provides transition support for a single element/component.
// supports transition mode (out-in / in-out)
// 为单个元素/组件提供过渡支持，支持转换模式（入/出）

// 过渡效果组件参数信息
// 具体参照 https://cn.vuejs.org/v2/api/#transition
var transitionProps = {
  // 用于自动生成 CSS 过渡类名。例如：name: 'fade' 将自动拓展为.fade-enter，.fade-enter-active等。默认类名为 "v"
  name: String,
  // 是否在初始渲染时使用过渡。默认为 false
  appear: Boolean,
  // 是否使用 CSS 过渡类。默认为 true。如果设置为 false，将只通过组件事件触发注册的 JavaScript 钩子
  css: Boolean,
  // 控制离开/进入的过渡时间序列。有效的模式有 "out-in" 和 "in-out"；默认同时生效
  mode: String,
  // 指定过渡事件类型，侦听过渡何时结束。有效值为 "transition" 和 "animation"。默认 Vue.js 将自动检测出持续时间长的为过渡事件类型
  type: String,
  enterClass: String,
  leaveClass: String,
  enterToClass: String,
  leaveToClass: String,
  enterActiveClass: String,
  leaveActiveClass: String,
  appearClass: String,
  appearActiveClass: String,
  appearToClass: String
};

// in case the child is also an abstract component, e.g. <keep-alive>
// we want to recursively retrieve the real component to be rendered
// 我们要递归地检索要渲染的真实组件

/**
 * 递归地检索要渲染的真实组件
 * @description 递归地检索要渲染的真实组件
 * @param vnode [虚拟节点]
 */
function getRealChild (vnode) {
  var compOptions = vnode && vnode.componentOptions;
  if (compOptions && compOptions.Ctor.options.abstract) {
    return getRealChild(getFirstComponentChild(compOptions.children))
  } else {
    return vnode
  }
}

/**
 * 提取过渡动画的配置数据
 * @description 提取过渡动画的配置数据
 * @param comp [comp]
 */
function extractTransitionData (comp) {
  var data = {};
  var options = comp.$options;
  // props
  for (var key in options.propsData) {
    data[key] = comp[key];
  }
  // events.
  // extract listeners and pass them directly to the transition methods
  // 提取过渡动画监听器并直接传递给转换方法
  var listeners = options._parentListeners;
  for (var key$1 in listeners) {
    data[camelize(key$1)] = listeners[key$1].fn;
  }
  return data
}

function placeholder (h, rawChild) {
  return /\d-keep-alive$/.test(rawChild.tag)
    ? h('keep-alive')
    : null
}

/**
 * 递归获取虚拟节点父级是否含有过渡动画
 * @description 递归获取虚拟节点父级是否含有过渡动画
 * @param vnode [虚拟节点]
 */
function hasParentTransition (vnode) {
  while ((vnode = vnode.parent)) {
    if (vnode.data.transition) {
      return true
    }
  }
}

/**
 * 是否属于相同的子级
 * @description 是否属于相同的子级
 * @param child [child]
 * @param oldChild [oldChild]
 */
function isSameChild (child, oldChild) {
  return oldChild.key === child.key && oldChild.tag === child.tag
}

// 元素作为单个元素/组件的过渡效果。
// 不会渲染额外的 DOM 元素，也不会出现在检测过的组件层级中。
// 它只是将内容包裹在其中，简单的运用过渡行为。
var Transition = {
  // 组件名称 'transition'
  name: 'transition',
  props: transitionProps,
  abstract: true,
  render: function render (h) {
    var this$1 = this;

    var children = this.$slots.default;
    if (!children) {
      return
    }

    // filter out text nodes (possible whitespaces)
    // 过滤掉文本节点
    children = children.filter(function (c) { return c.tag; });
    /* istanbul ignore if */
    if (!children.length) {
      return
    }

    // warn multiple elements
    if ("development" !== 'production' && children.length > 1) {
      warn(
        '<transition> can only be used on a single element. Use ' +
        '<transition-group> for lists.',
        this.$parent
      );
    }

    var mode = this.mode;

    // warn invalid mode
    if ("development" !== 'production' &&
        mode && mode !== 'in-out' && mode !== 'out-in') {
      warn(
        'invalid <transition> mode: ' + mode,
        this.$parent
      );
    }

    var rawChild = children[0];

    // if this is a component root node and the component's
    // parent container node also has transition, skip.
    // 如果这是组件根节点，组件的父容器节点也有transition，则跳过
    if (hasParentTransition(this.$vnode)) {
      return rawChild
    }

    // apply transition data to child
    // 将过渡动画数据应用到子级
    // use getRealChild() to ignore abstract components e.g. keep-alive
    // 利用getRealChild()方法忽略抽象组件 例如，keep-alive
    var child = getRealChild(rawChild);
    /* istanbul ignore if */
    if (!child) {
      return rawChild
    }

    if (this._leaving) {
      return placeholder(h, rawChild)
    }

    var key = child.key = child.key == null || child.isStatic
      ? ("__v" + (child.tag + this._uid) + "__")
      : child.key;
    var data = (child.data || (child.data = {})).transition = extractTransitionData(this);
    var oldRawChild = this._vnode;
    var oldChild = getRealChild(oldRawChild);

    // mark v-show
    // so that the transition module can hand over the control to the directive
    if (child.data.directives && child.data.directives.some(function (d) { return d.name === 'show'; })) {
      child.data.show = true;
    }

    if (oldChild && oldChild.data && !isSameChild(child, oldChild)) {
      // replace old child transition data with fresh one
      // important for dynamic transitions!
      var oldData = oldChild && (oldChild.data.transition = extend({}, data));
      // handle transition mode
      if (mode === 'out-in') {
        // return placeholder node and queue update when leave finishes
        this._leaving = true;
        mergeVNodeHook(oldData, 'afterLeave', function () {
          this$1._leaving = false;
          this$1.$forceUpdate();
        }, key);
        return placeholder(h, rawChild)
      } else if (mode === 'in-out') {
        var delayedLeave;
        var performLeave = function () { delayedLeave(); };
        mergeVNodeHook(data, 'afterEnter', performLeave, key);
        mergeVNodeHook(data, 'enterCancelled', performLeave, key);
        mergeVNodeHook(oldData, 'delayLeave', function (leave) {
          delayedLeave = leave;
        }, key);
      }
    }

    return rawChild
  }
};

/*  */

// Provides transition support for list items.
// supports move transitions using the FLIP technique.

// Because the vdom's children update algorithm is "unstable" - i.e.
// it doesn't guarantee the relative positioning of removed elements,
// we force transition-group to update its children into two passes:
// in the first pass, we remove all nodes that need to be removed,
// triggering their leaving transition; in the second pass, we insert/move
// into the final disired state. This way in the second pass removed
// nodes will remain where they should be.

var props = extend({
  tag: String,
  moveClass: String
}, transitionProps);

delete props.mode;

var TransitionGroup = {
  props: props,

  render: function render (h) {
    var tag = this.tag || this.$vnode.data.tag || 'span';
    var map = Object.create(null);
    var prevChildren = this.prevChildren = this.children;
    var rawChildren = this.$slots.default || [];
    var children = this.children = [];
    var transitionData = extractTransitionData(this);

    for (var i = 0; i < rawChildren.length; i++) {
      var c = rawChildren[i];
      if (c.tag) {
        if (c.key != null && String(c.key).indexOf('__vlist') !== 0) {
          children.push(c);
          map[c.key] = c
          ;(c.data || (c.data = {})).transition = transitionData;
        } else {
          var opts = c.componentOptions;
          var name = opts
            ? (opts.Ctor.options.name || opts.tag)
            : c.tag;
          warn(("<transition-group> children must be keyed: <" + name + ">"));
        }
      }
    }

    if (prevChildren) {
      var kept = [];
      var removed = [];
      for (var i$1 = 0; i$1 < prevChildren.length; i$1++) {
        var c$1 = prevChildren[i$1];
        c$1.data.transition = transitionData;
        c$1.data.pos = c$1.elm.getBoundingClientRect();
        if (map[c$1.key]) {
          kept.push(c$1);
        } else {
          removed.push(c$1);
        }
      }
      this.kept = h(tag, null, kept);
      this.removed = removed;
    }

    return h(tag, null, children)
  },

  beforeUpdate: function beforeUpdate () {
    // force removing pass
    this.__patch__(
      this._vnode,
      this.kept,
      false, // hydrating
      true // removeOnly (!important, avoids unnecessary moves)
    );
    this._vnode = this.kept;
  },

  updated: function updated () {
    var children = this.prevChildren;
    var moveClass = this.moveClass || ((this.name || 'v') + '-move');
    if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
      return
    }

    // we divide the work into three loops to avoid mixing DOM reads and writes
    // in each iteration - which helps prevent layout thrashing.
    children.forEach(callPendingCbs);
    children.forEach(recordPosition);
    children.forEach(applyTranslation);

    // force reflow to put everything in position
    var f = document.body.offsetHeight; // eslint-disable-line

    children.forEach(function (c) {
      if (c.data.moved) {
        var el = c.elm;
        var s = el.style;
        addTransitionClass(el, moveClass);
        s.transform = s.WebkitTransform = s.transitionDuration = '';
        el.addEventListener(transitionEndEvent, el._moveCb = function cb (e) {
          if (!e || /transform$/.test(e.propertyName)) {
            el.removeEventListener(transitionEndEvent, cb);
            el._moveCb = null;
            removeTransitionClass(el, moveClass);
          }
        });
      }
    });
  },

  methods: {
    hasMove: function hasMove (el, moveClass) {
      /* istanbul ignore if */
      if (!hasTransition) {
        return false
      }
      if (this._hasMove != null) {
        return this._hasMove
      }
      addTransitionClass(el, moveClass);
      var info = getTransitionInfo(el);
      removeTransitionClass(el, moveClass);
      return (this._hasMove = info.hasTransform)
    }
  }
};

function callPendingCbs (c) {
  /* istanbul ignore if */
  if (c.elm._moveCb) {
    c.elm._moveCb();
  }
  /* istanbul ignore if */
  if (c.elm._enterCb) {
    c.elm._enterCb();
  }
}

function recordPosition (c) {
  c.data.newPos = c.elm.getBoundingClientRect();
}

function applyTranslation (c) {
  var oldPos = c.data.pos;
  var newPos = c.data.newPos;
  var dx = oldPos.left - newPos.left;
  var dy = oldPos.top - newPos.top;
  if (dx || dy) {
    c.data.moved = true;
    var s = c.elm.style;
    s.transform = s.WebkitTransform = "translate(" + dx + "px," + dy + "px)";
    s.transitionDuration = '0s';
  }
}

// 框架预设组件
var platformComponents = {
  Transition: Transition,
  TransitionGroup: TransitionGroup
};

/*  */

// install platform specific utils
Vue$3.config.isUnknownElement = isUnknownElement;
Vue$3.config.isReservedTag = isReservedTag;
Vue$3.config.getTagNamespace = getTagNamespace;
Vue$3.config.mustUseProp = mustUseProp;

// install platform runtime directives & components
// 安装框架运行时预设的指令和组件
extend(Vue$3.options.directives, platformDirectives);
extend(Vue$3.options.components, platformComponents);

// install platform patch function
Vue$3.prototype.__patch__ = inBrowser ? patch$1 : noop;

// wrap mount
Vue$3.prototype.$mount = function (
  el,
  hydrating
) {
  el = el && inBrowser ? query(el) : undefined;
  return this._mount(el, hydrating)
};

if ("development" !== 'production' &&
    inBrowser && typeof console !== 'undefined') {
  console[console.info ? 'info' : 'log'](
    "You are running Vue in development mode.\n" +
    "Make sure to turn on production mode when deploying for production.\n" +
    "See more tips at https://vuejs.org/guide/deployment.html"
  );
}

// devtools global hook
// 工具的全局钩子
/* istanbul ignore next */
setTimeout(function () {
  if (config.devtools) {
    if (devtools) {
      // 含有工具则触发init方法
      devtools.emit('init', Vue$3);
    } else if (
      "development" !== 'production' &&
      inBrowser && !isEdge && /Chrome\/\d+/.test(window.navigator.userAgent)
    ) {
      // 提示下载开发工具
      console[console.info ? 'info' : 'log'](
        'Download the Vue Devtools extension for a better development experience:\n' +
        'https://github.com/vuejs/vue-devtools'
      );
    }
  }
}, 0);

/*  */

// check whether current browser encodes a char inside attribute values
// 检查当前浏览器编码字符是否在属性值中
function shouldDecode (content, encoded) {
  var div = document.createElement('div');
  div.innerHTML = "<div a=\"" + content + "\">";
  return div.innerHTML.indexOf(encoded) > 0
}

// #3663
// IE encodes newlines inside attribute values while other browsers don't
var shouldDecodeNewlines = inBrowser ? shouldDecode('\n', '&#10;') : false;

/*  */

var decoder;

function decode (html) {
  decoder = decoder || document.createElement('div');
  decoder.innerHTML = html;
  return decoder.textContent
}

/*  */
var isUnaryTag = makeMap(
  'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
  'link,meta,param,source,track,wbr',
  true
);

// Elements that you can, intentionally, leave open
// (and which close themselves)
var canBeLeftOpenTag = makeMap(
  'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source',
  true
);

// HTML5 tags https://html.spec.whatwg.org/multipage/indices.html#elements-3
// Phrasing Content https://html.spec.whatwg.org/multipage/dom.html#phrasing-content
var isNonPhrasingTag = makeMap(
  'address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' +
  'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
  'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
  'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' +
  'title,tr,track',
  true
);

/**
 * Not type-checking this file because it's mostly vendor code.
 */

/*!
 * HTML Parser By John Resig (ejohn.org)
 * Modified by Juriy "kangax" Zaytsev
 * Original code by Erik Arvidsson, Mozilla Public License
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 */

// Regular Expressions for parsing tags and attributes
// 解析标签和属性的正则表达式
var singleAttrIdentifier = /([^\s"'<>/=]+)/;
var singleAttrAssign = /(?:=)/;
var singleAttrValues = [
  // attr value double quotes
  /"([^"]*)"+/.source,
  // attr value, single quotes
  /'([^']*)'+/.source,
  // attr value, no quotes
  /([^\s"'=<>`]+)/.source
];
var attribute = new RegExp(
  '^\\s*' + singleAttrIdentifier.source +
  '(?:\\s*(' + singleAttrAssign.source + ')' +
  '\\s*(?:' + singleAttrValues.join('|') + '))?'
);

// could use https://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-QName
// but for Vue templates we can enforce a simple charset
// Vue template 可以执行一个简单的字符集
var ncname = '[a-zA-Z_][\\w\\-\\.]*';
// "((?:[a-zA-Z_][\w\-\.]*\:)?[a-zA-Z_][\w\-\.]*)"
var qnameCapture = '((?:' + ncname + '\\:)?' + ncname + ')';
// /^<((?:[a-zA-Z_][\w\-\.]*\:)?[a-zA-Z_][\w\-\.]*)/
var startTagOpen = new RegExp('^<' + qnameCapture); // 开始标签 标签名称
var startTagClose = /^\s*(\/?)>/; // " />" "/>" " >" ">"
// /^<\/((?:[a-zA-Z_][\w\-\.]*\:)?[a-zA-Z_][\w\-\.]*)[^>]*>/
var endTag = new RegExp('^<\\/' + qnameCapture + '[^>]*>'); // 结束标签
var doctype = /^<!DOCTYPE [^>]+>/i; // DOCTYPE
var comment = /^<!--/; // 注释
var conditionalComment = /^<!\[/; // 注释

var IS_REGEX_CAPTURING_BROKEN = false;
// question 不知道这段代码意义何在
'x'.replace(/x(.)?/g, function (m, g) {
  IS_REGEX_CAPTURING_BROKEN = g === '';
});

// Special Elements (can contain anything)
// 特殊标签
var isScriptOrStyle = makeMap('script,style', true);
// 是否含有语言并且值不为‘html’
var hasLang = function (attr) { return attr.name === 'lang' && attr.value !== 'html'; };

// 是否属于特殊标签
var isSpecialTag = function (tag, isSFC, stack) {
  if (isScriptOrStyle(tag)) {
    return true
  }
  if (isSFC && stack.length === 1) {
    // top-level template that has no pre-processor
    // 顶级模板没有预处理器
    if (tag === 'template' && !stack[0].attrs.some(hasLang)) {
      return false
    } else {
      return true
    }
  }
  return false
};

// reCache缓存对象
var reCache = {};

var ltRE = /&lt;/g;
var gtRE = /&gt;/g;
var nlRE = /&#10;/g;
var ampRE = /&amp;/g;
var quoteRE = /&quot;/g;

/**
 * 属性解码
 * @description 属性解码
 * @param value [需要解码的字符]
 * @param shouldDecodeNewlines [是否应该解码换行符]
 */
function decodeAttr (value, shouldDecodeNewlines) {
  if (shouldDecodeNewlines) {
    value = value.replace(nlRE, '\n');
  }
  return value
    .replace(ltRE, '<')
    .replace(gtRE, '>')
    .replace(ampRE, '&')
    .replace(quoteRE, '"')
}

/**
 * 转换HTML成抽象语法树
 * @description 转换HTML成抽象语法树
 * @param html [html]
 * @param options [解析参数]
 */
function parseHTML (html, options) {
  var stack = [];
  var expectHTML = options.expectHTML;
  var isUnaryTag$$1 = options.isUnaryTag || no;
  var index = 0;
  var last, lastTag;
  while (html) {
    last = html;
    // Make sure we're not in a script or style element
    // 确保不是script或style元素
    if (!lastTag || !isSpecialTag(lastTag, options.sfc, stack)) {
      var textEnd = html.indexOf('<');
      if (textEnd === 0) {
        // Comment: 注释信息
        if (comment.test(html)) {
          var commentEnd = html.indexOf('-->');

          if (commentEnd >= 0) {
            // 重新提取html
            advance(commentEnd + 3);
            continue
          }
        }

        // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
        // 条件注释 在IE中含有主要 <![if !IE]><link href="non-ie.css" rel="stylesheet"><![endif]>
        if (conditionalComment.test(html)) {
          var conditionalEnd = html.indexOf(']>');

          if (conditionalEnd >= 0) {
            advance(conditionalEnd + 2);
            continue
          }
        }

        // Doctype:
        var doctypeMatch = html.match(doctype);
        if (doctypeMatch) {
          advance(doctypeMatch[0].length);
          continue
        }

        // End tag:
        var endTagMatch = html.match(endTag);
        if (endTagMatch) {
          var curIndex = index;
          advance(endTagMatch[0].length);
          parseEndTag(endTagMatch[0], endTagMatch[1], curIndex, index);
          continue
        }

        // Start tag:
        var startTagMatch = parseStartTag();
        if (startTagMatch) {
          handleStartTag(startTagMatch);
          continue
        }
      }

      var text = (void 0), rest$1 = (void 0), next = (void 0);
      if (textEnd > 0) {
        rest$1 = html.slice(textEnd);
        while (
          !endTag.test(rest$1) &&
          !startTagOpen.test(rest$1) &&
          !comment.test(rest$1) &&
          !conditionalComment.test(rest$1)
        ) {
          // < in plain text, be forgiving and treat it as text
          next = rest$1.indexOf('<', 1);
          if (next < 0) { break }
          textEnd += next;
          rest$1 = html.slice(textEnd);
        }
        text = html.substring(0, textEnd);
        advance(textEnd);
      }

      if (textEnd < 0) {
        text = html;
        html = '';
      }

      if (options.chars && text) {
        options.chars(text);
      }
    } else {
      var stackedTag = lastTag.toLowerCase();
      var reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'));
      var endTagLength = 0;
      var rest = html.replace(reStackedTag, function (all, text, endTag) {
        endTagLength = endTag.length;
        if (stackedTag !== 'script' && stackedTag !== 'style' && stackedTag !== 'noscript') {
          text = text
            .replace(/<!--([\s\S]*?)-->/g, '$1')
            .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1');
        }
        if (options.chars) {
          options.chars(text);
        }
        return ''
      });
      index += html.length - rest.length;
      html = rest;
      parseEndTag('</' + stackedTag + '>', stackedTag, index - endTagLength, index);
    }

    if (html === last && options.chars) {
      options.chars(html);
      break
    }
  }

  // Clean up any remaining tags
  // 清理任何剩余的标签
  parseEndTag();
  
  // 提取html
  function advance (n) {
    index += n;
    html = html.substring(n);
  }

  function parseStartTag () {
    var start = html.match(startTagOpen);
    if (start) {
      var match = {
        tagName: start[1],
        attrs: [],
        start: index
      };
      advance(start[0].length);
      var end, attr;
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        advance(attr[0].length);
        match.attrs.push(attr);
      }
      if (end) {
        match.unarySlash = end[1];
        advance(end[0].length);
        match.end = index;
        return match
      }
    }
  }

  function handleStartTag (match) {
    var tagName = match.tagName;
    var unarySlash = match.unarySlash;

    if (expectHTML) {
      if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
        parseEndTag('', lastTag);
      }
      if (canBeLeftOpenTag(tagName) && lastTag === tagName) {
        parseEndTag('', tagName);
      }
    }

    var unary = isUnaryTag$$1(tagName) || tagName === 'html' && lastTag === 'head' || !!unarySlash;

    var l = match.attrs.length;
    var attrs = new Array(l);
    for (var i = 0; i < l; i++) {
      var args = match.attrs[i];
      // hackish work around FF bug https://bugzilla.mozilla.org/show_bug.cgi?id=369778
      if (IS_REGEX_CAPTURING_BROKEN && args[0].indexOf('""') === -1) {
        if (args[3] === '') { delete args[3]; }
        if (args[4] === '') { delete args[4]; }
        if (args[5] === '') { delete args[5]; }
      }
      var value = args[3] || args[4] || args[5] || '';
      attrs[i] = {
        name: args[1],
        value: decodeAttr(
          value,
          options.shouldDecodeNewlines
        )
      };
    }

    if (!unary) {
      stack.push({ tag: tagName, attrs: attrs });
      lastTag = tagName;
      unarySlash = '';
    }

    if (options.start) {
      options.start(tagName, attrs, unary, match.start, match.end);
    }
  }

  function parseEndTag (tag, tagName, start, end) {
    var pos;
    if (start == null) { start = index; }
    if (end == null) { end = index; }

    // Find the closest opened tag of the same type
    if (tagName) {
      var needle = tagName.toLowerCase();
      for (pos = stack.length - 1; pos >= 0; pos--) {
        if (stack[pos].tag.toLowerCase() === needle) {
          break
        }
      }
    } else {
      // If no tag name is provided, clean shop
      // 如果没有提供标签名称则清除仓库
      pos = 0;
    }

    if (pos >= 0) {
      // Close all the open elements, up the stack
      for (var i = stack.length - 1; i >= pos; i--) {
        if (options.end) {
          options.end(stack[i].tag, start, end);
        }
      }

      // Remove the open elements from the stack
      stack.length = pos;
      lastTag = pos && stack[pos - 1].tag;
    } else if (tagName.toLowerCase() === 'br') {
      if (options.start) {
        options.start(tagName, [], true, start, end);
      }
    } else if (tagName.toLowerCase() === 'p') {
      if (options.start) {
        options.start(tagName, [], false, start, end);
      }
      if (options.end) {
        options.end(tagName, start, end);
      }
    }
  }
}

/*  */
/**
 * 解析过滤器
 * @description 解析过滤器
 * @param exp [表达式]
 */
function parseFilters (exp) {
  var inSingle = false; // '
  var inDouble = false; // "
  var inTemplateString = false; // '
  var inRegex = false; // 正则
  var curly = 0; // {}
  var square = 0; // []
  var paren = 0; // ()
  var lastFilterIndex = 0; // 过滤索引
  var c, prev, i, expression, filters;
  // charCodeAt,上一个,i,表达式,过滤器

  // 0x27 39 [']
  // 0x22 34 ["]
  // 0x5C 92 [\]
  // 0x60 96 [`]
  // 0x2f 47 [/]
  // 0x7C 124 [|]
  for (i = 0; i < exp.length; i++) {
    prev = c;
    c = exp.charCodeAt(i);
    if (inSingle) {
      if (c === 0x27 && prev !== 0x5C) { inSingle = false; }
    } else if (inDouble) {
      if (c === 0x22 && prev !== 0x5C) { inDouble = false; }
    } else if (inTemplateString) {
      if (c === 0x60 && prev !== 0x5C) { inTemplateString = false; }
    } else if (inRegex) {
      if (c === 0x2f && prev !== 0x5C) { inRegex = false; }
    } else if (
      c === 0x7C && // pipe
      exp.charCodeAt(i + 1) !== 0x7C &&
      exp.charCodeAt(i - 1) !== 0x7C &&
      !curly && !square && !paren
    ) {
      if (expression === undefined) {
        // first filter, end of expression
        lastFilterIndex = i + 1;
        expression = exp.slice(0, i).trim();
      } else {
        pushFilter();
      }
    } else {
      switch (c) {
        case 0x22: inDouble = true; break         // 34 "
        case 0x27: inSingle = true; break         // 39 '
        case 0x60: inTemplateString = true; break // 96 `
        case 0x28: paren++; break                 // 40 (
        case 0x29: paren--; break                 // 41 )
        case 0x5B: square++; break                // 91 [
        case 0x5D: square--; break                // 93 ]
        case 0x7B: curly++; break                 // 123 {
        case 0x7D: curly--; break                 // 135 }
      }
      if (c === 0x2f) { // /
        var j = i - 1;
        var p = (void 0);
        // find first non-whitespace prev char
        // 找到的第一个非空白字符
        for (; j >= 0; j--) {
          p = exp.charAt(j);
          if (p !== ' ') { break }
        }
        if (!p || !/[\w$]/.test(p)) {
          inRegex = true;
        }
      }
    }
  }

  if (expression === undefined) {
    expression = exp.slice(0, i).trim();
  } else if (lastFilterIndex !== 0) {
    pushFilter();
  }

  function pushFilter () {
    (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim());
    lastFilterIndex = i + 1;
  }

  if (filters) {
    for (i = 0; i < filters.length; i++) {
      expression = wrapFilter(expression, filters[i]);
    }
  }

  return expression
}

function wrapFilter (exp, filter) {
  var i = filter.indexOf('(');
  if (i < 0) {
    // _f: resolveFilter
    return ("_f(\"" + filter + "\")(" + exp + ")")
  } else {
    var name = filter.slice(0, i);
    var args = filter.slice(i + 1);
    return ("_f(\"" + name + "\")(" + exp + "," + args)
  }
}

/*  */
// 分隔符正则
var defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g;
// 特殊字符正则
var regexEscapeRE = /[-.*+?^${}()|[\]/\\]/g;
// 绑定客户自定义解析正则
var buildRegex = cached(function (delimiters) {
  // 左标签
  var open = delimiters[0].replace(regexEscapeRE, '\\$&');
  // 右标签
  var close = delimiters[1].replace(regexEscapeRE, '\\$&');
  return new RegExp(open + '((?:.|\\n)+?)' + close, 'g')
});

/**
 * 解析文本
 * @description 解析文本
 * @param text [文本]
 * @param delimiters [分隔符]
 */
function parseText (
  text,
  delimiters
) {
  // 把用户自定义的分隔符注册成正则或者采用默认正则
  /**
   * 例如 text = "{{name}} say {{content}}"
   * 结果为：_s(name)+" say "+_s(content)
   */
  var tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE;
  if (!tagRE.test(text)) {
    return
  }
  var tokens = [];
  var lastIndex = tagRE.lastIndex = 0;
  var match, index;
  while ((match = tagRE.exec(text))) {
    index = match.index;
    // push text token
    if (index > lastIndex) {
      tokens.push(JSON.stringify(text.slice(lastIndex, index)));
    }
    // tag token
    var exp = parseFilters(match[1].trim());
    tokens.push(("_s(" + exp + ")"));
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) {
    tokens.push(JSON.stringify(text.slice(lastIndex)));
  }
  return tokens.join('+')
}

/*  */
/**
 * 打印Vue中调用parser方法中的信息
 */
function baseWarn (msg) {
  console.error(("[Vue parser]: " + msg));
}

/**
 * 获取modules中含有key的模块，返回的是数组
 * @description 获取modules中含有key的模块，返回的是数组
 * @param modules [modules]
 * @param key [key]
 */
function pluckModuleFunction (
  modules,
  key
) {
  // 调用map会返回一个数组[null,null,obj,null,obj];
  // 调用filter后会返回[obj,obj];
  return modules
    ? modules.map(function (m) { return m[key]; }).filter(function (_) { return _; })
    : []
}

/**
 * prop 是父组件用来传递数据的一个自定义属性
 * 为元素添加props属性
 * @description 为元素添加props属性
 * @param el [element]
 * @param name [属性名称]
 * @param value [属性值]
 */
function addProp (el, name, value) {
  (el.props || (el.props = [])).push({ name: name, value: value });
}

/**
 * 为元素添加属性
 * @description 为元素添加属性
 * @param el [element]
 * @param name [属性名称]
 * @param value [属性值]
 */
function addAttr (el, name, value) {
  (el.attrs || (el.attrs = [])).push({ name: name, value: value });
}

/**
 * 为元素添加指令
 * @description 为元素添加指令
 * @param el [element]
 * @param name [指令名称]
 * @param rawName [标签上的属性名称]
 * @param value [expression]
 * @param arg [arguments]
 * @param modifiers [修饰信息]
 */
function addDirective (
  el,
  name,
  rawName,
  value,
  arg,
  modifiers
) {
  (el.directives || (el.directives = [])).push({ name: name, rawName: rawName, value: value, arg: arg, modifiers: modifiers });
}

/**
 * 为元素添加处理函数
 * @description 为元素添加处理函数
 * @param el [element]
 * @param name [事件名称]
 * @param value [事件处理函数]
 * @param modifiers [事件修饰信息]
 * @param important [事件的重要性 默认为false]
 */
function addHandler (
  el,
  name,
  value,
  modifiers,
  important
) {
  // check capture modifier
  // 检查捕获修饰符
  if (modifiers && modifiers.capture) {
    delete modifiers.capture;
    // 将事件标记为捕获
    name = '!' + name; // mark the event as captured
  }
  if (modifiers && modifiers.once) {
    delete modifiers.once;
    // 将事件标记为一次事件
    name = '~' + name; // mark the event as once
  }
  var events;
  if (modifiers && modifiers.native) {
    delete modifiers.native;
    events = el.nativeEvents || (el.nativeEvents = {});
  } else {
    events = el.events || (el.events = {});
  }
  var newHandler = { value: value, modifiers: modifiers };
  var handlers = events[name];
  /* istanbul ignore if */
  if (Array.isArray(handlers)) {
    important ? handlers.unshift(newHandler) : handlers.push(newHandler);
  } else if (handlers) {
    events[name] = important ? [newHandler, handlers] : [handlers, newHandler];
  } else {
    events[name] = newHandler;
  }
}

/**
 * 得到绑定的属性
 * @description 得到绑定的属性
 * @param el [element]
 * @param name [name]
 * @param getStatic [Boolean]
 */
function getBindingAttr (
  el,
  name,
  getStatic
) {
  // 动态值 :name v-bind:name
  var dynamicValue =
    getAndRemoveAttr(el, ':' + name) ||
    getAndRemoveAttr(el, 'v-bind:' + name);
  if (dynamicValue != null) {
    return parseFilters(dynamicValue)
  } else if (getStatic !== false) {
    var staticValue = getAndRemoveAttr(el, name);
    if (staticValue != null) {
      return JSON.stringify(staticValue)
    }
  }
}

/**
 * 得到属性值并且删除属性
 * @description 得到属性值并且删除属性
 * @param el [element]
 * @param name [name]
 */
function getAndRemoveAttr (el, name) {
  var val;
  if ((val = el.attrsMap[name]) != null) {
    var list = el.attrsList;
    for (var i = 0, l = list.length; i < l; i++) {
      if (list[i].name === name) {
        list.splice(i, 1);
        break
      }
    }
  }
  return val
}

var len;
var str;
var chr;
var index$1;
var expressionPos;
var expressionEndPos;

/**
 * parse directive model to do the array update transform. a[idx] = val => $$a.splice($$idx, 1, val)
 *
 * for loop possible cases:
 *
 * - test
 * - test[idx]
 * - test[test1[idx]]
 * - test["a"][idx]
 * - xxx.test[a[a].test1[idx]]
 * - test.xxx.a["asa"][test1[idx]]
 *
 */

/**
 * 解析v-model指令进行数组转换
 * @description 解析v-model指令进行数组转换
 * @param val [表达式]
 */
function parseModel (val) {
  str = val;
  len = str.length;
  index$1 = expressionPos = expressionEndPos = 0;

  if (val.indexOf('[') < 0 || val.lastIndexOf(']') < len - 1) {
    return {
      exp: val,
      idx: null
    }
  }

  while (!eof()) {
    chr = next();
    /* istanbul ignore if */
    if (isStringStart(chr)) {
      parseString(chr);
    } else if (chr === 0x5B) {
      // 0x5B [
      parseBracket(chr);
    }
  }

  /**
   * 解析结果举例，
   * val = "a.b.c" return {exp:"a.b.c",idx:null}
   * val = "a.b["c"]" return {exp:"a.b",idx:""c"}
   * val = "a.b[c].b[x]" return {exp:"a.b[c].b",idx:"x"}
   */
  return {
    exp: val.substring(0, expressionPos),
    idx: val.substring(expressionPos + 1, expressionEndPos)
  }
}

/**
 * 返回字符串中字符的Unicode编码
 * @description 返回字符串中字符的Unicode编码
 */
function next () {
  return str.charCodeAt(++index$1)
}

/**
 * 判断是否属于字符串的结尾
 * @description 判断是否属于字符串的结尾
 */
function eof () {
  return index$1 >= len
}

/**
 * 判断是否属于字符串开始
 * @description 判断是否属于字符串开始
 * @param chr [chr]
 */
function isStringStart (chr) {
  // 主要解析 
  // 0x27 39 [']
  // 0x22 34 ["]
  return chr === 0x22 || chr === 0x27
}

/**
 * 解析大括号
 * @description 解析大括号
 * @param chr [chr]
 */
function parseBracket (chr) {
  var inBracket = 1;
  // 主要解析0x5B 91 [,0x5D 93 ]
  expressionPos = index$1;
  while (!eof()) {
    chr = next();
    if (isStringStart(chr)) {
      parseString(chr);
      continue
    }
    if (chr === 0x5B) { inBracket++; }
    if (chr === 0x5D) { inBracket--; }
    if (inBracket === 0) {
      expressionEndPos = index$1;
      break
    }
  }
}

/**
 * 解析字符串
 * @description 解析字符串
 * @param chr [char]
 */
function parseString (chr) {
  var stringQuote = chr;
  while (!eof()) {
    chr = next();
    if (chr === stringQuote) {
      break
    }
  }
}

/*  */

var dirRE = /^v-|^@|^:/; // 绑定标志
var forAliasRE = /(.*?)\s+(?:in|of)\s+(.*)/; // v-for 指令的正则
var forIteratorRE = /\((\{[^}]*\}|[^,]*),([^,]*)(?:,([^,]*))?\)/; // v-for 别名的正则
var bindRE = /^:|^v-bind:/; // 数据绑定正则
var onRE = /^@|^v-on:/; // 事件绑定正则
var argRE = /:(.*)$/; // 参数正则
var modifierRE = /\.[^.]+/g; // 修饰符正则

var decodeHTMLCached = cached(decode);

// configurable state
// 可配置状态
var warn$1;
var platformGetTagNamespace;
var platformMustUseProp;
var platformIsPreTag;
var preTransforms;
var transforms;
var postTransforms;
var delimiters; // 分隔符

/**
 * Convert HTML string to AST.
 * 把HTML字符串转换成抽象语法树
 * AST : 抽象语法树（Abstract Syntax Tree）也称为AST语法树，
 * 指的是源代码语法所对应的树状结构。也就是说，对于一种具体编程语言下的源代码，
 * 通过构建语法树的形式将源代码中的语句映射到树中的每一个节点上。 
 */
function parse (
  template,
  options
) {
  // 警告信息的配置方法
  warn$1 = options.warn || baseWarn;
  // 得到Tag的命名空间
  platformGetTagNamespace = options.getTagNamespace || no;
  platformMustUseProp = options.mustUseProp || no;
  platformIsPreTag = options.isPreTag || no;

  preTransforms = pluckModuleFunction(options.modules, 'preTransformNode');
  transforms = pluckModuleFunction(options.modules, 'transformNode');
  postTransforms = pluckModuleFunction(options.modules, 'postTransformNode');
  delimiters = options.delimiters;
  // 
  var stack = [];
  var preserveWhitespace = options.preserveWhitespace !== false;
  var root;
  var currentParent;
  var inVPre = false;
  var inPre = false;
  var warned = false;
  parseHTML(template, {
    expectHTML: options.expectHTML,
    isUnaryTag: options.isUnaryTag,
    shouldDecodeNewlines: options.shouldDecodeNewlines,
    start: function start (tag, attrs, unary) {
      // check namespace. 检查命名空间
      // inherit parent ns if there is one 
      // 如果只有一个继承父级的命名空间
      var ns = (currentParent && currentParent.ns) || platformGetTagNamespace(tag);

      // handle IE svg bug 处理IE中SVG的bug
      /* istanbul ignore if */
      if (isIE && ns === 'svg') {
        attrs = guardIESVGBug(attrs);
      }

      var element = {
        type: 1,
        tag: tag,
        attrsList: attrs,
        attrsMap: makeAttrsMap(attrs),
        parent: currentParent,
        children: []
      };
      // 添加命名空间
      if (ns) {
        element.ns = ns;
      }

      // 属于禁止标签元素并且不是在服务端渲染
      if (isForbiddenTag(element) && !isServerRendering()) {
        // 标记元素被禁止
        element.forbidden = true;
        // 模板应该只负责将状态映射到用户界面.。避免在模板中放置有副作用的标签，因为它们不会被解析.。
        // style script 标签是不会被解析的
        "development" !== 'production' && warn$1(
          'Templates should only be responsible for mapping the state to the ' +
          'UI. Avoid placing tags with side-effects in your templates, such as ' +
          "<" + tag + ">" + ', as they will not be parsed.'
        );
      }

      // apply pre-transforms
      for (var i = 0; i < preTransforms.length; i++) {
        preTransforms[i](element, options);
      }

      if (!inVPre) {
        // 处理Pre指令
        processPre(element);
        if (element.pre) {
          inVPre = true;
        }
      }
      if (platformIsPreTag(element.tag)) {
        inPre = true;
      }
      if (inVPre) {
        processRawAttrs(element);
      } else {
        // 处理 v-for指令
        processFor(element);
        // 处理 v-if,v-else,v-else-if指令
        processIf(element);
        // 处理 v-once指令
        processOnce(element);
        // 处理key指令
        processKey(element);

        // determine whether this is a plain element after
        // removing structural attributes
        // 在移除结构属性之后确定这是否是一个普通元素
        element.plain = !element.key && !attrs.length;
        // 处理ref指令
        processRef(element);
        // 处理solt指令
        processSlot(element);
        // 处理Component指令
        processComponent(element);
        // question 这里获取属于动画事件的绑定 只是猜测
        for (var i$1 = 0; i$1 < transforms.length; i$1++) {
          transforms[i$1](element, options);
        }
        // 处理其它属性
        processAttrs(element);
      }

      /**
       * 检查root限制条件
       * @description 检查root限制条件
       * @param el [element]
       */
      function checkRootConstraints (el) {
        if ("development" !== 'production' && !warned) {
          // 不能使用slot或者template作为根元素组件上，因为它或许包含多个节点
          if (el.tag === 'slot' || el.tag === 'template') {
            warned = true;
            warn$1(
              "Cannot use <" + (el.tag) + "> as component root element because it may " +
              'contain multiple nodes:\n' + template
            );
          }
          // 不能使用v-for状态组件的作用在根元素上，因为它渲染多个元素
          if (el.attrsMap.hasOwnProperty('v-for')) {
            warned = true;
            warn$1(
              'Cannot use v-for on stateful component root element because ' +
              'it renders multiple elements:\n' + template
            );
          }
        }
      }

      // tree management 管理树
      if (!root) {
        root = element;
        checkRootConstraints(root);
      } else if (!stack.length) {
        // allow root elements with v-if, v-else-if and v-else
        // 运行根元素用v-if,v-else-if和v-else指令
        if (root.if && (element.elseif || element.else)) {
          checkRootConstraints(element);
          addIfCondition(root, {
            exp: element.elseif,
            block: element
          });
        } else if ("development" !== 'production' && !warned) {
          // 组件模板应该包含一个有效的根元素
          // 如果你把v-if用在了多个元素上，请使用v-else-if代替它们。
          warned = true;
          warn$1(
            "Component template should contain exactly one root element:" +
            "\n\n" + template + "\n\n" +
            "If you are using v-if on multiple elements, " +
            "use v-else-if to chain them instead."
          );
        }
      }

      if (currentParent && !element.forbidden) {
        if (element.elseif || element.else) {
          processIfConditions(element, currentParent);
        } else if (element.slotScope) { // scoped slot
          currentParent.plain = false;
          var name = element.slotTarget || 'default';(currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element;
        } else {
          currentParent.children.push(element);
          element.parent = currentParent;
        }
      }
      if (!unary) {
        currentParent = element;
        stack.push(element);
      }
      // apply post-transforms
      for (var i$2 = 0; i$2 < postTransforms.length; i$2++) {
        postTransforms[i$2](element, options);
      }
    },

    end: function end () {
      // remove trailing whitespace 删除空白符
      // stack数组中的最后一个元素
      var element = stack[stack.length - 1];
      // element子元素的最后一个元素
      var lastNode = element.children[element.children.length - 1];
      if (lastNode && lastNode.type === 3 && lastNode.text === ' ') {
        element.children.pop();
      }
      // pop stack 移除最后一个元素
      stack.length -= 1;
      // stack数组中的倒数第二个元素，目前值的最后一个元素
      currentParent = stack[stack.length - 1];
      // check pre state 检查pre状态
      if (element.pre) {
        inVPre = false;
      }
      if (platformIsPreTag(element.tag)) {
        inPre = false;
      }
    },

    chars: function chars (text) {
      if (!currentParent) {
        if ("development" !== 'production' && !warned && text === template) {
          warned = true;
          // 组件模板需要一个根元素，而不仅仅是文本
          warn$1(
            'Component template requires a root element, rather than just text:\n\n' + template
          );
        }
        return
      }
      // IE textarea placeholder bug
      /* istanbul ignore if */
      if (isIE &&
          currentParent.tag === 'textarea' &&
          currentParent.attrsMap.placeholder === text) {
        return
      }
      var children = currentParent.children;
      text = inPre || text.trim()
        ? decodeHTMLCached(text)
        // only preserve whitespace if its not right after a starting tag
        // 如果不在开始标签只保存空白符
        : preserveWhitespace && children.length ? ' ' : '';
      if (text) {
        var expression;
        if (!inVPre && text !== ' ' && (expression = parseText(text, delimiters))) {
          // 含有表达式
          children.push({
            type: 2,
            expression: expression,
            text: text
          });
        } else if (text !== ' ' || children[children.length - 1].text !== ' ') {
          currentParent.children.push({
            type: 3,
            text: text
          });
        }
      }
    }
  });
  return root
}

/**
 * 处理Pre指令
 * 跳过这个元素和它的子元素的编译过程。可以用来显示原始 Mustache 标签。跳过大量没有指令的节点会加快编译。
 * @description 处理Pre指令
 * @param el [element]
 */
function processPre (el) {
  if (getAndRemoveAttr(el, 'v-pre') != null) {
    el.pre = true;
  }
}

function processRawAttrs (el) {
  var l = el.attrsList.length;
  if (l) {
    var attrs = el.attrs = new Array(l);
    for (var i = 0; i < l; i++) {
      attrs[i] = {
        name: el.attrsList[i].name,
        value: JSON.stringify(el.attrsList[i].value)
      };
    }
  } else if (!el.pre) {
    // non root node in pre blocks with no attributes
    el.plain = true;
  }
}

/**
 * 处理特殊元素key
 * @description 处理特殊元素key
 * @param el [element ]
 */
function processKey (el) {
  var exp = getBindingAttr(el, 'key');
  if (exp) {
    if ("development" !== 'production' && el.tag === 'template') {
      warn$1("<template> cannot be keyed. Place the key on real elements instead.");
    }
    el.key = exp;
  }
}

/**
 * 处理ref指令
 * @description 处理ref指令
 * @param el [element]
 */
function processRef (el) {
  var ref = getBindingAttr(el, 'ref');
  if (ref) {
    el.ref = ref;
    el.refInFor = checkInFor(el);
  }
}

/**
 * 处理v-for指令
 * @description 处理v-for指令
 * @param el [element]
 */
function processFor (el) {
  var exp;
  // 得到v-for指令的内容，并在元素上删除v-for属性
  if ((exp = getAndRemoveAttr(el, 'v-for'))) {
    var inMatch = exp.match(forAliasRE);
    // 运用正则表达式获取对象和别名
    // ["(val,key,index) in obj", "(val,key,index)", "obj"]
    if (!inMatch) {
      "development" !== 'production' && warn$1(
        ("Invalid v-for expression: " + exp)
      );
      return
    }
    // 元素绑定的对象
    el.for = inMatch[2].trim();
    // 需要遍历的别名
    var alias = inMatch[1].trim();
    var iteratorMatch = alias.match(forIteratorRE);
    // 运用正则获取别名中含有的参数
    //["(val,key,index)", "val", "key", "index"]
    if (iteratorMatch) {
      el.alias = iteratorMatch[1].trim(); // 别名
      el.iterator1 = iteratorMatch[2].trim(); // 第二个参数
      if (iteratorMatch[3]) {
        el.iterator2 = iteratorMatch[3].trim(); // 第三个参数
      }
    } else {
      el.alias = alias;
    }
  }
}

/**
 * 处理v-if指令
 */
function processIf (el) {
  var exp = getAndRemoveAttr(el, 'v-if');
  if (exp) {
    el.if = exp;
    addIfCondition(el, {
      exp: exp,
      block: el
    });
  } else {
    if (getAndRemoveAttr(el, 'v-else') != null) {
      el.else = true;
    }
    var elseif = getAndRemoveAttr(el, 'v-else-if');
    if (elseif) {
      el.elseif = elseif;
    }
  }
}

/**
 * 处理if条件
 * @description 处理if条件
 * @param el [elment]
 * @param parent [parent element]
 */
function processIfConditions (el, parent) {
  var prev = findPrevElement(parent.children);
  if (prev && prev.if) {
    addIfCondition(prev, {
      exp: el.elseif,
      block: el
    });
  } else {
    warn$1(
      "v-" + (el.elseif ? ('else-if="' + el.elseif + '"') : 'else') + " " +
      "used on element <" + (el.tag) + "> without corresponding v-if."
    );
  }
}

/**
 * 查找上个元素
 * @description 查找上个元素
 * @param children [子元素] 
 */
function findPrevElement (children) {
  var i = children.length;
  while (i--) {
    if (children[i].type === 1) {
      return children[i]
    } else {
      if ("development" !== 'production' && children[i].text !== ' ') {
        warn$1(
          "text \"" + (children[i].text.trim()) + "\" between v-if and v-else(-if) " +
          "will be ignored."
        );
      }
      // 删除子元素
      children.pop();
    }
  }
}

/**
 * 添加if条件
 * @description 添加if条件
 * @param el [element]
 * @param condition [条件]
 */
function addIfCondition (el, condition) {
  if (!el.ifConditions) {
    el.ifConditions = [];
  }
  el.ifConditions.push(condition);
}

/**
 * 处理v-once指令
 * 只渲染元素和组件一次。随后的重新渲染,元素/组件及其所有的子节点将被视为静态内容并跳过。这可以用于优化更新性能。
 * @description 处理v-once指令
 * @param el [element]
 */
function processOnce (el) {
  var once = getAndRemoveAttr(el, 'v-once');
  if (once != null) {
    el.once = true;
  }
}

/**
 * 处理solt指令
 * @description 处理solt指令
 * @param el [element]
 */
function processSlot (el) {
  if (el.tag === 'slot') {
    el.slotName = getBindingAttr(el, 'name');
    if ("development" !== 'production' && el.key) {
      warn$1(
        "`key` does not work on <slot> because slots are abstract outlets " +
        "and can possibly expand into multiple elements. " +
        "Use the key on a wrapping element instead."
      );
    }
  } else {
    // 获取需要填充的位置
    var slotTarget = getBindingAttr(el, 'slot');
    if (slotTarget) {
      el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget;
    }
    if (el.tag === 'template') {
      // 作用域插槽
      el.slotScope = getAndRemoveAttr(el, 'scope');
    }
  }
}

/**
 * 处理Component指令
 * @description 处理Component指令
 * @param el [element]
 */
function processComponent (el) {
  var binding;
  // 渲染一个“元组件”为动态组件。依 is 的值，来决定哪个组件被渲染。
  // 动态组件由 vm 实例的属性值 `componentId` 控制
  // 也能够渲染注册过的组件或 prop 传入的组件
  if ((binding = getBindingAttr(el, 'is'))) {
    el.component = binding;
  }
  // 
  if (getAndRemoveAttr(el, 'inline-template') != null) {
    el.inlineTemplate = true;
  }
}

/**
 * 处理其它属性
 * @description 处理其它属性
 * @param el [element]
 */
function processAttrs (el) {
  var list = el.attrsList;
  var i, l, name, rawName, value, arg, modifiers, isProp;
  for (i = 0, l = list.length; i < l; i++) {
    name = rawName = list[i].name;
    value = list[i].value;
    if (dirRE.test(name)) {
      // mark element as dynamic
      // 标记元素为动态数据绑定
      el.hasBindings = true;
      // modifiers
      // 绑定事件举例 v-on:click.important
      // 那么得到的modifiers = {important:true}
      modifiers = parseModifiers(name);
      if (modifiers) {
        // 替换name name= "v-on:click" 
        name = name.replace(modifierRE, '');
      }

      if (bindRE.test(name)) { // v-bind
        // 例如 v-bind:text-content.prop
        // 经过parseModifiers方法处理后 name = "v-bind:text-content"
        // 然后再经过替换 name = "text-content"
        name = name.replace(bindRE, '');
        // 解析成表达式
        value = parseFilters(value);
        isProp = false;
        // 进行modifiers判定
        if (modifiers) {
          if (modifiers.prop) {
            isProp = true;
            // 含有拼接“-”的字符串转换成驼峰 name = tetxContent
            name = camelize(name);
            if (name === 'innerHtml') { name = 'innerHTML'; }
          }
          if (modifiers.camel) {
            name = camelize(name);
          }
        }
        if (isProp || platformMustUseProp(el.tag, name)) {
          // 添加引用属性
          addProp(el, name, value);
        } else {
          // 添加属性
          addAttr(el, name, value);
        }
      } else if (onRE.test(name)) { // v-on
        // 为元素绑定事件
        // @click="sayHello" 或者v-on:click="sayHello"
        // name 替换为click value 为sayHello
        name = name.replace(onRE, '');
        addHandler(el, name, value, modifiers);
      } else { // normal directives
        // 默认为指令
        // 例如 v-demo="{ color: 'white', text: 'hello!' }"
        // 结果 name = "demo"
        name = name.replace(dirRE, '');
        // parse arg 解析参数
        // 例如 v-demo:hello.a.b="message"
        // 经过parseModifiers替换 name = "v-demo:hello";
        var argMatch = name.match(argRE);
        // argMatch = [":hello", "hello"];
        // arg = "hello"; name经过slice方法后 name="demo"" modifiers = {a: true, b: true}
        // v-demo="{ color: 'white', text: 'hello!' }" 不会进入此判断
        if (argMatch && (arg = argMatch[1])) {  
          name = name.slice(0, -(arg.length + 1));
        }
        // 添加指令
        addDirective(el, name, rawName, value, arg, modifiers);
        if ("development" !== 'production' && name === 'model') {
          checkForAliasModel(el, value);
        }
      }
    } else {
      // literal attribute
      // 文字属性
      {
        var expression = parseText(value, delimiters);
        if (expression) {
          warn$1(
            name + "=\"" + value + "\": " +
            'Interpolation inside attributes has been removed. ' +
            'Use v-bind or the colon shorthand instead. For example, ' +
            'instead of <div id="{{ val }}">, use <div :id="val">.'
          );
        }
      }
      addAttr(el, name, JSON.stringify(value));
      // #4530 also bind special attributes as props even if they are static
      // so that patches between dynamic/static are consistent
      // 还绑定特殊属性作为props，即使它们是静态的，使动态/静态之间的patches是一致的
      if (platformMustUseProp(el.tag, name)) {
        if (name === 'value') {
          addProp(el, name, JSON.stringify(value));
        } else {
          addProp(el, name, 'true');
        }
      }
    }
  }
}

/**
 * 检测是否在for指令中
 */
function checkInFor (el) {
  var parent = el;
  while (parent) {
    if (parent.for !== undefined) {
      return true
    }
    parent = parent.parent;
  }
  return false
}

/**
 * 解析修饰信息
 * @description 解析修饰信息
 * @param name [属性名称]
 */
function parseModifiers (name) {
  var match = name.match(modifierRE);
  if (match) {
    var ret = {};
    match.forEach(function (m) { ret[m.slice(1)] = true; });
    return ret
  }
}

/**
 * 创建属性Map
 */
function makeAttrsMap (attrs) {
  var map = {};
  for (var i = 0, l = attrs.length; i < l; i++) {
    // 避免重复属性
    // question 如果atrrs.name的值为null的情况出现重复的就不会触发此提醒
    if ("development" !== 'production' && map[attrs[i].name] && !isIE) {
      warn$1('duplicate attribute: ' + attrs[i].name);
    }
    map[attrs[i].name] = attrs[i].value;
  }
  return map
}

/**
 * 检验元素是否属于被禁止的标签
 */
function isForbiddenTag (el) {
  return (
    el.tag === 'style' ||
    (el.tag === 'script' && (
      !el.attrsMap.type ||
      el.attrsMap.type === 'text/javascript'
    ))
  )
}

var ieNSBug = /^xmlns:NS\d+/;
var ieNSPrefix = /^NS\d+:/;

/* istanbul ignore next */
/**
 * 监视IE中SVG的bug
 */
function guardIESVGBug (attrs) {
  var res = [];
  for (var i = 0; i < attrs.length; i++) {
    var attr = attrs[i];
    if (!ieNSBug.test(attr.name)) {
      attr.name = attr.name.replace(ieNSPrefix, '');
      res.push(attr);
    }
  }
  return res
}

/**
 * 检查model是否为在for循环里并且等于元素的别名
 * @description 检查model是否为在for循环里并且等于元素的别名
 * @param el [element]
 */
function checkForAliasModel (el, value) {
  var _el = el;
  while (_el) {
    if (_el.for && _el.alias === value) {
      warn$1(
        "<" + (el.tag) + " v-model=\"" + value + "\">: " +
        "You are binding v-model directly to a v-for iteration alias. " +
        "This will not be able to modify the v-for source array because " +
        "writing to the alias is like modifying a function local variable. " +
        "Consider using an array of objects and use v-model on an object property instead."
      );
    }
    _el = _el.parent;
  }
}

/*  */

var isStaticKey;
var isPlatformReservedTag;

var genStaticKeysCached = cached(genStaticKeys$1);

/**
 * Goal of the optimizer: walk the generated template AST tree
 * and detect sub-trees that are purely static, i.e. parts of
 * the DOM that never needs to change.
 *
 * Once we detect these sub-trees, we can:
 *
 * 1. Hoist them into constants, so that we no longer need to
 *    create fresh nodes for them on each re-render;
 * 2. Completely skip them in the patching process.
 * 
 * optimize 优化
 * 
 * 优化器的目标：走的模板生成AST树，如发现是纯粹的静态子树，例如DMO部分从不需要改变
 * 
 * 一旦我们检测到这些子树，我们可以：
 * 
 * 1.将它们提升为常量，这样我们就不再需要为它们创建新节点并在每个节点重新渲染.
 * 2.在修补程序中完全跳过他们
 */

/**
 * 优化
 * @description 优化
 * @param root [root]
 * @param options [options]
 */
function optimize (root, options) {
  if (!root) { return }
  // 是否属于静态key
  isStaticKey = genStaticKeysCached(options.staticKeys || '');
  // 是否属于框架保留的标签
  isPlatformReservedTag = options.isReservedTag || no; 
  // first pass: mark all non-static nodes.
  // 第一步： 标记所有非静态节点
  markStatic(root);
  // second pass: mark static roots.
  // 第二步： 标记静态roots
  markStaticRoots(root, false);
}

// 生成静态key
function genStaticKeys$1 (keys) {
  return makeMap(
    'type,tag,attrsList,attrsMap,plain,parent,children,attrs' +
    (keys ? ',' + keys : '')
  )
}

/**
 * 标记静态资源
 * @description 标记静态资源
 * @param node [node]
 */
function markStatic (node) {
  node.static = isStatic(node);
  if (node.type === 1) {
    // do not make component slot content static. this avoids
    // 1. components not able to mutate slot nodes
    // 2. static slot content fails for hot-reloading
    
    // 不要把solt组件的内容做静态标记,为了避免
    if (
      !isPlatformReservedTag(node.tag) &&
      node.tag !== 'slot' &&
      node.attrsMap['inline-template'] == null
    ) {
      return
    }
    for (var i = 0, l = node.children.length; i < l; i++) {
      var child = node.children[i];
      markStatic(child);
      if (!child.static) {
        // 如果子节点不是静态资源，那么这个节点便不是静态资源
        node.static = false;
      }
    }
  }
}

/**
 * 标记静态roots
 * @description 标记静态roots
 * @param node [node]
 * @param isInFor [是否在for指令中]
 */
function markStaticRoots (node, isInFor) {
  if (node.type === 1) {
    if (node.static || node.once) {
      node.staticInFor = isInFor;
    }
    // For a node to qualify as a static root, it should have children that
    // are not just static text. Otherwise the cost of hoisting out will
    // outweigh the benefits and it's better off to just always render it fresh.
    if (node.static && node.children.length && !(
      node.children.length === 1 &&
      node.children[0].type === 3
    )) {
      // 静态根节点
      node.staticRoot = true;
      return
    } else {
      // 非静态根节点
      node.staticRoot = false;
    }
    if (node.children) {
      for (var i = 0, l = node.children.length; i < l; i++) {
        markStaticRoots(node.children[i], isInFor || !!node.for);
      }
    }
    // 条件块
    if (node.ifConditions) {
      walkThroughConditionsBlocks(node.ifConditions, isInFor);
    }
  }
}

function walkThroughConditionsBlocks (conditionBlocks, isInFor) {
  for (var i = 1, len = conditionBlocks.length; i < len; i++) {
    markStaticRoots(conditionBlocks[i].block, isInFor);
  }
}

/**
 * 是否属于静态资源
 * @description 是否属于静态资源
 * @param node [node]
 */
function isStatic (node) {
  if (node.type === 2) { // expression 表达式
    return false
  }
  if (node.type === 3) { // text 文本
    return true
  }
  return !!(node.pre || (
    !node.hasBindings && // no dynamic bindings 没有动态绑定
    !node.if && !node.for && // not v-if or v-for or v-else 没有v-if v-for -v-else
    !isBuiltInTag(node.tag) && // not a built-in 不是内置标签 solt,component
    isPlatformReservedTag(node.tag) && // not a component 不是一个标签
    !isDirectChildOfTemplateFor(node) && // 
    Object.keys(node).every(isStaticKey) //
  ))
}

/**
 * 是否属于模板的子元素
 */
function isDirectChildOfTemplateFor (node) {
  while (node.parent) {
    node = node.parent;
    if (node.tag !== 'template') {
      return false
    }
    if (node.for) {
      return true
    }
  }
  return false
}

/*  */

// function 正则表达式
var fnExpRE = /^\s*([\w$_]+|\([^)]*?\))\s*=>|^function\s*\(/;
// 仅方法名称
var simplePathRE = /^\s*[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?']|\[".*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*\s*$/;

// keyCode aliases
// keyCode 别名列表
var keyCodes = {
  esc: 27,
  tab: 9,
  enter: 13,
  space: 32,
  up: 38,
  left: 37,
  right: 39,
  down: 40,
  'delete': [8, 46]
};

// 事件修饰语哈希列表
var modifierCode = {
  stop: '$event.stopPropagation();',
  prevent: '$event.preventDefault();',
  self: 'if($event.target !== $event.currentTarget)return;',
  ctrl: 'if(!$event.ctrlKey)return;',
  shift: 'if(!$event.shiftKey)return;',
  alt: 'if(!$event.altKey)return;',
  meta: 'if(!$event.metaKey)return;'
};

/**
 * 生成handlers
 * @description 生成handlers
 * @param events [events]
 * @param native [native]
 */
function genHandlers (events, native) {
  var res = native ? 'nativeOn:{' : 'on:{';
  for (var name in events) {
    res += "\"" + name + "\":" + (genHandler(name, events[name])) + ",";
  }
  return res.slice(0, -1) + '}'
}

/**
 * 生成handler
 * @description 生成handler
 * @param name [name]
 * @param handler [handler]
 */
function genHandler (
  name,
  handler
) {
  if (!handler) {
    return 'function(){}'
  } else if (Array.isArray(handler)) {
    // 如果是数组那么调用递归返回一个数组函数列表
    return ("[" + (handler.map(function (handler) { return genHandler(name, handler); }).join(',')) + "]")
  } else if (!handler.modifiers) {
    // 没有函数处理修饰信息
    // 如果是函数或者简单字符串表达式，那么直接返回，如果自定义函数，那么返回调用函数
    return fnExpRE.test(handler.value) || simplePathRE.test(handler.value)
      ? handler.value
      : ("function($event){" + (handler.value) + "}")
  } else {
    var code = '';
    var keys = [];
    for (var key in handler.modifiers) {
      if (modifierCode[key]) {
        code += modifierCode[key];
      } else {
        keys.push(key);
      }
    }
    if (keys.length) {
      // 赋值条件判断，根据键盘的信息
      code = genKeyFilter(keys) + code;
    }
    // 如果是自定义函数则会返回自定义函数，否则把$event参数注入到函数内
    // 例如：do 返回 do($event); do(name)则返回do(name);
    var handlerCode = simplePathRE.test(handler.value)
      ? handler.value + '($event)'
      : handler.value;
    // 只有前面的判断条件成立才会执行定义函数
    return 'function($event){' + code + handlerCode + '}'
  }
}

function genKeyFilter (keys) {
  return ("if(" + (keys.map(genFilterCode).join('&&')) + ")return;")
}

/**
 * 生成过滤keyCode
 * @description 生成过滤keyCode
 * @param key 修饰主键
 */
function genFilterCode (key) {
  var keyVal = parseInt(key, 10);
  if (keyVal) {
    return ("$event.keyCode!==" + keyVal)
  }
  var alias = keyCodes[key];
  // 利用Vue原型链上_k方法进行检测键盘修饰信息
  return ("_k($event.keyCode," + (JSON.stringify(key)) + (alias ? ',' + JSON.stringify(alias) : '') + ")")
}

/*  */

/**
 * 数据绑定v-bind
 * @description 数据绑定v-bind
 * @param el [element]
 * @param dir [指令]
 */
function bind$2 (el, dir) {
  el.wrapData = function (code) {
    return ("_b(" + code + ",'" + (el.tag) + "'," + (dir.value) + (dir.modifiers && dir.modifiers.prop ? ',true' : '') + ")")
  };
}

/* 框架预设指令 */


var baseDirectives = {
  bind: bind$2,
  cloak: noop
};

/*  */

// configurable state
// 可配置状态或者参数

// 自定义警告信息函数
var warn$2;
// 过渡动画
var transforms$1;
// data生成函数
var dataGenFns;
// 框架指令
var platformDirectives$1;
// 是否属于框架预留标签
var isPlatformReservedTag$1;
// 静态render函数
var staticRenderFns;
var onceCount;
var currentOptions;

/**
 * 生成对象
 * @description 生成对象
 * @param ast [ast]
 * @param options [options]
 */
function generate (
  ast,
  options
) {
  // save previous staticRenderFns so generate calls can be nested
  var prevStaticRenderFns = staticRenderFns;
  var currentStaticRenderFns = staticRenderFns = [];
  var prevOnceCount = onceCount;
  onceCount = 0;
  currentOptions = options;
  warn$2 = options.warn || baseWarn;
  transforms$1 = pluckModuleFunction(options.modules, 'transformCode');
  dataGenFns = pluckModuleFunction(options.modules, 'genData');
  platformDirectives$1 = options.directives || {};
  isPlatformReservedTag$1 = options.isReservedTag || no;
  var code = ast ? genElement(ast) : '_c("div")';
  staticRenderFns = prevStaticRenderFns;
  onceCount = prevOnceCount;
  return {
    render: ("with(this){return " + code + "}"),
    staticRenderFns: currentStaticRenderFns
  }
}

/**
 * 生成element对象渲染的方法以字符串的形式表现
 * @description 生成element对象渲染的方法以字符串的形式表现
 * @param el [element]
 */
function genElement (el) {
  if (el.staticRoot && !el.staticProcessed) {
    return genStatic(el)
  } else if (el.once && !el.onceProcessed) {
    return genOnce(el)
  } else if (el.for && !el.forProcessed) {
    return genFor(el)
  } else if (el.if && !el.ifProcessed) {
    return genIf(el)
  } else if (el.tag === 'template' && !el.slotTarget) {
    return genChildren(el) || 'void 0'
  } else if (el.tag === 'slot') {
    return genSlot(el)
  } else {
    // component or element
    // 组件或者元素
    var code;
    if (el.component) {
      code = genComponent(el.component, el);
    } else {
      var data = el.plain ? undefined : genData(el);

      var children = el.inlineTemplate ? null : genChildren(el, true);
      // _c ，定义在vm._c上,参数列表，[标签，数据，子级，规范类型，alwaysNormalize]
      code = "_c('" + (el.tag) + "'" + (data ? ("," + data) : '') + (children ? ("," + children) : '') + ")";
    }
    // module transforms
    for (var i = 0; i < transforms$1.length; i++) {
      code = transforms$1[i](el, code);
    }
    return code
  }
}

// hoist static sub-trees out
/**
 * 生成静态资源树字符串
 * @description 生成静态资源树字符串
 * @param el [elment]
 */
function genStatic (el) {
  // 标记静态资源处理状态为true
  el.staticProcessed = true;
  staticRenderFns.push(("with(this){return " + (genElement(el)) + "}"));
  return ("_m(" + (staticRenderFns.length - 1) + (el.staticInFor ? ',true' : '') + ")")
}

// v-once
/**
 * v-once 只渲染元素和组件一次。随后的重新渲染,元素/组件及其所有的子节点将被视为静态内容并跳过。这可以用于优化更新性能
 * api https://cn.vuejs.org/v2/api/#v-once
 * 生成静态资源树字符串
 * @description 生成静态资源树字符串
 * param el [element]
 */
function genOnce (el) {
  // 标记静态资源处理状态为true
  el.onceProcessed = true;
  if (el.if && !el.ifProcessed) {
    return genIf(el)
  } else if (el.staticInFor) {
    var key = '';
    var parent = el.parent;
    while (parent) {
      if (parent.for) {
        key = parent.key;
        break
      }
      parent = parent.parent;
    }
    if (!key) {
      "development" !== 'production' && warn$2(
        "v-once can only be used inside v-for that is keyed. "
      );
      return genElement(el)
    }
    return ("_o(" + (genElement(el)) + "," + (onceCount++) + (key ? ("," + key) : "") + ")")
  } else {
    return genStatic(el)
  }
}

/**
 * 
 */
function genIf (el) {
  el.ifProcessed = true; // avoid recursion 避免递归
  return genIfConditions(el.ifConditions.slice())
}

/**
 * 生成条件块语句
 * @description 生成条件块语句
 * @param conditions [表达式]
 */
function genIfConditions (conditions) {
  if (!conditions.length) {
    return '_e()'
  }

  var condition = conditions.shift();
  if (condition.exp) {
    return ("(" + (condition.exp) + ")?" + (genTernaryExp(condition.block)) + ":" + (genIfConditions(conditions)))
  } else {
    return ("" + (genTernaryExp(condition.block)))
  }

  // v-if with v-once should generate code like (a)?_m(0):_m(1)
  function genTernaryExp (el) {
    return el.once ? genOnce(el) : genElement(el)
  }
}

/**
 * 生成for执行方法的字符串
 * @description 生成for执行方法的字符串
 * @param el [element]
 */
function genFor (el) {
  // 获取for表达式里的对象
  var exp = el.for;
  // 获取for用到的别名
  var alias = el.alias;
  // 获取第二个参数key
  var iterator1 = el.iterator1 ? ("," + (el.iterator1)) : '';
  // 获取第三个参数index
  var iterator2 = el.iterator2 ? ("," + (el.iterator2)) : '';
  el.forProcessed = true; // avoid recursion 避免递归
  return "_l((" + exp + ")," +
    "function(" + alias + iterator1 + iterator2 + "){" +
      "return " + (genElement(el)) +
    '})'
}

/**
 * 生成data对象的字符串
 * @param 生成data对象的字符串
 * @param el [elment]
 */
function genData (el) {
  var data = '{';

  // directives first.
  // directives may mutate the el's other properties before they are generated.
  // 指令可能改变元素的其他属性，发生在它们生成之前
  var dirs = genDirectives(el);
  if (dirs) { data += dirs + ','; }

  // key
  if (el.key) {
    data += "key:" + (el.key) + ",";
  }
  // ref
  if (el.ref) {
    data += "ref:" + (el.ref) + ",";
  }
  if (el.refInFor) {
    data += "refInFor:true,";
  }
  // pre
  if (el.pre) {
    data += "pre:true,";
  }
  // record original tag name for components using "is" attribute
  if (el.component) {
    data += "tag:\"" + (el.tag) + "\",";
  }
  // module data generation functions
  for (var i = 0; i < dataGenFns.length; i++) {
    data += dataGenFns[i](el);
  }
  // attributes
  if (el.attrs) {
    data += "attrs:{" + (genProps(el.attrs)) + "},";
  }
  // DOM props
  if (el.props) {
    data += "domProps:{" + (genProps(el.props)) + "},";
  }
  // event handlers
  if (el.events) {
    data += (genHandlers(el.events)) + ",";
  }
  if (el.nativeEvents) {
    data += (genHandlers(el.nativeEvents, true)) + ",";
  }
  // slot target
  if (el.slotTarget) {
    data += "slot:" + (el.slotTarget) + ",";
  }
  // scoped slots
  if (el.scopedSlots) {
    data += (genScopedSlots(el.scopedSlots)) + ",";
  }
  // inline-template
  if (el.inlineTemplate) {
    var inlineTemplate = genInlineTemplate(el);
    if (inlineTemplate) {
      data += inlineTemplate + ",";
    }
  }
  data = data.replace(/,$/, '') + '}';
  // v-bind data wrap
  if (el.wrapData) {
    data = el.wrapData(data);
  }
  return data
}

/**
 * 生成direactives对象字符串
 * @description 生成direactives对象字符串
 * @param el [elment]
 */
function genDirectives (el) {
  var dirs = el.directives;
  if (!dirs) { return }
  var res = 'directives:[';
  var hasRuntime = false;
  var i, l, dir, needRuntime;
  for (i = 0, l = dirs.length; i < l; i++) {
    dir = dirs[i];
    needRuntime = true;
    var gen = platformDirectives$1[dir.name] || baseDirectives[dir.name];
    if (gen) {
      // compile-time directive that manipulates AST.
      // returns true if it also needs a runtime counterpart.
      // 编译时指令操纵AST
      needRuntime = !!gen(el, dir, warn$2);
    }
    if (needRuntime) {
      hasRuntime = true;
      res += "{name:\"" + (dir.name) + "\",rawName:\"" + (dir.rawName) + "\"" + (dir.value ? (",value:(" + (dir.value) + "),expression:" + (JSON.stringify(dir.value))) : '') + (dir.arg ? (",arg:\"" + (dir.arg) + "\"") : '') + (dir.modifiers ? (",modifiers:" + (JSON.stringify(dir.modifiers))) : '') + "},";
    }
  }
  if (hasRuntime) {
    return res.slice(0, -1) + ']'
  }
}

/**
 * 生成inlineTemplate对象字符串
 * description 生成inlineTemplate对象字符串
 * @param el [elment]
 */
function genInlineTemplate (el) {
  var ast = el.children[0];
  if ("development" !== 'production' && (
    el.children.length > 1 || ast.type !== 1
  )) {
    warn$2('Inline-template components must have exactly one child element.');
  }
  if (ast.type === 1) {
    var inlineRenderFns = generate(ast, currentOptions);
    return ("inlineTemplate:{render:function(){" + (inlineRenderFns.render) + "},staticRenderFns:[" + (inlineRenderFns.staticRenderFns.map(function (code) { return ("function(){" + code + "}"); }).join(',')) + "]}")
  }
}

/**
 * 生成scopedSlots对象字符串
 * @description 生成scopedSlots对象字符串
 * @param solts [slots]
 */
function genScopedSlots (slots) {
  return ("scopedSlots:{" + (Object.keys(slots).map(function (key) { return genScopedSlot(key, slots[key]); }).join(',')) + "}")
}

/**
 * 生成scopedSlot对象字符串
 * @param key [key]
 * @param el [elment]
 */
function genScopedSlot (key, el) {
  return key + ":function(" + (String(el.attrsMap.scope)) + "){" +
    "return " + (el.tag === 'template'
      ? genChildren(el) || 'void 0'
      : genElement(el)) + "}"
}

/**
 * 生成child对象字符串
 * @description 生成child对象字符串
 * @param el [element]
 * @param checkSkip [checkSkip]
 */
function genChildren (el, checkSkip) {
  var children = el.children;
  if (children.length) {
    var el$1 = children[0];
    // optimize single v-for
    if (children.length === 1 &&
        el$1.for &&
        el$1.tag !== 'template' &&
        el$1.tag !== 'slot') {
      return genElement(el$1)
    }
    var normalizationType = getNormalizationType(children);
    return ("[" + (children.map(genNode).join(',')) + "]" + (checkSkip
        ? normalizationType ? ("," + normalizationType) : ''
        : ''))
  }
}

// determine the normalization needed for the children array.
// 0: no normalization needed
// 1: simple normalization needed (possible 1-level deep nested array)
// 2: full normalization needed
function getNormalizationType (children) {
  var res = 0;
  for (var i = 0; i < children.length; i++) {
    var el = children[i];
    if (needsNormalization(el) ||
        (el.if && el.ifConditions.some(function (c) { return needsNormalization(c.block); }))) {
      res = 2;
      break
    }
    if (maybeComponent(el) ||
        (el.if && el.ifConditions.some(function (c) { return maybeComponent(c.block); }))) {
      res = 1;
    }
  }
  return res
}

/**
 * 需要规范化
 */
function needsNormalization (el) {
  return el.for || el.tag === 'template' || el.tag === 'slot'
}

/**
 * 验证元素是否属于组件
 * @description 验证元素是否属于组件
 * @param el [elment]
 */
function maybeComponent (el) {
  return el.type === 1 && !isPlatformReservedTag$1(el.tag)
}

/**
 * 生成节点的渲染信息以字符串的形式展现
 * @description 生成节点的渲染信息以字符串的形式展现
 * @param node [node]
 */
function genNode (node) {
  if (node.type === 1) {
    return genElement(node)
  } else {
    return genText(node)
  }
}

/**
 * 生成纯文本节点渲染信息
 * @description 生成纯文本节点渲染信息
 * @param text [text]
 */
function genText (text) {
  return ("_v(" + (text.type === 2
    ? text.expression // no need for () because already wrapped in _s()
    : transformSpecialNewlines(JSON.stringify(text.text))) + ")")
}

/**
 * 生成slot渲染的字符串
 * @description 生成slot渲染的字符串
 * @param el [element]
 */
function genSlot (el) {
  var slotName = el.slotName || '"default"';
  var children = genChildren(el);
  var res = "_t(" + slotName + (children ? ("," + children) : '');
  var attrs = el.attrs && ("{" + (el.attrs.map(function (a) { return ((camelize(a.name)) + ":" + (a.value)); }).join(',')) + "}");
  var bind$$1 = el.attrsMap['v-bind'];
  if ((attrs || bind$$1) && !children) {
    res += ",null";
  }
  if (attrs) {
    res += "," + attrs;
  }
  if (bind$$1) {
    res += (attrs ? '' : ',null') + "," + bind$$1;
  }
  return res + ')'
}

// componentName is el.component, take it as argument to shun flow's pessimistic refinement
function genComponent (componentName, el) {
  var children = el.inlineTemplate ? null : genChildren(el, true);
  return ("_c(" + componentName + "," + (genData(el)) + (children ? ("," + children) : '') + ")")
}

/**
 * 生成props对象字符串
 * @description 生成props对象字符串
 * @param props [porps]
 */
function genProps (props) {
  var res = '';
  for (var i = 0; i < props.length; i++) {
    var prop = props[i];
    res += "\"" + (prop.name) + "\":" + (transformSpecialNewlines(prop.value)) + ",";
  }
  return res.slice(0, -1)
}

// #3895, #4268
// https://github.com/vuejs/vue/issues/4268
function transformSpecialNewlines (text) {
  return text
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

/*  */

/**
 * Compile a template.
 * 编译模板
 * @description 编译模板
 * @param template [template]
 * @param options [options]
 */
function compile$1 (
  template,
  options
) {
  var ast = parse(template.trim(), options);
  optimize(ast, options);
  var code = generate(ast, options);
  return {
    ast: ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
}

/*  */

// operators like typeof, instanceof and in are allowed
var prohibitedKeywordRE = new RegExp('\\b' + (
  'do,if,for,let,new,try,var,case,else,with,await,break,catch,class,const,' +
  'super,throw,while,yield,delete,export,import,return,switch,default,' +
  'extends,finally,continue,debugger,function,arguments'
).split(',').join('\\b|\\b') + '\\b');
// check valid identifier for v-for
var identRE = /[A-Za-z_$][\w$]*/;
// strip strings in expressions
var stripStringRE = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`/g;

// detect problematic expressions in a template
function detectErrors (ast) {
  var errors = [];
  if (ast) {
    checkNode(ast, errors);
  }
  return errors
}

function checkNode (node, errors) {
  if (node.type === 1) {
    for (var name in node.attrsMap) {
      if (dirRE.test(name)) {
        var value = node.attrsMap[name];
        if (value) {
          if (name === 'v-for') {
            checkFor(node, ("v-for=\"" + value + "\""), errors);
          } else {
            checkExpression(value, (name + "=\"" + value + "\""), errors);
          }
        }
      }
    }
    if (node.children) {
      for (var i = 0; i < node.children.length; i++) {
        checkNode(node.children[i], errors);
      }
    }
  } else if (node.type === 2) {
    checkExpression(node.expression, node.text, errors);
  }
}

function checkFor (node, text, errors) {
  checkExpression(node.for || '', text, errors);
  checkIdentifier(node.alias, 'v-for alias', text, errors);
  checkIdentifier(node.iterator1, 'v-for iterator', text, errors);
  checkIdentifier(node.iterator2, 'v-for iterator', text, errors);
}

function checkIdentifier (ident, type, text, errors) {
  if (typeof ident === 'string' && !identRE.test(ident)) {
    errors.push(("- invalid " + type + " \"" + ident + "\" in expression: " + text));
  }
}

function checkExpression (exp, text, errors) {
  try {
    new Function(("return " + exp));
  } catch (e) {
    var keywordMatch = exp.replace(stripStringRE, '').match(prohibitedKeywordRE);
    if (keywordMatch) {
      errors.push(
        "- avoid using JavaScript keyword as property name: " +
        "\"" + (keywordMatch[0]) + "\" in expression " + text
      );
    } else {
      errors.push(("- invalid expression: " + text));
    }
  }
}

/*  */

/**
 * 转换节点class属性
 * @description 转换节点class属性
 * @param el [elment]
 * @param options [options]
 */
function transformNode (el, options) {
  var warn = options.warn || baseWarn;
  var staticClass = getAndRemoveAttr(el, 'class');
  if ("development" !== 'production' && staticClass) {
    var expression = parseText(staticClass, options.delimiters);
    if (expression) {
      warn(
        "class=\"" + staticClass + "\": " +
        'Interpolation inside attributes has been removed. ' +
        'Use v-bind or the colon shorthand instead. For example, ' +
        'instead of <div class="{{ val }}">, use <div :class="val">.'
      );
    }
  }
  if (staticClass) {
    el.staticClass = JSON.stringify(staticClass);
  }
  var classBinding = getBindingAttr(el, 'class', false /* getStatic */);
  if (classBinding) {
    el.classBinding = classBinding;
  }
}

/**
 * 生成class静态字符串
 * @description 生成class静态字符串
 * @param el [elment]
 */
function genData$1 (el) {
  var data = '';
  if (el.staticClass) {
    data += "staticClass:" + (el.staticClass) + ",";
  }
  if (el.classBinding) {
    data += "class:" + (el.classBinding) + ",";
  }
  return data
}

/** 框架预设class指令 **/
var klass$1 = {
  staticKeys: ['staticClass'],
  transformNode: transformNode,
  genData: genData$1
};

/*  */

/**
 * 转换节点style属性
 * @description 转换节点style属性
 * @param el [elment]
 * @param options [options]
 */
function transformNode$1 (el, options) {
  var warn = options.warn || baseWarn;
  var staticStyle = getAndRemoveAttr(el, 'style');
  if (staticStyle) {
    /* istanbul ignore if */
    {
      var expression = parseText(staticStyle, options.delimiters);
      if (expression) {
        warn(
          "style=\"" + staticStyle + "\": " +
          'Interpolation inside attributes has been removed. ' +
          'Use v-bind or the colon shorthand instead. For example, ' +
          'instead of <div style="{{ val }}">, use <div :style="val">.'
        );
      }
    }
    el.staticStyle = JSON.stringify(parseStyleText(staticStyle));
  }

  var styleBinding = getBindingAttr(el, 'style', false /* getStatic */);
  if (styleBinding) {
    el.styleBinding = styleBinding;
  }
}

/**
 * 生成style静态字符串
 * @description 生成style静态字符串
 * @param el [elment]
 */
function genData$2 (el) {
  var data = '';
  if (el.staticStyle) {
    data += "staticStyle:" + (el.staticStyle) + ",";
  }
  if (el.styleBinding) {
    data += "style:(" + (el.styleBinding) + "),";
  }
  return data
}

var style$1 = {
  staticKeys: ['staticStyle'],
  transformNode: transformNode$1,
  genData: genData$2
};

var modules$1 = [
  klass$1,
  style$1
];

/** 框架预设model指令 **/

var warn$3;

/**
 * model指令函数
 * @description model指令函数
 * @param el [element]
 * @param dir [指令]
 * @param _warn [警告回调函数]
 */
function model$1 (
  el,
  dir,
  _warn
) {
  // 关于dir的解释可以参考的教程地址 https://cn.vuejs.org/v2/guide/custom-directive.html
  // v-model 指令的修饰符
  // .lazy - 取代 input 监听 change 事件
  // .number - 输入字符串转为数字
  // .trim - 输入首尾空格过滤
  warn$3 = _warn;
  var value = dir.value;
  var modifiers = dir.modifiers;
  var tag = el.tag;
  var type = el.attrsMap.type;
  {
    var dynamicType = el.attrsMap['v-bind:type'] || el.attrsMap[':type'];
    // v-model不支持动态输入类型
    if (tag === 'input' && dynamicType) {
      warn$3(
        "<input :type=\"" + dynamicType + "\" v-model=\"" + value + "\">:\n" +
        "v-model does not support dynamic input types. Use v-if branches instead."
      );
    }
  }
  if (tag === 'select') {
    genSelect(el, value, modifiers);
  } else if (tag === 'input' && type === 'checkbox') {
    genCheckboxModel(el, value, modifiers);
  } else if (tag === 'input' && type === 'radio') {
    genRadioModel(el, value, modifiers);
  } else {
    genDefaultModel(el, value, modifiers);
  }
  // ensure runtime directive metadata
  return true
}

/**
 * 生成v-mode指令下的checkbox元素
 * @description 生成v-mode指令下的checkbox元素
 * @param el [elment]
 * @param value [表达式]
 * @param modifiers [修饰信息]
 */
function genCheckboxModel (
  el,
  value,
  modifiers
) {
  if ("development" !== 'production' &&
    el.attrsMap.checked != null) {
    warn$3(
      "<" + (el.tag) + " v-model=\"" + value + "\" checked>:\n" +
      "inline checked attributes will be ignored when using v-model. " +
      'Declare initial values in the component\'s data option instead.'
    );
  }
  var number = modifiers && modifiers.number;
  var valueBinding = getBindingAttr(el, 'value') || 'null';
  var trueValueBinding = getBindingAttr(el, 'true-value') || 'true';
  var falseValueBinding = getBindingAttr(el, 'false-value') || 'false';

  // question 不明白怎么拼接的
  // Array.isArray(value) ? _i(value,valueBinding)>-1  (trueValueBinding === "true" ? ":(value)":':_q(value,trueValueBinding)')

  addProp(el, 'checked',
    "Array.isArray(" + value + ")" +
      "?_i(" + value + "," + valueBinding + ")>-1" + (
        trueValueBinding === 'true'
          ? (":(" + value + ")")
          : (":_q(" + value + "," + trueValueBinding + ")")
      )
  );
  
  // var $$a = value,
  //     $$el = $event.target,
  //     $$c = $$el.checked ? (trueValueBinding):(falseValueBinding);
  
  // if(Array.isArray($$a)){
  //   var $$v = number ? _n(valueBinding):valueBinding,
  //       $$i = _i($$a,$$v);
  //   if($$c){
  //       $$i < 0 && (value = $$a.concat($$v));
  //   } else{
  //       $$i > -1 && (value = $$a.slice(0,$$i).concat($$a.slice($$i+1)))
  //   }   
  // }else{
  //   value = $$c;
  // }

  addHandler(el, 'change',
    "var $$a=" + value + "," +
        '$$el=$event.target,' +
        "$$c=$$el.checked?(" + trueValueBinding + "):(" + falseValueBinding + ");" +
    'if(Array.isArray($$a)){' +
      "var $$v=" + (number ? '_n(' + valueBinding + ')' : valueBinding) + "," +
          '$$i=_i($$a,$$v);' +
      "if($$c){$$i<0&&(" + value + "=$$a.concat($$v))}" +
      "else{$$i>-1&&(" + value + "=$$a.slice(0,$$i).concat($$a.slice($$i+1)))}" +
    "}else{" + value + "=$$c}",
    null, true
  );
}

/**
 * 生成v-mode指令下的radio元素
 * @description 生成v-mode指令下的radio元素
 * @param el [element]
 * @param value [表达式]
 * @param modifiers [修饰信息]
 */
function genRadioModel (
    el,
    value,
    modifiers
) {
  if ("development" !== 'production' &&
    el.attrsMap.checked != null) {
    warn$3(
      "<" + (el.tag) + " v-model=\"" + value + "\" checked>:\n" +
      "inline checked attributes will be ignored when using v-model. " +
      'Declare initial values in the component\'s data option instead.'
    );
  }
  var number = modifiers && modifiers.number;
  var valueBinding = getBindingAttr(el, 'value') || 'null';
  valueBinding = number ? ("_n(" + valueBinding + ")") : valueBinding;
  addProp(el, 'checked', ("_q(" + value + "," + valueBinding + ")"));
  addHandler(el, 'change', genAssignmentCode(value, valueBinding), null, true);
}

/**
 * 生成v-mode指令下的其它元素
 * @description 生成v-mode指令下的其它元素
 * @param el [elment]
 * @param value [表达式]
 * @param modifiers [修饰信息]
 */
function genDefaultModel (
  el,
  value,
  modifiers
) {
  {
    if (el.tag === 'input' && el.attrsMap.value) {
      warn$3(
        "<" + (el.tag) + " v-model=\"" + value + "\" value=\"" + (el.attrsMap.value) + "\">:\n" +
        'inline value attributes will be ignored when using v-model. ' +
        'Declare initial values in the component\'s data option instead.'
      );
    }
    if (el.tag === 'textarea' && el.children.length) {
      warn$3(
        "<textarea v-model=\"" + value + "\">:\n" +
        'inline content inside <textarea> will be ignored when using v-model. ' +
        'Declare initial values in the component\'s data option instead.'
      );
    }
  }

  var type = el.attrsMap.type;
  var ref = modifiers || {};
  var lazy = ref.lazy;
  var number = ref.number;
  var trim = ref.trim;
  var event = lazy || (isIE && type === 'range') ? 'change' : 'input';
  var needCompositionGuard = !lazy && type !== 'range';
  var isNative = el.tag === 'input' || el.tag === 'textarea';

  var valueExpression = isNative
    ? ("$event.target.value" + (trim ? '.trim()' : ''))
    : trim ? "(typeof $event === 'string' ? $event.trim() : $event)" : "$event";
  valueExpression = number || type === 'number'
    ? ("_n(" + valueExpression + ")")
    : valueExpression;

  var code = genAssignmentCode(value, valueExpression);
  if (isNative && needCompositionGuard) {
    code = "if($event.target.composing)return;" + code;
  }

  // inputs with type="file" are read only and setting the input's
  // value will throw an error.
  if ("development" !== 'production' &&
      type === 'file') {
    warn$3(
      "<" + (el.tag) + " v-model=\"" + value + "\" type=\"file\">:\n" +
      "File inputs are read only. Use a v-on:change listener instead."
    );
  }

  addProp(el, 'value', isNative ? ("_s(" + value + ")") : ("(" + value + ")"));
  addHandler(el, event, code, null, true);
  if (trim || number || type === 'number') {
    addHandler(el, 'blur', '$forceUpdate()');
  }
}

/** 
 * 生成v-mode指令下的select元素
 * @description 生成v-mode指令下的select元素
 * @param el [element]
 * @param value [表达式]
 * @param modifiers [modifiers]
 */
function genSelect (
    el,
    value,
    modifiers
) {
  {
    el.children.some(checkOptionWarning);
  }

  var number = modifiers && modifiers.number;

  //Array.prototype.filter.call($event.target.options,function(o){return o.selected}).map(function(o){var val = _value in o ? o._value : o.value; return number ? _n(val):val})el.attrsMap.multiple == null ? [0]:""

  var assignment = "Array.prototype.filter" +
    ".call($event.target.options,function(o){return o.selected})" +
    ".map(function(o){var val = \"_value\" in o ? o._value : o.value;" +
    "return " + (number ? '_n(val)' : 'val') + "})" +
    (el.attrsMap.multiple == null ? '[0]' : '');
  // 生成赋值代码  
  var code = genAssignmentCode(value, assignment);
  // 添加change监听事件
  addHandler(el, 'change', code, null, true);
}

/**
 * 检查select标签元素子元素option是否正确
 * @description 检查select标签元素子元素option是否正确
 * @param option [option]
 */
function checkOptionWarning (option) {
  if (option.type === 1 &&
    option.tag === 'option' &&
    option.attrsMap.selected != null) {
    warn$3(
      "<select v-model=\"" + (option.parent.attrsMap['v-model']) + "\">:\n" +
      'inline selected attributes on <option> will be ignored when using v-model. ' +
      'Declare initial values in the component\'s data option instead.'
    );
    return true
  }
  return false
}

/**
 * 生成赋值代码
 * @description 生成赋值代码
 * @param value [表达式]
 * @param assignment [赋值语句]
 */
 function genAssignmentCode (value, assignment) {
  var modelRs = parseModel(value);
  if (modelRs.idx === null) {
    return (value + "=" + assignment)
  } else {
    
    // var $$exp = modelRs.exp,$$idx = modelRs.idex;
    // if(!Array.isArray($$exp)){
    //   value = assignment;
    // }else{
    //   $$exp.splice($$idx,1,assignment);
    // }

    return "var $$exp = " + (modelRs.exp) + ", $$idx = " + (modelRs.idx) + ";" +
      "if (!Array.isArray($$exp)){" +
        value + "=" + assignment + "}" +
      "else{$$exp.splice($$idx, 1, " + assignment + ")}"
  }
}

/*  */
/**
 * 添加textContent属性
 * @description 添加textContent属性
 * @param el [elment]
 * @param dir [指令]
 */
function text (el, dir) {
  if (dir.value) {
    addProp(el, 'textContent', ("_s(" + (dir.value) + ")"));
  }
}

/*  */
/**
 * 添加html属性
 * @description 添加html属性
 * @param el [element]
 * @param dir [指令]
 */
function html (el, dir) {
  if (dir.value) {
    addProp(el, 'innerHTML', ("_s(" + (dir.value) + ")"));
  }
}

var directives$1 = {
  model: model$1,
  text: text,
  html: html
};

/*  */
// 创建一个缓存对象
var cache = Object.create(null);

//  基本配置信息
var baseOptions = {
  expectHTML: true, // 要求是HTML
  modules: modules$1, // 模块
  staticKeys: genStaticKeys(modules$1),
  directives: directives$1, // 指令
  isReservedTag: isReservedTag, // 是否属于保留tag
  isUnaryTag: isUnaryTag,
  mustUseProp: mustUseProp,
  getTagNamespace: getTagNamespace,
  isPreTag: isPreTag
};

/**
 * 编译辅助函数compile$$1
 * @description 编译模板
 * @param template [template]
 * @param options [options]
 */
function compile$$1 (
  template,
  options
) {
  // 改变options的配置信息
  options = options
    ? extend(extend({}, baseOptions), options)
    : baseOptions;
  // 
  return compile$1(template, options)
}

/**
 * 编译成function
 * @description 编译成function
 * @param template [模板]
 * @param options [参数]
 * @param vm [Vue实例对象]
 */
function compileToFunctions (
  template,
  options,
  vm
) {
  // 优先赋值options中的warn方法，如果options中没有warn方法则赋值默认的warn方法
  var _warn = (options && options.warn) || warn;
  // detect possible CSP restriction
  // 检测CSP限制
  /* istanbul ignore if */
  {
    try {
      new Function('return 1');
    } catch (e) {
      if (e.toString().match(/unsafe-eval|CSP/)) {
        _warn(
          'It seems you are using the standalone build of Vue.js in an ' +
          'environment with Content Security Policy that prohibits unsafe-eval. ' +
          'The template compiler cannot work in this environment. Consider ' +
          'relaxing the policy to allow unsafe-eval or pre-compiling your ' +
          'templates into render functions.'
        );
      }
    }
  }
  // key赋值为options中的delimiters(分隔符)加template或者template
  var key = options && options.delimiters
    ? String(options.delimiters) + template
    : template;
  
  // 如果缓存中含有，那么直接返回缓存中的数据
  if (cache[key]) {
    return cache[key]
  }

  var res = {};
  var compiled = compile$$1(template, options);
  res.render = makeFunction(compiled.render);
  var l = compiled.staticRenderFns.length;
  res.staticRenderFns = new Array(l);
  for (var i = 0; i < l; i++) {
    res.staticRenderFns[i] = makeFunction(compiled.staticRenderFns[i]);
  }
  {
    if (res.render === noop || res.staticRenderFns.some(function (fn) { return fn === noop; })) {
      _warn(
        "failed to compile template:\n\n" + template + "\n\n" +
        detectErrors(compiled.ast).join('\n') +
        '\n\n',
        vm
      );
    }
  }
  return (cache[key] = res)
}

/**
 * 创建一个function，能创建则创建，不能创建则返回一个空方法
 */
function makeFunction (code) {
  try {
    return new Function(code)
  } catch (e) {
    return noop
  }
}

/**
 * 创建缓存模板
 */
var idToTemplate = cached(function (id) {
  var el = query(id);
  return el && el.innerHTML
});

// Vue对象安装方法
var mount = Vue$3.prototype.$mount;
/**
 * Vue对象安装方法
 * @description Vue对象安装方法
 * @param el [element]
 * @param hydrating [数据填充对象的过程]
 */
Vue$3.prototype.$mount = function (
  el,
  hydrating
) {
  // 获取元素
  el = el && query(el);

  /* istanbul ignore if */
  if (el === document.body || el === document.documentElement) {
    "development" !== 'production' && warn(
      "Do not mount Vue to <html> or <body> - mount to normal elements instead."
    );
    return this
  }

  var options = this.$options;
  // resolve template/el and convert to render function
  // 解析模板或者element并且转换render函数
  if (!options.render) {
    var template = options.template;
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          template = idToTemplate(template);
          /* istanbul ignore if */
          if ("development" !== 'production' && !template) {
            warn(
              ("Template element not found or is empty: " + (options.template)),
              this
            );
          }
        }
      } else if (template.nodeType) {
        template = template.innerHTML;
      } else {
        {
          warn('invalid template option:' + template, this);
        }
        return this
      }
    } else if (el) {
      template = getOuterHTML(el);
    }
    if (template) {
      // 手动编译模板
      var ref = compileToFunctions(template, {
        warn: warn,
        shouldDecodeNewlines: shouldDecodeNewlines,
        delimiters: options.delimiters
      }, this);
      var render = ref.render;
      var staticRenderFns = ref.staticRenderFns;
      options.render = render;
      options.staticRenderFns = staticRenderFns;
    }
  }
  return mount.call(this, el, hydrating)
};

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 * 得到元素的outerHTML,outerHTML属性只有IE浏览器才有
 * @description 得到元素的outerHTML
 * @param el [elment]
 */
function getOuterHTML (el) {
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    var container = document.createElement('div');
    container.appendChild(el.cloneNode(true));
    return container.innerHTML
  }
}

Vue$3.compile = compileToFunctions;
// 至此结束，返回function
return Vue$3;

})));
