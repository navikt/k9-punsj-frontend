import React, { useState } from 'react';

import { useMutation } from 'react-query';

import { settJournalpostPaaVent } from 'app/api/api';
import OkGåTilLosModal from 'app/components/okGåTilLosModal/OkGåTilLosModal';
import SettPåVentErrorModal from 'app/components/settPåVentModal/SettPåVentErrorModal';
import SettPaaVentModal from 'app/components/settPåVentModal/SettPåVentModal';

interface Props {
    journalpostId: string;
    soeknadId: string;
    visModalFn: (vis: boolean) => void;
}

const VentModal = ({ journalpostId, soeknadId, visModalFn }: Props) => {
    const [visHovedmodal, setVisHovedmodal] = useState(true);
    const [visErrorModal, setVisErrormodal] = useState(false);
    const [visSuccessModal, setVisSuccessModal] = useState(false);

    const { mutate: settPaaVent } = useMutation(() => settJournalpostPaaVent(journalpostId, soeknadId), {
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
        return <SettPaaVentModal submit={() => settPaaVent()} avbryt={() => visModalFn(false)} />;
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
        return <SettPåVentErrorModal onClose={() => visModalFn(false)} />;
    }

    return null;
};

export default VentModal;
