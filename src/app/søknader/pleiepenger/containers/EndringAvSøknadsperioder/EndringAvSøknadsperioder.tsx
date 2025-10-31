import React, { useEffect } from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { Accordion, Alert, ErrorMessage, Label, Textarea } from '@navikt/ds-react';

import { Periodepaneler } from '../../../../components/Periodepaneler';
import { IPSBSoknad, PSBSoknad } from '../../../../models/types/PSBSoknad';
import { IPeriode, Periode } from '../../../../models/types/Periode';
import { initializeDate, slåSammenSammenhengendePerioder } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';

import './endringAvSøknadsperioder.less';

interface Props {
    isOpen: boolean;
    soknad: PSBSoknad;
    eksisterendePerioder?: IPeriode[];
    onClick: () => void;
    getErrorMessage: (attribute: string, indeks?: number) => React.ReactNode;
    updateSoknad: (soknad: Partial<IPSBSoknad>) => void;
    updateSoknadState: (soknad: Partial<IPSBSoknad>, showStatus?: boolean) => void;
}

const EndringAvSøknadsperioder = (props: Props) => {
    const intl = useIntl();

    const { isOpen, onClick, getErrorMessage, soknad, updateSoknad, updateSoknadState, eksisterendePerioder } = props;
    const [selectedPeriods, setSelectedPeriods] = React.useState<IPeriode[]>(soknad.trekkKravPerioder || []);

    useEffect(() => {
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

    const alleTrekkKravPerioderFeilmelding = () => getErrorMessage('alleTrekkKravPerioderFeilmelding') || null;

    const getAlertstriper = () => {
        const komplettePerioder = selectedPeriods.filter((periode) => periode.fom && periode.tom);
        if (komplettePerioder.length === 0) {
            return null;
        }

        const formaterteEksisterendePerioder = slåSammenSammenhengendePerioder(
            eksisterendePerioder.map((periode) => new Periode(periode)),
        );

        // Finn minste fom og største tom fra alle eksisterende perioder
        const minEksisterendeFom = formaterteEksisterendePerioder.reduce(
            (min, periode) => {
                const periodeFom = initializeDate(periode.fom);
                return !min || periodeFom.isBefore(min) ? periodeFom : min;
            },
            null as ReturnType<typeof initializeDate> | null,
        );

        const maxEksisterendeTom = formaterteEksisterendePerioder.reduce(
            (max, periode) => {
                const periodeTom = initializeDate(periode.tom);
                return !max || periodeTom.isAfter(max) ? periodeTom : max;
            },
            null as ReturnType<typeof initializeDate> | null,
        );

        // Sjekk om noen perioder går utenfor grensene
        const hasPeriodeUtenforGrenser = komplettePerioder.some((periode) => {
            const periodeFom = initializeDate(periode.fom);
            const periodeTom = initializeDate(periode.tom);
            return (
                (minEksisterendeFom && periodeFom.isBefore(minEksisterendeFom)) ||
                (maxEksisterendeTom && periodeTom.isAfter(maxEksisterendeTom))
            );
        });

        /*
         * Merk: Vi tillater trekk av periode som ikke finnes -- siden dette ikke gir noen negative konsekvenser,
         * Fra k9 format validator
         */

        const hasPeriodeSomSkalFjernesIStartenAvSøknadsperiode = komplettePerioder.some((periode) =>
            formaterteEksisterendePerioder.some((eksisterendePeriode) =>
                initializeDate(periode.fom).isSameOrBefore(initializeDate(eksisterendePeriode.fom)),
            ),
        );
        const hasPeriodeSomSkalFjernesIMidtenAvSøknadsperiode = komplettePerioder.some((periode) =>
            formaterteEksisterendePerioder.some(
                (eksisterendePeriode) =>
                    initializeDate(periode.fom).isAfter(initializeDate(eksisterendePeriode.fom)) &&
                    initializeDate(periode.tom).isBefore(initializeDate(eksisterendePeriode.tom)),
            ),
        );
        const hasPeriodeSomSkalFjernesISluttenAvSøknadsperiode = komplettePerioder.some((periode) =>
            formaterteEksisterendePerioder.some((eksisterendePeriode) =>
                initializeDate(periode.tom).isSameOrAfter(initializeDate(eksisterendePeriode.tom)),
            ),
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
                    error={begrunnelseForInnsendingFeilmelding()}
                />
            </div>
        );

        return (
            <>
                {hasPeriodeUtenforGrenser && (
                    <Alert size="small" variant="warning" className="mt-6">
                        <FormattedMessage id="skjema.felt.endringAvSøknadsperioder.alert.utenforGrenser" />
                    </Alert>
                )}
                {hasPeriodeSomSkalFjernesIStartenAvSøknadsperiode && (
                    <Alert size="small" variant="warning" className="mt-6">
                        <FormattedMessage
                            id="skjema.felt.endringAvSøknadsperioder.alert.iStarten"
                            values={{
                                b: (chunks) => <b>{chunks}</b>,
                            }}
                        />
                        {!hasPeriodeSomSkalFjernesIMidtenAvSøknadsperiode &&
                            !hasPeriodeSomSkalFjernesISluttenAvSøknadsperiode &&
                            begrunnelsesfelt}
                    </Alert>
                )}
                {hasPeriodeSomSkalFjernesIMidtenAvSøknadsperiode && (
                    <Alert size="small" variant="warning" className="mt-6">
                        <FormattedMessage
                            id="skjema.felt.endringAvSøknadsperioder.alert.iMidten"
                            values={{
                                b: (chunks) => <b>{chunks}</b>,
                            }}
                        />
                        {!hasPeriodeSomSkalFjernesISluttenAvSøknadsperiode && begrunnelsesfelt}
                    </Alert>
                )}
                {hasPeriodeSomSkalFjernesISluttenAvSøknadsperiode && (
                    <Alert size="small" variant="info" className="mt-6">
                        <FormattedMessage
                            id="skjema.felt.endringAvSøknadsperioder.alert.iSlutten"
                            values={{
                                b: (chunks) => <b>{chunks}</b>,
                            }}
                        />
                        {begrunnelsesfelt}
                    </Alert>
                )}
            </>
        );
    };

    return (
        <Accordion.Item
            open={isOpen}
            className="endringAvSøknadsperioder"
            onOpenChange={onClick}
            data-testid="accordionItem-endringAvSøknadsperioderpanel"
        >
            <Accordion.Header>
                <FormattedMessage id="skjema.endringAvSøknadsperioder" />
            </Accordion.Header>

            <Accordion.Content>
                <Label size="small">
                    <FormattedMessage
                        id="skjema.felt.endringAvSøknadsperioder.spørsmålHvilkenPeriode"
                        values={{
                            u: (chunks) => <span className="endringAvSøknadsperioder__underscore">{chunks}</span>,
                        }}
                    />
                </Label>

                <Periodepaneler
                    periods={soknad.trekkKravPerioder || []}
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
                <ErrorMessage size="small" className="endringAvSøknadsperioder__feilmelding" aria-hidden="true">
                    {alleTrekkKravPerioderFeilmelding()}
                </ErrorMessage>

                {getAlertstriper()}

                <ErrorMessage size="small" className="endringAvSøknadsperioder__feilmelding" aria-hidden="true">
                    {begrunnelseForInnsendingFeilmelding()}
                </ErrorMessage>
            </Accordion.Content>
        </Accordion.Item>
    );
};
export default EndringAvSøknadsperioder;
