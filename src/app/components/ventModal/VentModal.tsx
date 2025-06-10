import React, { useState } from 'react';

import { useMutation } from '@tanstack/react-query';

import { settJournalpostPaaVent } from 'app/api/api';
import OkGåTilLosModal from 'app/components/okGåTilLosModal/OkGåTilLosModal';
import SettPaaVentModal from 'app/components/settPåVentModal/SettPåVentModal';
import ErrorModal from 'app/fordeling/Komponenter/ErrorModal';

interface Props {
    journalpostId: string;
    soeknadId: string;
    visModalFn: (vis: boolean) => void;
}

const VentModal = ({ journalpostId, soeknadId, visModalFn }: Props) => {
    const [visHovedmodal, setVisHovedmodal] = useState(true);
    const [visErrorModal, setVisErrormodal] = useState(false);
    const [visSuccessModal, setVisSuccessModal] = useState(false);

    const { mutate: settPaaVent } = useMutation({
        mutationFn: () => settJournalpostPaaVent(journalpostId, soeknadId),
        onError: () => {
            setVisHovedmodal(false);
            setVisErrormodal(true);
        },
        onSuccess: () => {
            setVisHovedmodal(false);
            setVisSuccessModal(true);
        },
    });

    if (visHovedmodal) {
        return <SettPaaVentModal submit={() => settPaaVent()} onClose={() => visModalFn(false)} />;
    }

    if (visSuccessModal) {
        return (
            <OkGåTilLosModal
                meldingId="modal.settpaavent.til"
                onClose={() => {
                    visModalFn(false);
                }}
            />
        );
    }

    if (visErrorModal) {
        return <ErrorModal onClose={() => visModalFn(false)} />;
    }

    return null;
};

export default VentModal;
