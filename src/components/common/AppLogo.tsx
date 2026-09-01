/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MehfoozLogo, MehfoozLogoProps } from './MehfoozLogo';

export interface AppLogoProps extends MehfoozLogoProps {}

export const AppLogo: React.FC<AppLogoProps> = (props) => {
  return <MehfoozLogo {...props} />;
};

export { MehfoozLogo };

