import React, { useEffect } from 'react';
import { Box } from '@navikt/ds-react';
import SelectFormik from 'app/components/formikInput/SelectFormik';
import { FormikValues, useFormikContext } from 'formik';
import { RelasjonTilBarnet as RelasjonTilBarnetEnum } from 'app/models/enums/RelasjonTilBarnet';
import TextAreaFormik from 'app/components/formikInput/TextAreaFormik';

const RelasjonTilBarnet = () => {
    const { values, setFieldValue } = useFormikContext<FormikValues>();

    useEffect(() => {
        if (values.omsorg.relasjonTilBarnet !== RelasjonTilBarnetEnum.ANNET) {
            setFieldValue('omsorg.beskrivelseAvOmsorgsrollen', '');
        }
    }, [values.omsorg.relasjonTilBarnet]);

    return (
        <Box padding="space-16" borderRadius="8" background="neutral-soft" className="flex flex-col gap-4">
            <SelectFormik
                className="max-w-[200px]"
                value={values.omsorg.relasjonTilBarnet}
                label="Relasjon til barnet"
                name="omsorg.relasjonTilBarnet"
                options={Object.values(RelasjonTilBarnetEnum).map((rel) => ({ value: rel, label: rel }))}
            />

            {values.omsorg.relasjonTilBarnet === RelasjonTilBarnetEnum.ANNET && (
                <TextAreaFormik
                    className="max-w-lg"
                    label="Beskrivelse av omsorgsrollen"
                    name="omsorg.beskrivelseAvOmsorgsrollen"
                />
            )}
        </Box>
    );
};

export default RelasjonTilBarnet;
