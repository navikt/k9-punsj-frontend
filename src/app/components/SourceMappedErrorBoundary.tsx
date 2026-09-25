import { captureException } from '@nais/apm';
import { ApmErrorBoundary } from '@nais/apm/react';
import type { ErrorInfo } from 'react';

/** Behold den opprinnelige JS-stakken slik at Nais kan slå opp CDN-sourcemaps. */
export class SourceMappedErrorBoundary extends ApmErrorBoundary {
    override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        const { context, fingerprint, onError } = this.props;
        captureException(error, {
            context,
            fingerprint: typeof fingerprint === 'function' ? fingerprint(error) : fingerprint,
        });
        onError?.(error, errorInfo);
    }
}
