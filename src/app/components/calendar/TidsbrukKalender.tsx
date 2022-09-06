import React, { forwardRef, useState } from 'react';
import dayjs from 'dayjs';
import { Button, Modal } from '@navikt/ds-react';
import EkspanderbartPanel from 'nav-frontend-ekspanderbartpanel';
import useOnClickOutside from 'app/hooks/useOnClickOutside';
import { formats, getDatesInDateRange, getDatesInMonth, getMonthAndYear, isDateInDates } from 'app/utils';
import CalendarGrid from './CalendarGrid';
import './tidsbrukKalender.less';

import DateRange from '../../models/types/DateRange';
import Slett from '../buttons/Slett';

interface OwnProps {
    gyldigPeriode: DateRange;
    ModalContent: React.ReactElement;
    slettPeriode: (dates?: Date[]) => void;
    disableWeekends?: boolean;
    dateContentRenderer: (date: Date, isDisabled?: boolean) => React.ReactNode;
    tittelRenderer?: () => string | React.FunctionComponent;
}

export const TidsbrukKalender: React.FunctionComponent<OwnProps> = forwardRef(
    (
        {
            gyldigPeriode,
            ModalContent,
            slettPeriode,
            dateContentRenderer,
            disableWeekends = false,
            tittelRenderer = getMonthAndYear,
        },
        ref
    ) => {
        const [selectedDates, setSelectedDates] = useState<Date[]>([]);
        const [visKalender, setVisKalender] = useState<boolean>(false);
        const [visModal, setVisModal] = useState<boolean>(false);
        const clearSelectedDates = () => setSelectedDates([]);
        useOnClickOutside(ref, clearSelectedDates);
        const toggleKalender = () => {
            setVisKalender(!visKalender);
            if (selectedDates.length) {
                setSelectedDates([]);
            }
        };
        const toggleModal = () => setVisModal(!visModal);
        const toggleDay = (date: Date) =>
            selectedDates.some((v) => dayjs(v).isSame(date))
                ? setSelectedDates(selectedDates.filter((v) => !dayjs(v).isSame(date)))
                : setSelectedDates([...selectedDates, date]);
        const disabledDates = getDatesInMonth(gyldigPeriode.fom)
            .map((date) => {
                const dateIsWeekend = [0, 6].includes(date.getDay());

                if (!isDateInDates(date, getDatesInDateRange(gyldigPeriode)) || (disableWeekends && dateIsWeekend)) {
                    return date;
                }

                return false;
            })
            .filter((v) => v instanceof Date) as Date[];

        const hasSelectedDisabledDate = disabledDates
            .map((date) => dayjs(date).format(formats.DDMMYYYY))
            .some((date) =>
                selectedDates
                    .map((selectedDate) => {
                        const lel = dayjs(selectedDate).format(formats.DDMMYYYY);
                        return lel;
                    })
                    .includes(date)
            );
        const kanRegistrereTid = !!selectedDates.length && !hasSelectedDisabledDate;
        return (
            <EkspanderbartPanel tittel={tittelRenderer(gyldigPeriode.fom)} apen={visKalender} onClick={toggleKalender}>
                <div>
                    <CalendarGrid
                        onDateClick={(date) => toggleDay(date)}
                        month={gyldigPeriode}
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
                        {selectedDates.length > 0 && (
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
                    <Modal
                        className="modal"
                        open={visModal}
                        onClose={toggleModal}
                        closeButton
                        parentSelector={ref?.current?.id ? () => document.getElementById(ref?.current?.id) : undefined}
                    >
                        <Modal.Content>
                            {React.cloneElement(ModalContent, { selectedDates, toggleModal })}
                        </Modal.Content>
                    </Modal>
                </div>
            </EkspanderbartPanel>
        );
    }
);

export default TidsbrukKalender;
