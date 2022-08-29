import React, { LegacyRef, useState } from 'react';
import dayjs from 'dayjs';
import { Button, Modal } from '@navikt/ds-react';
import EkspanderbartPanel from 'nav-frontend-ekspanderbartpanel';
import useOnClickOutside from 'app/hooks/useOnClickOutside';
import { getDatesInDateRange, getDatesInMonth, getMonthAndYear, isDateInDates } from 'app/utils';
import CalendarGrid from './CalendarGrid';
import './tidsbrukKalender.less';

import DateRange from '../../models/types/DateRange';
import Slett from '../buttons/Slett';

interface OwnProps {
    gyldigPeriode: DateRange;
    ModalContent: React.ReactElement;
    slettPeriode: (dates?: Date[]) => void;
    dateContentRenderer: (date: Date, isDisabled?: boolean) => React.ReactNode;
    tittelRenderer?: () => string | React.FunctionComponent;
}

export const TidsbrukKalender: React.FunctionComponent<OwnProps> = ({
    gyldigPeriode,
    ModalContent,
    slettPeriode,
    dateContentRenderer,
    tittelRenderer = getMonthAndYear,
}) => {
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    const [visKalender, setVisKalender] = useState<boolean>(false);
    const [visModal, setVisModal] = useState<boolean>(false);
    const ref = React.useRef<HTMLElement>();
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
            if (!isDateInDates(date, getDatesInDateRange(gyldigPeriode))) {
                return date;
            }
            return false;
        })
        .filter((v) => v instanceof Date);
    return (
        <EkspanderbartPanel tittel={tittelRenderer(gyldigPeriode.fom)} apen={visKalender} onClick={toggleKalender}>
            <div ref={ref as LegacyRef<HTMLDivElement>}>
                <CalendarGrid
                    onDateClick={(date) => toggleDay(date)}
                    month={gyldigPeriode}
                    disabledDates={disabledDates as Date[]}
                    dateContentRenderer={dateContentRenderer}
                    selectedDates={selectedDates}
                />
                <div style={{ marginTop: '1.875rem' }}>
                    <Button variant="primary" onClick={toggleModal}>
                        Registrer tid
                    </Button>
                    {selectedDates.length > 0 && (
                        <Slett onClick={() => slettPeriode(selectedDates)}>Slett registrert tid</Slett>
                    )}
                </div>
                <Modal className="modal" open={visModal} onClose={toggleModal} closeButton>
                    <Modal.Content>{React.cloneElement(ModalContent, { selectedDates, toggleModal })}</Modal.Content>
                </Modal>
            </div>
        </EkspanderbartPanel>
    );
};

export default TidsbrukKalender;
