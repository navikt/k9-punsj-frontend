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
import {v4 as uuidv4} from "uuid";
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
        sokersIdent
    } = props;

    const journalpostident = journalpost?.norskIdent;
    const finnesRiktigIdentIJournalposten = typeof riktigIdentIJournalposten !== 'undefined';
    const skalBarnetHarIkkeFnrCheckboksVises = typeof barnetHarInteFnrFn !== 'undefined';

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
        setIdentAction(identState.ident1, event.target.value)
    }

    const barnetsIdentInputFieldOBlur = (event: any) => {
        props.setIdentAction(finnesRiktigIdentIJournalposten && riktigIdentIJournalposten === JaNei.JA ? (journalpostident || '') : sokersIdent, event.target.value, identState.annenSokerIdent);
    }

    const nullUtBarnetsIdent = () => {
        setBarnetsIdent('');
        setIdentAction(identState.ident1, '');
        props.setIdentAction(identState.ident1, '', identState.annenSokerIdent);
    }

    const barnHarIkkeFnrCheckboks = (checked: boolean) => {
        setBarnetHarIkkeFnr(checked);
        skalBarnetHarIkkeFnrCheckboksVises && barnetHarInteFnrFn(checked);
        if (checked) {
            setBarnetsIdent('');
            props.setIdentAction(finnesRiktigIdentIJournalposten && riktigIdentIJournalposten === JaNei.JA ? (journalpostident || '') : sokersIdent, null);
        }
    }

    return (<div className="sokersBarn">
        {typeof erBarnUtdatert !== 'undefined' && !erBarnUtdatert && !!props.fellesState.hentBarnSuccess && typeof props.fellesState.barn !== 'undefined' && props.fellesState.barn.length > 0 && <>
          <Select
            value={barnetsIdent}
            bredde="l"
            label={intlHelper(intl, 'ident.identifikasjon.velgBarn')}
            onChange={barnetsIdentInputFieldOnChange}
            disabled={gjelderAnnetBarn}
            onBlur={barnetsIdentInputFieldOBlur}
          >
            <option key={uuidv4()} value={""}>
                {``}
            </option>
            )

              {props.fellesState.barn.map(b =>
                  <option key={uuidv4()} value={b.identitetsnummer}>
                      {`${b.fornavn} ${b.etternavn} - ${b.identitetsnummer}`}
                  </option>)
              }
          </Select>
          <VerticalSpacer eightPx={true}/>
          <Checkbox
            label={intlHelper(intl, 'ident.identifikasjon.annetBarn')}
            onChange={(e) => {
                setGjelderAnnetBarn(e.target.checked);
                nullUtBarnetsIdent();
            }}
          />
        </>
        }
        <VerticalSpacer sixteenPx={true}/>
        {(gjelderAnnetBarn
            || !!props.fellesState.hentBarnError
            || !!props.fellesState.hentBarnForbidden
            || (typeof props.fellesState.barn !== 'undefined' && props.fellesState.barn.length === 0))
        && <>
          <div className={'fyllUtIdentAnnetBarnContainer'}>
            <Input
              label={intlHelper(intl, 'ident.identifikasjon.barn')}
              onChange={barnetsIdentInputFieldOnChange}
              onBlur={barnetsIdentInputFieldOBlur}
              value={barnetsIdent}
              className="bold-label ident-soker-2"
              maxLength={11}
              feil={
                  skalViseFeilmelding(identState.ident2)
                      ? intlHelper(intl, 'ident.feil.ugyldigident')
                      : undefined
              }
              bredde={"M"}
              disabled={barnetHarIkkeFnr}
            />
              {barnetsIdent.length === 11 && !skalViseFeilmelding(identState.ident2) &&
              <div className="dobbelSjekkIdent">
                <div><WarningCircle/></div>
                <p><b>{intlHelper(intl, 'ident.identifikasjon.dobbelsjekkident')}</b></p></div>}
          </div>
          <VerticalSpacer eightPx={true}/>
            {skalBarnetHarIkkeFnrCheckboksVises && <>
              <Checkbox
                label={intlHelper(intl, 'ident.identifikasjon.barnHarIkkeFnr')}
                onChange={(e) => barnHarIkkeFnrCheckboks(e.target.checked)}
              />
                {barnetHarIkkeFnr && <AlertStripeInfo
                  className={"infotrygd_info"}> {intlHelper(intl, 'ident.identifikasjon.barnHarIkkeFnrInformasjon')}</AlertStripeInfo>}
            </>}
          <VerticalSpacer sixteenPx={true}/>
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
