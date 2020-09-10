import {
  IOverføringPunchSkjema,
  validatePunch,
} from '../../../../../app/models/forms/omsorgspenger/overføring/PunchSkjema';
import { testIntl } from '../../../../testUtils';

jest.mock('app/utils/envUtils');

describe('PunchSkjema', () => {
  const validerSkjemaFn = validatePunch(testIntl);
  test('gir feil ved påkrevde verdier', () => {
    const tomtSkjema: IOverføringPunchSkjema = {
      mottaksdato: null,
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
        samboerSiden: null,
      },
      aleneOmOmsorgen: null,
      barn: [
        {
          fødselsnummer: null,
        },
      ],
    };

    const {
      omsorgenDelesMed,
      aleneOmOmsorgen,
      barn,
      mottaksdato,
    } = validerSkjemaFn(tomtSkjema);

    expect(omsorgenDelesMed?.fødselsnummer).toEqual(
      'skjema.validering.påkrevd'
    );
    expect(omsorgenDelesMed?.mottaker).toEqual('skjema.validering.påkrevd');
    expect(omsorgenDelesMed?.antallOverførteDager).toEqual(
      'skjema.validering.positivtheltall'
    );
    expect(aleneOmOmsorgen).toEqual('skjema.validering.påkrevd');
    // @ts-ignore
    expect(barn[0].fødselsnummer).toEqual('skjema.validering.påkrevd');

    expect(mottaksdato).toEqual('skjema.validering.påkrevd');
  });
});
