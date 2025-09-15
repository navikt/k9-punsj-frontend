import React, { useState } from 'react';

import { FieldArray, useFormikContext } from 'formik';
import { CalendarIcon, PlusCircleIcon, TrashIcon } from '@navikt/aksel-icons';
import { Alert, Box, Button, Checkbox, Heading, Label, VStack } from '@navikt/ds-react';
import VerticalSpacer from 'app/components/VerticalSpacer';
import DatoInputFormikNew from 'app/components/formikInput/DatoInputFormikNew';
import { Kursperiode } from 'app/models/types/Kurs';
import { OLPSoknad } from 'app/models/types/OLPSoknad';
import { Periode } from 'app/models/types/Periode';
import InstitusjonSelector from './InstitusjonSelector';

import TextFieldFormik from 'app/components/formikInput/TextFieldFormik';
import { JaNei } from 'app/models/enums';
import { v4 as uuidv4 } from 'uuid';
import { FormattedMessage } from 'react-intl';
import { generateDateString } from 'app/components/skjema/skjemaUtils';

const kursholder = 'kurs.kursHolder';
const kursholderNavn = `${kursholder}.holder`;

const initialKursperiode = () => {
    return {
        periode: new Periode({}),
        key: uuidv4(),
    };
};

const Kurs = ({
    eksisterendePerioder,
    hentEksisterendePerioderError,
}: {
    eksisterendePerioder: Periode[];
    hentEksisterendePerioderError: boolean;
}) => {
    const { values, setFieldValue } = useFormikContext<OLPSoknad>();
    const [nyttInstitusjonsopphold, setNyttInstitusjonsopphold] = useState<boolean>(
        Array.isArray(eksisterendePerioder) && eksisterendePerioder.length === 0,
    );
    const handleAvbryt = () => {
        setNyttInstitusjonsopphold(false);
        setFieldValue('kurs.kursperioder', []);
        setFieldValue('kurs.kursHolder', {
            institusjonsUuid: null,
            holder: '',
        });
    };

    const handleLeggTilNyttInstitusjonsopphold = () => {
        setNyttInstitusjonsopphold(true);
        setFieldValue('kurs.kursperioder', [initialKursperiode()]);
        setFieldValue('kurs.kursHolder', {
            institusjonsUuid: null,
            holder: '',
        });
    };

    return (
        <Box padding="4" borderWidth="1" borderRadius="large">
            <Heading size="small" level="5">
                Søknadsperiode og institusjon
            </Heading>
            {hentEksisterendePerioderError && (
                <Alert size="small" variant="error">
                    <FormattedMessage id="skjema.eksisterende.feil" />
                </Alert>
            )}

            {eksisterendePerioder.length > 0 && (
                <Box className="bg-bg-subtle rounded-lg p-4 mt-[8px]">
                    <VStack gap="4">
                        <Label size="medium">Eksisterende søknadsperioder</Label>
                        {eksisterendePerioder.map((p) => (
                            <div key={`${p.fom}_${p.tom}`} className="flex items-center gap-4">
                                <CalendarIcon title="calendar" fontSize="1.5rem" />
                                <div className="periode">{generateDateString(p)}</div>
                            </div>
                        ))}
                    </VStack>
                </Box>
            )}

            <VerticalSpacer sixteenPx />
            {nyttInstitusjonsopphold && (
                <Box padding="4" background="bg-subtle" borderRadius="large">
                    <div className="flex flex-col gap-4">
                        <InstitusjonSelector
                            label="På hvilken helseinstitusjon eller kompetansesenter foregår opplæringen?"
                            name={kursholder}
                            isAnnetSelected={values?.metadata?.harValgtAnnenInstitusjon?.includes(JaNei.JA)}
                        />
                        <Checkbox
                            size="small"
                            checked={values?.metadata?.harValgtAnnenInstitusjon?.includes(JaNei.JA)}
                            onChange={() => {
                                if (values?.metadata?.harValgtAnnenInstitusjon?.includes(JaNei.JA)) {
                                    setFieldValue('metadata.harValgtAnnenInstitusjon', []);
                                } else {
                                    setFieldValue('metadata.harValgtAnnenInstitusjon', [JaNei.JA]);
                                }
                                setFieldValue(kursholder, {
                                    institusjonsUuid: null,
                                    holder: '',
                                });
                            }}
                        >
                            Annen institusjon (ikke i listen)
                        </Checkbox>
                        {values?.metadata?.harValgtAnnenInstitusjon?.includes(JaNei.JA) && (
                            <>
                                <TextFieldFormik size="small" label="Navn på institusjon" name={kursholderNavn} />
                            </>
                        )}
                        <div>
                            <FieldArray
                                name="kurs.kursperioder"
                                render={({ push, remove }) => (
                                    <>
                                        {values.kurs.kursperioder.map((kursperiode: Kursperiode, index: number) => (
                                            <div className="mb-4" key={kursperiode.key}>
                                                <div className="flex gap-4">
                                                    <div className="flex gap-4">
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
                                                    {values.kurs.kursperioder.length > 1 && (
                                                        <Button
                                                            variant="tertiary"
                                                            className="slett-knapp-med-icon-for-input !mt-7"
                                                            size="small"
                                                            icon={<TrashIcon fontSize={24} title="slett periode" />}
                                                            onClick={() => {
                                                                remove(index);
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        <div>
                                            <Button
                                                className="kurs__addButton"
                                                variant="tertiary"
                                                size="small"
                                                onClick={() => push(initialKursperiode())}
                                                icon={<PlusCircleIcon title="legg til periode" />}
                                            >
                                                Legg til ny periode
                                            </Button>
                                        </div>
                                    </>
                                )}
                            />
                        </div>
                        <div>
                            {nyttInstitusjonsopphold && eksisterendePerioder.length > 0 && (
                                <Button variant="secondary" size="small" onClick={handleAvbryt}>
                                    Avbryt
                                </Button>
                            )}
                        </div>
                    </div>
                </Box>
            )}
            {!nyttInstitusjonsopphold && (
                <Button
                    variant="tertiary"
                    size="small"
                    icon={<PlusCircleIcon title="legg til nytt institusjonsopphold" />}
                    onClick={handleLeggTilNyttInstitusjonsopphold}
                >
                    Legg til nytt institusjonsopphold
                </Button>
            )}
        </Box>
    );
};

export default Kurs;
