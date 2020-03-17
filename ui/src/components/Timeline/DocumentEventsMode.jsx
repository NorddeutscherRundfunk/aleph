import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { Waypoint } from 'react-waypoint';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Query from 'src/app/Query';
import { queryEntities } from 'src/actions';
import { selectEntitiesResult } from 'src/selectors';
import { SectionLoading, ErrorSection } from 'src/components/common';

import TimelineEventTable from 'src/components/Timeline/TimelineEventTable';

const messages = defineMessages({
  no_results_title: {
    id: 'document.events.no_results_title',
    defaultMessage: 'No timeline events',
  },
});

export class TimelineEventsMode extends React.Component {
  constructor(props) {
    super(props);

    this.getMoreResults = this.getMoreResults.bind(this);
    this.fetchIfNeeded = this.fetchIfNeeded.bind(this);
  }

  componentDidMount() {
    this.fetchIfNeeded();
  }

  componentDidUpdate() {
    this.fetchIfNeeded();
  }

  getMoreResults() {
    const { query, result } = this.props;
    if (!result.isLoading && result.next) {
      this.props.queryEntities({ query, next: result.next });
    }
  }

  fetchIfNeeded() {
    const { result, query } = this.props;
    if (result.shouldLoad) {
      this.props.queryEntities({ query });
    }
  }

  render() {
    const { query, result, intl } = this.props;

    return (
      <div className="TimelineEventsMode">
        <TimelineEventTable
          query={query}
          updateQuery={this.updateQuery}
          result={result}
          hideCollection={false}
        />
        {result.total === 0 && (
          <ErrorSection
            icon="search"
            title={intl.formatMessage(messages.no_results_title)}
          />
        )}
        <Waypoint
          onEnter={this.getMoreResults}
          bottomOffset="-400px"
          scrollableAncestor={window}
        />
        {result.isLoading && (
          <SectionLoading />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  // const { location, document } = ownProps;
  const { location } = ownProps;
  const context = {
    'filter:schema': 'Event',
    // 'filter:collection_id': document.collection.id,
    // 'filter:alephUrl': document.links.ui,
  };
  const query = Query.fromLocation('entities', location, context, 'events');
  const result = selectEntitiesResult(state, query);
  return { query, result };
};

const mapDispatchToProps = { queryEntities };

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
  injectIntl,
)(TimelineEventsMode);
