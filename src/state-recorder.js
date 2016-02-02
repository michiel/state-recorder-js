const JSON_PATCH_OPERATIONS = {
  add     : 'add',
  remove  : 'remove',
  replace : 'replace'
}
type jsonPatchOperatorType = 'add' | 'remove' | 'replace';

type jsonPatchType = {
  op     : string,
  path   : string,
  value? : number|string|boolean
};

type jsonPatchPairType = [jsonPatchType, jsonPatchType];

const EVENTS = [
  'change'
];
type eventType = 'change'

type stateKeyType      = string;
type stateValueType    = number | string | boolean;
type stateObjectType   = { [key: string] : stateValueType };
type objectChangeType  = [stateObjectType, Array<jsonPatchType>];

type observerStoreType = {
  counter     : number,
  subscribers : { [key: string] : Function };
}

const clone = (obj:any) : any => {
  return JSON.parse(JSON.stringify(obj));
}

const GeneratePatch = {

  add (obj:stateObjectType, path:stateKeyType, value:stateValueType) : jsonPatchType {
    return {
      op    : 'add',
      path  : path,
      value : value
    };
  },

  remove (obj:stateObjectType, path:stateKeyType) : jsonPatchType {
    return {
      op    : 'remove',
      path  : path
    };
  },

  replace (obj:stateObjectType, path:stateKeyType, value:stateValueType) : jsonPatchType {
    return {
      op    : 'replace',
      path  : path,
      value : value
    };
  }

};

const exists = (arg:any) : boolean => {
  return (
    (arg !== undefined) &&
      (arg !== null)
  )
}

const assertIsPatch = (patch:jsonPatchType):void => {
  if (
    !exists(patch) ||
    !exists(patch.op) ||
      !exists(patch.path)
  ) {
    throw new Error('Not a valid patch : ' + patch);
  }
}

const ChangeState = {

  add (obj:stateObjectType, path:stateKeyType, value:stateValueType) : objectChangeType  {
    const result = [
      GeneratePatch.remove(obj, path, value),
      GeneratePatch.add(obj, path, value)
    ];
    obj[path] = value;
    return [obj, result];
  },

  remove (obj:stateObjectType, path:stateKeyType) : objectChangeType {
    const result = [
      GeneratePatch.add(obj, path, obj[path]),
      GeneratePatch.remove(obj, path)
    ];
    delete obj[path];
    return [obj, result];
  },

  replace (obj:stateObjectType, path:stateKeyType, value:stateValueType) : objectChangeType {
    const result = [
      GeneratePatch.replace(obj, path, obj[path]),
      GeneratePatch.replace(obj, path, value)
    ];
    obj[path] = value;
    return [obj, result];
  }

};

class StateRecorder {

  _version   : number;
  _state     : stateObjectType;
  _changes   : Array<jsonPatchPairType>;
  _observers : { [key: string] : observerStoreType };

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

  _makeChange(
    op    : jsonPatchOperatorType,
    path  : string,
    value : ?stateValueType
  ) : objectChangeType {

    let res : ?objectChangeType = null;
    this._version++;

    switch (op) {
      case JSON_PATCH_OPERATIONS.add:
        res = ChangeState.add(this._state, path, value)
        break;
      case JSON_PATCH_OPERATIONS.remove:
        res = ChangeState.remove(this._state, path)
        break;
      case JSON_PATCH_OPERATIONS.replace:
        res = ChangeState.replace(this._state, path, value)
        break;
    }

    const [obj, changes] = res;
    this._state = obj;
    this._changes.push(changes);
    this._emit('change', clone([changes[1]]));
  }

  set(key:stateKeyType, value:stateValueType) : void {
    if (this.has(key)) {
      this._makeChange(JSON_PATCH_OPERATIONS.replace, key, value);
    } else {
      this._makeChange(JSON_PATCH_OPERATIONS.add, key, value);
    }
  }

  remove(key:stateKeyType) : void {
    this._makeChange('remove', key);
  }

  get(key:stateKeyType) : ?stateValueType {
    return this._state[key];
  }

  has(key:string) : boolean {
    return !!this._state[key];
  }

  serialize() : string {
    return JSON.stringify(this._state);
  }

  applyPatch(patch:jsonPatchType) : void {
    assertIsPatch(patch);
    this._makeChange(
      patch.op,
      patch.path,
      patch.value
    );
  }

  applyPatches(patches:Array<jsonPatchType>=[]) : void {
    while (patches.length > 0) {
      this.applyPatch(patches.unshift());
    }
  }

  getPatches():Array<jsonPatchPairType> {
    return clone(this._changes);
  }

  getReversePatches():Array<jsonPatchType> {
    return clone(this._changes.map((el) => el[0]));
  }

  getForwardPatches():Array<jsonPatchType> {
    return clone(this._changes.map((el) => el[1]));
  }

  _emit(evt:eventType, args=[]) : void {
    const subs = this._observers[evt].subscribers;
    for (const sub in subs) {
      subs[sub](evt, clone(args));
    }
  }

  on(evt:eventType, fn) : number {
    const id = this._observers[evt].counter++;
    this._observers[evt].subscribers[id] = fn;
    return id;
  }

  off(evt:eventType, id) : void {
    delete this._observers[evt].subscribers[id];
  }

}

export default StateRecorder;
