let testJSON = {};
let loaded = false;
let weapons = {};
let blimps = {};
let zones = {};
let entities = {};
let others = {};
let components = {};
const creator = {
  weapon: createWeaponPage,
  blimp: createBlimpPage,
  entity: createEntityPage,
  zone: createZonePage,
  other: createArbitraryPage,
};
const error404 = `
  <header><p><i></i><p>Error 404</p></p><search-bar></search-bar></header>
  <main>
    <div class="desc">
      <h1>Oh No!</h1>
      <p><b>Something's gone wrong.</b></p>
      <p>The page you are looking for <b>does not exist</b>. If you think this is an error, notify the creator on the <a target="_blank" href="https://github.com/MOAB-Adventure/wiki/issues/new?template=Blank+issue">GitHub Issues page</a>.</p>
    </div>
  </main>`;

importAll().then((x) => start(x));

function start() {
  console.log("Content lists loaded.");
  loaded = true;
  try {
    onWeaponLoad();
  } catch (e) {}
}

const bracketRegex =
  /\[\s*([^\[\]]*(?:\[[^\[\]]*(?:\[[^\[\]]*\][^\[\]]*)*\][^\[\]]*)*)\]/gi;
/**Formats some text.
 * Valid replacement codes:
 * - [i/abc] -> *abc* (italic)
 * - [b/abc] -> **abc** (bold)
 * - [u/abc] -> <ins>abc</ins> (underline)
 * - [s/abc] -> ~~abc~~ (strikethrough)
 * - [->abc] -> ('hyperlink' to page abc)
 * @param {string} text Unformatted text, containing replacement codes.
 * @param {boolean} [quotable=false] If true, blockquotes [q/ ... -- ...] can be used here.
 * @returns {string} Formatted text.
 */
function process(text, quotable = false) {
  if (!text) return "";
  text = makeSafe(text).replaceAll(bracketRegex, (code) => {
    code = code.substring(1, code.length - 1);
    //[u/ ... ] underlined text
    if (code.startsWith("u/")) return `<u>${process(code.substring(2))}</u>`;

    //[i/ ... ] italic text
    if (code.startsWith("i/")) return `<i>${process(code.substring(2))}</i>`;

    //[b/ ... ] bold text
    if (code.startsWith("b/")) return `<b>${process(code.substring(2))}</b>`;

    //[s/ ... ] struck through text
    if (code.startsWith("s/")) return `<s>${process(code.substring(2))}</s>`;

    //[-> ... ] / [-> ... as ... ] link / aliased link
    if (code.startsWith("-&gt;")) {
      let linkParts = code.substring(5).split(" as ");
      let display = linkParts[1]
        ? process(linkParts[1])
        : convertToPageTitle(linkParts[0]);
      return `<a onclick="load('${linkParts[0]}')" href="#${linkParts[0]}">${display}</a>`;
    }

    //[br] line break
    if (code === "br") return "<br>";

    //[c: ... / ... ] coloured text
    if (code.startsWith("c:")) {
      let colparts = code.substring(2).split("/");
      return `<span style="color:${colparts[0]}">${process(
        colparts.slice(1).join("/")
      )}</span>`;
    }

    //[. ... / ... ] classed span
    if (code.startsWith(".")) {
      let classParts = code.substring(1).split("/");
      return `<span class="${classParts[0].replaceAll(".", " ")}">${process(
        classParts.slice(1).join("/")
      )}</span>`;
    }

    //[img/ ... ] icon
    if (code.startsWith("img/")) {
      return `<i-n icon="${code.substring(4).toLowerCase()}"></i-n>`;
    }

    //[\\ ... ] square brackets
    if (code.startsWith("\\")) {
      return "[" + code.substring(1) + "]";
    }

    //[q/ ... ] blockquote
    if (quotable && code.startsWith("q/")) {
      let quotParts = code.substring(2).split(" -- ");
      return blockquote(quotParts[0], quotParts[1]);
    }

    //[{ ... }] component
    if (code.startsWith("{") && code.endsWith("}")) {
      let comp = code.substring(1, code.length - 1);
      let parts = comp.split(":");
      let component = getComponent(...parts)
      return process(component);
    }
    return code;
  });
  return text;
}

/**
 * Gets a component from a name, and replaces placeholders. **Does not process!**
 * @param {string} componentName Name of the compoennt, as defined in `components.def`.
 * @param  {...string} placeholders String values to replace placeholders with.
 * @returns Unprocessed string representation of the component's replaced form. `<?>` if component did not exist.
 */
function getComponent(componentName, ...placeholders) {
  if (Object.keys(components).includes(componentName)) {
    /** @type {string} */
    let component = components[componentName];
    return component
      .replaceAll(/(?<!\\)\{[0-9]+\}/gi, (match) => {
        //get placeholder number
        let num = match.substring(1, match.length - 1);
        return placeholders[parseInt(num) - 1] ?? "<?>";
      })
      .replaceAll(/\\(?=\{[0-9]+\})/gi);
  }
  return "<?>";
}

function secondaryProcess(text) {
  return text.match(bracketRegex) ? process(text) : text;
}
/**
 * @param {string} text
 */
function makeSafe(text) {
  if (!text) return "";
  return text
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function createHistoryList(string) {
  let array = string
    .split(" + ")
    .map((x) => x.split(": ").map((y) => y.split(", ")));
  return array.map(
    (historyItem) => `
            <li>
              <b><i>${historyItem[0]}</i></b>
              <ul>
                ${historyItem[1]
                  .map((x) => `<li>${process(x)}</li>`)
                  .join("\n")}
              </ul>
            </li>`
  );
}

function changePageContentJSON(
  json,
  doc = document,
  creatorfn = creator.weapon
) {
  changePageContent(...creatorfn(json), doc, creatorfn);
}

function changePageContent(
  page,
  infobox,
  doc = document,
  creatorfn = creator.weapon
) {
  doc.body.innerHTML = page;
  if (!infobox) return;
  infobox = infobox.trim();
  if (infobox.length === 0) return;
  let ib = doc.createElement(
    creatorfn === creator.weapon ? "weapon-info" : "info-box"
  );
  doc.querySelector("main").appendChild(ib);
  ib.textContent = infobox;
}
/**
 * @param {string} name kebab-case text.
 * @returns Processed Title Case text.
 */
function convertToPageTitle(name) {
  return process(
    name
      .split("-")
      .map((x) => x.at(0).toUpperCase() + x.substring(1))
      .join(" ")
  );
}
/**
 * @param {string} camelCase camelCase or PascalCase text.
 * @returns Processed Title Case text.
 */
function convertToSectionHeader(camelCase) {
  return process(
    camelCase
      .split(/(?=[A-Z])/)
      .map((x) => x.at(0).toUpperCase() + x.substring(1))
      .join(" ")
  );
}

function load(name, doc = document) {
  if (loaded) {
    //what kind of page is this name?
    let decision = decideWhatTheF_ckThisIs(name);
    console.log(decision);
    //If the source isn't empty
    if (Object.keys(decision.source).length > 0)
      changePageContentJSON(decision.source[name], doc, decision.func);
    else changePageContent(error404, null, doc);
  } else {
    console.warn("Could not load weapon page, JSON not loaded.");
  }
}

function loadIntoMainIframe(name) {
  /** @type {HTMLIFrameElement} */
  let iframe = document.getElementById("preview");
  load(name, iframe.contentDocument);
}
/**
 * @param {URL | string} url
 * @returns
 */
async function importer(url) {
  let result = await (await fetch(url)).text();
  let weapons = result.replaceAll("\r\n", "").split("==").slice(1);
  let obj = {};
  for (let weapondef of weapons) {
    let weapon = {};
    let lines = weapondef
      .split(";")
      .map((x) => x.trim())
      .filter((x) => x.length > 0);
    for (let line of lines) {
      if (line[0] === "#") continue;
      let kp = line.split(" = ");
      if (kp.length > 1) weapon[kp[0]] = kp.slice(1).join(" = ");
    }
    obj[lines[0]] = weapon;
  }
  return obj;
}

/**
 * @param {URL | string} url
 * @returns
 */
async function singleImporter(url) {
  let result = await (await fetch(url)).text();
  let weapondef = result.replaceAll("\r\n", "");
  let weapon = {};
  let lines = weapondef
    .split(";")
    .map((x) => x.trim())
    .filter((x) => x.length > 0);
  for (let line of lines) {
    if (line[0] === "#") continue;
    let kp = line.split(" = ");
    if (kp.length > 1) weapon[kp[0]] = kp.slice(1).join(" = ");
  }
  return weapon;
}

async function importAll() {
  weapons = await importer("definitions/weapons.def");
  console.log("Weapons loaded.");
  blimps = await importer("definitions/blimps.def");
  console.log("Blimps loaded.");
  entities = await importer("definitions/entities.def");
  console.log("Entities loaded.");
  zones = await importer("definitions/zones.def");
  console.log("Zones loaded.");
  others = await importer("definitions/others.def");
  console.log("Others loaded.");
  components = await singleImporter("definitions/components.def");
  console.log(components);
  console.log("Components loaded.");
}

function createWeaponPage(weaponJSON = {}) {
  console.log(weaponJSON);
  return [
    `
  <header>
    <p><i>${process(weaponJSON.class ?? "[[Class]]")}</i>
    <h1>${process(weaponJSON.title ?? "[[Title]]")}</h1>
    </p><search-bar></search-bar>
  </header>
  <main>
    <div class="desc">
      ${blockquote(process(weaponJSON.description ?? "[[Description]]"))}
      <h2>Overview</h2>
      <p>${process(weaponJSON.overview ?? "[[Overview]]")}</p>
      <h2>Appearance</h2>
      <p>${process(weaponJSON.appearance ?? "[[Appearance]]")}</p>
      <h2>Attack Description</h2>
      <p>${process(
        weaponJSON.attackDescription ?? "[[Attack Description]]"
      )}</p>
      <h2>Use Cases</h2>
      <p>${process(weaponJSON.useCases ?? "[[Use Cases]]")}</p>
      <br><br>
      <h2>Version History</h2>
      <div class="container">
        <div class="history">
          <ul>
            ${createHistoryList(
              weaponJSON.versionHistory ?? "Release: [i/Added]"
            ).join("\n")}
          </ul>
        </div>
      </div>
    </div>
    
  </main>`,
    `
      ${makeSafe(weaponJSON.infobox ?? "")}`,
  ];
}

function createBlimpPage(blimpJSON = {}) {
  console.log(blimpJSON);
  return [
    `
  <header>
    <p><i>${process(blimpJSON.class ?? "[[Class]]")}</i>
    <h1>${process(blimpJSON.title ?? "[[Title]]")}</h1>
    </p><search-bar></search-bar>
  </header>
  <main>
    <div class="desc">
      <h2>Overview</h2>
      <p>${process(blimpJSON.overview ?? "[[Overview]]")}</p>
      <h2>Appearance</h2>
      <p>${process(blimpJSON.appearance ?? "[[Appearance]]")}</p>
      <h2>Weapons</h2>
      <p>${process(blimpJSON.weapons ?? "[[Weapons]]")}</p>
      <h2>Use Cases</h2>
      <p>${process(blimpJSON.useCases ?? "[[Use Cases]]")}</p>
      <br><br>
      <h2>Version History</h2>
      <div class="container">
        <div class="history">
          <ul>
            ${createHistoryList(
              blimpJSON.versionHistory ?? "Release: [i/Added]"
            ).join("\n")}
          </ul>
        </div>
      </div>
    </div>
    
  </main>`,
    `
      ${makeSafe(blimpJSON.infobox ?? "")}`,
  ];
}

function createZonePage(zoneJSON = {}) {
  console.log(zoneJSON);
  return [
    `
  <header>
    <p><i>${process(zoneJSON.class ?? "[[Class]]")}</i>
    <h1>${process(zoneJSON.title ?? "[[Title]]")}</h1>
    </p><search-bar></search-bar>
  </header>
  <main>
    <div class="desc">
      <h2>Overview</h2>
      <p>${process(zoneJSON.overview ?? "[[Overview]]")}</p>
      <h2>Appearance</h2>
      <p>${process(zoneJSON.appearance ?? "[[Appearance]]")}</p>
      <h2>Spawning</h2>
      <p>${process(zoneJSON.spawning ?? "[[Spawning]]")}</p>
      <h2>Strategy</h2>
      <p>${process(zoneJSON.strategy ?? "[[Strategy]]")}</p>
      <br><br>
      <h2>Version History</h2>
      <div class="container">
        <div class="history">
          <ul>
            ${createHistoryList(
              zoneJSON.versionHistory ?? "Release: [i/Added]"
            ).join("\n")}
          </ul>
        </div>
      </div>
    </div>
    
  </main>`,
    `
      ${makeSafe(zoneJSON.infobox ?? "")}`,
  ];
}

function createEntityPage(entityJSON = {}) {
  console.log(entityJSON);
  return [
    `
  <header>
    <p><i>${process(entityJSON.class ?? "[[Class]]")}</i>
    <h1>${process(entityJSON.title ?? "[[Title]]")}</h1>
    </p><search-bar></search-bar>
  </header>
  <main>
    <div class="desc">
      <h2>Overview</h2>
      <p>${process(entityJSON.overview ?? "[[Overview]]")}</p>
      <h2>Appearance</h2>
      <p>${process(entityJSON.appearance ?? "[[Appearance]]")}</p>
      <h2>Attacks</h2>
      <p>${process(entityJSON.attacks ?? "[[Attacks]]")}</p>
      <h2>Spawning</h2>
      <p>${process(entityJSON.spawning ?? "[[Spawning]]")}</p>
      <h2>Strategy</h2>
      <p>${process(entityJSON.strategy ?? "[[Strategy]]")}</p>
      <br><br>
      <h2>Version History</h2>
      <div class="container">
        <div class="history">
          <ul>
            ${createHistoryList(
              entityJSON.versionHistory ?? "Release: [i/Added]"
            ).join("\n")}
          </ul>
        </div>
      </div>
    </div>
    
  </main>`,
    `
      ${makeSafe(entityJSON.infobox ?? "")}`,
  ];
}

let reservedProperties = [
  "class",
  "title",
  "versionHistory",
  "infobox",
  "before",
];
function createArbitraryPage(json = {}) {
  console.log(json);
  return [
    `
  <header>
    <p>${json.class ? `<i>${process(json.class ?? "[[Class]]")}</i>` : ""}
    <h1>${process(json.title ?? "[[Title]]")}</h1>
    </p><search-bar></search-bar>
  </header>
  <main>
    <div class="desc">
      ${process(json.before, true)}
      ${Object.entries(json)
        .filter((x) => !reservedProperties.includes(x[0]))
        .map(
          (section) =>
            (!(section[0].startsWith("(") && section[0].endsWith(")"))
              ? `
        <h2>${convertToSectionHeader(section[0])}</h2>`
              : "") +
            `
      <p>${process(
        section[1] ??
          "[[" + section[0][0].toUpperCase() + section[0].substring(1) + "]]"
      )}</p>`
        )
        .join("\n")}
      <br><br>
      <h2>Version History</h2>
      <div class="container">
        <div class="history">
          <ul>
            ${createHistoryList(
              json.versionHistory ?? "Release: [i/Added]"
            ).join("\n")}
          </ul>
        </div>
      </div>
    </div>
    
  </main>`,
    `
      ${makeSafe(json.infobox ?? "")}`,
  ];
}

function blockquote(quote, cite = "In-Game Description") {
  return `
      <div class="bq">
        <blockquote>
          <p>${quote}</p>
        </blockquote>
        <br>
        <cite>${cite}</cite>
      </div>`;
}

function decideWhatTheF_ckThisIs(name) {
  console.log("deciding what the f_ck " + name + " is");
  if (Object.keys(weapons).includes(name)) {
    console.log(name + " is weapon");
    return { source: weapons, func: creator.weapon };
  }
  if (Object.keys(blimps).includes(name)) {
    console.log(name + " is blimp");
    return { source: blimps, func: creator.blimp };
  }
  if (Object.keys(entities).includes(name)) {
    console.log(name + " is entity");
    return { source: entities, func: creator.entity };
  }
  if (Object.keys(zones).includes(name)) {
    console.log(name + " is zone");
    return { source: zones, func: creator.zone };
  }
  if (Object.keys(others).includes(name)) {
    console.log(name + " is other");
    return { source: others, func: creator.other };
  }
  console.log(name + " does not exist");
  return { source: [], func: () => error404 };
}
