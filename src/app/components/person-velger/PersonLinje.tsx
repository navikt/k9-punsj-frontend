import { Delete } from '@navikt/ds-icons';
import { TextField, BodyShort, Label, Button } from '@navikt/ds-react';
import { Personvalg } from 'app/models/types/Personvalg';
import { Field, FieldProps, FormikValues } from 'formik';
import React from 'react';
import { WrappedComponentProps } from 'react-intl';

interface OwnProps extends WrappedComponentProps {
    person: Personvalg;
    index: number;
    handleBlur: any;
    personer: Personvalg[];
}

const PersonLinje = ({ person, index, personer, handleBlur }: OwnProps) => {
    const handleIdentitetsnummer = (event: any, onChange: (value: Personvalg[]) => void) => {
        const personerEndret = personer.map((personObj: Personvalg, personIndex: number) =>
            personIndex === index ? { ...personObj, norskIdent: event.target.value.replace(/\D+/, '') } : personObj
        );
        onChange(personerEndret);
    };
    return (
        <Field name="barn">
            {({ form, meta }: FieldProps<Personvalg[], FormikValues>) => (
                <div className="personlinje">
                    <TextField
                        label="Identitetsnummer"
                        value={person.norskIdent}
                        size="small"
                        onChange={(event) =>
                            handleIdentitetsnummer(event, (value) => form.setFieldValue('barn', value))
                        }
                        onBlur={(e) => handleBlur(() => form.setFieldTouched('barn'))}
                        error={meta.touched && meta.error?.[index]?.norskIdent}
                        disabled={person.låsIdentitetsnummer}
                    />
                    <div className="navn">
                        <Label size="small">Navn</Label>
                        <BodyShort size="small">{person.navn}</BodyShort>
                    </div>
                    <Button
                        className="slett"
                        variant="tertiary"
                        size="small"
                        iconPosition="left"
                        icon={<Delete />}
                        onClick={() => {
                            form.setFieldValue(
                                'barn',
                                personer.filter((_, i) => i !== index)
                            );
                            handleBlur();
                        }}
                    >
                        Slett
                    </Button>
                </div>
            )}
        </Field>
    );
};

export default PersonLinje;
