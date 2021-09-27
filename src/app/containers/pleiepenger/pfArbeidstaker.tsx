import VerticalSpacer from 'app/components/VerticalSpacer';
import { UpdateListeinfoInSoknad, UpdateListeinfoInSoknadState } from 'app/containers/pleiepenger/Listepaneler';
import { GetErrorMessage, PeriodeinfoPaneler } from 'app/containers/pleiepenger/PeriodeinfoPaneler';
import { get } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { Checkbox, Input, RadioPanelGruppe, Select, SkjemaGruppe } from 'nav-frontend-skjema';
import React, { useEffect, useState } from 'react';
import { Container, Row } from 'react-bootstrap';
import { IntlShape } from 'react-intl';
import { ApiPath } from '../../apiConfig';
import { ArbeidsgivereResponse } from '../../models/types/ArbeidsgivereResponse';
import { Arbeidstaker, IArbeidstaker, OrgOrPers } from '../../models/types/Arbeidstaker';
import Organisasjon from '../../models/types/Organisasjon';
import { arbeidstidInformasjon } from './ArbeidstidInfo';
import { pfArbeidstider } from './pfArbeidstider';
import ArbeidsgiverResponse from '../../models/types/ArbeidsgiverResponse';
import './pfArbeidstaker.less';

// eslint-disable-next-line import/prefer-default-export
export function pfArbeidstaker(
    søkerId: string
): (
    arbeidstaker: Arbeidstaker,
    listeelementindex: number,
    updateListeinfoInSoknad: UpdateListeinfoInSoknad<IArbeidstaker>,
    updateListeinfoInSoknadState: UpdateListeinfoInSoknadState<IArbeidstaker>,
    feilprefiks: string,
    getErrorMessage: GetErrorMessage,
    intl: IntlShape
) => JSX.Element {
    return (
        arbeidstaker: Arbeidstaker,
        listeelementindex: number,
        updateListeinfoInSoknad: UpdateListeinfoInSoknad<IArbeidstaker>,
        updateListeinfoInSoknadState: UpdateListeinfoInSoknadState<IArbeidstaker>,
        feilprefiks: string,
        getErrorMessage: GetErrorMessage,
        intl: IntlShape
    ) => {
        const [arbeidsgivere, setArbeidsgivere] = useState<Organisasjon[]>([]);
        // eslint-disable-next-line react/destructuring-assignment
        const [selectedArbeidsgiver, setSelectedArbeidsgiver] = useState(arbeidstaker?.organisasjonsnummer || '');
        const [gjelderAnnenArbeidsgiver, setGjelderAnnenArbeidsgiver] = useState(false);
        const [arbeidsgiverNavn, setArbeidsgivernavn] = useState('');

        const søkPåArbeidsgiver = (orgnr: string) => {
            if (søkerId) {
                get(
                    `${ApiPath.SØK_ORGNUMMER}?organisasjonsnummer=${orgnr}`,
                    { norskIdent: søkerId },
                    { 'X-Nav-NorskIdent': søkerId },
                    (response, data: ArbeidsgiverResponse) => {
                        if (response.status === 200) {
                            if (data.navn) {
                                setArbeidsgivernavn(data.navn);
                            }
                        }
                    }
                );
            }
        };

        useEffect(() => {
            if (søkerId) {
                get(
                    ApiPath.FINN_ARBEIDSGIVERE,
                    { norskIdent: søkerId },
                    { 'X-Nav-NorskIdent': søkerId },
                    (response, data: ArbeidsgivereResponse) => {
                        if (response.status === 200) {
                            if (data.organisasjoner) {
                                setArbeidsgivere(data.organisasjoner);
                            }
                        }
                    }
                );
                if (arbeidstaker.organisasjonsnummer) {
                    søkPåArbeidsgiver(arbeidstaker.organisasjonsnummer);
                }
            }
        }, []);

        const updateOrgOrPers = (orgOrPers: OrgOrPers) => {
            let organisasjonsnummer: string | null;
            let norskIdent: string | null;
            if (orgOrPers === 'o') {
                organisasjonsnummer = '';
                norskIdent = null;
            } else {
                organisasjonsnummer = null;
                norskIdent = '';
            }
            updateListeinfoInSoknadState({ organisasjonsnummer, norskIdent });
            updateListeinfoInSoknad({ organisasjonsnummer, norskIdent });
        };

        const { orgOrPers, organisasjonsnummer, norskIdent, arbeidstidInfo } = arbeidstaker;

        const selectedType: OrgOrPers = orgOrPers();

        return (
            <SkjemaGruppe
                className="arbeidstaker-panel"
                feil={getErrorMessage(`${feilprefiks}.${selectedType === 'o' ? 'norskIdent' : 'organisasjonsnummer'}`)}
            >
                <Container>
                    <Row noGutters>
                        <RadioPanelGruppe
                            className="horizontalRadios"
                            radios={[
                                {
                                    label: intlHelper(intl, 'skjema.arbeid.arbeidstaker.org'),
                                    value: 'o',
                                },
                                {
                                    label: intlHelper(intl, 'skjema.arbeid.arbeidstaker.pers'),
                                    value: 'p',
                                },
                            ]}
                            name={`arbeidsgivertype_${1}_${listeelementindex}`}
                            legend={intlHelper(intl, 'skjema.arbeid.arbeidstaker.type')}
                            onChange={(event) => updateOrgOrPers((event.target as HTMLInputElement).value as OrgOrPers)}
                            checked={selectedType}
                        />
                    </Row>
                    {selectedType === 'o' && (
                        <>
                            {arbeidsgivere?.length > 0 && (
                                <Select
                                    value={selectedArbeidsgiver}
                                    bredde="l"
                                    label="Velg hvilken arbeidsgiver det gjelder"
                                    onChange={(event) => {
                                        const { value } = event.target;
                                        setSelectedArbeidsgiver(value);
                                        updateListeinfoInSoknadState({
                                            organisasjonsnummer: value,
                                        });
                                        updateListeinfoInSoknad({
                                            organisasjonsnummer: value,
                                        });
                                        if (!value) {
                                            setArbeidsgivernavn('');
                                        }
                                    }}
                                    disabled={gjelderAnnenArbeidsgiver}
                                    selected={selectedArbeidsgiver}
                                    feil={getErrorMessage(`[${listeelementindex}].organisasjonsnummer`)}
                                >
                                    <option key="default" value="" label="" aria-label="Tomt valg" />)
                                    {arbeidsgivere.map((arbeidsgiver) => (
                                        <option
                                            key={arbeidsgiver.organisasjonsnummer}
                                            value={arbeidsgiver.organisasjonsnummer}
                                        >
                                            {`${arbeidsgiver.navn} - ${arbeidsgiver.organisasjonsnummer}`}
                                        </option>
                                    ))}
                                </Select>
                            )}
                            <VerticalSpacer eightPx />
                            <Checkbox
                                label="Det gjelder annen arbeidsgiver"
                                onChange={(e) => {
                                    setGjelderAnnenArbeidsgiver(e.target.checked);
                                }}
                            />
                            {gjelderAnnenArbeidsgiver && (
                                <>
                                    <VerticalSpacer sixteenPx />
                                    <Row noGutters>
                                        <div className="input-row">
                                            <Input
                                                label={intlHelper(intl, 'skjema.arbeid.arbeidstaker.orgnr')}
                                                bredde="M"
                                                value={organisasjonsnummer || ''}
                                                className="arbeidstaker-organisasjonsnummer"
                                                onChange={(event) => {
                                                    updateListeinfoInSoknadState({
                                                        organisasjonsnummer: event.target.value,
                                                    });
                                                    if (event.target.value.length === 9) {
                                                        søkPåArbeidsgiver(event.target.value);
                                                    }
                                                }}
                                                onBlur={(event) =>
                                                    updateListeinfoInSoknad({
                                                        organisasjonsnummer: event.target.value,
                                                    })
                                                }
                                                feil={getErrorMessage(`[${listeelementindex}].organisasjonsnummer`)}
                                            />
                                            {arbeidsgiverNavn && (
                                                <p className="arbeidstaker__arbeidsgiverNavn">{arbeidsgiverNavn}</p>
                                            )}
                                        </div>
                                    </Row>
                                </>
                            )}
                        </>
                    )}
                    <Row noGutters>
                        <div className="input-row">
                            {selectedType === 'p' && (
                                <Input
                                    label={intlHelper(intl, 'skjema.arbeid.arbeidstaker.ident')}
                                    value={norskIdent || ''}
                                    bredde="M"
                                    className="arbeidstaker-norskIdent"
                                    onChange={(event) =>
                                        updateListeinfoInSoknadState({
                                            norskIdent: event.target.value,
                                        })
                                    }
                                    onBlur={(event) => updateListeinfoInSoknad({ norskIdent: event.target.value })}
                                    feil={getErrorMessage(`[${listeelementindex}].norskIdent`)}
                                />
                            )}
                        </div>
                    </Row>
                    {arbeidstidInformasjon(intl)}
                    <PeriodeinfoPaneler
                        intl={intl}
                        periods={arbeidstidInfo.perioder}
                        panelid={(i) => `arbeidstakerpanel_${listeelementindex}_${i}`}
                        initialPeriodeinfo={{
                            faktiskArbeidTimerPerDag: '',
                            periode: { fom: '', tom: '' },
                        }}
                        editSoknad={(periodeinfo) =>
                            updateListeinfoInSoknad({
                                arbeidstidInfo: {
                                    ...arbeidstaker.arbeidstidInfo,
                                    perioder: periodeinfo,
                                },
                            })
                        }
                        editSoknadState={(periodeinfo) =>
                            updateListeinfoInSoknadState({
                                arbeidstidInfo: {
                                    ...arbeidstaker.arbeidstidInfo,
                                    perioder: periodeinfo,
                                },
                            })
                        }
                        component={pfArbeidstider()}
                        minstEn
                        textFjern="skjema.arbeid.arbeidstaker.fjernperiode"
                        getErrorMessage={getErrorMessage}
                        feilkodeprefiks={`[${listeelementindex}].timerfaktisk`}
                        kanHaFlere
                        medSlettKnapp={false}
                    />
                </Container>
            </SkjemaGruppe>
        );
    };
}
