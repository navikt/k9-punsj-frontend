/* eslint-disable no-template-curly-in-string */
import * as yup from 'yup';

import { passertDato, passertKlokkeslettPaaDato, barn } from 'app/rules/yup';

const OMPUTSchema = yup.object({
    mottattDato: passertDato,
    klokkeslett: passertKlokkeslettPaaDato,
    barn,
});
export default OMPUTSchema;
