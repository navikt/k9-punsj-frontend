import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import { Alert, Checkbox, Select } from '@navikt/ds-react';

import { IdentRules } from 'app/rules';
import { RootStateType } from 'app/state/RootState';
import intlHelper from 'app/utils/intlUtils';

import VerticalSpacer from 'app/components/VerticalSpacer';
import { setIdentFellesAction } from 'app/state/actions/IdentActions';
import { hentBarn } from 'app/state/reducers/HentBarn';
import { Person } from 'app/models/types/Person';
import { getPersonInfo } from 'app/api/api';

import FnrTextField from 'app/components/fnr-text-field/FnrTextField';
import { Dispatch } from 'redux';

import './pleietrengende.less';
export interface Props {
    toSokereIJournalpost: boolean;
    pleietrengendeHarIkkeFnrFn?: (harPleietrengendeFnr: boolean) => void;
    visPleietrengende?: boolean;
    jpErFerdigstiltOgUtenPleietrengende?: boolean;
    skalHenteBarn?: boolean;
}

const Pleietrengende: React.FC<Props> = ({
    toSokereIJournalpost,
    pleietrengendeHarIkkeFnrFn,
    jpErFerdigstiltOgUtenPleietrengende,
    visPleietrengende,
    skalHenteBarn,
}: Props) => {
    const intl = useIntl();

    const [pleietrengendeIdent, setPleietrengendeIdent] = useState<string>('');
    const [pleietrengendeHarIkkeFnr, setPleietrengendeHarIkkeFnr] = useState<boolean>(false);
    const [gjelderAnnenPleietrengende, setGjelderAnnenPleietrengende] = useState<boolean>(false);
    const [pleietrengendeInfo, setPleietrengendeInfo] = useState<Person | undefined>(undefined);
    const [pleietrengendeInfoLoading, setPleietrengendeInfoLoading] = useState<boolean>(false);
    const [pleietrengendeInfoError, setPleietrengendeInfoError] = useState<boolean>(false);

    const dispatch = useDispatch<Dispatch<any>>();

    const setIdentAction = (søkerId: string, pleietrengendeId: string | null, annenSokerIdent: string | null) =>
        dispatch(setIdentFellesAction(søkerId, pleietrengendeId, annenSokerIdent));

    const henteBarn = (søkerId: string) => dispatch(hentBarn(søkerId));

    const identState = useSelector((state: RootStateType) => state.identState);
    const fellesState = useSelector((state: RootStateType) => state.felles);

    useEffect(() => {
        setPleietrengendeIdent('');
        setPleietrengendeInfo(undefined);

        if (identState.søkerId.length > 0 && skalHenteBarn && visPleietrengende) {
            henteBarn(identState.søkerId);
        }
    }, [identState.søkerId, visPleietrengende, skalHenteBarn]);

    const hentPleietrengendeInfo = (pleietrengendesFødselsnummer: string) => {
        setPleietrengendeInfoError(false);
        setPleietrengendeInfoLoading(true);

        getPersonInfo(pleietrengendesFødselsnummer, (response, data: Person) => {
            setPleietrengendeInfoLoading(false);
            if (response.status === 200) {
                setPleietrengendeInfo(data);
            } else {
                setPleietrengendeInfoError(true);
            }
        });
    };

    const pleietrengendeIdentInputFieldOnChange = (event: any) => {
        const identFromInput = event.target.value.replace(/\D+/, '');

        if (identState.pleietrengendeId.length > 0 && identFromInput.length < pleietrengendeIdent.length) {
            setPleietrengendeInfo(undefined);
            setIdentAction(identState.søkerId, '', identState.annenSokerIdent);
        }

        if (identFromInput.length === 11) {
            if (!IdentRules.erUgyldigIdent(identFromInput)) {
                hentPleietrengendeInfo(identFromInput);
            }

            setIdentAction(identState.søkerId, identFromInput, identState.annenSokerIdent);
        }

        setPleietrengendeIdent(identFromInput);
    };

    const oppdaterStateMedPleietrengendeFnr = (event: any) => {
        setIdentAction(identState.søkerId, event.target.value, identState.annenSokerIdent);
    };

    const nullUtPleietrengendeIdent = () => {
        setPleietrengendeIdent('');
        setPleietrengendeInfo(undefined);
        setIdentAction(identState.søkerId, '', identState.annenSokerIdent);
    };

    const pleietrengendeHarIkkeFnrCheckboks = (checked: boolean) => {
        setPleietrengendeHarIkkeFnr(checked);
        setPleietrengendeInfo(undefined);
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
                            setPleietrengendeIdent(e.target.value);
                            oppdaterStateMedPleietrengendeFnr(e);
                        }}
                        disabled={gjelderAnnenPleietrengende}
                        defaultValue={identState.pleietrengendeId}
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
                    <FnrTextField
                        labelId="ident.identifikasjon.pleietrengende"
                        value={pleietrengendeIdent}
                        loadingPersonsInfo={pleietrengendeInfoLoading}
                        errorPersonsInfo={pleietrengendeInfoError}
                        person={pleietrengendeInfo}
                        errorValidationMessage={
                            isPleitrengendeFnrErSammeSomSøker ||
                            (identState.pleietrengendeId && IdentRules.erUgyldigIdent(identState.pleietrengendeId))
                                ? intlHelper(intl, 'ident.feil.ugyldigident')
                                : undefined
                        }
                        disabled={pleietrengendeHarIkkeFnr}
                        onChange={pleietrengendeIdentInputFieldOnChange}
                    />

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

export default Pleietrengende;
