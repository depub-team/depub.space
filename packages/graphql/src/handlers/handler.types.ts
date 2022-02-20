export interface GqlHandlerOptions {
  baseEndpoint: string;
  playgroundEndpoint: string;
  forwardUnmatchedRequestsToOrigin: boolean;
  debug: boolean;
  cors: boolean | object; // TODO: type this
  kvCache: boolean;
  context?: () => any;
}
