import React, { useEffect, useState } from 'react';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import hash from 'object-hash';
import { FormattedMessage } from 'react-intl';
import { Alert, Button, ErrorMessage, Tag } from '@navikt/ds-react';
import { FileSearchIcon, PaperplaneIcon } from '@navikt/aksel-icons';

import { ApiPath } from 'app/apiConfig';
import { Person } from 'app/models/types';
import { ArbeidsgivereResponse } from 'app/models/types/ArbeidsgivereResponse';
import Organisasjon from 'app/models/types/Organisasjon';
import { get, post } from 'app/utils';
import { finnArbeidsgivere } from '../../../api/api';
import ErDuSikkerModal from 'app/components/ErDuSikkerModal';
import VerticalSpacer from '../../VerticalSpacer';
import { createBrev, defaultValuesBrev, getDokumentdata, previewMessage } from '../utils';
import MottakerVelger from '../MottakerVelger';
import { BrevFormKeys, Brevmal, DokumentMalType, IBrevForm, IBrevMottakerType, IMal } from '../types';
import { validateText } from 'app/utils/validationHelpers';
import { getTypedFormComponents } from 'app/components/form/getTypedFormComponents';
import { getBrevComponentSchema } from '../validationSchema';

import './brevComponent.less';
import { useValidationRules } from '../useValidationRules';

const { TypedFormProvider, TypedFormTextField, TypedFormTextarea, TypedFormSelect } =
    getTypedFormComponents<IBrevForm>();

interface Props {
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

const BrevComponent: React.FC<Props> = ({
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
    const navigate = useNavigate();

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
    const [valgteMal, setValgteMal] = useState<IMal | undefined>(undefined);

    // TODO: DO NOT VALIDATE TITTEL input field if !visTittelInput
    const validationSchema = getBrevComponentSchema();

    const { validateBrevmalkode } = useValidationRules();

    const methods = useForm<IBrevForm>({
        defaultValues: defaultValuesBrev,
        mode: 'onSubmit',

        resolver: yupResolver<IBrevForm>(validationSchema),
    });

    const {
        handleSubmit,
        watch,
        setError,
        formState: { isSubmitting, isValid, errors },
    } = methods;

    const brevmalkode = watch(BrevFormKeys.brevmalkode);
    // const valgteMal = brevmaler && brevmaler[brevmalkode];

    const visTittelInput = !!valgteMal && valgteMal.støtterTittelOgFritekst;
    const visFritekstInput = !!valgteMal && (valgteMal.støtterTittelOgFritekst || valgteMal.støtterFritekst);

    useEffect(() => {
        let isMounted = true;

        fetch(`${ApiPath.BREV_MALER}?sakstype=${sakstype}&avsenderApplikasjon=K9PUNSJ`, {
            credentials: 'include',
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Failed to fetch brevmaler');
            })
            .then((data) => {
                if (isMounted) {
                    setBrevmaler(data || []);
                }
            })
            .catch((error) => {
                // eslint-disable-next-line no-console
                console.error('Error fetching brevmaler:', error);
                if (isMounted) {
                    setHentBrevmalerError(true);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [sakstype]);

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
            id: values[BrevFormKeys.velgAnnenMottaker]
                ? values[BrevFormKeys.annenMottakerOrgNummer].replace(/\s/g, '')
                : values[BrevFormKeys.mottaker],
        };

        const dokumentMal = values[BrevFormKeys.brevmalkode];
        const dokumentdata = getDokumentdata(values, valgteMal);

        const brev = createBrev(søkerId, mottakerData, sakstype, dokumentMal, dokumentdata, journalpostId, fagsakId);
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
    };

    const onSubmitPreview = (values: IBrevForm) => {
        setPreviewMessageFeil(undefined);
        previewMessage(values, aktørId, sakstype, valgteMal, journalpostId, fagsakId).then((feil) =>
            setPreviewMessageFeil(feil),
        );
    };

    if (hentBrevmalerError) {
        return (
            <ErrorMessage size="small">
                <FormattedMessage id="brevComponent.error.hentBrevmalerError" />
            </ErrorMessage>
        );
    }

    if (!brevmaler) {
        return null;
    }
    // eslint-disable-next-line no-console
    console.log('TEST errors:', errors);
    return (
        <TypedFormProvider form={methods} onSubmit={onSubmit}>
            <div className="brev">
                <TypedFormSelect
                    name={BrevFormKeys.brevmalkode}
                    label={<FormattedMessage id="malVelger.brevmalkodeSelect.title" />}
                    className="w-[400px]"
                    onChange={() => {
                        setBrevErSendt(false);
                        setSendBrevFeilet(false);
                        setValgteMal(brevmaler[brevmalkode]);
                    }}
                    validate={validateBrevmalkode}
                >
                    <option disabled key="default" value="" label="">
                        <FormattedMessage id="malVelger.brevmalkodeSelect.velg" />
                    </option>

                    {Object.keys(brevmaler).map((kode) => (
                        <option key={kode} value={brevmaler[kode].kode}>
                            {brevmaler[kode].navn}
                        </option>
                    ))}
                </TypedFormSelect>

                <MottakerVelger
                    aktørId={aktørId}
                    arbeidsgivereMedNavn={arbeidsgivereMedNavn}
                    orgInfoPending={orgInfoPending}
                    person={person}
                    setError={setError}
                    resetBrevStatus={() => {
                        setPreviewMessageFeil(undefined);
                        setBrevErSendt(false);
                        setSendBrevFeilet(false);
                    }}
                    setOrgInfoPending={(value: boolean) => {
                        setOrgInfoPending(value);
                    }}
                />

                {visTittelInput && (
                    <>
                        <VerticalSpacer sixteenPx />

                        <TypedFormTextField
                            name={BrevFormKeys.overskrift}
                            label={<FormattedMessage id="brevComponent.tittel" />}
                            validate={(value) => validateText(value, 200)}
                            maxLength={200}
                            onChange={() => {
                                setPreviewMessageFeil(undefined);
                                if (setVisBrevIkkeSendtInfoboks) {
                                    setVisBrevIkkeSendtInfoboks(!harSendtMinstEttBrev);
                                }
                            }}
                        />
                    </>
                )}

                {visFritekstInput && (
                    <div className="textareaContainer">
                        <VerticalSpacer sixteenPx />

                        <TypedFormTextarea
                            name={BrevFormKeys.brødtekst}
                            label={<FormattedMessage id="brevComponent.innhold" />}
                            validate={(value) => validateText(value, 100000)}
                            maxLength={100000}
                            onChange={() => {
                                setPreviewMessageFeil(undefined);
                                if (setVisBrevIkkeSendtInfoboks) {
                                    setVisBrevIkkeSendtInfoboks(!harSendtMinstEttBrev);
                                }
                            }}
                        />

                        <Tag variant="warning" size="small" className="språkEtikett">
                            <FormattedMessage
                                id={
                                    brevmalkode === DokumentMalType.GENERELT_FRITEKSTBREV_NYNORSK
                                        ? 'brevComponent.språkEtikett.nynorsk'
                                        : 'brevComponent.språkEtikett.bokmål'
                                }
                            />
                        </Tag>
                    </div>
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
                                    <FormattedMessage id="brevComponent.btn.sendBrev" />
                                </Button>
                            )}

                            <Button
                                size="small"
                                type="button"
                                variant="tertiary"
                                icon={<FileSearchIcon aria-hidden />}
                                onClick={() => {
                                    handleSubmit(onSubmitPreview)();
                                }}
                            >
                                <FormattedMessage id="brevComponent.btn.forhåndsvisBrev" />
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
                            <FormattedMessage id="brevComponent.alert.brevErSendt" />
                        </Alert>
                    )}
                    {brevErSendt && sendBrevUtenModal && !brevFraModal && (
                        <Alert variant="success" size="medium" fullWidth inline>
                            <FormattedMessage id="brevComponent.alert.brevErSendt.etterKlassifisering" />
                        </Alert>
                    )}

                    {sendBrevFeilet && (
                        <Alert variant="error" size="medium" fullWidth inline>
                            <FormattedMessage id="brevComponent.alert.sendBrevFeilet" />
                        </Alert>
                    )}

                    {visSammeBrevError && (
                        <Alert variant="error" size="medium" fullWidth inline>
                            <FormattedMessage id="brevComponent.alert.visSammeBrevError" />
                        </Alert>
                    )}
                </div>
            </div>

            {!sendBrevUtenModal && (
                <div className="mt-7 pb-20 flex gap-x-4">
                    <Button
                        variant="primary"
                        className="sendBrevButton"
                        onClick={() => handleSubmit(() => setVisErDuSikkerModal(true))()}
                        size="small"
                        loading={isSubmitting || orgInfoPending}
                        disabled={isSubmitting || orgInfoPending}
                        type="button"
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
                            type="button"
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
        </TypedFormProvider>
    );
};

export default BrevComponent;
