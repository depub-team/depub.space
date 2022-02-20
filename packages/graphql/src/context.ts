import { Bindings } from '../bindings';
import { DesmosAPI, ISCNQueryAPI } from './datasources';

type ContextFunctionParams = {
  request: Request;
};

type Context = {
  env: Bindings;
  dataSources: {
    iscnQueryAPI: ISCNQueryAPI;
    desmosAPI: DesmosAPI;
  };
};

type Message = {
  id: string; // ISCN record id
  message: string;
  from: string;
  date: string;
  images?: string[];
  profile: Profile;
};

type User = {
  id: string; // wallet address
  profile?: Profile;
  messages: Message[];
};

type Profile = {
  address: string;
  bio?: string;
  coverPic?: string;
  creationTime: string; // ISO timestamp
  dtag: string;
  nickname: string;
  profilePic?: string;
};

export type { User, Context, ContextFunctionParams };
