import logging
from banal import ensure_list, as_bool
from flask import Blueprint, request

from aleph.core import db, url_for
from aleph.index.util import MAX_PAGE
from aleph.model import Timeline
from aleph.search import TimelineEventsQuery, SearchQueryParser, QueryParser, DatabaseQueryResult
from aleph.views.context import tag_request
from aleph.views.serializers import EntitySerializer, TimelineSerializer
from aleph.views.util import get_nested_collection, get_db_collection
from aleph.views.util import obj_or_404, parse_request


blueprint = Blueprint('timelines_api', __name__)
log = logging.getLogger(__name__)


@blueprint.route('/api/2/timelines', methods=['GET'])
def index():
    """Returns a list of timelines for the role

    if no collection_id is given, return all timelines that
    the role can access
    ---
    get:
      summary: List timelines
      parameters:
      - description: The collection id.
        in: query
        name: 'filter:collection_id'
        required: false
        schema:
          minimum: 1
          type: integer
      - description: Writeable flag
        in: query
        name: 'filter:writeable'
        required: false
        schema:
          type: boolean
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
    collection_ids = ensure_list(parser.filters.get('collection_id'))
    writeable = as_bool(parser.filters.get('writeable'))
    q = Timeline.by_authz(request.authz, writeable)
    if len(collection_ids):
        q = q.filter(Timeline.collection_id.in_(collection_ids))
    result = DatabaseQueryResult(request, q)
    return TimelineSerializer.jsonify_result(result)


@blueprint.route('/api/2/timelines', methods=['POST', 'PUT'])
def create():
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
    timeline = Timeline.create(data, collection, request.authz.id)
    db.session.commit()
    return TimelineSerializer.jsonify(timeline)


@blueprint.route('/api/2/timelines/<int:timeline_id>', methods=['GET'])
def view(timeline_id):
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


@blueprint.route('/api/2/timelines/<int:timeline_id>/events', methods=['GET'])
def events(timeline_id):
    """
    ---
    get:
      summary: Search entities
      description: >
        Returns a list of entities matching the given search criteria.

        A filter can be applied to show only results from a particular
        collection: `?filter:collection_id={collection_id}`.

        If you know you only want to search documents (unstructured, ingested
        data) or entities (structured data which may have been extracted from
        a dataset, or entered by a human) you can use these arguments with the
        `/documents` or `/entities` endpoints.
      parameters:
      - description: >-
          A query string in ElasticSearch query syntax. Can include field
          searches, such as `title:penguin`
        in: query
        name: q
        schema:
          type: string
      - description: >-
          Return facet values for the given metadata field, such as
          `languages`, `countries`, `mime_type` or `extension`. This can be
          specified multiple times for more than one facet to be added.
        in: query
        name: facet
        schema:
          type: string
      - description: >
          Filter the results by the given field. This is useful when used in
          conjunction with facet to create a drill-down mechanism. Useful
          fields are:

          - `collection_id`, documents belonging to a particular collection.

          - `title`, of the document.

          - `file_name`, of the source file.

          - `source_url`, URL of the source file.

          - `extension`, file extension of the source file.

          - `languages`, in the document.

          - `countries`, associated with the document.

          - `keywords`, from the document.

          - `emails`, email addresses mentioned in the document.

          - `domains`, websites mentioned in the document.

          - `phones`, mentioned in the document.

          - `dates`, in any of the following formats: yyyy-MM-dd, yyyy-MM,
          yyyy-MM-d, yyyy-M, yyyy

          - `mime_type`, of the source file.

          - `author`, according to the source file's metadata.

          - `summary`, of the document.

          - `text`, entire text extracted from the document.

          - `created_at`, when the document was added to aleph (yyyy-mm
          -ddThh:ii:ss.uuuuuu).

          - `updated_at`, when the document was modified in aleph (yyyy
          -mm-ddThh:ii:ss.uuuuuu).
        in: query
        name: 'filter:{field_name}'
        schema:
          type: string
      - description: 'The number of results to return, max. 10,000.'
        in: query
        name: limit
        schema:
          type: integer
      - description: >
            The number of results to skip at the beginning of the result set.
        in: query
        name: offset
        schema:
          type: integer
      responses:
        '200':
          description: Resturns a list of entities in result
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/EntitiesResponse'
      tags:
      - Entity
    """
    # enable_cache(vary_user=True)
    timeline = obj_or_404(Timeline.by_id(timeline_id))
    get_db_collection(timeline.collection_id, request.authz.READ)
    parser = SearchQueryParser(request.args, request.authz)
    tag_request(query=parser.text, prefix=parser.prefix)
    result = TimelineEventsQuery.handle(request, parser=parser, timeline=timeline)
    links = {}
    if request.authz.logged_in and result.total <= MAX_PAGE:
        query = list(request.args.items(multi=True))
        links['export'] = url_for('entities_api.export',
                                  _authorize=True,
                                  _query=query)
    return EntitySerializer.jsonify_result(result, extra={'links': links})


@blueprint.route('/api/2/timelines/<int:timeline_id>', methods=['POST', 'PUT'])
def update(timeline_id):
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
