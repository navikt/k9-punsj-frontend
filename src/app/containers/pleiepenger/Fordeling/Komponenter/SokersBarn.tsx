import {JaNei} from 'app/models/enums';
import {IJournalpost} from 'app/models/types';
import {setIdentAction,
} from 'app/state/actions';
import {RootStateType} from 'app/state/RootState';
import intlHelper from 'app/utils/intlUtils';
import {AlertStripeInfo} from 'nav-frontend-alertstriper';

import React, {useEffect, useState} from 'react';
import {injectIntl, WrappedComponentProps,} from 'react-intl';
import {connect} from 'react-redux';

import {Checkbox, Input, Select} from "nav-frontend-skjema";
import {IIdentState} from "../../../../models/types/IdentState";
import {IFellesState} from "../../../../state/reducers/FellesReducer";
import {setIdentFellesAction} from "../../../../state/actions/IdentActions";
import VerticalSpacer from "../../../../components/VerticalSpacer";
import {hentBarn} from "../../../../state/reducers/HentBarn";
import WarningCircle from "../../../../assets/SVG/WarningCircle";
import {skalViseFeilmelding} from "../FordelingFeilmeldinger";

export interface ISokersBarnStateProps {
    journalpost?: IJournalpost;
    identState: IIdentState;
    fellesState: IFellesState;
    dedupkey: string;
}

export interface ISokersBarnDispatchProps {
    setIdentAction: typeof setIdentFellesAction;
    hentBarn: typeof hentBarn;
}

export interface ISokersBarn {
    sokersIdent: string;
    barnetHarInteFnrFn?: (harBarnetFnr: boolean) => void;
    erBarnUtdatert?: boolean;
    riktigIdentIJournalposten?: JaNei;
}

type ISokersBarnProps = WrappedComponentProps &
    ISokersBarnStateProps &
    ISokersBarnDispatchProps &
    ISokersBarn;

const SokersBarnComponent: React.FunctionComponent<ISokersBarnProps> = (
    props: ISokersBarnProps
) => {
    const {
        intl,
        barnetHarInteFnrFn,
        journalpost,
        identState,
        erBarnUtdatert,
        riktigIdentIJournalposten,
        sokersIdent,
        fellesState
    } = props;

    const journalpostident = journalpost?.norskIdent;

    const [barnetsIdent, setBarnetsIdent] = useState<string>('');
    const [barnetHarIkkeFnr, setBarnetHarIkkeFnr] = useState<boolean>(false);
    const [gjelderAnnetBarn, setGjelderAnnetBarn] = useState<boolean>(false);


    useEffect(() => {
        if(!!journalpost && typeof journalpost?.norskIdent !== 'undefined') {
            props.hentBarn(journalpost?.norskIdent);
        }
    }, []);

    const barnetsIdentInputFieldOnChange = (event: any) => {
        setBarnetsIdent(event.target.value.replace(/\D+/, ''));
    }

    const oppdaterStateMedBarnetsFnr = (event: any) => {
        props.setIdentAction(!!riktigIdentIJournalposten && riktigIdentIJournalposten === JaNei.JA ? (journalpostident || '') : sokersIdent, event.target.value, identState.annenSokerIdent);
    }

    const nullUtBarnetsIdent = () => {
        setBarnetsIdent('');
        setIdentAction(identState.ident1, '');
        props.setIdentAction(identState.ident1, '', identState.annenSokerIdent);
    }

    const barnHarIkkeFnrCheckboks = (checked: boolean) => {
        setBarnetHarIkkeFnr(checked);
        if(barnetHarInteFnrFn) barnetHarInteFnrFn(checked);
        if (checked) {
            setBarnetsIdent('');
            props.setIdentAction(!!riktigIdentIJournalposten && riktigIdentIJournalposten === JaNei.JA ? (journalpostident || '') : sokersIdent, null);
        }
    }

    return (<div className="sokersBarn">
        {!erBarnUtdatert && !!fellesState.hentBarnSuccess && typeof fellesState.barn !== 'undefined' && fellesState.barn.length > 0 && <>
          <Select
            value={barnetsIdent}
            bredde="l"
            label={intlHelper(intl, 'ident.identifikasjon.velgBarn')}
            onChange={(e) => {barnetsIdentInputFieldOnChange(e); oppdaterStateMedBarnetsFnr(e);}}
            disabled={gjelderAnnetBarn}
          >
            <option key="default" value="" label=" " />
            )

              {fellesState.barn.map(b =>
                  <option key={b.identitetsnummer} value={b.identitetsnummer}>
                      {`${b.fornavn} ${b.etternavn} - ${b.identitetsnummer}`}
                  </option>)
              }
          </Select>
          <VerticalSpacer eightPx/>
          <Checkbox
            label={intlHelper(intl, 'ident.identifikasjon.annetBarn')}
            onChange={(e) => {
                setGjelderAnnetBarn(e.target.checked);
                nullUtBarnetsIdent();
            }}
          />
        </>
        }
        <VerticalSpacer sixteenPx/>
        {(gjelderAnnetBarn
            || !!fellesState.hentBarnError
            || !!fellesState.hentBarnForbidden
            || (!!fellesState.barn && fellesState.barn.length === 0))
        && <>
          <div className="fyllUtIdentAnnetBarnContainer">
            <Input
              label={intlHelper(intl, 'ident.identifikasjon.barn')}
              onChange={barnetsIdentInputFieldOnChange}
              onBlur={oppdaterStateMedBarnetsFnr}
              value={barnetsIdent}
              className="bold-label ident-soker-2"
              maxLength={11}
              feil={
                  skalViseFeilmelding(identState.ident2)
                      ? intlHelper(intl, 'ident.feil.ugyldigident')
                      : undefined
              }
              bredde="M"
              disabled={barnetHarIkkeFnr}
            />
              {barnetsIdent.length === 11 && !skalViseFeilmelding(identState.ident2) &&
              <div className="dobbelSjekkIdent">
                <div><WarningCircle/></div>
                <p><b>{intlHelper(intl, 'ident.identifikasjon.dobbelsjekkident')}</b></p></div>}
          </div>
          <VerticalSpacer eightPx/>
            {barnetHarInteFnrFn && <>
              <Checkbox
                label={intlHelper(intl, 'ident.identifikasjon.barnHarIkkeFnr')}
                onChange={(e) => barnHarIkkeFnrCheckboks(e.target.checked)}
              />
                {barnetHarIkkeFnr && <AlertStripeInfo
                  className="infotrygd_info"> {intlHelper(intl, 'ident.identifikasjon.barnHarIkkeFnrInformasjon')}</AlertStripeInfo>}
            </>}
          <VerticalSpacer sixteenPx/>
        </>}
    </div>);
};

const mapStateToProps = (state: RootStateType) => ({
    journalpost: state.felles.journalpost,
    identState: state.identState,
    fellesState: state.felles,
    dedupkey: state.felles.dedupKey
});

const mapDispatchToProps = (dispatch: any) => ({
    setIdentAction: (ident1: string, ident2: string | null, annenSokerIdent: string | null) =>
        dispatch(setIdentFellesAction(ident1, ident2, annenSokerIdent)),
    hentBarn: (ident1: string) =>
        dispatch(hentBarn(ident1))
});

const SokersBarn = injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(SokersBarnComponent)
);

export {SokersBarn, SokersBarnComponent};
