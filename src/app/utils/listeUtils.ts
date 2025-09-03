import { v4 as uuidv4 } from 'uuid';

// Brukes for å berike en liste med objekter med en id
// Kan brukes der vi trenger en React Key for rendring av lister der vi IKKE har en unik id
export const berikMedId = <T>(liste: Array<T & { id?: string }>): Array<T & { id: string }> =>
    liste.map((item) => ({
        ...item,
        id: item.id || uuidv4(),
    }));
