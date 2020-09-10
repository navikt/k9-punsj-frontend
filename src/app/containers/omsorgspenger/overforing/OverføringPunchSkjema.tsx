import React, { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
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
import { useRouteMatch } from 'react-router';
import LabelValue from '../../../components/skjema/LabelValue';
import { Undertittel } from 'nav-frontend-typografi';
import NavFrontendSpinner from 'nav-frontend-spinner';
import ModalWrapper from 'nav-frontend-modal';
import './overføringPunchSkjema.less';
import intlHelper from '../../../utils/intlUtils';
import { NavLink } from 'react-router-dom';
import CheckSvg from '../../../assets/SVG/CheckSVG';
import { IError } from '../../../models/types';
import { Xknapp } from 'nav-frontend-ikonknapper';
import { SkjemaGruppe } from 'nav-frontend-skjema';
import DateInput from '../../../components/skjema/DateInput';

interface IOverføringPunchSkjema {
  gåTilForrigeSteg: () => void;
  innsendingsstatus: Innsendingsstatus;
  innsendingsfeil?: IError;
}

const OverføringPunchSkjema: React.FunctionComponent<IOverføringPunchSkjema> = ({
  gåTilForrigeSteg,
  innsendingsstatus,
  innsendingsfeil,
}) => {
  const { values } = useOverføringPunchSkjemaContext();
  const { params } = useRouteMatch<{ ident?: string }>();
  const ident = params?.ident;
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

  const intl = useIntl();

  return (
    <Form>
      <section>
        <VerticalSpacer sixteenPx={true} />
        <DateInput feltnavn="mottaksdato" bredde="M" />
        <VerticalSpacer sixteenPx={true} />
        <Undertittel tag="h2">
          <FormattedMessage id="omsorgsdager.overføring.punch.omsøkeren" />
        </Undertittel>
        <VerticalSpacer sixteenPx={true} />
        <LabelValue
          labelTextId="omsorgsdager.overføring.fødselsnummer"
          value={ident}
        />
        <VerticalSpacer sixteenPx={true} />
        <CheckboxInputGruppe
          feltnavn="arbeidssituasjon"
          checkboxFeltnavn={[
            'erArbeidstaker',
            'erFrilanser',
            'erSelvstendigNæringsdrivende',
          ]}
          metaHarFeilFeltnavn="metaHarFeil"
          disabled={disabled}
        />
        <VerticalSpacer sixteenPx={true} />
        <RadioInput
          feltnavn="aleneOmOmsorgen"
          optionValues={Object.values(JaNei)}
          retning="vertikal"
          styling="utenPanel"
          disabled={disabled}
        />
        <VerticalSpacer dashed={true} thirtyTwoPx={true} />
        <Undertittel tag="h2">
          <FormattedMessage id="skjema.felt.barn" />
        </Undertittel>
        <VerticalSpacer sixteenPx={true} />
        <FieldArray
          name="barn"
          render={({ push, remove }) => (
            <SkjemaGruppe>
              {values.barn.map((b, index) => (
                <FlexRow key={index} childrenMargin="small">
                  <TextInput
                    feltnavn={`barn[${index}].fødselsnummer`}
                    bredde="M"
                  />
                  {values.barn.length > 1 && (
                    <Xknapp
                      htmlType="button"
                      onClick={() => remove(index)}
                      className="alignMedInputFelt"
                    />
                  )}
                </FlexRow>
              ))}
              <Knapp
                onClick={() => push({ fødselsnummer: '' })}
                htmlType="button"
                type="flat"
                mini={true}
              >
                <FormattedMessage id="omsorgsdager.overføring.barn.leggTil" />
              </Knapp>
            </SkjemaGruppe>
          )}
        />
        <VerticalSpacer dashed={true} thirtyTwoPx={true} />
        <Undertittel tag="h2">
          <FormattedMessage id="omsorgsdager.overføring.punch.omsorgendelesmed" />
        </Undertittel>
        <VerticalSpacer sixteenPx={true} />
        <TextInput
          feltnavn="omsorgenDelesMed.fødselsnummer"
          bredde="M"
          disabled={disabled}
        />
        <VerticalSpacer thirtyTwoPx={true} />
        <FlexRow childrenMargin="medium">
          <RadioInput
            feltnavn="omsorgenDelesMed.mottaker"
            optionValues={Object.values(Mottaker)}
            retning="vertikal"
            styling="utenPanel"
            disabled={disabled}
          />
          {values.omsorgenDelesMed?.mottaker === Mottaker.Samboer && (
            <DateInput feltnavn="omsorgenDelesMed.samboerSiden" bredde="M" />
          )}
        </FlexRow>
        <VerticalSpacer sixteenPx={true} />
        <NumberInput feltnavn="omsorgenDelesMed.antallOverførteDager" />
        <Knapper>
          <Knapp
            htmlType="button"
            onClick={gåTilForrigeSteg}
            disabled={disabled}
          >
            <FormattedMessage id="ident.knapp.forrigesteg" />
          </Knapp>
          <Knapp
            htmlType="submit"
            type="hoved"
            disabled={disabled}
            onClick={() => setVisModalVedFeil(true)}
          >
            <FormattedMessage id="ident.knapp.nestesteg" />
          </Knapp>
        </Knapper>
        <ModalWrapper
          onRequestClose={() => setVisModalVedFeil(false)}
          contentLabel={intlHelper(
            intl,
            'omsorgsdager.overføring.punch.modal.beskrivelse'
          )}
          isOpen={visModal}
          className="innsendingsmodal"
          closeButton={innsendingsstatus === Innsendingsstatus.Innsendingsfeil}
          shouldCloseOnOverlayClick={true}
        >
          <>
            <Undertittel tag="h2">
              <FormattedMessage id="omsorgsdager.overføring.punch.modal.tittel" />
            </Undertittel>
            <VerticalSpacer sixteenPx={true} />
            {innsendingsstatus === Innsendingsstatus.SenderInn && (
              <FlexRow childrenMargin="small" alignItemsToCenter={true}>
                <NavFrontendSpinner />
                <span>
                  <FormattedMessage id="omsorgsdager.overføring.punch.modal.senderInn" />
                </span>
              </FlexRow>
            )}
            {innsendingsstatus === Innsendingsstatus.SendtInn && (
              <>
                <FlexRow childrenMargin="small" alignItemsToCenter={true}>
                  <CheckSvg title={<FormattedMessage id="check.svg.title" />} />
                  <span>
                    <FormattedMessage id="omsorgsdager.overføring.punch.modal.sendtInn" />
                  </span>
                </FlexRow>
                <VerticalSpacer sixteenPx={true} />
                <NavLink to={'#'}>
                  <FormattedMessage id="omsorgsdager.overføring.punch.modal.success.gåTilLos" />
                </NavLink>
              </>
            )}
            {innsendingsstatus === Innsendingsstatus.Innsendingsfeil && (
              <>
                <FormattedMessage id="omsorgsdager.overføring.punch.modal.feil" />
                <VerticalSpacer sixteenPx={true} />
                {JSON.stringify(innsendingsfeil)}
              </>
            )}
          </>
        </ModalWrapper>
      </section>
    </Form>
  );
};

export default OverføringPunchSkjema;
