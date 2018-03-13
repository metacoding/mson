// TODO:
// - Option to require that a leaf node is selected?
// - Validation should make sure hierarchy is valid

import ListField from './list-field';
import Hierarchy from '../hierarchy';
import SelectField from './select-field';

// "options": [
//   { "value": "germany", "label": "Germany" },
//   { "value": "bmw", "label": "BMW", "parentValue": "germany" },
//   { "value": "m3", "label": "m3", "parentValue": "bmw" },
//   { "value": "i3", "label": "i3", "parentValue": "bmw" }
// ]
export default class ChainedSelectField extends ListField {
  _getValue() {
    // Go all the way down the chain until nothing selected
    let value = [];
    this.eachField(field => {
      const val = field.getValue();
      if (val) {
        value.push(val);
      } else {
        // Exit loop prematurely
        return false;
      }
    });
    return value.length > 0 ? value : null;
  }

  _newField(index) {
    return new SelectField({
      name: index,
      label: index === 0 ? this.get('label') : undefined,
      required: index === 0 ? this.get('required') : undefined,
      blankString: this.get('blankString'),
      // block: this.get('block'),
      fullWidth: this.get('fullWidth')
    });
  }

  _onFieldCreated(field, onDelete) {
    field.on('value', value => {

    const index = field.get('name');

    if (value) {
      // Set options for next field
      this._setFieldOptions(field.getValue(), index + 1);

      // Clear the next field
      this._clearFieldIfExists(index + 1);

      // Clear any fields after the next field
      this._clearAndHideNextFieldsIfExist(index + 2);
    } else {
      // Clear any fields after this field
      this._clearAndHideNextFieldsIfExist(index + 1);
    }

      this._calcValue();
    });
  }

  _getChildOptions(value, index) {
    // The parentValue can only be null if the index is 0 or else we will get the root options when
    // it is not intended.
    if (value !== null || index === 0) {
      return this._options.mapByParent(value, option => {
        return {
          value: option.id, label: option.label
        }
      });
    } else {
      return [];
    }
  }

  _setFieldOptions(value, index) {
    const childOptions = this._getChildOptions(value, index);

    // Are there child options? i.e. the hierarchy continues down another layer
    if (childOptions.length > 0) {
      const field = this._getOrCreateField(index);
      field.set({ options: childOptions });

      // Show field if hidden
      field.set({ hidden: false });
    }
  }

  _clearAndHideNextFieldsIfExist(index) {
    if (this._hasField(index)) {
      const field = this._getField(index);
      field.clearValue();
      field.set({ hidden: true });
      this._clearAndHideNextFieldsIfExist(index + 1);
    }
  }

  _cleanUpNextFields(index, value) {
    // Still on first field?
    if (index === null) {
      // Clear the first field as this will then adjust the subsequent fields
      this._fields.first().clearValue();
    }
  }

  _indexOptions(options) {
    this._options = new Hierarchy();
    options.forEach(option => {
      this._options.add({ id: option.value, parentId: option.parentValue, label: option.label });
    });
  }

  set(props) {
    super.set(props);

    // This needs to come first as we need to set the options and blankString before creating any
    // fields
    this._setIfUndefined(props, 'blankString');

    if (props.options !== undefined) {
      this._indexOptions(props.options);

      // Set the options for the first field
      this._setFieldOptions(null, 0);

      // Clear the 2nd field
      this._clearFieldIfExists(1);
    }

    if (props.required !== undefined) {
      if (this._fields.hasFirst()) {
        this._fields.first().set({ required: props.required });
      }
    }
  }

  getOne(name) {
    const value = this._getIfAllowed(name, 'blankString');
    return value === undefined ? super.getOne(name) : value;
  }
}