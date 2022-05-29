import { Bindings } from '../bindings';
import { OmniflixAPI, DesmosAPI, ISCNQueryAPI, NotionAPI, StargazeAPI } from './datasources';

type ContextFunctionParams = {
  request: Request;
};

type Context = {
  env: Bindings;
  dataSources: {
    iscnQueryAPI: ISCNQueryAPI;
    desmosAPI: DesmosAPI;
    omniflixAPI: OmniflixAPI;
    notionAPI: NotionAPI;
    stargazeAPI: StargazeAPI;
  };
};

export type { Context, ContextFunctionParams };
