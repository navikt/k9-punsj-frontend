import { leggTilSakstypeReducers } from '../../app/state/RootState';
import { OmsorgspengerOverføring } from '../../app/containers/SakstypeImpls';

jest.mock('app/utils/envUtils');

describe('RootState', () => {
  test('leggTilSakstypeReducers legger til alle reducers for sakstypen', () => {
    const reducers = leggTilSakstypeReducers([OmsorgspengerOverføring]);

    const overføringReducer = reducers[OmsorgspengerOverføring.navn];

    expect(typeof overføringReducer).toEqual('function');
  });
});
