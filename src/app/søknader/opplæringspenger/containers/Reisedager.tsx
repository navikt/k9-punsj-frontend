import React from 'react';
import { FieldArray, useFormikContext } from 'formik';
import { AddCircle, Delete } from '@navikt/ds-icons';
import { Button } from '@navikt/ds-react';
import VerticalSpacer from 'app/components/VerticalSpacer';
import DatoInputFormikNew from 'app/components/formikInput/DatoInputFormikNew';
import { OLPSoknad } from 'app/models/types/OLPSoknad';

interface ReisedagerProps {
    name: string;
}

const Reisedager = ({ name }: ReisedagerProps): JSX.Element => {
    const { values } = useFormikContext<OLPSoknad>();

    return (
        <FieldArray
            name={name}
            render={({ push, remove }) => (
                <div>
                    {values.kurs.reise.reisedager?.map((reisedag: any, reisedagIndex: number) => (
                        <React.Fragment key={reisedagIndex}>
                            <div
                                style={{
                                    display: 'flex',
                                    gap: '30px',
                                    alignItems: 'flex-end',
                                }}
                            >
                                <DatoInputFormikNew
                                    label="Reisedag"
                                    hideLabel={true}
                                    name={`${name}.${reisedagIndex}`}
                                />
                                <Button
                                    variant="tertiary"
                                    size="small"
                                    onClick={() => remove(reisedagIndex)}
                                    icon={<Delete />}
                                >
                                    Fjern reisedag
                                </Button>
                            </div>
                            <VerticalSpacer sixteenPx />
                        </React.Fragment>
                    ))}

                    <Button variant="tertiary" size="small" onClick={() => push('')} icon={<AddCircle />}>
                        Legg til reisedag
                    </Button>
                </div>
            )}
        />
    );
};

export default Reisedager;
