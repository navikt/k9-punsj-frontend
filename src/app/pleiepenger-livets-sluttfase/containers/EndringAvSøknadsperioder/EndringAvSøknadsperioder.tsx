import { initializeDate, slåSammenSammenhengendePerioder } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { AlertStripeInfo } from 'nav-frontend-alertstriper';
import { EkspanderbartpanelBase } from 'nav-frontend-ekspanderbartpanel';
import { Textarea } from 'nav-frontend-skjema';
import { Element, Feilmelding } from 'nav-frontend-typografi';
import * as React from 'react';
import { useIntl } from 'react-intl';

import CustomAlertstripeAdvarsel from './CustomAlertstripeAdvarsel';
import './endringAvSøknadsperioder.less';
import { IPLSSoknad, PLSSoknad } from '../../types/PLSSoknad';
import { IPeriode, Periode } from '../../../models/types';
import { Periodepaneler } from '../../../containers/pleiepenger/Periodepaneler';

interface EndringAvSøknadsperioderProps {
    isOpen: boolean;
    onClick: () => void;
    getErrorMessage: (attribute: string, indeks?: number) => React.ReactNode;
    soknad: PLSSoknad;
    updateSoknad: (soknad: Partial<IPLSSoknad>) => void;
    updateSoknadState: (soknad: Partial<IPLSSoknad>, showStatus?: boolean) => void;
    eksisterendePerioder?: IPeriode[];
}

const EndringAvSøknadsperioder = (props: EndringAvSøknadsperioderProps): JSX.Element | null => {
    const intl = useIntl();
    const { isOpen, onClick, getErrorMessage, soknad, updateSoknad, updateSoknadState, eksisterendePerioder } = props;
    const [selectedPeriods, setSelectedPeriods] = React.useState<IPeriode[]>(soknad.trekkKravPerioder || []);

    React.useEffect(() => {
        if (selectedPeriods.length === 0 && soknad.trekkKravPerioder && soknad.trekkKravPerioder.length > 0) {
            setSelectedPeriods(soknad.trekkKravPerioder);
        }
    }, [soknad.trekkKravPerioder]);

    if (!eksisterendePerioder || eksisterendePerioder.length === 0) {
        return null;
    }

    const begrunnelseForInnsendingFeilmelding = () =>
        getErrorMessage('begrunnelseForInnsending')
            ? intlHelper(intl, 'skjema.felt.endringAvSøknadsperioder.begrunnelse.feilmelding')
            : null;

    const getAlertstriper = () => {
        const komplettePerioder = selectedPeriods.filter((periode) => periode.fom && periode.tom);
        if (komplettePerioder.length === 0) {
            return null;
        }

        const formaterteEksisterendePerioder = slåSammenSammenhengendePerioder(
            eksisterendePerioder.map((periode) => new Periode(periode))
        );

        const hasPeriodeSomSkalFjernesIStartenAvSøknadsperiode = komplettePerioder.some((periode) =>
            formaterteEksisterendePerioder.some((eksisterendePeriode) => periode.fom === eksisterendePeriode.fom)
        );
        const hasPeriodeSomSkalFjernesIMidtenAvSøknadsperiode = komplettePerioder.some((periode) =>
            formaterteEksisterendePerioder.some(
                (eksisterendePeriode) =>
                    initializeDate(periode.fom).isAfter(initializeDate(eksisterendePeriode.fom)) &&
                    initializeDate(periode.tom).isBefore(initializeDate(eksisterendePeriode.tom))
            )
        );
        const hasPeriodeSomSkalFjernesISluttenAvSøknadsperiode = komplettePerioder.some((periode) =>
            formaterteEksisterendePerioder.some((eksisterendePeriode) => periode.tom === eksisterendePeriode.tom)
        );

        const begrunnelsesfelt = (
            <div className="endringAvSøknadsperioder__begrunnelse">
                <Textarea
                    label={intlHelper(intl, 'skjema.felt.endringAvSøknadsperioder.begrunnelse')}
                    value={soknad.begrunnelseForInnsending?.tekst || ''}
                    onChange={(event) => {
                        const { value } = event.target;
                        updateSoknad({ begrunnelseForInnsending: { tekst: value } });
                        updateSoknadState({ begrunnelseForInnsending: { tekst: value } }, false);
                    }}
                    onBlur={(event) => {
                        const { value } = event.target;
                        updateSoknad({ begrunnelseForInnsending: { tekst: value } });
                    }}
                    feil={begrunnelseForInnsendingFeilmelding()}
                />
            </div>
        );

        return (
            <>
                {hasPeriodeSomSkalFjernesIStartenAvSøknadsperiode && (
                    <CustomAlertstripeAdvarsel>
                        Du vil fjerne en periode i <b>starten</b> av eksisterende søknadsperiode. Dette vil føre til
                        nytt skjæringstidspunkt i behandlingen, og vil endre tidspunktet vi regner rett til ytelse fra.
                        Utfallet i behandlingen kan bli avslag selv om det tidligere var innvilget.
                        {!hasPeriodeSomSkalFjernesIMidtenAvSøknadsperiode &&
                            !hasPeriodeSomSkalFjernesISluttenAvSøknadsperiode &&
                            begrunnelsesfelt}
                    </CustomAlertstripeAdvarsel>
                )}
                {hasPeriodeSomSkalFjernesIMidtenAvSøknadsperiode && (
                    <CustomAlertstripeAdvarsel>
                        Du vil fjerne en periode i <b>midten</b> av en eksisterende søknadsperiode. Dette vil føre til
                        nye skjæringstidspunkt i behandlingen, og vi vil regne rett til ytelse fra flere ulike
                        tidspunkt. Utfallet i behandlingen kan bli avslag for en eller flere perioder som tidligere var
                        innvilget.
                        {!hasPeriodeSomSkalFjernesISluttenAvSøknadsperiode && begrunnelsesfelt}
                    </CustomAlertstripeAdvarsel>
                )}
                {hasPeriodeSomSkalFjernesISluttenAvSøknadsperiode && (
                    <AlertStripeInfo className="endringAvSøknadsperioder__alert">
                        Du vil fjerne en periode i <b>slutten</b> av en eksisterende søknadsperiode. Vilkår for perioden
                        du fjerner vil ikke bli vurdert. Dette vil ikke påvirke resultatet i saken for andre perioder
                        enn den du fjerner.
                        {begrunnelsesfelt}
                    </AlertStripeInfo>
                )}
            </>
        );
    };

    return (
        <EkspanderbartpanelBase
            apen={isOpen}
            className="endringAvSøknadsperioder"
            tittel={intlHelper(intl, 'skjema.endringAvSøknadsperioder')}
            onClick={onClick}
        >
            <Element>
                Hvilken periode vil du <span className="endringAvSøknadsperioder__underscore">fjerne</span>?
            </Element>
            <Periodepaneler
                intl={intl}
                periods={soknad.trekkKravPerioder || []}
                panelid={(i) => `endringAvSøknadsperioder_${i}`}
                initialPeriode={{ fom: '', tom: '' }}
                editSoknad={(perioder) => updateSoknad({ trekkKravPerioder: perioder })}
                editSoknadState={(perioder, showStatus) => {
                    updateSoknadState({ trekkKravPerioder: perioder }, showStatus);
                    setSelectedPeriods(perioder);
                }}
                textLeggTil="skjema.perioder.legg_til"
                textFjern="skjema.perioder.fjern"
                getErrorMessage={getErrorMessage}
                feilkodeprefiks="endringAvSøknadsperioder"
                kanHaFlere
            />

            {getAlertstriper()}
            <Feilmelding className="endringAvSøknadsperioder__feilmelding" aria-hidden="true">
                {begrunnelseForInnsendingFeilmelding()}
            </Feilmelding>
        </EkspanderbartpanelBase>
    );
};
export default EndringAvSøknadsperioder;
