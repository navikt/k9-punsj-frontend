import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { useForm, RegisterOptions } from 'react-hook-form';
import { Box, Button } from '@navikt/ds-react';
import { getTypedFormComponents } from '../../app/components/form';

export default {
    title: 'components/FormRadioGroup',
    component: getTypedFormComponents<FormData>().TypedFormRadioGroup,
    argTypes: {
        layout: {
            options: ['vertical', 'horizontal'],
            control: { type: 'radio' },
        },
    },
} as Meta;

interface FormData {
    valg: string;
}

const { TypedFormProvider, TypedFormRadioGroup } = getTypedFormComponents<FormData>();

const options = [
    { value: 'ja', label: 'Ja' },
    { value: 'nei', label: 'Nei' },
    { value: 'ikke_relevant', label: 'Ikke relevant' },
];

const useStoryValidationRules = (): RegisterOptions<FormData, 'valg'> => ({
    required: 'Du må gjøre et valg',
});

const Template: StoryFn<{
    defaultValues?: Partial<FormData>;
    layout?: 'vertical' | 'horizontal';
}> = ({ defaultValues, layout }) => {
    const validationRules = useStoryValidationRules();
    const methods = useForm<FormData>({ defaultValues });
    const [submittedData, setSubmittedData] = React.useState<FormData | null>(null);

    const handleFormSubmit = (data: FormData) => {
        setSubmittedData(data);
    };

    return (
        <TypedFormProvider form={methods} onSubmit={handleFormSubmit}>
            {(form) => (
                <Box padding="4" borderWidth="1" borderRadius="small">
                    <TypedFormRadioGroup
                        name="valg"
                        legend="Er dette et spørsmål?"
                        options={options}
                        validate={validationRules}
                        layout={layout}
                    />
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
    layout: 'vertical',
};

export const Horizontal = Template.bind({});
Horizontal.args = {
    layout: 'horizontal',
};

export const WithError = Template.bind({});
WithError.args = {
    layout: 'vertical',
};
