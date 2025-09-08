import React from 'react';

import { FieldArray, useFormikContext } from 'formik';
import { PlusCircleIcon, TrashIcon } from '@navikt/aksel-icons';
import { Box, Button, Checkbox, Heading } from '@navikt/ds-react';
import VerticalSpacer from 'app/components/VerticalSpacer';
import DatoInputFormikNew from 'app/components/formikInput/DatoInputFormikNew';
import { Kursperiode } from 'app/models/types/Kurs';
import { OLPSoknad } from 'app/models/types/OLPSoknad';
import { Periode } from 'app/models/types/Periode';
import InstitusjonSelector from './InstitusjonSelector';

import './kurs.less';
import TextFieldFormik from 'app/components/formikInput/TextFieldFormik';
import { JaNei } from 'app/models/enums';
import { v4 as uuidv4 } from 'uuid';
import RadioGroupFormik from 'app/components/formikInput/RadioGroupFormik';
import { capitalize } from 'lodash';
import { EregSøk } from 'app/components/ereg-søk/EregSøk';

const kursholder = 'kurs.kursHolder';
const kursholderNavn = `${kursholder}.holder`;
const kursholderOrgnr = `${kursholder}.orgnr`;

const initialKursperiode = () => {
    return {
        periode: new Periode({}),
        key: uuidv4(),
    };
};

const KursComponent = () => {
    const { values, setFieldValue } = useFormikContext<OLPSoknad>();

    return (
        <Box padding="4" borderWidth="1" borderRadius="small">
            <Heading size="small" level="5">
                Søknadsperiode og institusjon
            </Heading>

            <VerticalSpacer sixteenPx />

            <div className="kurs flex flex-col gap-4">
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
                            holder: null,
                            orgnr: '',
                        });
                        setFieldValue('metadata.harOrgnr', '');
                    }}
                >
                    Annen institusjon (ikke i listen)
                </Checkbox>

                <div className="flex flex-col gap-4">
                    {values?.metadata?.harValgtAnnenInstitusjon?.includes(JaNei.JA) && (
                        <RadioGroupFormik
                            size="small"
                            name="metadata.harOrgnr"
                            options={Object.values(JaNei).map((v) => ({ value: v, label: capitalize(v) }))}
                            legend="Har institusjon/kompetansesenter et organisasjonsnummer?"
                        />
                    )}

                    {values?.metadata?.harOrgnr?.includes(JaNei.NEI) && (
                        <>
                            <TextFieldFormik size="small" label="Navn på institusjon" name={kursholderNavn} />
                        </>
                    )}

                    {values?.metadata?.harOrgnr?.includes(JaNei.JA) && (
                        <EregSøk
                            orgnavn={values?.kurs?.kursHolder?.holder}
                            setOrgnavn={(orgnavn) => setFieldValue(kursholderNavn, orgnavn)}
                            orgnr={values?.kurs?.kursHolder?.orgnr}
                            setOrgnr={(orgnr) => setFieldValue(kursholderOrgnr, orgnr)}
                        />
                    )}
                </div>

                <div>
                    <FieldArray
                        name="kurs.kursperioder"
                        render={({ push, remove }) => (
                            <>
                                {values.kurs.kursperioder.map((kursperiode: Kursperiode, index: number) => (
                                    <div className="mt-4" key={kursperiode.key}>
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
                                    </div>
                                ))}

                                <div className="mt-4">
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
            </div>
        </Box>
    );
};

export default KursComponent;
