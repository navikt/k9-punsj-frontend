import React from 'react';

import { Select } from '@navikt/ds-react';

interface Props {
    behandlingsAar?: string;
    onChange: (behandlingsAar: string) => void;
}

const ValgAvBehandlingsÅr = ({ behandlingsAar, onChange }: Props) => {
    const thisYear = new Date().getFullYear();
    return (
        <Select
            value={behandlingsAar}
            label="Hvilket år gjelder dokumentet?"
            onChange={(e) => onChange(e.target.value)}
            className="my-8 max-w-64"
            data-test-id="valgAvbehandlingsÅr"
        >
            <option value="">Velg</option>
            <option value={String(thisYear)}>{thisYear}</option>
            <option value={String(thisYear - 1)}>{thisYear - 1}</option>
            <option value={String(thisYear - 2)}>{thisYear - 2}</option>
            <option value={String(thisYear - 3)}>{thisYear - 3}</option>
        </Select>
    );
};

export default ValgAvBehandlingsÅr;
