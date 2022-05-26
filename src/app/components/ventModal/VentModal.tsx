import React, { useState } from 'react';

import OkGaaTilLosModal from 'app/containers/pleiepenger/OkGaaTilLosModal';
import SettPaaVentErrorModal from 'app/containers/pleiepenger/SettPaaVentErrorModal';
import SettPaaVentModal from 'app/containers/pleiepenger/SettPaaVentModal';
import ModalWrapper from 'nav-frontend-modal';
import { settJournalpostPaaVent } from 'app/api/api';
import { useMutation } from 'react-query';

type OwnProps = {
    journalpostId: string;
    soeknadId: string;
    visModalFn: (vis: boolean) => void;
};

const VentModal = ({ journalpostId, soeknadId, visModalFn }: OwnProps) => {
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
        return (
            <ModalWrapper
                key="settpaaventmodal"
                className="settpaaventmodal"
                onRequestClose={() => setVisHovedmodal(false)}
                contentLabel="settpaaventmodal"
                isOpen
                closeButton={false}
            >
                <SettPaaVentModal submit={() => settPaaVent()} avbryt={() => visModalFn(false)} />
            </ModalWrapper>
        );
    }
    if (visSuccessModal) {
        return (
            <ModalWrapper
                key="settpaaventokmodal"
                onRequestClose={() => {
                    visModalFn(false);
                }}
                contentLabel="settpaaventokmodal"
                closeButton={false}
                isOpen
            >
                <OkGaaTilLosModal melding="modal.settpaavent.til" />
            </ModalWrapper>
        );
    }

    if (visErrorModal) {
        return (
            <ModalWrapper
                key="settpaaventerrormodal"
                onRequestClose={() => visModalFn(false)}
                contentLabel="settpaaventokmodal"
                closeButton={false}
                isOpen
            >
                <SettPaaVentErrorModal close={() => visModalFn(false)} />
            </ModalWrapper>
        );
    }

    return null;
};

export default VentModal;
