import MemoryStore from './memory-store';
import localStorage from './local-storage';

export default class LocalStorageStore extends MemoryStore {
  _className = 'LocalStorageStore';

  _loadDocs(storeName) {
    const store = this._localStorage.getItem(storeName);
    if (store !== null) {
      const docs = JSON.parse(store);
      docs.forEach(doc => {
        this._docs.set(doc.id, doc);
      });
    }
  }

  // Allow for testing in Node
  _getLocalStorage() {
    if (this._global.window && this._global.window.localStorage) {
      return this._global.window.localStorage;
    } else {
      return localStorage;
    }
  }

  _create(props) {
    super._create(props);

    // For mocking
    this._global = global;
    this._localStorage = this._getLocalStorage();

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'storeName',
            component: 'TextField'
          }
        ]
      }
    });

    this._loadDocs(props && props.storeName);
  }

  _saveDocs() {
    const docs = this._docs.map(doc => doc);
    this._localStorage.setItem(this.get('storeName'), JSON.stringify(docs));
  }

  async _doAndSave(promiseFactory) {
    const response = await promiseFactory();
    this._saveDocs();
    return response;
  }

  async _createDoc(props) {
    return this._doAndSave(() => super._createDoc(props));
  }

  async _updateDoc(props) {
    return this._doAndSave(() => super._updateDoc(props));
  }

  async _archiveDoc(props) {
    return this._doAndSave(() => super._archiveDoc(props));
  }

  async _restoreDoc(props) {
    return this._doAndSave(() => super._restoreDoc(props));
  }
}
