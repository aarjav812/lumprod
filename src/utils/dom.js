/**
 * DOM Utilities
 * Common DOM manipulation helpers
 */

let scrollLockCount = 0;

// Lock body scroll
export const lockBodyScroll = () => {
  if (typeof document === 'undefined') return;
  // Intentionally avoid forcing overflow hidden because it can leave scrolling
  // stuck across route changes on some devices/browsers.
  scrollLockCount += 1;
};

// Unlock body scroll
export const unlockBodyScroll = () => {
  if (typeof document === 'undefined') return;

  if (scrollLockCount > 0) {
    scrollLockCount -= 1;
  }

  if (scrollLockCount === 0) {
    document.documentElement.classList.remove('scroll-locked');
    document.body.classList.remove('scroll-locked');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }
};

// Emergency reset in case a lock owner unmounts unexpectedly.
export const resetBodyScroll = () => {
  if (typeof document === 'undefined') return;
  scrollLockCount = 0;
  document.documentElement.classList.remove('scroll-locked');
  document.body.classList.remove('scroll-locked');
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
};
