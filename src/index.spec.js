/*
 * @Author: edvardchen
 * @Date:   2016-08-19 22:49:08
 * @Last Modified by:   edvardchen
 * @Last Modified time: 2016-08-31 12:12:59
 */

import 'should';

import greeting from './';

describe('greeting', () => {
  it('type check', () => {
    greeting.should.be.type('function');
    greeting();
  });
});
