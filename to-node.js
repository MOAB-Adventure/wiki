/**
 * @param {String} HTML representing a single node (which might be an Element, a text node, or a comment).
 * @return {Node}
 */
function htmlToNode(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  const nNodes = template.content.childNodes.length;
  if (nNodes !== 1) {
    throw new Error(
      `html parameter must represent a single node; got ${nNodes} nodes. `
    );
  }
  return template.content.firstChild;
}

/**
 * @param {String} HTML representing any number of sibling nodes
 * @return {NodeList}
 */
function htmlToNodes(html) {
  const template = document.createElement("template");
  template.innerHTML = html;
  return template.content.childNodes;
}
