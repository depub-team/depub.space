import { Bindings } from '../bindings';
import {
  OmniflixAPI,
  DesmosAPI,
  ISCNQueryAPI,
  NotionAPI,
  StargazeAPI,
  LikerLandApi,
} from './datasources';

type ContextFunctionParams = {
  request: Request;
};

type Context = {
  env: Bindings;
  accessToken: string;
  authPublicKey: string;
  dataSources: {
    iscnQueryAPI: ISCNQueryAPI;
    desmosAPI: DesmosAPI;
    omniflixAPI: OmniflixAPI;
    notionAPI: NotionAPI;
    stargazeAPI: StargazeAPI;
    likerLandAPI: LikerLandApi;
  };
};

export type { Context, ContextFunctionParams };
