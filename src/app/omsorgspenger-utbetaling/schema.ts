/* eslint-disable no-template-curly-in-string */
import * as yup from 'yup';

import { passertDato, passertKlokkeslettPaaDato } from 'app/rules/yup';

const OMPUTSchema = yup.object({
    mottattDato: passertDato,
    klokkeslett: passertKlokkeslettPaaDato,
});
export default OMPUTSchema;
