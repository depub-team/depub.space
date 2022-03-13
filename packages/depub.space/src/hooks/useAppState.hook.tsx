import React, {
  useMemo,
  createContext,
  FC,
  Reducer,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import update from 'immutability-helper';
import Debug from 'debug';
import type { DesmosProfile, HashTag, List } from '../interfaces';
import { useAlert } from '../components/molecules/Alert';
import { NoBalanceModal } from '../components/organisms/NoBalanceModal';
import { useWallet } from './useWallet.hook';
import { getUserByDTagOrAddress } from '../utils';
import { getLikeCoinBalance } from '../utils/likecoin';
import { LoadingModal } from '../components/organisms/LoadingModal';

const debug = Debug('web:useAppState');

export class AppStateError extends Error {}

const FunctionNever = null as never;

export interface AppStateContextProps {
  isLoadingModalOpen: boolean;
  isImageModalOpen: boolean;
  isNoBalanceModalShow: boolean;
  profile: DesmosProfile | null;
  list: List[];
  image: string | null; // image modal
  imageAspectRatio: number | null; // image modal
  hashTags: HashTag[];
  setList: (list: List[]) => void;
  setHashTags: (hashTags: HashTag[]) => void;
  showLoading: () => void;
  closeLoading: () => void;
  showImageModal: (image: string, aspectRatio: number) => void;
  closeImageModal: () => void;
}

const initialState: AppStateContextProps = {
  list: [],
  hashTags: [],
  isImageModalOpen: false,
  isLoadingModalOpen: false,
  isNoBalanceModalShow: false,
  image: null,
  imageAspectRatio: null,
  profile: null,
  setList: FunctionNever,
  setHashTags: FunctionNever,
  showLoading: FunctionNever,
  closeLoading: FunctionNever,
  showImageModal: FunctionNever,
  closeImageModal: FunctionNever,
};

export const AppStateContext = createContext<AppStateContextProps>(initialState);

const enum ActionType {
  SET_PROFILE = 'SET_PROFILE',
  SET_LIST = 'SET_LIST',
  SET_HASHTAGS = 'SET_HASHTAGS',
  SET_IS_LOADING_MODAL_OPEN = 'SET_IS_LOADING_MODAL_OPEN',
  SET_IS_IMAGE_MODAL_OPEN = 'SET_IS_IMAGE_MODAL_OPEN',
  SET_NO_BALANCE_MODAL_SHOW = 'SET_NO_BALANCE_MODAL_SHOW',
}

type Action =
  | { type: ActionType.SET_PROFILE; profile: DesmosProfile | null }
  | { type: ActionType.SET_LIST; list: List[] }
  | { type: ActionType.SET_HASHTAGS; hashTags: HashTag[] }
  | {
      type: ActionType.SET_IS_IMAGE_MODAL_OPEN;
      isImageModalOpen: boolean;
      image: string | null;
      aspectRatio: number | null;
    }
  | { type: ActionType.SET_IS_LOADING_MODAL_OPEN; isLoadingModalOpen: boolean }
  | { type: ActionType.SET_NO_BALANCE_MODAL_SHOW; isNoBalanceModalShow: boolean };

const reducer: Reducer<AppStateContextProps, Action> = (state, action) => {
  debug('reducer: %O', action);

  switch (action.type) {
    case ActionType.SET_PROFILE:
      return update(state, {
        profile: { $set: action.profile },
      });
    case ActionType.SET_HASHTAGS:
      return update(state, {
        hashTags: { $set: action.hashTags },
      });
    case ActionType.SET_LIST:
      return update(state, {
        list: { $set: action.list },
      });
    case ActionType.SET_IS_LOADING_MODAL_OPEN:
      return update(state, {
        isLoadingModalOpen: { $set: action.isLoadingModalOpen },
      });
    case ActionType.SET_IS_IMAGE_MODAL_OPEN:
      return update(state, {
        isImageModalOpen: { $set: action.isImageModalOpen },
        image: { $set: action.image },
        imageAspectRatio: { $set: action.aspectRatio },
      });
    case ActionType.SET_NO_BALANCE_MODAL_SHOW:
      return update(state, {
        isNoBalanceModalShow: { $set: action.isNoBalanceModalShow },
      });
    default:
      throw new AppStateError(`Cannot match action type ${(action as any).type}`);
  }
};

export const useAppState = () => useContext(AppStateContext);

const useAppActions = (dispatch: React.Dispatch<Action>) => ({
  showLoading: () => {
    dispatch({ type: ActionType.SET_IS_LOADING_MODAL_OPEN, isLoadingModalOpen: true });
  },
  closeLoading: () => {
    dispatch({ type: ActionType.SET_IS_LOADING_MODAL_OPEN, isLoadingModalOpen: false });
  },
  showImageModal: (image: string, aspectRatio: number) => {
    dispatch({
      type: ActionType.SET_IS_IMAGE_MODAL_OPEN,
      isImageModalOpen: true,
      image,
      aspectRatio,
    });
  },
  showNoBalanceModal: () => {
    dispatch({ type: ActionType.SET_NO_BALANCE_MODAL_SHOW, isNoBalanceModalShow: true });
  },
  closeNoBalanceModal: () => {
    dispatch({ type: ActionType.SET_NO_BALANCE_MODAL_SHOW, isNoBalanceModalShow: false });
  },
  setList: (list: List[]) => {
    dispatch({ type: ActionType.SET_LIST, list });
  },
  setHashTags: (hashTags: HashTag[]) => {
    dispatch({ type: ActionType.SET_HASHTAGS, hashTags });
  },
  closeImageModal: () => {
    dispatch({
      type: ActionType.SET_IS_IMAGE_MODAL_OPEN,
      isImageModalOpen: false,
      image: null,
      aspectRatio: null,
    });
  },
});

export const AppStateProvider: FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const alert = useAlert();
  const { walletAddress, error: connectError } = useWallet();
  const actions = useAppActions(dispatch);

  useEffect(() => {
    let showModalTimeout = 0;

    void (async () => {
      if (walletAddress) {
        const user = await getUserByDTagOrAddress(walletAddress);
        const balance = await getLikeCoinBalance(walletAddress);

        if (user && user.profile) {
          dispatch({ type: ActionType.SET_PROFILE, profile: user.profile });
        } else {
          dispatch({ type: ActionType.SET_PROFILE, profile: null });
        }

        if (!balance) {
          showModalTimeout = setTimeout(() => {
            actions.showNoBalanceModal();
          }, 1000) as unknown as number;
        }
      }
    })();

    return () => {
      clearTimeout(showModalTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  useEffect(() => {
    if (connectError) {
      debug('useEffect() -> connectError: %s', connectError);

      alert.show({
        title: connectError,
        status: 'error',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectError]);

  const contextValue = useMemo(
    () => ({
      ...state,
      ...actions,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state]
  );

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
      <LoadingModal isOpen={state.isLoadingModalOpen} />
      <NoBalanceModal isOpen={state.isNoBalanceModalShow} onClose={actions.closeNoBalanceModal} />
    </AppStateContext.Provider>
  );
};

// (AppStateProvider as any).whyDidYouRender = true;
