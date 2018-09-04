// @flow
import should from 'should';

import FormController, { FormControllerGroup, FormControllerArray } from '.';

declare var describe: any;
declare var it: any;

const required = ({ value }) =>
  value == null || (value.length !== undefined && value.length === 0)
    ? { required: true }
    : undefined;

describe('mobx-form', () => {
  describe('FormController', () => {
    it('dirty', () => {
      const ctrl = new FormController('');
      ctrl.dirty.should.be.false();
      ctrl.value.should.be.equal('');

      ctrl.update('abc');
      ctrl.value.should.be.equal('abc');
      ctrl.dirty.should.be.true();

      ctrl.markAsPristine();
      ctrl.dirty.should.be.false();
    });

    it('validate', () => {
      const ctrl = new FormController('', [required]);
      ctrl.valid.should.be.false();
      ctrl.errors.should.be.deepEqual({ required: true });
      ctrl.update('abc');
      ctrl.valid.should.be.true();
      should.not.exist(ctrl.errors);
    });
  });

  describe('FormControllerGroup', () => {
    it('value', () => {
      const name = new FormController('', [required]);
      const form = new FormControllerGroup({
        name
      });
      form.value.should.be.deepEqual({ name: '' });
    });

    it('dirty', () => {
      const name = new FormController('');
      const form = new FormControllerGroup({
        name
      });
      form.dirty.should.be.equal(false);
      form.ctrls.name.update('abc');
      form.dirty.should.be.equal(true);
      form.markAsPristine();
      form.dirty.should.be.equal(false);
      form.ctrls.name.update('abc');
      form.dirty.should.be.equal(true);
    });

    it('validate', () => {
      const name = new FormController('', [required]);
      const form = new FormControllerGroup({
        name
      });

      form.valid.should.be.false();
      name.update('abc');
      form.valid.should.be.true();
    });
  });

  it('cross-controller validator', () => {
    const form = new FormControllerGroup(
      {
        name: new FormController('edvard', [required]),
        country: new FormController('china', [required])
      },
      [
        // $FlowFixMe
        ({ ctrls: { name, country } }) =>
          country.value === 'china' && name.value.split(' ').length < 2
            ? {
                firstAndSecondName: true
              }
            : undefined
      ]
    );
    form.valid.should.be.false();
    form.ctrls.name.update('edvard chen');
    form.valid.should.be.true();
  });

  it('enable/disable controller', () => {
    const form = new FormControllerGroup({
      name: new FormController('', [required])
    });
    form.valid.should.be.false();
    form.ctrls.name.disable();
    form.valid.should.be.true();
    form.ctrls.name.enable();
    form.valid.should.be.false();
  });

  describe('nested group', () => {
    const nestedForm = new FormControllerGroup({
      name: new FormController('Tom'),
      firstStep: new FormControllerGroup({
        gender: new FormController(1),
        birthday: new FormController('', [required])
      }),
      secondStep: new FormControllerGroup({
        education: new FormController('bachelor')
      })
    });

    nestedForm.valid.should.be.false();
    // disable
    nestedForm.ctrls.firstStep.disable();
    nestedForm.valid.should.be.true();
    // enable
    nestedForm.ctrls.firstStep.enable();
    nestedForm.valid.should.be.false();

    nestedForm.ctrls.firstStep.ctrls.birthday.disable();
    nestedForm.valid.should.be.true();
    nestedForm.ctrls.firstStep.ctrls.birthday.enable();
    nestedForm.valid.should.be.false();

    nestedForm.ctrls.firstStep.ctrls.birthday.update('1988-01-01');
    nestedForm.valid.should.be.true();
  });

  describe('FormControllerArray', () => {
    it('value', () => {
      const parent = new FormControllerArray([
        new FormController('hello'),
        new FormController(' world')
      ]);
      parent.value.join('').should.be.equal('hello world');
      parent.ctrls[1].update(' Jimmy');
      parent.value.join('').should.be.equal('hello Jimmy');
    });

    it('dirty', () => {
      const parent = new FormControllerArray([
        new FormController('hello'),
        new FormController(' world')
      ]);

      parent.dirty.should.be.false();
      parent.ctrls[1].update('Jimmy');
      parent.dirty.should.be.true();
      parent.markAsPristine();
      parent.dirty.should.be.false();
    });
  });

  it('valid', () => {
    const parent = new FormControllerArray([
      new FormController('hello'),
      new FormController('', [required])
    ]);
    parent.valid.should.be.false();
    parent.ctrls[1].disable();
    parent.valid.should.be.true();
    parent.ctrls[1].enable();
    parent.valid.should.be.false();
    parent.ctrls[1].update(' world');
    parent.valid.should.be.true();
  });

  it('cross-controller validator', () => {
    const parent = new FormControllerArray(
      [new FormController('hello'), new FormController('')],
      [
        array =>
          array.value.every(item => item.length >= 4)
            ? undefined
            : { minLength: true }
      ]
    );
    parent.valid.should.be.false();
    parent.ctrls[1].update('world');
    parent.valid.should.be.true();
  });

  it('nexted', () => {
    const parent = new FormControllerArray(
      [
        new FormController('hello', [required]),
        new FormControllerGroup(
          {
            name: new FormController('Jimmy'),
            age: new FormController(16, [required])
          },
          [required]
        )
      ],
      [
        array => {
          const [greeting, person] = array.ctrls;
          return greeting.value === 'hello' && person.value.age < 18
            ? { dangerous: true }
            : undefined;
        }
      ]
    );

    parent.value.should.be.deepEqual(['hello', { name: 'Jimmy', age: 16 }]);
    parent.valid.should.be.false();
    parent.ctrls[1].ctrls.age.update(20);
    parent.valid.should.be.true();
  });
});
