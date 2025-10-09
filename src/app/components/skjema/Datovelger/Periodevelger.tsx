import React from 'react';
import { ErrorMessage } from '@navikt/ds-react';
import DatovelgerFormik from './DatovelgerFormik';
import { useField } from 'formik';

const Periodevelger = ({ name }: { name: string }) => {
    const fomFieldName = `${name}.fom`;
    const tomFieldName = `${name}.tom`;
    const [, periodeFieldMeta] = useField(name);
    const [, fomFieldMeta] = useField(fomFieldName);
    const [, tomFieldMeta] = useField(tomFieldName);

    return (
        <div className="flex flex-col gap-2">
            <div className="flex gap-4 flex-wrap">
                <DatovelgerFormik
                    id={fomFieldName}
                    name={fomFieldName}
                    label="Fra og med"
                    toDate={tomFieldMeta.value ? new Date(tomFieldMeta.value) : undefined}
                    visFeilmelding={false}
                />
                <DatovelgerFormik
                    id={tomFieldName}
                    name={tomFieldName}
                    label="Til og med"
                    defaultMonth={fomFieldMeta.value ? new Date(fomFieldMeta.value) : undefined}
                    fromDate={fomFieldMeta.value ? new Date(fomFieldMeta.value) : undefined}
                    visFeilmelding={false}
                />
            </div>
            <div>
                {fomFieldMeta.touched && fomFieldMeta.error && (
                    <ErrorMessage aria-describedby={fomFieldName} showIcon>
                        Fra og med: {fomFieldMeta.error}
                    </ErrorMessage>
                )}
                {tomFieldMeta.touched && tomFieldMeta.error && (
                    <ErrorMessage aria-describedby={tomFieldName} showIcon>
                        Til og med: {tomFieldMeta.error}
                    </ErrorMessage>
                )}
                {(fomFieldMeta.touched || tomFieldMeta.touched) && typeof periodeFieldMeta.error === 'string' && (
                    <ErrorMessage aria-describedby={name} showIcon={true}>
                        {periodeFieldMeta.error}
                    </ErrorMessage>
                )}
            </div>
        </div>
    );
};

export default Periodevelger;
