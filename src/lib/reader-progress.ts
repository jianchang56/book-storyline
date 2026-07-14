type ReaderProgressInput = {
  scrollY: number;
  viewportHeight: number;
  readerTop: number;
  readerHeight: number;
};

export function calculateReaderProgress({
  scrollY,
  viewportHeight,
  readerTop,
  readerHeight,
}: ReaderProgressInput) {
  const scrollableHeight = readerHeight - viewportHeight;
  if (scrollableHeight <= 0) {
    return scrollY >= readerTop ? 100 : 0;
  }
  const progress = ((scrollY - readerTop) / scrollableHeight) * 100;
  return Math.min(100, Math.max(0, progress));
}
