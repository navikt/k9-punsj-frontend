import { CheckboksPanel } from 'nav-frontend-skjema';
import * as React from 'react';

import VerticalSpacer from 'app/components/vertical-spacer/VerticalSpacer';

interface EkspanderbartPanelProps {
    children: React.ReactNode;
    label: string;
    togglePanel: () => void;
    isPanelOpen: boolean;
}

const EkspanderbartPanel: React.FC<EkspanderbartPanelProps> = ({ children, togglePanel, isPanelOpen, label }) => (
    <>
        <CheckboksPanel label={label} onChange={togglePanel} checked={isPanelOpen} />
        <VerticalSpacer eightPx />
        {isPanelOpen && children}
    </>
);

export default EkspanderbartPanel;
