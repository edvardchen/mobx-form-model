Simple form controller that supports to validating and dirty-checking based on [Mobx](https://mobx.js.org/). Most features are copied from [Angular forms](https://angular.io/guide/reactive-forms)

```bash
npm install -S mobx-form
```

## Examples

```javascript
// Simple Controller
import FormController from 'mobx-form';

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
