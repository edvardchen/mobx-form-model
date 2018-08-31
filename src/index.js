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
  _parent: ?FormControllerGroup<*>;
  setParent(parent: FormControllerGroup<*>) {
    this._parent = parent;
  }
  get parent() {
    return this._parent;
  }

  _enabled = true;
  get enabled() {
    return this._enabled;
  }
  disable() {
    this._enabled = false;
  }
  enable() {
    this._enabled = true;
  }
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
  @observable
  errors: ?Errors;

  validators: validateFn[];

  @observable
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
    if (this._parent) {
      // run cross-controller validators
      this._parent.runValidators();
    }
  }

  @action.bound
  update(newValue: T) {
    this.value = newValue;
    this.pristine = false;
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
    this.pristine = true;
    this.value = newValue;
    this.runValidators();
  }
}

type Controllers = { [string]: * };

export class FormControllerGroup<T: Controllers> extends Base
  implements IController {
  @observable
  errors: ?Errors;
  validators: validateFn[];
  ctrls: T; // controllers

  constructor(group: T, validators: validateFn[] = []) {
    super();
    this.ctrls = group;
    Object.keys(this.ctrls).forEach(key => {
      this.ctrls[key].setParent(this);
    });
    this.validators = validators;
  }

  @computed
  get dirty(): boolean {
    return this.children().some(item => item.enabled && item.dirty);
  }

  markAsPristine() {
    this.children().forEach(item => {
      item.markAsPristine();
    });
  }

  children() {
    return Object.keys(this.ctrls).map(key => this.ctrls[key]);
  }

  @computed
  get valid(): boolean {
    return (
      !this.errors && this.children().every(item => !item.enabled || item.valid)
    );
  }

  @action.bound
  runValidators() {
    this.errors = reduceRunValidators(this, this.validators);
    if (this._parent) {
      this._parent.runValidators();
    }
  }

  get value() {
    return Object.keys(this.ctrls).reduce(
      (acc, key) => ({ ...acc, [key]: this.ctrls[key].value }),
      {}
    );
  }
}
