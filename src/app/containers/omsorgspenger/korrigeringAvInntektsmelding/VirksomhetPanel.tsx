import Organisasjon from 'app/models/types/Organisasjon';
import Panel from 'nav-frontend-paneler';
import { Input, Select } from 'nav-frontend-skjema';
import React from 'react';

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
            <Input bredde="L" label="Arbeidsforhold-ID" />
        </Panel>
    );
}
