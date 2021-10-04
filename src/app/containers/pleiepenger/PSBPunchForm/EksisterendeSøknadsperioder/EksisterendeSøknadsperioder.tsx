import { initializeDate } from 'app/utils';
import { AlertStripeAdvarsel, AlertStripeInfo } from 'nav-frontend-alertstriper';
import { EkspanderbartpanelBase } from 'nav-frontend-ekspanderbartpanel';
import { CheckboksPanel } from 'nav-frontend-skjema';
import { Element } from 'nav-frontend-typografi';
import * as React from 'react';
import { IntlShape } from 'react-intl';
import { IPeriode } from '../../../../models/types/Periode';
import { IPSBSoknad, PSBSoknad } from '../../../../models/types/PSBSoknad';
import { Periodepaneler } from '../../Periodepaneler';
import './eksisterendeSøknadsperioder.less';

interface EksisterendeSøknadsperioderProps {
    isOpen: boolean;
    onClick: () => void;
    intl: IntlShape;
    getErrorMessage: (attribute: string, indeks?: number) => React.ReactNode;
    soknad: PSBSoknad;
    updateSoknad: (soknad: Partial<IPSBSoknad>) => void;
    updateSoknadState: (soknad: Partial<IPSBSoknad>, showStatus?: boolean) => void;
    eksisterendePerioder?: IPeriode[];
}

const EksisterendeSøknadsperioder = (props: EksisterendeSøknadsperioderProps): JSX.Element | null => {
    const { isOpen, onClick, intl, getErrorMessage, soknad, updateSoknad, updateSoknadState, eksisterendePerioder } =
        props;
    const [selectedPeriods, setSelectedPeriods] = React.useState<IPeriode[]>(soknad.trekkKravPerioder || []);
    const [skalTrekkePerioder, setSkalTrekkePerioder] = React.useState(false);

    React.useEffect(() => {
        if (selectedPeriods.length === 0 && soknad.trekkKravPerioder && soknad.trekkKravPerioder.length > 0) {
            setSelectedPeriods(soknad.trekkKravPerioder);
        }
    }, [soknad.trekkKravPerioder]);

    if (!eksisterendePerioder || eksisterendePerioder.length === 0) {
        return null;
    }

    const getAlertstriper = () => {
        const hasPeriodeSomSkalFjernesIStartenAvSøknadsperiode = selectedPeriods.some((periode) =>
            eksisterendePerioder.some((eksisterendePeriode) => periode.fom === eksisterendePeriode.fom)
        );
        const hasPeriodeSomSkalFjernesIMidtenAvSøknadsperiode = selectedPeriods.some((periode) =>
            eksisterendePerioder.some(
                (eksisterendePeriode) =>
                    initializeDate(periode.fom).isAfter(initializeDate(eksisterendePeriode.fom)) &&
                    initializeDate(periode.tom).isBefore(initializeDate(eksisterendePeriode.tom))
            )
        );
        const hasPeriodeSomSkalFjernesISluttenAvSøknadsperiode = selectedPeriods.some((periode) =>
            eksisterendePerioder.some((eksisterendePeriode) => periode.tom === eksisterendePeriode.tom)
        );

        return (
            <>
                {hasPeriodeSomSkalFjernesIStartenAvSøknadsperiode && (
                    <AlertStripeAdvarsel className="eksisterendeSøknadsperioder__alert">
                        Du vil fjerne en periode i starten av eksisterende søknadsperiode. Dette vil føre til nytt
                        skjæringstidspunkt i behandlingen, og vil endre tidspunktet vi regner rett til ytelse fra.
                        Utfallet i behandlingen kan bli avslag selv om det tidligere var innvilget.
                    </AlertStripeAdvarsel>
                )}
                {hasPeriodeSomSkalFjernesIMidtenAvSøknadsperiode && (
                    <AlertStripeAdvarsel className="eksisterendeSøknadsperioder__alert">
                        Du vil fjerne en periode i midten av en eksisterende søknadsperiode. Dette vil føre til nye
                        skjæringstidspunkt i behandlingen, og vi vil regne rett til ytelse fra flere ulike tidspunkt.
                        Utfallet i behandlingen kan bli avslag for en eller flere perioder som tidligere var innvilget.
                    </AlertStripeAdvarsel>
                )}
                {hasPeriodeSomSkalFjernesISluttenAvSøknadsperiode && (
                    <AlertStripeInfo className="eksisterendeSøknadsperioder__alert">
                        Du vil fjerne en periode i slutten av en eksisterende søknadsperiode. Vi vil ikke vurdere vilkår
                        for perioden du fjerner. Dette vil ikke påvirke resultatet i saken for andre perioder enn den du
                        fjerner.
                    </AlertStripeInfo>
                )}
            </>
        );
    };
    return (
        <EkspanderbartpanelBase
            apen={isOpen}
            className="eksisterendeSøknadsperioder"
            tittel="Endring av søknadsperiode"
            onClick={onClick}
        >
            <Element>
                Hvilken periode vil du <span className="eksisterendeSøknadsperioder__underscore">fjerne</span>?
            </Element>
            <Periodepaneler
                intl={intl}
                periods={soknad.trekkKravPerioder || []}
                panelid={(i) => `eksisterendeSøknadsperioder_${i}`}
                initialPeriode={{ fom: '', tom: '' }}
                editSoknad={(perioder) => updateSoknad({ trekkKravPerioder: skalTrekkePerioder ? perioder : [] })}
                editSoknadState={(perioder, showStatus) => {
                    updateSoknadState({ trekkKravPerioder: perioder }, showStatus);
                    setSelectedPeriods(perioder);
                }}
                textLeggTil="skjema.perioder.legg_til"
                textFjern="skjema.perioder.fjern"
                getErrorMessage={getErrorMessage}
                feilkodeprefiks="eksisterendeSøknadsperioder"
                kanHaFlere
            />

            {getAlertstriper()}
            <div className="eksisterendeSøknadsperioder__checkbox">
                <CheckboksPanel
                    id="fjernsoknadsperiodecheckbox"
                    label="Bekreft at søknadsperioden skal fjernes"
                    checked={soknad.skalTrekkePerioder}
                    onChange={(e) => {
                        const isChecked = e.target.checked;
                        setSkalTrekkePerioder(isChecked);
                        updateSoknad({ trekkKravPerioder: isChecked ? selectedPeriods : [] });
                        updateSoknadState({ skalTrekkePerioder: isChecked, trekkKravPerioder: selectedPeriods }, true);
                    }}
                />
            </div>
        </EkspanderbartpanelBase>
    );
};
export default EksisterendeSøknadsperioder;
