import { Alert } from '@navikt/ds-react';
import { ApiPath, URL_BACKEND } from 'app/apiConfig';
import BrevFormKeys from 'app/models/enums/BrevFormKeys';
import { Person } from 'app/models/types';
import { ArbeidsgivereResponse } from 'app/models/types/ArbeidsgivereResponse';
import BrevFormValues from 'app/models/types/brev/BrevFormValues';
import Organisasjon from 'app/models/types/Organisasjon';
import { get, post } from 'app/utils';
import { Form, Formik } from 'formik';
import { Knapp } from 'nav-frontend-knapper';
import { Feilmelding } from 'nav-frontend-typografi';
import hash from 'object-hash';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import ModalWrapper from 'nav-frontend-modal';
import { finnArbeidsgivere } from '../../api/api';
import VerticalSpacer from '../VerticalSpacer';
import { Brev } from './Brev';
import './brev.less';
import Brevmal from './Brevmal';
import dokumentMalType from './dokumentMalType';
import GenereltFritekstbrevMal from './GenereltFritekstbrevMal';
import InnhentDokumentasjonMal from './InnhentDokumentasjonMal';
import MalVelger from './MalVelger';
import MottakerVelger from './MottakerVelger';
import SendIcon from './SendIcon';
import ErDuSikkerModal from '../../containers/pleiepenger/ErDuSikkerModal';

const previewMessage = (
    values: BrevFormValues,
    aktørId: string,
    sakstype: string,
    journalpostId?: string,
    fagsakId?: string
) => {
    const mottaker = {
        type: values.mottaker === aktørId ? 'AKTØRID' : 'ORGNR',
        id: values.mottaker,
    };

    const brevmalErGenereltFritekstbrev = values.brevmalkode === dokumentMalType.GENERELT_FRITEKSTBREV;

    fetch(`${URL_BACKEND}/api/k9-formidling/brev/forhaandsvis`, {
        method: 'post',
        credentials: 'include',
        body: JSON.stringify({
            aktørId,
            eksternReferanse: journalpostId || fagsakId,
            ytelseType: {
                kode: sakstype,
                kodeverk: 'FAGSAK_YTELSE',
            },
            saksnummer: fagsakId || 'GENERELL_SAK',
            avsenderApplikasjon: 'K9PUNSJ',
            overstyrtMottaker: mottaker,
            dokumentMal: values.brevmalkode,
            dokumentdata: {
                fritekst: !brevmalErGenereltFritekstbrev ? values.fritekst : undefined,
                fritekstbrev: brevmalErGenereltFritekstbrev ? values.fritekstbrev : undefined,
            },
        }),
        headers: { 'Content-Type': 'application/json' },
    })
        .then((response) => response.blob())
        .then((data) => {
            if (URL.createObjectURL) {
                window.open(URL.createObjectURL(data));
            }
        });
};

interface BrevProps {
    søkerId: string;
    journalpostId?: string;
    fagsakId?: string;
    setVisBrevIkkeSendtInfoboks?: (erBrevSendt: boolean) => void;
    sakstype: string;
    brevSendtCallback?: () => void;
}

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

    useEffect(() => {
        fetch(`${URL_BACKEND}/api/k9-formidling/brev/maler?sakstype=${sakstype}&avsenderApplikasjon=K9PUNSJ`, {
            credentials: 'include',
        })
            .then((response) => {
                if (response.ok) {
                    return response.json().then((data) => setBrevmaler(data || []));
                }
                return setHentBrevmalerError(true);
            })
            .catch((error) => {
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
        return <Feilmelding>Henting av brevmaler feilet</Feilmelding>;
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
                [BrevFormKeys.fritekstbrev]: {
                    overskrift: '',
                    brødtekst: '',
                },
            }}
            onSubmit={(values, actions) => {
                setBrevErSendt(false);
                const mottaker = {
                    type: values.mottaker === aktørId ? 'AKTØRID' : 'ORGNR',
                    id: values.mottaker,
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
            {({ values, isSubmitting, handleSubmit }) => (
                <div className="brev">
                    <ModalWrapper
                        className="modalContainer"
                        key="erdusikkerpåatsendebrevmodal"
                        onRequestClose={() => setVisErDuSikkerModal(false)}
                        contentLabel="erdusikkerpåatsendebrevmodal"
                        closeButton={false}
                        isOpen={visErDuSikkerModal}
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
                    </ModalWrapper>
                    <Form>
                        <MalVelger
                            resetBrevStatus={() => {
                                setBrevErSendt(false);
                                setSendBrevFeilet(false);
                            }}
                            brevmaler={brevmaler}
                        />

                        <MottakerVelger
                            resetBrevStatus={() => {
                                setBrevErSendt(false);
                                setSendBrevFeilet(false);
                            }}
                            aktørId={aktørId}
                            person={person}
                            arbeidsgivereMedNavn={arbeidsgivereMedNavn}
                        />

                        {values.brevmalkode === dokumentMalType.INNHENT_DOK && (
                            <InnhentDokumentasjonMal
                                setVisBrevIkkeSendtInfoboks={() =>
                                    setVisBrevIkkeSendtInfoboks && setVisBrevIkkeSendtInfoboks(!harSendtMinstEttBrev)
                                }
                            />
                        )}
                        {values.brevmalkode === dokumentMalType.GENERELT_FRITEKSTBREV && (
                            <GenereltFritekstbrevMal
                                setVisBrevIkkeSendtInfoboks={() =>
                                    setVisBrevIkkeSendtInfoboks && setVisBrevIkkeSendtInfoboks(!harSendtMinstEttBrev)
                                }
                            />
                        )}
                        <VerticalSpacer sixteenPx />
                        <div className="buttonRow">
                            <Knapp
                                className="sendBrevButton"
                                onClick={() => setVisErDuSikkerModal(true)}
                                mini
                                spinner={isSubmitting}
                                disabled={isSubmitting}
                                htmlType="button"
                            >
                                <SendIcon />
                                {intl.formatMessage({ id: 'Messages.Submit' })}
                            </Knapp>
                            {values.brevmalkode && (
                                <button
                                    type="button"
                                    onClick={() => previewMessage(values, aktørId, sakstype, journalpostId, fagsakId)}
                                    className="previewLink lenke lenke--frittstaende"
                                >
                                    {intl.formatMessage({ id: 'Messages.Preview' })}
                                </button>
                            )}
                        </div>

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
                    </Form>
                </div>
            )}
        </Formik>
    );
};

export default BrevComponent;
