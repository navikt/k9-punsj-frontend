import {
  IOverføringPunchSkjema,
  validatePunch,
} from '../../../../../app/models/forms/omsorgspenger/overføring/PunchSkjema';
import { testIntl } from '../../../../testUtils';

describe('PunchSkjema', () => {
  const validerSkjemaFn = validatePunch(testIntl);
  test('gir feil ved påkrevde verdier', () => {
    const tomtSkjema: IOverføringPunchSkjema = {
      arbeidssituasjon: {
        erArbeidstaker: false,
        erFrilanser: false,
        erSelvstendigNæringsdrivende: false,
        metaHarFeil: null,
      },
      omsorgenDelesMed: {
        fødselsnummer: '',
        antallOverførteDager: 0,
        mottaker: null,
      },
      aleneOmOmsorgen: null,
      fosterbarn: {
        harFosterbarn: null,
      },
    };

    const {
      arbeidssituasjon,
      omsorgenDelesMed,
      aleneOmOmsorgen,
      fosterbarn,
    } = validerSkjemaFn(tomtSkjema);

    expect(arbeidssituasjon?.metaHarFeil).toEqual('');
    expect(omsorgenDelesMed?.fødselsnummer).toEqual('');
    expect(omsorgenDelesMed?.mottaker).toEqual('');
    expect(omsorgenDelesMed?.antallOverførteDager).toEqual('');
    expect(aleneOmOmsorgen).toEqual('');
    expect(fosterbarn?.harFosterbarn).toEqual('');
  });
});
