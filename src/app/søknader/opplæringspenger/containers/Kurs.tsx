import React, { useEffect } from 'react';

import { FieldArray, useFormikContext } from 'formik';
import { AddCircle, Delete } from '@navikt/ds-icons';
import { Box, Button, Checkbox, CheckboxGroup, Heading, Label } from '@navikt/ds-react';
import VerticalSpacer from 'app/components/VerticalSpacer';
import DatoInputFormikNew from 'app/components/formikInput/DatoInputFormikNew';
import { Kursperiode } from 'app/models/types/Kurs';
import { OLPSoknad } from 'app/models/types/OLPSoknad';
import { Periode } from 'app/models/types/Periode';
import { GodkjentOpplæringsinstitusjon } from 'app/models/types/GodkjentOpplæringsinstitusjon';
import InstitusjonSelector from './InstitusjonSelector';

import './kurs.less';
import TextFieldFormik from 'app/components/formikInput/TextFieldFormik';
import CheckboxFormik from 'app/components/formikInput/CheckboxFormik';

interface KursComponentProps {
    institusjoner: GodkjentOpplæringsinstitusjon[];
    hentInstitusjonerLoading: boolean;
    hentInstitusjonerError: boolean;
}

const kursholder = 'kurs.kursHolder';
const kursholderUuid = `${kursholder}.institusjonsUuid`;
const kursholderNavn = `${kursholder}.holder`;
const initialKursperiode = {
    periode: new Periode({}),
};

const KursComponent = ({ institusjoner, hentInstitusjonerLoading, hentInstitusjonerError }: KursComponentProps) => {
    const { values, setFieldValue } = useFormikContext<OLPSoknad>();

    useEffect(() => {
        if (values?.metadata?.harValgtAnnenInstitusjon) {
            setFieldValue(kursholderUuid, '');
            setFieldValue(kursholderNavn, '');
        }
    }, [values?.metadata?.harValgtAnnenInstitusjon]);

    // TODO: Use intl for tekst
    return (
        <Box padding="4" borderWidth="1" borderRadius="small">
            <Heading size="small" level="5">
                Opplæring
            </Heading>

            <VerticalSpacer sixteenPx />

            <div className="kurs">
                {!hentInstitusjonerLoading && (
                    <InstitusjonSelector
                        label="Velg institusjon"
                        name={kursholder}
                        godkjentOpplæringsinstitusjoner={institusjoner}
                        hentInstitusjonerError={hentInstitusjonerError}
                        isAnnetSelected={values?.metadata?.harValgtAnnenInstitusjon.includes('ja')}
                    />
                )}

                <VerticalSpacer eightPx />

                <CheckboxFormik value={'ja'} name="metadata.harValgtAnnenInstitusjon">
                    Annen institusjon (ikke i listen)
                </CheckboxFormik>

                {values?.metadata?.harValgtAnnenInstitusjon.includes('ja') && (
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
                                <React.Fragment key={index}>
                                    <div className="kurs__spacer" />
                                    <VerticalSpacer thirtyTwoPx />
                                    <div>
                                        <Label as="p">Periode med opplæring:</Label>
                                        <div className="flex items-end float-right">
                                            <Button
                                                variant="tertiary"
                                                size="small"
                                                icon={<Delete />}
                                                onClick={() => remove(index)}
                                            >
                                                Fjern periode
                                            </Button>
                                        </div>
                                    </div>
                                    <VerticalSpacer sixteenPx />
                                    <div style={{ display: 'flex', gap: '30px' }}>
                                        <DatoInputFormikNew
                                            label="Fra"
                                            name={`kurs.kursperioder.${index}.periode.fom`}
                                        />
                                        <DatoInputFormikNew
                                            label="Til"
                                            name={`kurs.kursperioder.${index}.periode.tom`}
                                        />
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
                                icon={<AddCircle />}
                            >
                                Legg til ny periode med opplæring
                            </Button>
                        </>
                    )}
                />
            </div>
        </Box>
    );
};

export default KursComponent;
