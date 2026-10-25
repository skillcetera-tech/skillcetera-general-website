/**
 * Chapter scroll snapping has been removed per user request to preserve native scrolling.
 */
export function initChapterScroll() {
  delete document.documentElement.dataset.chapterTransition;
  return {
    cancel() {
      delete document.documentElement.dataset.chapterTransition;
    },
    destroy() {
      delete document.documentElement.dataset.chapterTransition;
    },
  };
}
