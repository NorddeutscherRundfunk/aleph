import React, { Component } from 'react';
import { Dialog } from '@blueprintjs/core';
import { defineMessages, injectIntl } from 'react-intl';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { showSuccessToast, showWarningToast } from 'src/app/toast';
import { updateTimeline } from 'src/actions';
import entityEditorWrapper from 'src/components/Entity/entityEditorWrapper';

import TimelineEventForm from './TimelineEventForm';

import './AddTimelineEventDialog.scss';

const messages = defineMessages({
  title: {
    id: 'timeline.event.edit.title',
    defaultMessage: 'New timeline entry',
  },
  save_success: {
    id: 'timeline.event.edit.save_success',
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

  async onSave({ entity }) {
    const { intl, timeline } = this.props;
    const { blocking } = this.state;
    if (blocking) return;
    this.setState({ blocking: true });

    try {
      this.props.createEntity({ entity, collection_id: timeline.collection.id });
      const entities = timeline.entities ? timeline.entities.map((e) => e.id) : [];
      timeline.entities = [...entities, entity.id];
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

  render() {
    const { intl, isOpen, toggleDialog, timeline, entityManager } = this.props;
    const { blocking } = this.state;
    return (
      <Dialog
        className="AddTimelineEventDialog"
        icon="timeline-events"
        isOpen={isOpen}
        onClose={toggleDialog}
        title={intl.formatMessage(messages.title)}
      >
        <div className="bp3-dialog-body">
          <TimelineEventForm
            timeline={timeline}
            onSave={this.onSave}
            blocking={blocking}
            entityManager={entityManager}
            isNew
          />
        </div>
      </Dialog>
    );
  }
}


const mapStateToProps = (state, ownProps) => {
  return { collection: ownProps.timeline.collection };
}


export default compose(
  connect(mapStateToProps, { updateTimeline }),
  injectIntl,
  entityEditorWrapper,
)(AddTimelineEventDialog);
