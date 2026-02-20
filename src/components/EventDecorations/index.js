import React from 'react';
import eventConfig from '../../config/eventConfig';

/**
 * Reads eventConfig.activeEvent (a React component or null) and renders it.
 * This file never needs to change — all event logic lives in events/*.js
 * and selection is done in src/config/eventConfig.js.
 */
export default function EventDecorations() {
  const { activeEvent: ActiveEvent } = eventConfig;
  if (!ActiveEvent) return null;
  return <ActiveEvent />;
}
