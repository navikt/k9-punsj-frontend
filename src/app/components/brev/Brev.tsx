import { ArbeidsgivereResponse } from 'app/models/types/ArbeidsgivereResponse';
import Organisasjon from 'app/models/types/Organisasjon';
import { Hovedknapp } from 'nav-frontend-knapper';
import { Input, Select, Textarea } from 'nav-frontend-skjema';
import { Feilmelding } from 'nav-frontend-typografi';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { finnArbeidsgivere } from '../../api/api';
import VerticalSpacer from '../VerticalSpacer';
import './brev.less';
import dokumentMalType from './dokumentMalType';
import ugunstAarsakTyper from './ugunstAarsaksType';

// const lagVisningsnavnForMottaker = (
//     mottakerId: string,
//     personopplysninger?: Personopplysninger,
//     arbeidsgiverOpplysningerPerId?: ArbeidsgiverOpplysningerPerId
// ): string => {
//     if (
//         arbeidsgiverOpplysningerPerId &&
//         arbeidsgiverOpplysningerPerId[mottakerId] &&
//         arbeidsgiverOpplysningerPerId[mottakerId].navn
//     ) {
//         return `${arbeidsgiverOpplysningerPerId[mottakerId].navn} (${mottakerId})`;
//     }

//     if (personopplysninger && personopplysninger.aktoerId === mottakerId && personopplysninger.navn) {
//         return `${personopplysninger.navn} (${personopplysninger.fnr || personopplysninger.nummer || mottakerId})`;
//     }

//     return mottakerId;
// };

const showFritekst = (brevmalkode?: string, arsakskode?: string): boolean =>
    brevmalkode === dokumentMalType.INNHENT_DOK ||
    brevmalkode === dokumentMalType.KORRIGVARS ||
    brevmalkode === dokumentMalType.FRITKS ||
    brevmalkode === dokumentMalType.VARSEL_OM_TILBAKEKREVING ||
    (brevmalkode === dokumentMalType.REVURDERING_DOK && arsakskode === ugunstAarsakTyper.ANNET);

interface Brevmal {
    [key: string]: {
        navn: string;
        mottakere: string[];
    };
}

interface BrevProps {
    søkerId: string;
}

const Brev: React.FC<BrevProps> = ({ søkerId }) => {
    const intl = useIntl();
    const [brevmaler, setBrevmaler] = useState<Brevmal | undefined>(undefined);
    const [valgtBrevmal, setValgtBrevmal] = useState('');
    const [hentBrevmalerError, setHentBrevmalerError] = useState(false);
    const [arbeidsgivereMedNavn, setArbeidsgivereMedNavn] = useState<Organisasjon[]>([]);

    useEffect(() => {
        fetch('https://app-q1.adeo.no/k9/formidling/api/brev/maler?sakstype=OMP&avsenderApplikasjon=K9PUNSJ', {
            credentials: 'include',
        })
            .then((response) => response.json())
            .then((data) => {
                if (data?.status >= 400) {
                    setHentBrevmalerError(true);
                } else {
                    setBrevmaler(data);
                }
            })
            .catch((error) => {
                setHentBrevmalerError(true);
                throw error;
            });

        finnArbeidsgivere(søkerId, (response, data: ArbeidsgivereResponse) => {
            setArbeidsgivereMedNavn(data?.organisasjoner || []);
        });
    }, []);

    if (hentBrevmalerError) {
        return <Feilmelding>Henting av brevmaler feilet</Feilmelding>;
    }

    if (!brevmaler) {
        return null;
    }

    const brevmalkoder = Object.keys(brevmaler);

    return (
        <form
        // onSubmit={handleSubmit}
        >
            <Select
                name="brevmalkode"
                // readOnly={tmpls.length === 1 && brevmalkode && brevmalkode === tmpls[0].kode}
                label={intl.formatMessage({ id: 'Messages.Template' })}
                // validate={[required]}
                placeholder={intl.formatMessage({ id: 'Messages.ChooseTemplate' })}
                bredde="xxl"
                onChange={(event) => {
                    const { value } = event.target;
                    setValgtBrevmal(value);
                }}
            >
                {brevmalkoder.map((brevmalkode) => (
                    <option key={brevmalkode} value={brevmalkode}>
                        {brevmaler[brevmalkode].navn}
                    </option>
                ))}
            </Select>
            {arbeidsgivereMedNavn.length > 0 && (
                <>
                    <VerticalSpacer eightPx />
                    <Select
                        // key={brevmalkode}
                        name="overstyrtMottaker"
                        // readOnly={
                        //     recipients.length === 1 &&
                        //     overstyrtMottaker &&
                        //     overstyrtMottaker === JSON.stringify(recipients[0])
                        // }
                        label={intl.formatMessage({ id: 'Messages.Recipient' })}
                        // validate={[/* required, */ createValidateRecipient(recipients)]}
                        placeholder={intl.formatMessage({ id: 'Messages.ChooseRecipient' })}
                        bredde="xxl"
                    >
                        {arbeidsgivereMedNavn.map((arbeidsgiver) => (
                            <option key={arbeidsgiver.organisasjonsnummer} value={arbeidsgiver.organisasjonsnummer}>
                                {`${arbeidsgiver.navn} - ${arbeidsgiver.organisasjonsnummer}`}
                            </option>
                        ))}
                    </Select>
                </>
            )}
            {valgtBrevmal === dokumentMalType.INNHENT_DOK && (
                <>
                    <VerticalSpacer eightPx />
                    <div className="input--xxl">
                        <Textarea
                            name="fritekst"
                            label={intl.formatMessage({ id: 'Messages.Fritekst' })}
                            // validate={[required, maxLength4000, minLength3, hasValidText]}
                            value=""
                            onChange={() => null}
                            maxLength={4000}
                            // badges={[{ type: 'fokus', textId: languageCode, title: 'Messages.Beskrivelse' }]}
                        />
                    </div>
                </>
            )}
            {valgtBrevmal === dokumentMalType.GENERELT_FRITEKSTBREV && (
                <>
                    <div className="input--xxl">
                        <VerticalSpacer eightPx />
                        <Input
                            name="fritekstbrev.overskrift"
                            label={intl.formatMessage({ id: 'Messages.FritekstTittel' })}
                            // validate={[required, minLength3, maxLength200, hasValidText]}
                            maxLength={200}
                        />

                        <VerticalSpacer eightPx />
                        <Textarea
                            name="fritekstbrev.brødtekst"
                            label={intl.formatMessage({ id: 'Messages.Fritekst' })}
                            // validate={[required, minLength3, maxLength100000, hasValidText]}
                            maxLength={100000}
                            // badges={[{ type: 'fokus', textId: languageCode, title: 'Messages.Beskrivelse' }]}
                            value=""
                            onChange={() => null}
                        />
                    </div>
                </>
            )}
            <VerticalSpacer eightPx />
            <div className="buttonRow">
                <Hovedknapp
                    mini
                    // spinner={formProps.submitting}
                    // disabled={formProps.submitting}
                    // onClick={ariaCheck}
                >
                    {intl.formatMessage({ id: 'Messages.Submit' })}
                </Hovedknapp>
                {/* {valgtBrevmal && (
                        <button
                            type="button"
                            onClick={previewMessage}
                            onKeyDown={(e) => (e.keyCode === 13 ? previewMessage(e) : null)}
                            className={classNames(styles.previewLink, 'lenke lenke--frittstaende')}
                        >
                            {intl.formatMessage({ id: 'Messages.Preview' })}
                        </button>
                    )} */}
            </div>
        </form>
    );
};

export default Brev;
