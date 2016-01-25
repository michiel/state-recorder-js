const JSON_PATCH_OPERATIONS = {
  add     : 'add',
  remove  : 'remove',
  replace : 'replace'
}

const EVENTS = [
  'change'
];

const toJSONString = (obj) => {
  return JSON.stringify(obj);
}

const fromJSONString = (str) => {
  return JSON.parse(str);
}

const clone = (obj) => {
  return fromJSONString(toJSONString(obj));
}

const JSONPatch = {

  add : (obj, path, value) => {
    return `{ "op": "add", "path": "${path}", "value": ${toJSONString(value)} }`;
  },

  remove : (obj, path) => {
    return `{ "op": "remove", "path": "${path}" }`;
  },

  replace : (obj, path, value) => {
    return `{ "op": "replace", "path": "${path}", "value": ${toJSONString(value)} }`;
  }

};

const changeObject = {

  add : (obj, path, value) => {
    const result = [
      JSONPatch.remove(obj, path, value),
      JSONPatch.add(obj, path, value)
    ];
    obj[path] = value;
    return [obj, result];
  },

  remove : (obj, path) => {
    const result = [
      JSONPatch.add(obj, path, obj[path]),
      JSONPatch.remove(obj, path)
    ];
    delete obj[path];
    return [obj, result];
  },

  replace : (obj, path, value) => {
    const result = [
      JSONPatch.replace(obj, path, obj[path]),
      JSONPatch.replace(obj, path, value)
    ];
    obj[path] = value;
    return [obj, result];
  }

};

class UrState {

  constructor() {
    this._version     = 0;
    this._state       = {};
    this._changes     = [];
    this._observers   = {}

    EVENTS.forEach((evt)=> {
      this._observers[evt] = {
        counter     : 0,
        subscribers : {}
      }
    });

  }

  _makeChange(op, path, value) {
    let res = [];
    this._version++;
    switch (op) {
      case JSON_PATCH_OPERATIONS.add:
        res = changeObject.add(this._state, path, value)
        break;
      case JSON_PATCH_OPERATIONS.remove:
        res = changeObject.remove(this._state, path)
        break;
      case JSON_PATCH_OPERATIONS.replace:
        res = changeObject.replace(this._state, path, value)
        break;
    }

    const [obj, changes] = res;
    this._state = obj;
    this._changes.push(changes);
    this._emit('change', fromJSONString([changes[1]]));
  }

  set(key, value) {
    if (this._state[key] !== undefined) {
      this._makeChange('replace', key, value);
    } else {
      this._makeChange('add', key, value);
    }
  }

  remove(key) {
    this._makeChange('remove', key);
  }

  get(key) {
    return this._state[key];
  }

  serialize() {
    return JSON.stringify(this._state);
  }

  applyPatch(patchStr) {
    const patch = fromJSONString(patchStr);
    this._makeChange(
      patch.op,
      patch.path,
      patch.value
    );
  }

  applyPatches(patches=[]) {
    while (patches.length > 0) {
      this.applyPatch(patches.unshift());
    }
  }

  _emit(evt, args=[]) {
    const subs = this._observers[evt].subscribers;
    for (const sub in subs) {
      subs[sub](evt, clone(args));
    }
  }

  on(evt, fn) {
    const id = this._observers[evt].counter++;
    this._observers[evt].subscribers[id] = fn;
    return id;
  }

  off(evt, id) {
    delete this._observers[evt].subscribers[id];
  }

}

export default UrState;
