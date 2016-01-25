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
});
