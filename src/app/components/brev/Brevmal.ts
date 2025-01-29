interface IBrevmalLink {
    type: string;
    rel: string;
    href: string;
}
interface Brevmal {
    [key: string]: {
        navn: string;
        mottakere: string[];
        linker: IBrevmalLink[];
        støtterFritekst: boolean;
        støtterTittelOgFritekst: boolean;
        kode: string;
        støtterTredjepartsmottaker: boolean;
    };
}

export default Brevmal;
