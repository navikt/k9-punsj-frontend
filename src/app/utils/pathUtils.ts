import { IPath } from 'app/models/types';
import queryString from 'query-string';
import { String } from 'typescript-string-operations';

function formatForRouter(path: string) {
    return path.replace(/{/g, ':').replace(/}/g, '');
}

export function getPathForValues(path: string, values?: any, query?: { [key: string]: string }) {
    return (
        (values ? String.Format(path, values) : formatForRouter(path)) +
        (query ? `?${queryString.stringify(query)}` : '')
    );
}
export function getPath(paths: IPath[], step: number, values?: any, query?: { [key: string]: string }) {
    const { path } = paths.filter((p) => p.step === step)[0];

    return getPathForValues(path, values, query);
}
