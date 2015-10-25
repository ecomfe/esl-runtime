/**
 *
 * @file 加载器，符合AMD规范
 * config 只支持map、plugin、config
 * @author dxh
 */

var define;
var require;

(function (global) {
    var mods = {};

    var config = {
        config: {}, // 相应的模块调用module.config(), 获取信息
        map: {} // 对于给定的模块前缀，使用一个不同的模块ID来加载该模块
    };

    /**
     * 定义模块
     *
     * @param {string} id 模块标识
     * @param {Array.<string>} deps 显式声明的依赖模块列表
     * @param {*} factory 模块定义函数或模块对象
     */
    define = function (id, deps, factory) {
        if (typeof id !== 'string') {
            throw new Error('[BUILD ERROR]: incorrect module build, no module name');
        }

        if (!deps.splice) {
            factory = deps;
            deps = [];
        }

        if (!mods[id]) {
            mods[id] = {
                id: id,
                deps: !deps.length ? ['require', 'exports', 'module'] : deps,
                factory: factory,
                defined: 0,
                exports: {},
                config: moduleConfigGetter,
                require: createRequire(id)
            };
        }
    };

    define.amd = {};

    /**
     * 创建local require函数
     *
     * @param {number} baseId 当前module id
     * @return {Function} local require函数
     */
    function createRequire(baseId) {
        var cacheMods = {};

        function localRequire(id, callback) {
            if (typeof id === 'string') {
                var exports = cacheMods[id];
                if (!exports) {
                    var topLevelId = normalize(id, baseId);
                    exports = getModExports(topLevelId, baseId);
                    cacheMods[id] = exports;
                }
                return exports;
            }
            else if (id instanceof Array) {
                callback = callback || function () {};
                callback.apply(this, getModsExports(id, baseId));
            }
        }

        return localRequire;
    }

    /**
     * id normalize化
     *
     * @inner
     * @param {string} id 需要normalize的模块标识
     * @param {string} baseId 当前环境的模块标识
     * @return {string} normalize结果
     */
    function normalize(id, baseId) {
        if (!id) {
            return '';
        }

        baseId = baseId || '';
        var idInfo = parseId(id);

        if (!idInfo) {
            return id;
        }

        var resourceId = idInfo.res;

        // 将相对路径调整为绝对路径
        var moduleId = relative2absolute(idInfo.mod, baseId);

        // 根据config中的map配置进行module id mapping
        moduleId = mappingModuleId(moduleId, baseId);

        // 如果有plugin!resource的话，对resource进行normalize
        if (resourceId) {
            var mod = require(moduleId);
            // 有自定义的normalize用自定义的
            resourceId = mod && mod.normalize
                ? mod.normalize(
                    resourceId,
                    function (resId) {
                        return normalize(resId, baseId);
                    }
                  )
                : normalize(resourceId, baseId);

            moduleId += '!' + resourceId;
        }

        return moduleId;
    }

    /**
     * 解析id，返回带有module和resource属性的Object
     *
     * @inner
     * @param {string} id 标识
     * @return {Object} id解析结果对象
     */
    function parseId(id) {
        var segs = id.split('!');

        if (segs[0]) {
            return {
                mod: segs[0],
                res: segs[1]
            };
        }
    }

    /**
     * 相对id转换成绝对id
     *
     * @inner
     * @param {string} id 要转换的相对id
     * @param {string} baseId 当前所在环境id
     * @return {string} 绝对id
     */
    function relative2absolute(id, baseId) {
        if (id.indexOf('.') !== 0) {
            return id;
        }

        var segs = baseId.split('/').slice(0, -1).concat(id.split('/'));
        var res = [];
        for (var i = 0; i < segs.length; i++) {
            var seg = segs[i];

            switch (seg) {
                case '.':
                    break;
                case '..':
                    if (res.length && res[res.length - 1] !== '..') {
                        res.pop();
                    }
                    else { // allow above root
                        res.push(seg);
                    }
                    break;
                default:
                    seg && res.push(seg);
            }
        }

        return res.join('/');
    }

    /**
     * 根据config中的map配置进行module id mapping
     *
     * @inner
     * @param {string} moduleId 要mapping的moduleId
     * @param {string} baseId 当前所在环境id
     * @return {string} mapped moduleId
     */
    function mappingModuleId(moduleId, baseId) {
        // 将config.map中的key 按照长度排序 生成元素为对象的数组
        var mapIdIndex = objToKvregArr(config.map).sort(descSorterByKOrName);
        // 将config.map中每一项的value 成按长度 生产各项元素为对象的数据
        each(mapIdIndex, function (item) {
                item.v = objToKvregArr(item.v).sort(descSorterByKOrName);
            }
        );

        indexRetrieve(
            baseId,
            mapIdIndex,
            function (value) {
                indexRetrieve(
                    moduleId,
                    value,
                    function (mdValue, mdKey) {
                        moduleId = moduleId.replace(mdKey, mdValue);
                    }
                );
            }
        );

        return moduleId;
    }

    /**
     * 对配置信息的索引进行检索
     *
     * @inner
     * @param {string} value 要检索的值
     * @param {Array} index 索引对象
     * @param {Function} hitBehavior 索引命中的行为函数
     */
    function indexRetrieve(value, index, hitBehavior) {
        each(index, function (item) {
            if (item.reg.test(value)) {
                hitBehavior(item.v, item.k, item);
                return false;
            }
        });
    }

    /**
     * 将对象数据转换成数组，数组每项是带有k、v、reg的Object
     *
     * @inner
     * @param {Object} obj 对象数据
     * @return {Array.<Object>} 对象转换数组
     */
    function objToKvregArr(obj) {
        var arr = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                var item = {
                    k: key,
                    v: obj[key],
                    reg: key === '*'
                                ? /^/
                                : new RegExp('^' + key + '(/|$)')
                };
                arr.push(item);
            }
        }
        return arr;
    }

    /**
     * 根据元素的k或name项进行数组字符数逆序的排序函数
     *
     * @inner
     * @param {Object} a 要比较的对象a
     * @param {Object} b 要比较的对象b
     * @return {number} 比较结果
     */
    function descSorterByKOrName(a, b) {
        var aValue = a.k || a.name;
        var bValue = b.k || b.name;

        if (bValue === '*') {
            return -1;
        }

        if (aValue === '*') {
            return 1;
        }

        return bValue.length - aValue.length;
    }

    /**
     * 循环遍历数组集合
     *
     * @inner
     * @param {Array} source 数组源
     * @param {function(Array,Number):boolean} iterator 遍历函数
     */
    function each(source, iterator) {
        if (source instanceof Array) {
            for (var i = 0, len = source.length; i < len; i++) {
                if (iterator(source[i], i) === false) {
                    break;
                }
            }
        }
    }

    /**
     * 模块配置获取函数
     *
     * @inner
     * @return {Object} 模块配置对象
     */
    function moduleConfigGetter() {
        var conf = config.config[this.id];
        if (conf && typeof conf === 'object') {
            return conf;
        }
        return {};
    }

    require = createRequire('');

    /**
     * 配置require 支持多处配置 二级mix
     *
     * @param {Object} conf 配置对象
     */
    require.config = function (conf) {
        if (conf) {
            for (var key in config) {
                if (config.hasOwnProperty(key)) {
                    var newValue = conf[key];
                    var oldValue = config[key];
                    if (!newValue) {
                        continue;
                    }
                    if (oldValue instanceof Array) {
                        oldValue.push.apply(oldValue, newValue);
                    }
                    else if (typeof oldValue === 'object') {
                        for (var k in newValue) {
                            if (newValue.hasOwnProperty(k)) {
                                oldValue[k] = newValue[k];
                            }
                        }
                    }
                    else {
                        config[key] = newValue;
                    }
                }
            }
        }
    };

    /**
     * 执行模块factory函数，进行模块初始化
     *
     * @inner
     * @param {string} id 模块id
     * @param {string} baseId 当前环境的id
     * @return {*} 模块接口
     */
    function getModExports(id, baseId) {

        var mod = mods[id];

        if (!mod) {
            // 加载plugin插件
            if (id.indexOf('!') > 0) {
                return loadResource(id, baseId);
            }

            throw new Error('[MODULE_MISS]: ' + id + ' is not exist ');
        }

        // 正常插件
        if (!mod.defined) {
            var factory = mod.factory;
            var factoryReturn;
            if (typeof mod.factory === 'object') {
                factoryReturn = mod.factory;
            }
            else {
                var initDeps = mod.deps.slice(0);
                if (initDeps.length > factory.length) {
                    initDeps.length = factory.length;
                }
                factoryReturn = factory.apply(
                    this,
                    getModsExports(initDeps, id)
                );
            }

            if (typeof factoryReturn !== 'undefined') {
                mod.exports = factoryReturn;
            }

            mod.defined = 1;
        }

        return mod.exports;
    }

    /**
     * 执行模块factory函数，进行模块初始化
     *
     * @inner
     * @param {Array} ids 依赖模块组标识
     * @param {string} baseId 当前所在环境id
     *
     * @return {*} 模块接口
     */
    function getModsExports(ids, baseId) {
        var es = [];
        var mod = mods[baseId];
        // invoke deps which need
        for (var i = 0, l = ids.length; i < l; i++) {
            var id = normalize(ids[i], baseId);
            var arg;
            switch (id) {
                case 'require':
                    arg = (mod && mod.require) || require;
                    break;
                case 'exports':
                    arg = mod.exports;
                    break;
                case 'module':
                    arg = mod;
                    break;
                default:
                    arg = getModExports(id, baseId);
            }

            es.push(arg);
        }

        return es;
    }

    /**
     * 加载资源
     *
     * @inner
     * @param {string} pluginAndResource 插件与资源标识
     * @param {string} baseId 当前环境的模块标识
     * @return {*} 模块接口
     */
    function loadResource(pluginAndResource, baseId) {
        if (mods[pluginAndResource]) {
            return mods.exports;
        }
        // 加载插件资源
        var idInfo = parseId(pluginAndResource);
        var resource = {
            id: pluginAndResource
        };
        mods[pluginAndResource] = resource;
        load(require(idInfo.mod));
        return resource.exports;
        /**
         * 加载插件资源
         *
         * @param {Object} plugin 用于加载资源的插件模块
         */
        function load(plugin) {
            var pluginRequire = baseId
                ? mods[baseId].require
                : require;
            plugin.load(
                idInfo.res,
                pluginRequire,
                pluginOnload,
                moduleConfigGetter.call({id: pluginAndResource})
            );
        }

        /**
         * plugin加载完成的回调函数
         *
         * @param {*} value resource的值
         */
        function pluginOnload(value) {
            resource.exports = value || true;
        }
    }

})(this);
