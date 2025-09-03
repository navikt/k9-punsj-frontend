import React, { useEffect } from 'react';

import { FieldArray, useFormikContext } from 'formik';
import { PlusCircleIcon, TrashIcon } from '@navikt/aksel-icons';
import { Box, Button, Heading } from '@navikt/ds-react';
import VerticalSpacer from 'app/components/VerticalSpacer';
import DatoInputFormikNew from 'app/components/formikInput/DatoInputFormikNew';
import { Kursperiode } from 'app/models/types/Kurs';
import { OLPSoknad } from 'app/models/types/OLPSoknad';
import { Periode } from 'app/models/types/Periode';
import InstitusjonSelector from './InstitusjonSelector';

import './kurs.less';
import TextFieldFormik from 'app/components/formikInput/TextFieldFormik';
import CheckboxFormik from 'app/components/formikInput/CheckboxFormik';
import { JaNei } from 'app/models/enums';
import { v4 as uuidv4 } from 'uuid';

const kursholder = 'kurs.kursHolder';
const kursholderNavn = `${kursholder}.holder`;
const initialKursperiode = {
    periode: new Periode({}),
    key: uuidv4(),
};

const KursComponent = () => {
    const { values, setFieldValue } = useFormikContext<OLPSoknad>();

    useEffect(() => {
        setFieldValue(kursholder, {
            institusjonsUuid: '',
            holder: '',
        });
    }, [values?.metadata?.harValgtAnnenInstitusjon]);

    return (
        <Box padding="4" borderWidth="1" borderRadius="small">
            <Heading size="small" level="5">
                Søknadsperiode og institusjon
            </Heading>

            <VerticalSpacer sixteenPx />

            <div className="kurs">
                <InstitusjonSelector
                    label="På hvilken helseinstitusjon eller kompetansesenter foregår opplæringen?"
                    name={kursholder}
                    isAnnetSelected={values?.metadata?.harValgtAnnenInstitusjon?.includes(JaNei.JA)}
                />

                <VerticalSpacer eightPx />

                <CheckboxFormik value={'ja'} name="metadata.harValgtAnnenInstitusjon">
                    Annen institusjon (ikke i listen)
                </CheckboxFormik>

                {values?.metadata?.harValgtAnnenInstitusjon?.includes(JaNei.JA) && (
                    <>
                        <TextFieldFormik label="Navn på institusjon" name={kursholderNavn} />
                    </>
                )}

                <VerticalSpacer twentyPx />

                <FieldArray
                    name="kurs.kursperioder"
                    render={({ push, remove }) => (
                        <>
                            {values.kurs.kursperioder.map((kursperiode: Kursperiode, index: number) => (
                                <React.Fragment key={kursperiode.key}>
                                    <div className="kurs__spacer" />
                                    <VerticalSpacer thirtyTwoPx />
                                    <div className="flex gap-4">
                                        <div className="flex gap-4 mr-2">
                                            <DatoInputFormikNew
                                                label="Fra"
                                                name={`kurs.kursperioder[${index}].periode.fom`}
                                                size="small"
                                            />
                                            <DatoInputFormikNew
                                                label="Til"
                                                name={`kurs.kursperioder[${index}].periode.tom`}
                                                size="small"
                                            />
                                        </div>
                                        <Button
                                            variant="tertiary"
                                            className="slett-knapp-med-icon-for-input !mt-8"
                                            size="small"
                                            icon={<TrashIcon fontSize={24} title="slett periode" />}
                                            onClick={() => {
                                                remove(index);
                                            }}
                                        >
                                            Fjern
                                        </Button>
                                    </div>
                                    <VerticalSpacer thirtyTwoPx />

                                    <VerticalSpacer sixteenPx />
                                </React.Fragment>
                            ))}

                            <VerticalSpacer twentyPx />

                            <Button
                                className="kurs__addButton"
                                variant="tertiary"
                                size="small"
                                onClick={() => push(initialKursperiode)}
                                icon={<PlusCircleIcon title="legg til periode" />}
                            >
                                Legg til ny periode
                            </Button>
                        </>
                    )}
                />
            </div>
        </Box>
    );
};

export default KursComponent;
