/* eslint-env jasmine */

describe('NamedStorage', function () {
  var localStorage = window.localStorage
  var sessionStorage = window.sessionStorage
  var Event = window.Event

  function uuid () {
    return String(Math.random() + Date.now())
  }

  afterEach(function () {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('会提供默认配置', function () {
    var l = new NamedStorage()
    expect(l.namespace).toBe('d:')
    expect(l.useCache).toBe(true)
    expect(l.saveOnUnload).toBeFalsy()
  })

  it('相同的存储空间与命名空间会得到同一个实例', function () {
    var ls1 = new NamedStorage({ name: 'x', cache: false })
    var ls2 = new NamedStorage({ name: 'x', cache: true })
    var ss1 = new NamedStorage('y')
    expect(ls2).toBe(ls1)
    expect(ss1).not.toBe(ls1)
    expect(ls2.useCache).toBe(false)
  })

  it('lazySave 功能需要启用缓存', function () {
    var l = new NamedStorage({ name: 'z', cache: false, lazySave: true })
    expect(l.saveOnUnload).toBeFalsy()
  })

  it('设置值时会保留数据类型', function () {
    var l = new NamedStorage({ name: uuid(), session: true })
    l.set('number', 1)
    l.set('boolean', true)
    l.set('string', 'hi')
    var array = [1, true, 'hi', undefined, null, function () {}]
    l.set('array', array)
    var obj = {
      a: 1,
      b: true,
      c: 'hi',
      d: function () {},
      e: undefined,
      f: null
    }
    l.set('object', obj)

    expect(l.get('number')).toBe(1)
    expect(sessionStorage.getItem(l.namespace + 'number')).toBe('1')

    expect(l.get('boolean')).toBe(true)
    expect(sessionStorage.getItem(l.namespace + 'boolean')).toBe('true')

    expect(l.get('string')).toBe('hi')
    expect(sessionStorage.getItem(l.namespace + 'string')).toBe('"hi"')

    expect(l.get('array')).toEqual([1, true, 'hi', null, null, null])
    expect(l.get('array')).not.toBe(array)
    expect(sessionStorage.getItem(l.namespace + 'array')).toBe('[1,true,"hi",null,null,null]')

    expect(l.get('object')).toEqual({
      a: 1,
      b: true,
      c: 'hi',
      f: null
    })
    expect(l.get('object')).not.toBe(obj)
    expect(sessionStorage.getItem(l.namespace + 'object')).toBe('{"a":1,"b":true,"c":"hi","f":null}')
  })

  it('设置与读取的对象不是同一个', function () {
    var l = new NamedStorage(uuid())
    var obj = {}
    l.set('obj', obj)
    var obj2 = l.get('obj')
    expect(obj).toEqual(obj2)
    expect(obj).not.toBe(obj2)

    expect(obj).toEqual(l.caches.obj)
    expect(obj).not.toBe(l.caches.obj)

    expect(obj2).toEqual(l.caches.obj)
    expect(obj2).not.toBe(l.caches.obj)
  })

  it('设置的值为 null 或 undefined 时会删除数据', function () {
    var l = new NamedStorage(uuid())
    l.set('x', 1)
    expect(localStorage.getItem(l.namespace + 'x')).toBe('1')
    l.set('x', null)
    expect(localStorage.getItem(l.namespace + 'x')).toBeNull()
    expect(l.get('x')).toBeUndefined()

    l.set('y', 2)
    expect(localStorage.getItem(l.namespace + 'y')).toBe('2')
    l.set('y')
    expect(localStorage.getItem(l.namespace + 'y')).toBeNull()
    expect(l.get('y')).toBeUndefined()
  })

  it('若启用缓存则读取值后会缓存这个值', function () {
    var l = new NamedStorage(uuid())
    localStorage.setItem(l.namespace + 'x', 'not json')
    expect(l.get('x')).toBe('not json')
    expect(l.caches.x).toBe('not json')
  })

  it('启用缓存时不会意识到 WebStorage 发生了变化', function () {
    var l = new NamedStorage(uuid())
    l.set('x', 1)
    expect(localStorage.getItem(l.namespace + 'x')).toBe('1')

    localStorage.setItem(l.namespace + 'x', '2')
    expect(l.get('x')).toBe(1)
  })

  it('关闭缓存后, 每次都会从 WebStorage 内读取数据', function () {
    var l = new NamedStorage({ name: uuid(), cache: false })
    l.set('x', 1)
    expect(localStorage.getItem(l.namespace + 'x')).toBe('1')

    localStorage.setItem(l.namespace + 'x', '2')
    expect(l.get('x')).toBe(2)
  })

  it('启用 lazySave 后, 只会在 window.onunload 事件时才会将数据写入存储空间', function () {
    var l = new NamedStorage({ name: uuid(), lazySave: true })
    l.set('x', 1)
    expect(localStorage.getItem(l.namespace + 'x')).toBeNull()
    try { // 某些环境下模拟 unload 事件会出错
      window.dispatchEvent(new Event('unload'))
      expect(localStorage.getItem(l.namespace + 'x')).toBe('1')
    } catch (e) {}
  })

  it('删除值', function () {
    var ls = new NamedStorage('local', { name: uuid() })
    ls.set('key', 'value')
    expect(ls.get('key')).toBe('value')
    expect(localStorage.getItem(ls.namespace + 'key')).toBe('"value"')

    ls.remove('key')
    expect(ls.get('key')).toBeUndefined()
    expect(localStorage.getItem(ls.namespace + 'key')).toBeNull()
  })

  it('清空时默认只会清空当前命名空间下的数据', function () {
    var ls = new NamedStorage(uuid())
    var ls2 = new NamedStorage(uuid())

    ls.set('key', 'value')
    localStorage.setItem(ls.namespace + 'key2', 'value2')
    ls2.set('key3', 'value3')

    ls.clear()
    expect(ls.get('key')).toBeUndefined()
    expect(localStorage.getItem(ls.namespace + 'key')).toBeNull()
    expect(localStorage.getItem(ls.namespace + 'key2')).toBeNull()
    expect(ls2.get('key3')).toBe('value3')
  })

  it('清空时传入 true 会清空当前存储空间的所有数据', function () {
    var ls = new NamedStorage(uuid())
    var ls2 = new NamedStorage(uuid())
    ls.set('key', 'value')
    localStorage.setItem('abc', 'value2')
    ls2.set('key3', 'value3')

    ls.clear(true)
    expect(ls.get('key')).toBeUndefined()
    expect(localStorage.getItem(ls.namespace + 'key')).toBeNull()
    expect(localStorage.getItem(ls.namespace + 'key2')).toBeNull()
    expect(localStorage.getItem('abc')).toBeNull()
    expect(ls2.get('key3')).toBeUndefined()
  })
})
