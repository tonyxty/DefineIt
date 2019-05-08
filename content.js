'use strict';

{
  const popover = (function () {
    const headerElem = document.createElement('header');
    const controls = document.createElement('div');
    const contentElem = document.createElement('div');
    const popover = document.createElement('div');

    controls.classList.add('controls');
    const closeButton = document.createElement('input');
    closeButton.type = 'image';
    closeButton.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAA5ElEQVQokaXSrU5DQRAF4G+bpoKQG4KsQKHQiIqmQRAEHkMIIWgegOCQKJ6JoBAExSMgSQUhCNIOonvL3gXBz5lssntmTmbnJ4XQIkl9zEPMFUhSD0q+VziHOMSkEjU4wThJg6UjZ1zHNaZ4xCTza7jEGx6wh36IpXALT4h87rCfRdPMzXCF1VK4gvMq6CVnCrzjFtthYZYXGlzgucjcnhuMwqfpPNjI36yFZ6FrZVcbHGHTVxwkadRhfljj7Nsa/9PVeo7jao6vuMduZ445aIhj7FQNa3BqsVGDlk9/3dWO8Df4ABynlLx2U5FZAAAAAElFTkSuQmCC';
    closeButton.addEventListener('click', function () {
      popover.style.display = 'none';
    });
    controls.appendChild(closeButton);

    popover.id = 'defineit-popover';
    popover.appendChild(controls);
    popover.appendChild(headerElem);
    popover.appendChild(contentElem);
    popover.header = headerElem;
    popover.content = contentElem;
    document.body.appendChild(popover);

    popover.showResult = function (result) {
      this.header.innerText = result.term;

      const content = this.content;
      while (content.firstChild)
        content.firstChild.remove();

      if (result.phonetic) {
        const phonetic = document.createElement('span');
        phonetic.innerText = result.phonetic;
        content.appendChild(phonetic);
      }
      if (result.pronunciation) {
        const pronunciation = document.createElement('audio');
        pronunciation.src = result.pronunciation;
        const playAudio = document.createElement('input');
        playAudio.type = 'image';
        playAudio.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAABBUlEQVQokZ3SsUoDURAF0LNLkLAsFiIWIaSw2sJSrCwsLFP4ARYWVuIvWOUDRCz8BAu/QyysgojRQhtRSCOICGnybGZxE63ypnjM5d6ZeXNfliSLnFYzyWQ5KqyjwDeeMUrSdEaZItDBAEO84yPuYeCd5DdqURc3eMARejFND8d4xDW6jUYKnEflbeQzlcmxgzucol0Lt/CCg6ZgPnAYvM1a2MekHgNraDW6rTaeM0E/SXLU2yoy2T4uggQlzgIvA5vWdozxisuw4g3thl0b2MNT8Mb1KCOc4CsW9d8p8Bm8EWZ8rHCFe1SBreA28OqPjw1xiV0sR74UVpTzW84W/av5Qir8AF9LfL+SwydpAAAAAElFTkSuQmCC';
        playAudio.classList.add('pronunciation');
        playAudio.addEventListener('click', function () {
          pronunciation.play();
        });
        content.appendChild(playAudio);
        content.appendChild(pronunciation);
      }

      const items = document.createElement('ol');
      items.classList.add('items');
      result.items.forEach(function (item) {
        const pos = document.createElement('span');
        pos.innerText = item.pos;

        const definitions = document.createElement('ol');
        definitions.classList.add('definitions');
        item.definitions.forEach(function (definition) {
          const li = document.createElement('li');
          li.innerText = definition;
          definitions.appendChild(li);
        });

        const li = document.createElement('li');
        li.appendChild(pos);
        li.appendChild(definitions);

        items.appendChild(li);
      });
      content.appendChild(items);
      const p = document.createElement('p');
      let sourceElem;
      if (result.source.href) {
        sourceElem = document.createElement('a');
        sourceElem.href = result.source.href;
        sourceElem.target = '_blank';
      } else {
        sourceElem = document.createElement('span');
      }
      sourceElem.innerText = result.source.name;
      p.innerText = "Definitions from ";
      p.appendChild(sourceElem);
      content.appendChild(p);
    }
    return popover;
  })();

  function defineIt () {
    let text, rect;

    /*
    const elem = document.activeElement;
    if (elem) {
      const tagName = elem.tagName.toLowerCase();
      if (tagName == 'textarea' ||
        (tagName == 'input' && ['text', 'search'].includes(elem.type))) {
        text = elem.value.substring(elem.selectionStart, elem.selectionEnd);
        rect = elem.getBoundingClientRect();
      }
    }
    */

    if (!text) {
      const selection = window.getSelection();
      text = selection.toString();
      rect = selection.getRangeAt(0).getBoundingClientRect();
    }

    if (!text) return;

    popover.header.innerText = text;
    popover.content.innerText = "Loading definitions ...";
    Object.assign(popover.style, {
      'display': 'block',
      'left': (window.scrollX + rect.left) + 'px',
      'top': (window.scrollY + rect.bottom) + 'px',
    });

    browser.runtime.sendMessage({'text': text}).then(function (results) {
      popover.showResult(results);
    }, function (error) {
      popover.content.innerText = error.message;
    }).finally(function () {
      const width = popover.offsetWidth;
      popover.style.left = '0';
      if (popover.offsetWidth > width)
        popover.style.left = (window.scrollX + document.documentElement.clientWidth - popover.offsetWidth - 5) + 'px';
      else
        popover.style.left = (window.scrollX + rect.left) + 'px';
    });
  }

  document.addEventListener('click', function (evt) {
    if (!evt.ctrlKey && !popover.contains(evt.target))
      popover.style.display = 'none';
  });
  document.addEventListener('mouseup', function (evt) {
    if (evt.ctrlKey) defineIt();
  });
  document.addEventListener('dblclick', defineIt);
};
