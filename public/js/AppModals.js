document.addEventListener("DOMContentLoaded", function () {
  function getBootstrapModal(modalEl) {
    if (!modalEl || typeof bootstrap === "undefined" || !bootstrap.Modal) return null;

    var instance = bootstrap.Modal.getInstance(modalEl);
    if (!instance) instance = new bootstrap.Modal(modalEl);
    return instance;
  }

  function open(modalId) {
    var modalEl = document.getElementById(modalId);
    var instance = getBootstrapModal(modalEl);
    if (!instance) {
      console.error("Bootstrap modal not available or modal element missing:", modalId);
      return;
    }
    instance.show();
  }

  function close(modalId) {
    var modalEl = document.getElementById(modalId);
    var instance = getBootstrapModal(modalEl);
    if (!instance) return;
    instance.hide();
  }

  window.AppModals = {
    getBootstrapModal: getBootstrapModal,
    open: open,
    close: close
  };
});