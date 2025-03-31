import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Formik } from 'formik';
import { Box, Button } from '@navikt/ds-react';
import PeriodeInputV2 from '../../app/components/periode-inputV2/PeriodeInputV2';

const meta: Meta<typeof PeriodeInputV2> = {
    title: 'Components/PeriodeInputV2',
    component: PeriodeInputV2,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PeriodeInputV2>;

const PeriodeInputV2WithFormik: React.FC = () => {
    const [submittedValues, setSubmittedValues] = useState<any>(null);

    return (
        <Formik
            initialValues={{
                periode: {
                    fom: null,
                    tom: null,
                },
            }}
            onSubmit={(values) => {
                setSubmittedValues(values);
            }}
        >
            {({ values, setFieldValue, handleSubmit }) => (
                <Box>
                    <form onSubmit={handleSubmit}>
                        <PeriodeInputV2
                            value={values.periode}
                            onChange={(periode) => setFieldValue('periode', periode)}
                        />
                        <Box paddingBlock="4">
                            <Button type="submit">Send</Button>
                        </Box>
                    </form>
                    <Box paddingBlock="4" className="bg-gray-50 p-4 rounded">
                        <div>Current values:</div>
                        <pre>{JSON.stringify(values, null, 2)}</pre>
                        {submittedValues && (
                            <>
                                <div>Submitted values:</div>
                                <pre>{JSON.stringify(submittedValues, null, 2)}</pre>
                            </>
                        )}
                    </Box>
                </Box>
            )}
        </Formik>
    );
};

export const Default: Story = {
    render: () => <PeriodeInputV2WithFormik />,
};

export const WithInitialValues: Story = {
    render: () => {
        const [submittedValues, setSubmittedValues] = useState<any>(null);

        return (
            <Formik
                initialValues={{
                    periode: {
                        fom: '2024-01-01',
                        tom: '2024-12-31',
                    },
                }}
                onSubmit={(values) => {
                    setSubmittedValues(values);
                }}
            >
                {({ values, setFieldValue, handleSubmit }) => (
                    <Box>
                        <form onSubmit={handleSubmit}>
                            <PeriodeInputV2
                                value={values.periode}
                                onChange={(periode) => setFieldValue('periode', periode)}
                            />
                            <Box paddingBlock="4">
                                <Button type="submit">Send</Button>
                            </Box>
                        </form>
                        <Box paddingBlock="4" className="bg-gray-50 p-4 rounded">
                            <div>Current values:</div>
                            <pre>{JSON.stringify(values, null, 2)}</pre>
                            {submittedValues && (
                                <>
                                    <div>Submitted values:</div>
                                    <pre>{JSON.stringify(submittedValues, null, 2)}</pre>
                                </>
                            )}
                        </Box>
                    </Box>
                )}
            </Formik>
        );
    },
};
