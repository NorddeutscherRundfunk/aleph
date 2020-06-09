import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Prompt, withRouter } from 'react-router';
import queryString from 'query-string';
import { Intent } from '@blueprintjs/core';

import { fetchTimeline } from 'src/actions';
import { selectTimeline } from 'src/selectors';
import TimelineManageMenu from 'src/components/Timeline/TimelineManageMenu';
import LoadingScreen from 'src/components/Screen/LoadingScreen';
import ErrorScreen from 'src/components/Screen/ErrorScreen';
import timelineUpdateStates from 'src/components/Timeline/timelineUpdateStates';

import TimelineScreenInner from './TimelineScreenInner';

const messages = defineMessages({
  status_success: {
    id: 'timeline.status_success',
    defaultMessage: 'Saved',
  },
  status_error: {
    id: 'timeline.status_error',
    defaultMessage: 'Error saving',
  },
  status_in_progress: {
    id: 'timeline.status_in_progress',
    defaultMessage: 'Saving...',
  },
  error_warning: {
    id: 'timeline.error_warning',
    defaultMessage: 'There was an error saving your latest changes, are you sure you want to leave?',
  },
  in_progress_warning: {
    id: 'timeline.in_progress_warning',
    defaultMessage: 'Changes are still being saved, are you sure you want to leave?',
  },
});

export class TimelineScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      updateStatus: null,
    };

    this.onCollectionSearch = this.onCollectionSearch.bind(this);
    this.onStatusChange = this.onStatusChange.bind(this);
  }

  componentDidMount() {
    this.fetchIfNeeded();
  }

  onCollectionSearch(queryText) {
    const { history, timeline } = this.props;
    const query = {
      q: queryText,
      'filter:collection_id': timeline.collection.id,
    };
    history.push({
      pathname: '/search',
      search: queryString.stringify(query),
    });
  }

  onStatusChange(updateStatus) {
    this.setState({ updateStatus });
  }

  fetchIfNeeded() {
    const { timeline, timelineId } = this.props;

    if (timeline.shouldLoad) {
      this.props.fetchTimeline(timelineId);
    }
  }

  formatStatus() {
    const { intl } = this.props;
    const { updateStatus } = this.state;

    switch (updateStatus) {
      case timelineUpdateStates.IN_PROGRESS:
        return { text: intl.formatMessage(messages.status_in_progress), intent: Intent.PRIMARY };
      case timelineUpdateStates.ERROR:
        return { text: intl.formatMessage(messages.status_error), intent: Intent.DANGER };
      default:
        return { text: intl.formatMessage(messages.status_success), intent: Intent.SUCCESS };
    }
  }

  render() {
    const { timeline, intl } = this.props;
    const { updateStatus } = this.state;

    if (timeline.isError) {
      return <ErrorScreen error={timeline.error} />;
    }

    if (!timeline.id) {
      return <LoadingScreen />;
    }

    const operation = (
      <TimelineManageMenu timeline={timeline} />
    );

    const status = this.formatStatus();

    return (
      <>
        <Prompt
          when={updateStatus === timelineUpdateStates.IN_PROGRESS}
          message={intl.formatMessage(messages.in_progress_warning)}
        />
        <Prompt
          when={updateStatus === timelineUpdateStates.ERROR}
          message={intl.formatMessage(messages.error_warning)}
        />
        <TimelineScreenInner
          onStatusChange={this.onStatusChange}
          collection={timeline.collection}
          timeline={timeline}
          timelineOperations={operation}
          timelineStatus={status}
        />
      </>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { timelineId } = ownProps.match.params;

  return {
    timelineId,
    timeline: selectTimeline(state, timelineId),
  };
};


export default compose(
  withRouter,
  injectIntl,
  connect(mapStateToProps, { fetchTimeline }),
)(TimelineScreen);
