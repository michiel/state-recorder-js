import UrState from '../../src/urstate';

describe('UrState', () => {
  describe('Init', () => {
    it('should have been run once', () => {
      const state = new UrState();
      spy(state, '_emit');

      state.set('keyStr', 'valueStr');

      expect(state._emit).to.have.been.calledOnce;
      expect(state._emit).to.have.always.returned(undefined);

      expect(state.get('keyStr')).to.equal('valueStr');

      state.remove('keyStr');

      expect(state.get('keyStr')).to.equal(undefined);
    });


  });

  describe('Undo', () => {
    it('should reverse', () => {
      const state = new UrState();

      state.set('key1', 'value1');
      state.set('key2', 'value2');
      state.set('key3', 'value3');

      expect(state.get('key1')).to.equal('value1');
      expect(state.get('key2')).to.equal('value2');
      expect(state.get('key3')).to.equal('value3');

      let reversePatches = state.getReversePatches();
      let forwardPatches = state.getForwardPatches();

      expect(reversePatches.length).to.equal(3);
      expect(forwardPatches.length).to.equal(3);

      state.applyPatch(reversePatches.pop());

      expect(state.get('key1')).to.equal('value1');
      expect(state.get('key2')).to.equal('value2');
      expect(state.get('key3')).to.equal(undefined);

      state.applyPatch(reversePatches.pop());
      state.applyPatch(reversePatches.pop());

      expect(state.get('key1')).to.equal(undefined);
      expect(state.get('key2')).to.equal(undefined);
      expect(state.get('key3')).to.equal(undefined);

      state.applyPatch(forwardPatches.shift());
      expect(state.get('key1')).to.equal('value1');
      expect(state.get('key2')).to.equal(undefined);
      expect(state.get('key3')).to.equal(undefined);

      state.applyPatch(forwardPatches.shift());
      expect(state.get('key2')).to.equal('value2');
      expect(state.get('key3')).to.equal(undefined);

      state.applyPatch(forwardPatches.shift());
      expect(state.get('key3')).to.equal('value3');

    });

  });
});
