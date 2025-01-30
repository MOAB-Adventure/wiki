addEventListener("DOMContentLoaded", loadingMsg);
function onWeaponLoad(){
  loadSearch()
}
function loadSearch() {
  if (location.search.length > 0) {
    let destination =
      new URLSearchParams(location.search).get("goto") ?? "error404";
    console.log("going to " + destination);
    load(destination, document);
  }
}
function loadingMsg(){
  if (location.search.length > 0) {
    document.body.innerHTML = `
    <header><p><i></i><p>Loading...</p></p><search-bar></search-bar></header>
  <main></main>`
  }
}
