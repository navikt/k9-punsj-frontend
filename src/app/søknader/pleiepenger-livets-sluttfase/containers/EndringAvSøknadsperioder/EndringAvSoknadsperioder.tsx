import React, { useEffect } from 'react';

import { FormattedMessage } from 'react-intl';
import { Accordion, Alert, ErrorMessage, Label, Textarea } from '@navikt/ds-react';

import { Periodepaneler } from 'app/components/Periodepaneler';
import { IPeriode, Periode } from '../../../../models/types';
import { IPLSSoknad, PLSSoknad } from '../../types/PLSSoknad';
import { initializeDate, slåSammenSammenhengendePerioder, checkPeriodsOutsideBounds } from 'app/utils';

interface Props {
    isOpen: boolean;
    soknad: PLSSoknad;
    eksisterendePerioder?: IPeriode[];
    onClick: () => void;
    getErrorMessage: (attribute: string, indeks?: number) => React.ReactNode;
    updateSoknad: (soknad: Partial<IPLSSoknad>) => void;
    updateSoknadState: (soknad: Partial<IPLSSoknad>, showStatus?: boolean) => void;
}

const EndringAvSoknadsperioder = (props: Props) => {
    const { isOpen, soknad, eksisterendePerioder, onClick, getErrorMessage, updateSoknad, updateSoknadState } = props;
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
        getErrorMessage('begrunnelseForInnsending') ? (
            <FormattedMessage id="skjema.felt.endringAvSøknadsperioder.begrunnelse.feilmelding" />
        ) : null;

    const getAlertstriper = () => {
        const komplettePerioder = selectedPeriods.filter((periode) => periode.fom && periode.tom);
        if (komplettePerioder.length === 0) {
            return null;
        }

        const formaterteEksisterendePerioder = slåSammenSammenhengendePerioder(
            eksisterendePerioder.map((periode) => new Periode(periode)),
        );

        // Sjekk om noen perioder går utenfor grensene
        const hasPeriodeUtenforGrenser = checkPeriodsOutsideBounds(komplettePerioder, formaterteEksisterendePerioder);

        const hasPeriodeSomSkalFjernesIStartenAvSøknadsperiode = komplettePerioder.some((periode) =>
            formaterteEksisterendePerioder.some((eksisterendePeriode) => periode.fom === eksisterendePeriode.fom),
        );
        const hasPeriodeSomSkalFjernesIMidtenAvSøknadsperiode = komplettePerioder.some((periode) =>
            formaterteEksisterendePerioder.some(
                (eksisterendePeriode) =>
                    initializeDate(periode.fom).isAfter(initializeDate(eksisterendePeriode.fom)) &&
                    initializeDate(periode.tom).isBefore(initializeDate(eksisterendePeriode.tom)),
            ),
        );
        const hasPeriodeSomSkalFjernesISluttenAvSøknadsperiode = komplettePerioder.some((periode) =>
            formaterteEksisterendePerioder.some((eksisterendePeriode) => periode.tom === eksisterendePeriode.tom),
        );

        const begrunnelsesfelt = (
            <div className="mt-4">
                <Textarea
                    label={<FormattedMessage id="skjema.felt.endringAvSøknadsperioder.begrunnelse" />}
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
        <Accordion.Item open={isOpen} onOpenChange={onClick} data-testid="accordionItem-endringAvSøknadsperioderPanel">
            <Accordion.Header>
                <FormattedMessage id="skjema.endringAvSøknadsperioder" />
            </Accordion.Header>

            <Accordion.Content>
                <Label size="small">
                    <FormattedMessage
                        id="skjema.felt.endringAvSøknadsperioder.spørsmålHvilkenPeriode"
                        values={{
                            u: (chunks) => <span className="underline">{chunks}</span>,
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

                {getAlertstriper()}

                <ErrorMessage size="small" className="mt-2 ml-4" aria-hidden="true">
                    {begrunnelseForInnsendingFeilmelding()}
                </ErrorMessage>
            </Accordion.Content>
        </Accordion.Item>
    );
};
export default EndringAvSoknadsperioder;
