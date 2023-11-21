import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

import { ErrorMessage, Heading, Loader, Modal, Select, TextField } from '@navikt/ds-react';

import { finnFagsaker } from 'app/api/api';
import SuccessIcon from 'app/assets/SVG/SuccessIcon';
import BrevComponent from 'app/components/brev/BrevComponent';
import { IdentRules } from 'app/rules';
import Fagsak from 'app/types/Fagsak';
import { finnVisningsnavnForSakstype, getEnvironmentVariable } from 'app/utils';

import './sendBrevIAvsluttetSak.less';

const SendBrevIAvsluttetSak = () => {
    const [søkerId, setSøkerId] = useState('');
    const [henteFagsakFeilet, setHenteFagsakFeilet] = useState(false);
    const [isFetchingFagsaker, setIsFetchingFagsaker] = useState(false);
    const [fagsaker, setFagsaker] = useState<Fagsak[]>([]);
    const [valgtFagsak, setValgtFagsak] = useState('');
    const [visLosModal, setVisLosModal] = useState(false);
    const [fødselsnummerError, setFødselsnummerError] = useState(false);
    const gyldigLengdePåSøkerId = søkerId.length === 11;
    const intl = useIntl();

    useEffect(() => {
        if (visLosModal) {
            setTimeout(() => {
                window.location.href = getEnvironmentVariable('K9_LOS_URL');
            }, 3000);
        }
    }, [visLosModal]);

    const hentFagsaker = (søkersFødselsnummer: string) => {
        setHenteFagsakFeilet(false);
        setIsFetchingFagsaker(true);
        finnFagsaker(søkersFødselsnummer, (response, data: Fagsak[]) => {
            setIsFetchingFagsaker(false);
            if (response.status === 200) {
                setFagsaker(data);
            } else {
                setHenteFagsakFeilet(true);
            }
        });
    };

    const sakstypeForValgtFagsak = () => {
        if (fagsaker?.length > 0 && valgtFagsak) {
            const fagsak = fagsaker.find((fsak) => fsak.fagsakId === valgtFagsak);
            return fagsak?.sakstype || '';
        }
        return '';
    };

    return (
        <>
            <div className="sendBrevIAvsluttetSak">
                <Heading size="small" level="1">
                    Send brev i avsluttet sak
                </Heading>

                <TextField
                    className="fnrInput"
                    label={intl.formatMessage({ id: 'SendBrevIAvsluttetSak.søkersFødselsnummer' })}
                    type="text"
                    size="small"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                    onChange={(event) => {
                        const { value } = event.target;
                        setSøkerId(value);
                        setValgtFagsak('');
                        if (value.length >= 11) {
                            if (IdentRules.erUgyldigIdent(value)) {
                                setFødselsnummerError(true);
                            } else {
                                setFødselsnummerError(false);
                                hentFagsaker(value);
                            }
                        }
                    }}
                />
                {fødselsnummerError && (
                    <ErrorMessage>
                        {intl.formatMessage({
                            id: 'SendBrevIAvsluttetSak.UgyldigFødselsnummer',
                        })}
                    </ErrorMessage>
                )}
                {!fødselsnummerError && gyldigLengdePåSøkerId && (
                    <>
                        <div className="fagsagSelectContainer">
                            <Select
                                className="fagsakSelect"
                                label={intl.formatMessage({ id: 'SendBrevIAvsluttetSak.velgFagsak' })}
                                disabled={fagsaker.length === 0}
                                onChange={(event) => setValgtFagsak(event.target.value)}
                                size="small"
                            >
                                <option value="">{intl.formatMessage({ id: 'SendBrevIAvsluttetSak.velg' })}</option>
                                {fagsaker.map(({ fagsakId, sakstype }) => (
                                    <option key={fagsakId} value={fagsakId}>
                                        {`${fagsakId} (K9 ${finnVisningsnavnForSakstype(sakstype)})`}
                                    </option>
                                ))}
                            </Select>
                            {isFetchingFagsaker && <Loader variant="neutral" size="small" title="venter..." />}
                        </div>
                        {henteFagsakFeilet && (
                            <ErrorMessage>
                                {intl.formatMessage({
                                    id: 'SendBrevIAvsluttetSak.hentingAvFagsakFeilet',
                                })}
                            </ErrorMessage>
                        )}
                        {valgtFagsak && (
                            <BrevComponent
                                søkerId={søkerId}
                                fagsakId={valgtFagsak}
                                sakstype={sakstypeForValgtFagsak()}
                                brevSendtCallback={() => setVisLosModal(true)}
                            />
                        )}
                    </>
                )}
            </div>
            {visLosModal && (
                <Modal open aria-label="Gå til LOS-modal" className="losModal" onClose={() => null}>
                    <div className="modalContent">
                        <SuccessIcon />
                        <Heading spacing size="xsmall" level="3">
                            Brevet er sendt. Du blir nå tatt til LOS.
                        </Heading>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default SendBrevIAvsluttetSak;
