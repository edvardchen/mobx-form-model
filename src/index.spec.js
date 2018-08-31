import 'should';

import FormController from './';

describe('mobx-form', () => {
  describe('FormController', () => {
    it('dirty', () => {
      const ctrl = new FormController('');
      ctrl.dirty.should.be.false();
      ctrl.update('abc');
      ctrl.dirty.should.be.true();
    });
  });
});
