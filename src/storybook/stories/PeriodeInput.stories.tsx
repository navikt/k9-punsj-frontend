import React, { useState } from 'react';
import { Formik } from 'formik';
import { Button, HStack, Checkbox } from '@navikt/ds-react';
import PeriodeInput from 'app/components/periode-inputV2/PeriodeInputV2';
import { IPeriode } from 'app/models/types/Periode';
import * as yup from 'yup';
import dayjs from 'dayjs';
import { formats } from 'app/utils';
import { expect } from '@storybook/jest';
import { within, userEvent, waitFor } from '@storybook/testing-library';
import type { StoryObj } from '@storybook/react';

const meta = {
    title: 'Components/PeriodeInput',
    component: PeriodeInput,
    parameters: {
        layout: 'centered',
    },
};

export default meta;

interface FormValues {
    periode: IPeriode;
}

const periodeSchema = yup.object({
    periode: yup.object({
        fom: yup.string().required('Fra og med er påkrevd').label('Fra og med'),
        tom: yup
            .string()
            .required('Til og med er påkrevd')
            .test('tom-not-before-fom', 'Sluttdato kan ikke være før startdato', function (value) {
                const { fom } = this.parent;
                if (!fom || !value) return true; // Skip validation if either date is missing
                return dayjs(value, formats.YYYYMMDD).isSameOrAfter(dayjs(fom, formats.YYYYMMDD));
            })
            .label('Til og med'),
    }),
});

const PeriodeInputWithFormik = ({ initialValues }: { initialValues?: IPeriode }) => {
    const [submittedValues, setSubmittedValues] = useState<IPeriode | null>(null);

    return (
        <Formik<FormValues>
            initialValues={{
                periode: initialValues || { fom: null, tom: null },
            }}
            validationSchema={periodeSchema}
            onSubmit={(values) => {
                setSubmittedValues(values.periode);
            }}
        >
            {({ handleSubmit, values, setFieldValue, errors, touched }) => (
                <form onSubmit={handleSubmit}>
                    <PeriodeInput
                        periode={values.periode}
                        onChange={(periode: IPeriode) => setFieldValue('periode', periode)}
                        onBlur={(periode: IPeriode) => setFieldValue('periode', periode)}
                        fomInputProps={{
                            error: touched.periode?.fom && errors.periode?.fom,
                        }}
                        tomInputProps={{
                            error: touched.periode?.tom && errors.periode?.tom,
                        }}
                    />
                    <HStack wrap gap="4" justify="start" style={{ marginTop: '1rem' }}>
                        <Button type="submit">Send</Button>
                    </HStack>
                    <div style={{ marginTop: '20px' }}>
                        <h3>Nåværende verdier:</h3>
                        <pre>{JSON.stringify(values.periode, null, 2)}</pre>
                        {submittedValues && (
                            <>
                                <h3>Sendte verdier:</h3>
                                <pre>{JSON.stringify(submittedValues, null, 2)}</pre>
                            </>
                        )}
                    </div>
                </form>
            )}
        </Formik>
    );
};

const PeriodeInputWithoutFormik = ({ initialValues }: { initialValues?: IPeriode }) => {
    const [periode, setPeriode] = useState<IPeriode>(initialValues || { fom: null, tom: null });
    const [submittedValues, setSubmittedValues] = useState<IPeriode | null>(null);
    const [errors, setErrors] = useState<{ fom?: string; tom?: string }>({});

    const validate = (values: IPeriode) => {
        const newErrors: { fom?: string; tom?: string } = {};

        if (!values.fom) {
            newErrors.fom = 'Fra og med er påkrevd';
        }

        if (!values.tom) {
            newErrors.tom = 'Til og med er påkrevd';
        } else if (values.fom && dayjs(values.tom, formats.YYYYMMDD).isBefore(dayjs(values.fom, formats.YYYYMMDD))) {
            newErrors.tom = 'Sluttdato kan ikke være før startdato';
        }

        return newErrors;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validate(periode);
        if (Object.keys(validationErrors).length === 0) {
            setSubmittedValues(periode);
        } else {
            setErrors(validationErrors);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <PeriodeInput
                periode={periode}
                onChange={(newPeriode: IPeriode) => {
                    setPeriode(newPeriode);
                    setErrors(validate(newPeriode));
                }}
                onBlur={(newPeriode: IPeriode) => {
                    setPeriode(newPeriode);
                    setErrors(validate(newPeriode));
                }}
                fomInputProps={{
                    error: errors.fom,
                }}
                tomInputProps={{
                    error: errors.tom,
                }}
            />
            <HStack wrap gap="4" justify="start" style={{ marginTop: '1rem' }}>
                <Button type="submit">Send</Button>
            </HStack>
            <div style={{ marginTop: '20px' }}>
                <h3>Nåværende verdier:</h3>
                <pre>{JSON.stringify(periode, null, 2)}</pre>
                {submittedValues && (
                    <>
                        <h3>Sendte verdier:</h3>
                        <pre>{JSON.stringify(submittedValues, null, 2)}</pre>
                    </>
                )}
            </div>
        </form>
    );
};

const PeriodeInputSimple = ({ initialValues }: { initialValues?: IPeriode }) => {
    const [periode, setPeriode] = useState<IPeriode>(initialValues || { fom: null, tom: null });
    const [submittedValues, setSubmittedValues] = useState<IPeriode | null>(null);
    const [errors, setErrors] = useState<{ fom?: string; tom?: string }>({});

    const validate = (values: IPeriode) => {
        const newErrors: { fom?: string; tom?: string } = {};

        if (!values.fom) {
            newErrors.fom = 'Fra og med er påkrevd';
        }

        if (!values.tom) {
            newErrors.tom = 'Til og med er påkrevd';
        } else if (values.fom && dayjs(values.tom, formats.YYYYMMDD).isBefore(dayjs(values.fom, formats.YYYYMMDD))) {
            newErrors.tom = 'Sluttdato kan ikke være før startdato';
        }

        return newErrors;
    };

    const handleSubmit = () => {
        const validationErrors = validate(periode);
        if (Object.keys(validationErrors).length === 0) {
            setSubmittedValues(periode);
        } else {
            setErrors(validationErrors);
        }
    };

    return (
        <div>
            <PeriodeInput
                periode={periode}
                onChange={(newPeriode: IPeriode) => {
                    setPeriode(newPeriode);
                    setErrors(validate(newPeriode));
                }}
                onBlur={(newPeriode: IPeriode) => {
                    setPeriode(newPeriode);
                    setErrors(validate(newPeriode));
                }}
                fomInputProps={{
                    error: errors.fom,
                }}
                tomInputProps={{
                    error: errors.tom,
                }}
            />
            <HStack wrap gap="4" justify="start" style={{ marginTop: '1rem' }}>
                <Button onClick={handleSubmit}>Send</Button>
            </HStack>
            <div style={{ marginTop: '20px' }}>
                <h3>Nåværende verdier:</h3>
                <pre>{JSON.stringify(periode, null, 2)}</pre>
                {submittedValues && (
                    <>
                        <h3>Sendte verdier:</h3>
                        <pre>{JSON.stringify(submittedValues, null, 2)}</pre>
                    </>
                )}
            </div>
        </div>
    );
};

const PeriodeInputWithPresetPeriod = () => {
    const [submittedValues, setSubmittedValues] = useState<IPeriode | null>(null);
    const [usePresetPeriod, setUsePresetPeriod] = useState(false);

    const presetPeriod = {
        fom: '2024-01-01',
        tom: '2024-12-31',
    };

    const currentPeriod = usePresetPeriod ? presetPeriod : { fom: null, tom: null };

    return (
        <Formik<FormValues>
            initialValues={{
                periode: currentPeriod,
            }}
            validationSchema={periodeSchema}
            onSubmit={(values) => {
                setSubmittedValues(values.periode);
            }}
            enableReinitialize
        >
            {({ handleSubmit, values, setFieldValue, errors, touched }) => (
                <form onSubmit={handleSubmit}>
                    <PeriodeInput
                        periode={currentPeriod}
                        onChange={(periode: IPeriode) => setFieldValue('periode', periode)}
                        onBlur={(periode: IPeriode) => setFieldValue('periode', periode)}
                        fomInputProps={{
                            error: touched.periode?.fom && errors.periode?.fom,
                        }}
                        tomInputProps={{
                            error: touched.periode?.tom && errors.periode?.tom,
                        }}
                    />
                    <HStack wrap gap="4" justify="start" style={{ marginTop: '1rem' }}>
                        <Checkbox
                            checked={usePresetPeriod}
                            onChange={(e) => {
                                setUsePresetPeriod(e.target.checked);
                                setFieldValue('periode', e.target.checked ? presetPeriod : { fom: null, tom: null });
                            }}
                        >
                            Bruk forhåndsinnstilt periode (01.01.2024 - 31.12.2024)
                        </Checkbox>
                    </HStack>
                    <HStack wrap gap="4" justify="start" style={{ marginTop: '1rem' }}>
                        <Button type="submit">Send</Button>
                    </HStack>
                    <div style={{ marginTop: '20px' }}>
                        <h3>Nåværende verdier:</h3>
                        <pre>{JSON.stringify(values.periode, null, 2)}</pre>
                        {submittedValues && (
                            <>
                                <h3>Sendte verdier:</h3>
                                <pre>{JSON.stringify(submittedValues, null, 2)}</pre>
                            </>
                        )}
                    </div>
                </form>
            )}
        </Formik>
    );
};

export const Default: StoryObj = {
    name: 'Default',
    render: () => <PeriodeInputSimple />,
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
        const canvas = within(canvasElement);

        // Sjekker at komponenten er riktig rendret
        await expect(canvas.getByLabelText('Fra og med')).toBeInTheDocument();
        await expect(canvas.getByLabelText('Til og med')).toBeInTheDocument();

        // Skriver inn datoer
        const fomInput = canvas.getByLabelText('Fra og med');
        const tomInput = canvas.getByLabelText('Til og med');

        await userEvent.type(fomInput, '01.01.2024');
        await userEvent.type(tomInput, '31.12.2024');

        // Sjekker at inntastede verdier vises
        await waitFor(() => {
            const currentValues = canvas.getByText(/"fom": "2024-01-01"/);
            expect(currentValues).toBeInTheDocument();
        });

        await waitFor(() => {
            const currentValues = canvas.getByText(/"tom": "2024-12-31"/);
            expect(currentValues).toBeInTheDocument();
        });
    },
};

export const WithInitialValues: StoryObj = {
    name: 'With Initial Values',
    render: () => (
        <PeriodeInputSimple
            initialValues={{
                fom: '2024-01-01',
                tom: '2024-12-31',
            }}
        />
    ),
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
        const canvas = within(canvasElement);

        // Sjekker at initielle verdier vises riktig
        const fomInput = canvas.getByLabelText('Fra og med');
        const tomInput = canvas.getByLabelText('Til og med');

        await expect(fomInput).toHaveValue('01.01.2024');
        await expect(tomInput).toHaveValue('31.12.2024');

        // Endrer verdier
        await userEvent.clear(fomInput);
        await userEvent.type(fomInput, '15.02.2024');

        await userEvent.clear(tomInput);
        await userEvent.type(tomInput, '20.03.2024');

        // Sjekker at nye verdier vises
        await waitFor(() => {
            const currentValues = canvas.getByText(/"fom": "2024-02-15"/);
            expect(currentValues).toBeInTheDocument();
        });

        await waitFor(() => {
            const currentValues = canvas.getByText(/"tom": "2024-03-20"/);
            expect(currentValues).toBeInTheDocument();
        });
    },
};

export const WithFormik: StoryObj = {
    name: 'With Formik',
    render: () => <PeriodeInputWithFormik />,
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
        const canvas = within(canvasElement);

        // Skriver inn datoer
        const fomInput = canvas.getByLabelText('Fra og med');
        const tomInput = canvas.getByLabelText('Til og med');

        await userEvent.type(fomInput, '01.01.2024');
        await userEvent.type(tomInput, '31.12.2024');

        // Klikker på send-knappen
        const submitButton = canvas.getByRole('button', { name: 'Send' });
        await userEvent.click(submitButton);

        // Sjekker at sendte verdier vises
        await waitFor(() => {
            const sentValues = canvas.getByText('Sendte verdier:');
            expect(sentValues).toBeInTheDocument();
        });

        await waitFor(() => {
            const sentFomValue = canvas.getAllByText(/"fom": "2024-01-01"/);
            expect(sentFomValue.length).toBeGreaterThan(0);
        });

        await waitFor(() => {
            const sentTomValue = canvas.getAllByText(/"tom": "2024-12-31"/);
            expect(sentTomValue.length).toBeGreaterThan(0);
        });
    },
};

export const WithFormikAndInitialValues: StoryObj = {
    name: 'With Formik and Initial Values',
    render: () => (
        <PeriodeInputWithFormik
            initialValues={{
                fom: '2024-01-01',
                tom: '2024-12-31',
            }}
        />
    ),
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
        const canvas = within(canvasElement);

        // Sjekker at initielle verdier vises riktig
        const fomInput = canvas.getByLabelText('Fra og med');
        const tomInput = canvas.getByLabelText('Til og med');

        await expect(fomInput).toHaveValue('01.01.2024');
        await expect(tomInput).toHaveValue('31.12.2024');

        // Endrer verdier
        await userEvent.clear(fomInput);
        await userEvent.type(fomInput, '15.02.2024');

        await userEvent.clear(tomInput);
        await userEvent.type(tomInput, '20.03.2024');

        // Sender skjema
        const submitButton = canvas.getByRole('button', { name: 'Send' });
        await userEvent.click(submitButton);

        // Sjekker at sendte verdier vises
        await waitFor(() => {
            const sentValues = canvas.getByText('Sendte verdier:');
            expect(sentValues).toBeInTheDocument();
        });

        await waitFor(() => {
            const sentFomValue = canvas.getAllByText(/"fom": "2024-02-15"/);
            expect(sentFomValue.length).toBeGreaterThan(0);
        });

        await waitFor(() => {
            const sentTomValue = canvas.getAllByText(/"tom": "2024-03-20"/);
            expect(sentTomValue.length).toBeGreaterThan(0);
        });
    },
};

export const WithForm: StoryObj = {
    name: 'With Form',
    render: () => <PeriodeInputWithoutFormik />,
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
        const canvas = within(canvasElement);

        // Skriver inn datoer
        const fomInput = canvas.getByLabelText('Fra og med');
        const tomInput = canvas.getByLabelText('Til og med');

        await userEvent.type(fomInput, '01.01.2024');
        await userEvent.type(tomInput, '31.12.2024');

        // Klikker på send-knappen
        const submitButton = canvas.getByRole('button', { name: 'Send' });
        await userEvent.click(submitButton);

        // Sjekker at sendte verdier vises
        await waitFor(() => {
            const sentValues = canvas.getByText('Sendte verdier:');
            expect(sentValues).toBeInTheDocument();
        });

        await waitFor(() => {
            const sentFomValue = canvas.getAllByText(/"fom": "2024-01-01"/);
            expect(sentFomValue.length).toBeGreaterThan(0);
        });

        await waitFor(() => {
            const sentTomValue = canvas.getAllByText(/"tom": "2024-12-31"/);
            expect(sentTomValue.length).toBeGreaterThan(0);
        });
    },
};

export const WithFormAndInitialValues: StoryObj = {
    name: 'With Form and Initial Values',
    render: () => (
        <PeriodeInputWithoutFormik
            initialValues={{
                fom: '2024-01-01',
                tom: '2024-12-31',
            }}
        />
    ),
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
        const canvas = within(canvasElement);

        // Sjekker at initielle verdier vises riktig
        const fomInput = canvas.getByLabelText('Fra og med');
        const tomInput = canvas.getByLabelText('Til og med');

        await expect(fomInput).toHaveValue('01.01.2024');
        await expect(tomInput).toHaveValue('31.12.2024');

        // Sjekker validering ved feil input
        await userEvent.clear(fomInput);
        await userEvent.clear(tomInput);

        // Sender skjema med tomme verdier
        const submitButton = canvas.getByRole('button', { name: 'Send' });
        await userEvent.click(submitButton);

        // Sjekker at feilmeldinger vises
        await waitFor(() => {
            const errorMessages = canvas.getAllByText('Fra og med er påkrevd');
            expect(errorMessages.length).toBeGreaterThan(0);
        });

        await waitFor(() => {
            const errorMessages = canvas.getAllByText('Til og med er påkrevd');
            expect(errorMessages.length).toBeGreaterThan(0);
        });
    },
};

export const WithPresetPeriod: StoryObj = {
    name: 'With Preset Period',
    render: () => <PeriodeInputWithPresetPeriod />,
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
        const canvas = within(canvasElement);

        // Sjekker at feltene er tomme i starten
        const fomInput = canvas.getByLabelText('Fra og med');
        const tomInput = canvas.getByLabelText('Til og med');

        expect(fomInput).toHaveValue('');
        expect(tomInput).toHaveValue('');

        // Aktiverer forhåndsinnstilt periode via checkbox
        const checkbox = canvas.getByRole('checkbox');
        await userEvent.click(checkbox);

        // Sjekker at verdiene har endret seg til forhåndsinnstilte
        await waitFor(() => {
            expect(fomInput).toHaveValue('01.01.2024');
            expect(tomInput).toHaveValue('31.12.2024');
        });

        // Sender skjema
        const submitButton = canvas.getByRole('button', { name: 'Send' });
        await userEvent.click(submitButton);

        // Sjekker sendte verdier
        await waitFor(() => {
            const sentValues = canvas.getByText('Sendte verdier:');
            expect(sentValues).toBeInTheDocument();
        });

        await waitFor(() => {
            const sentFomValue = canvas.getAllByText(/"fom": "2024-01-01"/);
            expect(sentFomValue.length).toBeGreaterThan(0);
        });

        // Deaktiverer checkbox og sjekker at feltene er tomme igjen
        await userEvent.click(checkbox);

        await waitFor(() => {
            expect(fomInput).toHaveValue('');
            expect(tomInput).toHaveValue('');
        });
    },
};

// Test for validering av datoer
export const ValidationTest: StoryObj = {
    name: 'Validation Test',
    render: () => <PeriodeInputSimple />,
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
        const canvas = within(canvasElement);

        // Skriver inn ugyldige datoer (sluttdato før startdato)
        const fomInput = canvas.getByLabelText('Fra og med');
        const tomInput = canvas.getByLabelText('Til og med');

        await userEvent.type(fomInput, '31.12.2024');
        await userEvent.type(tomInput, '01.01.2024');

        // Klikker på send-knappen
        const submitButton = canvas.getByRole('button', { name: 'Send' });
        await userEvent.click(submitButton);

        // Sjekker at valideringsfeilmelding vises
        await waitFor(() => {
            const errorMessage = canvas.getByText('Sluttdato kan ikke være før startdato');
            expect(errorMessage).toBeInTheDocument();
        });

        // Korrigerer datoene
        await userEvent.clear(fomInput);
        await userEvent.type(fomInput, '01.01.2024');

        await userEvent.clear(tomInput);
        await userEvent.type(tomInput, '31.12.2024');

        // Sender skjema på nytt
        await userEvent.click(submitButton);

        // Sjekker at feilen er borte og skjemaet sendes
        await waitFor(() => {
            const sentValues = canvas.getByText('Sendte verdier:');
            expect(sentValues).toBeInTheDocument();
        });
    },
};

// Test for delvis utfylling
export const PartialInputTest: StoryObj = {
    name: 'Partial Input Test',
    render: () => <PeriodeInputSimple />,
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
        const canvas = within(canvasElement);

        // Fyller bare ut startdato
        const fomInput = canvas.getByLabelText('Fra og med');
        await userEvent.type(fomInput, '01.01.2024');

        // Sjekker at fom er oppdatert, men tom fortsatt er null
        await waitFor(() => {
            const currentValues = canvas.getByText(/"fom": "2024-01-01"/);
            expect(currentValues).toBeInTheDocument();
        });

        await waitFor(() => {
            const currentTomValue = canvas.getByText(/"tom": null/);
            expect(currentTomValue).toBeInTheDocument();
        });

        // Klikker på send-knappen
        const submitButton = canvas.getByRole('button', { name: 'Send' });
        await userEvent.click(submitButton);

        // Sjekker at feilmelding vises for tom
        await waitFor(() => {
            const errorMessage = canvas.getByText('Til og med er påkrevd');
            expect(errorMessage).toBeInTheDocument();
        });
    },
};

// Test for tilgjengelighet (a11y)
export const AccessibilityTest: StoryObj = {
    name: 'Accessibility Test',
    render: () => <PeriodeInputSimple />,
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
        const canvas = within(canvasElement);

        // Sjekker at feltene har riktige labels
        const fomInput = canvas.getByLabelText('Fra og med');
        const tomInput = canvas.getByLabelText('Til og med');

        expect(fomInput).toBeInTheDocument();
        expect(tomInput).toBeInTheDocument();

        // Sjekker fokus og tastaturnavigasjon
        await userEvent.tab();
        expect(fomInput).toHaveFocus();

        await userEvent.tab();
        expect(tomInput).toHaveFocus();

        // Sjekker at man kan skrive inn data
        await userEvent.type(fomInput, '01.01.2024');
        expect(fomInput).toHaveValue('01.01.2024');

        await userEvent.type(tomInput, '31.12.2024');
        expect(tomInput).toHaveValue('31.12.2024');
    },
};
