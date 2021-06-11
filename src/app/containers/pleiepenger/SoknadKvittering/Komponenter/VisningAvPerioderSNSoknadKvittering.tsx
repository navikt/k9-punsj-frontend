import React from 'react';
import intlHelper from 'app/utils/intlUtils';
import './visningAvPerioderSoknadKvittering.less';
import {v4 as uuidv4} from 'uuid';
import {periodToFormattedString} from "../../../../utils";
import {
    IPSBSoknadKvitteringSelvstendigNaeringsdrivendePeriode,
} from "../../../../models/types/PSBSoknadKvittering";
import {formattereDatoIArray, formattereLandTilNavn, sjekkPropertyEksistererOgIkkeErNull} from "../SoknadKvittering";
import {ICountry} from "../../../../components/country-select/CountrySelect";
import {Virksomhetstyper} from "../../../../models/enums/Virksomhetstyper";

interface IOwnProps {
    intl: any;
    perioder: IPSBSoknadKvitteringSelvstendigNaeringsdrivendePeriode[];
    countryList: ICountry[];
}

const formaterTypeVirksomhet = (virksomheter: string[]) => {
    return virksomheter.map(type => {
        switch (type) {
            case 'FISKE':
                return Virksomhetstyper.FISKE;
            case 'JORDBRUK_SKOGBRUK':
                return Virksomhetstyper.JORDBRUK;
            case 'DAGMAMMA':
                return Virksomhetstyper.DAGMAMMA;
            default:
                return Virksomhetstyper.ANNEN
        }
    });
};

const VisningAvPerioderSNSoknadKvittering: React.FunctionComponent<IOwnProps> = ({intl, perioder, countryList}) => {
    return (
        <div>
            {perioder.map(SN => {
                return Object.keys(SN.perioder).map(periode => {
                        return <div key={uuidv4()}>
                            {sjekkPropertyEksistererOgIkkeErNull('organisasjonsnummer', SN) &&
                            <p>
                              <b>{intlHelper(intl, 'skjema.arbeid.arbeidstaker.orgnr') + ': '}</b>{SN.organisasjonsnummer}
                            </p>}

                            {sjekkPropertyEksistererOgIkkeErNull('virksomhetNavn', SN) &&
                            <p>
                              <b>{intlHelper(intl, 'skjema.arbeid.sn.virksomhetsnavn') + ' '}</b>{SN.virksomhetNavn}
                            </p>}

                            <p>
                                <b>{intlHelper(intl, 'skjema.arbeid.sn.når') + ' '}</b>{periodToFormattedString(periode)}
                            </p>
                            {sjekkPropertyEksistererOgIkkeErNull('virksomhetstyper', SN.perioder[periode])
                            && SN.perioder[periode].virksomhetstyper.length > 0
                            && <p>
                              <b>{intlHelper(intl, 'skjema.arbeid.sn.type') + ': '}</b>
                                {formaterTypeVirksomhet(SN.perioder[periode].virksomhetstyper).map((virksomhetstype, index) =>
                                    <span
                                        key={uuidv4()}>{index !== SN.perioder[periode].virksomhetstyper.length - 1 ? `${virksomhetstype}, ` : `${virksomhetstype}`}</span>)}
                            </p>}

                            {sjekkPropertyEksistererOgIkkeErNull('registrertIUtlandet', SN.perioder[periode]) &&
                            <p>
                              <b>{intlHelper(intl, 'skjema.sn.registrertINorge') + ' '}</b>{`${SN.perioder[periode].registrertIUtlandet ? 'Nei' : 'Ja'}`}
                            </p>}

                            {sjekkPropertyEksistererOgIkkeErNull('landkode', SN.perioder[periode]) &&
                            <p>
                              <b>{intlHelper(intl, 'skjema.sn.registrertLand') + ' '}</b>{formattereLandTilNavn(SN.perioder[periode].landkode!, countryList)}
                            </p>}

                            {sjekkPropertyEksistererOgIkkeErNull('erVarigEndring', SN.perioder[periode]) &&
                            <>
                              <p>
                                <b>{intlHelper(intl, 'skjema.sn.varigendring') + ' '}</b>{`${SN.perioder[periode].erVarigEndring ? 'Ja' : 'Nei'}`}
                              </p>

                                {sjekkPropertyEksistererOgIkkeErNull('endringDato', SN.perioder[periode]) &&
                                <p>
                                  <b>{intlHelper(intl, 'skjema.sn.varigendringdato') + ' '}</b>{formattereDatoIArray(SN.perioder[periode].endringDato)}
                                </p>}

                                {sjekkPropertyEksistererOgIkkeErNull('endringBegrunnelse', SN.perioder[periode]) &&
                                <p>
                                  <b>{intlHelper(intl, 'skjema.sn.endringbegrunnelse') + ': '}</b>{SN.perioder[periode].endringBegrunnelse}
                                </p>}
                            </>}

                            {sjekkPropertyEksistererOgIkkeErNull('bruttoInntekt', SN.perioder[periode]) &&
                            <p>
                              <b>{intlHelper(intl, !!SN.perioder[periode].erVarigEndring ? 'skjema.sn.endringinntekt' : 'skjema.sn.bruttoinntekt') + ': '}</b>{SN.perioder[periode].bruttoInntekt}
                            </p>}

                            {sjekkPropertyEksistererOgIkkeErNull('regnskapsførerNavn', SN.perioder[periode]) &&
                            <p>
                              <b>{intlHelper(intl, 'skjema.arbeid.sn.regnskapsførernavn') + ': '}</b>{SN.perioder[periode].regnskapsførerNavn}
                            </p>}

                            {sjekkPropertyEksistererOgIkkeErNull('regnskapsførerTlf', SN.perioder[periode]) &&
                            <p>
                              <b>{intlHelper(intl, 'skjema.arbeid.sn.regnskapsførertlf') + ': '}</b>{SN.perioder[periode].regnskapsførerTlf}
                            </p>}

                        </div>
                    }
                )
            })}
        </div>
    )
        ;
};

export default VisningAvPerioderSNSoknadKvittering;