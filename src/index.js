// @flow

/**
 * @module
 * Angular-like form field
 */
/* eslint-disable no-underscore-dangle */
import { computed, action, observable } from 'mobx';

type Errors = { [string]: any };
/* eslint-disable no-use-before-define */
export type validateFn = IController => Errors | void;

interface IController {
  +errors: ?Errors;
  +ctrls?: Controllers;
  +value: any;
  +dirty: boolean;
  +valid: boolean;
  markAsPristine(): void; // 表单提交后，可以设置为 pristine，避免反复提交
}

interface IWithParent {
  +parent: ?FormControllerGroup<*>;
  setParent(FormControllerGroup<*>): void;
}

interface IEnable {
  +enabled: boolean;
  enable(): void;
  disable(): void;
}

class Base implements IWithParent, IEnable {
  parent: ?FormControllerGroup<*>;
  setParent(parent: FormControllerGroup<*>) {
    this.parent = parent;
  }

  @observable
  enabled = true;
  @action.bound
  disable() {
    this.enabled = false;
  }
  @action.bound
  enable() {
    this.enabled = true;
  }

  @observable.ref
  errors: ?Errors;

  validators: validateFn[] = [];
}

export type AbstractController = FormController<any> | FormControllerGroup<any>;

const reduceRunValidators = (
  c: AbstractController,
  validators: validateFn[]
) => {
  let newErrors;
  validators.forEach(validator => {
    const error = validator(c);
    if (error) {
      newErrors = { ...error, ...newErrors };
    }
  });
  return newErrors;
};

export default class FormController<T = string> extends Base
  implements IController {
  @observable.ref
  value: T;

  @observable
  pristine = true;

  constructor(initState: T, validators: validateFn[] = []) {
    super();
    this.validators = validators;
    this.reset(initState);
  }

  @computed
  get valid(): boolean {
    return !this.errors;
  }

  @computed
  get dirty(): boolean {
    return !this.pristine;
  }

  @action.bound
  runValidators() {
    this.errors = reduceRunValidators(this, this.validators);
    // run cross-controller validators
    this.parent && this.parent.runValidators();
  }

  @action.bound
  update(newValue: T) {
    this.value = newValue;
    this.markAsDirty();
    this.runValidators();
  }

  @action.bound
  markAsDirty() {
    this.pristine = false;
  }

  @action.bound
  markAsPristine() {
    this.pristine = true;
  }

  @action.bound
  reset(newValue: T) {
    this.value = newValue;
    this.markAsPristine();
    this.runValidators();
  }
}

type Controllers = { [string]: * };

export class FormControllerGroup<T: Controllers> extends Base
  implements IController {
  ctrls: T; // controllers

  constructor(group: T, validators: validateFn[] = []) {
    super();
    this.ctrls = group;
    this.validators = validators;
    this.children().forEach(item => {
      item.setParent(this);
    });
    this.runValidators();
  }

  @computed
  get dirty(): boolean {
    return this.children().some(item => item.enabled && item.dirty);
  }

  @computed
  get valid(): boolean {
    return (
      !this.errors && this.children().every(item => !item.enabled || item.valid)
    );
  }

  get value() {
    return Object.keys(this.ctrls).reduce(
      (acc, key) => ({ ...acc, [key]: this.ctrls[key].value }),
      {}
    );
  }

  children() {
    return Object.keys(this.ctrls).map(key => this.ctrls[key]);
  }

  markAsPristine() {
    this.children().forEach(item => {
      item.markAsPristine();
    });
  }

  @action.bound
  runValidators() {
    this.errors = reduceRunValidators(this, this.validators);
    this.parent && this.parent.runValidators();
  }
}

export class FormControllerArray extends Base implements IController {
  ctrls: IController[];

  constructor(ctrls: IController[], validators: validateFn[] = []) {
    super();
    this.ctrls = ctrls;
    this.validators = validators;
    this.children().forEach(item => {
      item.setParent(this);
    });
    this.runValidators();
  }

  @computed
  get dirty(): boolean {
    return this.children().some(item => item.enabled && item.dirty);
  }

  @computed
  get valid(): boolean {
    return (
      !this.errors && this.children().every(item => !item.enabled || item.valid)
    );
  }

  get value() {
    return this.children().map(item => item.value);
  }

  children() {
    return this.ctrls;
  }

  @action.bound
  runValidators() {
    this.errors = reduceRunValidators(this, this.validators);
    this.parent && this.parent.runValidators();
  }

  markAsPristine() {
    this.children().forEach(item => {
      item.markAsPristine();
    });
  }
}
