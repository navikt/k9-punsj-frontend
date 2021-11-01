import { IPeriode } from 'app/models/types';
import { submitOMSSoknad } from 'app/state/actions/OMSPunchFormActions';
import intlHelper from 'app/utils/intlUtils';
import classNames from 'classnames';
import { Hovedknapp } from 'nav-frontend-knapper';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { initializeDate } from '../../../utils/timeUtils';
import './bekreftInnsendingModal.less';
import { KorrigeringAvInntektsmeldingFormValues } from './KorrigeringAvInntektsmeldingFormFieldsValues';

const formaterPerioder = (periode: IPeriode) => {
    const fom = initializeDate(periode.fom).format('DD.MM.YYYY');
    const tom = initializeDate(periode.tom).format('DD.MM.YYYY');
    return `${fom} - ${tom}`;
};

interface BekreftInnsendingModalProps {
    feltverdier: KorrigeringAvInntektsmeldingFormValues;
    søkerId: string;
    søknadId: string;
    lukkModal: () => void;
}

const BekreftInnsendingModal: React.FC<BekreftInnsendingModalProps> = ({
    feltverdier,
    søknadId,
    søkerId,
    lukkModal,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const { Virksomhet, ArbeidsforholdId, Trekkperioder, PerioderMedRefusjonskrav, DagerMedDelvisFravær } = feltverdier;
    const visTrekkperioder = () => Trekkperioder.length > 0 && Trekkperioder[0].fom;
    const visPerioderMedRefusjonskrav = () => PerioderMedRefusjonskrav.length > 0 && PerioderMedRefusjonskrav[0].fom;
    const visDagerMedDelvisFravær = () => DagerMedDelvisFravær.length > 0 && DagerMedDelvisFravær[0].dato;
    const intl = useIntl();

    const handleButtonClick = () => {
        setIsLoading(true);
        submitOMSSoknad(søkerId, søknadId, (response, responseData) => {
            switch (response.status) {
                case 202: {
                    setIsLoading(false);
                    lukkModal();
                    break;
                }
                case 400: {
                    console.log('400');
                    break;
                }
                case 409: {
                    console.log('409');
                    break;
                }
                default: {
                    console.log('default??');
                }
            }
        });
    };

    return (
        <div className="bekreftInnsendingModal">
            <h2>{intlHelper(intl, 'skjema.kvittering.oppsummering')}</h2>
            {Virksomhet && (
                <>
                    <h3>Virksomhet</h3>
                    <hr className={classNames('linje')} />
                    <p>{Virksomhet}</p>
                    {ArbeidsforholdId && (
                        <>
                            <h3>ArbeidsforholdId</h3>
                            <hr className={classNames('linje')} />
                            <p>{ArbeidsforholdId}</p>
                        </>
                    )}
                </>
            )}
            {visTrekkperioder() && (
                <>
                    <h3>Perioder arbeidsgiver ønsker å trekke krav om refusjon</h3>
                    <hr className={classNames('linje')} />
                    <p>{Trekkperioder.map((trekkperiode) => formaterPerioder(trekkperiode)).join(', ')}</p>
                </>
            )}
            {visPerioderMedRefusjonskrav() && (
                <>
                    <h3>Hele dager med fravær arbeidsgiver krever refusjon for </h3>
                    <hr className={classNames('linje')} />
                    <p>
                        {PerioderMedRefusjonskrav.map((periodeMedRefusjonskrav) =>
                            formaterPerioder(periodeMedRefusjonskrav)
                        ).join(', ')}
                    </p>
                </>
            )}
            {visDagerMedDelvisFravær() && (
                <>
                    <h3>Dager med delvis fravær arbeidsgiver krever refusjon for </h3>
                    <hr className={classNames('linje')} />
                    <p>
                        {DagerMedDelvisFravær.filter(
                            (dagMedDelvisFravær) => dagMedDelvisFravær.dato && dagMedDelvisFravær.timer
                        )
                            .map((dagMedDelvisFravær) => {
                                const dag = initializeDate(dagMedDelvisFravær.dato).format('DD.MM.YYYY');
                                return `${dag} - ${dagMedDelvisFravær.timer} timer`;
                            })
                            .join(', ')}
                    </p>
                </>
            )}
            <div className="korrigering__buttonContainer">
                <Hovedknapp onClick={handleButtonClick} disabled={isLoading}>
                    Send inn
                </Hovedknapp>
            </div>
        </div>
    );
};

export default BekreftInnsendingModal;
