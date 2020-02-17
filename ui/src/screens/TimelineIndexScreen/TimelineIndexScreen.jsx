import React, { Component } from 'react';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { queryTimelines } from 'src/actions';
import { selectTimelinesResult } from 'src/selectors';
import Query from 'src/app/Query';
import Screen from 'src/components/Screen/Screen';
import Dashboard from 'src/components/Dashboard/Dashboard';
import {
  Breadcrumbs, SectionLoading,
} from 'src/components/common';
import ErrorScreen from 'src/components/Screen/ErrorScreen';
import TimelineCreateMenu from 'src/components/Timeline/TimelineCreateMenu';
import TimelineList from 'src/components/Timeline/TimelineList';


import './TimelineIndexScreen.scss';

const messages = defineMessages({
  title: {
    id: 'timelines.title',
    defaultMessage: 'Timelines',
  },
  no_results_title: {
    id: 'timelines.no_results_title',
    defaultMessage: 'You do not have any timelines yet',
  },
});

export class TimelineIndexScreen extends Component {
  constructor(props) {
    super(props);
    this.getMoreResults = this.getMoreResults.bind(this);
  }

  componentDidMount() {
    this.fetchIfNeeded();
  }

  componentDidUpdate(prevProps) {
    const { result } = this.props;

    if (result.shouldLoad && !prevProps.result.shouldLoad) {
      this.fetchIfNeeded();
    }
  }

  getMoreResults() {
    const { query, result } = this.props;
    if (result && !result.isLoading && result.next && !result.isError) {
      this.props.queryTimelines({ query, next: result.next });
    }
  }

  fetchIfNeeded() {
    const { result, query } = this.props;
    if (!result.isLoading) {
      this.props.queryTimelines({ query });
    }
  }

  render() {
    const { intl, result } = this.props;

    if (result.isError) {
      return <ErrorScreen error={result.error} />;
    }

    const breadcrumbs = (
      <Breadcrumbs>
        <li>
          <FormattedMessage
            id="timelines.browser.breadcrumb"
            defaultMessage="Timelines"
          />
        </li>
      </Breadcrumbs>
    );

    return (
      <Screen
        className="TimelineIndexScreen"
        breadcrumbs={breadcrumbs}
        title={intl.formatMessage(messages.title)}
        requireSession
      >
        <Dashboard>
          <div className="Dashboard__title-container">
            <h5 className="Dashboard__title">{intl.formatMessage(messages.title)}</h5>
            <p className="Dashboard__subheading">
              <FormattedMessage
                id="timeline.description"
                defaultMessage="Timelines let you store and search investigation insights."
              />
            </p>
            <div className="Dashboard__actions">
              <TimelineCreateMenu />
            </div>
          </div>
          { result.isLoading && !result.results?.length && (
            <SectionLoading />
          )}
          { result.results && (
            <TimelineList
              items={result.results}
              getMoreItems={this.getMoreResults}
              showCollection
            />
          )}
        </Dashboard>
      </Screen>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { location } = ownProps;
  const query = Query.fromLocation('timelines', location, {}, 'timelines')
    .sortBy('updated_at', 'desc');

  const result = selectTimelinesResult(state, query);

  return {
    query,
    result,
  };
};


export default compose(
  connect(mapStateToProps, { queryTimelines }),
  injectIntl,
)(TimelineIndexScreen);
