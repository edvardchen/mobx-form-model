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

export type AbstractController = IController;

type ControllerMap = {
  [key: string]: IController
};

interface IController {
  +errors: ?Errors;
  +ctrls?: ControllerMap | IController[];
  +value: any;
  +dirty: boolean;
  +valid: boolean;
  markAsPristine(): void; // 表单提交后，可以设置为 pristine，避免反复提交

  +parent: ?Parent;
  setParent(Parent): void;

  +enabled: boolean;
  enable(): void;
  disable(): void;
}

type Parent = FormControllerGroup<any> | FormControllerArray;

class Base implements IController {
  parent: ?Parent;
  setParent(parent: Parent) {
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

  // flow doesn't support abstract method
  /* eslint-disable class-methods-use-this */
  get dirty() {
    throw new Error('You should implememnt dirty getter');
  }

  get valid() {
    throw new Error('You should implememnt valid getter');
  }

  get value() {
    throw new Error('You should implememnt value getter');
  }

  markAsPristine() {
    throw new Error('You should implememnt markAsPristine method');
  }
}

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

export default class FormController<T = string> extends Base {
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

export class FormControllerGroup<T: ControllerMap> extends Base {
  ctrls: T;

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

  children(): IController[] {
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

export class FormControllerArray extends Base {
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

  get value(): *[] {
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
