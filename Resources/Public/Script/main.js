window.__enable_content_cache_debug__ = (setCookie = false) => {
  if (window.__enable_content_cache_debug__.active) {
    return;
  }

  if (setCookie) {
    document.cookie = '__content_cache_debug__=true';
  }

  console.log('%c <Neos Content Cache Debug Tool> ', 'color: white; background: #00ADEE; line-height: 20px; font-weight: bold');

  window.__enable_content_cache_debug__.active = true;

  const PREFIX = '__CONTENT_CACHE_DEBUG__';
  const mouseOffset = 5;

  const treeWalker = document.createTreeWalker(
    document.getRootNode(),
    NodeFilter.SHOW_COMMENT,
    node => node.nodeValue.indexOf(PREFIX) === 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP,
    false
  );

  const nodes = [];
  while (treeWalker.nextNode()) {
    nodes.push(treeWalker.currentNode);
  }

  const infoElements = [];
  const createInfoElement = ({ parentNode, cacheInfo, index }) => {

    const container = document.createElement('div');
    container.classList.add('content-cache-debug-container');

    const button = document.createElement('button');
    button.innerText = '💡';
    container.appendChild(button);

    const overlay = document.createElement('div');
    overlay.classList.add(cacheInfo.mode);
    container.appendChild(overlay);

    const table = document.createElement('table');
    table.classList.add('content-cache-debug-table');

    const clone = parentNode.cloneNode();
    clone.innerHTML = '';
    cacheInfo['markup'] = clone.outerHTML.replace(/<\/.+/, '').replace(/</g, '&lt;').replace(/>/g, '&gt;').substring(0, 50);

    Object.keys(cacheInfo).forEach(key => {
      const tr = document.createElement('tr');
      const th = document.createElement('th');
      const td = document.createElement('td');

      th.innerText = key;
      tr.classList.add(key.toLowerCase());

      let value = cacheInfo[key];

      if (value === null) {
        return;
      }

      let arrayValue;
      if (Array.isArray(value)) {
        arrayValue = value.map((v, i) => `<i>${i}:</i> ${v}`);
      } else if (typeof value === 'object') {
          arrayValue = Object.keys(value).map(subKey => `<i>${subKey}:</i> ${value[subKey]}`);
      }

      if (arrayValue) {
        if (arrayValue.length > 10) {
          arrayValue = arrayValue.slice(0, 5).concat(['....']).concat(arrayValue.slice(arrayValue.length - 5));
        }
        td.innerHTML = arrayValue.join('<br>');
      } else {
        td.innerHTML = value;
      }

      tr.appendChild(th);
      tr.appendChild(td);
      table.appendChild(tr);
    });

    let left = 0;
    let top = 0;

    const positionTable = event => {
      let x = event.pageX - left + mouseOffset;
      let y = event.pageY - top + mouseOffset;

      const rightEdge = x + table.offsetWidth + left - window.scrollX;
      if (rightEdge > window.innerWidth) {
        x -= rightEdge - window.innerWidth;
      }

      const bottomEdge = y + table.offsetHeight + top - window.scrollY;
      if (bottomEdge > window.innerHeight) {
        y -= bottomEdge - window.innerHeight;
      }

      table.setAttribute('style', `left: ${x}px; top: ${y}px`);
    }

    button.addEventListener('click', () => {
      container.classList.add('removed');
    });

    button.addEventListener('mouseenter', event => {
      button.innerText = '❌';
      container.appendChild(table);
      positionTable(event);
    });

    button.addEventListener('mousemove', positionTable);

    button.addEventListener('mouseleave', () => {
      container.removeChild(table);
      button.innerText = '💡';
    });

    infoElements.push({
      container,
      cacheInfo,
      table,
      show: () => {
        let { x, y, width, height } = parentNode.getBoundingClientRect();

        x += window.scrollX;
        y += window.scrollY;

        if (y < 0) {
          height += y;
          y = 0;
        }

        left = x;
        top = y;
        document.body.prepend(container);
        container.setAttribute('style', `width: ${width}px; height: ${height}px; left: ${x}px; top: ${y}px`);
      },
      hide: () => {
        table.remove();
        container.remove();
      }
    });
  };

  nodes.forEach((node, index) => {
    const cacheInfo = JSON.parse(node.nodeValue.substring(PREFIX.length));
    const parentNode = node.previousElementSibling;
    createInfoElement({ parentNode, cacheInfo, index });
  });

  infoElements.sort((a, b) => {
    const fa = a.cacheInfo.fusionPath;
    const fb = b.cacheInfo.fusionPath;

    if (fa < fb) return -1;
    if (fa > fb) return 1;
    return 0;
  });

  const cacheTable = (() => {
    const container = document.createElement('div');
    container.classList.add('content-cache-debug-list');

    infoElements.forEach(({ cacheInfo, table }) => {

      const positionTable = event => {
        let x = event.pageX + mouseOffset - window.scrollX + container.scrollLeft;
        let y = event.pageY + mouseOffset - window.scrollY + container.scrollTop;

        const rightEdge = x + table.offsetWidth - container.scrollLeft;
        if (rightEdge > window.innerWidth) {
          x -= rightEdge - window.innerWidth;
        }

        const bottomEdge = y + table.offsetHeight - container.scrollTop;
        if (bottomEdge > window.innerHeight && table.offsetHeight < window.innerHeight) {
          y -= bottomEdge - window.innerHeight;
        }

        table.setAttribute('style', `left: ${x}px; top: ${y}px`);
      };

      const div = document.createElement('div');
      div.classList.add(cacheInfo.mode);
      div.innerHTML = cacheInfo.fusionPath.replace(/\//g, '<i>/</i>').replace(/<([^>\/]{2,})>/g, '<span>&lt;$1&gt;</span>');

      div.addEventListener('mouseenter', event => {
        container.appendChild(table);
        positionTable(event);
      });

      div.addEventListener('mousemove', positionTable);

      div.addEventListener('mouseleave', () => {
          table.remove();
      });

      container.appendChild(div);

    });

    return {
      show: () => document.body.appendChild(container),
      hide: () => container.remove()
    }
  })();

  let infoVisible = false;
  let listVisible = false;

  const shelf = document.createElement('div');
  shelf.classList.add('content-cache-debug-shelf');

  const infoButton = document.createElement('button');
  infoButton.innerText = '🔦';

  let reposition = null;
  const onScroll = () => {
    console.log('now');
    if (reposition === null) {
        infoElements.forEach(e => e.hide());
    }
    clearTimeout(reposition);
    reposition = setTimeout(() => {
      infoElements.forEach(e => e.show());
      reposition = null;
    }, 200);
  };

  infoButton.addEventListener('click', () => {
    if (infoVisible) {
      infoElements.forEach(e => e.hide());
      window.removeEventListener('scroll', onScroll);
    } else {
      infoElements.forEach(e => e.show());
      window.addEventListener('scroll', onScroll);
    }
    infoVisible = !infoVisible;
  });

  shelf.appendChild(infoButton);

  const listButton = document.createElement('button');
  listButton.innerText = '📋';
  listButton.addEventListener('click', () => {
    if (listVisible) {
        cacheTable.hide();
    } else {
        cacheTable.show();
    }
    listVisible = !listVisible;
  });

  shelf.appendChild(listButton);

  const closeButton = document.createElement('button');
  closeButton.innerText = '❌';

  closeButton.addEventListener('click', () => {
    shelf.remove();
    infoVisible && infoElements.forEach(e => e.hide());
    listVisible && cacheTable.hide();
    window.__enable_content_cache_debug__.active = false;
    document.cookie = "__content_cache_debug__=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    console.log('%c </Neos Content Cache Debug Tool> ', 'color: white; background: #00ADEE; line-height: 20px; font-weight: bold');
  });

  shelf.appendChild(closeButton);

  document.body.appendChild(shelf);
};

(() => {
  const cookies = document.cookie.split(';').map(v => v.trim()).reduce((c, s) => {
    const p = s.split('=');
    c[p[0]] = p[1];
    return c;
  }, {});

  if (cookies.__content_cache_debug__ === "true") {
    window.onload = window.__enable_content_cache_debug__
  }
})();
