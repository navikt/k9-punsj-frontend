import React, { useEffect } from 'react';

import { Alert, Button } from '@navikt/ds-react';
import { RadioGruppe, RadioPanel } from 'nav-frontend-skjema';

import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import FormPanel from 'app/components/FormPanel';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { Sakstype } from 'app/models/enums';

import { IJournalpost } from 'app/models/types';

import { RootStateType } from 'app/state/RootState';
import { setSakstypeAction } from 'app/state/actions';
import intlHelper from 'app/utils/intlUtils';
import { ROUTES } from 'app/constants/routes';

import { useMutation } from '@tanstack/react-query';
import { settJournalpostPaaVentUtenSøknadId } from 'app/api/api';
import OkGåTilLosModal from 'app/components/okGåTilLosModal/OkGåTilLosModal';
import { Dispatch } from 'redux';
import { getPunchPathFraSakstype, getSakstypeFraDokumenttype } from './behandlingAvJournaførtJpUtils';

const BehandlingAvJournaførtJp: React.FC = () => {
    const intl = useIntl();

    const navigate = useNavigate();

    const dispatch = useDispatch<Dispatch<any>>();
    const setSakstype = (nySakstype: Sakstype) => dispatch(setSakstypeAction(nySakstype));

    const journalpost = useSelector((state: RootStateType) => state.felles.journalpost as IJournalpost);
    const fordelingState = useSelector((state: RootStateType) => state.fordelingState);

    const { sakstype, dokumenttype, fagsak } = fordelingState;

    // Navigerer til journalpost ROOT hvis sakstype eller dokumenttype mangler i fordelingState ved oppdatering av side
    useEffect(() => {
        if (!sakstype && !dokumenttype) {
            navigate(ROUTES.JOURNALPOST_ROOT.replace(':journalpostid/*', journalpost.journalpostId));
        }
    }, []);

    const settPåVent = useMutation({
        mutationFn: () => settJournalpostPaaVentUtenSøknadId(journalpost.journalpostId),
    });

    const søknadstype = getSakstypeFraDokumenttype(dokumenttype);
    const punchPath = getPunchPathFraSakstype(sakstype);
    const erSaksnummerReservert = journalpost.sak?.reservertSaksnummer || fagsak?.reservertSaksnummer;

    return (
        <FormPanel>
            <div className="max-w-md">
                {!erSaksnummerReservert && (
                    <Alert variant="success" size="small" className="mb-5" data-test-id="alertJournalført">
                        <FormattedMessage id="fordeling.journalført.alert.success" />
                    </Alert>
                )}

                {erSaksnummerReservert && (
                    <Alert variant="success" size="small" className="mb-5" data-test-id="alertJournalførtReservert">
                        <FormattedMessage
                            id="fordeling.journalført.alert.success.reservert"
                            values={{ saksnummer: fagsak?.fagsakId || '' }}
                        />
                    </Alert>
                )}

                {!søknadstype && (
                    <Alert variant="error" size="small" className="mb-5" data-test-id="søknadstypeUndefined">
                        <FormattedMessage id="fordeling.journalført.alert.error.søknadstypeIkkeValgt" />
                    </Alert>
                )}

                {!!søknadstype && (
                    <RadioGruppe legend={intlHelper(intl, 'fordeling.overskrift')}>
                        <div className="max-w-sm mb-2.5">
                            <RadioPanel
                                label={intlHelper(intl, `fordeling.sakstype.${søknadstype}`)}
                                value={sakstype}
                                onChange={() => {
                                    setSakstype(søknadstype);
                                }}
                                checked={sakstype === søknadstype}
                            />
                        </div>
                        <div className="max-w-sm mb-2.5">
                            <RadioPanel
                                label={intlHelper(intl, `fordeling.sakstype.${Sakstype.SEND_BREV}`)}
                                value={Sakstype.SEND_BREV}
                                onChange={() => {
                                    setSakstype(Sakstype.SEND_BREV);
                                }}
                                checked={sakstype === Sakstype.SEND_BREV}
                            />
                        </div>
                    </RadioGruppe>
                )}

                <VerticalSpacer eightPx />

                {settPåVent.isError && (
                    <div className="mb-4">
                        <Alert size="small" variant="error">
                            <FormattedMessage id="fordeling.journalført.alert.settPåvent.error" />
                        </Alert>
                    </div>
                )}
            </div>

            <div className="flex space-x-4">
                <Button
                    size="small"
                    disabled={!punchPath}
                    onClick={() => (punchPath ? navigate(punchPath) : null)}
                    data-test-id="bekreftKnapp"
                >
                    <FormattedMessage id="fordeling.knapp.punsj" />
                </Button>

                <Button size="small" onClick={() => settPåVent.mutate()} data-test-id="settPåVent" variant="secondary">
                    <FormattedMessage id="fordeling.journalført.settPåVent" />
                </Button>
            </div>

            {settPåVent.isSuccess && <OkGåTilLosModal meldingId="modal.settpaavent.til" onClose={() => null} />}
        </FormPanel>
    );
};

export default BehandlingAvJournaførtJp;
