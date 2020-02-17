import { createReducer } from 'redux-act';

import {
  queryTimelines,
  fetchTimeline,
  updateTimeline,
  createTimeline,
  deleteTimeline,
} from 'src/actions';
import {
  objectLoadComplete,
  objectLoadError,
  objectDelete,
  resultObjects,
} from 'src/reducers/util';

const initialState = {};

export default createReducer(
  {
    [queryTimelines.COMPLETE]: (state, { result }) => resultObjects(state, result),

    [fetchTimeline.ERROR]: (state, {
      error, args,
    }) => objectLoadError(state, args, error),

    [fetchTimeline.COMPLETE]: (state, {
      timelineId, data,
    }) => objectLoadComplete(state, timelineId, data),

    [createTimeline.COMPLETE]: (state, {
      timelineId, data,
    }) => objectLoadComplete(state, timelineId, data),

    [updateTimeline.COMPLETE]: (state, {
      timelineId, data,
    }) => objectLoadComplete(state, timelineId, data),

    [deleteTimeline.COMPLETE]: (state, {
      timelineId,
    }) => objectDelete(state, timelineId),
  },
  initialState,
);
