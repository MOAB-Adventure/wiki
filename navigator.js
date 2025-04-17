/** Maps origin to path from it to the wiki's index. THe default is the origin.*/
const roots = {
  "https://moab-adventure.github.io": "/wiki/",
};
//Main page version
function goto(page) {
  msg("goto request: '" + page + "'");
  let search = new URLSearchParams(location.search);
  search.has("page") ? search.set("page", page) : search.append("page", page);
  if (page === "home")
    location = location.origin + (roots[location.origin] ?? "");
  else location.search = search;
  msg("Page url is " + location.href);
  loadSelectedPage();
}
async function onWeaponLoad() {
  msg("Main page ready.");
  loadSelectedPage();
}
function loadSelectedPage() {
  if (location.search.length > 0) {
    let destination =
      new URLSearchParams(location.search).get("page") ?? "error404";
    msg("Moving iframe to '" + destination + "'");
    loadIntoMainIframe(destination, document);
  } else {
    loadIntoMainIframe("home");
  }
}
