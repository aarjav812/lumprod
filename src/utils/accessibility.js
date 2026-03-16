/**
 * Accessibility Utilities
 * Helper functions for accessibility features
 */

/**
 * Skip to main content link
 * Call this on page load to add skip link
 */
export const addSkipLink = () => {
  const skipLink = document.getElementById('skip-to-main');
  if (skipLink) return; // Already exists

  const link = document.createElement('a');
  link.id = 'skip-to-main';
  link.href = '#main-content';
  link.className = 'skip-link';
  link.textContent = 'Skip to main content';
  link.style.cssText = `
    position: absolute;
    top: -100px;
    left: 0;
    background: #000;
    color: #fff;
    padding: 0.75rem 1.5rem;
    text-decoration: none;
    z-index: 10001;
    border: 2px solid #fff;
  `;

  link.addEventListener('focus', () => {
    link.style.top = '0';
  });

  link.addEventListener('blur', () => {
    link.style.top = '-100px';
  });

  document.body.insertBefore(link, document.body.firstChild);
};
