import React from 'react';
import { useIntl } from 'react-intl';
import Lenke from 'nav-frontend-lenker';
import Panel from 'nav-frontend-paneler';
import { Input, Select, SkjemaGruppe } from 'nav-frontend-skjema';
import { ExternalLink } from '@navikt/ds-icons';
import Organisasjon from 'app/models/types/Organisasjon';
import intlHelper from 'app/utils/intlUtils';

import { AAREG_URL } from '../../../constants/eksterneLenker';
import './virksomhetPanel.less';

interface IVirksomhetPanelProps {
    arbeidsgivere: Organisasjon[];
}
export default function VirksomhetPanel({ arbeidsgivere }: IVirksomhetPanelProps): JSX.Element {
    const intl = useIntl();
    return (
        <SkjemaGruppe
            legend={
                <h4 className="korrigering-legend">
                    {intlHelper(intl, 'omsorgspenger.korrigeringAvInntektsmelding.korrigerFravaer.legend')}
                </h4>
            }
        >
            <Panel className="listepanel virksomhetPanel">
                <Select
                    bredde="l"
                    label={intlHelper(
                        intl,
                        'omsorgspenger.korrigeringAvInntektsmelding.korrigerFravaer.velgVirksomhet'
                    )}
                    onChange={() => {
                        ('');
                    }}
                >
                    <option key="default" value="" label="" aria-label="Tomt valg" />)
                    {arbeidsgivere.map((arbeidsgiver) => (
                        <option key={arbeidsgiver.organisasjonsnummer} value={arbeidsgiver.organisasjonsnummer}>
                            {`${arbeidsgiver.navn} - ${arbeidsgiver.organisasjonsnummer}`}
                        </option>
                    ))}
                </Select>
                <Lenke className="eksternLenke" href={AAREG_URL}>
                    <span>Aa-registeret</span> <ExternalLink />
                </Lenke>
                <Input
                    bredde="L"
                    label={intlHelper(
                        intl,
                        'omsorgspenger.korrigeringAvInntektsmelding.korrigerFravaer.arbeidsforholdId'
                    )}
                />
            </Panel>
        </SkjemaGruppe>
    );
}
