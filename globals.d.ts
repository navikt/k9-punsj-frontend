import type { EnvVariables } from './src/app/env';

declare global {
    interface Window {
        envVariables: EnvVariables;
        appSettings?: Record<string, string | undefined>;
        nais?: {
            telemetryCollectorURL: string;
            app: any;
        };
    }
}

export {};
