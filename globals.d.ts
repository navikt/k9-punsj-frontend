declare global {
    interface Window {
        envVariables: EnvVariables;
        nais?: {
            telemetryCollectorURL: string;
            app: any;
        };
    }
}

export {};
