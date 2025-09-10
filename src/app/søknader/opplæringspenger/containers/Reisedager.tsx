import React from 'react';
import { FieldArray, useFormikContext } from 'formik';
import { PlusCircleIcon, TrashIcon } from '@navikt/aksel-icons';
import { Box, Button } from '@navikt/ds-react';
import VerticalSpacer from 'app/components/VerticalSpacer';
import DatoInputFormikNew from 'app/components/formikInput/DatoInputFormikNew';
import { OLPSoknad } from 'app/models/types/OLPSoknad';
import TextAreaFormik from 'app/components/formikInput/TextAreaFormik';
import { CheckboksPanel } from 'nav-frontend-skjema';
import { JaNei } from 'app/models/enums/JaNei';

const Reisedager = () => {
    const { values, setFieldValue } = useFormikContext<OLPSoknad>();

    const toggleReisedager = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.checked ? JaNei.JA : JaNei.NEI;
        if (value === JaNei.JA) {
            setFieldValue('kurs.reise.reisedager', ['']);
        }
        if (value === JaNei.NEI) {
            setFieldValue('kurs.reise.reisedager', []);
            setFieldValue('kurs.reise.reisedagerBeskrivelse', '');
        }
        setFieldValue('metadata.skalOppgiReise', value);
        setFieldValue('kurs.reise.reisedagerBeskrivelse', '');
    };
    return (
        <>
            <CheckboksPanel
                checked={values.metadata.skalOppgiReise === JaNei.JA}
                onChange={toggleReisedager}
                label="Det er oppgitt informasjon om reisedager"
            />
            {values.metadata.skalOppgiReise === JaNei.JA && (
                <Box padding="4" borderRadius="large" className="bg-bg-subtle">
                    <FieldArray
                        name={`kurs.reise.reisedager`}
                        render={({ push, remove }) => (
                            <div>
                                {values.kurs.reise.reisedager?.map((reisedag: any, reisedagIndex: number) => (
                                    <React.Fragment key={reisedagIndex}>
                                        <div className="flex justify-between">
                                            <DatoInputFormikNew
                                                label="Reisedag (dato)"
                                                hideLabel={true}
                                                name={`kurs.reise.reisedager.${reisedagIndex}`}
                                            />
                                            {values.kurs.reise.reisedager?.length > 1 && (
                                                <Button
                                                    variant="tertiary"
                                                    size="small"
                                                    className="slett-knapp-med-icon"
                                                    onClick={() => remove(reisedagIndex)}
                                                    icon={<TrashIcon title="slett reisedag" />}
                                                >
                                                    Fjern reisedag
                                                </Button>
                                            )}
                                        </div>
                                        <VerticalSpacer sixteenPx />
                                    </React.Fragment>
                                ))}

                                <Button
                                    variant="tertiary"
                                    size="small"
                                    onClick={() => push('')}
                                    icon={<PlusCircleIcon title="legg til reisedag" />}
                                >
                                    Legg til ny reisedag
                                </Button>
                            </div>
                        )}
                    />
                    <div className="max-w-lg">
                        <VerticalSpacer sixteenPx />
                        <TextAreaFormik label="Beskrivelse" name={`kurs.reise.reisedagerBeskrivelse`} />
                    </div>
                </Box>
            )}
        </>
    );
};

export default Reisedager;
