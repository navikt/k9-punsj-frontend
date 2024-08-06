import { FieldArray, useField, useFormikContext } from 'formik';
import React, { useEffect } from 'react';

import { AddPerson } from '@navikt/ds-icons';
import { Button } from '@navikt/ds-react';

import { hentBarn } from 'app/api/api';
import { Person } from 'app/models/types';
import { Personvalg } from 'app/models/types/Personvalg';

import PersonLinje from './PersonLinje';
import './personvelger.less';

interface OwnProps {
    handleBlur?: (callback: () => any) => void;
    name: string;
    sokersIdent?: string;
    populerMedBarn?: boolean;
}

const Personvelger = ({ handleBlur, name, sokersIdent, populerMedBarn }: OwnProps) => {
    const { setFieldValue } = useFormikContext();
    const [field] = useField<Personvalg[]>(name);

    useEffect(() => {
        if (populerMedBarn && sokersIdent) {
            hentBarn(sokersIdent).then((response: Response) => {
                if (response.ok) {
                    response.json().then((data) => {
                        if (data.barn?.length) {
                            const barn = data.barn.map(
                                (barnet: Person): Personvalg => ({
                                    norskIdent: barnet.identitetsnummer,
                                    navn: `${barnet.fornavn} ${barnet.etternavn}`,
                                    låsIdentitetsnummer: true,
                                }),
                            );
                            setFieldValue(name, barn);
                        }
                    });
                }
            });
        }
    }, []);

    return (
        <div className="personvelger">
            <FieldArray
                name={name}
                render={(arrayHelpers) => (
                    <>
                        {field.value.map((_, index) => (
                            <PersonLinje
                                 react/no-array-index-key
                                key={index}
                                index={index}
                                handleBlur={handleBlur}
                                slett={() => arrayHelpers.remove(index)}
                                name={name}
                            />
                        ))}
                        <Button
                            variant="tertiary"
                            size="small"
                            icon={<AddPerson />}
                            iconPosition="left"
                            onClick={() => arrayHelpers.push({ norskIdent: '', navn: '' })}
                        >
                            Legg til person
                        </Button>
                    </>
                )}
            />
        </div>
    );
};

export default Personvelger;
