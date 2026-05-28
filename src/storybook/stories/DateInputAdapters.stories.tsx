import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { Button, HStack, VStack } from '@navikt/ds-react';
import { Form, Formik, useFormikContext } from 'formik';
import { UseFormReturn } from 'react-hook-form';
import { createIntl } from 'react-intl';

import { IPeriode } from 'app/models/types/Periode';
import { PeriodInput } from 'app/components/period-input/PeriodInput';
import DatovelgerControlled from 'app/components/skjema/Datovelger/DatovelgerControlled';
import DatovelgerFormik from 'app/components/skjema/Datovelger/DatovelgerFormik';
import Periodevelger from 'app/components/skjema/Datovelger/Periodevelger';
import { getTypedFormComponents } from 'app/components/form/getTypedFormComponents';

import '@navikt/ds-css/dist/index.css';
import '../../app/styles/globals.css';

interface StoryFormValues {
    mottattDato: string;
}

interface PeriodStoryFormValues {
    periode: IPeriode;
}

const { TypedFormProvider, TypedFormDateInput } = getTypedFormComponents<StoryFormValues>();
const periodIntl = createIntl({ locale: 'nb', defaultLocale: 'nb' });

const storyDecorator = (Story: React.ComponentType) => (
    <div style={{ margin: '24px', maxWidth: '560px' }}>
        <Story />
    </div>
);

const ControlledHarness = () => {
    const [value, setValue] = React.useState('2026-05-17');
    const [committedValue, setCommittedValue] = React.useState('2026-05-17');

    return (
        <VStack gap="space-16">
            <DatovelgerControlled
                label="Mottatt dato"
                value={value}
                onChange={setValue}
                onBlur={(nextValue) => setCommittedValue(nextValue)}
                dataTestId="storybook-controlled-date"
            />
            <HStack gap="space-8">
                <Button type="button" size="small" variant="secondary" onClick={() => setValue('2026-05-20')}>
                    Simuler API update
                </Button>
                <Button type="button" size="small" variant="secondary" onClick={() => setValue('')}>
                    Tøm felt
                </Button>
            </HStack>
            <div>value: {value || '(empty)'}</div>
            <div>committed: {committedValue || '(empty)'}</div>
        </VStack>
    );
};

const FormikDebugPanel = () => {
    const { values, setFieldValue, submitCount } = useFormikContext<StoryFormValues>();

    return (
        <VStack gap="space-8">
            <HStack gap="space-8">
                <Button
                    type="button"
                    size="small"
                    variant="secondary"
                    onClick={() => setFieldValue('mottattDato', '2026-05-21')}
                >
                    Simuler API update
                </Button>
                <Button type="button" size="small" variant="secondary" onClick={() => setFieldValue('mottattDato', '')}>
                    Tøm felt
                </Button>
            </HStack>
            <div>value: {values.mottattDato || '(empty)'}</div>
            <div>submit count: {submitCount}</div>
        </VStack>
    );
};

const FormikHarness = () => (
    <Formik<StoryFormValues> initialValues={{ mottattDato: '2026-05-17' }} onSubmit={() => undefined}>
        <Form>
            <VStack gap="space-16">
                <DatovelgerFormik name="mottattDato" label="Mottatt dato" />
                <FormikDebugPanel />
            </VStack>
        </Form>
    </Formik>
);

const RhfHarness = () => (
    <TypedFormProvider formProps={{ defaultValues: { mottattDato: '2026-05-17' } }}>
        {(methods: UseFormReturn<StoryFormValues>) => (
            <VStack gap="space-16">
                <TypedFormDateInput
                    name="mottattDato"
                    label="Mottatt dato"
                    validate={{ required: 'Velg mottatt dato' }}
                    data-testid="storybook-rhf-date"
                />
                <HStack gap="space-8">
                    <Button
                        type="button"
                        size="small"
                        variant="secondary"
                        onClick={() => methods.setValue('mottattDato', '2026-05-22')}
                    >
                        Simuler API update
                    </Button>
                    <Button
                        type="button"
                        size="small"
                        variant="secondary"
                        onClick={() => methods.setValue('mottattDato', '')}
                    >
                        Tøm felt
                    </Button>
                    <Button type="button" size="small" onClick={() => methods.trigger('mottattDato')}>
                        Valider
                    </Button>
                </HStack>
                <div>value: {methods.watch('mottattDato') || '(empty)'}</div>
            </VStack>
        )}
    </TypedFormProvider>
);

const ControlledPeriodHarness = () => {
    const [periode, setPeriode] = React.useState<IPeriode>({ fom: '2026-05-17', tom: '2026-05-20' });
    const [committedPeriode, setCommittedPeriode] = React.useState<IPeriode>({ fom: '2026-05-17', tom: '2026-05-20' });

    return (
        <VStack gap="space-16">
            <PeriodInput
                intl={periodIntl}
                periode={periode}
                onChange={setPeriode}
                onBlur={setCommittedPeriode}
            />
            <HStack gap="space-8">
                <Button
                    type="button"
                    size="small"
                    variant="secondary"
                    onClick={() => setPeriode({ fom: '2026-05-19', tom: '2026-05-23' })}
                >
                    Simuler API update
                </Button>
                <Button type="button" size="small" variant="secondary" onClick={() => setPeriode({ fom: '', tom: '' })}>
                    Tøm periode
                </Button>
            </HStack>
            <div>value: {JSON.stringify(periode)}</div>
            <div>committed: {JSON.stringify(committedPeriode)}</div>
        </VStack>
    );
};

const FormikPeriodDebugPanel = () => {
    const { values, setFieldValue } = useFormikContext<PeriodStoryFormValues>();

    return (
        <VStack gap="space-8">
            <HStack gap="space-8">
                <Button
                    type="button"
                    size="small"
                    variant="secondary"
                    onClick={() => setFieldValue('periode', { fom: '2026-05-18', tom: '2026-05-24' })}
                >
                    Simuler API update
                </Button>
                <Button
                    type="button"
                    size="small"
                    variant="secondary"
                    onClick={() => setFieldValue('periode', { fom: '', tom: '' })}
                >
                    Tøm periode
                </Button>
            </HStack>
            <div>value: {JSON.stringify(values.periode)}</div>
        </VStack>
    );
};

const FormikPeriodHarness = () => (
    <Formik<PeriodStoryFormValues> initialValues={{ periode: { fom: '2026-05-17', tom: '2026-05-20' } }} onSubmit={() => undefined}>
        <Form>
            <VStack gap="space-16">
                <Periodevelger name="periode" />
                <FormikPeriodDebugPanel />
            </VStack>
        </Form>
    </Formik>
);

const meta: Meta = {
    title: 'Form/Date input adapters',
    decorators: [storyDecorator],
};

export default meta;

type Story = StoryObj;

export const Controlled: Story = {
    render: () => <ControlledHarness />,
};

export const FormikAdapter: Story = {
    render: () => <FormikHarness />,
};

export const ReactHookFormAdapter: Story = {
    render: () => <RhfHarness />,
};

export const ControlledPeriod: Story = {
    render: () => <ControlledPeriodHarness />,
};

export const FormikPeriod: Story = {
    render: () => <FormikPeriodHarness />,
};
