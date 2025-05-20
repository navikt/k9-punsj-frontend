import React, { useEffect } from 'react';
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
        <div className="flex flex-col gap-4 bg-bg-subtle p-4 rounded-md">
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
        </div>
    );
};

export default RelasjonTilBarnet;
