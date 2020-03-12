import React, { Component } from 'react';
import { Tag } from '@blueprintjs/core';
// import { Entity } from 'src/components/common';

import './TimelineEventInvolvedEntities.scss';

const renderEntity = (entity, selected, onClick) => (
  <Tag
    className="TimelineEventInvolvedEntities__tag"
    active={selected}
    intent={selected ? 'primary' : null}
    key={entity}
    onClick={onClick}
    minimal
    interactive
  >
    {/* <Entity entity={entity} /> */}
    <span>{entity}</span>
  </Tag>
);

export default class TimelineEventInvolvedEntities extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: props.selectedEntities || [],
    };

    this.handleEntityToggle = this.handleEntityToggle.bind(this);
  }

  handleEntityToggle(entity) {
    const { selected } = this.state;
    const { onChange } = this.props;
    const ix = selected.indexOf(entity);
    if (ix > -1) {
      selected.splice(ix, 1);
    } else {
      selected.push(entity);
    }
    this.setState({ selected });
    if (onChange) onChange(selected);
  }

  render() {
    const { entities } = this.props;
    const { selected } = this.state;
    return (
      <div className="TimelineEventInvolvedEntities">
        {entities.map(entity => renderEntity(
          entity,
          selected.indexOf(entity) > -1,
          () => this.handleEntityToggle(entity),
        ))}
      </div>
    );
  }
}
