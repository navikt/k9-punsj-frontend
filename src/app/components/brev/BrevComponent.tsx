import { Formik, Form } from 'formik';
// eslint-disable-next-line import/no-extraneous-dependencies
import hash from 'object-hash';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { FileSearchIcon, PaperplaneIcon } from '@navikt/aksel-icons';
import { Alert, Button, ErrorMessage, Modal } from '@navikt/ds-react';

import { ApiPath, URL_BACKEND } from 'app/apiConfig';
import BrevFormKeys from 'app/models/enums/BrevFormKeys';
import { Person } from 'app/models/types';
import { ArbeidsgivereResponse } from 'app/models/types/ArbeidsgivereResponse';
import Organisasjon from 'app/models/types/Organisasjon';
import { get, post } from 'app/utils';

import { finnArbeidsgivere } from '../../api/api';
import ErDuSikkerModal from '../../containers/pleiepenger/ErDuSikkerModal';
import VerticalSpacer from '../VerticalSpacer';
import { Brev } from './Brev';
import Brevmal from './Brevmal';
import GenereltFritekstbrevMal from './GenereltFritekstbrevMal';
import InnhentDokumentasjonMal from './InnhentDokumentasjonMal';
import MalVelger from './MalVelger';
import MottakerVelger from './MottakerVelger';
import './brev.less';
import dokumentMalType from './dokumentMalType';
import { previewMessage } from './PrewiewMessage';

interface BrevProps {
    søkerId: string;
    journalpostId?: string;
    fagsakId?: string;
    setVisBrevIkkeSendtInfoboks?: (erBrevSendt: boolean) => void;
    sakstype: string;
    brevSendtCallback?: () => void;
}

// TODO: Fix rendering feil ved send brev hvis valideringsfeil
const BrevComponent: React.FC<BrevProps> = ({
    søkerId,
    journalpostId,
    fagsakId,
    setVisBrevIkkeSendtInfoboks,
    sakstype,
    brevSendtCallback,
}) => {
    const intl = useIntl();
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
    const [submitet, setSubmitet] = useState(false);
    const [previewMessageFeil, setPreviewMessageFeil] = useState<string | undefined>(undefined);
    useEffect(() => {
        fetch(`${URL_BACKEND()}/api/k9-formidling/brev/maler?sakstype=${sakstype}&avsenderApplikasjon=K9PUNSJ`, {
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

    if (hentBrevmalerError) {
        return <ErrorMessage size="small">Henting av brevmaler feilet</ErrorMessage>;
    }

    if (!brevmaler) {
        return null;
    }

    return (
        <Formik
            initialValues={{
                [BrevFormKeys.brevmalkode]: '',
                [BrevFormKeys.mottaker]: '',
                [BrevFormKeys.fritekst]: '',
                [BrevFormKeys.velgAnnenMottaker]: false,
                [BrevFormKeys.orgNummer]: '',
                [BrevFormKeys.fritekstbrev]: {
                    overskrift: '',
                    brødtekst: '',
                },
            }}
            validateOnChange={submitet}
            validateOnBlur={submitet}
            onSubmit={(values, actions) => {
                setBrevErSendt(false);

                const mottaker = {
                    type: values.mottaker === aktørId && !values.velgAnnenMottaker ? 'AKTØRID' : 'ORGNR',
                    id: values.velgAnnenMottaker ? values.orgNummer : values.mottaker,
                };

                const brev = new Brev(values, søkerId, mottaker, sakstype, values.brevmalkode, journalpostId, fagsakId);
                const brevHash = hash(brev);

                if (brevHash !== forrigeSendteBrevHash) {
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
                actions.setSubmitting(false);
            }}
        >
            {({ values, isSubmitting, handleSubmit, submitCount, validateForm, setFieldTouched, isValid, errors }) => {
                if (submitCount > 0) {
                    setSubmitet(true);
                }

                return (
                    <>
                        <Modal
                            className="modalContainer"
                            key="erdusikkerpåatsendebrevmodal"
                            onClose={() => setVisErDuSikkerModal(false)}
                            aria-label="erdusikkerpåatsendebrevmodal"
                            open={visErDuSikkerModal}
                        >
                            <ErDuSikkerModal
                                submitKnappText="modal.erdusikker.fortsett"
                                melding="modal.erdusikker.sendebrev"
                                onSubmit={() => {
                                    setVisErDuSikkerModal(false);
                                    handleSubmit();
                                }}
                                onClose={() => setVisErDuSikkerModal(false)}
                            />
                        </Modal>
                        <Form>
                            <div className="brev">
                                <MalVelger
                                    resetBrevStatus={() => {
                                        setBrevErSendt(false);
                                        setSendBrevFeilet(false);
                                    }}
                                    brevmaler={brevmaler}
                                />
                                <MottakerVelger
                                    resetBrevStatus={() => {
                                        setPreviewMessageFeil(undefined);
                                        setBrevErSendt(false);
                                        setSendBrevFeilet(false);
                                    }}
                                    setOrgInfoPending={(value: boolean) => {
                                        setOrgInfoPending(value);
                                    }}
                                    orgInfoPending={orgInfoPending}
                                    aktørId={aktørId}
                                    person={person}
                                    arbeidsgivereMedNavn={arbeidsgivereMedNavn}
                                    formSubmitted={submitet}
                                />
                                {values.brevmalkode === dokumentMalType.INNHENT_DOK && (
                                    <InnhentDokumentasjonMal
                                        setVisBrevIkkeSendtInfoboks={() =>
                                            setVisBrevIkkeSendtInfoboks &&
                                            setVisBrevIkkeSendtInfoboks(!harSendtMinstEttBrev)
                                        }
                                        setPreviewMessageFeil={() => setPreviewMessageFeil(undefined)}
                                    />
                                )}
                                {values.brevmalkode === dokumentMalType.GENERELT_FRITEKSTBREV && (
                                    <GenereltFritekstbrevMal
                                        setVisBrevIkkeSendtInfoboks={() =>
                                            setVisBrevIkkeSendtInfoboks &&
                                            setVisBrevIkkeSendtInfoboks(!harSendtMinstEttBrev)
                                        }
                                        setPreviewMessageFeil={() => setPreviewMessageFeil(undefined)}
                                    />
                                )}
                                <VerticalSpacer sixteenPx />
                                {values.brevmalkode && (
                                    <>
                                        <Button
                                            size="small"
                                            type="button"
                                            variant="tertiary"
                                            icon={<FileSearchIcon aria-hidden />}
                                            onClick={() => {
                                                setSubmitet(true);
                                                validateForm(values);
                                                setPreviewMessageFeil(undefined);
                                                setFieldTouched('mottaker');
                                                setFieldTouched('orgNummer');
                                                setFieldTouched('fritekst');
                                                setFieldTouched('fritekstbrev.overskrift');
                                                setFieldTouched('fritekstbrev.brødtekst');

                                                if (Object.keys(errors).length === 0) {
                                                    previewMessage(
                                                        values,
                                                        aktørId,
                                                        sakstype,
                                                        journalpostId,
                                                        fagsakId,
                                                    ).then((feil) => setPreviewMessageFeil(feil));
                                                }
                                            }}
                                        >
                                            {intl.formatMessage({ id: 'Messages.Preview' })}
                                        </Button>

                                        {isValid && previewMessageFeil && (
                                            <Alert variant="error" size="medium" fullWidth inline>
                                                {previewMessageFeil}
                                            </Alert>
                                        )}
                                    </>
                                )}
                                <div className="brevStatusContainer">
                                    {brevErSendt && (
                                        <Alert variant="success" size="medium" fullWidth inline>
                                            Brev sendt! Du kan nå sende nytt brev til annen mottaker.
                                        </Alert>
                                    )}
                                    {sendBrevFeilet && (
                                        <Alert variant="error" size="medium" fullWidth inline>
                                            Sending av brev feilet.
                                        </Alert>
                                    )}
                                    {visSammeBrevError && (
                                        <Alert variant="error" size="medium" fullWidth inline>
                                            Brevet er sendt. Du må endre mottaker eller innhold for å sende nytt brev.
                                        </Alert>
                                    )}
                                </div>
                            </div>
                            <div className="mt-7 pb-20">
                                <Button
                                    variant="primary"
                                    className="sendBrevButton"
                                    onClick={() => setVisErDuSikkerModal(true)}
                                    size="small"
                                    loading={isSubmitting || orgInfoPending}
                                    disabled={isSubmitting || orgInfoPending}
                                    type="button"
                                    icon={<PaperplaneIcon />}
                                >
                                    {intl.formatMessage({ id: 'Messages.Submit' })}
                                </Button>
                            </div>
                        </Form>
                    </>
                );
            }}
        </Formik>
    );
};

export default BrevComponent;
