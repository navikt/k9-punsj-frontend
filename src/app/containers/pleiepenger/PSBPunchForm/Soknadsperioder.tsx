import DateInput from 'app/components/skjema/DateInput';
import { initializeDate } from 'app/utils';
import { AlertStripeAdvarsel, AlertStripeInfo } from 'nav-frontend-alertstriper';
import Panel from 'nav-frontend-paneler';
import { SkjemaGruppe } from 'nav-frontend-skjema';
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
import { Periodepaneler } from '../Periodepaneler';
import './soknadsperioder.less';

interface IOwnProps {
    intl: any;
    updateSoknadState: (soknad: Partial<IPSBSoknad>) => void;
    initialPeriode: IPeriode;
    getErrorMessage: any;
    soknad: IPSBSoknad;
    deleteSoknadsperiode: () => void;
    updateSoknad: (soknad: Partial<IPSBSoknad>) => void;
}

const Soknadsperioder: React.FunctionComponent<IOwnProps> = ({
    intl,
    updateSoknadState,
    initialPeriode,
    getErrorMessage,
    soknad,
    deleteSoknadsperiode,
    updateSoknad,
}) => {
    const [visLeggTilPerioder, setVisLeggTilPerioder] = useState<boolean>(false);
    const punchFormState = useSelector((state: RootStateType) => state.PLEIEPENGER_SYKT_BARN.punchFormState);
    const finnesIkkeEksisterendePerioder: boolean =
        !punchFormState.hentPerioderError &&
        (typeof punchFormState.perioder === 'undefined' ||
            punchFormState.perioder.length <= 0 ||
            !punchFormState.perioder);

    const sjekkFelmeldingDato = () =>
        soknad?.soeknadsperiode?.some((periode) => initializeDate(periode.fom).isAfter(initializeDate(periode.tom)));

    const sjekkFelmeldingPeriode = () => {
        const valideringsFeilmelding = getErrorMessage('søknadsperiode/endringsperiode');
        const feilFunnitInnenValideringMelding = sjekkFelmeldingDato();

        if (typeof valideringsFeilmelding !== 'undefined') return valideringsFeilmelding;
        if (feilFunnitInnenValideringMelding) {
            return intlHelper(intl, 'skjema.feil.FRA_OG_MED_MAA_VAERE_FOER_TIL_OG_MED');
        }
        return undefined;
    };

    const overlappendeSoknadsperiode = () => {
        const eksisterendePerioder = punchFormState.perioder;
        const nyePerioder = soknad.soeknadsperiode;

        if (!eksisterendePerioder || eksisterendePerioder.length === 0) {
            return false;
        }
        return eksisterendePerioder.some((ep) =>
            nyePerioder?.some(
                (nyPeriode) =>
                    initializeDate(ep.fom).isSameOrBefore(initializeDate(nyPeriode.tom)) &&
                    initializeDate(nyPeriode.fom).isSameOrBefore(initializeDate(ep.tom))
            )
        );
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
                    {!visLeggTilPerioder && (
                        <div className="knappecontainer">
                            <button
                                id="leggtilsoknadsperiode"
                                className="leggtilsoknadsperiode"
                                type="button"
                                onClick={() => {
                                    setVisLeggTilPerioder(true);
                                    updateSoknadState({ soeknadsperiode: [initialPeriode] });
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

            {(visLeggTilPerioder || finnesIkkeEksisterendePerioder) && (
                <SkjemaGruppe feil={sjekkFelmeldingPeriode()}>
                    <div className="soknadsperiodecontainer">
                        {/* <DateInput
                            id="soknadsperiode-fra"
                            label={intlHelper(intl, 'skjema.soknasperiodefra')}
                            className="fom"
                            value={soknad.soeknadsperiode?.fom || ''}
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...changeAndBlurUpdatesSoknad((selectedDate: any) => ({
                                soeknadsperiode: {
                                    ...soknad.soeknadsperiode,
                                    fom: selectedDate,
                                },
                            }))}
                        />
                        <DateInput
                            id="soknadsperiode-til"
                            label={intlHelper(intl, 'skjema.soknasperiodetil')}
                            className="tom"
                            value={soknad.soeknadsperiode?.tom || ''}
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...changeAndBlurUpdatesSoknad((selectedDate: any) => ({
                                soeknadsperiode: {
                                    ...soknad.soeknadsperiode,
                                    tom: selectedDate,
                                },
                            }))}
                        />
                        <button
                            id="fjern"
                            className="fjern"
                            type="button"
                            onClick={() => {
                                deleteSoknadsperiode();
                                setVisLeggTilPerioder(false);
                            }}
                        >
                            <BinSvg title="fjern" />
                        </button> */}
                        <Periodepaneler
                            intl={intl}
                            periods={soknad.soeknadsperiode || []}
                            panelid={(i) => `søknadsperioder_${i}`}
                            initialPeriode={{ fom: '', tom: '' }}
                            editSoknad={(perioder) => updateSoknad({ soeknadsperiode: perioder })}
                            editSoknadState={(perioder) => {
                                updateSoknadState({ soeknadsperiode: perioder });
                                // setSelectedPeriods(perioder);
                            }}
                            textLeggTil="skjema.perioder.legg_til"
                            textFjern="skjema.perioder.fjern"
                            getErrorMessage={getErrorMessage}
                            kanHaFlere
                        />
                    </div>
                </SkjemaGruppe>
            )}
            {overlappendeSoknadsperiode() && (
                <AlertStripeAdvarsel>{intlHelper(intl, 'skjema.soknadsperiode.overlapper')}</AlertStripeAdvarsel>
            )}
        </Panel>
    );
};
export default Soknadsperioder;
