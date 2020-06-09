import React, { Component } from 'react';
import { Dialog } from '@blueprintjs/core';
import { defineMessages, injectIntl } from 'react-intl';
import { compose } from 'redux';

import { showSuccessToast, showWarningToast } from 'src/app/toast';

import TimelineEventForm from './TimelineEventForm';

import './EditTimelineEventDialog.scss';

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
    defaultMessage: 'Edit timeline entry',
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

export class EditTimelineEventDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      blocking: false,
    };

    this.onSave = this.onSave.bind(this);
  }

  async onSave(data) {
    const { intl } = this.props;
    const { blocking } = this.state;
    const { entity } = data;
    if (blocking) return;
    this.setState({ blocking: true });

    try {
      await this.props.entityManager.updateEntity(entity);
      showSuccessToast(intl.formatMessage(messages.save_success));
      this.props.toggleDialog();
    } catch (e) {
      showWarningToast(e.message);
      this.setState({ blocking: false });
    }
  }

  render() {
    const { intl, entity, isOpen, toggleDialog, timeline, entityManager } = this.props;
    const { blocking } = this.state;

    return (
      <Dialog
        className="EditTimelineEventDialog"
        icon="timeline-events"
        isOpen={isOpen}
        onClose={toggleDialog}
        title={intl.formatMessage(messages.title)}
      >
        <div className="bp3-dialog-body">
          {entity && (
            <TimelineEventForm
              timeline={timeline}
              entity={entity}
              onSave={this.onSave}
              blocking={blocking}
              entityManager={entityManager}
            />
          )}
        </div>
      </Dialog>
    );
  }
}


export default compose(
  injectIntl,
)(EditTimelineEventDialog);
