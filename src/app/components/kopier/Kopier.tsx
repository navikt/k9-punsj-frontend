import React from 'react';

import { Copy } from '@navikt/ds-icons';

import './kopier.less';

export default function Kopier({ verdi }: { verdi?: string }): JSX.Element | null {
    const kopierTilClipboard = async (v: string) => {
        try {
            await navigator.clipboard.writeText(v);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    };

    if (!verdi) {
        return null;
    }
    return (
        <button aria-label="Kopier" className="kopier" type="button" onClick={() => kopierTilClipboard(verdi)}>
            <Copy />
        </button>
    );
}
