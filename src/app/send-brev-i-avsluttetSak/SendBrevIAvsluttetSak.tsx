import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { ErrorMessage, Heading, Loader, Modal, Select, TextField } from '@navikt/ds-react';

import { finnFagsaker } from 'app/api/api';
import SuccessIcon from 'app/assets/SVG/SuccessIcon';
import BrevComponent from 'app/components/brev/BrevComponent';
import { useFormState } from 'app/hooks/useFormState';
import Fagsak from 'app/types/Fagsak';
import { IdentRules } from 'app/rules';
import { finnVisningsnavnForSakstype, getEnvironmentVariable } from 'app/utils';
import { ERROR_MESSAGES } from './messages';

import './sendBrevIAvsluttetSak.less';

const SendBrevIAvsluttetSak = () => {
    const [søkerId, setSøkerId] = useState('');
    const [fagsakId, setFagsakId] = useState('');
    const [søkerIdError, setSøkerIdError] = useState('');
    const [fagsaker, setFagsaker] = useState<Fagsak[]>([]);
    const [visLosModal, setVisLosModal] = useState(false);

    const {
        isSubmitting: isFetchingFagsaker,
        error: fagsakError,
        setSubmitting: setIsFetchingFagsaker,
        setError: setFagsakError,
    } = useFormState();

    const hentFagsaker = (søkersFødselsnummer: string) => {
        setFagsakError(null);
        setIsFetchingFagsaker(true);
        finnFagsaker(søkersFødselsnummer, (response, data: Fagsak[]) => {
            setIsFetchingFagsaker(false);
            if (response.status === 200) {
                setFagsaker(data);
            } else {
                setFagsakError(ERROR_MESSAGES.henteFagsak);
            }
        });
    };

    const validateSøkerId = (value: string) => {
        if (!value) {
            return ERROR_MESSAGES.søkerId.required;
        }
        if (value.length !== 11) {
            return ERROR_MESSAGES.søkerId.length;
        }
        if (IdentRules.erUgyldigIdent(value)) {
            return ERROR_MESSAGES.søkerId.invalid;
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
            <Heading size="small" level="1">
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

                    {fagsakError && <ErrorMessage>{fagsakError}</ErrorMessage>}

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
                        <SuccessIcon />
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
