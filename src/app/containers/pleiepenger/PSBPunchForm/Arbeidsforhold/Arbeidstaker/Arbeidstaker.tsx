import VerticalSpacer from 'app/components/VerticalSpacer';
import { UpdateListeinfoInSoknad, UpdateListeinfoInSoknadState } from 'app/containers/pleiepenger/Listepaneler';
import { Button, Modal } from '@navikt/ds-react';
import usePrevious from 'app/hooks/usePrevious';
import Organisasjon from 'app/models/types/Organisasjon';
import {
    countDatesInDateRange,
    findDateIntervalsFromDates,
    formats,
    get,
    getDatesInDateRange,
    removeDatesFromDateRange,
    removeDatesFromPeriods,
} from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import ArbeidstidPeriodeListe from 'app/components/timefoering/ArbeidstidPeriodeListe';
import { Checkbox, Input, RadioPanelGruppe, Select, SkjemaGruppe } from 'nav-frontend-skjema';
import React, { useEffect, useReducer, useState } from 'react';
import { Container, Row } from 'react-bootstrap';
import { IntlShape } from 'react-intl';
import {
    ArbeidstidPeriodeMedTimer,
    GetErrorMessage,
    IArbeidstidPeriodeMedTimer,
    IPeriode,
    Periode,
    Periodeinfo,
} from 'app/models/types';
import FaktiskOgNormalTid from 'app/components/timefoering/FaktiskOgNormalTid';
import dayjs from 'dayjs';
import TidsbrukKalenderContainer from 'app/components/calendar/TidsbrukKalenderContainer';
import DateContent from 'app/components/calendar/DateContent';
import ArbeidstidPeriode from 'app/components/timefoering/ArbeidstidPeriode';
import { arbeidstidPeriodeTilKalenderdag } from 'app/utils/mappingUtils';
import { ApiPath } from '../../../../../apiConfig';
import ArbeidsgiverResponse from '../../../../../models/types/ArbeidsgiverResponse';
import { Arbeidstaker, IArbeidstaker, OrgOrPers } from '../../../../../models/types/Arbeidstaker';
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
    getUhaandterteFeil: (kode: string) => (string | undefined)[];
    intl: IntlShape;
    arbeidsgivere: Organisasjon[];
    harDuplikatOrgnr?: boolean;
    gyldigePerioder?: IPeriode[];
}

const ArbeidstakerComponent: React.FC<ArbeidstakerComponentProps> = ({
    søkerId,
    arbeidstaker,
    listeelementindex,
    updateListeinfoInSoknad,
    updateListeinfoInSoknadState,
    feilkodeprefiks,
    getUhaandterteFeil,
    getErrorMessage,
    intl,
    arbeidsgivere,
    harDuplikatOrgnr,
    gyldigePerioder,
}): JSX.Element => {
    const harArbeidsgivere = arbeidsgivere?.length > 0;

    const [visArbeidstidLengrePerioder, setVisArbeidstidLengrePerioder] = useState(false);
    const toggleVisArbeidstidLengrePerioder = () => setVisArbeidstidLengrePerioder(!visArbeidstidLengrePerioder);
    const [state, dispatch] = useReducer(pfArbeidstakerReducer, {
        // eslint-disable-next-line react/destructuring-assignment
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
                }
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

    const lagreTimer = ({
        faktiskTimer,
        faktiskMinutter,
        normaltTimer,
        normaltMinutter,
        selectedDates,
    }: {
        faktiskTimer: string;
        faktiskMinutter: string;
        normaltTimer: string;
        normaltMinutter: string;
        selectedDates: Date[];
    }) => {
        const utenDagerSomAlleredeFinnes = selectedDates.filter(
            (day) => !arbeidstidInfo.perioder.some((periode) => periode.periode.includesDate(day))
        );
        const payload = utenDagerSomAlleredeFinnes.map((day) => ({
            periode: new Periode({
                fom: dayjs(day).format(formats.YYYYMMDD),
                tom: dayjs(day).format(formats.YYYYMMDD),
            }),
            faktiskArbeidTimerPerDag: faktiskTimer,
            jobberNormaltTimerPerDag: normaltTimer,
        }));
        updateListeinfoInSoknad({
            arbeidstidInfo: {
                perioder: [...arbeidstidInfo.perioder, ...payload],
            },
        });
        updateListeinfoInSoknadState({
            arbeidstidInfo: {
                perioder: [...arbeidstidInfo.perioder, ...payload],
            },
        });
    };

    const slettDager = (opprinneligePerioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[]) => (selectedDates: Date[]) => {
        const perioderFiltert = removeDatesFromPeriods(opprinneligePerioder, selectedDates);

        updateListeinfoInSoknad({
            arbeidstidInfo: {
                perioder: perioderFiltert,
            },
        });
        updateListeinfoInSoknadState({
            arbeidstidInfo: {
                perioder: perioderFiltert,
            },
        });
    };

    const selectedType: OrgOrPers = orgOrPers();

    return (
        <SkjemaGruppe className="arbeidstaker-panel">
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
                        {harArbeidsgivere && (
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
                                feil={
                                    harDuplikatOrgnr
                                        ? 'Organisasjonsnummeret er valgt flere ganger.'
                                        : getErrorMessage(`${feilkodeprefiks}.identified`)
                                }
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
                        {harArbeidsgivere && (
                            <Checkbox
                                label="Det gjelder annen arbeidsgiver"
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
                                            feil={
                                                searchOrganisasjonsnummerFailed
                                                    ? 'Ingen treff på organisasjonsnummer'
                                                    : getErrorMessage(`${feilkodeprefiks}.identified`)
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
                                onBlur={(event) =>
                                    updateListeinfoInSoknad({ norskIdent: event.target.value.replace(/\s/g, '') })
                                }
                                feil={getErrorMessage(`${feilkodeprefiks}.identified`)}
                            />
                        )}
                    </div>
                </Row>
                <Button variant="secondary" onClick={toggleVisArbeidstidLengrePerioder}>
                    {intlHelper(intl, 'skjema.arbeid.registrerLengrePeriode')}
                </Button>
                <VerticalSpacer twentyPx />
                <Modal
                    open={visArbeidstidLengrePerioder}
                    onClose={toggleVisArbeidstidLengrePerioder}
                    className="lengre-periode-modal"
                >
                    <Modal.Content>
                        <ArbeidstidPeriodeListe
                            heading="Periode med jobb"
                            arbeidstidPerioder={arbeidstaker.arbeidstidInfo.perioder}
                            gyldigePerioder={gyldigePerioder}
                            lagre={(periodeInfo) => {
                                updateListeinfoInSoknad({
                                    arbeidstidInfo: {
                                        ...arbeidstaker.arbeidstidInfo,
                                        perioder: periodeInfo,
                                    },
                                });
                                updateListeinfoInSoknadState({
                                    arbeidstidInfo: {
                                        ...arbeidstaker.arbeidstidInfo,
                                        perioder: periodeInfo,
                                    },
                                });
                                toggleVisArbeidstidLengrePerioder();
                            }}
                            avbryt={toggleVisArbeidstidLengrePerioder}
                        />
                    </Modal.Content>
                </Modal>

                {gyldigePerioder && (
                    <TidsbrukKalenderContainer
                        gyldigePerioder={gyldigePerioder}
                        ModalContent={<FaktiskOgNormalTid lagre={lagreTimer} />}
                        kalenderdager={arbeidstidInfo.perioder.flatMap((periode) =>
                            arbeidstidPeriodeTilKalenderdag(periode)
                        )}
                        slettPeriode={slettDager(arbeidstaker.arbeidstidInfo.perioder)}
                        dateContentRenderer={DateContent}
                    />
                )}
            </Container>
        </SkjemaGruppe>
    );
};

export default ArbeidstakerComponent;
