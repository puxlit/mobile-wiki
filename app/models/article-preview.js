import { inject as service } from '@ember/service';
import EmberObject from '@ember/object';
import fetch from 'fetch';

export default EmberObject.extend({
  wikiVariables: service(),
  wikiUrls: service(),
  fetchService: service('fetch'),

  /**
  * prepare POST request body before sending to API
  * Encode all params to be able to retrieve correct
  * values from the text containing for example '&'
  *
  * @param {string} title title of edited article
  * @param {string} wikitext editor wikitext
  * @param {string} CKmarkup CK editor markup
  * @returns {Promise}
  */
  articleFromMarkup(title, wikitext, CKmarkup) {
    const url = this.wikiUrls.build({
      host: this.get('wikiVariables.host'),
      forceNoSSLOnServerSide: true,
      path: '/wikia.php',
      query: {
        controller: 'MercuryApi',
        method: 'getArticleFromMarkup',
        title,
      },
    });
    const FormDataClass = FastBoot.require('form-data');
    const formData = new FormDataClass();
    const options = this.fetchService.getOptionsForInternalCache(url);

    if (wikitext) {
      formData.append('wikitext', wikitext);
    } else {
      formData.append('CKmarkup', CKmarkup);
    }

    return fetch(url, Object.assign(options, {
      method: 'POST',
      body: formData,
    }))
      .then(response => response.json())
      .then(({ data }) => {
        // Make sure media is in the same format as on article page
        // otherwise hero image won't work correctly
        data.article.media = {
          media: data.article.media,
        };
        data.article.details = {
          ns: 0,
          title,
          revision: {},
          type: 'article',
          comments: 0,
        };
        data.article.displayTitle = title;

        return data.article;
      });
  },
});
