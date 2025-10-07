import React from 'react';
import { ErrorMessage } from '@navikt/ds-react';
import DatovelgerFormik from './DatovelgerFormik';
import { useField } from 'formik';

const Periodevelger = ({ name }: { name: string }) => {
    const [, periodeFieldMeta] = useField(name);
    const [, fomFieldMeta] = useField(`${name}.fom`);
    const [, tomFieldMeta] = useField(`${name}.tom`);

    return (
        <div>
            <div className="grid grid-cols-2 gap-2">
                <DatovelgerFormik
                    id={`${name}.fom`}
                    name={`${name}.fom`}
                    label="Fra og med"
                    toDate={tomFieldMeta.value ? new Date(tomFieldMeta.value) : undefined}
                />
                <DatovelgerFormik
                    id={`${name}.tom`}
                    name={`${name}.tom`}
                    label="Til og med"
                    defaultMonth={fomFieldMeta.value ? new Date(fomFieldMeta.value) : undefined}
                    fromDate={fomFieldMeta.value ? new Date(fomFieldMeta.value) : undefined}
                />
            </div>
            {(fomFieldMeta.touched || tomFieldMeta.touched) && typeof periodeFieldMeta.error === 'string' && (
                <ErrorMessage showIcon={true}>{periodeFieldMeta.error}</ErrorMessage>
            )}
        </div>
    );
};

export default Periodevelger;
