import Service, { inject as service } from '@ember/service';
import { ArticleCommentsFetchError } from '../utils/errors';
import { track, trackActions } from '../utils/track';

const bannerNotificationTypesMap = {
  notify: 'message',
  confirm: 'success',
  warn: 'warning',
  error: 'alert',
};

export default Service.extend({
  currentUser: service(),
  wikiUrls: service(),
  wikiVariables: service(),
  i18n: service(),
  logger: service(),
  fetch: service(),
  wdsBannerNotifications: service(),

  fetchI18n() {
    const i18nFilePath = `/mobile-wiki/assets/articleComments/${this.i18n.language}.json`;
    const enFilePath = '/mobile-wiki/assets/articleComments/en.json';

    return fetch(i18nFilePath)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        // if lang file was not found fallback to English
        return fetch(enFilePath)
          .then((fallback) => {
            if (fallback.ok) {
              return fallback.json();
            }

            throw new Error(`Article comments i18n file not found under ${i18nFilePath}`);
          });
      });
  },

  fetchCount(title, namespace) {
    const url = this.wikiUrls.build({
      host: this.get('wikiVariables.host'),
      path: '/wikia.php',
      query: {
        controller: 'Fandom\\ArticleComments\\Api\\ArticleCommentsController',
        method: 'getCommentCount',
        hideDeleted: true,
        title,
        namespace,
      },
    });

    return this.fetch.fetchFromMediawiki(url, ArticleCommentsFetchError);
  },

  getUrlThreadParams() {
    const searchParams = new URLSearchParams(window.location.search);
    const urlThreadId = searchParams.get('commentId');
    const urlReplyId = searchParams.get('replyId');
    return { urlThreadId, urlReplyId };
  },

  load({ title, namespace }) {
    window.fandomWebEditorPublicPath = '/mobile-wiki/assets/webEditor/';

    const { urlThreadId, urlReplyId } = this.getUrlThreadParams();

    Promise.all([
      import('@fandom/article-comments'),
      /**
       * Dynamic import does not work here due to:
       * - https://github.com/ef4/ember-auto-import/issues/276
       * - https://github.com/ef4/ember-auto-import/issues/190
       *
       * Files are copied to respective directory
       * @see ember-cli-build.js
       */
      this.fetchI18n(),
    ]).then(([{ default: createComments }, i18n]) => {
      const user = {
        avatarUrl: this.currentUser.avatarPath,
        username: this.currentUser.name,
        token: '', // not needed, read only
        isAnon: false, // not needed, read only
        isBlocked: false, // not needed, read only
        canModerate: false, // not needed, read only
      };

      const env = {
        articleTitle: title,
        articleNamespace: namespace,
        apiBaseUrl: this.wikiUrls.build({
          host: this.wikiVariables.host,
          path: '/wikia.php',
        }),
        userProfileBaseUrl: `${this.wikiUrls.build({ host: this.wikiVariables.host })}/User:`,
        isReadOnly: true,
        isMobile: true,
        urlThreadId,
        urlReplyId,
        viewMode: urlThreadId ? 'thread' : 'default',
      };

      const trackFn = (params) => {
        track(Object.assign({
          category: 'article-comments',
          action: trackActions.click,
        }, params, {
          // overrides trackingMethod because jwplayer sends `analytics` method,
          // which is not supported by mobile wiki
          trackingMethod: 'both',
        }));
      };

      const notify = (message, type, timeout = 5000) => {
        this.wdsBannerNotifications.addNotification({
          type: bannerNotificationTypesMap[type] || 'message',
          alreadySafeHtml: message,
          hideAfterMs: timeout,
        });
      };

      createComments({
        env,
        user,
        i18n,
        track: trackFn,
        notify,
        container: document.getElementById('articleComments'),
      });
    }).catch((err) => {
      this.logger.error('Error while loading article comments', err);
    });
  },
});
