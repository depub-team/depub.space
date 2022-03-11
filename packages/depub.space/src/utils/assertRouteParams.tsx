import React from 'react';
import Debug from 'debug';
import { RouteProp } from '@react-navigation/native';

const debug = Debug('web:assertRouteParams');

// XXX: this is a hack to workaround when browser history backward some screen not able to get route params

export const assertRouteParams =
  <P extends object>(Component: React.ComponentType<P>): React.FC<P & { route?: RouteProp<any> }> =>
  props => {
    if (!props.route?.params) {
      debug('params not found');

      return null;
    }

    return <Component {...props} />;
  };
