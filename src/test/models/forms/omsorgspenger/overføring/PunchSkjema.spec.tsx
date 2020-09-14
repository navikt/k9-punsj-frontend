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
      identitetsnummer: null,
      arbeidssituasjon: {
        erArbeidstaker: false,
        erFrilanser: false,
        erSelvstendigNæringsdrivende: false,
        metaHarFeil: null,
      },
      borINorge: null,
      omsorgenDelesMed: {
        identitetsnummer: '',
        antallOverførteDager: 0,
        mottaker: null,
        samboerSiden: null,
      },
      aleneOmOmsorgen: null,
      barn: [
        {
          identitetsnummer: null,
        },
      ],
    };

    const {
      omsorgenDelesMed,
      aleneOmOmsorgen,
      barn,
      mottaksdato,
      borINorge,
    } = validerSkjemaFn(tomtSkjema);

    expect(omsorgenDelesMed?.identitetsnummer).toEqual(
      'skjema.validering.påkrevd'
    );
    expect(omsorgenDelesMed?.mottaker).toEqual('skjema.validering.påkrevd');
    expect(omsorgenDelesMed?.antallOverførteDager).toEqual(
      'skjema.validering.positivtheltall'
    );
    expect(aleneOmOmsorgen).toEqual('skjema.validering.påkrevd');
    // @ts-ignore
    expect(barn[0].identitetsnummer).toEqual('skjema.validering.påkrevd');

    expect(mottaksdato).toEqual('skjema.validering.påkrevd');

    expect(borINorge).toEqual('skjema.validering.påkrevd');
  });
});
