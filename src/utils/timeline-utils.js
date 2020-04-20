import { ROW_HEIGHT } from '../constants';

const OVERSCAN_ROWS = 5;

export const getTimelineState = (viewportHeight, rowsCount) => {
  let renderedRowsCount = getRenderedRowsCount(viewportHeight);
  let rowOverscanEndIdx = Math.min(rowsCount, renderedRowsCount * 2);
  return {
    rowOverscanStartIdx: 0,
    rowOverscanEndIdx,
    rowVisibleStartIdx: 0,
    rowVisibleEndIdx: renderedRowsCount,
  };
}

export const getRenderedRowsCount = (viewportHeight) => {
  return Math.ceil(viewportHeight / ROW_HEIGHT);
}

export const getVisibleBoundaries = (viewportHeight, scrollTop, rowsCount) => {
  const renderedRowsCount = getRenderedRowsCount(viewportHeight);
  const rowVisibleStartIdx = Math.max(0, Math.round(scrollTop / ROW_HEIGHT));
  const rowVisibleEndIdx = Math.min(rowsCount, rowVisibleStartIdx  + renderedRowsCount);
  return {rowVisibleStartIdx, rowVisibleEndIdx};
}

export const getRowOverscanStartIdx = (rowVisibleStartIdx) => {
  return Math.max(0, Math.floor(rowVisibleStartIdx / 10) * 10 - OVERSCAN_ROWS);
};

export const getRowOverscanEndIdx = (rowVisibleEndIdx, rowsCount) => {
  return Math.min(Math.ceil(rowVisibleEndIdx / 10) * 10 + OVERSCAN_ROWS, rowsCount);
};