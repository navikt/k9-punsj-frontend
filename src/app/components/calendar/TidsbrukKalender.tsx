import React, { useState } from 'react';
import dayjs from 'dayjs';
import { Button, Heading, Modal } from '@navikt/ds-react';
import CalendarGrid from './CalendarGrid';

import DateRange from '../../models/types/DateRange';

interface OwnProps {
    periode: DateRange;
}

export const TidsbrukKalender: React.FunctionComponent<OwnProps> = ({ periode }) => {
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    const [visModal, setVisModal] = useState<boolean>(false);

    const toggleModal = () => setVisModal(!visModal);
    const toggleDay = (date: Date) =>
        selectedDates.some((v) => dayjs(v).isSame(date))
            ? setSelectedDates(selectedDates.filter((v) => !dayjs(v).isSame(date)))
            : setSelectedDates([...selectedDates, date]);

    return (
        <div>
            <CalendarGrid
                onDateClick={(date) => toggleDay(date)}
                month={periode}
                dateContentRenderer={() => 'lel'}
                selectedDates={selectedDates}
            />
            <Button onClick={toggleModal}>Knapp Knappesen</Button>
            <Modal open={visModal} onClose={toggleModal} closeButton>
                <Modal.Content>
                    <Heading>Modal Modalsen</Heading>
                </Modal.Content>
            </Modal>
        </div>
    );
};

export default TidsbrukKalender;
