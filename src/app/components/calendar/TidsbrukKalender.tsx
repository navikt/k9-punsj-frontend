import dayjs from 'dayjs';
import { uniq } from 'lodash';
import EkspanderbartPanel from 'nav-frontend-ekspanderbartpanel';
import React, { forwardRef, useEffect, useState } from 'react';

import { BodyShort, Button, Modal, Provider } from '@navikt/ds-react';

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

export const TidsbrukKalender: React.FunctionComponent<OwnProps> = forwardRef(
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

        useOnClickOutside(ref, clearSelectedDates);
        const toggleKalender = () => {
            setVisKalender(!visKalender);
            if (selectedDates.length) {
                setSelectedDates([]);
            }
        };
        const toggleModal = () => setVisModal(!visModal);
        const datoerIGyldigePerioder = gyldigePerioder.flatMap((gyldigPeriode) => getDatesInDateRange(gyldigPeriode));
        const disabledDates = getDatesInMonth(gyldigePerioder[0].fom)
            .map((date) => {
                if (!isDateInDates(date, datoerIGyldigePerioder) || (disableWeekends && isWeekend(date))) {
                    return date;
                }

                return false;
            })
            .filter((v) => v instanceof Date) as Date[];
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
        const kalenderdagerIGyldigePerioder = kalenderdager
            ?.map((kalenderdag) => kalenderdag.date)
            .map((date) => isDateInDates(date, datoerIGyldigePerioder))
            .filter(Boolean);
        const kanRegistrereTid = !!selectedDates.length && !hasSelectedDisabledDate && !someSelectedDaysHaveContent;
        const kanSletteTid = selectedDates.length > 0 && someSelectedDaysHaveContent;
        const tittel = (
            <>
                {tittelRenderer(gyldigePerioder[0].fom)}
                {kalenderdagerIGyldigePerioder?.length ? (
                    <BodyShort>{`${kalenderdagerIGyldigePerioder?.length} dager registrert`}</BodyShort>
                ) : (
                    <BodyShort>Ingen dager registrert</BodyShort>
                )}
            </>
        );
        return (
            <EkspanderbartPanel tittel={tittel} apen={visKalender} onClick={toggleKalender}>
                <div>
                    <CalendarGrid
                        onDateClick={(date) => (shiftKeydown ? selectRange(date) : toggleDay(date))}
                        month={gyldigePerioder[0]}
                        disabledDates={disabledDates as Date[]}
                        disableWeekends={disableWeekends}
                        dateContentRenderer={dateContentRenderer}
                        selectedDates={selectedDates}
                    />
                    <div style={{ marginTop: '1.875rem' }}>
                        {!!kanRegistrereTid && (
                            <Button variant="primary" onClick={toggleModal}>
                                Registrer tid
                            </Button>
                        )}
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
                            className="venstrestilt registrer-tid-modal"
                            open={visModal}
                            onClose={toggleModal}
                            closeButton
                        >
                            <Modal.Content>
                                {React.cloneElement(ModalContent, { selectedDates, toggleModal })}
                            </Modal.Content>
                        </Modal>
                    </Provider>
                </div>
            </EkspanderbartPanel>
        );
    },
);

export default TidsbrukKalender;
