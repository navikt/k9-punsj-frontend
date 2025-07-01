import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { useForm, RegisterOptions } from 'react-hook-form';
import { Box, Button } from '@navikt/ds-react';
import { getTypedFormComponents } from '../../app/components/form';

export default {
    title: 'components/FormDatePicker',
    component: getTypedFormComponents<FormData>().TypedFormDatePicker,
} as Meta;

interface FormData {
    dato: string;
}

const { TypedFormProvider, TypedFormDatePicker } = getTypedFormComponents<FormData>();

const useStoryValidationRules = (): RegisterOptions<FormData, 'dato'> => ({
    required: 'Dato er påkrevd',
    validate: (value) => {
        if (new Date(value) > new Date()) {
            return 'Dato kan ikke være i fremtiden';
        }
        return true;
    },
});

const Template: StoryFn<{
    onSubmit: (data: FormData) => void;
    defaultValues?: Partial<FormData>;
    minDate?: Date;
    maxDate?: Date;
    dropdownCaption?: boolean;
}> = ({ onSubmit, defaultValues, minDate, maxDate, dropdownCaption }) => {
    const validationRules = useStoryValidationRules();
    const methods = useForm<FormData>({ defaultValues });
    const [submittedData, setSubmittedData] = React.useState<FormData | null>(null);

    const handleFormSubmit = (data: FormData) => {
        setSubmittedData(data);
        onSubmit(data);
    };

    return (
        <TypedFormProvider form={methods} onSubmit={handleFormSubmit}>
            {(form) => (
                <Box padding="4" borderWidth="1" borderRadius="small">
                    <TypedFormDatePicker
                        name="dato"
                        label="Velg en dato"
                        validate={validationRules}
                        minDate={minDate}
                        maxDate={maxDate}
                        dropdownCaption={dropdownCaption}
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
    onSubmit: () => {
        // This can be kept for Storybook actions addon
    },
};

export const WithInitialValue = Template.bind({});
WithInitialValue.args = {
    onSubmit: () => {},
    defaultValues: { dato: '2024-05-20' },
};

export const WithError = Template.bind({});
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
WithError.args = {
    onSubmit: () => {},
    defaultValues: { dato: tomorrow.toISOString().split('T')[0] },
};

export const WithMonthAndYearSelector = Template.bind({});
WithMonthAndYearSelector.storyName = 'With Month and Year Selector';
WithMonthAndYearSelector.args = {
    onSubmit: () => {},
    minDate: new Date('2020-01-01'),
    maxDate: new Date('2030-12-31'),
    dropdownCaption: true,
};
