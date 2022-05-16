import * as Sentry from '@sentry/nextjs';
import React, {
  useMemo,
  createContext,
  FC,
  Reducer,
  useContext,
  useEffect,
  useReducer,
  useCallback,
} from 'react';
import update from 'immutability-helper';
import { useNavigation } from '@react-navigation/native';
import Debug from 'debug';
import type { HomeScreenNavigationProps } from '../navigation/MainStackParamList';

import type { ISCNCreateRawLog, DesmosProfile, HashTag, List } from '../interfaces';
import { useAlert } from '../components/molecules/Alert';
import { NoBalanceModal } from '../components/organisms/NoBalanceModal';
import { useWallet } from './useWallet.hook';
import {
  dataUrlToFile,
  postMessage,
  getUserByDTagOrAddress,
  getLikecoinAddressByProfile,
  TwitterAccessToken,
} from '../utils';
import { getLikeCoinBalance } from '../utils/likecoin';
import * as twitter from '../utils/twitter';
import { LoadingModal } from '../components/organisms/LoadingModal';
import { ImageModal } from '../components/organisms/ImageModal';
import { MessageFormType } from '../components/molecules/MessageComposer';
import { MessageComposerModal } from '../components/organisms/MessageComposerModal';
import { PostedMessageModal } from '../components/organisms/PostedMessageModal';

const debug = Debug('web:useAppState');

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;
const TWITTER_ACCESS_TOKEN_STORAGE_KEY = 'TWITTER_ACCESS_TOKEN';

export class AppStateError extends Error {}

const FunctionNever = null as never;

interface PostedMessage {
  userHandle: string;
  twitterUrl?: string;
}
export interface AppStateContextProps {
  isLoadingModalOpen: boolean;
  isImageModalOpen: boolean;
  isNoBalanceModalOpen: boolean;
  isPostSuccessfulModalOpen: boolean;
  isMessageComposerModalOpen: boolean;
  twitterAccessToken: TwitterAccessToken | null; // Twitter OAuth token for v1.1 API
  profile: DesmosProfile | null;
  postedMessage: PostedMessage | null; // new posted message object
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
  showMessageComposerModal: () => void;
  closeMessageComposerModal: () => void;
  showPostSuccessfulModal: (postedMessage: PostedMessage) => void;
  closePostSuccessfulModal: () => void;
}

const initialState: AppStateContextProps = {
  list: [],
  hashTags: [],
  twitterAccessToken: null,
  isImageModalOpen: false,
  isLoadingModalOpen: false,
  isPostSuccessfulModalOpen: false,
  isNoBalanceModalOpen: false,
  isMessageComposerModalOpen: false,
  postedMessage: null,
  image: null,
  imageAspectRatio: null,
  profile: null,
  setList: FunctionNever,
  setHashTags: FunctionNever,
  showLoading: FunctionNever,
  closeLoading: FunctionNever,
  showImageModal: FunctionNever,
  closeImageModal: FunctionNever,
  showMessageComposerModal: FunctionNever,
  closeMessageComposerModal: FunctionNever,
  showPostSuccessfulModal: FunctionNever,
  closePostSuccessfulModal: FunctionNever,
};

export const AppStateContext = createContext<AppStateContextProps>(initialState);

const enum ActionType {
  SET_PROFILE = 'SET_PROFILE',
  SET_LIST = 'SET_LIST',
  SET_HASHTAGS = 'SET_HASHTAGS',
  SET_IS_LOADING_MODAL_OPEN = 'SET_IS_LOADING_MODAL_OPEN',
  SET_IS_IMAGE_MODAL_OPEN = 'SET_IS_IMAGE_MODAL_OPEN',
  SET_NO_BALANCE_MODAL_SHOW = 'SET_NO_BALANCE_MODAL_SHOW',
  SET_IS_MESSAGE_COMPOSER_MODAL_OPEN = 'SET_IS_MESSAGE_COMPOSER_MODAL_OPEN',
  SET_IS_POST_SUCCESSFUL_MODAL_OPEN = 'SET_IS_POST_SUCCESSFUL_MODAL_OPEN',
  SET_TWITTER_ACCESS_TOKEN = 'SET_TWITTER_ACCESS_TOKEN',
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
  | { type: ActionType.SET_NO_BALANCE_MODAL_SHOW; isNoBalanceModalOpen: boolean }
  | { type: ActionType.SET_IS_MESSAGE_COMPOSER_MODAL_OPEN; isMessageComposerModalOpen: boolean }
  | { type: ActionType.SET_TWITTER_ACCESS_TOKEN; twitterAccessToken: TwitterAccessToken | null }
  | {
      type: ActionType.SET_IS_POST_SUCCESSFUL_MODAL_OPEN;
      isPostSuccessfulModalOpen: boolean;
      postedMessage: PostedMessage | null;
    };

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
        isNoBalanceModalOpen: { $set: action.isNoBalanceModalOpen },
      });
    case ActionType.SET_IS_MESSAGE_COMPOSER_MODAL_OPEN:
      return update(state, {
        isMessageComposerModalOpen: { $set: action.isMessageComposerModalOpen },
      });
    case ActionType.SET_TWITTER_ACCESS_TOKEN:
      return update(state, {
        twitterAccessToken: { $set: action.twitterAccessToken },
      });
    case ActionType.SET_IS_POST_SUCCESSFUL_MODAL_OPEN:
      return update(state, {
        isPostSuccessfulModalOpen: { $set: action.isPostSuccessfulModalOpen },
        postedMessage: { $set: action.postedMessage },
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
  showImageModal: (image: string, aspectRatio: number | null) => {
    dispatch({
      type: ActionType.SET_IS_IMAGE_MODAL_OPEN,
      isImageModalOpen: true,
      image,
      aspectRatio,
    });
  },
  showMessageComposerModal: () => {
    dispatch({
      type: ActionType.SET_IS_MESSAGE_COMPOSER_MODAL_OPEN,
      isMessageComposerModalOpen: true,
    });
  },
  closeMessageComposerModal: () => {
    dispatch({
      type: ActionType.SET_IS_MESSAGE_COMPOSER_MODAL_OPEN,
      isMessageComposerModalOpen: false,
    });
  },
  showNoBalanceModal: () => {
    dispatch({ type: ActionType.SET_NO_BALANCE_MODAL_SHOW, isNoBalanceModalOpen: true });
  },
  closeNoBalanceModal: () => {
    dispatch({ type: ActionType.SET_NO_BALANCE_MODAL_SHOW, isNoBalanceModalOpen: false });
  },
  showPostSuccessfulModal: (postedMessage: PostedMessage) => {
    dispatch({
      type: ActionType.SET_IS_POST_SUCCESSFUL_MODAL_OPEN,
      isPostSuccessfulModalOpen: true,
      postedMessage,
    });
  },
  closePostSuccessfulModal: () => {
    dispatch({
      type: ActionType.SET_IS_POST_SUCCESSFUL_MODAL_OPEN,
      isPostSuccessfulModalOpen: false,
      postedMessage: null,
    });
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
  const navigation = useNavigation<HomeScreenNavigationProps>();
  const alert = useAlert();
  const { offlineSigner, walletAddress, error: connectError } = useWallet();
  const actions = useAppActions(dispatch);
  const likecoinAddress = state.profile && getLikecoinAddressByProfile(state.profile);
  const userHandle = likecoinAddress && state.profile?.dtag ? state.profile.dtag : walletAddress;
  const imageModalSoure = useMemo(
    () => (state.image ? { uri: state.image } : undefined),
    [state.image]
  );

  const handleOnTwitterLogout = useCallback(() => {
    actions.showLoading();

    localStorage.removeItem(TWITTER_ACCESS_TOKEN_STORAGE_KEY);

    dispatch({
      type: ActionType.SET_TWITTER_ACCESS_TOKEN,
      twitterAccessToken: null,
    });

    actions.closeLoading();
  }, [actions]);

  const handleOnMessageComposerModalClose = useCallback(() => {
    actions.closeMessageComposerModal();
  }, [actions]);

  const handleOnTwitterLogin = useCallback(async () => {
    if (!offlineSigner) {
      return;
    }

    actions.showLoading();

    try {
      const loginUrl = await twitter.getLoginUrl();

      window.open(
        loginUrl,
        'twitter',
        'status=1,toolbar=no,location=0,status=no,titlebar=no,menubar=no,width=640,height=480'
      );
    } catch (error) {
      debug('handleOnTwitterLogin() -> error: %O', error);
    }

    actions.closeLoading();
  }, [actions, offlineSigner]);

  const postAndUpload = useCallback(
    async (data: MessageFormType, image?: string | null) => {
      let file: File | undefined;

      if (image) {
        file = await dataUrlToFile(image, 'upload');
      }

      if (!offlineSigner) {
        alert.show({
          title: 'No valid signer, please connect wallet',
          status: 'error',
        });

        return;
      }

      // show loading
      actions.showLoading();

      try {
        const txn = await postMessage(offlineSigner, data.message, file && [file]);
        const rawLog = JSON.parse(txn.rawLog || '[]') as ISCNCreateRawLog[];
        const iscnRecord = rawLog[0].events.find(event => event.type === 'iscn_record');
        let newMessageUrl: string | undefined;
        let twitterUrl: string | undefined;

        if (iscnRecord?.attributes) {
          const iscnId = iscnRecord.attributes.find(attribute => attribute.key === 'iscn_id');

          if (iscnId) {
            newMessageUrl = `${APP_URL}/${iscnId.value.replace('iscn://likecoin-chain/', '')}`;
          }
        }

        if (!newMessageUrl) {
          throw new Error('Failed to get new message url');
        }

        // posting to Twitter
        if (state.twitterAccessToken) {
          try {
            twitterUrl = await twitter.postTweet(state.twitterAccessToken, data.message, file);
          } catch (error) {
            debug('postAndUpload() -> error: %O', error);

            alert.show({
              title: 'Failed to post to Twitter, please try again later',
              status: 'error',
            });
          }
        }

        actions.showPostSuccessfulModal({
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          userHandle: userHandle!,
          twitterUrl,
        });

        actions.closeMessageComposerModal();
        actions.closeLoading();
      } catch (ex) {
        debug('postMessage() -> error: %O', ex);
        let errorMessage = 'Failed to post message! please try again later.';

        if (/^Account does not exist on chain/.test(ex.message)) {
          errorMessage = ex.message;
        } else if (ex.message === 'Request rejected') {
          errorMessage = ex.message;
        }

        actions.closeLoading();

        alert.show({
          title: errorMessage,
          status: 'error',
        });

        Sentry.captureException(ex);
      }
    },
    [actions, alert, offlineSigner, state.twitterAccessToken, userHandle]
  );

  const handleOkPostedMessage = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    navigation.navigate('User', { account: userHandle! });

    actions.closePostSuccessfulModal();
  }, [actions, navigation, userHandle]);

  useEffect(() => {
    let showModalTimeout = 0;

    // get user profile and balance
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
  }, [actions, walletAddress]);

  useEffect(() => {
    if (connectError) {
      debug('useEffect() -> connectError: %s', connectError);

      alert.show({
        title: connectError,
        status: 'error',
      });
    }
  }, [alert, connectError]);

  useEffect(() => {
    const handleLocalStorageChange = (event?: StorageEvent) => {
      try {
        if (event?.newValue === null) {
          dispatch({
            type: ActionType.SET_TWITTER_ACCESS_TOKEN,
            twitterAccessToken: null,
          });

          return;
        }

        // setup Twitter oauth access token
        const encryptedTwitterAccessToken =
          event?.newValue || window.localStorage.getItem(TWITTER_ACCESS_TOKEN_STORAGE_KEY);

        if (encryptedTwitterAccessToken) {
          const twitterAccessToken = JSON.parse(
            window.atob(encryptedTwitterAccessToken)
          ) as TwitterAccessToken;

          if (twitterAccessToken && twitterAccessToken.oauth_token) {
            dispatch({
              type: ActionType.SET_TWITTER_ACCESS_TOKEN,
              twitterAccessToken,
            });
          }
        }
      } catch {
        // do nothing
      }
    };

    void handleLocalStorageChange();

    window.addEventListener('storage', handleLocalStorageChange);

    return () => {
      window.removeEventListener('storage', handleLocalStorageChange);
    };
  }, [walletAddress]);

  const contextValue = useMemo(
    () => ({
      ...state,
      ...actions,
      postAndUpload,
    }),
    [actions, postAndUpload, state]
  );

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
      <ImageModal
        aspectRatio={state.imageAspectRatio || 1}
        isOpen={state.isImageModalOpen}
        source={imageModalSoure}
        onClose={actions.closeImageModal}
      />
      <LoadingModal isOpen={state.isLoadingModalOpen} />
      <NoBalanceModal isOpen={state.isNoBalanceModalOpen} onClose={actions.closeNoBalanceModal} />
      <MessageComposerModal
        isLoading={state.isLoadingModalOpen}
        isOpen={state.isMessageComposerModalOpen}
        isTwitterLoggedIn={Boolean(state.twitterAccessToken)}
        profile={state.profile}
        walletAddress={walletAddress}
        onClose={handleOnMessageComposerModalClose}
        onSubmit={postAndUpload}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onTwitterLogin={handleOnTwitterLogin}
        onTwitterLogout={handleOnTwitterLogout}
      />
      {state.isPostSuccessfulModalOpen && state.postedMessage && (
        <PostedMessageModal
          isOpen={state.isPostSuccessfulModalOpen}
          twitterUrl={state.postedMessage?.twitterUrl}
          onClose={actions.closePostSuccessfulModal}
          onOk={handleOkPostedMessage}
        />
      )}
    </AppStateContext.Provider>
  );
};

// (AppStateProvider as any).whyDidYouRender = true;
