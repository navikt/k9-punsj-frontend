import { IFeltValidator, påkrevd, validerSkjema } from '../../app/rules/valideringer';
import { testIntl } from '../testUtils';

jest.mock('app/utils/envUtils');

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

        const validerTestskjemaFn = validerSkjema<ITestSkjema>([felt3Validator, felt5Validator], testIntl);

        const skjemaMedEnManglendeVerdi: ITestSkjema = {
            felt1: { felt2: {} },
            felt4: { felt5: 3 },
        };

        const skjemaErrors = validerTestskjemaFn(skjemaMedEnManglendeVerdi);

        expect(skjemaErrors?.felt1?.felt2?.felt3).toEqual('skjema.validering.påkrevd');
        expect(skjemaErrors?.felt4?.felt5).toBeUndefined();
    });

    it('validerer felter som ligger i arrays', () => {
        interface ITestSkjema {
            testArr: {
                påkrevdFelt?: string;
            }[];
        }

        const feltValidator: IFeltValidator<string, ITestSkjema> = {
            feltPath: 'testArr[].påkrevdFelt',
            validatorer: [påkrevd],
            arrayInPath: true,
        };

        const skjemaMedManglendeVerdi: ITestSkjema = {
            testArr: [
                {
                    påkrevdFelt: 'verdi',
                },
                {},
                {
                    påkrevdFelt: 'verdi',
                },
                {
                    påkrevdFelt: '',
                },
            ],
        };

        const validerTestskjemaFn = validerSkjema<ITestSkjema>([feltValidator], testIntl);

        const skjemaErrors = validerTestskjemaFn(skjemaMedManglendeVerdi);

        // @ts-expect-error
        expect(skjemaErrors.testArr[0]?.påkrevdFelt).toBeUndefined();
        // @ts-ignore
        expect(skjemaErrors.testArr[1].påkrevdFelt).toEqual('skjema.validering.påkrevd');
        // @ts-ignore
        expect(skjemaErrors.testArr[2]?.påkrevdFelt).toBeUndefined();
        // @ts-ignore
        expect(skjemaErrors.testArr[3].påkrevdFelt).toEqual('skjema.validering.påkrevd');
    });
});
