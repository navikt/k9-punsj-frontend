import classNames from 'classnames';
import React from 'react';
import { useIntl } from 'react-intl';

import { IPeriode } from 'app/models/types';
import { initializeDate } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';

import { KorrigeringAvInntektsmeldingFormValues } from './KorrigeringAvInntektsmeldingFormFieldsValues';
import './omsKvittering.less';

const formaterPerioder = (periode: IPeriode) => {
    const fom = initializeDate(periode.fom).format('DD.MM.YYYY');
    const tom = initializeDate(periode.tom).format('DD.MM.YYYY');
    return `${fom} - ${tom}`;
};

interface OMSKvitteringProps {
    feltverdier: KorrigeringAvInntektsmeldingFormValues;
}

const OMSKvittering: React.FC<OMSKvitteringProps> = ({ feltverdier }) => {
    const {
        Virksomhet,
        ArbeidsforholdId,
        Trekkperioder,
        PerioderMedRefusjonskrav,
        DagerMedDelvisFravær,
        OpplysningerOmKorrigering,
    } = feltverdier;
    const visTrekkperioder = () => Trekkperioder.length > 0 && Trekkperioder[0].fom;
    const visPerioderMedRefusjonskrav = () => PerioderMedRefusjonskrav.length > 0 && PerioderMedRefusjonskrav[0].fom;
    const visDagerMedDelvisFravær = () => DagerMedDelvisFravær.length > 0 && DagerMedDelvisFravær[0].dato;
    const intl = useIntl();
    return (
        <div className="omsKvittering">
            <h2>{intlHelper(intl, 'skjema.kvittering.oppsummering')}</h2>
            <h3>{intlHelper(intl, 'skjema.opplysningeromkorrigering')}</h3>
            <hr className={classNames('linje')} />
            <p>
                <b>{`${intlHelper(intl, 'skjema.mottakelsesdato')} `}</b>
                {initializeDate(OpplysningerOmKorrigering.dato).format('DD.MM.YYYY')}
            </p>
            <h3>Virksomhet</h3>
            <hr className={classNames('linje')} />
            <p>
                <b>{`Organisasjonsnummer: `}</b>
                {Virksomhet}
            </p>
            {ArbeidsforholdId && (
                <>
                    <h3>ArbeidsforholdId</h3>
                    <hr className={classNames('linje')} />
                    <p>{ArbeidsforholdId}</p>
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
                            formaterPerioder(periodeMedRefusjonskrav),
                        ).join(', ')}
                    </p>
                </>
            )}
            {visDagerMedDelvisFravær() && (
                <>
                    <h3>Refusjon av dag skal endres til timer</h3>
                    <hr className={classNames('linje')} />
                    <p>
                        {DagerMedDelvisFravær.filter(
                            (dagMedDelvisFravær) => dagMedDelvisFravær.dato && dagMedDelvisFravær.timer,
                        )
                            .map((dagMedDelvisFravær) => {
                                const dag = initializeDate(dagMedDelvisFravær.dato).format('DD.MM.YYYY');
                                return `${dag} - ${dagMedDelvisFravær.timer} timer`;
                            })
                            .join(', ')}
                    </p>
                </>
            )}
        </div>
    );
};

export default OMSKvittering;
