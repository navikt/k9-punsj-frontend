import React from 'react';
import Panel from "nav-frontend-paneler";
import intlHelper from "../../../../utils/intlUtils";
import {PunchFormPaneler} from "../../../../models/enums/PunchFormPaneler";
import {Input, RadioPanelGruppe, SkjemaGruppe} from "nav-frontend-skjema";
import {JaNeiIkkeRelevant} from "../../../../models/enums/JaNeiIkkeRelevant";
import {AlertStripeAdvarsel} from "nav-frontend-alertstriper";
import { PSBSoknad} from "../../../../models/types";
import {IntlShape} from "react-intl";

interface IOwnProps {
    intl: IntlShape;
    changeAndBlurUpdatesSoknad: (event: any) => any;
    getErrorMessage: (attribute: string, indeks?: number) => any;
    setSignaturAction: (signert: JaNeiIkkeRelevant | null) => void;
    signert: JaNeiIkkeRelevant | null;
    soknad: PSBSoknad;
}

const OpplysningerOmSoknad: React.FunctionComponent<IOwnProps> = ({
    intl,
    changeAndBlurUpdatesSoknad,
    getErrorMessage,
    setSignaturAction,
    signert,
    soknad
}) => {
    return ( <Panel className={"opplysningerOmSoknad"}>
        <h3>{intlHelper(intl, PunchFormPaneler.OPPLYSINGER_OM_SOKNAD)}</h3>
        <SkjemaGruppe>
            <div className={"input-row"}>
                <Input
                    id="soknad-dato"
                    bredde={"M"}
                    label={intlHelper(intl, 'skjema.mottakelsesdato')}
                    type="date"
                    value={soknad.mottattDato}
                    {...changeAndBlurUpdatesSoknad((event: any) => ({
                        mottattDato: event.target.value,
                    }))}
                    feil={getErrorMessage('mottattDato')}
                />
                <Input
                    value={soknad.klokkeslett || ''}
                    type={"time"}
                    className={"klokkeslett"}
                    label={intlHelper(intl, 'skjema.mottatt.klokkeslett')}
                    {...changeAndBlurUpdatesSoknad((event: any) => ({
                        klokkeslett: event.target.value,
                    }))}
                    feil={getErrorMessage('klokkeslett')}
                />
            </div>
            <RadioPanelGruppe
                className="horizontalRadios"
                radios={Object.values(JaNeiIkkeRelevant).map((jn) => ({
                    label: intlHelper(intl, jn),
                    value: jn,
                }))}
                name="signatur"
                legend={intlHelper(intl, 'ident.signatur.etikett')}
                checked={signert || undefined}
                onChange={(event) =>
                    setSignaturAction(((event.target as HTMLInputElement).value as JaNeiIkkeRelevant) || null)
                }
            />
            {signert === JaNeiIkkeRelevant.NEI &&
            <AlertStripeAdvarsel>{intlHelper(intl, 'skjema.usignert.info')}</AlertStripeAdvarsel>}
        </SkjemaGruppe>
    </Panel>)
}
export default OpplysningerOmSoknad;