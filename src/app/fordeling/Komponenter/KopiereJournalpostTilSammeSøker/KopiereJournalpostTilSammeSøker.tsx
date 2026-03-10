import React, { useState } from 'react';

import { Alert, Button } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import VerticalSpacer from 'app/components/VerticalSpacer';
import PunsjInnsendingType from 'app/models/enums/PunsjInnsendingType';
import { IdentRules } from 'app/validation';
import { RootStateType } from 'app/state/RootState';
import Fagsak from 'app/types/Fagsak';
import KopierLukkJpModal from '../KopierModal';

interface Props {
    barnMedFagsak: Fagsak;
}

const KopiereJournalpostTilSammeSøker: React.FC<Props> = ({ barnMedFagsak }: Props) => {
    const [visKanIkkeKopiere, setVisKanIkkeKopiere] = useState(false);
    const [visModal, setVisModal] = useState(false);

    const identState = useSelector((state: RootStateType) => state.identState);
    const fellesState = useSelector((state: RootStateType) => state.felles);

    const journalpost = fellesState.journalpost;
    const dedupkey = fellesState.dedupKey;

    const erInntektsmeldingUtenKrav =
        journalpost?.punsjInnsendingType?.kode === PunsjInnsendingType.INNTEKTSMELDING_UTGÅTT;

    let søkerId: string;

    if (journalpost?.norskIdent) {
        søkerId = journalpost?.norskIdent;
    } else {
        return (
            <Alert variant="warning">
                <FormattedMessage id="ident.usignert.feil.melding" />
            </Alert>
        );
    }

    return (
        <div>
            <VerticalSpacer eightPx />

            <div className="flex">
                <div className="mr-4">
                    <Button
                        variant="secondary"
                        size="small"
                        disabled={
                            IdentRules.erUgyldigIdent(identState.pleietrengendeId) ||
                            fellesState.kopierJournalpostSuccess
                        }
                        onClick={() => {
                            if (fellesState.kopierJournalpostSuccess || erInntektsmeldingUtenKrav) {
                                setVisKanIkkeKopiere(true);
                                return;
                            }
                            if (søkerId) {
                                setVisModal(true);
                            }
                        }}
                        data-test-id="kopierOgLukkJournalpostBtn"
                    >
                        <FormattedMessage id="fordeling.kopiereOgLukkJournalpost" />
                    </Button>
                </div>
            </div>

            {visKanIkkeKopiere && (
                <Alert variant="warning">
                    <FormattedMessage id="fordeling.kopiereJournalpostTilSammeSøker.kanIkkeKopiere.info" />

                    <ul>
                        <li>
                            <FormattedMessage id="fordeling.kopiereJournalpostTilSammeSøker.kanIkkeKopiere.info.1" />
                        </li>
                        <li>
                            <FormattedMessage id="fordeling.kopiereJournalpostTilSammeSøker.kanIkkeKopiere.info.2" />
                        </li>
                        <li>
                            <FormattedMessage id="fordeling.kopiereJournalpostTilSammeSøker.kanIkkeKopiere.info.3" />
                        </li>
                    </ul>
                </Alert>
            )}

            {visModal && (
                <KopierLukkJpModal
                    søkerId={søkerId}
                    pleietrengendeId={identState.pleietrengendeId}
                    journalpostId={journalpost?.journalpostId}
                    dedupkey={dedupkey}
                    fagsakId={barnMedFagsak.fagsakId}
                    lukkModal={() => setVisModal(false)}
                />
            )}
        </div>
    );
};

export default KopiereJournalpostTilSammeSøker;
