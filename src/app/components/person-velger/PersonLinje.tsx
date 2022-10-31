import { Delete } from '@navikt/ds-icons';
import { BodyShort, Label, Button } from '@navikt/ds-react';
import { Personvalg } from 'app/models/types/Personvalg';
import { Field, FieldProps, FormikValues, useFormikContext } from 'formik';
import { get, set } from 'lodash';
import React from 'react';
import TextFieldFormik from '../formikInput/TextFieldFormik';

interface OwnProps {
    index: number;
    handleBlur?: any;
    name: string;
    slett: () => void;
}

const PersonLinje = ({ index, handleBlur, name, slett }: OwnProps) => {
    const { values } = useFormikContext<any>();
    const indexName = `${name}.[${index}]`;
    const slettHandler = () => {
        slett();
        if (handleBlur) {
            handleBlur(
                undefined,
                set(
                    values,
                    name,
                    get(values, name).filter((barn: Personvalg, barnIndex: number) => barnIndex !== index)
                )
            );
        }
    };
    return (
        <Field name={indexName}>
            {({ field, form }: FieldProps<Personvalg, FormikValues>) => (
                <div className="personlinje">
                    <TextFieldFormik
                        label="Identitetsnummer"
                        name={`${indexName}.norskIdent`}
                        size="small"
                        onChange={(event) =>
                            form.setFieldValue(`${indexName}.norskIdent`, event.target.value.replace(/\D+/, ''))
                        }
                        disabled={field.value.låsIdentitetsnummer}
                    />
                    <div className="navn">
                        <Label size="small">Navn</Label>
                        <BodyShort size="small">{field.value.navn}</BodyShort>
                    </div>
                    <Button
                        className="slett"
                        variant="tertiary"
                        size="small"
                        iconPosition="left"
                        icon={<Delete />}
                        onClick={slettHandler}
                    >
                        Slett
                    </Button>
                </div>
            )}
        </Field>
    );
};

export default PersonLinje;
