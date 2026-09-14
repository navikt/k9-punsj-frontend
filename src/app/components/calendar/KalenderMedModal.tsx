import React, { useState } from 'react';

import { Button } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';

import { PunsjDialog } from 'app/components/PunsjDialog';
import { KalenderDag } from 'app/models/KalenderDag';
import { IPeriode } from 'app/models/types';

import VerticalSpacer from '../VerticalSpacer';
import DateContent from './DateContent';
import type { ModalContentProps } from './TidsbrukKalender';
import TidsbrukKalenderContainer from './TidsbrukKalenderContainer';

interface Props {
    gyldigePerioder: IPeriode[];
    kalenderdager: KalenderDag[];
    tidModal: React.ReactElement<ModalContentProps>;
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
                <PunsjDialog
                    open
                    onOpenChange={(nextOpen) => !nextOpen && close()}
                    aria-label={modalLabel}
                    width="550px"
                >
                    <PunsjDialog.Body className="flex justify-center">{periodeListeModal(close)}</PunsjDialog.Body>
                </PunsjDialog>
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
