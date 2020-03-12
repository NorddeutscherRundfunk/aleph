import React, { Component } from 'react';
import { Dialog } from '@blueprintjs/core';
import { defineMessages, injectIntl } from 'react-intl';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { showSuccessToast, showWarningToast } from 'src/app/toast';
import { updateEntity } from 'src/actions';

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
    const { intl, entity } = this.props;
    const { blocking } = this.state;
    if (blocking) return;
    this.setState({ blocking: true });

    // FIXME ftm implementation?
    [...entity.properties.keys()].map(prop => { // eslint-disable-line
      if (prop.name in data) {
        entity.properties.set(prop, [data[prop.name]]);
        delete data[prop.name];
      }
    });
    // add remaining data
    Object.keys(data).map(key => { // eslint-disable-line
      try {
        entity.setProperty(key, data[key]);
      } catch (e) { // schema error
        console.log(key, data[key], e.message);  // eslint-disable-line
      }
    });

    try {
      await this.props.updateEntity({ entity, collectionId: entity.collection.id });
      showSuccessToast(intl.formatMessage(messages.save_success));
      this.props.toggleDialog();
    } catch (e) {
      showWarningToast(e.message);
      this.setState({ blocking: false });
    }
  }

  render() {
    const { intl, entity, isOpen, toggleDialog } = this.props;
    const { blocking } = this.state;

    // FIXME
    const data = {};
    [...entity.properties.keys()].map(prop => { // eslint-disable-line
      data[prop.name] = entity.getFirst(prop.name);
    });
    return (
      <Dialog
        className="EditTimelineEventDialog"
        icon="timeline-events"
        isOpen={isOpen}
        onClose={toggleDialog}
        title={intl.formatMessage(messages.title)}
      >
        <div className="bp3-dialog-body">
          {data && (
            <TimelineEventForm
              data={data}
              onSave={this.onSave}
              blocking={blocking}
            />
          )}
        </div>
      </Dialog>
    );
  }
}

export default compose(
  connect(undefined, { updateEntity }),
  injectIntl,
)(EditTimelineEventDialog);
