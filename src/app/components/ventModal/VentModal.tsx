import React, { useState } from 'react';
import { useMutation } from 'react-query';

import { Modal } from '@navikt/ds-react';

import { settJournalpostPaaVent } from 'app/api/api';
import { OkGaaTilLosModal } from 'app/components/okGaaTilLosModal/OkGaaTilLosModal';
import SettPaaVentErrorModal from 'app/components/settPåVentModal/SettPåVentErrorModal';
import SettPaaVentModal from 'app/components/settPåVentModal/SettPåVentModal';

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
        return <SettPaaVentModal submit={() => settPaaVent()} avbryt={() => visModalFn(false)} />;
    }

    if (visSuccessModal) {
        return (
            <Modal
                key="settpaaventokmodal"
                onClose={() => {
                    visModalFn(false);
                }}
                aria-label="settpaaventokmodal"
                open
            >
                <OkGaaTilLosModal melding="modal.settpaavent.til" />
            </Modal>
        );
    }

    if (visErrorModal) {
        return (
            <Modal key="settpaaventerrormodal" onClose={() => visModalFn(false)} aria-label="settpaaventokmodal" open>
                <SettPaaVentErrorModal close={() => visModalFn(false)} />
            </Modal>
        );
    }

    return null;
};

export default VentModal;
