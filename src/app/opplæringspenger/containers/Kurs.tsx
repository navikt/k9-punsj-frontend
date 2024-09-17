import { FieldArray, useField, useFormikContext } from 'formik';
import React, { useState } from 'react';

import { AddCircle, Delete } from '@navikt/ds-icons';
import { Button, Checkbox, CheckboxGroup, Heading, Label, Panel } from '@navikt/ds-react';

import VerticalSpacer from 'app/components/VerticalSpacer';
import DatoInputFormikNew from 'app/components/formikInput/DatoInputFormikNew';
import { Kursperiode } from 'app/models/types/Kurs';
import { OLPSoknad } from 'app/models/types/OLPSoknad';
import { Periode } from 'app/models/types/Periode';

import { GodkjentOpplæringsinstitusjon } from 'app/models/types/GodkjentOpplæringsinstitusjon';
import InstitusjonSelector from './InstitusjonSelector';
import './kurs.less';

interface KursComponentProps {
    institusjoner: GodkjentOpplæringsinstitusjon[];
    hentInstitusjonerLoading: boolean;
    hentInstitusjonerError: boolean;
}

const institusjonUuidFelt = 'kurs.kursHolder.institusjonsUuid';

const initialKursperiode = { periode: new Periode({}), avreise: '', hjemkomst: '' };

const KursComponent = ({ institusjoner, hentInstitusjonerLoading, hentInstitusjonerError }: KursComponentProps) => {
    const { values } = useFormikContext<OLPSoknad>();
    const [field, meta, helpers] = useField(institusjonUuidFelt);
    const [isAnnetSelected, setIsAnnetSelected] = useState(false);

    const handleCheckBoxChange = (valgteCheckBokser: string[]) => {
        setIsAnnetSelected(valgteCheckBokser.includes('Annen'));
        if (valgteCheckBokser.includes('Annen')) {
            helpers.setValue(null);
        }
    };

    return (
        <Panel border>
            <Heading size="small" level="5">
                Opplæring
            </Heading>
            <VerticalSpacer sixteenPx />
            <div className="kurs">
                {!hentInstitusjonerLoading && (
                    <InstitusjonSelector
                        label="Velg institusjon"
                        name={institusjonUuidFelt}
                        godkjentOpplæringsinstitusjoner={institusjoner}
                        hentInstitusjonerError={hentInstitusjonerError}
                        isAnnetSelected={isAnnetSelected}
                    />
                )}
                <VerticalSpacer eightPx />
                <CheckboxGroup legend="Transportmidler" hideLegend={true} onChange={handleCheckBoxChange}>
                    <Checkbox value={'Annen'}>Annen institusjon (ikke i listen)</Checkbox>
                </CheckboxGroup>
                <VerticalSpacer twentyPx />
                <FieldArray
                    name="kurs.kursperioder"
                    render={({ push, remove }) => (
                        <>
                            {values.kurs.kursperioder.map((kursperiode: Kursperiode, index: number) => (
                                // eslint-disable-next-line react/no-array-index-key
                                <React.Fragment key={index}>
                                    <div className="kurs__spacer" />
                                    <VerticalSpacer thirtyTwoPx />
                                    <Label as="p">Periode med opplæring:</Label>
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
                                    <Label as="p">Reisetid:</Label>
                                    <VerticalSpacer sixteenPx />
                                    <div style={{ display: 'flex', gap: '30px' }}>
                                        <DatoInputFormikNew
                                            label="Avreise (dato)"
                                            name={`kurs.kursperioder.${index}.avreise`}
                                        />
                                        <DatoInputFormikNew
                                            label="Hjemkomst (dato)"
                                            name={`kurs.kursperioder.${index}.hjemkomst`}
                                        />
                                        {index > 0 && (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'flex-end',
                                                    paddingBottom: '3px',
                                                }}
                                            >
                                                <Button
                                                    variant="tertiary"
                                                    size="small"
                                                    onClick={() => remove(index)}
                                                    icon={<Delete />}
                                                >
                                                    Fjern periode
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    <VerticalSpacer thirtyTwoPx />
                                </React.Fragment>
                            ))}

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
        </Panel>
    );
};

export default KursComponent;
