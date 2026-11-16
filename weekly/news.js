// The table of contents defaults to open in HTML; retain the reader's toggle choice.
function revealPrinciples() {
  if (location.hash === '#why') {
    const details = document.querySelector('#why details');
    if (details) details.open = true;
  }
}
revealPrinciples();
addEventListener('hashchange', revealPrinciples);
