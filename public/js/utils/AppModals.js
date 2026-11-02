/* Get or create a Bootstrap Modal instance for a given DOM element */
function getBootstrapModal(modalEl) {

  /* Return null if the element is missing or Bootstrap hasn't loaded */
  if (!modalEl || typeof bootstrap === "undefined" || !bootstrap.Modal) {
    return null;
  }

  /* Check whether Bootstrap already has an instance tied to this element */
  let instance = bootstrap.Modal.getInstance(modalEl);

  /* If no existing instance was found, create a new one */
  if (!instance) {
    instance = new bootstrap.Modal(modalEl);
  }

  return instance;
}

/* Open a modal by looking up its element by ID and calling show() */
function open(modalId) {

  /* Find the modal element in the DOM */
  const modalEl  = document.getElementById(modalId);

  /* Get or create the Bootstrap instance for this element */
  const instance = getBootstrapModal(modalEl);

  /* If no instance could be created, log an error and stop */
  if (!instance) {
    console.error("Bootstrap modal missing:", modalId);
    return;
  }

  instance.show();
}

/* Close a modal by looking up its element by ID and calling hide() */
function close(modalId) {

  /* Find the modal element in the DOM */
  const modalEl  = document.getElementById(modalId);

  /* Get the existing Bootstrap instance for this element */
  const instance = getBootstrapModal(modalEl);

  /* If there is no instance there is nothing to close */
  if (!instance) return;

  instance.hide();
}

/* Expose all three modal helpers as a single global object so any script
   on the page can open or close modals by ID without importing anything */
window.AppModals = { getBootstrapModal, open, close };