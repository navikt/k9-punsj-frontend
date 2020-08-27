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
        fødselsnummer: null,
      },
    };

    const {
      arbeidssituasjon,
      omsorgenDelesMed,
      aleneOmOmsorgen,
      fosterbarn,
    } = validerSkjemaFn(tomtSkjema);

    expect(arbeidssituasjon?.metaHarFeil).toEqual('skjema.validering.minstEn');
    expect(omsorgenDelesMed?.fødselsnummer).toEqual(
      'skjema.validering.påkrevd'
    );
    expect(omsorgenDelesMed?.mottaker).toEqual('skjema.validering.påkrevd');
    expect(omsorgenDelesMed?.antallOverførteDager).toEqual(
      'skjema.validering.positivtheltall'
    );
    expect(aleneOmOmsorgen).toEqual('skjema.validering.påkrevd');
    expect(fosterbarn?.harFosterbarn).toEqual('skjema.validering.påkrevd');
  });
});
