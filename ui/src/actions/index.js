import { createAction } from 'redux-act';

export { queryRoles, fetchRole, suggestRoles, updateRole } from './roleActions';
export { addAlert, deleteAlert, fetchAlerts } from './alertActions';
export { queryNotifications } from './notificationActions';
export { ingestDocument } from './documentActions';
export {
  createCollection,
  deleteCollection,
  fetchCollection,
  fetchCollectionStatus,
  fetchCollectionPermissions,
  queryCollections,
  queryCollectionXref,
  triggerCollectionXref,
  decideCollectionXref,
  triggerCollectionReingest,
  triggerCollectionReindex,
  triggerCollectionCancel,
  updateCollection,
  updateCollectionPermissions,
} from './collectionActions';
export {
  createDiagram,
  deleteDiagram,
  fetchDiagram,
  queryDiagrams,
  updateDiagram,
} from './diagramActions';
export {
  createTimeline,
  deleteTimeline,
  fetchTimeline,
  queryTimelines,
  updateTimeline,
  queryTimelineEvents,
} from './timelineActions';
export {
  createEntity,
  createEntityMapping,
  deleteEntity,
  deleteEntityMapping,
  fetchEntity,
  fetchEntityMapping,
  fetchEntityReferences,
  fetchEntityTags,
  flushEntityMapping,
  queryEntities,
  updateEntity,
  updateEntityMapping,
} from './entityActions';
export { fetchMetadata, fetchStatistics, fetchSystemStatus } from './metadataActions';
export { fetchQueryLogs, deleteQueryLog } from './queryLogsActions';

export { createAction };
export const setLocale = createAction('SET_LOCALE');
export const mutate = createAction('MUTATE');
