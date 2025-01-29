import React, { useEffect, useState } from 'react';

import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import hash from 'object-hash';
import { FormattedMessage } from 'react-intl';
import { Alert, Button, ErrorMessage } from '@navikt/ds-react';
import { FileSearchIcon, PaperplaneIcon } from '@navikt/aksel-icons';
import { ApiPath } from 'app/apiConfig';
import { Person } from 'app/models/types';
import { ArbeidsgivereResponse } from 'app/models/types/ArbeidsgivereResponse';
import Organisasjon from 'app/models/types/Organisasjon';
import { get, post } from 'app/utils';
import { finnArbeidsgivere } from '../../api/api';
import ErDuSikkerModal from 'app/components/ErDuSikkerModal';
import VerticalSpacer from '../VerticalSpacer';
import { createBrev, defaultValuesBrev } from './Brev';
import Brevmal from './Brevmal';
import GenereltFritekstbrevMal from './GenereltFritekstbrevMal';
import InnhentDokumentasjonMal from './InnhentDokumentasjonMal';
import MalVelger from './MalVelger';
import MottakerVelger from './MottakerVelger';
import DokumentMalType from './DookumentMalType';
import { previewMessage } from './previewMessage';
import { BrevFormKeys, IBrevForm, IBrevMottakerType } from './types';

import { FormProvider } from 'app/components/form';

import './brev.less';

interface BrevProps {
    søkerId: string;
    sakstype: string;
    fagsakId?: string;
    journalpostId?: string;
    sendBrevUtenModal?: boolean;
    brevFraModal?: boolean;
    tilbake?: boolean;
    setVisBrevIkkeSendtInfoboks?: (erBrevSendt: boolean) => void;
    brevSendtCallback?: () => void;
    lukkJournalpostOppgave?: () => void;
}

const BrevComponent: React.FC<BrevProps> = ({
    søkerId,
    sakstype,
    fagsakId,
    journalpostId,
    sendBrevUtenModal,
    brevFraModal,
    tilbake,
    setVisBrevIkkeSendtInfoboks,
    brevSendtCallback,
    lukkJournalpostOppgave,
}) => {
    const [brevmaler, setBrevmaler] = useState<Brevmal | undefined>(undefined);
    const [hentBrevmalerError, setHentBrevmalerError] = useState(false);
    const [arbeidsgivereMedNavn, setArbeidsgivereMedNavn] = useState<Organisasjon[]>([]);
    const [brevErSendt, setBrevErSendt] = useState(false);
    const [sendBrevFeilet, setSendBrevFeilet] = useState(false);
    const [aktørId, setAktørId] = useState('');
    const [harSendtMinstEttBrev, setHarSendtMinstEttBrev] = useState(false);
    const [person, setPerson] = useState<Person | undefined>(undefined);
    const [forrigeSendteBrevHash, setForrigeSendteBrevHash] = useState('');
    const [visSammeBrevError, setVisSammeBrevError] = useState(false);
    const [visErDuSikkerModal, setVisErDuSikkerModal] = useState<boolean>(false);
    const [orgInfoPending, setOrgInfoPending] = useState<boolean>(false);
    const [previewMessageFeil, setPreviewMessageFeil] = useState<string | undefined>(undefined);

    const navigate = useNavigate();

    const methods = useForm<IBrevForm>({
        defaultValues: defaultValuesBrev,
        mode: 'onSubmit',
    });

    const {
        handleSubmit,
        watch,
        formState: { isSubmitting, isValid },
    } = methods;

    const brevmalkode = watch(BrevFormKeys.brevmalkode);

    useEffect(() => {
        fetch(`${ApiPath.BREV_MALER}?sakstype=${sakstype}&avsenderApplikasjon=K9PUNSJ`, {
            credentials: 'include',
        })
            .then((response) => {
                if (response.ok) {
                    return response.json().then((data) => setBrevmaler(data || []));
                }
                return setHentBrevmalerError(true);
            })
            .catch((error) => {
                // eslint-disable-next-line no-console
                console.log(error);
                setHentBrevmalerError(true);
            });
    }, []);

    useEffect(() => {
        if (søkerId) {
            finnArbeidsgivere(søkerId, (response, data: ArbeidsgivereResponse) => {
                setArbeidsgivereMedNavn(data?.organisasjoner || []);
            });
            get(ApiPath.BREV_AKTØRID, undefined, { 'X-Nav-NorskIdent': søkerId }, (response, data) => {
                if (response.status === 200) {
                    setAktørId(`${data}`);
                }
            });
            get(ApiPath.PERSON, undefined, { 'X-Nav-NorskIdent': søkerId }, (response, data: Person) => {
                if (response.status === 200) {
                    setPerson(data);
                }
            });
        }
    }, [søkerId]);

    const onSubmit = (values: IBrevForm) => {
        setBrevErSendt(false);

        const mottakerData = {
            type:
                values[BrevFormKeys.mottaker] === aktørId && !values[BrevFormKeys.velgAnnenMottaker]
                    ? IBrevMottakerType.aktørId
                    : IBrevMottakerType.orgNr,
            id: values[BrevFormKeys.velgAnnenMottaker] ? values[BrevFormKeys.orgNummer] : values[BrevFormKeys.mottaker],
        };

        const dokumentMal = values[BrevFormKeys.brevmalkode];

        const brev = createBrev(values, søkerId, mottakerData, sakstype, dokumentMal, journalpostId, fagsakId);
        const brevHash = hash(brev);
        console.log('TEST: ', brev);

        const testIkkeSend = true;

        if (brevHash !== forrigeSendteBrevHash && !testIkkeSend) {
            setVisSammeBrevError(false);
            post(ApiPath.BREV_BESTILL, undefined, undefined, brev, (response) => {
                if (response.status === 200) {
                    setForrigeSendteBrevHash(brevHash);
                    setBrevErSendt(true);
                    setHarSendtMinstEttBrev(true);
                    if (brevSendtCallback) {
                        brevSendtCallback();
                    }
                    if (setVisBrevIkkeSendtInfoboks) {
                        setVisBrevIkkeSendtInfoboks(false);
                    }
                } else {
                    setSendBrevFeilet(true);
                }
            });
        } else {
            setVisSammeBrevError(true);
        }
    };

    if (hentBrevmalerError) {
        return (
            <ErrorMessage size="small">
                <FormattedMessage id={`brevComponent.error.hentBrevmalerError`} />
            </ErrorMessage>
        );
    }

    if (!brevmaler) {
        return null;
    }

    return (
        <FormProvider<IBrevForm> form={methods} onSubmit={onSubmit}>
            <div className="brev">
                <MalVelger
                    resetBrevStatus={() => {
                        setBrevErSendt(false);
                        setSendBrevFeilet(false);
                    }}
                    brevmaler={brevmaler}
                />

                <MottakerVelger
                    aktørId={aktørId}
                    arbeidsgivereMedNavn={arbeidsgivereMedNavn}
                    orgInfoPending={orgInfoPending}
                    formSubmitted={isSubmitting}
                    person={person}
                    resetBrevStatus={() => {
                        setPreviewMessageFeil(undefined);
                        setBrevErSendt(false);
                        setSendBrevFeilet(false);
                    }}
                    setOrgInfoPending={(value: boolean) => {
                        setOrgInfoPending(value);
                    }}
                />

                {brevmalkode === DokumentMalType.INNHENT_DOK && (
                    <InnhentDokumentasjonMal
                        setVisBrevIkkeSendtInfoboks={() =>
                            setVisBrevIkkeSendtInfoboks && setVisBrevIkkeSendtInfoboks(!harSendtMinstEttBrev)
                        }
                        setPreviewMessageFeil={() => setPreviewMessageFeil(undefined)}
                    />
                )}

                {brevmalkode === DokumentMalType.GENERELT_FRITEKSTBREV && (
                    <GenereltFritekstbrevMal
                        setVisBrevIkkeSendtInfoboks={() =>
                            setVisBrevIkkeSendtInfoboks && setVisBrevIkkeSendtInfoboks(!harSendtMinstEttBrev)
                        }
                        setPreviewMessageFeil={() => setPreviewMessageFeil(undefined)}
                    />
                )}

                {brevmalkode === DokumentMalType.GENERELT_FRITEKSTBREV_NYNORSK && (
                    <GenereltFritekstbrevMal
                        setVisBrevIkkeSendtInfoboks={() =>
                            setVisBrevIkkeSendtInfoboks && setVisBrevIkkeSendtInfoboks(!harSendtMinstEttBrev)
                        }
                        setPreviewMessageFeil={() => setPreviewMessageFeil(undefined)}
                    />
                )}

                <VerticalSpacer sixteenPx />

                {brevmalkode && (
                    <div>
                        <div className="flex justify-between">
                            {sendBrevUtenModal && (
                                <Button
                                    variant="primary"
                                    className="sendBrevButton"
                                    size="small"
                                    loading={isSubmitting || orgInfoPending}
                                    disabled={isSubmitting || orgInfoPending}
                                    type="submit"
                                    icon={<PaperplaneIcon />}
                                >
                                    <FormattedMessage id={`brevComponent.btn.sendBrev`} />
                                </Button>
                            )}
                            <Button
                                size="small"
                                type="button"
                                variant="tertiary"
                                icon={<FileSearchIcon aria-hidden />}
                                onClick={() => {
                                    if (isValid) {
                                        const values = methods.getValues();
                                        setPreviewMessageFeil(undefined);
                                        previewMessage(values, aktørId, sakstype, journalpostId, fagsakId).then(
                                            (feil) => setPreviewMessageFeil(feil),
                                        );
                                    }
                                }}
                            >
                                <FormattedMessage id={`brevComponent.btn.forhåndsvisBrev`} />
                            </Button>
                        </div>

                        {isValid && previewMessageFeil && (
                            <Alert variant="error" size="medium" fullWidth inline>
                                {previewMessageFeil}
                            </Alert>
                        )}
                    </div>
                )}
                <div className="brevStatusContainer">
                    {brevErSendt && (!sendBrevUtenModal || brevFraModal) && (
                        <Alert variant="success" size="medium" fullWidth inline>
                            <FormattedMessage id={`brevComponent.alert.brevErSendt`} />
                        </Alert>
                    )}
                    {brevErSendt && sendBrevUtenModal && !brevFraModal && (
                        <Alert variant="success" size="medium" fullWidth inline>
                            <FormattedMessage id={'brevComponent.alert.brevErSendt.etterKlassifisering'} />
                        </Alert>
                    )}

                    {sendBrevFeilet && (
                        <Alert variant="error" size="medium" fullWidth inline>
                            <FormattedMessage id={`brevComponent.alert.sendBrevFeilet`} />
                        </Alert>
                    )}

                    {visSammeBrevError && (
                        <Alert variant="error" size="medium" fullWidth inline>
                            <FormattedMessage id={`brevComponent.alert.visSammeBrevError`} />
                        </Alert>
                    )}
                </div>
            </div>

            {!sendBrevUtenModal && (
                <div className="mt-7 pb-20 flex gap-x-4">
                    <Button
                        variant="primary"
                        className="sendBrevButton"
                        onClick={() => (sendBrevUtenModal ? null : setVisErDuSikkerModal(true))}
                        size="small"
                        loading={isSubmitting || orgInfoPending}
                        disabled={isSubmitting || orgInfoPending}
                        type={sendBrevUtenModal ? 'submit' : 'button'}
                        icon={<PaperplaneIcon />}
                    >
                        <FormattedMessage id="brevComponent.btn.sendBrev" />
                    </Button>

                    {lukkJournalpostOppgave !== undefined && (
                        <Button
                            className="sendBrevButton"
                            variant="secondary"
                            size="small"
                            onClick={() => lukkJournalpostOppgave()}
                            type={'button'}
                        >
                            <FormattedMessage id="brevComponent.btn.lukkOppgave" />
                        </Button>
                    )}

                    {tilbake && (
                        <Button
                            className="goBackButton"
                            variant="secondary"
                            size="small"
                            onClick={() => navigate(-1)}
                            type="button"
                        >
                            <FormattedMessage id="brevComponent.btn.tilbake" />
                        </Button>
                    )}
                </div>
            )}

            {!sendBrevUtenModal && (
                <ErDuSikkerModal
                    melding="modal.erdusikker.sendebrev"
                    modalKey="erdusikkerpåatsendebrevmodal"
                    open={visErDuSikkerModal}
                    submitKnappText="modal.erdusikker.fortsett"
                    onSubmit={() => {
                        setVisErDuSikkerModal(false);
                        handleSubmit(onSubmit)();
                    }}
                    onClose={() => setVisErDuSikkerModal(false)}
                />
            )}
        </FormProvider>
    );
};

export default BrevComponent;
