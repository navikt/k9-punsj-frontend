import {
  ISignaturSkjema,
  validerSignaturSkjema,
} from '../../../../../app/models/forms/omsorgspenger/overføring/SignaturSkjema';
import { testIntl } from '../../../../testUtils';
import { JaNei } from '../../../../../app/models/enums';

jest.mock('app/utils/envUtils');

describe('Signaturskjema', () => {
  const validerSkjemaFn = validerSignaturSkjema(testIntl);
  test('gir feil ved påkrevde verdier', () => {
    const tomtSkjema: ISignaturSkjema = {
      signert: null,
      identitetsnummer: '',
    };

    const errors = validerSkjemaFn(tomtSkjema);

    expect(errors?.signert).toEqual('skjema.validering.påkrevd');
    expect(errors?.identitetsnummer).toEqual('skjema.validering.påkrevd');
  });

  test('gir ingen feil ved utfylte verdier', () => {
    const utfyltSkjema: ISignaturSkjema = {
      signert: JaNei.JA,
      identitetsnummer: '28108602963',
    };

    const errors = validerSkjemaFn(utfyltSkjema);

    expect(errors).toEqual({});
  });
});
