import React from 'react';
import { Field, FieldProps, FormikValues } from 'formik';
import { Personvalg } from 'app/models/types/Personvalg';

import { Button, Heading } from '@navikt/ds-react';
import { AddPerson } from '@navikt/ds-icons';
import { WrappedComponentProps } from 'react-intl';
import PersonLinje from './PersonLinje';
import './personvelger.less';

interface OwnProps extends WrappedComponentProps {
    handleBlur: (callback: () => any) => void;
}

const Personvelger = ({ intl, handleBlur }: OwnProps) => (
    <>
        <Heading size="xsmall" spacing>
            Barn
        </Heading>
        <div className="personvelger">
            <Field name="barn">
                {({ field, form }: FieldProps<Personvalg[], FormikValues>) => (
                    <>
                        {field.value.map((person, index) => (
                            <PersonLinje
                                // eslint-disable-next-line react/no-array-index-key
                                key={index}
                                person={person}
                                index={index}
                                handleBlur={handleBlur}
                                personer={field.value}
                                intl={intl}
                            />
                        ))}

                        <Button
                            variant="tertiary"
                            size="small"
                            onClick={() => form.setFieldValue('barn', [...field.value, { norskIdent: '', navn: '' }])}
                        >
                            <AddPerson />
                            Legg til barn
                        </Button>
                    </>
                )}
            </Field>
        </div>
    </>
);

export default Personvelger;
