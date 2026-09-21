    box.innerHTML = html;
    $('#modal').hidden = false;
    $$('[data-close]', box).forEach(el => el.onclick = closeModal);
    $('.modal-backdrop').onclick = closeModal;
  }

  function closeModal() {
    $('#modal').hidden = true;
    $('#modalBox').innerHTML = '';
  }

  function esc(s) {
    return String(s ?? '')
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
  }

  // ---------- Init ----------
  $('#loginBtn').onclick = login;
  $('#tokenInput').addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
  $('#logoutBtn').onclick = logout;
  $('#saveAllBtn').onclick = saveAll;
  $$('#sbNav button').forEach(b => b.onclick = () => setTab(b.dataset.tab));

  // auto-login if token in session
  const saved = sessionStorage.getItem(TOKEN_KEY);
  if (saved) {
    token = saved;
    $('#tokenInput').value = saved;
    $('#rememberToken').checked = true;
    boot();
  }
})();
