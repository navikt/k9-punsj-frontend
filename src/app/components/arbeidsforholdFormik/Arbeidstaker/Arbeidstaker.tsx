import { Field, FieldProps, useFormikContext } from 'formik';
import { RadioPanelGruppe } from 'nav-frontend-skjema';
import React, { useEffect, useReducer } from 'react';
import { IntlShape } from 'react-intl';

import { Checkbox, Fieldset } from '@navikt/ds-react';

import { ApiPath } from 'app/apiConfig';
import VerticalSpacer from 'app/components/VerticalSpacer';
import ArbeidstidKalender from 'app/components/arbeidstid/ArbeidstidKalender';
import SelectFormik from 'app/components/formikInput/SelectFormik';
import usePrevious from 'app/hooks/usePrevious';
import { IArbeidstidPeriodeMedTimer, IPeriode } from 'app/models/types';
import ArbeidsgiverResponse from 'app/models/types/ArbeidsgiverResponse';
import { Arbeidstaker, OrgOrPers } from 'app/models/types/Arbeidstaker';
import { OLPSoknad } from 'app/models/types/OLPSoknad';
import Organisasjon from 'app/models/types/Organisasjon';
import { get } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { kunTall } from 'app/utils/patterns';

import TextFieldFormik from '../../formikInput/TextFieldFormik';
import ActionType from './actionTypes';
import './arbeidstaker.less';
import pfArbeidstakerReducer from './pfArbeidstakerReducer';

interface ArbeidstakerComponentProps {
    søkerId: string;
    arbeidstaker: Arbeidstaker;
    listeelementindex: number;
    intl: IntlShape;
    arbeidsgivere: Organisasjon[];
    harDuplikatOrgnr?: boolean;
    nyeSoknadsperioder: IPeriode[];
    eksisterendeSoknadsperioder: IPeriode[];
    name: string;
}

const ArbeidstakerComponent: React.FC<ArbeidstakerComponentProps> = ({
    søkerId,
    arbeidstaker,
    listeelementindex,
    intl,
    arbeidsgivere,
    harDuplikatOrgnr,
    nyeSoknadsperioder,
    eksisterendeSoknadsperioder,
    name,
}): JSX.Element => {
    const harArbeidsgivere = arbeidsgivere?.length > 0;
    const { setFieldValue } = useFormikContext<OLPSoknad>();

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
        setFieldValue(name, {
            ...arbeidstaker,
            organisasjonsnummer: newOrganisasjonsnummer,
            norskIdent: newNorskIdent,
        });
    };

    const {
        organisasjonsnummer,
        // norskIdent,
        arbeidstidInfo,
    } = arbeidstaker;

    const selectedType = organisasjonsnummer === null ? 'p' : 'o';

    return (
        <Fieldset className="arbeidstaker-panel">
            <div className="flex flex-wrap">
                {/* <Field name={`arbeidsgivertype_${1}_${listeelementindex}`}>
                        {({ field, form }: FieldProps<boolean>) => (
                            <RadioPanelGruppeFormik
                                legend={intlHelper(intl, 'skjema.arbeid.arbeidstaker.type')}
                                checked={selectedType}
                                name={field.name}
                                options={[
                                    {
                                        label: intlHelper(intl, 'skjema.arbeid.arbeidstaker.org'),
                                        value: 'o',
                                    },
                                    {
                                        label: intlHelper(intl, 'skjema.arbeid.arbeidstaker.pers'),
                                        value: 'p',
                                    },
                                ]}
                                onChange={(event) =>
                                    updateOrgOrPers((event.target as HTMLInputElement).value as OrgOrPers)
                                }
                            />
                        )}
                    </Field> */}
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
                        <SelectFormik
                            value={selectedArbeidsgiver}
                            label="Velg hvilken arbeidsgiver det gjelder"
                            options={[{ value: '', label: '' }].concat(
                                arbeidsgivere.map((arbeidsgiver) => ({
                                    label: `${arbeidsgiver.navn} - ${arbeidsgiver.organisasjonsnummer}`,
                                    value: arbeidsgiver.organisasjonsnummer,
                                })),
                            )}
                            name={`${name}.organisasjonsnummer`}
                            onChange={(event) => {
                                const { value } = event.target;
                                dispatch({ type: ActionType.SELECT_ARBEIDSGIVER, selectedArbeidsgiver: value });
                                setFieldValue(`${name}.organisasjonsnummer`, value);
                                if (!value) {
                                    dispatch({
                                        type: ActionType.SET_NAVN_ARBEIDSDGIVER,
                                        navnPåArbeidsgiver: '',
                                    });
                                }
                            }}
                            disabled={gjelderAnnenArbeidsgiver}
                            customError={harDuplikatOrgnr ? 'Organisasjonsnummeret er valgt flere ganger.' : ''}
                        />
                    )}
                    <VerticalSpacer eightPx />
                    {harArbeidsgivere && (
                        <Checkbox
                            onChange={() => {
                                dispatch({
                                    type: ActionType.TOGGLE_GJELDER_ANNEN_ARBEIDSGIVER,
                                    selectedArbeidsgiver: '',
                                });
                                setFieldValue(name, {
                                    ...arbeidstaker,
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
                                    <TextFieldFormik
                                        label={intlHelper(intl, 'skjema.arbeid.arbeidstaker.orgnr')}
                                        name={`${name}.organisasjonsnummer`}
                                        className="arbeidstaker-organisasjonsnummer"
                                        onChange={(event) => {
                                            const valueWithoutWhitespaces = event.target.value.replace(/\s/g, '');
                                            setFieldValue(name, {
                                                ...arbeidstaker,
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

                                            if (valueWithoutWhitespaces.length !== 9) {
                                                dispatch({
                                                    type: ActionType.SET_SEARCH_ORGANISASJONSNUMMER_FAILED,
                                                    searchOrganisasjonsnummerFailed: true,
                                                });
                                            }
                                        }}
                                        customError={
                                            searchOrganisasjonsnummerFailed ? 'Ingen treff på organisasjonsnummer' : ''
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
                        <TextFieldFormik
                            label={intlHelper(intl, 'skjema.arbeid.arbeidstaker.ident')}
                            name={`${name}.norskIdent`}
                            className="arbeidstaker-norskIdent"
                            filterPattern={kunTall}
                        />
                    )}
                </div>
            </div>
            <Field name={`${name}.arbeidstidInfo.perioder`}>
                {({ field, form }: FieldProps<IArbeidstidPeriodeMedTimer[]>) => (
                    <ArbeidstidKalender
                        nyeSoknadsperioder={nyeSoknadsperioder}
                        eksisterendeSoknadsperioder={eksisterendeSoknadsperioder}
                        updateSoknad={(perioder) => {
                            form.setFieldValue(field.name, [...perioder]);
                        }}
                        arbeidstidInfo={arbeidstidInfo}
                    />
                )}
            </Field>
        </Fieldset>
    );
};

export default ArbeidstakerComponent;
