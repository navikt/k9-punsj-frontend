import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { FieldArray, Form } from 'formik';

import { Back, Close } from '@navikt/ds-icons';
import { Button, Heading } from '@navikt/ds-react';
import { SkjemaGruppe } from 'nav-frontend-skjema';
import FlexRow from '../../../components/flexgrid/FlexRow';
import { JournalpostPanel } from '../../../components/journalpost-panel/JournalpostPanel';
import Knapper from '../../../components/knapp/Knapper';
import LeggTilKnapp from '../../../components/knapp/LeggTilKnapp';
import CheckboxInputGruppe from '../../../components/skjema/CheckboxInputGruppe';
import NumberInput from '../../../components/skjema/NumberInput';
import RadioInput from '../../../components/skjema/RadioInput';
import TextInput from '../../../components/skjema/TextInput';
import VerticalSpacer from '../../../components/VerticalSpacer';
import { JaNei } from '../../../models/enums';
import {
    Innsendingsstatus,
    Mottaker,
    useOverføringPunchSkjemaContext,
} from '../../../models/forms/omsorgspenger/overføring/PunchSkjema';
import { IError } from '../../../models/types';
import InnsendingModal from './InnsendingModal';
import OverføringDateInput from './OverføringDateInput';
import './overføringPunchSkjema.less';

interface IOverføringPunchSkjema {
    gåTilForrigeSteg: () => void;
    innsendingsstatus: Innsendingsstatus;
    innsendingsfeil?: IError;
    journalpostId: string;
    ident?: string;
}

const OverføringPunchSkjema: React.FunctionComponent<IOverføringPunchSkjema> = ({
    gåTilForrigeSteg,
    innsendingsstatus,
    innsendingsfeil,
    journalpostId,
    ident,
}) => {
    const { values, setFieldValue } = useOverføringPunchSkjemaContext();
    const disabled = useMemo(() => {
        switch (innsendingsstatus) {
            case Innsendingsstatus.IkkeSendtInn:
            case Innsendingsstatus.Innsendingsfeil:
                return false;
            case Innsendingsstatus.SenderInn:
            case Innsendingsstatus.SendtInn:
                return true;
            default:
                return false;
        }
    }, [innsendingsstatus]);

    const avsendersFnr = values.norskIdent;
    useEffect(() => {
        if (!avsendersFnr) {
            setFieldValue('norskIdent', ident);
        }
    }, [ident]);

    const [visModalVedFeil, setVisModalVedFeil] = useState<boolean>(true);

    const visModal = useMemo(() => {
        switch (innsendingsstatus) {
            case Innsendingsstatus.SenderInn:
            case Innsendingsstatus.SendtInn:
                return true;
            case Innsendingsstatus.Innsendingsfeil:
                return visModalVedFeil;
            case Innsendingsstatus.IkkeSendtInn:
            default:
                return false;
        }
    }, [innsendingsstatus, visModalVedFeil]);

    return (
        <Form>
            <section>
                <VerticalSpacer sixteenPx />
                <JournalpostPanel />
                <OverføringDateInput feltnavn="mottaksdato" bredde="M" />
                <VerticalSpacer twentyPx dashed />
                <Heading size="small" level="2">
                    <FormattedMessage id="omsorgsdager.overføring.punch.omsøkeren" />
                </Heading>
                <VerticalSpacer sixteenPx />
                <CheckboxInputGruppe
                    feltnavn="arbeidssituasjon"
                    checkboxFeltnavn={['erArbeidstaker', 'erFrilanser', 'erSelvstendigNæringsdrivende']}
                    metaHarFeilFeltnavn="metaHarFeil"
                    disabled={disabled}
                    styling="medPanel"
                />
                <VerticalSpacer sixteenPx />
                <RadioInput
                    feltnavn="borINorge"
                    optionValues={Object.values(JaNei)}
                    retning="horisontal"
                    styling="medPanel"
                    disabled={disabled}
                />
                <VerticalSpacer sixteenPx />
                <RadioInput
                    feltnavn="aleneOmOmsorgen"
                    optionValues={Object.values(JaNei)}
                    retning="horisontal"
                    styling="medPanel"
                    disabled={disabled}
                />
                <VerticalSpacer dashed twentyPx />
                <Heading size="small" level="2">
                    <FormattedMessage id="skjema.felt.barn" />
                </Heading>
                <VerticalSpacer sixteenPx />
                <FieldArray
                    name="barn"
                    render={({ push, remove }) => (
                        <>
                            {values.barn.map((b, index) => (
                                <SkjemaGruppe key={b.norskIdent}>
                                    <legend className="sr-only">
                                        <FormattedMessage
                                            id="omsorgsdager.overføring.barn.nummer"
                                            values={{ nummer: index + 1 }}
                                        />
                                    </legend>
                                    <FlexRow childrenMargin="small">
                                        <TextInput feltnavn={`barn[${index}].norskIdent`} bredde="M" />
                                        <OverføringDateInput feltnavn={`barn[${index}].fødselsdato`} bredde="M" />
                                        {values.barn.length > 1 && (
                                            <Button
                                                icon={<Close aria-hidden />}
                                                type="button"
                                                onClick={() => remove(index)}
                                                className="alignMedInputFelt"
                                            >
                                                <span className="sr-only">Lukk</span>
                                            </Button>
                                        )}
                                    </FlexRow>
                                </SkjemaGruppe>
                            ))}
                            <LeggTilKnapp
                                onClick={() => push({ norskIdent: null, fødselsdato: null })}
                                tekstId="omsorgsdager.overføring.barn.leggTil"
                            />
                        </>
                    )}
                />
                <VerticalSpacer dashed twentyPx />
                <Heading size="small" level="2">
                    <FormattedMessage id="omsorgsdager.overføring.punch.omsorgendelesmed" />
                </Heading>
                <VerticalSpacer sixteenPx />
                <TextInput feltnavn="omsorgenDelesMed.norskIdent" bredde="M" disabled={disabled} />
                <VerticalSpacer sixteenPx />
                <RadioInput
                    feltnavn="omsorgenDelesMed.mottaker"
                    optionValues={Object.values(Mottaker)}
                    retning="horisontal"
                    styling="medPanel"
                    disabled={disabled}
                />
                <VerticalSpacer sixteenPx />
                {values.omsorgenDelesMed?.mottaker === Mottaker.Samboer && (
                    <>
                        <OverføringDateInput feltnavn="omsorgenDelesMed.samboerSiden" bredde="M" />
                        <VerticalSpacer sixteenPx />
                    </>
                )}
                <NumberInput feltnavn="omsorgenDelesMed.antallOverførteDager" />
                <Knapper>
                    <Button
                        variant="tertiary"
                        icon={<Back aria-hidden />}
                        type="button"
                        onClick={gåTilForrigeSteg}
                        disabled={disabled}
                    >
                        <FormattedMessage id="ident.knapp.forrigesteg" />
                    </Button>
                    <Button
                        variant="secondary"
                        type="submit"
                        disabled={disabled}
                        onClick={() => setVisModalVedFeil(true)}
                    >
                        <FormattedMessage id="omsorgsdager.overføring.punch.sendinn" />
                    </Button>
                </Knapper>
                <InnsendingModal
                    innsendingsstatus={innsendingsstatus}
                    vis={visModal}
                    onClose={() => setVisModalVedFeil(false)}
                    innsendingsfeil={innsendingsfeil}
                />
            </section>
        </Form>
    );
};

export default OverføringPunchSkjema;
