import { AlertStripeAdvarsel, AlertStripeInfo } from 'nav-frontend-alertstriper';
import Panel from 'nav-frontend-paneler';
import { Input, SkjemaGruppe } from 'nav-frontend-skjema';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import AddCircleSvg from '../../../assets/SVG/AddCircleSVG';
import BinSvg from '../../../assets/SVG/BinSVG';
import CalendarSvg from '../../../assets/SVG/CalendarSVG';
import { generateDateString } from '../../../components/skjema/skjemaUtils';
import VerticalSpacer from '../../../components/VerticalSpacer';
import { IPeriode, IPSBSoknad } from '../../../models/types';
import { RootStateType } from '../../../state/RootState';
import intlHelper from '../../../utils/intlUtils';
import './soknadsperioder.less';

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
    overlappendeSoknadsperiode,
}) => {
    const [visLeggTilPerioder, setVisLeggTilPerioder] = useState<boolean>(true);
    const punchFormState = useSelector((state: RootStateType) => state.PLEIEPENGER_SYKT_BARN.punchFormState);
    const finnesIkkeEksisterendePerioder: boolean =
        !punchFormState.hentPerioderError &&
        (typeof punchFormState.perioder === 'undefined' ||
            punchFormState.perioder.length <= 0 ||
            !punchFormState.perioder);

    const sjekkFelmeldingDato = () => {
        if (
            typeof soknad.soeknadsperiode !== 'undefined' &&
            !!soknad.soeknadsperiode &&
            !!soknad.soeknadsperiode.fom &&
            !!soknad.soeknadsperiode.tom
        ) {
            if (new Date(soknad.soeknadsperiode.fom) > new Date(soknad.soeknadsperiode.tom))
                return intlHelper(intl, 'skjema.feil.FRA_OG_MED_MAA_VAERE_FOER_TIL_OG_MED');
        }
        return undefined;
    };

    const sjekkFelmeldingPeriode = () => {
        const valideringsFeilmelding = getErrorMessage('søknadsperiode/endringsperiode');
        const feilFunnitInnenValideringMelding = sjekkFelmeldingDato();

        if (typeof valideringsFeilmelding !== 'undefined') return valideringsFeilmelding;
        if (typeof feilFunnitInnenValideringMelding !== 'undefined') return feilFunnitInnenValideringMelding;
        return undefined;
    };

    return (
        <Panel className="eksiterendesoknaderpanel">
            <h3>{intlHelper(intl, 'skjema.soknadsperiode')}</h3>
            {punchFormState.hentPerioderError && <p>{intlHelper(intl, 'skjema.eksisterende.feil')}</p>}
            {!punchFormState.hentPerioderError && !!punchFormState.perioder?.length && (
                <>
                    <AlertStripeInfo>{intlHelper(intl, 'skjema.generellinfo')}</AlertStripeInfo>
                    <h4>{intlHelper(intl, 'skjema.eksisterende')}</h4>
                    {punchFormState.perioder.map((p, i) => (
                        <div key={`${p.fom}_${p.tom}`} className="datocontainer">
                            <CalendarSvg title="calendar" />
                            <div className="periode">{generateDateString(p)}</div>
                        </div>
                    ))}

                    <VerticalSpacer eightPx />
                    {visLeggTilPerioder && (
                        <div className="knappecontainer">
                            <button
                                id="leggtilsoknadsperiode"
                                className="leggtilsoknadsperiode"
                                type="button"
                                onClick={() => {
                                    setVisLeggTilPerioder(false);
                                    updateSoknadState({ soeknadsperiode: initialPeriode });
                                }}
                            >
                                <div className="leggtilcircle">
                                    <AddCircleSvg title="leggtilcircle" />
                                </div>
                                {intlHelper(intl, 'skjema.soknadsperiode.leggtil')}
                            </button>
                        </div>
                    )}
                </>
            )}

            {finnesIkkeEksisterendePerioder && (
                <AlertStripeInfo>{intlHelper(intl, 'skjema.eksisterende.ingen')}</AlertStripeInfo>
            )}

            {(!visLeggTilPerioder || finnesIkkeEksisterendePerioder) && (
                <SkjemaGruppe feil={sjekkFelmeldingPeriode()}>
                    <div className="soknadsperiodecontainer">
                        <Input
                            id="soknadsperiode-fra"
                            bredde="M"
                            label={intlHelper(intl, 'skjema.soknasperiodefra')}
                            type="date"
                            className="fom"
                            value={soknad.soeknadsperiode?.fom || ''}
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...changeAndBlurUpdatesSoknad((event: any) => ({
                                soeknadsperiode: {
                                    ...soknad.soeknadsperiode,
                                    fom: event.target.value,
                                },
                            }))}
                        />
                        <Input
                            id="soknadsperiode-til"
                            bredde="M"
                            label={intlHelper(intl, 'skjema.soknasperiodetil')}
                            type="date"
                            className="tom"
                            value={soknad.soeknadsperiode?.tom || ''}
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...changeAndBlurUpdatesSoknad((event: any) => ({
                                soeknadsperiode: {
                                    ...soknad.soeknadsperiode,
                                    tom: event.target.value,
                                },
                            }))}
                        />

                        <button
                            id="fjern"
                            className="fjern"
                            type="button"
                            onClick={() => {
                                deleteSoknadsperiode();
                                setVisLeggTilPerioder(true);
                            }}
                        >
                            <BinSvg title="fjern" />
                        </button>
                    </div>
                </SkjemaGruppe>
            )}
            {!!soknad.soeknadsperiode?.fom &&
                !!soknad.soeknadsperiode.tom &&
                !!punchFormState.perioder?.length &&
                overlappendeSoknadsperiode(punchFormState.perioder, soknad.soeknadsperiode) && (
                    <AlertStripeAdvarsel>{intlHelper(intl, 'skjema.soknadsperiode.overlapper')}</AlertStripeAdvarsel>
                )}
        </Panel>
    );
};
export default Soknadsperioder;
