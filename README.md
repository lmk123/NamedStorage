[![Build Status](https://img.shields.io/travis/lmk123/NamedStorage/master.svg?style=flat-square)](https://travis-ci.org/lmk123/NamedStorage)
[![Coverage Status](https://img.shields.io/coveralls/lmk123/NamedStorage/master.svg?style=flat-square)](https://coveralls.io/github/lmk123/NamedStorage?branch=master)
[![NPM Version](https://img.shields.io/npm/v/namedstorage.svg?style=flat-square)](https://www.npmjs.com/package/namedstorage)
[![dependencies Status](https://img.shields.io/david/lmk123/NamedStorage.svg?style=flat-square)](https://david-dm.org/lmk123/NamedStorage)
[![devDependencies Status](https://img.shields.io/david/dev/lmk123/NamedStorage.svg?style=flat-square)](https://david-dm.org/lmk123/NamedStorage#info=devDependencies)

# NamedStorage

更高效的使用 `localStorage` 与 `sessionStorage`。

下文统一使用 WebStorage 来表示 `localStorage` 与 `sessionStorage`。

## 特点及使用示例

### JSON 友好

读取与存储的都是 JSON 数据, 这意味着你能保留数据类型:

```js
const ls = new NamedStorage('local')
ls.set('key', 1)
typeof ls.get('key') // "number"
```

### 命名空间

初始化 NamedStorage 实例时, 你可以提供一个命名空间(**NamedStorage 默认提供了一个命名空间——`"d"`, 即 default 的首字母**), 则对此实例的所有增删改查操作都会以这个命名空间作为前缀, 这能有效的避免冲突:

```js
const foo = new NamedStorage('local', { name: 'foo' })
const bar = new NamedStorage('local', { name: 'bar' })
foo.set('bar', 1)
bar.set('bar', 2)
localStorage.getItem('bar') // null
localStorage.getItem('foo:bar') // "1"
localStorage.getItem('bar:bar') // "2"

```

相同的存储空间与命名空间会得到同一个实例:

```js
const ss1 = new NamedStorage('session', { name: 'foo', cache: false })
const ss2 = new NamedStorage('session', { name: 'foo', cache: true }) // 因为是同一个实例, 所以重新定义 `cache` 与 `lazySave` 配置不会生效
ss1 === ss2 // true

const ls = new NamedStorage('local', { name: 'foo' })
ls === ss1 // false
```

因为有了命名空间的支持, 所以清空此实例的数据时可以选择只清空此命名空间内的数据, 而不是清空整个 WebStorage。

```js
const ls = new NamedStorage('local', { name: 'foo' })
ls.set('bar', 1)
localStorage.getItem('foo:bar') // '1'
localStorage.setItem('bar', '2')

ls.clear()
ls.get('bar') // undefined
localStorage.getItem('foo:bar') // null
localStorage.getItem('bar') // '2'

ls.clear(true)
localStorage.getItem('bar') // null
```

### 缓存数据

相比起每次读取数据时都从 WebStorage 内读取, NamedStorage 能缓存第一次读取的值, 并在后面读取时直接使用缓存值。

### "懒保存"

NamedStorage 提供一个"懒保存"的功能, 如果启用的话, 则每次设置值时不会直接保存到 WebStorage 中, 而是在 `window.onunload` 事件中统一保存:

```js
const ls = new NamedStorage('local', { lazySave: true })
ls.set('foo', 'bar')
localStorage.getItem('d:foo') // null
window.dispatchEvent(new Event('unload'))
localStorage.getItem('d:foo') // "\"bar\""
```

**注意:** 在某些移动设备上 `unload` 事件不一定会触发, 所以请慎用此功能。

## API

### new NamedStorage(type[, options])

### type (String)

"local" 或 "session", 分别对应 `localStorage` 和 `sessionStorage`。

### options.cache (Boolean)

默认值为 `true`。设为 `false` 可禁用缓存功能。详情见[缓存数据](#缓存数据)。

### options.name (String)

此实例的命名空间, 默认为 `"d"`。详情见[命名空间](#命名空间)。

```js
const ls = new NamedStorage('local', { name: 'hello' })
ls.namespace // 'hello:' -> 后面多了一个冒号
```

### options.lazySave (Boolean)

默认值为 `false`。**启用此功能需要启用缓存**。详情见["懒保存"](#懒保存)。

### 方法

### NamedStorage.prototype.set(key[, value])

设置数据。如果 `value` 是 `null` 或 `undefined` 则删除这个数据。

### NamedStorage.prototype.get(key)

获取数据。

### NamedStorage.prototype.remove(key)

删除数据。

### NamedStorage.prototype.clear(whole)

默认情况下, 这个方法只会删除当前命名空间内的数据, 但如果指定 `whole` 为 `true`, 则会删除整个 WebStorage 内的数据。详情见[命名空间](#命名空间)。

### 属性

不要去更改这些属性的值, 你应该把这些属性都视为只读的。

### this.storage

当前实例指向的存储空间, `localStorage` 或 `sessionStorage`。

### this.useCache (Boolean)

当前实例是否启用了缓存功能。

### this.caches (Object)

缓存的数据。如果没有启用缓存功能, 则此对象是一个 `undefined`。

### this.name (String)

当前实例的命名空间。

### this.saveOnUnload (Boolean)

当前实例是否启用了["懒保存"](#懒保存)功能。

## 陷阱

### NamedStorage 提供了一个默认的命名空间——`"d"`

如果你不自定义 `name` 的话, 你每次得到的都是同一个实例:

```js
const s1 = new NamedStorage('local', { cache: false })
const s2 = new NamedStorage('local', { cache: true })
s1 === s2 // true
s2.namespace === 'd:' // true
s2.useCache // false
```

### 如果你启用了缓存, 则直接更改 WebStorage 内的值不会反映到 NamedStorage

```js
const ls = new NamedStorage('local')
ls.set('foo', 'bar')
localStorage.getItem('d:foo') // 'bar

localStorage.setItem('d:foo', 'changed')
ls.get('foo') // 'bar'
```

推荐统一使用 NamedStorage 操作存储空间。

## 许可

MIT
