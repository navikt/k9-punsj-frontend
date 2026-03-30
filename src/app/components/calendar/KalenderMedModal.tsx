import React, { useState } from 'react';

import { Button, Modal } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';

import { KalenderDag } from 'app/models/KalenderDag';
import { IPeriode } from 'app/models/types';

import DateContent from './DateContent';
import TidsbrukKalenderContainer from './TidsbrukKalenderContainer';
import VerticalSpacer from '../VerticalSpacer';

interface Props {
    gyldigePerioder: IPeriode[];
    kalenderdager: KalenderDag[];
    tidModal: React.ReactElement;
    periodeListeModal: (close: () => void) => React.ReactNode;
    slettPeriode: (dates?: Date[]) => void;
    lengrePeriodeIntlId?: string;
    modalLabel?: string;
}

const KalenderMedModal = ({
    gyldigePerioder,
    kalenderdager,
    tidModal,
    periodeListeModal,
    slettPeriode,
    lengrePeriodeIntlId = 'skjema.arbeid.registrerArbeidstidLengrePeriode',
    modalLabel = 'Lengre periode modal',
}: Props) => {
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);

    return (
        <>
            <Button variant="secondary" onClick={() => setOpen(true)}>
                <FormattedMessage id={lengrePeriodeIntlId} />
            </Button>

            <VerticalSpacer twentyPx />

            {open && (
                <Modal open onClose={close} aria-label={modalLabel} className="max-w-[550px] min-w-[550px]">
                    <Modal.Body>{periodeListeModal(close)}</Modal.Body>
                </Modal>
            )}

            {!!gyldigePerioder.length && (
                <TidsbrukKalenderContainer
                    gyldigePerioder={gyldigePerioder}
                    ModalContent={tidModal}
                    kalenderdager={kalenderdager}
                    slettPeriode={slettPeriode}
                    dateContentRenderer={DateContent}
                />
            )}
        </>
    );
};

export default KalenderMedModal;
