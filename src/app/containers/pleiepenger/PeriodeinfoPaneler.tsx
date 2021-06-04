import {PeriodInput} from 'app/components/period-input/PeriodInput';
import {
    ListeComponent,
    Listepaneler,
    UpdateListeinfoInSoknad,
    UpdateListeinfoInSoknadState
} from 'app/containers/pleiepenger/Listepaneler';
import * as React from 'react';
import {IntlShape} from 'react-intl';
import {IPeriodeinfoExtension, IPeriodeinfo, Periodeinfo} from "../../models/types/Periodeinfo";
import {IPeriode} from "../../models/types/Periode";
import BinSvg from "../../assets/SVG/BinSVG";
import intlHelper from "../../utils/intlUtils";
import './periodeinfoPaneler.less';

export type UpdatePeriodeinfoInSoknad<T> = (info: Partial<Periodeinfo<T>>) => any;
export type UpdatePeriodeinfoInSoknadState<T> = (info: Partial<Periodeinfo<T>>, showStatus?: boolean) => any;
export type GetErrorMessage = (kode: string) => (React.ReactNode | boolean | undefined);

export type PeriodeinfoComponent<T> = (info: Periodeinfo<T>,
                                       periodeindex: number,
                                       updatePeriodeinfoInSoknad: UpdatePeriodeinfoInSoknad<T>,
                                       updatePeriodeinfoInSoknadState: UpdatePeriodeinfoInSoknadState<T>,
                                       feilkodeprefiksMedIndeks?: string,
                                       getErrorMessage?: GetErrorMessage,
                                       intl?: IntlShape) => React.ReactElement;

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
    feilkodeprefiks?: string;
    minstEn?: boolean;
    onAdd?: () => any;
    onRemove?: () => any;
    kanHaFlere: boolean;
    medSlettKnapp: boolean;
}

export const PeriodeinfoPaneler: React.FunctionComponent<IPeriodeinfopanelerProps> = (props: IPeriodeinfopanelerProps) => {

    const periods = !!props.periods ? props.periods : [];
    const {intl, component, editSoknad, editSoknadState, kanHaFlere} = props;

    const editInfo: (index: number, periodeinfo: Partial<IPeriodeinfo>) => IPeriodeinfo[] = (index: number, periodeinfo: Partial<IPeriodeinfo>) => {
        const newInfo: IPeriodeinfo = {...props.periods[index], ...periodeinfo};
        const newArray = periods;
        newArray[index] = newInfo;
        return newArray;
    };

    const removeItem = (index: number) => {
        const newArray = periods;
        newArray.splice(index, 1);
        return newArray;
    };

    const editPeriode = (index: number, periode: IPeriode) => editInfo(index, {periode});

    const periodComponent: ListeComponent<IPeriodeinfo> = (
        periodeinfo: IPeriodeinfo,
        periodeindeks: number,
        updatePeriodeinfoInSoknad: UpdateListeinfoInSoknad<IPeriodeinfo>,
        updatePeriodeinfoInSoknadState: UpdateListeinfoInSoknadState<IPeriodeinfo>,
        feilkodeprefiksMedIndeks: string,
        getErrorMessage: GetErrorMessage,
        intlShape: IntlShape,
    ) => <>
        <div className={"periodeinfopanel_container"}>
            <PeriodInput
                periode={periodeinfo.periode || {}}
                intl={intlShape}
                onChange={(periode) => {
                    editSoknadState(editPeriode(periodeindeks, periode))
                }}
                onBlur={(periode) => {
                    editSoknad(editPeriode(periodeindeks, periode))
                }}
                errorMessage={getErrorMessage(`[${periodeindeks}].periode`)}
                errorMessageFom={getErrorMessage(`[${periodeindeks}].periode.fom`)}
                errorMessageTom={getErrorMessage(`[${periodeindeks}].periode.tom`)}
            />
            <div
                id="slett"
                className={"removePeriodeKnapp"}
                role="button"
                onClick={() => {
                    const newArray: IPeriodeinfo[] = removeItem(periodeindeks);
                    editSoknadState(newArray);
                    editSoknad(newArray);
                    !!props.onRemove && props.onRemove();
                }}
                tabIndex={0}
            >
                <div className={"slettIkon"}><BinSvg title={"fjern"}/></div>
                {intlHelper(intl, props.textFjern || 'skjema.perioder.fjern')}
            </div>

        </div>
        {!!component && component(
            periodeinfo,
            periodeindeks,
            updatePeriodeinfoInSoknad,
            updatePeriodeinfoInSoknadState,
            feilkodeprefiksMedIndeks,
            getErrorMessage,
            intlShape
        )}
    </>;

    return <Listepaneler
        intl={intl}
        items={periods}
        panelid={props.panelid}
        initialItem={props.initialPeriodeinfo}
        editSoknad={editSoknad}
        editSoknadState={editSoknadState}
        getErrorMessage={props.getErrorMessage}
        className={props.className}
        minstEn={props.minstEn}
        feilkodeprefiks={props.feilkodeprefiks}
        component={periodComponent}
        onAdd={props.onAdd}
        onRemove={props.onRemove}
        panelClassName={props.panelClassName}
        textFjern={props.textFjern || 'skjema.perioder.fjern'}
        textLeggTil={props.textLeggTil || 'skjema.perioder.legg_til'}
        kanHaFlere={kanHaFlere}
        medSlettKnapp={props.medSlettKnapp}
    />;
};
