import {
  ISignaturSkjema,
  validerSignaturSkjema,
} from '../../../../../app/models/forms/omsorgspenger/overføring/SignaturSkjema';
import { testIntl } from '../../../../testUtils';
import { JaNei } from '../../../../../app/models/enums';

describe('Signaturskjema', () => {
  const validerSkjemaFn = validerSignaturSkjema(testIntl);
  test('gir feil ved påkrevde verdier', () => {
    const tomtSkjema: ISignaturSkjema = {
      signert: null,
      fødselsnummer: '',
    };

    const errors = validerSkjemaFn(tomtSkjema);

    expect(errors?.signert).toEqual('skjema.validering.påkrevd');
    expect(errors?.fødselsnummer).toEqual('skjema.validering.påkrevd');
  });

  test('gir ingen feil ved utfylte verdier', () => {
    const utfyltSkjema: ISignaturSkjema = {
      signert: JaNei.JA,
      fødselsnummer: '28108602963',
    };

    const errors = validerSkjemaFn(utfyltSkjema);

    expect(errors).toEqual({});
  });
});
