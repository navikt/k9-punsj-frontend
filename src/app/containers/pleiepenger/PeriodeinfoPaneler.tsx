import * as React from 'react';
import { IntlShape, useIntl } from 'react-intl';

import { PeriodInput } from 'app/components/period-input/PeriodInput';
import UhaanderteFeilmeldinger from 'app/components/skjema/UhaanderteFeilmeldinger';
import { periodeSpenn } from 'app/components/skjema/skjemaUtils';
import {
    ListeComponent,
    Listepaneler,
    UpdateListeinfoInSoknad,
    UpdateListeinfoInSoknadState,
} from 'app/containers/pleiepenger/Listepaneler';
import {
    GetErrorMessage,
    GetUhaandterteFeil,
    IPeriodeinfo,
    IPeriodeinfoExtension,
    Periodeinfo,
} from 'app/models/types';

import BinSvg from '../../assets/SVG/BinSVG';
import { IPeriode } from '../../models/types/Periode';
import intlHelper from '../../utils/intlUtils';
import './periodeinfoPaneler.less';

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

export interface IPeriodeinfopanelerProps {
    periods: IPeriodeinfo[]; // Liste over periodisert informasjon
    component?: PeriodeinfoComponent<IPeriodeinfoExtension>; // Skal returnere et React-element for en gitt periode i lista
    panelid: (periodeindex: number) => string; // String som skal brukes til å identifisere hvert enkelt element
    initialPeriodeinfo: Periodeinfo<IPeriodeinfoExtension>; // Objektet som legges til når man legger til en ny periode i lista
    editSoknad: (periodeinfo: IPeriodeinfo[]) => any; // Funksjon som skal kalles for å sende en put-spørring med oppdatert info og oppdatere Redux-store deretter (brukes i hovedsak på onBlur)
    editSoknadState: (periodeinfo: IPeriodeinfo[], showStatus?: boolean) => any; // Funskjon som skal kalles for å oppdatere state på PunchFormOld (må brukes på onChange)
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

export const PeriodeinfoPaneler: React.FunctionComponent<IPeriodeinfopanelerProps> = (
    props: IPeriodeinfopanelerProps,
) => {
    const {
        periods,
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
    } = props;

    const { component, editSoknad, editSoknadState, kanHaFlere, initialValues } = props;

    const intl = useIntl();

    const editInfo: (index: number, periodeinfo: Partial<IPeriodeinfo>) => IPeriodeinfo[] = (
        index: number,
        periodeinfo: Partial<IPeriodeinfo>,
    ) => {
        const newInfo: IPeriodeinfo = { ...periods[index], ...periodeinfo };
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

    const periodComponent: ListeComponent<IPeriodeinfo> = (
        periodeinfo: IPeriodeinfo,
        periodeindeks: number,
        updatePeriodeinfoInSoknad: UpdateListeinfoInSoknad<IPeriodeinfo>,
        updatePeriodeinfoInSoknadState: UpdateListeinfoInSoknadState<IPeriodeinfo>,
        feilkodeprefiksMedIndeks: string,
        getErrorMessage: GetErrorMessage,
        intlShape: IntlShape,
    ) => {
        const removePeriode = () => {
            const newArray: IPeriodeinfo[] = removeItem(periodeindeks);
            editSoknadState(newArray);
            editSoknad(newArray);

            if (onRemove) {
                onRemove();
            }
        };
        const feltIndeks = periodeSpenn(periodeinfo.periode);
        return (
            <>
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
                        className="removePeriodeKnapp"
                        type="button"
                        onClick={removePeriode}
                        tabIndex={0}
                    >
                        <div className="slettIkon">
                            <BinSvg title="fjern" />
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
                <UhaanderteFeilmeldinger
                    getFeilmeldinger={() =>
                        (getUhaandterteFeil && getUhaandterteFeil(`${feilkodeprefiks}.perioder[${feltIndeks}]`)) || []
                    }
                />
            </>
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
            component={periodComponent}
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

PeriodeinfoPaneler.defaultProps = {
    // eslint-disable-next-line react/default-props-match-prop-types
    periods: [],
};
