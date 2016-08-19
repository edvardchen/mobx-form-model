'use strict';

require('should');

var _ = require('./');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * @Author: edvardchen
 * @Date:   2016-08-19 22:49:08
 * @Last Modified by:   edvardchen
 * @Last Modified time: 2016-08-19 22:52:47
 */

describe('greeting', function () {
  it('type check', function () {
    return _2.default.should.be.type('function');
  });
});