import { combineReducers } from 'redux';
import { EksisterendeOMPUTSoknaderReducer } from 'app/omsorgspenger-utbetaling/state/reducers/EksisterendeOMPUTSoknaderReducer';
import {
    AuthReducer,
    FordelingReducer,
    GosysOppgaveReducer,
    EksisterendeSoknaderReducer,
    SoknaderSokReducer,
    PunchFormReducer,
    PunchReducer,
    SignaturReducer,
    FordelingSettPaaVentReducer,
} from './reducers';
import FellesReducer from './reducers/FellesReducer';
import { Sakstype } from '../models/enums';
import overføringSignaturReducer from './reducers/omsorgspengeroverførdager/overføringSignaturReducer';
import overføringPunchReducer from './reducers/omsorgspengeroverførdager/overføringPunchReducer';
import { SoknaderVisningReducer } from './reducers/SoknaderVisningReducer';
import { JournalposterPerIdentReducer } from './reducers/JournalposterPerIdentReducer';
import { IdentReducer } from './reducers/IdentReducer';
import { FordelingFerdigstillJournalpostReducer } from './reducers/FordelingFerdigstillJournalpostReducer';
import { EksisterendeOMPKSSoknaderReducer } from '../omsorgspenger-kronisk-sykt-barn/state/reducers/EksisterendeOMPKSSoknaderReducer';
import { PunchOMPKSFormReducer } from '../omsorgspenger-kronisk-sykt-barn/state/reducers/PunchOMPKSFormReducer';
import { PunchOMPKSReducer } from '../omsorgspenger-kronisk-sykt-barn/state/reducers/PunchOMPKSReducer';
import { EksisterendeOMPMASoknaderReducer } from '../omsorgspenger-midlertidig-alene/state/reducers/EksisterendeOMPMASoknaderReducer';
import { PunchOMPMAFormReducer } from '../omsorgspenger-midlertidig-alene/state/reducers/PunchOMPMAFormReducer';
import { PunchOMPMAReducer } from '../omsorgspenger-midlertidig-alene/state/reducers/PunchOMPMAReducer';
import { PunchOMPUTFormReducer } from '../omsorgspenger-utbetaling/state/reducers/PunchOMPUTFormReducer';
import { PunchOMPUTReducer } from '../omsorgspenger-utbetaling/state/reducers/PunchOMPUTReducer';
import { PunchPLSFormReducer } from '../pleiepenger-livets-sluttfase/state/reducers/PunchPLSFormReducer';
import { PunchPLSReducer } from '../pleiepenger-livets-sluttfase/state/reducers/PunchPLSReducer';
import { EksisterendePLSSoknaderReducer } from '../pleiepenger-livets-sluttfase/state/reducers/EksisterendePLSSoknaderReducer';

export const rootReducer = combineReducers({
    [Sakstype.PLEIEPENGER_SYKT_BARN]: combineReducers({
        punchFormState: PunchFormReducer,
        punchState: PunchReducer,
        signaturState: SignaturReducer,
    }),
    [Sakstype.PLEIEPENGER_I_LIVETS_SLUTTFASE]: combineReducers({
        punchFormState: PunchPLSFormReducer,
        punchState: PunchPLSReducer,
        signaturState: SignaturReducer,
    }),
    [Sakstype.OMSORGSPENGER_KRONISK_SYKT_BARN]: combineReducers({
        punchFormState: PunchOMPKSFormReducer,
        punchState: PunchOMPKSReducer,
        signaturState: SignaturReducer,
    }),
    [Sakstype.OMSORGSPENGER_MIDLERTIDIG_ALENE]: combineReducers({
        punchFormState: PunchOMPMAFormReducer,
        punchState: PunchOMPMAReducer,
        signaturState: SignaturReducer,
    }),
    [Sakstype.OMSORGSPENGER_UTBETALING]: combineReducers({
        punchFormState: PunchOMPUTFormReducer,
        punchState: PunchOMPUTReducer,
        signaturState: SignaturReducer,
    }),
    [Sakstype.OMSORGSPENGER_OVERFØRING]: combineReducers({
        signatur: overføringSignaturReducer,
        punch: overføringPunchReducer,
    }),
    [Sakstype.OMSORGSPENGER_FORDELING]: combineReducers({
        opprettIGosys: GosysOppgaveReducer,
    }),
    SØK: combineReducers({
        soknaderSokState: SoknaderSokReducer,
        visningState: SoknaderVisningReducer,
    }),
    fordelingState: FordelingReducer,
    authState: AuthReducer,
    felles: FellesReducer,
    journalposterPerIdentState: JournalposterPerIdentReducer,
    identState: IdentReducer,
    opprettIGosys: GosysOppgaveReducer,
    eksisterendeSoknaderState: EksisterendeSoknaderReducer,
    fordelingSettPåVentState: FordelingSettPaaVentReducer,
    fordelingFerdigstillJournalpostState: FordelingFerdigstillJournalpostReducer,
    eksisterendePLSSoknaderState: EksisterendePLSSoknaderReducer,
    eksisterendeOMPKSSoknaderState: EksisterendeOMPKSSoknaderReducer,
    eksisterendeOMPMASoknaderState: EksisterendeOMPMASoknaderReducer,
    eksisterendeOMPUTSoknaderState: EksisterendeOMPUTSoknaderReducer,
});

export type RootStateType = ReturnType<typeof rootReducer>;
