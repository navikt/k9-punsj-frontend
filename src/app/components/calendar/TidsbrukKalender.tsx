import React, { useState } from 'react';
import dayjs from 'dayjs';
import { Button, Modal } from '@navikt/ds-react';
import EkspanderbartPanel from 'nav-frontend-ekspanderbartpanel';
import { getMonthAndYear } from 'app/utils';
import { InputTime } from 'app/models/types/InputTime';
import CalendarGrid from './CalendarGrid';
import './tidsbrukKalender.less';

import DateRange from '../../models/types/DateRange';

interface OwnProps {
    gyldigPeriode: DateRange;
    ModalContent: React.ReactElement;
    dateContentRenderer: (date: Date, isDisabled?: boolean) => React.ReactNode;
    tittelRenderer?: () => string | React.FunctionComponent;
}

export const TidsbrukKalender: React.FunctionComponent<OwnProps> = ({
    gyldigPeriode,
    ModalContent,
    dateContentRenderer = () => 'lel',
    tittelRenderer = getMonthAndYear,
}) => {
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    const [visKalender, setVisKalender] = useState<boolean>(false);
    const [visModal, setVisModal] = useState<boolean>(false);

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

    return (
        <EkspanderbartPanel tittel={tittelRenderer(gyldigPeriode.fom)} apen={visKalender} onClick={toggleKalender}>
            <div>
                <CalendarGrid
                    onDateClick={(date) => toggleDay(date)}
                    month={gyldigPeriode}
                    dateContentRenderer={dateContentRenderer}
                    selectedDates={selectedDates}
                />
                <Button onClick={toggleModal}>Knapp Knappesen</Button>
                <Modal className="modalsen" open={visModal} onClose={toggleModal} closeButton>
                    <Modal.Content>{React.cloneElement(ModalContent, { selectedDates })}</Modal.Content>
                </Modal>
            </div>
        </EkspanderbartPanel>
    );
};

export default TidsbrukKalender;
