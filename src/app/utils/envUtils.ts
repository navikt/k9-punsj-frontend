type WindowWithAppSettings = Window & {
    appSettings?: Record<string, string | undefined>;
};

export function getEnvironmentVariable(variableName: string): string | undefined {
    const globalWindow = window as WindowWithAppSettings;

    if (globalWindow.appSettings && variableName in globalWindow.appSettings) {
        return globalWindow.appSettings[variableName];
    }
    return undefined;
}

export function redirectToLos(): void {
    const losUrl = getEnvironmentVariable('K9_LOS_URL');

    if (losUrl) {
        window.location.href = losUrl;
    }
}
