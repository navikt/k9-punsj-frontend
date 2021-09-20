import { AlertStripeAdvarsel, AlertStripeInfo } from 'nav-frontend-alertstriper';
import { EkspanderbartpanelBase } from 'nav-frontend-ekspanderbartpanel';
import { Element } from 'nav-frontend-typografi';
import * as React from 'react';
import { IntlShape } from 'react-intl';
import { IPSBSoknad, PSBSoknad } from '../../../../models/types/PSBSoknad';
import { Periodepaneler } from '../../Periodepaneler';
import './eksisterendeSøknadsperioder.less';
import { CheckboksPanel } from 'nav-frontend-skjema';

interface EksisterendeSøknadsperioderProps {
    isOpen: boolean;
    onClick: () => void;
    intl: IntlShape;
    getErrorMessage: (attribute: string, indeks?: number) => React.ReactNode;
    soknad: PSBSoknad;
    updateSoknad: (soknad: Partial<IPSBSoknad>) => void;
}

const EksisterendeSøknadsperioder = (props: EksisterendeSøknadsperioderProps): JSX.Element | null => {
    const { isOpen, onClick, intl, getErrorMessage, soknad, updateSoknad } = props;
    if (!soknad.soeknadsperiode) {
        return null;
    }
    return (
        <EkspanderbartpanelBase
            apen={isOpen}
            className="eksisterendeSøknadsperioder"
            tittel="Eksisterende søknadsperioder"
            onClick={onClick}
        >
            <Element>
                Hvilken periode vil du <span className="eksisterendeSøknadsperioder__underscore">fjerne</span>?
            </Element>
            <Periodepaneler
                intl={intl}
                periods={[soknad.soeknadsperiode]}
                panelid={(i) => `eksisterendeSøknadsperioder_${i}`}
                initialPeriode={soknad.soeknadsperiode}
                editSoknad={(perioder) => updateSoknad({ soeknadsperiode: perioder[0] })}
                editSoknadState={(perioder, showStatus) => null}
                textLeggTil="skjema.perioder.legg_til"
                textFjern="skjema.perioder.fjern"
                className="utenlandsopphold"
                panelClassName="utenlandsoppholdpanel"
                getErrorMessage={getErrorMessage}
                feilkodeprefiks="eksisterendeSøknadsperioder"
                kanHaFlere={false}
                hideDeleteButton
            />
            <AlertStripeAdvarsel className="eksisterendeSøknadsperioder__alert">
                Du vil fjerne en periode i starten av eksisterende søknadsperiode. Dette vil føre til nytt
                skjæringstidspunkt i behandlingen, og vil endre tidspunktet vi regner rett til ytelse fra. Utfallet i
                behandlingen kan bli avslag selv om det tidligere var innvilget.
            </AlertStripeAdvarsel>
            <AlertStripeAdvarsel className="eksisterendeSøknadsperioder__alert">
                Du vil fjerne en periode i midten av en eksisterende søknadsperiode. Dette vil føre til nye
                skjæringstidspunkt i behandlingen, og vi vil regne rett til ytelse fra flere ulike tidspunkt. Utfallet i
                behandlingen kan bli avslag for en eller flere perioder som tidligere var innvilget.
            </AlertStripeAdvarsel>
            <AlertStripeInfo className="eksisterendeSøknadsperioder__alert">
                Du vil fjerne en periode i slutten av en eksisterende søknadsperiode. Vi vil ikke vurdere vilkår for
                perioden du fjerner. Dette vil ikke påvirke resultatet i saken for andre perioder enn den du fjerner.
            </AlertStripeInfo>
            <div className="eksisterendeSøknadsperioder__checkbox">
                <CheckboksPanel
                    label="Bekreft at søknadsperioden skal fjernes"
                    value="skjema.søknadsperiode.fjern"
                    onChange={(e) => null}
                />
            </div>
        </EkspanderbartpanelBase>
    );
};
export default EksisterendeSøknadsperioder;
