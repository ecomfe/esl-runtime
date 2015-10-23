#esl-runtime
 esl-runtime 是[esl](https://github.com/ecomfe/esl)功能的子集

### 使用场景

- 当写一个基于esl的小项目，如果相对而言项目本身比esl还小时，不想加载esl
- 项目本身只需要一些基本功能时

可以选择在开发过程中使用esl来管理你的依赖，打包上线阶段将esl替换成esl-runtime.
### 限制&支持
###### 限制

+ 不支持模块动态加载
+ 不能使用 `require.toUrl(source, baseId)`
+ 无 `baseUrl、paths、packages、shim、waitSeconds、bundles、urlArgs`配置

###### 支持

+ `define(id, deps?, factory)`，必须写id
+ `require(string)、require(array, callback)`正常使用
+ 支持`require.config(options)`多处调用
+ 支持`map、config、map`配置
+ 支持`[pluginID]![resourceID]`

###下载
+ [esl-runtime源码](https://github.com/ecomfe/esl-runtime)