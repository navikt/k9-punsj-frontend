import {PeriodInput}                                                from 'app/components/period-input/PeriodInput';
import {
    ListeComponent,
    Listepaneler,
    UpdateListeinfoInSoknad,
    UpdateListeinfoInSoknadState
}                                                                   from 'app/containers/pleiepenger/Listepaneler';
import * as React                                                   from 'react';
import {IntlShape}                                                  from 'react-intl';
import {IPeriodeinfoExtensionV2, IPeriodeinfoV2, PeriodeinfoV2} from "../../models/types/PeriodeInfoV2";
import {IPeriodeV2} from "../../models/types/PeriodeV2";

export type UpdatePeriodeinfoInSoknad<T> = (info: Partial<PeriodeinfoV2<T>>) => any;
export type UpdatePeriodeinfoInSoknadState<T> = (info: Partial<PeriodeinfoV2<T>>, showStatus?: boolean) => any;
export type GetErrorMessage = (kode: string) => (React.ReactNode | boolean | undefined);

export type PeriodeinfoComponent<T> = (info: PeriodeinfoV2<T>,
                                   periodeindex: number,
                                   updatePeriodeinfoInSoknad: UpdatePeriodeinfoInSoknad<T>,
                                   updatePeriodeinfoInSoknadState: UpdatePeriodeinfoInSoknadState<T>,
                                   feilkodeprefiksMedIndeks?: string,
                                   getErrorMessage?: GetErrorMessage,
                                   intl?: IntlShape) => React.ReactElement;

export interface IPeriodeinfopanelerProps {
    intl: IntlShape;
    periods: IPeriodeinfoV2[]; // Liste over periodisert informasjon
    component?: PeriodeinfoComponent<IPeriodeinfoExtensionV2>; // Skal returnere et React-element for en gitt periode i lista
    panelid: (periodeindex: number) => string; // String som skal brukes til å identifisere hvert enkelt element
    initialPeriodeinfo: PeriodeinfoV2<IPeriodeinfoExtensionV2>; // Objektet som legges til når man legger til en ny periode i lista
    editSoknad: (periodeinfo: IPeriodeinfoV2[]) => any; // Funksjon som skal kalles for å sende en put-spørring med oppdatert info og oppdatere Redux-store deretter (brukes i hovedsak på onBlur)
    editSoknadState: (periodeinfo: IPeriodeinfoV2[], showStatus?: boolean) => any; // Funskjon som skal kalles for å oppdatere state på PunchForm (må brukes på onChange)
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
}

export const PeriodeinfoPaneler: React.FunctionComponent<IPeriodeinfopanelerProps> = (props: IPeriodeinfopanelerProps) => {

    const periods = !!props.periods ? props.periods : [];
    const {intl, component, editSoknad, editSoknadState, kanHaFlere} = props;

    const editInfo: (index: number, periodeinfo: Partial<IPeriodeinfoV2>) => IPeriodeinfoV2[] = (index: number, periodeinfo: Partial<IPeriodeinfoV2>) => {
        const newInfo: IPeriodeinfoV2 = {...props.periods[index], ...periodeinfo};
        const newArray = periods;
        newArray[index] = newInfo;
        return newArray;
    };

    const editPeriode = (index: number, periode: IPeriodeV2) => editInfo(index, {periode});

    const periodComponent: ListeComponent<IPeriodeinfoV2> = (
        periodeinfo: IPeriodeinfoV2,
        periodeindeks: number,
        updatePeriodeinfoInSoknad: UpdateListeinfoInSoknad<IPeriodeinfoV2>,
        updatePeriodeinfoInSoknadState: UpdateListeinfoInSoknadState<IPeriodeinfoV2>,
        feilkodeprefiksMedIndeks: string,
        getErrorMessage: GetErrorMessage,
        intlShape: IntlShape,
    ) => <>
        <PeriodInput
            periode={periodeinfo.periode || {}}
            intl={intlShape}
            onChange={(periode) => {editSoknadState(editPeriode(periodeindeks, periode))}}
            onBlur={(periode) => {editSoknad(editPeriode(periodeindeks, periode))}}
            errorMessage={getErrorMessage(`[${periodeindeks}].periode`)}
            errorMessageFom={getErrorMessage(`[${periodeindeks}].periode.fom`)}
            errorMessageTom={getErrorMessage(`[${periodeindeks}].periode.tom`)}
        />
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
    />;
};
