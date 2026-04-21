import type { EnvVariables } from './src/app/env';

declare global {
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
