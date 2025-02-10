//Search version of navigator.js
//Used in the search page
function onWeaponLoad(){
  msg("Iframe ready.")
  loadSelectedPage()
}
function loadSelectedPage() {
  if (location.search.length > 0) {
    let destination =
      new URLSearchParams(location.search).get("goto") ?? "error404";
    msg("going to " + destination);
    moveTo(destination);
  }
}
function moveTo(page){
  try{window.top.goto(page)}
  catch(e){
    console.error("Could not change pages.")
  }
}