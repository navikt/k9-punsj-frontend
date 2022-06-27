/* eslint-disable */
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { FormikErrors, FormikProps, setNestedObjectValues, useFormik, useFormikContext } from 'formik';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { connect } from 'react-redux';

import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import ModalWrapper from 'nav-frontend-modal';
import { ErrorSummary, Heading } from '@navikt/ds-react';

import { IInputError, ISignaturState } from 'app/models/types';
import { setIdentAction, setSignaturAction } from 'app/state/actions';
import intlHelper from 'app/utils/intlUtils';

import VerticalSpacer from '../../components/VerticalSpacer';
import { JaNeiIkkeRelevant } from '../../models/enums/JaNeiIkkeRelevant';
import { IIdentState } from '../../models/types/IdentState';
import { RootStateType } from '../../state/RootState';
import ErDuSikkerModal from '../../containers/pleiepenger/ErDuSikkerModal';
import { IOMPUTSoknad } from '../types/OMPUTSoknad';
import OpplysningerOmOMPUTSoknad from './OpplysningerOmSoknad/OpplysningerOmOMPUTSoknad';
import { OMPUTSoknadKvittering } from './SoknadKvittering/OMPUTSoknadKvittering';
import { IOMPUTSoknadUt } from '../types/OMPUTSoknadUt';
import { useMutation } from 'react-query';
import MellomlagringEtikett from 'app/components/mellomlagringEtikett/MellomlagringEtikett';
import { Feil, ValideringResponse } from 'app/models/types/ValideringResponse';
import { feilFraYup } from 'app/utils/validationHelpers';
import { oppdaterSoeknad, validerSoeknad } from '../api';
import VentModal from 'app/components/ventModal/VentModal';
import ForhaandsvisSoeknadModal from 'app/components/forhaandsvisSoeknadModal/ForhaandsvisSoeknadModal';
import IkkeRegistrerteOpplysninger from 'app/components/ikkeRegisterteOpplysninger/IkkeRegistrerteOpplysninger';
import { IOMPUTSoknadKvittering } from '../types/OMPUTSoknadKvittering';
import ArbeidsforholdVelger from './ArbeidsforholdVelger';
import Personvelger from 'app/components/person-velger/Personvelger';
import schema from '../schema';
import { debounce } from 'lodash';
import { frontendTilBackendMapping } from '../utils';

export interface IPunchOMPUTFormComponentProps {
    journalpostid: string;
    visForhaandsvisModal: boolean;
    setVisForhaandsvisModal: (vis: boolean) => void;
    k9FormatErrors: Feil[];
    setK9FormatErrors: (feil: Feil[]) => void;
    submitError: unknown;
}

export interface IPunchOMPUTFormStateProps {
    signaturState: ISignaturState;
    identState: IIdentState;
}

export interface IPunchOMPUTFormDispatchProps {
    setIdentAction: typeof setIdentAction;
    setSignaturAction: typeof setSignaturAction;
}

type IPunchOMPUTFormProps = IPunchOMPUTFormComponentProps &
    WrappedComponentProps &
    IPunchOMPUTFormStateProps &
    IPunchOMPUTFormDispatchProps;

export const PunchOMPUTFormComponent: React.FC<IPunchOMPUTFormProps> = (props) => {
    const {
        intl,
        signaturState,
        identState,
        visForhaandsvisModal,
        setVisForhaandsvisModal,
        k9FormatErrors,
        setK9FormatErrors,
        journalpostid,
        submitError,
    } = props;
    const { signert } = signaturState;
    const [harMellomlagret, setHarMellomlagret] = useState(false);
    const [visVentModal, setVisVentModal] = useState(false);
    const [visErDuSikkerModal, setVisErDuSikkerModal] = useState(false);
    const [feilmeldingStier, setFeilmeldingStier] = useState(new Set());
    const [harForsoektAaSendeInn, setHarForsoektAaSendeInn] = useState(false);
    const [kvittering, setKvittering] = useState<IOMPUTSoknadKvittering | undefined>(undefined);
    const { values, errors, touched, setTouched } = useFormikContext<IOMPUTSoknad>();
    console.log(values);
    // OBS: SkalForhaandsviseSoeknad brukes i onSuccess
    const { mutate: valider } = useMutation(
        ({ skalForhaandsviseSoeknad }: { skalForhaandsviseSoeknad?: boolean }) =>
            validerSoeknad(frontendTilBackendMapping(values), identState.ident1),
        {
            onSuccess: (data: ValideringResponse | IOMPUTSoknadKvittering, { skalForhaandsviseSoeknad }) => {
                if (data['ytelse'] && skalForhaandsviseSoeknad) {
                    const kvitteringResponse = data as IOMPUTSoknadKvittering;
                    setVisForhaandsvisModal(true);
                    setKvittering(kvitteringResponse);
                }
                if (data['feil']?.length) {
                    setK9FormatErrors(data['feil']);
                    setKvittering(undefined);
                }
            },
        }
    );

    const {
        isLoading: mellomlagrer,
        error: mellomlagringError,
        mutate: mellomlagreSoeknad,
    } = useMutation(() => oppdaterSoeknad(frontendTilBackendMapping(values)), {
        onSuccess: () => setHarMellomlagret(true),
    });

    const updateSoknad = (soknad: IOMPUTSoknad) => {
        const journalposter = Array.from(soknad?.journalposter || []);

        if (!journalposter.includes(props.journalpostid)) {
            journalposter.push(props.journalpostid);
        }
        //TODO: legg inn journalposter som mangler
        if (harForsoektAaSendeInn) {
            valider({ skalForhaandsviseSoeknad: false });
            setTouched(setNestedObjectValues(values, true));
        }

        return mellomlagreSoeknad();
    };

    useEffect(() => {
        setIdentAction(values.soekerId);
    }, [values.soekerId]);

    const debounceCallback = useCallback(
        debounce(() => updateSoknad(values), 3000),
        []
    );
    useEffect(() => {
        debounceCallback();
    }, [values]);

    useEffect(() => {
        if (harMellomlagret) {
            setTimeout(() => setHarMellomlagret(false), 3000);
        }
    }, [harMellomlagret]);

    //TODO: bør flytttes
    const getUhaandterteFeil = (attribute: string): (string | undefined)[] => {
        if (!feilmeldingStier.has(attribute)) {
            setFeilmeldingStier(feilmeldingStier.add(attribute));
        }

        const uhaandterteFeilmeldinger = k9FormatErrors?.filter((m: IInputError) => {
            const felter = m.felt?.split('.') || [];
            for (let index = felter.length - 1; index >= -1; index--) {
                const felt = felter.slice(0, index + 1).join('.');
                const andreFeilmeldingStier = new Set(feilmeldingStier);
                andreFeilmeldingStier.delete(attribute);
                if (attribute === felt) {
                    return true;
                }
                if (andreFeilmeldingStier.has(felt)) {
                    return false;
                }
            }
            return false;
        });

        if (uhaandterteFeilmeldinger && uhaandterteFeilmeldinger?.length > 0) {
            return uhaandterteFeilmeldinger.map((error) => error.feilmelding).filter(Boolean);
        }
        return [];
    };

    const harFeilISkjema = (errors: FormikErrors<IOMPUTSoknad>) =>
        !![...getUhaandterteFeil(''), ...Object.keys(errors)].length;

    return (
        <>
            <MellomlagringEtikett lagrer={mellomlagrer} lagret={harMellomlagret} error={!!mellomlagringError} />
            <VerticalSpacer sixteenPx />
            <OpplysningerOmOMPUTSoknad intl={intl} setSignaturAction={props.setSignaturAction} signert={signert} />
            <VerticalSpacer sixteenPx />
            <Heading size="xsmall" spacing>
                Barn
            </Heading>
            <Personvelger name="barn" sokersIdent={values.soekerId} populerMedBarn={!values.barn.length} />
            <VerticalSpacer fourtyPx />
            <ArbeidsforholdVelger />
            <VerticalSpacer fourtyPx />
            <IkkeRegistrerteOpplysninger intl={intl} />
            <VerticalSpacer twentyPx={true} />
            {harForsoektAaSendeInn && harFeilISkjema(errors) && (
                <ErrorSummary heading="Du må fikse disse feilene før du kan sende inn punsjemeldingen.">
                    {getUhaandterteFeil('').map((feilmelding) => {
                        return <ErrorSummary.Item key={feilmelding}>{feilmelding}</ErrorSummary.Item>;
                    })}
                    {/* Denne bør byttes ut med errors fra formik*/}
                    {feilFraYup(schema, values, values.metadata.arbeidsforhold).map(
                        (error: { message: string; path: string }) => {
                            return (
                                <ErrorSummary.Item key={`${error.path}-${error.message}`}>
                                    {error.message}
                                </ErrorSummary.Item>
                            );
                        }
                    )}
                </ErrorSummary>
            )}
            <div className={'submit-knapper'}>
                <p className="sendknapp-wrapper">
                    <Knapp
                        className={'send-knapp'}
                        onClick={() => {
                            if (!harForsoektAaSendeInn) {
                                setHarForsoektAaSendeInn(true);
                                setTouched(setNestedObjectValues(values, true));
                            }
                            valider({ skalForhaandsviseSoeknad: true });
                        }}
                    >
                        {intlHelper(intl, 'skjema.knapp.send')}
                    </Knapp>

                    <Knapp className={'vent-knapp'} onClick={() => setVisVentModal(true)} disabled={false}>
                        {intlHelper(intl, 'skjema.knapp.settpaavent')}
                    </Knapp>
                </p>
            </div>
            <VerticalSpacer sixteenPx={true} />
            {mellomlagringError instanceof Error && (
                <AlertStripeFeil>{intlHelper(intl, 'skjema.feil.ikke_lagret')}</AlertStripeFeil>
            )}
            {submitError instanceof Error && <AlertStripeFeil>{intlHelper(intl, submitError.message)}</AlertStripeFeil>}
            {visVentModal && (
                <VentModal journalpostId={journalpostid} soeknadId={values.soeknadId} visModalFn={setVisVentModal} />
            )}
            {visForhaandsvisModal && (
                <ForhaandsvisSoeknadModal
                    avbryt={() => setVisForhaandsvisModal(false)}
                    videre={() => {
                        setVisForhaandsvisModal(false);
                        setVisErDuSikkerModal(true);
                    }}
                    intl={intl}
                >
                    <OMPUTSoknadKvittering intl={intl} response={kvittering} />
                </ForhaandsvisSoeknadModal>
            )}

            {visErDuSikkerModal && (
                <ModalWrapper
                    key={'erdusikkermodal'}
                    className={'erdusikkermodal'}
                    onRequestClose={() => setVisErDuSikkerModal(false)}
                    contentLabel={'erdusikkermodal'}
                    closeButton={false}
                    isOpen={visErDuSikkerModal}
                >
                    <ErDuSikkerModal
                        melding={'modal.erdusikker.sendinn'}
                        extraInfo={'modal.erdusikker.sendinn.extrainfo'}
                        onSubmit={() => {
                            throw Error('vennligst implementer meg. hilsen onSubmit');
                        }}
                        submitKnappText={'skjema.knapp.send'}
                        onClose={() => {
                            setVisErDuSikkerModal(false);
                        }}
                    />
                </ModalWrapper>
            )}
        </>
    );
};

const mapStateToProps = (state: RootStateType): IPunchOMPUTFormStateProps => ({
    signaturState: state.OMSORGSPENGER_MIDLERTIDIG_ALENE.signaturState,
    identState: state.identState,
});

const mapDispatchToProps = (dispatch: any) => ({
    setSignaturAction: (signert: JaNeiIkkeRelevant | null) => dispatch(setSignaturAction(signert)),
    setIdentAction: (ident1: string, ident2: string | null) => dispatch(setIdentAction(ident1, ident2)),
});

export const OMPUTPunchForm = injectIntl(connect(mapStateToProps, mapDispatchToProps)(PunchOMPUTFormComponent));
/* eslint-enable */
