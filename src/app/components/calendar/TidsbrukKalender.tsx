import dayjs from 'dayjs';
import { uniq } from 'lodash';
import React, { forwardRef, useEffect, useMemo, useState } from 'react';

import { BodyShort, Button, ExpansionCard, Heading, Label, Modal, Provider } from '@navikt/ds-react';

import useOnClickOutside from 'app/hooks/useOnClickOutside';
import { KalenderDag } from 'app/models/KalenderDag';
import { formats, getDatesInDateRange, getDatesInMonth, getMonthAndYear, isDateInDates, isWeekend } from 'app/utils';

import DateRange from '../../models/types/DateRange';
import Slett from '../buttons/Slett';
import CalendarGrid from './CalendarGrid';
import './tidsbrukKalender.less';

interface OwnProps {
    gyldigePerioder: DateRange[];
    ModalContent: React.ReactElement;
    slettPeriode: (dates?: Date[]) => void;
    disableWeekends?: boolean;
    dateContentRenderer: (date: Date, isDisabled?: boolean) => React.ReactNode;
    kalenderdager?: KalenderDag[];
    tittelRenderer?: () => string | React.FunctionComponent;
}

// eslint-disable-next-line react/display-name
export const TidsbrukKalender = forwardRef<HTMLDivElement, OwnProps>(
    (
        {
            gyldigePerioder,
            ModalContent,
            slettPeriode,
            dateContentRenderer,
            kalenderdager,
            disableWeekends = true,
            tittelRenderer = getMonthAndYear,
        },
        ref,
    ) => {
        const [shiftKeydown, setShiftKeydown] = useState(false);
        const [selectedDates, setSelectedDates] = useState<Date[]>([]);
        const [visKalender, setVisKalender] = useState<boolean>(false);
        const [visModal, setVisModal] = useState<boolean>(false);
        const [previouslySelectedDate, setPreviouslySelectedDate] = useState<Date | null>(null);
        useEffect(() => {
            const onKeyDown = (event: KeyboardEvent) => {
                if (event.key === 'Shift') {
                    setShiftKeydown(true);
                }
                if (event.key === 'Escape') {
                    setSelectedDates([]);
                }
            };
            const onKeyUp = (event: KeyboardEvent) => {
                if (event.key === 'Shift') {
                    setShiftKeydown(false);
                    setPreviouslySelectedDate(null);
                }
            };
            document.addEventListener('keydown', onKeyDown);
            document.addEventListener('keyup', onKeyUp);
            return () => {
                document.removeEventListener('keydown', onKeyDown);
                document.removeEventListener('keyup', onKeyUp);
            };
        }, []);

        const clearSelectedDates = () => {
            setSelectedDates([]);
        };

        const toggleKalender = () => {
            setVisKalender(!visKalender);
            if (selectedDates.length) {
                setSelectedDates([]);
            }
        };

        useOnClickOutside(ref, (event) => {
            if (visModal) {
                return;
            }
            if (!event?.target.closest('.exempt-from-click-outside, .ReactModal__Overlay')) {
                clearSelectedDates();
            }
        });

        const toggleModal = () => setVisModal(!visModal);

        const formatDate = (date: string | Date) => dayjs(date).format('YYYY-MM-DD');

        const datoerIGyldigePerioder = useMemo(
            () =>
                new Set(
                    gyldigePerioder.flatMap((gyldigPeriode) =>
                        Array.from(getDatesInDateRange(gyldigPeriode)).map(formatDate),
                    ),
                ),
            [gyldigePerioder],
        );
        const disabledDates = useMemo(() => {
            const datoer = gyldigePerioder.flatMap((gyldigPeriode) => getDatesInDateRange(gyldigPeriode));
            return getDatesInMonth(gyldigePerioder[0].fom)
                .map((date) => {
                    if (!isDateInDates(date, datoer) || (disableWeekends && isWeekend(date))) {
                        return date;
                    }
                    return false;
                })
                .filter((v) => v instanceof Date) as Date[];
        }, [gyldigePerioder, disableWeekends]);

        const toggleDay = (date: Date) => {
            if (selectedDates.some((v) => dayjs(v).isSame(date))) {
                setSelectedDates(selectedDates.filter((v) => !dayjs(v).isSame(date)));
            } else {
                setSelectedDates([...selectedDates, date]);
            }
            setPreviouslySelectedDate(date);
        };

        const selectDates = (dates: Date[]) => {
            setSelectedDates(
                uniq([...selectedDates, ...dates]).filter((date) =>
                    disabledDates.every((disabledDate) => !dayjs(disabledDate).isSame(date)),
                ),
            );
        };

        const selectRange = (date: Date): void => {
            if (!previouslySelectedDate) {
                toggleDay(date);
                return;
            }
            const dates = [previouslySelectedDate, date].sort((a, b) => a - b);
            selectDates(getDatesInDateRange({ fom: dates[0], tom: dates[1] }));
        };

        const someSelectedDaysHaveContent = kalenderdager
            ?.map((kalenderdag) => dayjs(kalenderdag.date).format(formats.DDMMYYYY))
            .some((date) =>
                selectedDates.map((selectedDate) => dayjs(selectedDate).format(formats.DDMMYYYY)).includes(date),
            );
        const hasSelectedDisabledDate = disabledDates
            .map((date) => dayjs(date).format(formats.DDMMYYYY))
            .some((date) =>
                selectedDates.map((selectedDate) => dayjs(selectedDate).format(formats.DDMMYYYY)).includes(date),
            );
        const kalenderdagerIGyldigePerioder = useMemo(
            () =>
                kalenderdager
                    ?.map((kalenderdag) => formatDate(kalenderdag.date))
                    .filter((date) => datoerIGyldigePerioder.has(date)),
            [kalenderdager, datoerIGyldigePerioder],
        );

        const kanRegistrereTid = !!selectedDates.length && !hasSelectedDisabledDate && !someSelectedDaysHaveContent;
        const kanSletteTid = selectedDates.length > 0 && someSelectedDaysHaveContent;

        const tittel = (
            <>
                <Heading size="xsmall">{tittelRenderer(gyldigePerioder[0].fom)}</Heading>
                {kalenderdagerIGyldigePerioder?.length ? (
                    <BodyShort>{`${kalenderdagerIGyldigePerioder?.length} dager registrert`}</BodyShort>
                ) : (
                    <BodyShort>Ingen dager registrert</BodyShort>
                )}
            </>
        );

        return (
            <ExpansionCard
                open={visKalender}
                onToggle={toggleKalender}
                aria-labelledby={gyldigePerioder[0].fom.toISOString()}
                ref={ref}
                className="mt-3"
            >
                <ExpansionCard.Header>
                    <Label>{tittel}</Label>
                </ExpansionCard.Header>
                <ExpansionCard.Content>
                    {visKalender && (
                        <div className="exempt-from-click-outside">
                            <CalendarGrid
                                onDateClick={(date) => (shiftKeydown ? selectRange(date) : toggleDay(date))}
                                month={gyldigePerioder[0]}
                                disabledDates={disabledDates as Date[]}
                                disableWeekends={disableWeekends}
                                dateContentRenderer={dateContentRenderer}
                                selectedDates={selectedDates}
                            />
                            <div style={{ marginTop: '1.875rem' }}>
                                <Button
                                    variant="primary"
                                    style={{ display: kanRegistrereTid ? 'inherit' : 'none' }}
                                    onClick={toggleModal}
                                >
                                    Registrer tid
                                </Button>
                                {kanSletteTid && (
                                    <Slett
                                        onClick={() => {
                                            slettPeriode(selectedDates);
                                            clearSelectedDates();
                                        }}
                                    >
                                        Slett registrert tid
                                    </Slett>
                                )}
                            </div>
                            <Provider rootElement={document.getElementById(ref?.current?.id) || undefined}>
                                <Modal
                                    className="venstrestilt registrer-tid-modal exempt-from-click-outside"
                                    open={visModal}
                                    onClose={() => {
                                        setVisModal(false);
                                        clearSelectedDates();
                                    }}
                                    aria-label="Modal"
                                >
                                    <Modal.Body>
                                        {React.cloneElement(ModalContent, {
                                            selectedDates,
                                            toggleModal,
                                            clearSelectedDates,
                                        })}
                                    </Modal.Body>
                                </Modal>
                            </Provider>
                        </div>
                    )}
                </ExpansionCard.Content>
            </ExpansionCard>
        );
    },
);

export default React.memo(TidsbrukKalender);
