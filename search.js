let pages = null;
async function getPageData() {
  if (pages) return pages;
  let jsondata = await import("./pages.json", { with: { type: "json" } });
  pages = jsondata.default;
  console.log("fetched page data:", pages);
  return pages;
}

/**
 * @param {string} term
 * @param {Array<{}>} data
 */
function searchFor(term, data) {
  if (!term) return [];
  term = "" + term;
  term = term.toLowerCase();
  let matches = [];
  for (let page of data) {
    for (let key of Object.keys(page)) {
      if (key === "url") continue;
      /** @type {string | number | Array} */
      let value = page[key];
      if (typeof value === "string" && value.toLowerCase().includes(term)) {
        let match = {
          page: page,
          term: term,
          foundIn: key,
          full: term == value.toLowerCase(),
        };
        matches.push(match);
      }
      arrcheck: if (value instanceof Array) {
        if (value.includes(term)) {
          let match = { page: page, term: term, foundIn: key, full: true };
          matches.push(match);
          break arrcheck;
        }
        for (let element of value) {
          if (
            typeof element === "string" &&
            element.toLowerCase().includes(term)
          ) {
            let match = {
              page: page,
              term: term,
              foundIn: key,
              full: term == element.toLowerCase(),
            };
            matches.push(match);
            break arrcheck;
          }
        }
      }
    }
  }
  let found = [];
  let pages = [];
  matches.forEach((el) => {
    if (!found.includes(el.page)) {
      found.push(el.page);
      pages.push(el);
    }
  });
  return pages;
}
