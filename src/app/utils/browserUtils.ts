import * as querystring from 'querystring';

const getLocation = () => window.location.href;

export const setHash = (hash: string) => {
    window.location.hash = hash;
};

export const getHash = () => window.location.hash;

export const setDokQuery = (query: { [key: string]: string }) => {
    // change the dok query
    const dokQuery = querystring.stringify(query);
    const newUrl = `${getLocation().replace(/\?.*/, '')}?${dokQuery}`;
    window.history.replaceState(null, '', newUrl);
};
