import React from 'react';
import { FieldArray, useFormikContext } from 'formik';
import { PlusCircleIcon, TrashIcon } from '@navikt/aksel-icons';
import { Box, Button } from '@navikt/ds-react';
import VerticalSpacer from 'app/components/VerticalSpacer';
import DatoInputFormikNew from 'app/components/formikInput/DatoInputFormikNew';
import { OLPSoknad } from 'app/models/types/OLPSoknad';
import TextAreaFormik from 'app/components/formikInput/TextAreaFormik';

const Reisedager = () => {
    const { values } = useFormikContext<OLPSoknad>();

    return (
        <Box padding="4" borderRadius="small" className="bg-bg-subtle">
            <FieldArray
                name={`kurs.reise.reisedager`}
                render={({ push, remove }) => (
                    <div>
                        {values.kurs.reise.reisedager?.map((reisedag: any, reisedagIndex: number) => (
                            <React.Fragment key={reisedagIndex}>
                                <div className="flex justify-between">
                                    <DatoInputFormikNew
                                        label="Reisedag"
                                        hideLabel={true}
                                        name={`kurs.reise.reisedager.${reisedagIndex}`}
                                    />
                                    <Button
                                        variant="tertiary"
                                        size="small"
                                        onClick={() => remove(reisedagIndex)}
                                        icon={<TrashIcon title="slett reisedag" />}
                                    >
                                        Fjern reisedag
                                    </Button>
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
                            Legg til reisedag
                        </Button>
                    </div>
                )}
            />
            {values.kurs.reise.reisedager?.length > 0 && (
                <div className="max-w-lg">
                    <VerticalSpacer sixteenPx />
                    <TextAreaFormik label="Beskrivelse" name={`kurs.reise.reisedagerBeskrivelse`} />
                </div>
            )}
        </Box>
    );
};

export default Reisedager;
