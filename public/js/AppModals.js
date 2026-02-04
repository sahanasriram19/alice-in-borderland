function getBootstrapModal(modalEl) {
  if (!modalEl || typeof bootstrap === "undefined" || !bootstrap.Modal) {
    return null;
  }

  let instance = bootstrap.Modal.getInstance(modalEl);

  if (!instance) {
    instance = new bootstrap.Modal(modalEl);
  }

  return instance;
}

function open(modalId) {
  const modalEl = document.getElementById(modalId);
  const instance = getBootstrapModal(modalEl);

  if (!instance) {
    console.error("Bootstrap modal missing:", modalId);
    return;
  }

  instance.show();
}

function close(modalId) {
  const modalEl = document.getElementById(modalId);
  const instance = getBootstrapModal(modalEl);

  if (!instance) return;

  instance.hide();
}

window.AppModals = {
  getBootstrapModal,
  open,
  close
};
