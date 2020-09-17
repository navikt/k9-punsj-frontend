import { ulid } from 'ulid';

export interface IFellesState {
  dedupKey: string;
}

enum Actiontypes {
  RESET_DEDUP_KEY = 'FELLES/RESET_DEDUP_KEY',
}

interface IResetDedupKeyAction {
  type: Actiontypes.RESET_DEDUP_KEY;
}

export const resetDedupKey = (): IResetDedupKeyAction => ({
  type: Actiontypes.RESET_DEDUP_KEY,
});

const initialState: IFellesState = {
  dedupKey: ulid(),
};

export default function FellesReducer(
  state: IFellesState = initialState,
  action: IResetDedupKeyAction
) {
  switch (action.type) {
    case Actiontypes.RESET_DEDUP_KEY:
      return {
        ...state,
        dedupKey: ulid(),
      };
    default:
      return state;
  }
}
