import { v4 as uuidv4 } from 'uuid';

// Bruk der vi ikke har unik data som kan brukes til key ved rendring av lister
export const berikMedKey = <T>(liste: Array<T & { key?: string }>): Array<T & { key: string }> =>
    liste.map((item) => ({
        ...item,
        key: item.key || uuidv4(),
    }));
