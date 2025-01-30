addEventListener("DOMContentLoaded", start);
function start() {
  let url = window.location.href;
  document.getElementById("results").innerHTML = "";
  let search = window.location.search;
  let sp = new URLSearchParams(search);
  let json = JSON.parse(decodeURIComponent(sp.get("result")));
  let term = decodeURIComponent(sp.get("query"));
  let source = decodeURIComponent(sp.get("source"));
  for (let result of json) {
    let div = createContainerForResult(result);
    let a = createLinkForResult(result);
    a.appendChild(div);
    a.appendChild(
      htmlToNode(
        `<p class="search-info">From ${result.foundIn} (${result.page[
          result.foundIn
        ]
          .toString()
          .replaceAll(
            new RegExp(term, "gi"),
            (x) => "<span class='found'>" + x + "</span>"
          )})</p>`
      )
    );
    document.getElementById("results").appendChild(a);
  }
  if (json.length === 0) {
    let result = { page: { title: "No Results", url: "./no-info.html" } };
    let div = createContainerForResult(result);
    let a = createLinkForResult(result);
    a.appendChild(div);
    a.appendChild(
      htmlToNode(
        `<p class="search-info no-results">Search '${term}' had no matches</p>`
      )
    );
    document.getElementById("results").appendChild(a);
  }
  document.getElementById("query").innerText =
    "Page search for: '" + term + "'";
  document.getElementById("return").href = source;
}

function createLinkForResult(result) {
  let a = document.createElement("a");
  a.href = "./home.html?goto="+encodeURIComponent(result.page.name); //result.page.url
  a.classList.add("nav", "item", "search");
  return a;
}

function createContainerForResult(result) {
  let div = document.createElement("div");
  div.classList.add("search-result");
  div.appendChild(htmlToNode('<span class="search-line-small"></span>'));
  div.appendChild(
    htmlToNode(`<span class="search-title">${result.page.title}</span>`)
  );
  div.appendChild(htmlToNode('<span class="search-line"></span>'));
  return div;
}
