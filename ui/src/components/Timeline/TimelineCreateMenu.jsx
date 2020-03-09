import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl';
import { Button, ButtonGroup, Intent, Position, Tooltip } from '@blueprintjs/core';
import { selectSession } from 'src/selectors';

import TimelineCreateDialog from 'src/dialogs/TimelineCreateDialog/TimelineCreateDialog';

const messages = defineMessages({
  login: {
    id: 'timeline.create.login',
    defaultMessage: 'You must log in to create a timeline',
  },
});

class TimelineCreateMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      importEnabled: false,
    };
    this.toggleDialog = this.toggleDialog.bind(this);
  }

  toggleDialog = (importEnabled) => this.setState(({ isOpen }) => (
    { isOpen: !isOpen, importEnabled }
  ));

  render() {
    const { collection, intl, session } = this.props;
    const {
      isOpen, importEnabled,
    } = this.state;
    const canAdd = session?.loggedIn;

    const buttonContent = (
      <ButtonGroup>
        <Button onClick={() => this.toggleDialog(false)} icon="new-object" intent={Intent.PRIMARY} disabled={!canAdd}>
          <FormattedMessage id="timelines.index.create" defaultMessage="New timeline" />
        </Button>
      </ButtonGroup>
    );

    return (
      <>
        {canAdd ? buttonContent : (
          <Tooltip
            content={intl.formatMessage(messages.login)}
            position={Position.BOTTOM}
          >
            {buttonContent}
          </Tooltip>
        )}
        <TimelineCreateDialog
          importEnabled={importEnabled}
          isOpen={isOpen}
          toggleDialog={this.toggleDialog}
          timeline={{ collection }}
          canChangeCollection={!collection}
        />
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  session: selectSession(state),
});

export default compose(
  connect(mapStateToProps),
  injectIntl,
)(TimelineCreateMenu);
