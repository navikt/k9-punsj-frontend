import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { useForm, RegisterOptions } from 'react-hook-form';
import { Box, Button } from '@navikt/ds-react';
import { getTypedFormComponents } from '../../app/components/form';

export default {
    title: 'components/FormCheckbox',
    component: getTypedFormComponents<FormData>().TypedFormCheckbox,
} as Meta;

interface FormData {
    bekreftelse: boolean;
}

const { TypedFormProvider, TypedFormCheckbox } = getTypedFormComponents<FormData>();

const useStoryValidationRules = (): RegisterOptions<FormData, 'bekreftelse'> => ({
    required: 'Du må bekrefte',
    validate: (value) => value === true || 'Du må krysse av i boksen',
});

const Template: StoryFn<{
    defaultValues?: Partial<FormData>;
    label: string;
    inPanel?: boolean;
}> = ({ defaultValues, label, inPanel }) => {
    const validationRules = useStoryValidationRules();
    const methods = useForm<FormData>({ defaultValues });
    const [submittedData, setSubmittedData] = React.useState<FormData | null>(null);

    const handleFormSubmit = (data: FormData) => {
        setSubmittedData(data);
    };

    const CheckboxComponent = <TypedFormCheckbox name="bekreftelse" label={label} validate={validationRules} />;

    return (
        <TypedFormProvider form={methods} onSubmit={handleFormSubmit}>
            {(form) => (
                <Box padding="4" borderWidth="1" borderRadius="small">
                    {inPanel ? (
                        <Box padding="2" background="surface-info-subtle" borderRadius="small">
                            {CheckboxComponent}
                        </Box>
                    ) : (
                        CheckboxComponent
                    )}
                    <Box paddingBlock="4">
                        <Button type="submit">Send inn</Button>
                    </Box>
                    <pre>Form state: {JSON.stringify(form.watch(), null, 2)}</pre>
                    <pre>Errors: {JSON.stringify(form.formState.errors, null, 2)}</pre>
                    {submittedData && <pre>Submitted Data: {JSON.stringify(submittedData, null, 2)}</pre>}
                </Box>
            )}
        </TypedFormProvider>
    );
};

export const Default = Template.bind({});
Default.args = {
    label: 'Jeg bekrefter at jeg har lest og forstått vilkårene.',
    inPanel: false,
};

export const PreSelected = Template.bind({});
PreSelected.args = {
    ...Default.args,
    defaultValues: { bekreftelse: true },
};

export const InAPanel = Template.bind({});
InAPanel.storyName = 'In a Panel';
InAPanel.args = {
    ...Default.args,
    inPanel: true,
};
