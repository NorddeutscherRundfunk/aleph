import logging
from datetime import datetime
from normality import stringify

from aleph.core import db
from aleph.model import Role, Collection
from aleph.model.common import SoftDeleteModel


log = logging.getLogger(__name__)


class Timeline(db.Model, SoftDeleteModel):
    """A mapping to load entities from a table"""
    __tablename__ = 'timeline'

    id = db.Column(db.Integer, primary_key=True)
    label = db.Column(db.Unicode)
    summary = db.Column(db.Unicode, nullable=True)
    # list of entity ids
    entities = db.Column('entities', db.ARRAY(db.Unicode))

    role_id = db.Column(db.Integer, db.ForeignKey('role.id'), index=True)
    role = db.relationship(Role, backref=db.backref('timelines', lazy='dynamic'))  # noqa

    collection_id = db.Column(db.Integer, db.ForeignKey('collection.id'), index=True)  # noqa
    collection = db.relationship(Collection, backref=db.backref(
        'timelines', lazy='dynamic', cascade="all, delete-orphan"
    ))

    def update(self, data, collection):
        self.updated_at = datetime.utcnow()
        self.deleted_at = None
        self.label = data.get('label', self.label)
        self.summary = data.get('summary', self.summary)
        self.entities = data.get('entities', self.entities)
        entities = []
        for entity_id in self.entities:
            entities.append(collection.ns.sign(entity_id))
        self.entities = entities
        db.session.add(self)

    def delete(self, deleted_at=None):
        self.deleted_at = deleted_at or datetime.utcnow()
        db.session.add(self)

    def to_dict(self):
        data = self.to_dict_dates()
        data.update({
            'id': stringify(self.id),
            'label': self.label,
            'summary': self.summary,
            'entities': self.entities,
            'role_id': stringify(self.role_id),
            'collection_id': stringify(self.collection_id),
        })
        return data

    @classmethod
    def by_authz(cls, authz, writeable=False):
        ids = authz.collections(authz.WRITE if writeable else authz.READ)
        q = cls.all()
        q = q.filter(cls.collection_id.in_(ids))
        return q

    @classmethod
    def delete_by_collection(cls, collection_id):
        pq = db.session.query(cls)
        pq = pq.filter(cls.collection_id == collection_id)
        pq.delete(synchronize_session=False)

    @classmethod
    def create(cls, data,  collection, role_id):
        timeline = cls()
        timeline.entities = []
        timeline.role_id = role_id
        timeline.collection_id = collection.id
        timeline.update(data, collection)
        return timeline

    def __repr__(self):
        return '<Timeline(%r, %r)>' % (self.id, self.collection_id)
