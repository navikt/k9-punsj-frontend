import { RadioPanelGruppe } from 'nav-frontend-skjema';
import React, { useEffect, useReducer } from 'react';
import { IntlShape } from 'react-intl';

import { Checkbox, Fieldset, Select, TextField } from '@navikt/ds-react';

import VerticalSpacer from 'app/components/VerticalSpacer';
import ArbeidstidKalender from 'app/components/arbeidstid/ArbeidstidKalender';
import { UpdateListeinfoInSoknad, UpdateListeinfoInSoknadState } from 'app/containers/pleiepenger/Listepaneler';
import usePrevious from 'app/hooks/usePrevious';
import { GetErrorMessage, IPeriode } from 'app/models/types';
import ArbeidsgiverResponse from 'app/models/types/ArbeidsgiverResponse';
import { Arbeidstaker, IArbeidstaker, OrgOrPers } from 'app/models/types/Arbeidstaker';
import Organisasjon from 'app/models/types/Organisasjon';
import { get } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';

import { ApiPath } from '../../../../../apiConfig';
import ActionType from './actionTypes';
import './arbeidstaker.less';
import pfArbeidstakerReducer from './pfArbeidstakerReducer';

interface ArbeidstakerComponentProps {
    søkerId: string;
    arbeidstaker: Arbeidstaker;
    listeelementindex: number;
    updateListeinfoInSoknad: UpdateListeinfoInSoknad<IArbeidstaker>;
    updateListeinfoInSoknadState: UpdateListeinfoInSoknadState<IArbeidstaker>;
    feilkodeprefiks: string;
    getErrorMessage: GetErrorMessage;
    intl: IntlShape;
    arbeidsgivere: Organisasjon[];
    harDuplikatOrgnr?: boolean;
    nyeSoknadsperioder: IPeriode[];
    eksisterendeSoknadsperioder: IPeriode[];
}

const ArbeidstakerComponent: React.FC<ArbeidstakerComponentProps> = ({
    søkerId,
    arbeidstaker,
    listeelementindex,
    updateListeinfoInSoknad,
    updateListeinfoInSoknadState,
    feilkodeprefiks,
    getErrorMessage,
    intl,
    arbeidsgivere,
    harDuplikatOrgnr,
    nyeSoknadsperioder,
    eksisterendeSoknadsperioder,
}): JSX.Element => {
    const harArbeidsgivere = arbeidsgivere?.length > 0;

    const [state, dispatch] = useReducer(pfArbeidstakerReducer, {
         react/destructuring-assignment
        selectedArbeidsgiver: arbeidstaker?.organisasjonsnummer || '',
        gjelderAnnenArbeidsgiver: !harArbeidsgivere,
        navnPåArbeidsgiver: '',
        searchOrganisasjonsnummerFailed: false,
    });
    const previousArbeidsgivere = usePrevious<Organisasjon[]>(arbeidsgivere);

    const { selectedArbeidsgiver, gjelderAnnenArbeidsgiver, navnPåArbeidsgiver, searchOrganisasjonsnummerFailed } =
        state;

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
                },
            );
        }
    };

    useEffect(() => {
        if (arbeidstaker.organisasjonsnummer) {
            søkPåArbeidsgiver(arbeidstaker.organisasjonsnummer);
        }
    }, []);

    useEffect(() => {
        if (arbeidsgivere.length > 0 && previousArbeidsgivere?.length === 0) {
            dispatch({
                type: ActionType.TOGGLE_GJELDER_ANNEN_ARBEIDSGIVER,
                gjelderAnnenArbeidsgiver: false,
            });
        }
    }, [arbeidsgivere]);

    const updateOrgOrPers = (isOrgOrPers: OrgOrPers) => {
        let newOrganisasjonsnummer: string | null;
        let newNorskIdent: string | null;
        if (isOrgOrPers === 'o') {
            newOrganisasjonsnummer = '';
            newNorskIdent = null;
        } else {
            newOrganisasjonsnummer = null;
            newNorskIdent = '';
        }
        updateListeinfoInSoknadState({ organisasjonsnummer: newOrganisasjonsnummer, norskIdent: newNorskIdent });
        updateListeinfoInSoknad({ organisasjonsnummer: newOrganisasjonsnummer, norskIdent: newNorskIdent });
    };
    const { orgOrPers, organisasjonsnummer, norskIdent, arbeidstidInfo } = arbeidstaker;

    const selectedType: OrgOrPers = orgOrPers();

    return (
        <Fieldset className="arbeidstaker-panel" legend="">
            <div className="flex flex-wrap">
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
            </div>
            {selectedType === 'o' && (
                <>
                    {harArbeidsgivere && (
                        <Select
                            value={selectedArbeidsgiver}
                            className="w-64"
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
                            error={
                                harDuplikatOrgnr
                                    ? 'Organisasjonsnummeret er valgt flere ganger.'
                                    : getErrorMessage(`${feilkodeprefiks}.identified`)
                            }
                        >
                            <option key="default" value="" label="" aria-label="Tomt valg" />)
                            {arbeidsgivere.map((arbeidsgiver) => (
                                <option key={arbeidsgiver.organisasjonsnummer} value={arbeidsgiver.organisasjonsnummer}>
                                    {`${arbeidsgiver.navn} - ${arbeidsgiver.organisasjonsnummer}`}
                                </option>
                            ))}
                        </Select>
                    )}
                    <VerticalSpacer eightPx />
                    {harArbeidsgivere && (
                        <Checkbox
                            onChange={() => {
                                dispatch({
                                    type: ActionType.TOGGLE_GJELDER_ANNEN_ARBEIDSGIVER,
                                    selectedArbeidsgiver: '',
                                });
                                updateListeinfoInSoknad({
                                    organisasjonsnummer: '',
                                });
                                updateListeinfoInSoknadState({
                                    organisasjonsnummer: '',
                                });
                            }}
                            checked={gjelderAnnenArbeidsgiver}
                        >
                            Det gjelder annen arbeidsgiver
                        </Checkbox>
                    )}
                    {gjelderAnnenArbeidsgiver && (
                        <>
                            <VerticalSpacer sixteenPx />
                            <div className="flex flex-wrap">
                                <div className="input-row">
                                    <TextField
                                        label={intlHelper(intl, 'skjema.arbeid.arbeidstaker.orgnr')}
                                        value={organisasjonsnummer || ''}
                                        className="arbeidstaker-organisasjonsnummer"
                                        onChange={(event) => {
                                            const valueWithoutWhitespaces = event.target.value.replace(/\s/g, '');
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
                                            const valueWithoutWhitespaces = event.target.value.replace(/\s/g, '');
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
                                        error={
                                            searchOrganisasjonsnummerFailed
                                                ? 'Ingen treff på organisasjonsnummer'
                                                : getErrorMessage(`${feilkodeprefiks}.identified`)
                                        }
                                    />
                                    {navnPåArbeidsgiver && (
                                        <p className="arbeidstaker__arbeidsgiverNavn">{navnPåArbeidsgiver}</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
            <div className="flex flex-wrap">
                <div className="input-row">
                    {selectedType === 'p' && (
                        <TextField
                            label={intlHelper(intl, 'skjema.arbeid.arbeidstaker.ident')}
                            value={norskIdent || ''}
                            className="arbeidstaker-norskIdent"
                            onChange={(event) =>
                                updateListeinfoInSoknadState({
                                    norskIdent: event.target.value.replace(/\s/g, ''),
                                })
                            }
                            onBlur={(event) =>
                                updateListeinfoInSoknad({ norskIdent: event.target.value.replace(/\s/g, '') })
                            }
                            error={getErrorMessage(`${feilkodeprefiks}.identified`)}
                        />
                    )}
                </div>
            </div>
            <ArbeidstidKalender
                nyeSoknadsperioder={nyeSoknadsperioder}
                eksisterendeSoknadsperioder={eksisterendeSoknadsperioder}
                updateSoknad={(perioder) =>
                    updateListeinfoInSoknad({
                        arbeidstidInfo: {
                            perioder,
                        },
                    })
                }
                updateSoknadState={(perioder) =>
                    updateListeinfoInSoknadState({
                        arbeidstidInfo: {
                            perioder,
                        },
                    })
                }
                arbeidstidInfo={arbeidstidInfo}
            />
        </Fieldset>
    );
};

export default ArbeidstakerComponent;
