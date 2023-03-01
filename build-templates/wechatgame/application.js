/*
 * @Description: 
 * @Version: 1.0
 * @Autor: liuhongbin
 * @Date: 2021-10-14 18:02:53
 * @LastEditors: liuhongbin
 * @LastEditTime: 2021-10-19 12:15:54
 */
System.register([], function (_export, _context) {
  "use strict";

  function createApplication(_ref) {
    // NOTE: before here we shall not import any module!
    var promise = Promise.resolve();
    promise = promise.then(function () {
      requirePlugin("cocos")
    }).then(function (_ref2) {
      return Promise.resolve()
    });
    return promise
  }

  _export("createApplication", createApplication);

  return {
    setters: [],
    execute: function () { }
  };
});