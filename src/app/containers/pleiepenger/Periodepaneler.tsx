import {PeriodInput}                                                from 'app/components/period-input/PeriodInput';
import {
    ListeComponent,
    Listepaneler,
    UpdateListeinfoInSoknad,
    UpdateListeinfoInSoknadState
}                                                                   from 'app/containers/pleiepenger/Listepaneler';
import * as React                                                   from 'react';
import {IntlShape}                                                  from 'react-intl';
import {IPeriodeinfoExtensionV2, PeriodeinfoV2} from "../../models/types/PeriodeInfoV2";
import {IPeriodeV2} from "../../models/types/PeriodeV2";

export type UpdatePeriodeinfoInSoknad<T> = (info: Partial<PeriodeinfoV2<T>>) => any;
export type UpdatePeriodeinfoInSoknadState<T> = (info: Partial<PeriodeinfoV2<T>>, showStatus?: boolean) => any;
export type GetErrorMessage = (kode: string) => (React.ReactNode | boolean | undefined);

export type PeriodeComponent<T> = (info: PeriodeinfoV2<T>,
                                   periodeindex: number,
                                   updatePeriodeinfoInSoknad: UpdatePeriodeinfoInSoknad<T>,
                                   updatePeriodeinfoInSoknadState: UpdatePeriodeinfoInSoknadState<T>,
                                   feilkodeprefiksMedIndeks?: string,
                                   getErrorMessage?: GetErrorMessage,
                                   intl?: IntlShape) => React.ReactElement;

export interface IPeriodepanelerProps {
    intl: IntlShape;
    periods: IPeriodeV2[]; // Liste over periodisert informasjon
    component?: PeriodeComponent<IPeriodeinfoExtensionV2>; // Skal returnere et React-element for en gitt periode i lista
    panelid: (periodeindex: number) => string; // String som skal brukes til å identifisere hvert enkelt element
    initialPeriodeinfo: IPeriodeV2; // Objektet som legges til når man legger til en ny periode i lista
    editSoknad: (periodeinfo: IPeriodeV2[]) => any; // Funksjon som skal kalles for å sende en put-spørring med oppdatert info og oppdatere Redux-store deretter (brukes i hovedsak på onBlur)
    editSoknadState: (periodeinfo: IPeriodeV2[], showStatus?: boolean) => any; // Funskjon som skal kalles for å oppdatere state på PunchFormOld (må brukes på onChange)
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

export const Periodepaneler: React.FunctionComponent<IPeriodepanelerProps> = (props: IPeriodepanelerProps) => {

    const periods = !!props.periods ? props.periods : [];
    const {intl, component, editSoknad, editSoknadState, kanHaFlere} = props;

    const editInfo: (index: number, periodeinfo: Partial<IPeriodeV2>) => IPeriodeV2[] = (index: number, periodeinfo: Partial<IPeriodeV2>) => {
        const newInfo: IPeriodeV2 = {...props.periods[index], ...periodeinfo};
        const newArray = periods;
        newArray[index] = newInfo;
        return newArray;
    };

    const editPeriode = (index: number, periode: IPeriodeV2) => editInfo(index, periode);

    const periodComponent: ListeComponent<IPeriodeV2> = (
        periodeinfo: IPeriodeV2,
        periodeindeks: number,
        updatePeriodeinfoInSoknad: UpdateListeinfoInSoknad<IPeriodeV2>,
        updatePeriodeinfoInSoknadState: UpdateListeinfoInSoknadState<IPeriodeV2>,
        feilkodeprefiksMedIndeks: string,
        getErrorMessage: GetErrorMessage,
        intlShape: IntlShape
    ) => <>
        <PeriodInput
            periode={periodeinfo || {}}
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
