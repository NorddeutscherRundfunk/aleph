import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { compose } from 'redux';
import { connect } from 'react-redux';

import Query from 'src/app/Query';
import { SectionLoading } from 'src/components/common';
import { queryTimelines } from 'src/actions';
import { selectTimelinesResult } from 'src/selectors';
import ErrorScreen from 'src/components/Screen/ErrorScreen';
import TimelineCreateMenu from 'src/components/Timeline/TimelineCreateMenu';
import TimelineList from 'src/components/Timeline/TimelineList';

export class CollectionTimelinesIndexMode extends Component {
  constructor(props) {
    super(props);
    this.getMoreResults = this.getMoreResults.bind(this);
  }

  getMoreResults() {
    const { query, result } = this.props;
    if (result && !result.isLoading && result.next && !result.isError) {
      this.props.queryTimelines({ query, next: result.next });
    }
  }

  render() {
    const { collection, result } = this.props;

    if (result.isError) {
      return <ErrorScreen error={result.error} />;
    }

    return (
      <div>
        <div style={{ marginBottom: '10px' }}>
          <TimelineCreateMenu collection={collection} />
        </div>
        { result.isLoading && !result.results?.length && (
          <SectionLoading />
        )}
        { result.results && (
          <TimelineList
            items={result.results}
            getMoreItems={this.getMoreResults}
            showCollection={false}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { collection } = ownProps;
  const context = {
    'filter:collection_id': collection.id,
  };
  const query = new Query('timelines', {}, context, 'timelines')
    .sortBy('updated_at', 'desc');
  const result = selectTimelinesResult(state, query);

  return {
    query,
    result,
  };
};


export default compose(
  connect(mapStateToProps, { queryTimelines }),
  withRouter,
)(CollectionTimelinesIndexMode);