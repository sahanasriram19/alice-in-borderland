document.addEventListener("DOMContentLoaded", function () {

  // DOM Helpers
  function byId(id) {
    return document.getElementById(id);
  }

  // Error Handling
  function showPageError(msgEl, text) {
    if (!msgEl) return;
    msgEl.textContent = text || "Something went wrong.";
    msgEl.classList.remove("d-none");
  }

  function clearPageError(msgEl) {
    if (!msgEl) return;
    msgEl.classList.add("d-none");
    msgEl.textContent = "";
  }

  function showInlineError(el, text) {
    if (!el) return;
    el.textContent = text || "Something went wrong.";
    el.classList.remove("d-none");
  }

  function clearInlineError(el) {
    if (!el) return;
    el.classList.add("d-none");
    el.textContent = "";
  }

  // Safety / Sanitization
  function escapeHtml(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // Payload Helpers
  function unwrapData(payload) {
    if (!payload) return payload;
    if (payload.data && typeof payload.data === "object") {
      return payload.data;
    }
    return payload;
  }

  function pick(payload, keys, fallback) {
    const dataObj = unwrapData(payload);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (dataObj && Object.prototype.hasOwnProperty.call(dataObj, key)) {
        return dataObj[key];
      }
    }
    return fallback;
  }

  // API Wrappers
  function apiGet(path, token, callback) {
    fetchMethod(currentUrl + path, callback, "GET", null, token);
  }

  function apiPost(path, body, token, callback) {
    fetchMethod(currentUrl + path, callback, "POST", body, token);
  }

  function apiPut(path, body, token, callback) {
    fetchMethod(currentUrl + path, callback, "PUT", body, token);
  }

  // Public API
  window.AppHelpers = {
    byId,
    showPageError,
    clearPageError,
    showInlineError,
    clearInlineError,
    escapeHtml,
    unwrapData,
    pick,
    apiGet,
    apiPost,
    apiPut
  };
});