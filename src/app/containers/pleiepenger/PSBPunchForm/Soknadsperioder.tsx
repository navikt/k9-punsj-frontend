import React, {useState} from 'react';
import intlHelper from "../../../utils/intlUtils";
import {AlertStripeAdvarsel, AlertStripeInfo} from "nav-frontend-alertstriper";
import CalendarSvg from "../../../assets/SVG/CalendarSVG";
import {generateDateString} from "../../../components/skjema/skjemaUtils";
import AddCircleSvg from "../../../assets/SVG/AddCircleSVG";
import {Input, SkjemaGruppe} from "nav-frontend-skjema";
import BinSvg from "../../../assets/SVG/BinSVG";
import Panel from "nav-frontend-paneler";
import {IPeriode, IPSBSoknad} from "../../../models/types";
import './soknadsperioder.less';
import VerticalSpacer from "../../../components/VerticalSpacer";
import {useSelector} from "react-redux";
import {RootStateType} from "../../../state/RootState";

interface IOwnProps {
    intl: any;
    updateSoknadState: (object: any) => void;
    initialPeriode: IPeriode;
    getErrorMessage: any;
    soknad: IPSBSoknad;
    deleteSoknadsperiode: () => void;
    changeAndBlurUpdatesSoknad: (objekt: any) => any;
    overlappendeSoknadsperiode: any;
}

const Soknadsperioder: React.FunctionComponent<IOwnProps> = ({
    intl,
    updateSoknadState,
    initialPeriode,
    getErrorMessage,
    soknad,
    deleteSoknadsperiode,
    changeAndBlurUpdatesSoknad,
    overlappendeSoknadsperiode
}) => {
    const [visLeggTilPerioder, setVisLeggTilPerioder] = useState<boolean>(false);
    const punchFormState = useSelector((state: RootStateType) => state.PLEIEPENGER_SYKT_BARN.punchFormState);
    const finnesIkkeEksisterendePerioder: boolean = !punchFormState.hentPerioderError
        && (typeof punchFormState.perioder === 'undefined' || punchFormState.perioder.length <= 0 || !punchFormState.perioder);

    return (
        <Panel className={"eksiterendesoknaderpanel"}>
            <h3>{intlHelper(intl, 'skjema.soknadsperiode')}</h3>

            {punchFormState.hentPerioderError && <p>{intlHelper(intl, 'skjema.eksisterende.feil')}</p>}
            {!punchFormState.hentPerioderError && !!punchFormState.perioder?.length && <>
              <AlertStripeInfo>{intlHelper(intl, 'skjema.generellinfo')}</AlertStripeInfo>
              <h4>{intlHelper(intl, 'skjema.eksisterende')}</h4>
                {punchFormState.perioder.map((p, i) => <div key={i} className={"datocontainer"}><CalendarSvg
                    title={"calendar"}/>
                    <div className={"periode"}>{generateDateString(p)}</div>
                </div>)}

              <VerticalSpacer eightPx={true}/>
                {!visLeggTilPerioder && <div className={"knappecontainer"}>
                  <div
                    id="leggtilsoknadsperiode"
                    className={"leggtilsoknadsperiode"}
                    role="button"
                    onClick={() => {
                        setVisLeggTilPerioder(true);
                        updateSoknadState({soeknadsperiode: initialPeriode});
                    }}
                    tabIndex={0}
                  >
                    <div className={"leggtilcircle"}><AddCircleSvg title={"leggtilcircle"}/></div>
                      {intlHelper(intl, 'skjema.soknadsperiode.leggtil')}
                  </div>
                </div>
                }
            </>}

            {finnesIkkeEksisterendePerioder &&
            <AlertStripeInfo>{intlHelper(intl, 'skjema.eksisterende.ingen')}</AlertStripeInfo>}

            {(visLeggTilPerioder || finnesIkkeEksisterendePerioder) &&
            <SkjemaGruppe feil={getErrorMessage('søknadsperiode/endringsperiode')}>
                {
                    <div className={"soknadsperiodecontainer"}>
                        <Input
                            id="soknadsperiode-fra"
                            bredde={"M"}
                            label={intlHelper(intl, 'skjema.soknasperiodefra')}
                            type="date"
                            className="fom"
                            value={soknad.soeknadsperiode?.fom || ''}
                            {...changeAndBlurUpdatesSoknad((event: any) => ({
                                soeknadsperiode: {...soknad.soeknadsperiode, fom: event.target.value}
                            }))}
                        />
                        <Input
                            id="soknadsperiode-til"
                            bredde={"M"}
                            label={intlHelper(intl, 'skjema.soknasperiodetil')}
                            type="date"
                            className="tom"
                            value={soknad.soeknadsperiode?.tom || ''}
                            {...changeAndBlurUpdatesSoknad((event: any) => ({
                                soeknadsperiode: {...soknad.soeknadsperiode, tom: event.target.value},
                            }))}
                        />

                        <div
                            id="fjern"
                            className={"fjern"}
                            role="button"
                            onClick={() => {
                                deleteSoknadsperiode();
                                setVisLeggTilPerioder(false)
                            }}
                            tabIndex={0}>
                            <BinSvg title={"fjern"}/>
                        </div>
                    </div>}
            </SkjemaGruppe>}
            {!!soknad.soeknadsperiode?.fom && !!soknad.soeknadsperiode.tom && !!punchFormState.perioder?.length && overlappendeSoknadsperiode(punchFormState.perioder, soknad.soeknadsperiode) &&
            <AlertStripeAdvarsel>{intlHelper(intl, 'skjema.soknadsperiode.overlapper')}</AlertStripeAdvarsel>}
        </Panel>
    )
}
export default Soknadsperioder;