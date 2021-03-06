import Ember from 'ember';
import { logError } from '../modules/event-logger';

const whitelistErrorMessages = [
  'Attempt to use history.pushState() more than 100 times per 30.000000 seconds',
];

export function initialize(appInstance) {
  const runtimeConfig = appInstance.lookup('service:runtimeConfig');

  if (typeof FastBoot !== 'undefined') {
    return;
  }
  Ember.onerror = function (error) {
    if (whitelistErrorMessages.indexOf(error.message) === -1) {
      logError(runtimeConfig.servicesExternalHost, 'Ember.onerror', {
        message: error.message,
        stack: error.stack,
      });
    }

    // To be able to display it in console
    throw error;
  };
}

export default {
  name: 'error-logger',
  initialize,
};
