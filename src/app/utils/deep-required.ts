/**
 * Brukes for å gjøre felter required også i under-felter. F. eks. `DeepRequired<{a: {b?: string}}> == {a: {b: string}}`
 */
export type DeepRequired<T> = Required<{
    [K in keyof T]: T[K] extends Required<T[K]> ? T[K] : DeepRequired<T[K]>;
}>;
