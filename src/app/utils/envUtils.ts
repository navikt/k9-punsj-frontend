 import/prefer-default-export
export function getEnvironmentVariable(variableName: string) {
    if (window.appSettings && variableName in window.appSettings) {
        return window.appSettings[variableName];
    }
    return undefined;
}
