export async function logApiError(response: Response) {
    if (!response.ok && response.status !== 401) {
        // eslint-disable-next-line no-console
        console.error(`Error: ${response.status} for URL: ${response.url} with error`);
    }
}

export function logError(error: Error) {
    // eslint-disable-next-line no-console
    console.error(error);
}
