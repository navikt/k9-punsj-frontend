import { PeriodInput } from 'app/components/period-input/PeriodInput';
import {
    ListeComponent,
    Listepaneler,
    UpdateListeinfoInSoknad,
    UpdateListeinfoInSoknadState,
} from 'app/containers/pleiepenger/Listepaneler';
import * as React from 'react';
import { IntlShape } from 'react-intl';
import Feilmelding from 'app/components/Feilmelding';
import { periodeSpenn } from 'app/components/skjema/skjemaUtils';
import { IPeriodeinfoExtension, IPeriodeinfo, Periodeinfo } from '../../models/types/Periodeinfo';
import { IPeriode } from '../../models/types/Periode';
import BinSvg from '../../assets/SVG/BinSVG';
import intlHelper from '../../utils/intlUtils';
import './periodeinfoPaneler.less';

export type UpdatePeriodeinfoInSoknad<T> = (info: Partial<Periodeinfo<T>>) => any;
export type UpdatePeriodeinfoInSoknadState<T> = (info: Partial<Periodeinfo<T>>, showStatus?: boolean) => any;
export type GetErrorMessage = (kode: string) => React.ReactNode | boolean | undefined;
export type GetUhaandterteFeil = (kode: string) => (string | undefined)[];

export type PeriodeinfoComponent<T> = (
    info: Periodeinfo<T>,
    periodeindex: number,
    updatePeriodeinfoInSoknad: UpdatePeriodeinfoInSoknad<T>,
    updatePeriodeinfoInSoknadState: UpdatePeriodeinfoInSoknadState<T>,
    feilkodeprefiksMedIndeks?: string,
    getErrorMessage?: GetErrorMessage,
    intl?: IntlShape
) => React.ReactElement;

export interface IPeriodeinfopanelerProps {
    intl: IntlShape;
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
    minstEn?: boolean;
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
    props: IPeriodeinfopanelerProps
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
        minstEn,
        feilkodeprefiks,
        onAdd,
        onRemove,
        panelClassName,
    } = props;

    const { intl, component, editSoknad, editSoknadState, kanHaFlere, initialValues } = props;

    const editInfo: (index: number, periodeinfo: Partial<IPeriodeinfo>) => IPeriodeinfo[] = (
        index: number,
        periodeinfo: Partial<IPeriodeinfo>
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
        intlShape: IntlShape
    ) => {
        const removePeriode = () => {
            const newArray: IPeriodeinfo[] = removeItem(periodeindeks);
            editSoknadState(newArray);
            editSoknad(newArray);

            if (onRemove) {
                onRemove();
            }
        };
        console.log(feilkodeprefiks)
        const feltIndeks = periodeSpenn(periodeinfo.periode)
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
                        errorMessage={getErrorMessage(`${feilkodeprefiks}.perioder[${feltIndeks}]`)}
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
                        intlShape
                    )}
                {feilkodeprefiks &&
                    getUhaandterteFeil &&
                    getUhaandterteFeil(`${feilkodeprefiks}.perioder[${feltIndeks}]`).map((feilmelding, index) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <Feilmelding key={index} feil={feilmelding} />
                    ))}
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
            minstEn={minstEn}
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
    periods: [],
};
