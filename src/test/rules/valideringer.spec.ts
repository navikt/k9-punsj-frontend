import {
  IFeltValidator,
  påkrevd,
  validerSkjema,
} from '../../app/rules/valideringer';
import { testIntl } from '../testUtils';

describe('valideringer', () => {
  it('returnerer alle feil i et skjema', () => {
    interface ITestSkjema {
      felt1: {
        felt2: {
          felt3?: string;
        };
      };
      felt4: {
        felt5?: number;
      };
    }

    const felt3Validator: IFeltValidator<string, ITestSkjema> = {
      feltPath: 'felt1.felt2.felt3',
      validatorer: [påkrevd],
    };

    const felt5Validator: IFeltValidator<number, ITestSkjema> = {
      feltPath: 'felt4.felt5',
      validatorer: [påkrevd],
    };

    const validerTestskjemaFn = validerSkjema<ITestSkjema>(
      [felt3Validator, felt5Validator],
      testIntl
    );

    const skjemaMedEnManglendeVerdi: ITestSkjema = {
      felt1: { felt2: {} },
      felt4: { felt5: 3 },
    };

    const skjemaErrors = validerTestskjemaFn(skjemaMedEnManglendeVerdi);

    expect(skjemaErrors?.felt1?.felt2?.felt3).toEqual(
      'skjema.validering.påkrevd'
    );
    expect(skjemaErrors?.felt4?.felt5).toBeUndefined();
  });
});
