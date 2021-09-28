import VerticalSpacer from 'app/components/VerticalSpacer';
import { UpdateListeinfoInSoknad, UpdateListeinfoInSoknadState } from 'app/containers/pleiepenger/Listepaneler';
import { GetErrorMessage, PeriodeinfoPaneler } from 'app/containers/pleiepenger/PeriodeinfoPaneler';
import { get } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { Checkbox, Input, RadioPanelGruppe, Select, SkjemaGruppe } from 'nav-frontend-skjema';
import React, { useEffect, useReducer } from 'react';
import { Container, Row } from 'react-bootstrap';
import { IntlShape } from 'react-intl';
import { ApiPath } from '../../../../../apiConfig';
import { ArbeidsgivereResponse } from '../../../../../models/types/ArbeidsgivereResponse';
import ArbeidsgiverResponse from '../../../../../models/types/ArbeidsgiverResponse';
import { Arbeidstaker, IArbeidstaker, OrgOrPers } from '../../../../../models/types/Arbeidstaker';
import { arbeidstidInformasjon } from '../../../ArbeidstidInfo';
import { pfArbeidstider } from '../../../pfArbeidstider';
import ActionType from './actionTypes';
import './pfArbeidstaker.less';
import pfArbeidstakerReducer from './pfArbeidstakerReducer';

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
        const [state, dispatch] = useReducer(pfArbeidstakerReducer, {
            arbeidsgivere: [],
            // eslint-disable-next-line react/destructuring-assignment
            selectedArbeidsgiver: arbeidstaker?.organisasjonsnummer || '',
            gjelderAnnenArbeidsgiver: false,
            navnPåArbeidsgiver: '',
            getArbeidsgivereFailed: false,
            searchOrganisasjonsnummerFailed: false,
        });

        const {
            arbeidsgivere,
            selectedArbeidsgiver,
            gjelderAnnenArbeidsgiver,
            navnPåArbeidsgiver,
            getArbeidsgivereFailed,
            searchOrganisasjonsnummerFailed,
        } = state;

        const søkPåArbeidsgiver = (orgnr: string) => {
            if (søkerId) {
                get(
                    `${ApiPath.SØK_ORGNUMMER}?organisasjonsnummer=${orgnr}`,
                    { norskIdent: søkerId },
                    { 'X-Nav-NorskIdent': søkerId },
                    (response, data: ArbeidsgiverResponse) => {
                        if (response.status === 200) {
                            if (data.navn) {
                                dispatch({ type: ActionType.SET_NAVN_ARBEIDSDGIVER, navnPåArbeidsgiver: data.navn });
                            }
                        }
                        if (response.status === 404) {
                            dispatch({
                                type: ActionType.SET_SEARCH_ORGANISASJONSNUMMER_FAILED,
                                searchOrganisasjonsnummerFailed: true,
                            });
                        }
                    }
                );
            }
        };

        const finnArbeidsgivere = () => {
            if (søkerId) {
                get(
                    ApiPath.FINN_ARBEIDSGIVERE,
                    { norskIdent: søkerId },
                    { 'X-Nav-NorskIdent': søkerId },
                    (response, data: ArbeidsgivereResponse) => {
                        if (response.status === 200) {
                            if (data.organisasjoner) {
                                dispatch({ type: ActionType.SET_ARBEIDSGIVERE, arbeidsgivere: data.organisasjoner });
                            }
                        } else {
                            dispatch({ type: ActionType.GET_ARBEIDSGIVERE_FAILED });
                        }
                    }
                );
            }
        };

        useEffect(() => {
            finnArbeidsgivere();
            if (arbeidstaker.organisasjonsnummer) {
                søkPåArbeidsgiver(arbeidstaker.organisasjonsnummer);
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
                            {arbeidsgivere?.length > 0 && !getArbeidsgivereFailed && (
                                <Select
                                    value={selectedArbeidsgiver}
                                    bredde="l"
                                    label="Velg hvilken arbeidsgiver det gjelder"
                                    onChange={(event) => {
                                        const { value } = event.target;
                                        dispatch({ type: ActionType.SELECT_ARBEIDSGIVER, selectedArbeidsgiver: value });
                                        updateListeinfoInSoknadState({
                                            organisasjonsnummer: value,
                                        });
                                        updateListeinfoInSoknad({
                                            organisasjonsnummer: value,
                                        });
                                        if (!value) {
                                            dispatch({
                                                type: ActionType.SET_NAVN_ARBEIDSDGIVER,
                                                navnPåArbeidsgiver: '',
                                            });
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
                            {!getArbeidsgivereFailed && (
                                <Checkbox
                                    label="Det gjelder annen arbeidsgiver"
                                    onChange={() => {
                                        dispatch({
                                            type: ActionType.TOGGLE_GJELDER_ANNEN_ARBEIDSGIVER,
                                        });
                                        updateListeinfoInSoknad({
                                            organisasjonsnummer: '',
                                        });
                                        updateListeinfoInSoknadState({
                                            organisasjonsnummer: '',
                                        });
                                    }}
                                    checked={gjelderAnnenArbeidsgiver}
                                />
                            )}
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
                                                    const valueWithoutWhitespaces = event.target.value.replace(
                                                        /\s/g,
                                                        ''
                                                    );
                                                    updateListeinfoInSoknadState({
                                                        organisasjonsnummer: valueWithoutWhitespaces,
                                                    });
                                                    if (valueWithoutWhitespaces.length === 9) {
                                                        søkPåArbeidsgiver(valueWithoutWhitespaces);
                                                    } else if (navnPåArbeidsgiver) {
                                                        dispatch({
                                                            type: ActionType.SET_NAVN_ARBEIDSDGIVER,
                                                            navnPåArbeidsgiver: '',
                                                        });
                                                    }
                                                }}
                                                onBlur={(event) => {
                                                    const valueWithoutWhitespaces = event.target.value.replace(
                                                        /\s/g,
                                                        ''
                                                    );
                                                    updateListeinfoInSoknad({
                                                        organisasjonsnummer: valueWithoutWhitespaces,
                                                    });
                                                    if (valueWithoutWhitespaces.length !== 9) {
                                                        dispatch({
                                                            type: ActionType.SET_SEARCH_ORGANISASJONSNUMMER_FAILED,
                                                            searchOrganisasjonsnummerFailed: true,
                                                        });
                                                    }
                                                }}
                                                feil={
                                                    searchOrganisasjonsnummerFailed
                                                        ? 'Ingen treff på organisasjonsnummer'
                                                        : getErrorMessage(`[${listeelementindex}].organisasjonsnummer`)
                                                }
                                            />
                                            {navnPåArbeidsgiver && (
                                                <p className="arbeidstaker__arbeidsgiverNavn">{navnPåArbeidsgiver}</p>
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
                                            norskIdent: event.target.value.replace(/\s/g, ''),
                                        })
                                    }
                                    onBlur={(event) => updateListeinfoInSoknad({ norskIdent: event.target.value.replace(/\s/g, '') })}
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
