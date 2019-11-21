import {IPath}  from 'app/models/types';
import {String} from 'typescript-string-operations';

export function getPath(paths: IPath[], step: number, values?: any) {
    const path = paths.filter(p => p.step === step)[0].path;
    return !!values
        ? String.Format(path, values)
        : formatForRouter(path);
}

function formatForRouter(path: string) {
    return path.replace('{', ':')
               .replace('}', '');
}

export function changePath(path: string) {
    window.location.hash = path;
}