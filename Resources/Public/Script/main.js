window.__enable_neos_debug__ = (setCookie = false) => {
  if (window.__enable_neos_debug__.active) {
    return;
  }

  if (setCookie) {
    document.cookie = '__neos_debug__=true;path=/';
  }

  console.log('%c Starting Neos Debug Tool ... ', 'color: white; background: #f9423a; line-height: 20px; font-weight: bold');
  if (!setCookie) {
    console.log('Start the Debug tool with "__enable_neos_debug__(true)" to start up the Debug tool on every page load');
  }
  console.log('If you have any issues or feature requests checkout the repository at https://github.com/t3n/neos-debug');

  window.__enable_neos_debug__.active = true;

  const PREFIX = '__T3N_CONTENT_CACHE_DEBUG__';
  const DEBUG_PREFIX = '__T3N_NEOS_DEBUG__';
  const mouseOffset = 10;

  // parse content cache comments
  const cCacheTreeWalker = document.createTreeWalker(document.getRootNode(), NodeFilter.SHOW_COMMENT, node => (node.nodeValue.indexOf(PREFIX) === 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP), false);
  const cCacheNodes = [];
  while (cCacheTreeWalker.nextNode()) {
    cCacheNodes.push(cCacheTreeWalker.currentNode);
  }

  // parse debug values
  const debugValuesWalker = document.createTreeWalker(document.getRootNode(), NodeFilter.SHOW_COMMENT, node => (node.nodeValue.indexOf(DEBUG_PREFIX) === 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP), false);
  const dataNode = debugValuesWalker.nextNode();
  let debugInfos = {};
  if (dataNode) {
    debugInfos = JSON.parse(dataNode.nodeValue.substring(DEBUG_PREFIX.length));
  }
  debugInfos.cCacheUncached = 0;

  // Takes an ISO time and returns a string representing how
  // long ago the date represents.
  function prettyDate(time) {
    var date = new Date((time || "").replace(/-/g, "/").replace(/[TZ]/g, " ")),
      diff = (((new Date()).getTime() - date.getTime()) / 1000),
      day_diff = Math.floor(diff / 86400);

    if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31) return;

    return day_diff === 0 && (
      diff < 60 && "just now" || diff < 120 && "1 minute ago" || diff < 3600 && Math.floor(diff / 60) + " minutes ago" || diff < 7200 && "1 hour ago" || diff < 86400 && Math.floor(diff / 3600) + " hours ago") || day_diff === 1 && "Yesterday" || day_diff < 7 && day_diff + " days ago" || day_diff < 31 && Math.ceil(day_diff / 7) + " weeks ago";
  }

  const infoElements = [];
  const createInfoElement = ({ parentNode, cacheInfo, index }) => {
    if (cacheInfo.mode === 'uncached') {
        debugInfos.cCacheUncached++;
    }

    const container = document.createElement('div');
    container.classList.add('t3n__content-cache-debug-container');

    const button = document.createElement('button');
    button.innerText = '🔎';
    container.appendChild(button);

    const overlay = document.createElement('div');
    overlay.classList.add(cacheInfo.mode);
    container.appendChild(overlay);

    const table = document.createElement('table');
    table.classList.add('t3n__content-cache-debug-table');

    const clone = parentNode.cloneNode();
    clone.innerHTML = '';
    cacheInfo['created'] = new Date(cacheInfo['created']).toLocaleString() + (cacheInfo['mode'] !== 'uncached' ? ' - ' + prettyDate(cacheInfo['created']) : '');
    cacheInfo['markup'] =
      clone.outerHTML
        .replace(/<\/.+/, '')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .substring(0, 150) + ' ...';

    Object.keys(cacheInfo).forEach(key => {
      const tr = document.createElement('tr');
      const firstCell = document.createElement('td');
      const secondCell = document.createElement('td');

      firstCell.innerText = key;
      secondCell.classList.add(key.toLowerCase());

      let value = cacheInfo[key];

      if (value === null) {
        return;
      }

      let arrayValue;
      if (Array.isArray(value)) {
        arrayValue = value.map((v, i) => `<i>${i}:</i> <span>${v}</span>`);
      } else if (typeof value === 'object') {
        arrayValue = Object.keys(value).map(subKey => `<i>${subKey}:</i> <span>${value[subKey]}</span>`);
      }

      if (arrayValue) {
        secondCell.classList.add('object-values');
        if (arrayValue.length > 10) {
          arrayValue = arrayValue
            .slice(0, 5)
            .concat(['....'])
            .concat(arrayValue.slice(arrayValue.length - 5));
        }
        secondCell.innerHTML = arrayValue.join('');
      } else {
        secondCell.innerHTML = value;
      }

      tr.appendChild(firstCell);
      tr.appendChild(secondCell);
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
    };

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
      button.innerText = '🔎';
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

  // convert all content cache parts to info elements
  cCacheNodes.forEach((node, index) => {
    const cacheInfo = JSON.parse(node.nodeValue.substring(PREFIX.length));
    const parentNode = node.previousElementSibling;

    if (parentNode) {
      // build up
      createInfoElement({ parentNode, cacheInfo, index });
    }
  });

  // sort info elements by fusion path
  infoElements.sort((a, b) => {
    const fa = a.cacheInfo.fusionPath;
    const fb = b.cacheInfo.fusionPath;

    if (fa < fb) return -1;
    if (fa > fb) return 1;
    return 0;
  });

  const sqlTable = (() => {
    const container = document.createElement('div');
    container.classList.add('t3n__content-cache-debug-modal');

    const sqlLegend = document.createElement('div');
    sqlLegend.innerHTML = `<h3>SQL Information</h3><div class="debug-meta"><p>Queries: ${debugInfos.sqlData.queryCount} with ${debugInfos.sqlData.executionTime} ms execution time</p><div>`;
    container.appendChild(sqlLegend);

    const infoTable = document.createElement('table');
    infoTable.classList.add('t3n__debug-info-table');

    const headRow = document.createElement('tr');
    headRow.innerHTML = '<th>Table name</th><th>Execution count</th><th>Total execution time</th>';
    infoTable.appendChild(headRow);

    Object.keys(debugInfos.sqlData.tables).map(table => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${table}</td><td>${debugInfos.sqlData.tables[table].queryCount}</td><td>${Number(debugInfos.sqlData.tables[table].executionTime).toFixed(2)} ms</td>`;
      infoTable.appendChild(row);
    });
    container.appendChild(infoTable);

    slowQueryLegend = document.createElement('div');
    slowQueryLegend.classList.add('debug-meta');
    slowQueryLegend.innerHTML = `<h4>Slow Queries: ${debugInfos.sqlData.slowQueries.length}</h4>`;
    container.appendChild(slowQueryLegend);

    slowQueryTable = document.createElement('table');
    slowQueryTable.classList.add('t3n__debug-info-table');

    const slowQueryHeadRow = document.createElement('tr');
    slowQueryHeadRow.innerHTML = '<th>Table</th><th>Execution time</th><th>SQL</th><th></th>';
    slowQueryTable.appendChild(slowQueryHeadRow);

    debugInfos.sqlData.slowQueries.forEach(({ executionMS, params, sql, table }) => {
      const queryRow = document.createElement('tr');
      queryRow.classList.add('detail-row');

      const detailCell = document.createElement('td');
      detailCell.innerHTML = `<p class="small">${sql}</p> <strong>Params:</strong><br/>${params.map(param => '<span class="tag">' + param + '</span>')}`;
      detailCell.setAttribute('colspan', 4);

      queryRow.appendChild(detailCell);

      const row = document.createElement('tr');
      row.innerHTML = `<td>${table}</td><td>${Number(executionMS).toFixed(2)} ms</td><td>${sql.substring(0, 50)}...</td>`;

      const actionCell = document.createElement('td');
      const toggleSqlQuery = document.createElement('button');
      toggleSqlQuery.innerText = 'Show full query';
      toggleSqlQuery.addEventListener('click', () => {
        queryRow.classList.toggle('-show');
        toggleSqlQuery.classList.toggle('-active');
      });
      actionCell.appendChild(toggleSqlQuery);
      row.appendChild(actionCell);
      slowQueryTable.appendChild(row);
      slowQueryTable.appendChild(queryRow);
    });
    container.appendChild(slowQueryTable);

    return {
      show: () => document.body.appendChild(container),
      hide: () => container.remove()
    };
  })();

  // build up cache table for cache module
  const cacheTable = (() => {
    const container = document.createElement('div');
    container.classList.add('t3n__content-cache-debug-modal');

    const cacheLegend = document.createElement('div');
    cacheLegend.innerHTML = `<h3>Cache Information</h3><div class="debug-meta"><div><p>Hits: ${debugInfos.cCacheHits}</p></div><div><p>Misses: ${debugInfos.cCacheMisses.length}</p></div><div><p>Uncached: ${debugInfos.cCacheUncached}</p></div></div>`;
    container.appendChild(cacheLegend);

    const infoTable = document.createElement('table');
    infoTable.classList.add('t3n__debug-info-table');

    const headRow = document.createElement('tr');
    headRow.innerHTML = '<th>Mode</th><th>Cache hit</th><th>Fusion path</th><th>';
    infoTable.appendChild(headRow);

    infoElements.forEach(({ cacheInfo, table, show }) => {
      const detailRow = document.createElement('tr');
      detailRow.classList.add('detail-row');

      const detailCell = document.createElement('td');
      detailCell.setAttribute('colspan', 4);

      // we clone the node so the inspect button won't trigger the remove on this table
      detailCell.appendChild(table.cloneNode(true));
      detailRow.appendChild(detailCell);
      detailRow.appendChild(document.createElement('td'));

      const row = document.createElement('tr');
      const fusionPath = cacheInfo.fusionPath.replace(/\//g, '<i>/</i>').replace(/<([^>\/]{2,})>/g, '<span class="fusion-prototype"><span>$1</span></span>');
      const cacheHit = !debugInfos.cCacheMisses.includes(cacheInfo.fusionPath) && cacheInfo.mode !== 'uncached';

      row.innerHTML = `<td class="${cacheInfo.mode}">${cacheInfo.mode}</td>`;
      row.innerHTML += `<td class="${cacheHit ? 'cached' : 'uncached'}">${cacheHit ? 'yes' : 'no'}</td>`;
      row.innerHTML += `<td>${fusionPath}</td>`;

      const actions = document.createElement('td');
      const togglePrototype = document.createElement('button');
      togglePrototype.innerText = 'Show/Hide prototype';

      togglePrototype.addEventListener('click', () => {
        row.classList.toggle('-show-prototype');
        togglePrototype.classList.toggle('-active');
      });

      actions.appendChild(togglePrototype);

      const toggleCacheInfos = document.createElement('button');
      toggleCacheInfos.innerText = 'Details';
      toggleCacheInfos.addEventListener('click', () => {
        detailRow.classList.toggle('-show');
        toggleCacheInfos.classList.toggle('-active');
      });
      actions.appendChild(toggleCacheInfos);

      row.appendChild(actions);
      infoTable.appendChild(row);
      infoTable.appendChild(detailRow);
    });

    container.appendChild(infoTable);

    return {
      show: () => document.body.appendChild(container),
      hide: () => container.remove()
    };
  })();

  let infoVisible = false;
  let listVisible = false;
  let sqlInfosVisible = false;

  const shelf = document.createElement('div');
  shelf.classList.add('t3n__content-cache-debug-shelf');

  if (debugInfos.renderTime) {
    const parseTime = document.createElement('div');
    parseTime.innerText = debugInfos.renderTime + ' ms render time';

    shelf.appendChild(parseTime);
  }

  const infoButton = document.createElement('span');
  infoButton.innerText = '🔦 Inspect';

  let reposition = null;
  const onScroll = () => {
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
    infoButton.classList.toggle('-active');
    infoVisible = !infoVisible;
  });

  shelf.appendChild(infoButton);

  if (debugInfos.sqlData) {
    const sql = document.createElement('span');
    sql.innerText = `🗄 SQL (${debugInfos.sqlData.queryCount} queries, ${debugInfos.sqlData.slowQueries.length} are slow)`;
    sql.addEventListener('click', () => {
      if (sqlInfosVisible) {
        sqlTable.hide();
      } else {
        sqlTable.show();
      }
      sql.classList.toggle('-active');
      sqlInfosVisible = !sqlInfosVisible;
    });
    shelf.appendChild(sql);
  }

  const listButton = document.createElement('span');
  if (debugInfos.cCacheHits || debugInfos.cCacheMisses) {
    listButton.innerText = `⚡️ Cache (hits: ${debugInfos.cCacheHits}, misses: ${debugInfos.cCacheMisses.length}, uncached ${debugInfos.cCacheUncached})`;
  } else {
    listButton.innerText = '️⚡️Cache';
  }
  listButton.addEventListener('click', () => {
    if (listVisible) {
      cacheTable.hide();
    } else {
      cacheTable.show();
    }
    listButton.classList.toggle('-active');
    listVisible = !listVisible;
  });

  shelf.appendChild(listButton);

  const closeButton = document.createElement('span');
  closeButton.innerText = '🚫 Close';

  closeButton.addEventListener('click', () => {
    shelf.remove();
    infoVisible && infoElements.forEach(e => e.hide());
    listVisible && cacheTable.hide();
    window.__enable_neos_debug__.active = false;
    document.cookie = '__neos_debug__=; expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
    console.log('%c Closing Neos Debug Tool> ', 'color: white; background: #f9423a; line-height: 20px; font-weight: bold');
  });

  shelf.appendChild(closeButton);

  document.body.appendChild(shelf);
};

(() => {
  const cookies = document.cookie
    .split(';')
    .map(v => v.trim())
    .forEach(c => {
      const p = c.split('=');
      if (p[0] === '__neos_debug__' && p[1] === 'true') {
        window.addEventListener('load', __enable_neos_debug__);
      }
    });
})();
