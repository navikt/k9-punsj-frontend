import type { JSX as ReactJSX } from 'react';
import type { EnvVariables } from './src/app/env';

declare global {
    // React 19 removed the global JSX namespace; re-establish it for existing source files
    // that reference JSX.Element without importing from 'react' directly.
    namespace JSX {
        type Element = ReactJSX.Element;
        type IntrinsicElements = ReactJSX.IntrinsicElements;
        type ElementType = ReactJSX.ElementType;
        type IntrinsicAttributes = ReactJSX.IntrinsicAttributes;
    }
    interface Window {
        envVariables: EnvVariables;
        appSettings?: Record<string, string | undefined>;
        __naisReady?: Promise<unknown>;
        nais?: {
            telemetryCollectorURL: string;
            app: any;
        };
    }
}

export {};
