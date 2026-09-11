'use strict';
for (const button of document.querySelectorAll('.copy')) {
  button.hidden = false;
  button.addEventListener('click', async () => {
    const prompt = button.closest('.prompt').querySelector('.prompt-text');
    const status = document.getElementById('copy-status');
    try {
      await navigator.clipboard.writeText(prompt.textContent.trim());
      button.textContent = 'Copied ✓';
      status.textContent = 'Copied! Paste it into your AI app and make it yours.';
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(prompt);
      selection.removeAllRanges();
      selection.addRange(range);
      button.textContent = 'Text selected';
      status.textContent = 'Couldn’t copy automatically. The prompt is selected—use Copy, then paste it into your AI app.';
    }
  });
}
