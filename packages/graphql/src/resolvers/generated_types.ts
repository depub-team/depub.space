import { GraphQLResolveInfo } from 'graphql';
import { Context } from '../context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type ChainConfig = {
  __typename?: 'ChainConfig';
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type ChainLink = {
  __typename?: 'ChainLink';
  chainConfig?: Maybe<ChainConfig>;
  creationTime: Scalars['String'];
  externalAddress: Scalars['String'];
};

export type Channels = {
  __typename?: 'Channels';
  hashTags: Array<Maybe<HashTag>>;
  list: Array<Maybe<List>>;
};

export type HashTag = {
  __typename?: 'HashTag';
  count: Scalars['Int'];
  name: Scalars['String'];
};

export type List = {
  __typename?: 'List';
  hashTag: Scalars['String'];
  name: Scalars['String'];
};

export type Message = {
  __typename?: 'Message';
  date: Scalars['String'];
  from: Scalars['String'];
  id: Scalars['ID'];
  images?: Maybe<Array<Maybe<Scalars['String']>>>;
  message: Scalars['String'];
  profile?: Maybe<Profile>;
};

export type NftAsset = {
  __typename?: 'NFTAsset';
  address: Scalars['String'];
  media: Scalars['String'];
  mediaType: Scalars['String'];
  name: Scalars['String'];
  tokenId: Scalars['String'];
};

export type Profile = {
  __typename?: 'Profile';
  address: Scalars['String'];
  bio?: Maybe<Scalars['String']>;
  chainLinks?: Maybe<Array<Maybe<ChainLink>>>;
  coverPic?: Maybe<Scalars['String']>;
  creationTime: Scalars['String'];
  dtag: Scalars['String'];
  id: Scalars['ID'];
  nickname: Scalars['String'];
  profilePic?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  getChannels?: Maybe<Channels>;
  getMessage?: Maybe<Message>;
  getOmniflixNFTsByOwner?: Maybe<Array<Maybe<NftAsset>>>;
  getStargazeNFTsByOwner?: Maybe<Array<Maybe<NftAsset>>>;
  getUser?: Maybe<User>;
  getUserProfile?: Maybe<Profile>;
  messages?: Maybe<Array<Maybe<Message>>>;
  messagesByHashTag?: Maybe<Array<Maybe<Message>>>;
  messagesByMentioned?: Maybe<Array<Maybe<Message>>>;
};


export type QueryGetChannelsArgs = {
  countryCode?: InputMaybe<Scalars['String']>;
};


export type QueryGetMessageArgs = {
  iscnId: Scalars['String'];
};


export type QueryGetOmniflixNfTsByOwnerArgs = {
  owner: Scalars['String'];
};


export type QueryGetStargazeNfTsByOwnerArgs = {
  owner: Scalars['String'];
};


export type QueryGetUserArgs = {
  dtagOrAddress: Scalars['String'];
  limit?: InputMaybe<Scalars['Int']>;
  previousId?: InputMaybe<Scalars['String']>;
};


export type QueryGetUserProfileArgs = {
  dtagOrAddress: Scalars['String'];
};


export type QueryMessagesArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  previousId?: InputMaybe<Scalars['String']>;
};


export type QueryMessagesByHashTagArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  previousId?: InputMaybe<Scalars['String']>;
  tag: Scalars['String'];
};


export type QueryMessagesByMentionedArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  mentioned: Scalars['String'];
  previousId?: InputMaybe<Scalars['String']>;
};

export type User = {
  __typename?: 'User';
  address: Scalars['String'];
  id: Scalars['ID'];
  messages?: Maybe<Array<Maybe<Message>>>;
  profile?: Maybe<Profile>;
};


export type UserMessagesArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  previousId?: InputMaybe<Scalars['String']>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  ChainConfig: ResolverTypeWrapper<ChainConfig>;
  ChainLink: ResolverTypeWrapper<ChainLink>;
  Channels: ResolverTypeWrapper<Channels>;
  HashTag: ResolverTypeWrapper<HashTag>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  List: ResolverTypeWrapper<List>;
  Message: ResolverTypeWrapper<Message>;
  NFTAsset: ResolverTypeWrapper<NftAsset>;
  Profile: ResolverTypeWrapper<Profile>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']>;
  User: ResolverTypeWrapper<User>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean'];
  ChainConfig: ChainConfig;
  ChainLink: ChainLink;
  Channels: Channels;
  HashTag: HashTag;
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  List: List;
  Message: Message;
  NFTAsset: NftAsset;
  Profile: Profile;
  Query: {};
  String: Scalars['String'];
  User: User;
};

export type ChainConfigResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ChainConfig'] = ResolversParentTypes['ChainConfig']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ChainLinkResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ChainLink'] = ResolversParentTypes['ChainLink']> = {
  chainConfig?: Resolver<Maybe<ResolversTypes['ChainConfig']>, ParentType, ContextType>;
  creationTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  externalAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ChannelsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Channels'] = ResolversParentTypes['Channels']> = {
  hashTags?: Resolver<Array<Maybe<ResolversTypes['HashTag']>>, ParentType, ContextType>;
  list?: Resolver<Array<Maybe<ResolversTypes['List']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type HashTagResolvers<ContextType = Context, ParentType extends ResolversParentTypes['HashTag'] = ResolversParentTypes['HashTag']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ListResolvers<ContextType = Context, ParentType extends ResolversParentTypes['List'] = ResolversParentTypes['List']> = {
  hashTag?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MessageResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Message'] = ResolversParentTypes['Message']> = {
  date?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  from?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  images?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  profile?: Resolver<Maybe<ResolversTypes['Profile']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NftAssetResolvers<ContextType = Context, ParentType extends ResolversParentTypes['NFTAsset'] = ResolversParentTypes['NFTAsset']> = {
  address?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  media?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  mediaType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tokenId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProfileResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Profile'] = ResolversParentTypes['Profile']> = {
  address?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  bio?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  chainLinks?: Resolver<Maybe<Array<Maybe<ResolversTypes['ChainLink']>>>, ParentType, ContextType>;
  coverPic?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  creationTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  dtag?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  nickname?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  profilePic?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  getChannels?: Resolver<Maybe<ResolversTypes['Channels']>, ParentType, ContextType, Partial<QueryGetChannelsArgs>>;
  getMessage?: Resolver<Maybe<ResolversTypes['Message']>, ParentType, ContextType, RequireFields<QueryGetMessageArgs, 'iscnId'>>;
  getOmniflixNFTsByOwner?: Resolver<Maybe<Array<Maybe<ResolversTypes['NFTAsset']>>>, ParentType, ContextType, RequireFields<QueryGetOmniflixNfTsByOwnerArgs, 'owner'>>;
  getStargazeNFTsByOwner?: Resolver<Maybe<Array<Maybe<ResolversTypes['NFTAsset']>>>, ParentType, ContextType, RequireFields<QueryGetStargazeNfTsByOwnerArgs, 'owner'>>;
  getUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryGetUserArgs, 'dtagOrAddress'>>;
  getUserProfile?: Resolver<Maybe<ResolversTypes['Profile']>, ParentType, ContextType, RequireFields<QueryGetUserProfileArgs, 'dtagOrAddress'>>;
  messages?: Resolver<Maybe<Array<Maybe<ResolversTypes['Message']>>>, ParentType, ContextType, Partial<QueryMessagesArgs>>;
  messagesByHashTag?: Resolver<Maybe<Array<Maybe<ResolversTypes['Message']>>>, ParentType, ContextType, RequireFields<QueryMessagesByHashTagArgs, 'tag'>>;
  messagesByMentioned?: Resolver<Maybe<Array<Maybe<ResolversTypes['Message']>>>, ParentType, ContextType, RequireFields<QueryMessagesByMentionedArgs, 'mentioned'>>;
};

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  address?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  messages?: Resolver<Maybe<Array<Maybe<ResolversTypes['Message']>>>, ParentType, ContextType, Partial<UserMessagesArgs>>;
  profile?: Resolver<Maybe<ResolversTypes['Profile']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = Context> = {
  ChainConfig?: ChainConfigResolvers<ContextType>;
  ChainLink?: ChainLinkResolvers<ContextType>;
  Channels?: ChannelsResolvers<ContextType>;
  HashTag?: HashTagResolvers<ContextType>;
  List?: ListResolvers<ContextType>;
  Message?: MessageResolvers<ContextType>;
  NFTAsset?: NftAssetResolvers<ContextType>;
  Profile?: ProfileResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
};

