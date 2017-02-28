/**
 * vuex v2.2.1
 * (c) 2017 Evan You
 * @license MIT
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Vuex = factory());
}(this, (function () { 'use strict';

/**
 * 运用mixin向Vue注入Vuex init初始化钩子
 * @description 运用mixin向Vue注入Vuex init初始化钩子
 * @param Vue [Vue对象]
 */
var applyMixin = function (Vue) {
  var version = Number(Vue.version.split('.')[0]);

  if (version >= 2) {
    // 注入vuexInit函数到init函数上或者beforeCreate函数上
    var usesInit = Vue.config._lifecycleHooks.indexOf('init') > -1;
    // 为什么在这里没有重写，
    // 这是由于beforeCreate函数的合并策略属于数组合并，所以直接追加就可以了
    Vue.mixin(usesInit ? { init: vuexInit } : { beforeCreate: vuexInit });
  } else {
    // override init and inject vuex init procedure
    // for 1.x backwards compatibility.
    // 重写init和注入vuexinit程序。为了1.x的向后兼容性
    var _init = Vue.prototype._init;
    Vue.prototype._init = function (options) {
      if ( options === void 0 ) options = {};

      options.init = options.init
        ? [vuexInit].concat(options.init)
        : vuexInit;
      _init.call(this, options);
    };
  }

  /**
   * Vuex init hook, injected into each instances init hooks list.
   * vuex init钩子，注入到每个实例初始化钩列表
   */
  
  /**
   * Vue-router插件里面亦有经典的写法，可参见Vue-router源码
   */
  function vuexInit () {
    var options = this.$options;
    // store injection
    if (options.store) {
      this.$store = options.store;
    } else if (options.parent && options.parent.$store) {
      this.$store = options.parent.$store;
    }
  }
};

// 调试工具钩子
var devtoolHook =
  typeof window !== 'undefined' &&
  window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

function devtoolPlugin (store) {
  if (!devtoolHook) { return }

  store._devtoolHook = devtoolHook;

  devtoolHook.emit('vuex:init', store);

  devtoolHook.on('vuex:travel-to-state', function (targetState) {
    store.replaceState(targetState);
  });

  store.subscribe(function (mutation, state) {
    devtoolHook.emit('vuex:mutation', mutation, state);
  });
}

/**
 * Get the first item that pass the test
 * by second argument function
 *
 * @param {Array} list
 * @param {Function} f
 * @return {*}
 */
/**
 * Deep copy the given object considering circular structure.
 * This function caches all nested objects and its copies.
 * If it detects circular structure, use cached copy to avoid infinite loop.
 *
 * @param {*} obj
 * @param {Array<Object>} cache
 * @return {*}
 */


/**
 * forEach for object
 */
function forEachValue (obj, fn) {
  Object.keys(obj).forEach(function (key) { return fn(obj[key], key); });
}

/**
 * 判断是否为对象
 * @description 判断是否为对象
 * @param obj [object]
 */
function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

/**
 * 判断是否为Promise对象
 * @description 判断是否为Promise对象
 * @param val [对象]
 */
function isPromise (val) {
  return val && typeof val.then === 'function'
}

/**
 * 断言
 * @description 判断表达式是否为false,如果为false则抛出错误
 * @param condition [表达式]
 * @param msg [错误信息]
 */
function assert (condition, msg) {
  if (!condition) { throw new Error(("[vuex] " + msg)) }
}

/**
 * 模块构造函数,使用单一状态树，导致应用的所有状态集合到一个很大的对象，但是，当应用变得很大时，store对象会变得臃肿不堪
 * 
 * 为了解决以上问题，Vuex允许我们将store分割到模块（module）,每个模块都拥有自己的state、mutation、action、getters
 * @description 模块构造函数
 * @param rawModule [原生模块]
 * @param runtime [做是否可以移除的标识，亦可理解为是否为派生的模块，即通过store.registerModule函数注册的模块]
 */
var Module = function Module (rawModule, runtime) {
  this.runtime = runtime;
  this._children = Object.create(null);
  this._rawModule = rawModule;
};

// 定义局部变量state、namesspaced
var prototypeAccessors$1 = { state: {},namespaced: {} };

prototypeAccessors$1.state.get = function () {
  return this._rawModule.state || {}
};

prototypeAccessors$1.namespaced.get = function () {
  return !!this._rawModule.namespaced
};

/**
 * 添加子模块
 * @description 添加子模块
 * @param key [key]
 * @param module [module]
 */
Module.prototype.addChild = function addChild (key, module) {
  this._children[key] = module;
};

/**
 * 移除子模块
 * @description 移除子模块
 * @param key [key]
 */
Module.prototype.removeChild = function removeChild (key) {
  delete this._children[key];
};

/**
 * 获取子模块
 * @description 获取子模块
 * @param key [key]
 */
Module.prototype.getChild = function getChild (key) {
  return this._children[key]
};

/**
 * 更新模块
 * @description 更新模块
 * @param rawModule [rawModule]
 */
Module.prototype.update = function update (rawModule) {
  this._rawModule.namespaced = rawModule.namespaced;
  if (rawModule.actions) {
    this._rawModule.actions = rawModule.actions;
  }
  if (rawModule.mutations) {
    this._rawModule.mutations = rawModule.mutations;
  }
  if (rawModule.getters) {
    this._rawModule.getters = rawModule.getters;
  }
};

/**
 * 遍历子模块
 * @description 遍历子模块
 * @param fn [function]
 */
Module.prototype.forEachChild = function forEachChild (fn) {
  forEachValue(this._children, fn);
};

/**
 * 遍历模块的getters属性
 * @description 遍历模块的getters属性
 * @param fn [function]
 */
Module.prototype.forEachGetter = function forEachGetter (fn) {
  if (this._rawModule.getters) {
    forEachValue(this._rawModule.getters, fn);
  }
};

/**
 * 遍历模块的actions属性
 * @description 遍历模块的actions属性
 * @param fn [function]
 */
Module.prototype.forEachAction = function forEachAction (fn) {
  if (this._rawModule.actions) {
    forEachValue(this._rawModule.actions, fn);
  }
};

/**
 * 遍历模块的mutations属性
 * @description 遍历模块的mutations属性
 * @param fn [function]
 */
Module.prototype.forEachMutation = function forEachMutation (fn) {
  if (this._rawModule.mutations) {
    forEachValue(this._rawModule.mutations, fn);
  }
};
// 定义局部变量state、namesspaced
Object.defineProperties( Module.prototype, prototypeAccessors$1 );

/**
 * 模块集合构造函数
 * @description 模块集合的构造函数
 * @param rawRootModule [原生的根模块]
 */
var ModuleCollection = function ModuleCollection (rawRootModule) {
  var this$1 = this;

  // register root module (Vuex.Store options)
  // 注册根模块(Vuex.Store 参数)
  this.root = new Module(rawRootModule, false);

  // register all nested modules
  // 注册所有嵌套模块
  if (rawRootModule.modules) {
    forEachValue(rawRootModule.modules, function (rawModule, key) {
      this$1.register([key], rawModule, false);
    });
  }
};

/**
 * 获取列表中指定的模块
 * @description 获取列表中指定的模块
 * @param path [key]
 */
ModuleCollection.prototype.get = function get (path) {
  /**
   * Array.reduce方法 
   * array1.reduce(callbackfn[, initialValue])
   * 对数组中的所有元素调用指定的回调函数。该回调函数的返回值为累积结果，并且此返回值在下一次调用该回调函数时作为参数提供。
   * function callbackfn(previousValue, currentValue, currentIndex, array1)
   * 
   * 在以下文档模式中受支持：Internet Explorer 9 标准模式、Internet Explorer 10 标准模式和 Internet Explorer 11 标准模式
   * 以下文档模式中不受支持：Quirks、Internet Explorer 6 标准模式、Internet Explorer 7 标准模式、Internet Explorer 8 标准模式
   */
  return path.reduce(function (module, key) {
    return module.getChild(key)
  }, this.root)
};

/**
 * 获取命名空间
 * @description 获取命名空间
 * @param path [路径]
 */
ModuleCollection.prototype.getNamespace = function getNamespace (path) {
  var module = this.root;
  return path.reduce(function (namespace, key) {
    module = module.getChild(key);
    return namespace + (module.namespaced ? key + '/' : '')
  }, '')
};

/**
 * 更新模块列表
 * @description 更新模块列表
 * @param rawRootModule [rawRootModule]
 */
ModuleCollection.prototype.update = function update$1 (rawRootModule) {
  update(this.root, rawRootModule);
};

/**
 * 向模块列表中注册模块
 * @description 向模块列表中注册模块
 * @param path [key]
 * @param rawModule [rawModule]
 * @param runtime [runtime]
 */
ModuleCollection.prototype.register = function register (path, rawModule, runtime) {
    var this$1 = this;
    if ( runtime === void 0 ) runtime = true;

  var parent = this.get(path.slice(0, -1));
  var newModule = new Module(rawModule, runtime);
  parent.addChild(path[path.length - 1], newModule);

  // register nested modules
  // 注册嵌套模块
  if (rawModule.modules) {
    forEachValue(rawModule.modules, function (rawChildModule, key) {
      this$1.register(path.concat(key), rawChildModule, runtime);
    });
  }
};

/**
 * 卸载模块列表中的模块
 * @description 卸载模块中的模块
 * @param path [key]
 */
ModuleCollection.prototype.unregister = function unregister (path) {
  var parent = this.get(path.slice(0, -1));
  var key = path[path.length - 1];
  if (!parent.getChild(key).runtime) { return }

  parent.removeChild(key);
};

/**
 * 更新模块
 * @description 更新模块
 * @param targetModule [目标模块]
 * @param newModule [新模块]
 */
function update (targetModule, newModule) {
  // update target module
  // 更新目标模块
  targetModule.update(newModule);

  // update nested modules
  // 更新嵌套模块
  if (newModule.modules) {
    for (var key in newModule.modules) {
      if (!targetModule.getChild(key)) {
        console.warn(
          "[vuex] trying to add a new module '" + key + "' on hot reloading, " +
          'manual reload is needed'
        );
        return
      }
      update(targetModule.getChild(key), newModule.modules[key]);
    }
  }
}

// 在install方法调用时绑定的
var Vue; // bind on install

var Store = function Store (options) {
  var this$1 = this;
  if ( options === void 0 ) options = {};

  assert(Vue, "must call Vue.use(Vuex) before creating a store instance.");
  assert(typeof Promise !== 'undefined', "vuex requires a Promise polyfill in this browser.");

  var state = options.state; if ( state === void 0 ) state = {};
  var plugins = options.plugins; if ( plugins === void 0 ) plugins = [];
  var strict = options.strict; if ( strict === void 0 ) strict = false;

  // store internal state
  // 保持内部状态
  this._committing = false;
  this._actions = Object.create(null);
  this._mutations = Object.create(null);
  this._wrappedGetters = Object.create(null);
  this._modules = new ModuleCollection(options);
  this._modulesNamespaceMap = Object.create(null);
  this._subscribers = [];
  this._watcherVM = new Vue();

  // bind commit and dispatch to self
  // 绑定this始终指向自己
  var store = this;
  var ref = this;
  var dispatch = ref.dispatch;
  var commit = ref.commit;
  this.dispatch = function boundDispatch (type, payload) {
    return dispatch.call(store, type, payload)
  };
  this.commit = function boundCommit (type, payload, options) {
    return commit.call(store, type, payload, options)
  };

  // strict mode
  this.strict = strict;

  // init root module.
  // this also recursively registers all sub-modules
  // and collects all module getters inside this._wrappedGetters

  // 初始化根模块
  // 这也递归地登记所有子模块并收集所有模块在_wrappedgetters中的getters。
  installModule(this, state, [], this._modules.root);

  // initialize the store vm, which is responsible for the reactivity
  // (also registers _wrappedGetters as computed properties)
  // 初始化存储的虚拟机，这是负责的响应式（还注册_wrappedgetters做computed属性）
  resetStoreVM(this, state);

  // apply plugins
  // 应用插件
  plugins.concat(devtoolPlugin).forEach(function (plugin) { return plugin(this$1); });
};

/**
 * 定义Store原型上的state的属性,根状态
 */
var prototypeAccessors = { state: {} };

prototypeAccessors.state.get = function () {
  return this._vm._data.$$state
};

prototypeAccessors.state.set = function (v) {
  assert(false, "Use store.replaceState() to explicit replace store state.");
};

/**
 * 提交mutation
 * @description 提交mutation
 * @param _type [事件类型]
 * @param _payload [mutation的载荷]
 * @param _options [options]
 */
Store.prototype.commit = function commit (_type, _payload, _options) {
    var this$1 = this;

  // check object-style commit
  // 检测commit对象
  var ref = unifyObjectStyle(_type, _payload, _options);
    var type = ref.type;
    var payload = ref.payload;
    var options = ref.options;

  var mutation = { type: type, payload: payload };
  var entry = this._mutations[type];
  if (!entry) {
    console.error(("[vuex] unknown mutation type: " + type));
    return
  }
  // 确保state修改走的是mutation函数修改的
  this._withCommit(function () {
    entry.forEach(function commitIterator (handler) {
      // 为什么此处只传一个参数，而代码声明是传的(state,payload)
      // 具体代码参见 registerMutation函数，
      handler(payload);
    });
  });
  this._subscribers.forEach(function (sub) { return sub(mutation, this$1.state); });

  if (options && options.silent) {
    console.warn(
      "[vuex] mutation type: " + type + ". Silent option has been removed. " +
      'Use the filter functionality in the vue-devtools'
    );
  }
};

/**
 * 分发action，返回action方法的返回值，如果多个处理函数被触发，那么返回一个Promise
 * @description 分发action
 * @param _type [事件类型]
 * @param _payload [mutation的载荷]
 */
Store.prototype.dispatch = function dispatch (_type, _payload) {
  // check object-style dispatch
  // 检测dispatch参数
  var ref = unifyObjectStyle(_type, _payload);
    var type = ref.type;
    var payload = ref.payload;

  var entry = this._actions[type];
  if (!entry) {
    console.error(("[vuex] unknown action type: " + type));
    return
  }
  return entry.length > 1
    ? Promise.all(entry.map(function (handler) { return handler(payload); }))
    : entry[0](payload)
};

/**
 * 注册监听store的mutation，handler会在每个mutation完成后调用，
 * 接收mutation和经过mutation后的状态作为参数
 * @description 注册监听store的mutation
 * @param fn [handler]
 */
Store.prototype.subscribe = function subscribe (fn) {
  var subs = this._subscribers;
  if (subs.indexOf(fn) < 0) {
    subs.push(fn);
  }
  return function () {
    var i = subs.indexOf(fn);
    if (i > -1) {
      subs.splice(i, 1);
    }
  }
};

/**
 * 响应式地监测一个getter方法的返回值，当值变化时调用回调函数，getter接收store的状态作为唯一参数，
 * 接收一个可选的对象参数表示Vue的vm.$watch方法的参数
 * @description 响应式地监测一个getter方法的返回值
 * @param getter [getter]
 * @param cb [callback]
 * @param options [options]
 */
Store.prototype.watch = function watch (getter, cb, options) {
  var this$1 = this;

  assert(typeof getter === 'function', "store.watch only accepts a function.");
  return this._watcherVM.$watch(function () { return getter(this$1.state, this$1.getters); }, cb, options)
};

/**
 * 替换store的根状态，仅用状态合并或time-travel调试
 * @description 替换store的根状态
 * @param state [object]
 */
Store.prototype.replaceState = function replaceState (state) {
  var this$1 = this;

  this._withCommit(function () {
    this$1._vm._data.$$state = state;
  });
};

/**
 * 注册一个动态模块
 * @description 注册一个动态模块
 * @param path [path]
 * @param rawModule [module]
 */
Store.prototype.registerModule = function registerModule (path, rawModule) {
  if (typeof path === 'string') { path = [path]; }
  assert(Array.isArray(path), "module path must be a string or an Array.");
  this._modules.register(path, rawModule);
  // 初始化模块
  installModule(this, this.state, path, this._modules.get(path));
  // reset store to update getters...
  // 重置store并更新getters
  resetStoreVM(this, this.state);
};

/**
 * 卸载一个动态模块,注意，不能使用此方法卸载静态模块（在创建store时声明的模块）
 * @description 卸载一个动态模块
 * @param path [path]
 */
Store.prototype.unregisterModule = function unregisterModule (path) {
  var this$1 = this;

  if (typeof path === 'string') { path = [path]; }
  assert(Array.isArray(path), "module path must be a string or an Array.");
  this._modules.unregister(path);
  this._withCommit(function () {
    var parentState = getNestedState(this$1.state, path.slice(0, -1));
    Vue.delete(parentState, path[path.length - 1]);
  });
  resetStore(this);
};

/**
 * 热替换新的action和mutation
 * @description 热替换新的action和mutation
 * @param newOptions [options]
 */
Store.prototype.hotUpdate = function hotUpdate (newOptions) {
  this._modules.update(newOptions);
  resetStore(this, true);
};

/**
 * 处理commit事件
 * @description 处理commit事件
 * @param fn [function]
 */
Store.prototype._withCommit = function _withCommit (fn) {
  var committing = this._committing;
  this._committing = true;
  fn();
  this._committing = committing;
};

// 根状态，只读
Object.defineProperties( Store.prototype, prototypeAccessors );

/**
 * 重新设置Store
 * @description 冲洗设置Store
 * @param store [store]
 * @param hot [hot]
 */
function resetStore (store, hot) {
  store._actions = Object.create(null);
  store._mutations = Object.create(null);
  store._wrappedGetters = Object.create(null);
  store._modulesNamespaceMap = Object.create(null);
  var state = store.state;
  // init all modules
  // 重新初始化所有模块
  installModule(store, state, [], store._modules.root, true);
  // reset vm
  // 重置vm
  resetStoreVM(store, state, hot);
}

/**
 * 重置vm
 * @description 重置vm
 */
function resetStoreVM (store, state, hot) {
  var oldVm = store._vm;

  // bind store public getters
  store.getters = {};
  var wrappedGetters = store._wrappedGetters;
  var computed = {};
  forEachValue(wrappedGetters, function (fn, key) {
    // use computed to leverage its lazy-caching mechanism
    // 使用计算来利用它的懒惰缓存机制
    computed[key] = function () { return fn(store); };
    Object.defineProperty(store.getters, key, {
      get: function () { return store._vm[key]; },
      enumerable: true // for local getters
    });
  });

  // use a Vue instance to store the state tree
  // suppress warnings just in case the user has added
  // some funky global mixins
  // 使用Vue的实例来存储状态树,在用户添加的情况下，抑制警告

  var silent = Vue.config.silent;
  Vue.config.silent = true;
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed: computed
  });
  Vue.config.silent = silent;

  // enable strict mode for new vm
  // 启用严格模式
  if (store.strict) {
    enableStrictMode(store);
  }

  if (oldVm) {
    if (hot) {
      // dispatch changes in all subscribed watchers
      // to force getter re-evaluation for hot reloading.
      store._withCommit(function () {
        oldVm._data.$$state = null;
      });
    }
    Vue.nextTick(function () { return oldVm.$destroy(); });
  }
}

/**
 * 初始化模块
 * @description 初始化模块
 * @param store [store]
 * @param rootState [rootState]
 * @param path [path]
 * @param module [module]
 * @param hot [hot]
 */
function installModule (store, rootState, path, module, hot) {
  // 初始化时path为[],则isRoot = true;
  var isRoot = !path.length;
  var namespace = store._modules.getNamespace(path);

  // register in namespace map
  // 在命名空间map中注册
  if (namespace) {
    store._modulesNamespaceMap[namespace] = module;
  }

  // set state 设置state
  if (!isRoot && !hot) {
    // 不是根模块并且不是hot
    var parentState = getNestedState(rootState, path.slice(0, -1));
    var moduleName = path[path.length - 1];
    store._withCommit(function () {
      Vue.set(parentState, moduleName, module.state);
    });
  }
  // 对于模块内部的mutation和getter,接收的第一个参数是模块的局部状态
  // 同样，对于模块内部的action，context.state是局部状态，根节点的状态是context.rootState

  // 获取上下文环境
  var local = module.context = makeLocalContext(store, namespace, path);

  // 遍历mutations并注册mutation
  module.forEachMutation(function (mutation, key) {
    var namespacedType = namespace + key;
    registerMutation(store, namespacedType, mutation, local);
  });

  // 遍历actions并注册action
  module.forEachAction(function (action, key) {
    var namespacedType = namespace + key;
    registerAction(store, namespacedType, action, local);
  });

  // 遍历getters并注册getter
  module.forEachGetter(function (getter, key) {
    var namespacedType = namespace + key;
    registerGetter(store, namespacedType, getter, local);
  });

  // 遍历子组件并注册子组件
  module.forEachChild(function (child, key) {
    installModule(store, rootState, path.concat(key), child, hot);
  });
}

/**
 * make localized dispatch, commit, getters and state
 * if there is no namespace, just use root ones
 * 使局部变量dispatch、commit、getters和state
 * 如果没有命名空间，只需使用根
 * 
 * @description 设置局部环境
 * @param store [store]
 * @param namespace [namespace]
 * @param path [path]
 */
function makeLocalContext (store, namespace, path) {
  var noNamespace = namespace === '';

  var local = {
    dispatch: noNamespace ? store.dispatch : function (_type, _payload, _options) {
      var args = unifyObjectStyle(_type, _payload, _options);
      var payload = args.payload;
      var options = args.options;
      var type = args.type;

      if (!options || !options.root) {
        type = namespace + type;
        if (!store._actions[type]) {
          console.error(("[vuex] unknown local action type: " + (args.type) + ", global type: " + type));
          return
        }
      }

      return store.dispatch(type, payload)
    },

    commit: noNamespace ? store.commit : function (_type, _payload, _options) {
      var args = unifyObjectStyle(_type, _payload, _options);
      var payload = args.payload;
      var options = args.options;
      var type = args.type;

      if (!options || !options.root) {
        type = namespace + type;
        if (!store._mutations[type]) {
          console.error(("[vuex] unknown local mutation type: " + (args.type) + ", global type: " + type));
          return
        }
      }

      store.commit(type, payload, options);
    }
  };

  // getters and state object must be gotten lazily
  // because they will be changed by vm update
  // getters和state对象必须得惰性获取，因为它们会被VM更新改变
  Object.defineProperties(local, {
    getters: {
      get: noNamespace
        ? function () { return store.getters; }
        : function () { return makeLocalGetters(store, namespace); }
    },
    state: {
      get: function () { return getNestedState(store.state, path); }
    }
  });

  return local
}

/**
 * 获取局部getters
 * @description 获取局部getters
 * @param store [store]
 * @param namespace [namespace]
 */
function makeLocalGetters (store, namespace) {
  // 定义getters代理对象
  var gettersProxy = {};

  var splitPos = namespace.length;
  Object.keys(store.getters).forEach(function (type) {
    // skip if the target getter is not match this namespace
    // 如果目标getter不匹配此命名空间则跳过
    if (type.slice(0, splitPos) !== namespace) { return }

    // extract local getter type
    // 提取局部getter的type(key)
    var localType = type.slice(splitPos);

    // Add a port to the getters proxy.
    // Define as getter property because
    // we do not want to evaluate the getters in this time.
    // 为getters代理添加一个窗口，定义getter属性，
    // 因为我们不想在此计算getters
    Object.defineProperty(gettersProxy, localType, {
      get: function () { return store.getters[type]; },
      enumerable: true
    });
  });

  return gettersProxy
}

/**
 * 注册mutation
 * @description 注册mutation
 * @param store [store]
 * @param type [key]
 * @param handler [handler]
 * @param local [上下文环境]
 */
function registerMutation (store, type, handler, local) {
  var entry = store._mutations[type] || (store._mutations[type] = []);
  entry.push(function wrappedMutationHandler (payload) {
    handler(local.state, payload);
  });
}

/**
 * 注册action
 * @description 注册action
 * @param store [store]
 * @param type [key]
 * @param handler [handler]
 * @param local [local]
 */
function registerAction (store, type, handler, local) {
  var entry = store._actions[type] || (store._actions[type] = []);
  entry.push(function wrappedActionHandler (payload, cb) {
    var res = handler({
      dispatch: local.dispatch,
      commit: local.commit,
      getters: local.getters,
      state: local.state,
      rootGetters: store.getters,
      rootState: store.state
    }, payload, cb);
    if (!isPromise(res)) {
      res = Promise.resolve(res);
    }
    if (store._devtoolHook) {
      return res.catch(function (err) {
        store._devtoolHook.emit('vuex:error', err);
        throw err
      })
    } else {
      return res
    }
  });
}

/**
 * 注册getter
 * @description 注册getter
 * @param store [store]
 * @param type [key]
 * @param rawGetter [rawGetter]
 * @param local [local]
 */
function registerGetter (store, type, rawGetter, local) {
  if (store._wrappedGetters[type]) {
    // getter的key不能重复
    console.error(("[vuex] duplicate getter key: " + type));
    return
  }
  store._wrappedGetters[type] = function wrappedGetter (store) {
    return rawGetter(
      local.state, // local state
      local.getters, // local getters
      store.state, // root state
      store.getters // root getters
    )
  };
}

/**
 * 在严格模式下，无论何时发生了状态变更且不是有mutation函数引起的，
 * 将会抛出错误，这样保证所有的状态变更都能被调试工具跟踪到。
 * 不要在发布环境下启用严格模式！严格模式会深度检测状态树来检测不合常规的状态变更，
 * 请确保在发布环境下关闭严格模式，以避免性能损失。
 * 启用严格模式
 * @description 启用严格模式
 * @param store [store]
 */
function enableStrictMode (store) {
  store._vm.$watch(function () { return this._data.$$state }, function () {
    assert(store._committing, "Do not mutate vuex store state outside mutation handlers.");
  }, { deep: true, sync: true });
}

/**
 * 得到嵌套的state
 * @description 得到嵌套的state
 * @param state [state]
 * @param path [key]
 */
function getNestedState (state, path) {
  return path.length
    ? path.reduce(function (state, key) { return state[key]; }, state)
    : state
}

/**
 * 统一commit对象方式
 * @description 统一commit对象方式
 * @param type [type]
 * @param payload [payload]
 * @param options [options]
 */
function unifyObjectStyle (type, payload, options) {
  if (isObject(type) && type.type) {
    options = payload;
    payload = type;
    type = type.type;
  }

  assert(typeof type === 'string', ("Expects string as the type, but found " + (typeof type) + "."));

  return { type: type, payload: payload, options: options }
}

/**
 * Vuex插件初始化
 */
function install (_Vue) {
  if (Vue) {
    console.error(
      '[vuex] already installed. Vue.use(Vuex) should be called only once.'
    );
    return
  }
  Vue = _Vue;
  applyMixin(Vue);
}

// auto install in dist mode
// 在分布模式下自动安装
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

/**
 * 创建组件的计算属性返回Vuex.store中的状态
 */
var mapState = normalizeNamespace(function (namespace, states) {
  var res = {};
  normalizeMap(states).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;

    res[key] = function mappedState () {
      var state = this.$store.state;
      var getters = this.$store.getters;
      if (namespace) {
        var module = getModuleByNamespace(this.$store, 'mapState', namespace);
        if (!module) {
          return
        }
        state = module.context.state;
        getters = module.context.getters;
      }
      return typeof val === 'function'
        ? val.call(this, state, getters)
        : state[val]
    };
    // mark vuex getter for devtools
    res[key].vuex = true;
  });
  return res
});

/**
 * 创建组件方法提交mutation
 */
var mapMutations = normalizeNamespace(function (namespace, mutations) {
  var res = {};
  normalizeMap(mutations).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;

    val = namespace + val;
    res[key] = function mappedMutation () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      if (namespace && !getModuleByNamespace(this.$store, 'mapMutations', namespace)) {
        return
      }
      return this.$store.commit.apply(this.$store, [val].concat(args))
    };
  });
  return res
});

/**
 * 创建组件的计算属性返回getter的返回值
 */
var mapGetters = normalizeNamespace(function (namespace, getters) {
  var res = {};
  normalizeMap(getters).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;

    val = namespace + val;
    res[key] = function mappedGetter () {
      if (namespace && !getModuleByNamespace(this.$store, 'mapGetters', namespace)) {
        return
      }
      if (!(val in this.$store.getters)) {
        console.error(("[vuex] unknown getter: " + val));
        return
      }
      return this.$store.getters[val]
    };
    // mark vuex getter for devtools
    res[key].vuex = true;
  });
  return res
});

/**
 * 创建组件方法分发action
 */
var mapActions = normalizeNamespace(function (namespace, actions) {
  var res = {};
  normalizeMap(actions).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;

    val = namespace + val;
    res[key] = function mappedAction () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      if (namespace && !getModuleByNamespace(this.$store, 'mapActions', namespace)) {
        return
      }
      return this.$store.dispatch.apply(this.$store, [val].concat(args))
    };
  });
  return res
});

/**
 * map规范化
 * @description map规范化
 * @param map [map]
 */
function normalizeMap (map) {
  return Array.isArray(map)
    ? map.map(function (key) { return ({ key: key, val: key }); })
    : Object.keys(map).map(function (key) { return ({ key: key, val: map[key] }); })
}

/**
 * 命名空间规范化
 * @description 命名空间规范化
 * @param fn [function]
 */
function normalizeNamespace (fn) {
  return function (namespace, map) {
    if (typeof namespace !== 'string') {
      map = namespace;
      namespace = '';
    } else if (namespace.charAt(namespace.length - 1) !== '/') {
      namespace += '/';
    }
    return fn(namespace, map)
  }
}

/**
 * 由命名空间获取模块
 * @description 由命名空间获取模块
 * @param store [store]
 * @param helper [helper]
 * @param namespace [namespace]
 */
function getModuleByNamespace (store, helper, namespace) {
  var module = store._modulesNamespaceMap[namespace];
  if (!module) {
    console.error(("[vuex] module namespace not found in " + helper + "(): " + namespace));
  }
  return module
}

// 生成对象
var index = {
  Store: Store,
  install: install,
  version: '2.2.1',
  // 组件绑定的辅助函数
  mapState: mapState,
  mapMutations: mapMutations,
  mapGetters: mapGetters,
  mapActions: mapActions
};
// 返回对象
return index;

})));
