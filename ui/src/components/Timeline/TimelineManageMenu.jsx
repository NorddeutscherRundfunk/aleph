import React, { Component } from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Button, ButtonGroup } from '@blueprintjs/core';

import TimelineEditDialog from 'src/dialogs/TimelineEditDialog/TimelineEditDialog';
import TimelineDeleteDialog from 'src/dialogs/TimelineDeleteDialog/TimelineDeleteDialog';


class TimelineManageMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editIsOpen: false,
      deleteIsOpen: false,
    };
    this.toggleEdit = this.toggleEdit.bind(this);
    this.toggleDelete = this.toggleDelete.bind(this);
  }

  toggleDelete = () => this.setState(({ deleteIsOpen }) => ({ deleteIsOpen: !deleteIsOpen }));

  toggleEdit = () => this.setState(({ editIsOpen }) => ({ editIsOpen: !editIsOpen }));

  render() {
    const { timeline } = this.props;
    const {
      editIsOpen, deleteIsOpen,
    } = this.state;

    if (!timeline.writeable) {
      return null;
    }

    return (
      <>
        <ButtonGroup>
          <Button icon="cog" onClick={this.toggleEdit}>
            <FormattedMessage id="timeline.info.edit" defaultMessage="Settings" />
          </Button>
          <Button icon="trash" onClick={this.toggleDelete}>
            <FormattedMessage id="timeline.info.delete" defaultMessage="Delete" />
          </Button>
        </ButtonGroup>
        <TimelineEditDialog
          timeline={timeline}
          isOpen={editIsOpen}
          toggleDialog={this.toggleEdit}
          canChangeCollection={false}
        />
        <TimelineDeleteDialog
          isOpen={deleteIsOpen}
          timeline={timeline}
          toggleDialog={this.toggleDelete}
        />
      </>
    );
  }
}

TimelineManageMenu = injectIntl(TimelineManageMenu);
export default TimelineManageMenu;
