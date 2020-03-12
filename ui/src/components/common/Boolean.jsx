import React, { PureComponent } from 'react';
import { Icon } from '@blueprintjs/core';

class Boolean extends PureComponent {
  render() {
    const { value } = this.props;
    return value ? <Icon icon="small-tick" /> : null;
  }
}

export default Boolean;
