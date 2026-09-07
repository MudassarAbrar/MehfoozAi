/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SafeNavigation legacy wrapper — safe corridor route functionality has been merged
 * into the unified SilentCheckIn ("Safe Check-In") component.
 */

import React from 'react';
import { SilentCheckIn } from './SilentCheckIn';
import { AppLanguage, UserProfile } from '../types';

interface SafeNavigationProps {
  language: AppLanguage;
  user: UserProfile | null;
  onOpenCrisis: () => void;
}

export const SafeNavigation: React.FC<SafeNavigationProps> = (props) => {
  return <SilentCheckIn {...props} />;
};
