import React from 'react';

import { useFormikContext } from 'formik';
import { useIntl } from 'react-intl';
import { Accordion, Alert, ErrorMessage } from '@navikt/ds-react';
import TextAreaFormik from 'app/components/formikInput/TextAreaFormik';
import { OLPSoknad } from 'app/models/types/OLPSoknad';
import { IPeriode } from 'app/models/types/Periode';
import intlHelper from 'app/utils/intlUtils';
import { findPeriodOverlaps, formatPeriodeForDisplay } from 'app/utils/periodOverlapUtils';
import { Periodepaneler } from '../Periodepaneler';

import './endringAvSøknadsperioder.less';

interface EndringAvSøknadsperioderProps {
    isOpen: boolean;
    onClick: () => void;
    eksisterendePerioder?: IPeriode[];
}

const EndringAvSøknadsperioder = (props: EndringAvSøknadsperioderProps): JSX.Element | null => {
    const intl = useIntl();

    const { isOpen, onClick, eksisterendePerioder } = props;

    const { values, errors } = useFormikContext<OLPSoknad>();

    if (!eksisterendePerioder || eksisterendePerioder.length === 0) {
        return null;
    }

    const begrunnelseForInnsendingFeilmelding = () =>
        errors['begrunnelseForInnsending.tekst']
            ? intlHelper(intl, 'skjema.felt.endringAvSøknadsperioder.begrunnelse.feilmelding')
            : null;

    const getAlertstriper = () => {
        const { completelyRemoved, affectedByStart, affectedByMiddle, affectedByEnd } = findPeriodOverlaps(
            values.trekkKravPerioder || [],
            eksisterendePerioder,
        );

        const hasCompletelyRemovedPeriods = completelyRemoved.length > 0;
        const hasPeriodeSomSkalFjernesIStartenAvSøknadsperiode = affectedByStart.length > 0;
        const hasPeriodeSomSkalFjernesIMidtenAvSøknadsperiode = affectedByMiddle.length > 0;
        const hasPeriodeSomSkalFjernesISluttenAvSøknadsperiode = affectedByEnd.length > 0;

        if (
            !hasCompletelyRemovedPeriods &&
            !hasPeriodeSomSkalFjernesIStartenAvSøknadsperiode &&
            !hasPeriodeSomSkalFjernesIMidtenAvSøknadsperiode &&
            !hasPeriodeSomSkalFjernesISluttenAvSøknadsperiode
        ) {
            return null;
        }

        const begrunnelsesfelt = (
            <div className="endringAvSøknadsperioder__begrunnelse">
                <TextAreaFormik
                    label={intlHelper(intl, 'skjema.felt.endringAvSøknadsperioder.begrunnelse')}
                    name="begrunnelseForInnsending.tekst"
                    customErrorMessage={intlHelper(
                        intl,
                        'skjema.felt.endringAvSøknadsperioder.begrunnelse.feilmelding',
                    )}
                />
            </div>
        );

        const hasAnyAlerts =
            hasCompletelyRemovedPeriods ||
            hasPeriodeSomSkalFjernesIStartenAvSøknadsperiode ||
            hasPeriodeSomSkalFjernesIMidtenAvSøknadsperiode ||
            hasPeriodeSomSkalFjernesISluttenAvSøknadsperiode;

        return (
            <>
                {hasCompletelyRemovedPeriods && (
                    <Alert size="small" variant="warning" className="mt-2">
                        Du vil fjerne disse søknadsperiodene <b>helt</b>.
                        <div className="mt-2">
                            <b>Perioder som fjernes helt:</b>
                            <ul className="mt-1 mb-2">
                                {completelyRemoved.map((periode, index) => (
                                    <li key={index}>{formatPeriodeForDisplay(periode)}</li>
                                ))}
                            </ul>
                        </div>
                    </Alert>
                )}
                {hasPeriodeSomSkalFjernesIStartenAvSøknadsperiode && (
                    <Alert size="small" variant="warning" className="mt-2">
                        Du vil fjerne en periode i <b>starten</b> av eksisterende søknadsperiode. Dette vil føre til
                        nytt skjæringstidspunkt i behandlingen, og vil endre tidspunktet vi regner rett til ytelse fra.
                        Utfallet i behandlingen kan bli avslag selv om det tidligere var innvilget.
                        <div className="mt-2">
                            <b>Berørte perioder:</b>
                            <ul className="mt-1 mb-2">
                                {affectedByStart.map((periode, index) => (
                                    <li key={index}>{formatPeriodeForDisplay(periode)}</li>
                                ))}
                            </ul>
                        </div>
                    </Alert>
                )}
                {hasPeriodeSomSkalFjernesIMidtenAvSøknadsperiode && (
                    <Alert size="small" variant="warning" className="mt-2">
                        Du vil fjerne en periode i <b>midten</b> av en eksisterende søknadsperiode. Dette vil føre til
                        nye skjæringstidspunkt i behandlingen, og vi vil regne rett til ytelse fra flere ulike
                        tidspunkt. Utfallet i behandlingen kan bli avslag for en eller flere perioder som tidligere var
                        innvilget.
                        <div className="mt-2">
                            <b>Berørte perioder:</b>
                            <ul className="mt-1 mb-2">
                                {affectedByMiddle.map((periode, index) => (
                                    <li key={index}>{formatPeriodeForDisplay(periode)}</li>
                                ))}
                            </ul>
                        </div>
                    </Alert>
                )}
                {hasPeriodeSomSkalFjernesISluttenAvSøknadsperiode && (
                    <Alert size="small" variant="info" className="mt-2">
                        Du vil fjerne en periode i <b>slutten</b> av en eksisterende søknadsperiode. Vilkår for perioden
                        du fjerner vil ikke bli vurdert. Dette vil ikke påvirke resultatet i saken for andre perioder
                        enn den du fjerner.
                        <div className="mt-2">
                            <b>Berørte perioder:</b>
                            <ul className="mt-1 mb-2">
                                {affectedByEnd.map((periode, index) => (
                                    <li key={index}>{formatPeriodeForDisplay(periode)}</li>
                                ))}
                            </ul>
                        </div>
                    </Alert>
                )}
                {hasAnyAlerts && begrunnelsesfelt}
            </>
        );
    };

    return (
        <Accordion.Item
            open={isOpen}
            defaultOpen={isOpen}
            onOpenChange={onClick}
            data-test-id="accordionItem-endringAvSøknadsperioderPanel"
        >
            <Accordion.Header>Endre/fjerne søknadsperiode</Accordion.Header>

            <Accordion.Content>
                <Periodepaneler
                    periods={values.trekkKravPerioder || []}
                    fieldName="trekkKravPerioder"
                    kanHaFlere
                    label="Hvilke perioder vil du fjerne?"
                />

                {getAlertstriper()}

                <ErrorMessage size="small" className="endringAvSøknadsperioder__feilmelding" aria-hidden="true">
                    {begrunnelseForInnsendingFeilmelding()}
                </ErrorMessage>
            </Accordion.Content>
        </Accordion.Item>
    );
};
export default EndringAvSøknadsperioder;
