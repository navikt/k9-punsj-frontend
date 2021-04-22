import {
    ListeComponent,
    Listepaneler,
    UpdateListeinfoInSoknad,
    UpdateListeinfoInSoknadState
}                                                                   from 'app/containers/pleiepenger/Listepaneler';
import * as React                                                   from 'react';
import {IntlShape}                                                  from 'react-intl';
import {IPeriodeMedFaktiskeTimer, PeriodeMedFaktiskeTimer} from "../../models/types/PeriodeV2";
import {ArbeidstidInput} from "../../components/arbeidstid-input/ArbeidstidInput";

export type UpdatePeriodeinfoInSoknad<T> = (info: Partial<PeriodeMedFaktiskeTimer>) => any;
export type UpdatePeriodeinfoInSoknadState<T> = (info: Partial<PeriodeMedFaktiskeTimer>, showStatus?: boolean) => any;
export type GetErrorMessage = (kode: string) => (React.ReactNode | boolean | undefined);

export interface IArbeidstidinfopanelerProps {
    intl: IntlShape;
    periods: IPeriodeMedFaktiskeTimer[]; // Liste over periodisert informasjon
    panelid: (periodeindex: number) => string; // String som skal brukes til å identifisere hvert enkelt element
    initialPeriodeinfo: IPeriodeMedFaktiskeTimer; // Objektet som legges til når man legger til en ny periode i lista
    editSoknad: (periodeinfo: IPeriodeMedFaktiskeTimer[]) => any; // Funksjon som skal kalles for å sende en put-spørring med oppdatert info og oppdatere Redux-store deretter (brukes i hovedsak på onBlur)
    editSoknadState: (periodeinfo: IPeriodeMedFaktiskeTimer[], showStatus?: boolean) => any; // Funskjon som skal kalles for å oppdatere state på PunchFormOld (må brukes på onChange)
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
    fjernKnapp?:  (itemIndex: number) => React.ReactElement,
}

export const ArbeidstidinfoPaneler: React.FunctionComponent<IArbeidstidinfopanelerProps> = (props: IArbeidstidinfopanelerProps) => {

    const periods = !!props.periods ? props.periods : [];
    const {intl, editSoknad, editSoknadState, kanHaFlere, fjernKnapp} = props;

    const editInfo: (index: number, periodeinfo: Partial<IPeriodeMedFaktiskeTimer>) => IPeriodeMedFaktiskeTimer[] = (index: number, periodeinfo: Partial<IPeriodeMedFaktiskeTimer>) => {
        const newInfo: IPeriodeMedFaktiskeTimer = {...props.periods[index], ...periodeinfo};
        const newArray = periods;
        newArray[index] = newInfo;
        return newArray;
    };

    const editPeriode = (index: number, periode: IPeriodeMedFaktiskeTimer) => editInfo(index, periode);

    const periodComponent: ListeComponent<IPeriodeMedFaktiskeTimer> = (
        periodeinfo: IPeriodeMedFaktiskeTimer,
        periodeindeks: number,
        updatePeriodeinfoInSoknad: UpdateListeinfoInSoknad<IPeriodeMedFaktiskeTimer>,
        updatePeriodeinfoInSoknadState: UpdateListeinfoInSoknadState<IPeriodeMedFaktiskeTimer>,
        feilkodeprefiksMedIndeks: string,
        getErrorMessage: GetErrorMessage,
        intlShape: IntlShape,
    ) =>
        <ArbeidstidInput
            periodeindeks={periodeindeks}
            periodeMedTimer={periodeinfo}
            intl={intlShape}
            onChange={(periode) => {editSoknadState(editPeriode(periodeindeks, periode))}}
            onBlur={(periode) => {editSoknad(editPeriode(periodeindeks, periode))}}
            errorMessage={getErrorMessage(`[${periodeindeks}].periode`)}
            errorMessageFom={getErrorMessage(`[${periodeindeks}].periode.fom`)}
            errorMessageTom={getErrorMessage(`[${periodeindeks}].periode.tom`)}
            errorMessageTimer={getErrorMessage(`[${periodeindeks}].periode.timer`)}
            fjernKnapp={fjernKnapp}
        />;

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
