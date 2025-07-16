export function konami(node, callback) {
  const konamiCodeSequence = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a',
  ];

  let konamiCodePosition = 0;

  function handleKeyDown(event) {
    const expectedKey = konamiCodeSequence[konamiCodePosition];

    if (event.key.toLowerCase() === expectedKey.toLowerCase()) {
      konamiCodePosition++;

      if (konamiCodePosition === konamiCodeSequence.length) {
        konamiCodePosition = 0;
        callback();
      }
    } else {
      konamiCodePosition = 0;
    }
  }

  document.addEventListener('keydown', handleKeyDown);

  return {
    destroy() {
      document.removeEventListener('keydown', handleKeyDown);
    },
  };
}
