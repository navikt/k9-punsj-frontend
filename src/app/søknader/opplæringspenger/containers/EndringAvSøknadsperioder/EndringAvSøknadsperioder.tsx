import React from 'react';

import { useFormikContext } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import { Accordion, Alert, ErrorMessage } from '@navikt/ds-react';
import CustomAlertstripeAdvarsel from 'app/components/customAlertstripeAdvarsel/CustomAlertstripeAdvarsel';
import TextAreaFormik from 'app/components/formikInput/TextAreaFormik';
import { OLPSoknad } from 'app/models/types/OLPSoknad';
import { IPeriode, Periode } from 'app/models/types/Periode';
import { initializeDate, slåSammenSammenhengendePerioder } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
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
        const komplettePerioder = values.trekkKravPerioder?.filter((periode) => periode.fom && periode.tom);
        if (komplettePerioder?.length === 0) {
            return null;
        }

        const formaterteEksisterendePerioder = slåSammenSammenhengendePerioder(
            eksisterendePerioder.map((periode) => new Periode(periode)),
        );

        const hasPeriodeSomSkalFjernesIStartenAvSøknadsperiode = komplettePerioder?.some((periode) =>
            formaterteEksisterendePerioder.some((eksisterendePeriode) => periode.fom === eksisterendePeriode.fom),
        );
        const hasPeriodeSomSkalFjernesIMidtenAvSøknadsperiode = komplettePerioder?.some((periode) =>
            formaterteEksisterendePerioder.some(
                (eksisterendePeriode) =>
                    initializeDate(periode.fom).isAfter(initializeDate(eksisterendePeriode.fom)) &&
                    initializeDate(periode.tom).isBefore(initializeDate(eksisterendePeriode.tom)),
            ),
        );
        const hasPeriodeSomSkalFjernesISluttenAvSøknadsperiode = komplettePerioder?.some((periode) =>
            formaterteEksisterendePerioder.some((eksisterendePeriode) => periode.tom === eksisterendePeriode.tom),
        );

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
                    <Alert size="small" variant="info" className="endringAvSøknadsperioder__alert">
                        Du vil fjerne en periode i <b>slutten</b> av en eksisterende søknadsperiode. Vilkår for perioden
                        du fjerner vil ikke bli vurdert. Dette vil ikke påvirke resultatet i saken for andre perioder
                        enn den du fjerner.
                        {begrunnelsesfelt}
                    </Alert>
                )}
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
            <Accordion.Header>
                <FormattedMessage id="skjema.endringAvSøknadsperioder" />
            </Accordion.Header>

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
