/**
 * The page's CSS zoom (1.75 on computers, see index.css). Under zoom,
 * getBoundingClientRect() and window scroll positions are in zoomed screen
 * pixels, while CSS lengths (style.top, scrollTop) are unzoomed. Divide
 * measured distances by this before using them as CSS lengths.
 */
export function pageZoom(): number {
  return parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
}
