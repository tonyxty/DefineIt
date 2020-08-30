'use strict';

/*
  {
    "term": (string) actual term being defined,
    "phonetic": (string) phonetic,
    "pronunciation": (string) audio file url,
    "senses": [{
      "pos": (string) part of speech,
      "definition": (string) definition,
    }],
    "source": {
      "name": (string) name of source,
      "href": (string) url,
    }
  }
*/

function defineOwlBot(text) {
  const url = "https://owlbot.info/api/v4/dictionary/" + text;
  const token = "";   // a token can be obtained for free at https://owlbot.info/
  return fetch(url, {'headers':
    {'Authorization': "Token " + token}
  }).then(function (response) {
    if (!response.ok)
      return {'status': 'network error', 'error': response};
    return response.json().then(function (json) {
      const result = {
        'term': json['word'],
        'source': {'name': 'OwlBot', 'href': response.url},
        'senses': json['definitions'].map(
          function (ob) { return {'pos': ob['type'], 'definition': ob['definition']}; }
        ),
      };
      return {'status': 'ok', 'result': result};
    });
  });
}

function defineLongman(text) {
  const url = "https://www.ldoceonline.com/dictionary/" + text;
  return fetch(url).then(function (response) {
    if (!response.ok)
      return {'status': 'network error', 'error': response};
    return response.text().then(function (text) {
      const result = {'source': {'name': 'longman', 'href': response.url}};

      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const dict = doc.querySelector('div.dictionary');
      if (dict === null)
        return {'status': 'not found'}
      const entry = dict.querySelector('span.Entry');
      result.term = entry.querySelector('span.HYPHENATION').textContent;

      result.phonetic = entry.querySelector('span.PRON').textContent;
      const elem = entry.querySelector('span.brefile')
      if (elem !== null) {
        const audioURL = new URL(elem.getAttribute('data-src-mp3'), url);
        audioURL.protocol = 'https:';
        result.pronunciation = audioURL.toString();
      }

      const senses = [];
      entry.querySelectorAll('span.Sense').forEach(function (elem) {
        const sense = {};
        const posElem = elem.parentNode.querySelector('span.POS');
        if (posElem !== null)
          sense.pos = posElem.textContent;

        const definition = elem.querySelector('span.DEF');
        if (definition !== null) {
          sense.definition = definition.textContent;
          senses.push(sense);
        }
      });
      result.senses = senses;

      return {'status': 'ok', 'result': result};
    });
  });
}


browser.runtime.onMessage.addListener(function (req, sender, sendResponse) {
  const text = req.text;
  return defineOwlBot(text);
});
