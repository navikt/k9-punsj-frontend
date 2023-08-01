import React from 'react';

import { Select } from '@navikt/ds-react';

interface Props {
    onChange: (behandlingsAar: string) => void;
}

const ValgAvBehandlingsÅr = ({ onChange }: Props) => {
    const thisYear = new Date().getFullYear();
    return (
        <Select
            label="Hvilket år gjelder dokumentet?"
            size="small"
            onChange={(e) => onChange(e.target.value)}
            className="my-8"
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
