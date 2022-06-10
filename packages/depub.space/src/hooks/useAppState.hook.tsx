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
  ReactNode,
} from 'react';
import update from 'immutability-helper';
import { useNavigation } from '@react-navigation/native';
import Debug from 'debug';
import type { HomeScreenNavigationProps } from '../navigation/MainStackParamList';
import type { ISCNCreateRawLog, UserProfile, HashTag, List } from '../interfaces';
import { useAlert } from '../components/molecules/Alert';
import { NoBalanceModal } from '../components/organisms/NoBalanceModal';
import { useWallet } from './useWallet.hook';
import {
  dataUrlToFile,
  postMessage,
  getUserByDTagOrAddress,
  TwitterAccessToken,
  getAbbrNickname,
  generateAuthSignature,
  setProfilePicture,
  checkIsNFTProfilePicture,
} from '../utils';
import { getLikeCoinBalance } from '../utils/likecoin';
import * as twitter from '../utils/twitter';
import { LoadingModal } from '../components/organisms/LoadingModal';
import { ImageModal } from '../components/organisms/ImageModal';
import { MessageFormType } from '../components/molecules/MessageComposer';
import { MessageComposerModal } from '../components/organisms/MessageComposerModal';
import { PostedMessageModal } from '../components/organisms/PostedMessageModal';
import {
  ProfilePictureModal,
  SelectedProfilePicture,
} from '../components/organisms/ProfilePictureModal';

const debug = Debug('web:useAppState');

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;
const TWITTER_ACCESS_TOKEN_STORAGE_KEY = 'TWITTER_ACCESS_TOKEN';

export class AppStateError extends Error {}

declare global {
  interface Window {
    dataLayer: Record<string, any>[];
  }
}

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
  isProfilePictureModalOpen: boolean;
  twitterAccessToken?: TwitterAccessToken; // Twitter OAuth token for v1.1 API
  profile?: UserProfile;
  postedMessage?: PostedMessage; // new posted message object
  list: List[];
  image?: string; // image modal
  imageAspectRatio?: number; // image modal
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
  showProfilePictureModal: () => void;
  closeProfilePictureModal: () => void;
}

const initialState: AppStateContextProps = {
  list: [],
  hashTags: [],
  isImageModalOpen: false,
  isLoadingModalOpen: false,
  isProfilePictureModalOpen: false,
  isPostSuccessfulModalOpen: false,
  isNoBalanceModalOpen: false,
  isMessageComposerModalOpen: false,
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
  showProfilePictureModal: FunctionNever,
  closeProfilePictureModal: FunctionNever,
};

export const AppStateContext = createContext<AppStateContextProps>(initialState);

const enum ActionType {
  SET_PROFILE = 'SET_PROFILE',
  SET_LIST = 'SET_LIST',
  SET_HASHTAGS = 'SET_HASHTAGS',
  SET_IS_LOADING_MODAL_OPEN = 'SET_IS_LOADING_MODAL_OPEN',
  SET_IS_IMAGE_MODAL_OPEN = 'SET_IS_IMAGE_MODAL_OPEN',
  SET_IS_PROFILE_PICTURE_MODAL_OPEN = 'SET_IS_PROFILE_PICTURE_MODAL_OPEN',
  SET_NO_BALANCE_MODAL_SHOW = 'SET_NO_BALANCE_MODAL_SHOW',
  SET_IS_MESSAGE_COMPOSER_MODAL_OPEN = 'SET_IS_MESSAGE_COMPOSER_MODAL_OPEN',
  SET_IS_POST_SUCCESSFUL_MODAL_OPEN = 'SET_IS_POST_SUCCESSFUL_MODAL_OPEN',
  SET_TWITTER_ACCESS_TOKEN = 'SET_TWITTER_ACCESS_TOKEN',
}

type Action =
  | { type: ActionType.SET_PROFILE; profile: UserProfile | undefined }
  | { type: ActionType.SET_LIST; list: List[] }
  | { type: ActionType.SET_HASHTAGS; hashTags: HashTag[] }
  | {
      type: ActionType.SET_IS_IMAGE_MODAL_OPEN;
      isImageModalOpen: boolean;
      image: string | undefined;
      aspectRatio: number | undefined;
    }
  | { type: ActionType.SET_IS_LOADING_MODAL_OPEN; isLoadingModalOpen: boolean }
  | { type: ActionType.SET_NO_BALANCE_MODAL_SHOW; isNoBalanceModalOpen: boolean }
  | { type: ActionType.SET_IS_MESSAGE_COMPOSER_MODAL_OPEN; isMessageComposerModalOpen: boolean }
  | {
      type: ActionType.SET_TWITTER_ACCESS_TOKEN;
      twitterAccessToken: TwitterAccessToken | undefined;
    }
  | { type: ActionType.SET_IS_PROFILE_PICTURE_MODAL_OPEN; isProfilePictureModalOpen: boolean }
  | {
      type: ActionType.SET_IS_POST_SUCCESSFUL_MODAL_OPEN;
      isPostSuccessfulModalOpen: boolean;
      postedMessage: PostedMessage | undefined;
    };

const reducer: Reducer<AppStateContextProps, Action> = (state, action) => {
  debug('reducer: %O', action);

  switch (action.type) {
    case ActionType.SET_PROFILE:
      return update(state, {
        profile: {
          $set: action.profile && {
            ...action.profile,
            isNFTProfilePicture: checkIsNFTProfilePicture(action.profile?.profilePicProvider || ''),
          },
        },
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
    case ActionType.SET_IS_PROFILE_PICTURE_MODAL_OPEN:
      return update(state, {
        isProfilePictureModalOpen: { $set: action.isProfilePictureModalOpen },
      });
    default:
      throw new AppStateError(`Cannot match action type ${(action as any).type}`);
  }
};

export const useAppState = () => useContext(AppStateContext);

const pushGtmEvent = (
  event: string,
  walletAddress: string | undefined,
  eventPayload?: Record<string, any>
) => {
  window.dataLayer = window.dataLayer || [];

  try {
    window.dataLayer.push({
      event,
      pagePath: window.location.href,
      pageTitle: window.document.title,
      userId: walletAddress,
      likePrefixed: walletAddress && /like/.test(walletAddress),
      visitorType: walletAddress ? 'user-with-wallet' : 'user-without-wallet',
      ...eventPayload,
    });
  } catch {
    // do nothing
  }
};

const useAppActions = (dispatch: React.Dispatch<Action>) => ({
  showLoading: () => {
    dispatch({ type: ActionType.SET_IS_LOADING_MODAL_OPEN, isLoadingModalOpen: true });
  },
  closeLoading: () => {
    dispatch({ type: ActionType.SET_IS_LOADING_MODAL_OPEN, isLoadingModalOpen: false });
  },
  showImageModal: (image: string, aspectRatio?: number) => {
    dispatch({
      type: ActionType.SET_IS_IMAGE_MODAL_OPEN,
      isImageModalOpen: true,
      image,
      aspectRatio,
    });
  },
  showProfilePictureModal: () => {
    dispatch({
      type: ActionType.SET_IS_PROFILE_PICTURE_MODAL_OPEN,
      isProfilePictureModalOpen: true,
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
  closeProfilePictureModal: () => {
    dispatch({
      type: ActionType.SET_IS_PROFILE_PICTURE_MODAL_OPEN,
      isProfilePictureModalOpen: false,
    });
  },
  closePostSuccessfulModal: () => {
    dispatch({
      type: ActionType.SET_IS_POST_SUCCESSFUL_MODAL_OPEN,
      isPostSuccessfulModalOpen: false,
      postedMessage: undefined,
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
      image: undefined,
      aspectRatio: undefined,
    });
  },
});

export interface AppStateProviderProps {
  children: ReactNode;
}

export const AppStateProvider: FC<AppStateProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigation = useNavigation<HomeScreenNavigationProps>();
  const alert = useAlert();
  const { offlineSigner, walletAddress, error: connectError } = useWallet();
  const actions = useAppActions(dispatch);
  const likecoinAddress = state.profile && state.profile.address;
  const userHandle = likecoinAddress && state.profile?.dtag ? state.profile.dtag : walletAddress;
  const imageModalSource = useMemo(
    () => (state.image ? { uri: state.image } : undefined),
    [state.image]
  );

  const handleOnTwitterLogout = useCallback(() => {
    actions.showLoading();

    localStorage.removeItem(TWITTER_ACCESS_TOKEN_STORAGE_KEY);

    dispatch({
      type: ActionType.SET_TWITTER_ACCESS_TOKEN,
      twitterAccessToken: undefined,
    });

    actions.closeLoading();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      pushGtmEvent('twitterAuthorize', walletAddress);

      window.open(
        loginUrl,
        'twitter',
        'status=1,toolbar=no,location=0,status=no,titlebar=no,menubar=no,width=640,height=480'
      );
    } catch (error) {
      debug('handleOnTwitterLogin() -> error: %O', error);
    }

    actions.closeLoading();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offlineSigner]);

  const navigateToUserProfile = useCallback(() => {
    if (!userHandle) {
      return;
    }

    navigation.navigate('User', { account: userHandle, revision: Math.random() });
  }, [navigation, userHandle]);

  const updateProfilePicture = useCallback(
    async (selectedProfilePicture: SelectedProfilePicture) => {
      debug('updateProfilePicture(selectedProfilePicture)', selectedProfilePicture);

      actions.showLoading();

      try {
        if (offlineSigner && walletAddress) {
          const authHeader = await generateAuthSignature(offlineSigner);

          pushGtmEvent('updatingProfilePicture', walletAddress, {
            ...selectedProfilePicture,
          });

          await setProfilePicture(
            walletAddress,
            selectedProfilePicture.image,
            selectedProfilePicture.platform,
            authHeader
          );

          // update user profile
          const user = await getUserByDTagOrAddress(walletAddress);

          if (user && user.profile) {
            dispatch({
              type: ActionType.SET_PROFILE,
              profile: user.profile,
            });

            alert.show({
              title: 'Your profile picture has been updated!',
              status: 'success',
            });

            pushGtmEvent('updatedProfilePicture', walletAddress, {
              ...selectedProfilePicture,
            });

            setTimeout(() => {
              navigateToUserProfile();
            }, 3000);
          } else {
            dispatch({ type: ActionType.SET_PROFILE, profile: undefined });
          }

          // reset
          actions.closeProfilePictureModal();
          actions.closeLoading();
        }
      } catch (ex) {
        let errorMessage = 'Failed to prove ownership! please try again later.';

        pushGtmEvent('failedToUpdateProfilePicture', walletAddress, {
          error: ex.message,
        });

        if (ex.message === 'Request rejected') {
          errorMessage = ex.message;
        } else if (ex.message === 'Invalid signature') {
          errorMessage = 'Invalid signature!';
        }

        actions.closeLoading();

        alert.show({
          title: errorMessage,
          status: 'error',
        });

        Sentry.captureException(ex);
      }
    },
    [actions, offlineSigner, walletAddress, alert, navigateToUserProfile]
  );

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
        pushGtmEvent('postingTweet', walletAddress, {
          hasAttachment: !!file,
          bodyLength: data.message.length,
        });

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

            Sentry.captureException(error);
          }
        }

        pushGtmEvent('postedTweet', walletAddress, {
          postedOnTwitter: !!twitterUrl,
          hasAttachment: !!file,
        });

        actions.showPostSuccessfulModal({
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          userHandle: userHandle!,
          twitterUrl,
        });

        // reset
        actions.closeMessageComposerModal();
        actions.closeLoading();
      } catch (ex) {
        pushGtmEvent('failedToPostTweet', walletAddress, {
          error: ex.message,
        });

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
    [actions, alert, offlineSigner, state.twitterAccessToken, userHandle, walletAddress]
  );

  const handleOkPostedMessage = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    navigateToUserProfile();

    actions.closePostSuccessfulModal();
  }, [actions, navigateToUserProfile]);

  useEffect(() => {
    let showModalTimeout = 0;

    // get user profile and balance
    void (async () => {
      if (walletAddress) {
        const balance = await getLikeCoinBalance(walletAddress);
        const user = await getUserByDTagOrAddress(walletAddress);

        if (user && user.profile) {
          dispatch({ type: ActionType.SET_PROFILE, profile: user.profile });
        } else {
          dispatch({ type: ActionType.SET_PROFILE, profile: undefined });
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

  useEffect(() => {
    const handleLocalStorageChange = (event?: StorageEvent) => {
      try {
        if (event?.newValue === null) {
          dispatch({
            type: ActionType.SET_TWITTER_ACCESS_TOKEN,
            twitterAccessToken: undefined,
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
  }, []);

  const contextValue = useMemo(
    () => ({
      ...state,
      ...actions,
      postAndUpload,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [postAndUpload, state]
  );

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
      <ImageModal
        aspectRatio={state.imageAspectRatio || 1}
        isOpen={state.isImageModalOpen}
        source={imageModalSource}
        onClose={actions.closeImageModal}
      />
      {walletAddress && (
        <ProfilePictureModal
          address={walletAddress}
          avatarName={getAbbrNickname(state.profile?.nickname || state.profile?.address || '')}
          defaultAvatar={state.profile?.profilePic}
          defaultPlatform={
            state.profile?.profilePicProvider || (state.profile?.profilePic ? 'desmos' : undefined)
          }
          isOpen={state.isProfilePictureModalOpen}
          onClose={actions.closeProfilePictureModal}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onOk={updateProfilePicture}
        />
      )}
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
