import { Entity } from '@alephdata/followthemoney';

const getEntity = (model, properties, collection) => {
  const entity = new Entity(model, {
    schema: 'Event',
    properties,
    collection,
  });
  return entity;
};

export { getEntity };
