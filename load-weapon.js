addEventListener("DOMContentLoaded", start)
function start() {

  let url = window.location.href
  let search = window.location.search
  let sp = new URLSearchParams(search)
  let json = decodeURIComponent(sp.get("weapon"))
  let source = decodeURIComponent(sp.get("source"))
  importJSON(json)
  document.getElementById("return").href = source
}

function createLinkForResult(result){
  let a = document.createElement("a")
  a.href = result.page.url
  a.classList.add("nav", "item", "search")
  return a
}

function createContainerForResult(result){
  let div = document.createElement("div")
  div.classList.add("search-result")
  div.appendChild(htmlToNode('<span class="search-line-small"></span>'))
  div.appendChild(htmlToNode(`<span class="search-title">${result.page.title}</span>`))
  div.appendChild(htmlToNode('<span class="search-line"></span>'))
  return div
}