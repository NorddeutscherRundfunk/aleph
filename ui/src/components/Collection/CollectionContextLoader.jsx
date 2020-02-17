import { PureComponent } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { queryCollectionDiagrams, queryCollectionTimelines, queryCollectionXrefFacets } from 'src/queries';
import { fetchCollection, queryCollectionXref, queryDiagrams, queryTimelines, mutate } from 'src/actions';
import { selectCollection, selectCollectionStatus, selectCollectionXrefResult, selectDiagramsResult, selectTimelinesResult } from 'src/selectors';


class CollectionContextLoader extends PureComponent {
  componentDidMount() {
    this.fetchIfNeeded();
  }

  componentDidUpdate(prevProps) {
    this.fetchIfNeeded();
    const { status } = this.props;
    const prevStatus = prevProps.status;
    const wasUpdating = prevStatus.pending > 0 || prevStatus.running > 0;
    const isUpdating = status.pending > 0 || status.running > 0;

    if (wasUpdating && !isUpdating) {
      this.props.mutate();
    }
  }

  fetchIfNeeded() {
    const { collectionId, collection } = this.props;

    const loadDeep = (collection.shallow && !collection.isPending);
    if (collection.shouldLoad || loadDeep) {
      this.props.fetchCollection({ id: collectionId });
    }

    const { xrefResult, xrefQuery } = this.props;
    if (xrefResult.shouldLoad) {
      this.props.queryCollectionXref({ query: xrefQuery });
    }

    const { diagramsQuery, diagramsResult } = this.props;
    if (diagramsResult.shouldLoad) {
      this.props.queryDiagrams({ query: diagramsQuery });
    }

    const { timelinesQuery, timelinesResult } = this.props;
    if (timelinesResult.shouldLoad) {
      this.props.queryTimelines({ query: timelinesQuery });
    }
  }

  render() {
    return this.props.children;
  }
}

const mapStateToProps = (state, ownProps) => {
  const { collectionId, location } = ownProps;
  const diagramsQuery = queryCollectionDiagrams(location, collectionId);
  const timelinesQuery = queryCollectionTimelines(location, collectionId);
  const xrefQuery = queryCollectionXrefFacets(location, collectionId);
  return {
    collection: selectCollection(state, collectionId),
    status: selectCollectionStatus(state, collectionId),
    xrefQuery,
    xrefResult: selectCollectionXrefResult(state, xrefQuery),
    diagramsQuery,
    diagramsResult: selectDiagramsResult(state, diagramsQuery),
    timelinesQuery,
    timelinesResult: selectTimelinesResult(state, timelinesQuery),
  };
};

const mapDispatchToProps = {
  mutate,
  fetchCollection,
  queryCollectionXref,
  queryDiagrams,
  queryTimelines,
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(CollectionContextLoader);
