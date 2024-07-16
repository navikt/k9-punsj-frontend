import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';

import { Alert, Checkbox, Select, TextField } from '@navikt/ds-react';

import { IdentRules } from 'app/rules';
import { RootStateType } from 'app/state/RootState';
import intlHelper from 'app/utils/intlUtils';

import VerticalSpacer from '../../../../components/VerticalSpacer';
import { IIdentState } from '../../../../models/types/IdentState';
import { setIdentFellesAction } from '../../../../state/actions/IdentActions';
import { IFellesState } from '../../../../state/reducers/FellesReducer';
import { hentBarn } from '../../../../state/reducers/HentBarn';

import './pleietrengende.less';
import { get } from 'app/utils/apiUtils';
import { ApiPath } from 'app/apiConfig';
import { Person } from 'app/models/types/Person';

interface PersonResponse {}

export interface IPleietrengendeStateProps {
    identState: IIdentState;
    fellesState: IFellesState;
}

export interface IPleietrengendeDispatchProps {
    setIdentAction: typeof setIdentFellesAction;
    henteBarn: typeof hentBarn;
}

export interface IPleietrengende {
    sokersIdent: string;
    toSokereIJournalpost: boolean;
    pleietrengendeHarIkkeFnrFn?: (harPleietrengendeFnr: boolean) => void;
    visPleietrengende?: boolean;
    jpErFerdigstiltOgUtenPleietrengende?: boolean;
    skalHenteBarn?: boolean;
}

type IPleietrengendeProps = IPleietrengendeStateProps & IPleietrengendeDispatchProps & IPleietrengende;

const PleietrengendeComponent: React.FunctionComponent<IPleietrengendeProps> = (props) => {
    const {
        pleietrengendeHarIkkeFnrFn,
        identState,
        sokersIdent,
        toSokereIJournalpost,
        fellesState,
        setIdentAction,
        henteBarn,
        visPleietrengende,
        skalHenteBarn,
        jpErFerdigstiltOgUtenPleietrengende,
    } = props;
    const intl = useIntl();

    const [pleietrengendeIdent, setPleietrengendeIdent] = useState<string>('');
    const [pleietrengendeHarIkkeFnr, setPleietrengendeHarIkkeFnr] = useState<boolean>(false);
    const [gjelderAnnenPleietrengende, setGjelderAnnenPleietrengende] = useState<boolean>(false);

    useEffect(() => {
        if (sokersIdent.length > 0 && skalHenteBarn && visPleietrengende) {
            henteBarn(sokersIdent);
        }
    }, [sokersIdent, visPleietrengende, skalHenteBarn]);

    const hentPleitrengendeInfo = (fnr: string) => {
        get(ApiPath.PERSON, undefined, { 'X-Nav-NorskIdent': fnr }, (response, data: Person) => {
            if (response.status === 200) {
                console.log('Person', data);
            }
        });
    };

    if (!visPleietrengende) {
        return null;
    }

    const pleietrengendeIdentInputFieldOnChange = (event: any) => {
        const identFromInput = event.target.value.replace(/\D+/, '');
        if (identState.pleietrengendeId.length > 0 && identFromInput.length < pleietrengendeIdent.length) {
            setIdentAction(identState.søkerId, '', identState.annenSokerIdent);
        }

        if (identFromInput.length === 11) {
            hentPleitrengendeInfo(identFromInput);
            setIdentAction(identState.søkerId, identFromInput, identState.annenSokerIdent);
        }

        setPleietrengendeIdent(identFromInput);
    };

    const oppdaterStateMedPleietrengendeFnr = (event: any) => {
        setIdentAction(identState.søkerId, event.target.value, identState.annenSokerIdent);
    };

    const nullUtPleietrengendeIdent = () => {
        setPleietrengendeIdent('');
        setIdentAction(identState.søkerId, '', identState.annenSokerIdent);
    };

    const pleietrengendeHarIkkeFnrCheckboks = (checked: boolean) => {
        setPleietrengendeHarIkkeFnr(checked);
        if (pleietrengendeHarIkkeFnrFn) pleietrengendeHarIkkeFnrFn(checked);
        if (checked) {
            setPleietrengendeIdent('');
            setIdentAction(identState.søkerId, null, identState.annenSokerIdent);
        }
    };

    const isPleitrengendeFnrErSammeSomSøker = identState.søkerId === identState.pleietrengendeId;

    if (!visPleietrengende) {
        return null;
    }
    return (
        <div>
            {!!fellesState.hentBarnSuccess && !!fellesState.barn && fellesState.barn.length > 0 && (
                <>
                    <VerticalSpacer eightPx />
                    <Select
                        className="pleietrengendeSelect"
                        label={intlHelper(intl, 'ident.identifikasjon.velgBarn')}
                        onChange={(e) => {
                            pleietrengendeIdentInputFieldOnChange(e);
                            oppdaterStateMedPleietrengendeFnr(e);
                        }}
                        disabled={gjelderAnnenPleietrengende}
                    >
                        <option key="default" value="" label="Velg barn" aria-label="Tomt valg" />
                        {!gjelderAnnenPleietrengende &&
                            fellesState.barn.map((b) => (
                                <option key={b.identitetsnummer} value={b.identitetsnummer}>
                                    {`${b.fornavn} ${b.etternavn} - ${b.identitetsnummer}`}
                                </option>
                            ))}
                    </Select>
                    <VerticalSpacer eightPx />
                    <Checkbox
                        onChange={(e) => {
                            setGjelderAnnenPleietrengende(e.target.checked);
                            nullUtPleietrengendeIdent();
                        }}
                        checked={gjelderAnnenPleietrengende}
                    >
                        {intlHelper(intl, 'ident.identifikasjon.annetBarn')}
                    </Checkbox>
                </>
            )}

            {(gjelderAnnenPleietrengende ||
                !skalHenteBarn ||
                !!fellesState.hentBarnError ||
                !!fellesState.hentBarnForbidden ||
                (!!fellesState.barn && fellesState.barn.length === 0)) && (
                <>
                    <div className="fyllUtIdentAnnetBarnContainer">
                        <TextField
                            label={intlHelper(intl, 'ident.identifikasjon.pleietrengende')}
                            onChange={pleietrengendeIdentInputFieldOnChange}
                            className="bold-label ident-soker-2"
                            autoComplete="off"
                            maxLength={11}
                            size="medium"
                            error={
                                isPleitrengendeFnrErSammeSomSøker ||
                                (identState.pleietrengendeId && IdentRules.erUgyldigIdent(identState.pleietrengendeId))
                                    ? intlHelper(intl, 'ident.feil.ugyldigident')
                                    : undefined
                            }
                            disabled={pleietrengendeHarIkkeFnr}
                        />
                    </div>
                    <VerticalSpacer eightPx />
                    {pleietrengendeHarIkkeFnrFn && (
                        <>
                            <Checkbox onChange={(e) => pleietrengendeHarIkkeFnrCheckboks(e.target.checked)}>
                                {intlHelper(intl, 'ident.identifikasjon.pleietrengendeHarIkkeFnr')}
                            </Checkbox>
                            {!toSokereIJournalpost &&
                                pleietrengendeHarIkkeFnr &&
                                !jpErFerdigstiltOgUtenPleietrengende && (
                                    <Alert
                                        size="small"
                                        variant="info"
                                        className="infotrygd_info"
                                        data-test-id="pleietrengendeHarIkkeFnrInformasjon"
                                    >
                                        {intlHelper(intl, 'ident.identifikasjon.pleietrengendeHarIkkeFnrInformasjon')}
                                    </Alert>
                                )}
                            {pleietrengendeHarIkkeFnr && jpErFerdigstiltOgUtenPleietrengende && (
                                <Alert size="small" variant="info" className="infotrygd_info">
                                    {intlHelper(
                                        intl,
                                        'ident.identifikasjon.pleietrengendeHarIkkeFnrInformasjon.ferdistilt',
                                    )}
                                </Alert>
                            )}
                        </>
                    )}
                    <VerticalSpacer sixteenPx />
                </>
            )}
        </div>
    );
};

const mapStateToProps = (state: RootStateType) => ({
    identState: state.identState,
    fellesState: state.felles,
    dedupkey: state.felles.dedupKey,
});

const mapDispatchToProps = (dispatch: any) => ({
    setIdentAction: (søkerId: string, pleietrengendeId: string | null, annenSokerIdent: string | null) =>
        dispatch(setIdentFellesAction(søkerId, pleietrengendeId, annenSokerIdent)),
    henteBarn: (søkerId: string) => dispatch(hentBarn(søkerId)),
});

const Pleietrengende = connect(mapStateToProps, mapDispatchToProps)(PleietrengendeComponent);

export { Pleietrengende, PleietrengendeComponent };
