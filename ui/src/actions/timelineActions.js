import { endpoint } from 'src/app/api';
import asyncActionCreator from './asyncActionCreator';
import { queryEndpoint } from './util';


export const queryTimelines = asyncActionCreator(query => async () => queryEndpoint(query), { name: 'QUERY_TIMELINES' });

export const fetchTimeline = asyncActionCreator((timelineId) => async () => {
  const response = await endpoint.get(`timelines/${timelineId}`);
  return { timelineId, data: response.data };
}, { name: 'FETCH_TIMELINE' });

export const createTimeline = asyncActionCreator((timeline) => async () => {
  const response = await endpoint.post('timelines', timeline);
  const timelineId = response.data.id;
  return { timelineId, data: response.data };
}, { name: 'CREATE_TIMELINE' });

export const updateTimeline = (
  asyncActionCreator((timelineId, timeline) => async () => {
    const response = await endpoint.put(`timelines/${timelineId}`, timeline);
    return { timelineId, data: response.data };
  }, { name: 'UPDATE_TIMELINE' })
);

export const deleteTimeline = asyncActionCreator((timelineId) => async () => {
  await endpoint.delete(`timelines/${timelineId}`);
  return { timelineId };
}, { name: 'DELETE_TIMELINE' });

export const createTimelineEvent = asyncActionCreator((event) => async () => {
  const response = await endpoint.post('timelines/events', event);
  const timelineId = response.data.id;
  return { timelineId, data: response.data };
}, { name: 'CREATE_TIMELINE_EVENT' });
