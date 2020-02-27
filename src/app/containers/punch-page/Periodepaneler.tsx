import {PeriodInput}                                               from 'app/components/period-input/PeriodInput';
import {
    ListeComponent,
    Listepaneler,
    UpdateListeinfoInSoknad,
    UpdateListeinfoInSoknadState
}                                                                  from 'app/containers/punch-page/Listepaneler';
import {IPeriode, IPeriodeinfo, Periodeinfo, PeriodeinfoExtension} from 'app/models/types';
import {SkjemaelementFeil}                                         from 'nav-frontend-skjema/lib/skjemaelement-feilmelding';
import * as React                                                  from 'react';
import {IntlShape}                                                 from 'react-intl';

export type UpdatePeriodeinfoInSoknad<T> = (info: Partial<Periodeinfo<T>>) => any;
export type UpdatePeriodeinfoInSoknadState<T> = (info: Partial<Periodeinfo<T>>, showStatus?: boolean) => any;
export type GetErrorMessage = (kode: string) => (SkjemaelementFeil | undefined);

export type PeriodeComponent<T> = (info: Periodeinfo<T>,
                                   periodeindex: number,
                                   updatePeriodeinfoInSoknad: UpdatePeriodeinfoInSoknad<T>,
                                   updatePeriodeinfoInSoknadState: UpdatePeriodeinfoInSoknadState<T>,
                                   feilkodeprefiksMedIndeks?: string,
                                   getErrorMessage?: GetErrorMessage,
                                   intl?: IntlShape) => React.ReactElement;

export interface IPeriodepanelerProps {
    intl: IntlShape;
    periods: IPeriodeinfo[]; // Liste over periodisert informasjon
    component?: PeriodeComponent<PeriodeinfoExtension>; // Skal returnere et React-element for en gitt periode i lista
    panelid: (periodeindex: number) => string; // String som skal brukes til å identifisere hvert enkelt element
    initialPeriodeinfo: Periodeinfo<PeriodeinfoExtension>; // Objektet som legges til når man legger til en ny periode i lista
    editSoknad: (periodeinfo: IPeriodeinfo[]) => any; // Funksjon som skal kalles for å sende en put-spørring med oppdatert info og oppdatere Redux-store deretter (brukes i hovedsak på onBlur)
    editSoknadState: (periodeinfo: IPeriodeinfo[], showStatus?: boolean) => any; // Funskjon som skal kalles for å oppdatere state på PunchForm (må brukes på onChange)
    className?: string;
    textLeggTil?: string;
    textFjern?: string;
    panelClassName?: string;
    getErrorMessage?: (kode: string) => (SkjemaelementFeil | undefined);
    feilkodeprefiks?: string;
    minstEn?: boolean;
    onAdd?: () => any;
    onRemove?: () => any;
}

export const Periodepaneler: React.FunctionComponent<IPeriodepanelerProps> = (props: IPeriodepanelerProps) => {

    const periods = !!props.periods ? props.periods : [];
    const {intl, component, editSoknad, editSoknadState} = props;

    const editInfo: (index: number, periodeinfo: Partial<IPeriodeinfo>) => IPeriodeinfo[] = (index: number, periodeinfo: Partial<IPeriodeinfo>) => {
        const newInfo: IPeriodeinfo = {...props.periods[index], ...periodeinfo};
        const newArray = periods;
        newArray[index] = newInfo;
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
        intlShape: IntlShape
    ) => <>
        <PeriodInput
            periode={periodeinfo.periode || {}}
            intl={intlShape}
            onChange={(periode) => {editSoknadState(editPeriode(periodeindeks, periode))}}
            onBlur={(periode) => {editSoknad(editPeriode(periodeindeks, periode))}}
            errorMessage={getErrorMessage(`[${periodeindeks}].periode`)}
            errorMessageFom={getErrorMessage(`[${periodeindeks}].periode.fraOgMed`)}
            errorMessageTom={getErrorMessage(`[${periodeindeks}].periode.tilOgMed`)}
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
    />;
};