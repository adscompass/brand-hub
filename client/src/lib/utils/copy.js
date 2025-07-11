function fallbackCopy(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;

  textArea.style.position = 'fixed';
  textArea.style.top = '-9999px';
  textArea.style.left = '-9999px';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  let successful = false;
  try {
    successful = document.execCommand('copy');
  } catch (err) {
    console.error('Fallback-копирование не удалось:', err);
  }

  document.body.removeChild(textArea);
  return successful;
}

export async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.warn(
        'Clipboard API не сработал, используется fallback-метод.',
        err,
      );
      if (!fallbackCopy(text)) {
        throw new Error('Fallback-копирование также не удалось.');
      }
    }
  } else {
    if (!fallbackCopy(text)) {
      throw new Error('Fallback-копирование не удалось.');
    }
  }
}
