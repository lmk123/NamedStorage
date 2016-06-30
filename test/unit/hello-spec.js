/* eslint-env jasmine */

describe('storage.js', function () {
  it('直接引用时会成为一个全局变量', function () {
    expect(typeof window.NamedStorage).toBe('function')
  })
})
