import {PeriodInput} from 'app/components/period-input/PeriodInput';
import * as React from 'react';
import {IntlShape} from 'react-intl';
import {IPeriode} from "../../models/types/Periode";
import BinSvg from "../../assets/SVG/BinSVG";
import intlHelper from "../../utils/intlUtils";
import {Knapp} from "nav-frontend-knapper";
import Panel from "nav-frontend-paneler";
import {Row} from "react-bootstrap";
import AddCircleSvg from "../../assets/SVG/AddCircleSVG";

export type GetErrorMessage = (kode: string, indeks?: number) => (React.ReactNode | boolean | undefined);

export interface IPeriodepanelerProps {
    intl: IntlShape;
    periods: IPeriode[]; // Liste over periodisert informasjon
    panelid: (periodeindex: number) => string; // String som skal brukes til å identifisere hvert enkelt element
    initialPeriode: IPeriode; // Objektet som legges til når man legger til en ny periode i lista
    editSoknad: (periodeinfo: IPeriode[]) => any; // Funksjon som skal kalles for å sende en put-spørring med oppdatert info og oppdatere Redux-store deretter (brukes i hovedsak på onBlur)
    editSoknadState: (periodeinfo: IPeriode[], showStatus?: boolean) => any; // Funskjon som skal kalles for å oppdatere state på PunchFormOld (må brukes på onChange)
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
    const {intl, editSoknad, editSoknadState, kanHaFlere, getErrorMessage, feilkodeprefiks} = props;

    const editInfo: (index: number, periodeinfo: Partial<IPeriode>) => IPeriode[] = (index: number, periodeinfo: Partial<IPeriode>) => {
        const newInfo: IPeriode = {...props.periods[index], ...periodeinfo};
        const newArray = periods;
        newArray[index] = newInfo;
        return newArray;
    };

    const editPeriode = (index: number, periode: IPeriode) => editInfo(index, periode);

    const addItem = () => {
        const newArray = periods;
        newArray.push(props.initialPeriode);
        return newArray;
    };

    const removeItem = (index: number) => {
        const newArray = periods;
        newArray.splice(index, 1);
        return newArray;
    };

    return (
        <Panel className={"periodepanel"}>
            {periods.map((p, i) =>
                <Row noGutters={true} key={i}>
                    <div className={"periodepanel-input"}>
                        <PeriodInput
                            periode={p || {}}
                            intl={intl}
                            onChange={(periode) => {
                                editSoknadState(editPeriode(i, periode))
                            }}
                            onBlur={(periode) => {
                                editSoknad(editPeriode(i, periode))
                            }}
                            errorMessage={feilkodeprefiks ? getErrorMessage!(feilkodeprefiks, i) : getErrorMessage!(`[${i}].periode`)}
                            errorMessageFom={getErrorMessage!(`[${i}].periode.fom`)}
                            errorMessageTom={getErrorMessage!(`[${i}].periode.tom`)}
                        />
                        <div
                            id="slett"
                            className={!!getErrorMessage!(feilkodeprefiks!, i) ? "fjern-feil" : "fjern"}
                            role="button"
                            onClick={() => {
                                const newArray: IPeriode[] = removeItem(i);
                                editSoknadState(newArray);
                                editSoknad(newArray);
                                !!props.onRemove && props.onRemove();
                            }}
                            tabIndex={0}
                        ><div className={"slettIcon"}><BinSvg title={"fjern"}/></div>
                            {intlHelper(intl, props.textFjern || 'skjema.liste.fjern')}</div>
                    </div>
                </Row>)}
            {kanHaFlere &&
            <Row noGutters={true}>
                <div
                    id="leggtilperiode"
                    className={"leggtilperiode"}
                    role="button"
                    onClick={() => {
                        const newArray: IPeriode[] = addItem();
                        editSoknadState(newArray);
                        editSoknad(newArray);
                        !!props.onAdd && props.onAdd();
                    }}
                    tabIndex={0}
                ><div className={"leggtilperiodeIcon"}><AddCircleSvg title={"leggtil"}/></div>
                    {intlHelper(intl, props.textLeggTil || 'skjema.periodepanel.legg_til')}</div></Row>}

        </Panel>);
};
