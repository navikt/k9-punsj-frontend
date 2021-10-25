import Organisasjon from 'app/models/types/Organisasjon';
import Lenke from 'nav-frontend-lenker';
import Panel from 'nav-frontend-paneler';
import { Input, Select } from 'nav-frontend-skjema';
import { ExternalLink } from '@navikt/ds-icons';
import React from 'react';
import { AAREG_URL } from '../../../constants/eksterneLenker';
import './virksomhetPanel.less';

interface IVirksomhetPanelProps {
    arbeidsgivere: Organisasjon[];
}
export default function VirksomhetPanel({ arbeidsgivere }: IVirksomhetPanelProps) {
    return (
        <Panel className="listepanel virksomhetPanel">
            <Select
                bredde="l"
                label="Velg virksomhet"
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
            <Input bredde="L" label="Arbeidsforhold-ID" />
        </Panel>
    );
}
