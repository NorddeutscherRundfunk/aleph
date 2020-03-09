import React, { Component } from 'react';
import { Dialog } from '@blueprintjs/core';
import { defineMessages, injectIntl } from 'react-intl';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { showSuccessToast, showWarningToast } from 'src/app/toast';
import Query from 'src/app/Query';
import { queryTimelines, updateTimeline, createEntity } from 'src/actions';
import { selectTimelinesResult, selectModel } from 'src/selectors';

import TimelineEventForm from './TimelineEventForm';
import { getEntity } from './util';

import './AddTimelineEventDialog.scss';

const messages = defineMessages({
  placeholder_title: {
    id: 'timeline.edit.info.placeholder_title',
    defaultMessage: 'A title',
  },
  placeholder_summary: {
    id: 'timeline.edit.info.placeholder_summary',
    defaultMessage: 'A brief summary',
  },
  important_flag: {
    id: 'timeline.edit.info.important_flag',
    defaultMessage: 'Important entry',
  },
  title: {
    id: 'timeline.edit.title',
    defaultMessage: 'New timeline entry',
  },
  cancel_button: {
    id: 'timeline.edit.info.cancel',
    defaultMessage: 'Cancel',
  },
  save_button: {
    id: 'timeline.edit.info.save',
    defaultMessage: 'Save changes',
  },
  save_success: {
    id: 'timeline.edit.save_success',
    defaultMessage: 'Your changes are saved.',
  },
});

export class AddTimelineEventDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      blocking: false,
    };

    this.onSave = this.onSave.bind(this);
  }

  componentDidMount() {
    this.fetchIfNeeded();
  }

  componentDidUpdate(prevProps) {
    const { timelines } = this.props;

    if (timelines.shouldLoad && !prevProps.timelines.shouldLoad) {
      this.fetchIfNeeded();
    }
  }

  async onSave(timelineEvent) {
    const { intl, model } = this.props;
    const { blocking } = this.state;
    if (blocking) return;
    this.setState({ blocking: true });

    const { timeline } = timelineEvent;
    const entity = getEntity(
      model,
      timelineEvent,
      timelineEvent.timeline.collection,
    );

    // FIXME implementation?
    try {
      const entityData = await this.props.createEntity(entity);
      const entities = timeline.entities ? timeline.entities.map((e) => e.id) : [];
      timeline.entities = [...entities, entityData.id];
      try {
        await this.props.updateTimeline(timeline.id, timeline);
        showSuccessToast(intl.formatMessage(messages.save_success));
        this.setState({ blocking: false });
        this.props.toggleDialog();
      } catch (e) {
        showWarningToast(e.message);
        this.setState({ blocking: false });
      }
    } catch (e) {
      showWarningToast(e.message);
      this.setState({ blocking: false });
    }
  }

  fetchIfNeeded() {
    const { timelines, query } = this.props;
    if (!timelines.isLoading) {
      this.props.queryTimelines({ query });
    }
  }

  render() {
    const { intl, document, timelines } = this.props;
    const { blocking } = this.state;
    return (
      <Dialog
        className="AddTimelineEventDialog"
        icon="timeline-events"
        isOpen={this.props.isOpen}
        onClose={this.props.toggleDialog}
        title={intl.formatMessage(messages.title)}
      >
        <div className="bp3-dialog-body">
          <TimelineEventForm
            timelines={timelines.results}
            document={document}
            onSave={this.onSave}
            blocking={blocking}
          />
        </div>
      </Dialog>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { location } = ownProps;
  const context = { 'filter:writeable': true };
  const query = Query.fromLocation(
    'timelines',
    location,
    context,
    'timelines',
  ).sortBy('updated_at', 'desc');

  const timelines = selectTimelinesResult(state, query);
  const model = selectModel(state);

  return {
    query,
    timelines,
    model,
  };
};

const mapDispatchToProps = { queryTimelines, createEntity, updateTimeline };

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  injectIntl,
)(AddTimelineEventDialog);
