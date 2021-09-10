import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Knapp } from 'nav-frontend-knapper';
import { FieldArray, Form } from 'formik';
import Knapper from '../../../components/knapp/Knapper';
import RadioInput from '../../../components/skjema/RadioInput';
import { JaNei } from '../../../models/enums';
import TextInput from '../../../components/skjema/TextInput';
import NumberInput from '../../../components/skjema/NumberInput';
import {
    Innsendingsstatus,
    Mottaker,
    useOverføringPunchSkjemaContext,
} from '../../../models/forms/omsorgspenger/overføring/PunchSkjema';
import CheckboxInputGruppe from '../../../components/skjema/CheckboxInputGruppe';
import FlexRow from '../../../components/flexgrid/FlexRow';
import VerticalSpacer from '../../../components/VerticalSpacer';
import { Undertittel } from 'nav-frontend-typografi';
import './overføringPunchSkjema.less';
import { IError } from '../../../models/types';
import { Tilbakeknapp, Xknapp } from 'nav-frontend-ikonknapper';
import { SkjemaGruppe } from 'nav-frontend-skjema';
import DateInput from '../../../components/skjema/DateInput';
import InnsendingModal from './InnsendingModal';
import LeggTilKnapp from '../../../components/knapp/LeggTilKnapp';
import { JournalpostPanel } from '../../../components/journalpost-panel/JournalpostPanel';

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
                <VerticalSpacer sixteenPx={true} />
                <JournalpostPanel />
                <DateInput feltnavn="mottaksdato" bredde="M" />
                <VerticalSpacer twentyPx={true} dashed={true} />
                <Undertittel tag="h2">
                    <FormattedMessage id="omsorgsdager.overføring.punch.omsøkeren" />
                </Undertittel>
                <VerticalSpacer sixteenPx={true} />
                <CheckboxInputGruppe
                    feltnavn="arbeidssituasjon"
                    checkboxFeltnavn={['erArbeidstaker', 'erFrilanser', 'erSelvstendigNæringsdrivende']}
                    metaHarFeilFeltnavn="metaHarFeil"
                    disabled={disabled}
                    styling="medPanel"
                />
                <VerticalSpacer sixteenPx={true} />
                <RadioInput
                    feltnavn="borINorge"
                    optionValues={Object.values(JaNei)}
                    retning="horisontal"
                    styling="medPanel"
                    disabled={disabled}
                />
                <VerticalSpacer sixteenPx={true} />
                <RadioInput
                    feltnavn="aleneOmOmsorgen"
                    optionValues={Object.values(JaNei)}
                    retning="horisontal"
                    styling="medPanel"
                    disabled={disabled}
                />
                <VerticalSpacer dashed={true} twentyPx={true} />
                <Undertittel tag="h2">
                    <FormattedMessage id="skjema.felt.barn" />
                </Undertittel>
                <VerticalSpacer sixteenPx={true} />
                <FieldArray
                    name="barn"
                    render={({ push, remove }) => (
                        <>
                            {values.barn.map((b, index) => (
                                <SkjemaGruppe key={index}>
                                    <legend className="sr-only">
                                        <FormattedMessage
                                            id="omsorgsdager.overføring.barn.nummer"
                                            values={{ nummer: index + 1 }}
                                        />
                                    </legend>
                                    <FlexRow childrenMargin="small">
                                        <TextInput feltnavn={`barn[${index}].norskIdent`} bredde="M" />
                                        <DateInput feltnavn={`barn[${index}].fødselsdato`} bredde="M" />
                                        {values.barn.length > 1 && (
                                            <Xknapp
                                                htmlType="button"
                                                onClick={() => remove(index)}
                                                className="alignMedInputFelt"
                                            />
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
                <VerticalSpacer dashed={true} twentyPx={true} />
                <Undertittel tag="h2">
                    <FormattedMessage id="omsorgsdager.overføring.punch.omsorgendelesmed" />
                </Undertittel>
                <VerticalSpacer sixteenPx={true} />
                <TextInput feltnavn="omsorgenDelesMed.norskIdent" bredde="M" disabled={disabled} />
                <VerticalSpacer sixteenPx={true} />
                <RadioInput
                    feltnavn="omsorgenDelesMed.mottaker"
                    optionValues={Object.values(Mottaker)}
                    retning="horisontal"
                    styling="medPanel"
                    disabled={disabled}
                />
                <VerticalSpacer sixteenPx={true} />
                {values.omsorgenDelesMed?.mottaker === Mottaker.Samboer && (
                    <>
                        <DateInput feltnavn="omsorgenDelesMed.samboerSiden" bredde="M" />
                        <VerticalSpacer sixteenPx={true} />
                    </>
                )}
                <NumberInput feltnavn="omsorgenDelesMed.antallOverførteDager" />
                <Knapper>
                    <Tilbakeknapp htmlType="button" onClick={gåTilForrigeSteg} disabled={disabled}>
                        <FormattedMessage id="ident.knapp.forrigesteg" />
                    </Tilbakeknapp>
                    <Knapp htmlType="submit" type="hoved" disabled={disabled} onClick={() => setVisModalVedFeil(true)}>
                        <FormattedMessage id="omsorgsdager.overføring.punch.sendinn" />
                    </Knapp>
                </Knapper>
                <InnsendingModal
                    innsendingsstatus={innsendingsstatus}
                    vis={visModal}
                    onRequestClose={() => setVisModalVedFeil(false)}
                    innsendingsfeil={innsendingsfeil}
                />
            </section>
        </Form>
    );
};

export default OverføringPunchSkjema;
