/*
 * @Author: edvardchen
 * @Date:   2016-08-19 22:49:08
 * @Last Modified by:   edvardchen
 * @Last Modified time: 2016-08-19 22:52:47
 */

import 'should';

import greeting from './';

describe('greeting', () => {
  it('type check', () => greeting.should.be.type('function'));
});
