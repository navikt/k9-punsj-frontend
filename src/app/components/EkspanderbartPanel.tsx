import * as React from 'react';

import { LegacyCheckbox } from 'app/components/legacy-form-compat/checkbox';
import VerticalSpacer from 'app/components/VerticalSpacer';

interface EkspanderbartPanelProps {
    children: React.ReactNode;
    label: string;
    togglePanel: () => void;
    isPanelOpen: boolean;
}

const EkspanderbartPanel: React.FC<EkspanderbartPanelProps> = ({ children, togglePanel, isPanelOpen, label }) => (
    <>
        <LegacyCheckbox label={label} onChange={togglePanel} checked={isPanelOpen} />
        <VerticalSpacer eightPx />
        {isPanelOpen && children}
    </>
);

export default EkspanderbartPanel;
