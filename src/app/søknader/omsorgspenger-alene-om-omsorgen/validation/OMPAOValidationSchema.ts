import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { ObjectSchema } from 'yup';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { IOMPAOSoknad } from './types/OMPAOSoknad';

dayjs.extend(customParseFormat);

const OMPAOValidationSchema: ObjectSchema<IOMPAOSoknad> = yup.object({
    // Fra SoeknadType
    soeknadId: yup.string().required(),
    soekerId: yup.string().required(),
    journalposter: yup.array().of(yup.string().required()).required(),
    mottattDato: yup
        .string()
        .required('Mottatt dato er påkrevd.')
        .test('is-valid-date', 'Ugyldig datoformat.', (value) => {
            if (!value) return true; // la .required() håndtere tomme verdier
            return dayjs(value, ['YYYY-MM-DD', 'DD.MM.YYYY'], true).isValid();
        }),
    klokkeslett: yup
        .string()
        .transform((v) => (v === null ? undefined : v))
        .optional(),
    harInfoSomIkkeKanPunsjes: yup
        .boolean()
        .transform((v) => (v === null ? undefined : v))
        .optional(),
    harMedisinskeOpplysninger: yup
        .boolean()
        .transform((v) => (v === null ? undefined : v))
        .optional(),
    k9saksnummer: yup
        .string()
        .transform((v) => (v === null ? undefined : v))
        .optional(),

    // Fra IOMPAOSoknad
    metadata: yup
        .object({
            signatur: yup.string().required().label('Signatur'),
        })
        .required(),
    periode: yup
        .object({
            fom: yup
                .string()
                .required('Fra og med dato er påkrevd.')
                .test('is-valid-date', 'Ugyldig datoformat.', (value) => {
                    if (!value) return true;
                    return dayjs(value, ['YYYY-MM-DD', 'DD.MM.YYYY'], true).isValid();
                }),
            tom: yup
                .string()
                .transform((v) => (v === null ? undefined : v))
                .optional(),
        })
        .required(),
    barn: yup
        .object({
            norskIdent: yup.string().required('Barnets fødselsnummer/D-nummer er påkrevd.'),
            navn: yup
                .string()
                .transform((v) => (v === null ? undefined : v))
                .optional(),
        })
        .required(),
});

export const OMPAOSoknadResolver = yupResolver(OMPAOValidationSchema);
