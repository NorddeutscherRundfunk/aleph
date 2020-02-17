import logging
from banal import ensure_list
from flask import Blueprint, request

from aleph.core import db
from aleph.model import Timeline
from aleph.logic.entities import upsert_entity
from aleph.search import QueryParser, DatabaseQueryResult
from aleph.views.serializers import TimelineSerializer
from aleph.views.util import get_nested_collection, get_db_collection
from aleph.views.util import obj_or_404, parse_request


blueprint = Blueprint('timelines_api', __name__)
log = logging.getLogger(__name__)


@blueprint.route('/api/2/timelines', methods=['GET'])
def index():
    # TODO doc
    """Returns a list of timelines for the role
    ---
    get:
      summary: List timelines
      parameters:
      - description: The collection id.
        in: query
        name: 'filter:collection_id'
        required: true
        schema:
          minimum: 1
          type: integer
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                allOf:
                - $ref: '#/components/schemas/QueryResponse'
                properties:
                  results:
                    type: array
                    items:
                      $ref: '#/components/schemas/Timeline'
          description: OK
      tags:
        - Timeline
    """
    parser = QueryParser(request.args, request.authz)
    q = Timeline.by_authz(request.authz)
    collection_ids = ensure_list(parser.filters.get('collection_id'))
    if len(collection_ids):
        q = q.filter(Timeline.collection_id.in_(collection_ids))
    result = DatabaseQueryResult(request, q)
    return TimelineSerializer.jsonify_result(result)


@blueprint.route('/api/2/timelines', methods=['POST', 'PUT'])
def create():
    # TODO doc
    """Create a timeline.
    ---
    post:
      summary: Create a timeline
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TimelineCreate'
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Timeline'
          description: OK
      tags:
      - Timeline
    """
    data = parse_request('TimelineCreate')
    collection = get_nested_collection(data, request.authz.WRITE)
    old_to_new_id_map = {}
    entity_ids = []
    for entity in data.pop('entities', []):
        old_id = entity.get('id')
        new_id = upsert_entity(entity, collection, sync=True)
        old_to_new_id_map[old_id] = new_id
        entity_ids.append(new_id)
    data['entities'] = entity_ids
    timeline = Timeline.create(data, collection, request.authz.id)
    db.session.commit()
    return TimelineSerializer.jsonify(timeline)


@blueprint.route('/api/2/timelines/<int:timeline_id>', methods=['GET'])
def view(timeline_id):
    # TODO doc
    """Return the timeline with id `timeline_id`.
    ---
    get:
      summary: Fetch a timeline
      parameters:
      - description: The timeline id.
        in: path
        name: timeline_id
        required: true
        schema:
          minimum: 1
          type: integer
        example: 2
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Timeline'
          description: OK
      tags:
      - Timeline
    """
    timeline = obj_or_404(Timeline.by_id(timeline_id))
    get_db_collection(timeline.collection_id, request.authz.READ)
    return TimelineSerializer.jsonify(timeline)


@blueprint.route('/api/2/timelines/<int:timeline_id>', methods=['POST', 'PUT'])
def update(timeline_id):
    # TODO doc
    """Update the timeline with id `timeline_id`.
    ---
    post:
      summary: Update a timeline
      parameters:
      - description: The timeline id.
        in: path
        name: timeline_id
        required: true
        schema:
          minimum: 1
          type: integer
        example: 2
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TimelineUpdate'
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Timeline'
          description: OK
      tags:
      - Timeline
    """
    timeline = obj_or_404(Timeline.by_id(timeline_id))
    collection = get_db_collection(timeline.collection_id, request.authz.WRITE)
    data = parse_request('TimelineUpdate')
    timeline.update(data, collection)
    collection.touch()
    db.session.commit()
    return TimelineSerializer.jsonify(timeline)


@blueprint.route('/api/2/timelines/<int:timeline_id>', methods=['DELETE'])
def delete(timeline_id):
    # TODO doc
    """Delete a timeline.
    ---
    delete:
      summary: Delete a timeline
      parameters:
      - description: The timeline id.
        in: path
        name: timeline_id
        required: true
        schema:
          minimum: 1
          type: integer
        example: 2
      responses:
        '204':
          description: No Content
      tags:
      - Timeline
    """
    timeline = obj_or_404(Timeline.by_id(timeline_id))
    collection = get_db_collection(timeline.collection_id, request.authz.WRITE)
    timeline.delete()
    collection.touch()
    db.session.commit()
    return ('', 204)
