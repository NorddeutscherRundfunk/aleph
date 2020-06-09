import React  from 'react';
import { withRouter } from 'react-router';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Button } from '@blueprintjs/core';
import { defineMessages, injectIntl } from 'react-intl';
import Query from 'src/app/Query';

import { queryTimelines } from 'src/actions';
import { selectTimelinesResult } from 'src/selectors';
import AddTimelineEventDialog from 'src/components/Timeline/AddTimelineEventDialog';
import TimelineSelect from './TimelineSelect';

const messages = defineMessages({
  button_label: {
    id: 'timeline.button.add_event',
    defaultMessage: 'Add timeline event',
  },
  label_timeline: {
    id: 'timeline.form.label_timeline',
    defaultMessage: 'Select a timeline',
  },
  no_timelines: {
    id: 'timeline.event.edit.no_timelines',
    defaultMessage: `
      You don't have write access to any timelines. Please ask someone to invite you
      to an existing timeline, or create your own timeline in your personal datasets.`,
  },
});


export class AddTimelineEvent extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleTimelineSelect = this.handleTimelineSelect.bind(this);
    this.toggleDialog = this.toggleDialog.bind(this);
  }

  componentDidMount() {
    this.fetchIfNeeded();
  }

  fetchIfNeeded() {
    const { timelines, query } = this.props;
    if (!timelines.isLoading) {
      this.props.queryTimelines({ query });
    }
  }

  handleTimelineSelect(timeline) {
    this.setState({ timeline });
  }

  toggleDialog() {
    const { dialogIsOpen } = this.state;
    this.setState({ dialogIsOpen: !dialogIsOpen });
  }

  render() {
    const { intl, document, timelines } = this.props;
    const writeableTimelines = timelines.results.filter(t => t.writeable);
    const { timeline = writeableTimelines[0], dialogIsOpen } = this.state;

    return (
      <>
        <Button
          icon="new-object"
          text={intl.formatMessage(messages.button_label)}
          className="bp3-button bp3-intent-primary"
          onClick={this.toggleDialog}
        />
        {writeableTimelines.length > 0 ? (
          <>
            <TimelineSelect
              id="timeline-select"
              timelines={writeableTimelines}
              handleTimelineSelect={this.handleTimelineSelect}
              selectedTimeline={timeline}
            />
            {timeline && (
              <AddTimelineEventDialog
                document={document}
                timeline={timeline}
                toggleDialog={this.toggleDialog}
                isOpen={dialogIsOpen}
              />
            )}
          </>
        ) : (
          <span className="AddTimelineEvent__no-timelines">
            {intl.formatMessage(messages.no_timelines)}
          </span>
        )}
      </>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { location } = ownProps;
  const query = Query.fromLocation(
    'timelines',
    location,
    {},
    'timelines',
  ).sortBy('updated_at', 'desc');
  // filter for write access is handled later
  const timelines = selectTimelinesResult(state, query);

  return {
    query,
    timelines,
  };
};

const mapDispatchToProps = { queryTimelines };

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
  injectIntl
)(AddTimelineEvent);
