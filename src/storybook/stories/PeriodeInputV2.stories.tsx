import React, { useState } from 'react';
import { Formik } from 'formik';
import { Button, HStack } from '@navikt/ds-react';
import PeriodeInputV2 from 'app/components/periode-inputV2/PeriodeInputV2';
import { IPeriode } from 'app/models/types/Periode';

const meta = {
    title: 'Components/PeriodeInputV2',
    component: PeriodeInputV2,
    parameters: {
        layout: 'centered',
    },
};

export default meta;

const PeriodeInputV2WithFormik = ({ initialValues }: { initialValues?: IPeriode }) => {
    const [submittedValues, setSubmittedValues] = useState<IPeriode | null>(null);

    return (
        <Formik
            initialValues={{
                periode: initialValues || { fom: null, tom: null },
            }}
            onSubmit={(values) => {
                setSubmittedValues(values.periode);
            }}
        >
            {({ values, setFieldValue, handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                    <PeriodeInputV2
                        periode={values.periode}
                        onChange={(periode) => setFieldValue('periode', periode)}
                        onBlur={(periode) => setFieldValue('periode', periode)}
                    />
                    <HStack wrap gap="4" justify="start" style={{ marginTop: '1rem' }}>
                        <Button type="submit">Send</Button>
                    </HStack>
                    <div style={{ marginTop: '20px' }}>
                        <h3>Current values:</h3>
                        <pre>{JSON.stringify(values.periode, null, 2)}</pre>
                        {submittedValues && (
                            <>
                                <h3>Submitted values:</h3>
                                <pre>{JSON.stringify(submittedValues, null, 2)}</pre>
                            </>
                        )}
                    </div>
                </form>
            )}
        </Formik>
    );
};

export const Default = {
    render: () => <PeriodeInputV2WithFormik />,
};

export const WithInitialValues = {
    render: () => (
        <PeriodeInputV2WithFormik
            initialValues={{
                fom: '2024-01-01',
                tom: '2024-12-31',
            }}
        />
    ),
};
