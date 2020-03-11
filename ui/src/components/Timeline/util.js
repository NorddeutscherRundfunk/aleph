// import { Entity } from '@alephdata/followthemoney';

const getEntity = (model, properties, collection) => {
  properties.indexText = `${properties.summary || ''} ${properties.involved?.join(' ') || ''}`.trim()
    || undefined;
  properties.involved = undefined;
  const entity = {
    schema: 'Event',
    properties,
    collection,
  };
  // const entity = new Entity(model, {
  //   schema: 'Event',
  //   properties,
  //   collection,
  // });
  return entity;
};

export { getEntity };
