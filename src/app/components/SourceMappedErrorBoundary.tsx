import { captureException, markErrorCaptured } from '@nais/apm';
import { Component, type ReactNode } from 'react';

/** Behold den opprinnelige JS-stakken slik at Nais kan slå opp CDN-sourcemaps. */
export class SourceMappedErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { hasError: boolean }> {
    state = { hasError: false };

    static getDerivedStateFromError(error: Error): { hasError: boolean } {
        markErrorCaptured(error);
        return { hasError: true };
    }

    componentDidCatch(error: Error): void {
        captureException(error);
    }

    render(): ReactNode {
        return this.state.hasError ? (this.props.fallback ?? <div role="alert">Det oppstod en feil.</div>) : this.props.children;
    }
}
