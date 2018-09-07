import compiler from '../compiler';
import DateField from './date-field';
import Field from './field';
import FormField from './form-field';
import FormsField from './forms-field';
import IdField from './id-field';
import IntegerField from './integer-field';
import ListField from './list-field';
import NumberField from './number-field';
import SelectField from './select-field';
import TextField from './text-field';
import TextListField from './text-list-field';

// For readability
const compile = compiler.getCompiledComponent.bind(compiler);

// Compile the uncompiled components so that they can be used like any other compiled component.
// This adds a little processing, but it is quick because the compiler just creates a new class that
// wraps the MSON, which means that the bulk of the work is deferred until the component is
// instantiated.
const EmailField = compile('EmailField');
const PersonFullNameField = compile('PersonFullNameField');
const PersonNameField = compile('PersonNameField');
const PasswordField = compile('PasswordField');

export {
  DateField,
  EmailField,
  Field,
  FormField,
  FormsField,
  IdField,
  IntegerField,
  ListField,
  NumberField,
  PasswordField,
  PersonFullNameField,
  PersonNameField,
  SelectField,
  TextField,
  TextListField
};
