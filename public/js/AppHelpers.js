(function () {
  // ---------
  // DOM safe
  // ---------
  function byId(id) {
    return document.getElementById(id);
  }

  // ---------
  // Errors
  // ---------
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

  // ---------
  // Safety
  // ---------
  function escapeHtml(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // ---------
  // Payload reading (no backend change)
  // Your backend might return:
  //  - { message, data: {...} }
  //  - or directly {...}
  // This returns the best "data object" safely.
  // ---------
  function unwrapData(payload) {
    if (!payload) return payload;
    if (payload.data && typeof payload.data === "object") return payload.data;
    return payload;
  }

  // Get first match from possible keys (avoids data.data.data and avoids "root" var)
  function pick(payload, keys, fallback) {
    var dataObj = unwrapData(payload);

    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (dataObj && Object.prototype.hasOwnProperty.call(dataObj, k)) {
        return dataObj[k];
      }
    }
    return fallback;
  }

  // ---------
  // Fetch wrappers (still uses your fetchMethod + currentUrl)
  // ---------
  function apiGet(path, token, cb) {
    fetchMethod(currentUrl + path, cb, "GET", null, token);
  }

  function apiPost(path, body, token, cb) {
    fetchMethod(currentUrl + path, cb, "POST", body, token);
  }

  function apiPut(path, body, token, cb) {
    fetchMethod(currentUrl + path, cb, "PUT", body, token);
  }

  // Expose helpers globally
  window.AppHelpers = {
    byId: byId,
    showPageError: showPageError,
    clearPageError: clearPageError,
    showInlineError: showInlineError,
    clearInlineError: clearInlineError,
    escapeHtml: escapeHtml,
    unwrapData: unwrapData,
    pick: pick,
    apiGet: apiGet,
    apiPost: apiPost,
    apiPut: apiPut
  };
})();
