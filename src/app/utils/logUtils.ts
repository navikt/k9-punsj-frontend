export async function logApiError(response: Response) {
    if (!response.ok && response.status !== 401) {
        console.error(`Error: ${response.status} for URL: ${response.url} with error`);
    }
}

export function logError(error: Error) {
    console.error(error);
}
