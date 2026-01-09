import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Accordion, Alert, ErrorMessage, Label, Textarea } from '@navikt/ds-react';
import { initializeDate, getDatesInDateRange } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { formats } from 'app/utils/formatUtils';
import dayjs from 'dayjs';
import { IPSBSoknad, PSBSoknad } from '../../../../models/types/PSBSoknad';
import { IPeriode } from '../../../../models/types/Periode';
import { Periodepaneler } from '../../../../components/Periodepaneler';

import './endringAvSøknadsperioder.less';

interface Props {
    isOpen: boolean;
    onClick: () => void;
    getErrorMessage: (attribute: string, indeks?: number) => React.ReactNode;
    soknad: PSBSoknad;
    updateSoknad: (soknad: Partial<IPSBSoknad>) => void;
    updateSoknadState: (soknad: Partial<IPSBSoknad>, showStatus?: boolean) => void;
    eksisterendePerioder?: IPeriode[];
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

    const formatPeriodeForDisplay = (periode: IPeriode): string => {
        const fom = dayjs(periode.fom, formats.YYYYMMDD).format('DD.MM.YYYY');
        const tom = dayjs(periode.tom, formats.YYYYMMDD).format('DD.MM.YYYY');
        return `${fom} - ${tom}`;
    };

    const addPeriodeIfNotExists = (array: IPeriode[], periode: IPeriode): void => {
        const exists = array.some((p) => p.fom === periode.fom && p.tom === periode.tom);
        if (!exists) {
            array.push(periode);
        }
    };

    const checkOverlapType = (
        periodeToRemove: IPeriode,
        eksisterendePeriode: IPeriode,
    ): 'start' | 'middle' | 'end' | 'whole' | null => {
        // Get all dates from both periods
        const removeDates = getDatesInDateRange({
            fom: initializeDate(periodeToRemove.fom, formats.YYYYMMDD).toDate(),
            tom: initializeDate(periodeToRemove.tom, formats.YYYYMMDD).toDate(),
        });
        const eksisterendeDates = getDatesInDateRange({
            fom: initializeDate(eksisterendePeriode.fom, formats.YYYYMMDD).toDate(),
            tom: initializeDate(eksisterendePeriode.tom, formats.YYYYMMDD).toDate(),
        });

        // Find overlapping dates
        const overlappingDates = removeDates.filter((removeDate) =>
            eksisterendeDates.some((eksisterendeDate) => dayjs(removeDate).isSame(eksisterendeDate, 'day')),
        );

        if (overlappingDates.length === 0) {
            return null;
        }

        const eksisterendeStart = dayjs(eksisterendePeriode.fom, formats.YYYYMMDD);
        const eksisterendeEnd = dayjs(eksisterendePeriode.tom, formats.YYYYMMDD);
        const firstOverlap = dayjs(overlappingDates[0]);
        const lastOverlap = dayjs(overlappingDates[overlappingDates.length - 1]);

        // Check if overlap is in the middle (doesn't touch start or end)
        const touchesStart = firstOverlap.isSame(eksisterendeStart, 'day');
        const touchesEnd = lastOverlap.isSame(eksisterendeEnd, 'day');

        // If it touches both start and end, the entire period is being removed
        if (touchesStart && touchesEnd) {
            return 'whole';
        }
        if (!touchesStart && !touchesEnd) {
            return 'middle';
        }
        if (touchesStart && !touchesEnd) {
            return 'start';
        }
        if (!touchesStart && touchesEnd) {
            return 'end';
        }
        return null;
    };

    const getAlertstriper = () => {
        const komplettePerioder = selectedPeriods.filter((periode) => periode.fom && periode.tom);
        if (komplettePerioder.length === 0) {
            return null;
        }

        /*
         * Merk: Vi tillater trekk av periode som ikke finnes -- siden dette ikke gir noen negative konsekvenser,
         * Fra k9 format validator
         */

        const affectedByStart: IPeriode[] = [];
        const affectedByMiddle: IPeriode[] = [];
        const affectedByEnd: IPeriode[] = [];
        const completelyRemoved: IPeriode[] = [];

        komplettePerioder.forEach((periodeToRemove) => {
            eksisterendePerioder.forEach((eksisterendePeriode) => {
                const overlapType = checkOverlapType(periodeToRemove, eksisterendePeriode);
                if (overlapType === 'whole') {
                    addPeriodeIfNotExists(completelyRemoved, eksisterendePeriode);
                } else if (overlapType === 'start') {
                    addPeriodeIfNotExists(affectedByStart, eksisterendePeriode);
                } else if (overlapType === 'middle') {
                    addPeriodeIfNotExists(affectedByMiddle, eksisterendePeriode);
                } else if (overlapType === 'end') {
                    addPeriodeIfNotExists(affectedByEnd, eksisterendePeriode);
                }
            });
        });

        const hasCompletelyRemovedPeriods = completelyRemoved.length > 0;
        const hasPeriodeSomSkalFjernesIStartenAvSøknadsperiode = affectedByStart.length > 0;
        const hasPeriodeSomSkalFjernesIMidtenAvSøknadsperiode = affectedByMiddle.length > 0;
        const hasPeriodeSomSkalFjernesISluttenAvSøknadsperiode = affectedByEnd.length > 0;

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
            className="endringAvSøknadsperioder"
            onOpenChange={onClick}
            data-testid="accordionItem-endringAvSøknadsperioderpanel"
        >
            <Accordion.Header>Endre/fjerne søknadsperiode</Accordion.Header>

            <Accordion.Content>
                <Label size="small">
                    Hvilken periode vil du <span className="endringAvSøknadsperioder__underscore">fjerne</span>?
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
