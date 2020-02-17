import React, { Component } from 'react';
import { Alert, Intent } from '@blueprintjs/core';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { deleteTimeline } from 'src/actions';
import getCollectionLink from 'src/util/getCollectionLink';


const messages = defineMessages({
  button_confirm: {
    id: 'timeline.delete.confirm',
    defaultMessage: 'Delete',
  },
  button_cancel: {
    id: 'timeline.delete.cancel',
    defaultMessage: 'Cancel',
  },
});


class TimelineDeleteDialog extends Component {
  constructor(props) {
    super(props);
    this.onDelete = this.onDelete.bind(this);
  }

  async onDelete() {
    const { timeline, history } = this.props;
    await this.props.deleteTimeline(timeline.id);
    history.push({
      pathname: `${getCollectionLink(timeline.collection)}#mode=timelines`,
    });
  }

  render() {
    const { intl } = this.props;
    return (
      <Alert
        isOpen={this.props.isOpen}
        icon="trash"
        intent={Intent.DANGER}
        cancelButtonText={intl.formatMessage(messages.button_cancel)}
        confirmButtonText={intl.formatMessage(messages.button_confirm)}
        onCancel={this.props.toggleDialog}
        onConfirm={this.onDelete}
      >
        <FormattedMessage
          id="timeline.delete.question"
          defaultMessage="Are you sure you want to delete this timeline?"
        />
      </Alert>
    );
  }
}

const mapDispatchToProps = { deleteTimeline };

export default compose(
  withRouter,
  connect(null, mapDispatchToProps),
  injectIntl,
)(TimelineDeleteDialog);
