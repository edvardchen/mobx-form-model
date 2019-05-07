# Document is Working in progress. Welcome to fork :)

Minimal form model that supports to validating and dirty-checking based on [Mobx](https://mobx.js.org/).

Most features are copied from [Angular forms](https://angular.io/guide/reactive-forms)

```bash
npm install -S mobx-form-model
```

## Examples

```javascript
// Simple Controller
import FormController from 'mobx-form-model';

const ctrl = new FormController('', [
  ({ value }) =>
    value == null || !value.length ? { required: 'value required' } : undefined
]);

ctrl.valid; // false
ctrl.errors.required; // value required

ctrl.update('hello');
ctrl.valid; // true
ctrl.errors; // undefined
ctrl.dirty; // true
```

```javascript
// nested controllers
import FormController, {
  FormControllerGroup,
  FormControllerArray
} from 'mobx-form-model';

const form = new FormControllerGroup({
  name: new FormController('Tom'),
  firstStep: new FormControllerGroup({
    gender: new FormController(1),
    birthday: new FormController('1990-01-01')
  }),
  questioins: new FormControllerArray([
    new FormController(),
    new FormController()
  ])
});
```

## Controller vs Group vs Array

### Shared

#### Properties

- value，当前的值
- valid, `true` 表示当前没有错误
- dirty, 表示值是否变更过。
- errors, 所有`validator`执行玩合并后的结果

* enabled, 表示当前`controller`是否有效。`false`表示当前`controller`不会影响`parent controller`的`valid`、`dirty`值。

以上这些属性都是 [observable](https://mobx.js.org/refguide/observable.html)

#### Methods

- disable()
- enable()
- markAsPristine() 将`dirty`设置为`false`，比如表单提交之前先检查`dirty`，用户没修改表单就无需重复提交，那在表单提交后调用 `markAsPristine()` 就可以避免重复提交已经提交的表单。

## Change Controler's value

|                   |                                                              |
| ----------------- | ------------------------------------------------------------ |
| update(newValue)  | 更新 value<br/> 标记 dirty 为 `true` <br/> 校验数据          |
| replace(newValue) | 更新 value<br/> <del>标记 dirty 为 true</del> <br/> 校验数据 |
| reset(newValue)   | 更新 value<br/> 标记 dirty 为 `false` <br/> 校验数据         |
