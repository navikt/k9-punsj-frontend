import {PeriodInput} from 'app/components/period-input/PeriodInput';
import {
    ListeComponent,
    Listepaneler,
    UpdateListeinfoInSoknad,
    UpdateListeinfoInSoknadState
} from 'app/containers/pleiepenger/Listepaneler';
import * as React from 'react';
import {IntlShape} from 'react-intl';
import {IPeriodeinfoExtensionV2, PeriodeinfoV2} from "../../models/types/PeriodeInfoV2";
import {IPeriodeV2, PeriodeV2} from "../../models/types/PeriodeV2";
import BinSvg from "../../assets/SVG/BinSVG";
import intlHelper from "../../utils/intlUtils";
import {Knapp} from "nav-frontend-knapper";
import Panel from "nav-frontend-paneler";
import {Row} from "react-bootstrap";

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
    panelid: (periodeindex: number) => string; // String som skal brukes til å identifisere hvert enkelt element
    initialPeriode: IPeriodeV2; // Objektet som legges til når man legger til en ny periode i lista
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
    const {intl, editSoknad, editSoknadState, kanHaFlere, getErrorMessage} = props;

    const editInfo: (index: number, periodeinfo: Partial<IPeriodeV2>) => IPeriodeV2[] = (index: number, periodeinfo: Partial<IPeriodeV2>) => {
        const newInfo: IPeriodeV2 = {...props.periods[index], ...periodeinfo};
        const newArray = periods;
        newArray[index] = newInfo;
        return newArray;
    };

    const editPeriode = (index: number, periode: IPeriodeV2) => editInfo(index, periode);

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
                <Row key={i}>
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
                            errorMessage={getErrorMessage!(`[${i}].periode`)}
                            errorMessageFom={getErrorMessage!(`[${i}].periode.fom`)}
                            errorMessageTom={getErrorMessage!(`[${i}].periode.tom`)}
                        />

                        <div
                            id="slett"
                            className={"fjern"}
                            role="button"
                            onClick={() => {
                                const newArray: IPeriodeV2[] = removeItem(i);
                                editSoknadState(newArray);
                                editSoknad(newArray);
                                !!props.onRemove && props.onRemove();
                            }}
                            tabIndex={0}
                        ><BinSvg title={"fjern"}/></div>
                    </div>
                </Row>)}
            {kanHaFlere &&
            <Row noGutters={true}>
                <Knapp
                    onClick={() => {
                        const newArray: IPeriodeV2[] = addItem();
                        editSoknadState(newArray);
                        editSoknad(newArray);
                        !!props.onAdd && props.onAdd();
                    }}
                    className="leggtil"
                    mini={true}
                >
                    {intlHelper(intl, props.textLeggTil || 'skjema.perioder.legg_til')}
                </Knapp></Row>}

        </Panel>);

}
;
