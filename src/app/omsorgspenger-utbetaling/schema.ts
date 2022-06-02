/* eslint-disable no-template-curly-in-string */
import * as yup from 'yup';

import { passertDato, passertKlokkeslettPaaDato, barn, periode } from 'app/rules/yup';

const OMPUTSchema = yup.object({
    mottattDato: passertDato,
    klokkeslett: passertKlokkeslettPaaDato,
    fravaersperioder: yup.array().of(
        yup.object({
            aktivitetsfravær: yup.string(),
            organisasjonsnummer: yup.string(),
            fraværÅrsak: yup.string(),
            søknadÅrsak: yup.string(),
            periode,
            faktiskTidPrDag: yup.string().required(),
        })
    ),
    opptjeningAktivitet: yup.object({
        arbeidstaker: yup.array().of(
            yup.object({
                organisasjonsnummer: yup.string().required(),
            })
        ),
    }),
    barn,
});
export default OMPUTSchema;
