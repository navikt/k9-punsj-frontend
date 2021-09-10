// eslint-disable-next-line import/prefer-default-export
export const getEnvironmentVariable = (variableName: string) => (window as any).appSettings[variableName];
