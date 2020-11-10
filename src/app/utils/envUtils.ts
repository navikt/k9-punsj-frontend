export const getEnvironmentVariable = (variableName: string) => (window as any).appSettings[variableName];
