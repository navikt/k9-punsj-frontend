import React, { useEffect, useState, ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { Alert, Button, Heading, Loader, Modal, Select, TextField } from '@navikt/ds-react';
import { CheckmarkCircleFillIcon } from '@navikt/aksel-icons';

import { finnFagsaker } from 'app/api/api';
import BrevComponent from 'app/components/brev/brevComponent/BrevComponent';
import Fagsak from 'app/types/Fagsak';
import { IdentRules } from 'app/rules';
import { finnVisningsnavnForSakstype, getEnvironmentVariable } from 'app/utils';

import './sendBrevIAvsluttetSak.less';

const SendBrevIAvsluttetSak = () => {
    const [søkerId, setSøkerId] = useState('');
    const [søkerIdError, setSøkerIdError] = useState<ReactNode>('');
    const [isFetchingFagsaker, setIsFetchingFagsaker] = useState(false);
    const [fetchFagsakerError, setFetchFagsakerError] = useState(false);
    const [fagsaker, setFagsaker] = useState<Fagsak[]>([]);
    const [fagsakId, setFagsakId] = useState('');
    const [visLosModal, setVisLosModal] = useState(false);

    const hentFagsaker = (søkersFødselsnummer: string) => {
        setFetchFagsakerError(false);
        setIsFetchingFagsaker(true);

        finnFagsaker(søkersFødselsnummer, (response, data: Fagsak[]) => {
            setIsFetchingFagsaker(false);
            if (response.status === 200) {
                setFagsaker(data);
            } else {
                setFetchFagsakerError(true);
            }
        });
    };

    const validateSøkerId = (value: string) => {
        if (!value) {
            return <FormattedMessage id="validation.sendBrevIAvsluttetSak.textField.søkersFødselsnummer.required" />;
        }
        if (value.length !== 11) {
            return <FormattedMessage id="validation.sendBrevIAvsluttetSak.textField.søkersFødselsnummer.length" />;
        }
        if (IdentRules.erUgyldigIdent(value)) {
            return <FormattedMessage id="validation.sendBrevIAvsluttetSak.textField.søkersFødselsnummer.invalid" />;
        }
        return '';
    };

    const handleSøkerIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value.replace(/[^0-9]/g, '');
        setSøkerId(value);
        setFagsakId('');

        const error = validateSøkerId(value);
        setSøkerIdError(error);

        if (!error && value.length === 11) {
            hentFagsaker(value);
        }
    };

    const sakstypeForValgtFagsak = () => {
        if (fagsaker?.length > 0 && fagsakId) {
            const fagsak = fagsaker.find((fsak) => fsak.fagsakId === fagsakId);
            return fagsak?.sakstype || '';
        }
        return '';
    };

    useEffect(() => {
        if (visLosModal) {
            setTimeout(() => {
                window.location.href = getEnvironmentVariable('K9_LOS_URL');
            }, 3000);
        }
    }, [visLosModal]);

    return (
        <div className="sendBrevIAvsluttetSak">
            <Heading size="medium" level="1">
                <FormattedMessage id="sendBrevIAvsluttetSak.header" />
            </Heading>

            <TextField
                value={søkerId}
                onChange={handleSøkerIdChange}
                className="fnrInput"
                label={<FormattedMessage id="sendBrevIAvsluttetSak.søkersFødselsnummer" />}
                type="text"
                size="small"
                inputMode="numeric"
                maxLength={11}
                pattern="[0-9]*"
                autoComplete="off"
                error={søkerIdError}
            />

            {!søkerIdError && søkerId.length === 11 && (
                <>
                    <div className="fagsagSelectContainer">
                        <Select
                            value={fagsakId}
                            onChange={(event) => setFagsakId(event.target.value)}
                            className="fagsakSelect"
                            label={<FormattedMessage id="sendBrevIAvsluttetSak.velgFagsak" />}
                            disabled={fagsaker.length === 0}
                            size="small"
                        >
                            <option value="">
                                <FormattedMessage id="sendBrevIAvsluttetSak.velgFagsak.velg" />
                            </option>

                            {fagsaker.map(({ fagsakId: id, sakstype }) => (
                                <option key={id} value={id}>
                                    <FormattedMessage
                                        id="sendBrevIAvsluttetSak.velgFagsak.options"
                                        values={{
                                            fagsakId: id,
                                            sakstypeNavn: finnVisningsnavnForSakstype(sakstype),
                                        }}
                                    />
                                </option>
                            ))}
                        </Select>

                        {isFetchingFagsaker && <Loader variant="neutral" size="small" title="venter..." />}
                    </div>

                    {fetchFagsakerError && (
                        <Alert
                            size="small"
                            variant="error"
                            className="mb-4"
                            data-test-id="sendBrevIAvsluttetSakAlertFetchFagsakerError"
                        >
                            <FormattedMessage id="sendBrevIAvsluttetSak.alert.fetchFagsaker.error" />

                            <Button type="button" size="small" variant="tertiary" onClick={() => hentFagsaker(søkerId)}>
                                <FormattedMessage id="sendBrevIAvsluttetSak.btn.hentFagsaker" />
                            </Button>
                        </Alert>
                    )}

                    {!isFetchingFagsaker && !fetchFagsakerError && fagsaker.length === 0 && (
                        <Alert
                            size="small"
                            variant="warning"
                            className="mb-4"
                            data-test-id="sendBrevIAvsluttetSakAlertIngenFagsak"
                        >
                            <FormattedMessage id="sendBrevIAvsluttetSak.alert.hentFagsaker.ingenFagsak" />
                        </Alert>
                    )}

                    {fagsakId && (
                        <BrevComponent
                            søkerId={søkerId}
                            sakstype={sakstypeForValgtFagsak()}
                            fagsakId={fagsakId}
                            brevSendtCallback={() => setVisLosModal(true)}
                        />
                    )}
                </>
            )}

            {visLosModal && (
                <Modal open aria-label="Gå til LOS-modal" className="losModal" onClose={() => null}>
                    <div className="modalContent">
                        <CheckmarkCircleFillIcon className="successIcon" title="checkIcon" />
                        <Heading spacing size="xsmall" level="3">
                            <FormattedMessage id="sendBrevIAvsluttetSak.gåTilLOSModal.header" />
                        </Heading>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default SendBrevIAvsluttetSak;
