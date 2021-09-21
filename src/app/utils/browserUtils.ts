import * as querystring from 'querystring';

export const redirect = (url: string) => {
    window.location.href = url;
};

export const getLocation = () => window.location.href;

export const setHash = (hash: string) => {
    window.location.hash = hash;
};

export const getHash = () => window.location.hash;

export const setQueryInHash = (query: { [key: string]: string }) => {
    const queryRegex = /\?.*$/;
    const hash = getHash();
    const newQueryString = `?${querystring.stringify(query)}`;
    let newHash: string;
    if (queryRegex.test(hash)) {
        newHash = hash.replace(queryRegex, newQueryString);
    } else {
        newHash = hash + newQueryString;
    }
    setHash(newHash);
};
