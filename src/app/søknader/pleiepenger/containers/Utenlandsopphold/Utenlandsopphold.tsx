import countries from 'i18n-iso-countries';
import { RadioPanelGruppe } from 'nav-frontend-skjema';
import React, { useState } from 'react';
import { FormattedMessage, IntlShape } from 'react-intl';

import { PeriodInput } from 'app/components/period-input/PeriodInput';
import UhaanderteFeilmeldinger from 'app/components/skjema/UhaanderteFeilmeldinger';
import { periodeSpenn } from 'app/components/skjema/skjemaUtils';
import {
    ListeComponent,
    Listepaneler,
    UpdateListeinfoInSoknad,
    UpdateListeinfoInSoknadState,
} from 'app/components/Listepaneler';
import {
    GetErrorMessage,
    GetUhaandterteFeil,
    IPeriodeinfo,
    IPeriodeinfoExtension,
    IUtenlandsOpphold,
    Periodeinfo,
} from 'app/models/types';

import { Heading } from '@navikt/ds-react';
import { TrashIcon } from '@navikt/aksel-icons';
import { IPeriode } from '../../../../models/types/Periode';
import intlHelper from '../../../../utils/intlUtils';
import { Periodepaneler } from '../../../../components/Periodepaneler';

import './utenlandsopphold.less';

export type UpdatePeriodeinfoInSoknad<T> = (info: Partial<Periodeinfo<T>>) => any;
export type UpdatePeriodeinfoInSoknadState<T> = (info: Partial<Periodeinfo<T>>, showStatus?: boolean) => any;

export type PeriodeinfoComponent<T> = (
    info: Periodeinfo<T>,
    periodeindex: number,
    updatePeriodeinfoInSoknad: UpdatePeriodeinfoInSoknad<T>,
    updatePeriodeinfoInSoknadState: UpdatePeriodeinfoInSoknadState<T>,
    feilkodeprefiksMedIndeks?: string,
    getErrorMessage?: GetErrorMessage,
    intl?: IntlShape,
) => React.ReactElement;

export interface IUtenlandsoppholdProps {
    intl: IntlShape;
    periods: Periodeinfo<IUtenlandsOpphold>[]; // Liste over periodisert informasjon
    component?: PeriodeinfoComponent<IPeriodeinfoExtension>; // Skal returnere et React-element for en gitt periode i lista
    panelid: (periodeindex: number) => string; // String som skal brukes til å identifisere hvert enkelt element
    initialPeriodeinfo: Periodeinfo<IPeriodeinfoExtension>; // Objektet som legges til når man legger til en ny periode i lista
    editSoknad: (periodeinfo: Periodeinfo<IUtenlandsOpphold>[]) => any; // Funksjon som skal kalles for å sende en put-spørring med oppdatert info og oppdatere Redux-store deretter (brukes i hovedsak på onBlur)
    editSoknadState: (periodeinfo: Periodeinfo<IUtenlandsOpphold>[], showStatus?: boolean) => any; // Funskjon som skal kalles for å oppdatere state på PunchFormOld (må brukes på onChange)
    className?: string;
    textLeggTil?: string;
    textFjern?: string;
    panelClassName?: string;
    getErrorMessage?: GetErrorMessage;
    getUhaandterteFeil?: GetUhaandterteFeil;
    feilkodeprefiks?: string;
    periodeFeilkode?: string;
    onAdd?: () => any;
    onRemove?: () => any;
    kanHaFlere: boolean;
    medSlettKnapp: boolean;
    initialValues?: {
        fom: string | undefined;
        tom: string | undefined;
    };
}

const jaValue = 'ja';
export const Utenlandsopphold: React.FunctionComponent<IUtenlandsoppholdProps> = (props: IUtenlandsoppholdProps) => {
    const {
        medSlettKnapp,
        textLeggTil,
        textFjern,
        panelid,
        initialPeriodeinfo,
        getErrorMessage: errorMessageFunc,
        getUhaandterteFeil,
        className,
        feilkodeprefiks,
        periodeFeilkode,
        onAdd,
        onRemove,
        panelClassName,
        periods = [],
    } = props;
    const { intl, component, editSoknad, editSoknadState, kanHaFlere, initialValues } = props;
    const [visInnlagtPerioder, setVisInnlagtPerioder] = useState(
        periods.some((periode) => periode.innleggelsesperioder && periode.innleggelsesperioder.length > 0)
            ? jaValue
            : '',
    );
    const editInfo: (
        index: number,
        periodeinfo: Partial<Periodeinfo<IUtenlandsOpphold>>,
    ) => Periodeinfo<IUtenlandsOpphold>[] = (index: number, periodeinfo: Partial<IPeriodeinfo>) => {
        const newInfo: Periodeinfo<IUtenlandsOpphold> = { ...periods[index], ...periodeinfo };
        const newArray = periods;
        newArray[index] = newInfo;
        return newArray;
    };

    const removeItem = (index: number) => {
        const newArray = periods;
        newArray.splice(index, 1);
        return newArray;
    };

    const editPeriode = (index: number, periode: IPeriode) => editInfo(index, { periode });

    const utenlandsoppholdComponent: ListeComponent<IPeriodeinfo> = (
        periodeinfo: IPeriodeinfo,
        periodeindeks: number,
        updatePeriodeinfoInSoknad: UpdateListeinfoInSoknad<IPeriodeinfo>,
        updatePeriodeinfoInSoknadState: UpdateListeinfoInSoknadState<IPeriodeinfo>,
        feilkodeprefiksMedIndeks: string,
        getErrorMessage: GetErrorMessage,
        intlShape: IntlShape,
    ) => {
        const removePeriode = () => {
            const newArray: Periodeinfo<IUtenlandsOpphold>[] = removeItem(periodeindeks);
            editSoknadState(newArray);
            editSoknad(newArray);

            if (onRemove) {
                onRemove();
            }
        };
        const feltIndeks = periodeSpenn(periodeinfo.periode);
        const land = periods[periodeindeks].land || '';
        const getCheckedÅrsak = () => {
            const period = periods[periodeindeks];
            const { innleggelsesperioder } = period;
            if (innleggelsesperioder && innleggelsesperioder.length > 0) {
                if (innleggelsesperioder[0].årsak === null) {
                    return 'null';
                }
                return innleggelsesperioder[0].årsak;
            }
            return '';
        };
        const getInnleggelsesperioder = () => {
            const innleggelsesperioder = periods[periodeindeks].innleggelsesperioder
                ?.filter((innleggelsesperiode) => !!innleggelsesperiode.periode)
                .map((innleggelsesperiode) => innleggelsesperiode.periode) as IPeriode[];

            if (innleggelsesperioder.length > 0) {
                return innleggelsesperioder;
            }
            return [{ fom: '', tom: '' }];
        };

        return (
            <div className="utenlandsopphold">
                <div className="periodeinfopanel_container">
                    <PeriodInput
                        periode={periodeinfo.periode || {}}
                        intl={intlShape}
                        onChange={(periode) => {
                            editSoknadState(editPeriode(periodeindeks, periode));
                        }}
                        onBlur={(periode) => {
                            editSoknad(editPeriode(periodeindeks, periode));
                        }}
                        errorMessage={getErrorMessage(`${periodeFeilkode || feilkodeprefiks}.perioder[${feltIndeks}]`)}
                        initialValues={initialValues}
                    />
                    <button
                        id="slett"
                        className="removePeriodeKnapp ml-3"
                        type="button"
                        onClick={removePeriode}
                        tabIndex={0}
                    >
                        <div className="slettIkon">
                            <TrashIcon fontSize="2rem" color="#C30000" title="slett" />
                        </div>

                        {intlHelper(intl, props.textFjern || 'skjema.perioder.fjern')}
                    </button>
                </div>
                {!!component &&
                    component(
                        periodeinfo,
                        periodeindeks,
                        updatePeriodeinfoInSoknad,
                        updatePeriodeinfoInSoknadState,
                        feilkodeprefiksMedIndeks,
                        getErrorMessage,
                        intlShape,
                    )}
                {land && (
                    <div className="mt-8">
                        <RadioPanelGruppe
                            className="horizontalRadios "
                            radios={[
                                {
                                    label: 'Ja',
                                    value: jaValue,
                                },
                                {
                                    label: 'Nei',
                                    value: 'nei',
                                },
                            ]}
                            name={`arbeidsgivertype_${1}`}
                            legend={`Er, eller skal, barnet være innlagt i helseinstitusjon i ${countries.getName(
                                land,
                                'nb',
                            )}?`}
                            onChange={(event) => {
                                const { value } = event.target as HTMLInputElement;
                                setVisInnlagtPerioder(value);
                                if (value !== jaValue) {
                                    const editedInfo = () =>
                                        editInfo(periodeindeks, {
                                            innleggelsesperioder: [],
                                        });
                                    editSoknad(editedInfo());
                                    editSoknadState(editedInfo());
                                }
                            }}
                            checked={visInnlagtPerioder}
                        />
                    </div>
                )}

                {visInnlagtPerioder === jaValue && (
                    <div className="mt-6">
                        <Heading level="3" size="small">
                            <FormattedMessage id={'skjema.utenlandsopphold.barnInnlagtPerioder.tittel'} />
                        </Heading>

                        <Periodepaneler
                            periods={getInnleggelsesperioder()}
                            initialPeriode={{ fom: '', tom: '' }}
                            editSoknad={(perioder) =>
                                editSoknad(
                                    editInfo(periodeindeks, {
                                        innleggelsesperioder: perioder.map((p) => ({ periode: p })),
                                    }),
                                )
                            }
                            editSoknadState={(perioder) =>
                                editSoknadState(
                                    editInfo(periodeindeks, {
                                        innleggelsesperioder: perioder.map((p) => ({ periode: p })),
                                    }),
                                )
                            }
                            textLeggTil="skjema.perioder.legg_til"
                            textFjern="skjema.perioder.fjern"
                            getErrorMessage={getErrorMessage}
                            feilkodeprefiks="innleggelsesperioder"
                            kanHaFlere
                            doNotShowBorders
                        />

                        <RadioPanelGruppe
                            radios={[
                                {
                                    label: intl.formatMessage({
                                        id: 'skjema.utenlandsopphold.årsak.norskOfftenligRegning',
                                    }),
                                    value: 'barnetInnlagtIHelseinstitusjonForNorskOffentligRegning',
                                },
                                {
                                    label: intl.formatMessage({
                                        id: 'skjema.utenlandsopphold.årsak.trygdeavtaleMedAnnetLand',
                                    }),
                                    value: 'barnetInnlagtIHelseinstitusjonDekketEtterAvtaleMedEtAnnetLandOmTrygd',
                                },
                                {
                                    label: intl.formatMessage({ id: 'skjema.utenlandsopphold.årsak.søkerDekkerSelv' }),
                                    value: 'null',
                                },
                            ]}
                            name={`innleggelseÅrsak${periodeindeks}`}
                            legend={intl.formatMessage({ id: 'skjema.utenlandsopphold.utgifterTilInnleggelse' })}
                            checked={getCheckedÅrsak()}
                            onChange={(event) => {
                                const { value } = event.target as HTMLInputElement;
                                const formattedValue = value === 'null' ? null : value;
                                const { innleggelsesperioder } = periods[periodeindeks];
                                const hasInnleggelsesperioder =
                                    innleggelsesperioder && innleggelsesperioder?.length > 0;
                                const editedInfo = () =>
                                    editInfo(periodeindeks, {
                                        innleggelsesperioder: hasInnleggelsesperioder
                                            ? periods[periodeindeks].innleggelsesperioder?.map(
                                                  (innleggelsesperiode) => ({
                                                      ...innleggelsesperiode,
                                                      årsak: formattedValue,
                                                  }),
                                              )
                                            : [{ årsak: formattedValue }],
                                    });
                                editSoknad(editedInfo());
                                editSoknadState(editedInfo());
                            }}
                        />
                    </div>
                )}

                <UhaanderteFeilmeldinger
                    getFeilmeldinger={() =>
                        (getUhaandterteFeil && getUhaandterteFeil(`${feilkodeprefiks}.perioder[${feltIndeks}]`)) || []
                    }
                />
            </div>
        );
    };

    return (
        <Listepaneler
            intl={intl}
            items={periods}
            panelid={panelid}
            initialItem={initialPeriodeinfo}
            editSoknad={editSoknad}
            editSoknadState={editSoknadState}
            getErrorMessage={errorMessageFunc}
            getUhaandterteFeil={getUhaandterteFeil}
            className={className}
            feilkodeprefiks={feilkodeprefiks}
            component={utenlandsoppholdComponent}
            onAdd={onAdd}
            onRemove={onRemove}
            panelClassName={panelClassName}
            textFjern={textFjern || 'skjema.perioder.fjern'}
            textLeggTil={textLeggTil || 'skjema.perioder.legg_til'}
            kanHaFlere={kanHaFlere}
            medSlettKnapp={medSlettKnapp}
        />
    );
};
