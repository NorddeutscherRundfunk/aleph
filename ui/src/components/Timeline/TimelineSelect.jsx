import React, { Component } from 'react';
import { MenuItem, Button } from '@blueprintjs/core';
import { Select } from '@blueprintjs/select';


const timelineLabel = ({ label, collection }) => (
  <>
    { collection.label }
    :&nbsp;
    <strong>{ label }</strong>
  </>
);

const timelineItemRenderer = (timeline, { handleClick }) => (
  <MenuItem
    style={{ maxWidth: '60vw' }}
    key={timeline.id}
    text={timelineLabel(timeline)}
    onClick={handleClick}
  />
);

const itemPredicate = (q, item) => item.label.toLowerCase().indexOf(q.toLowerCase()) > -1;

export default class TimelineSelect extends Component {
  render() {
    const { timelines, handleTimelineSelect, selectedTimeline } = this.props;
    const disabled = timelines.length === 1;
    const filterable = timelines.length > 7;
    const activeItem = selectedTimeline || timelines[0];
    return (
      <Select
        items={timelines}
        itemRenderer={timelineItemRenderer}
        itemPredicate={itemPredicate}
        onItemSelect={handleTimelineSelect}
        activeItem={activeItem}
        filterable={filterable}
      >
        <Button
          text={timelineLabel(activeItem)}
          rightIcon="double-caret-vertical"
          disabled={disabled}
        />
      </Select>
    );
  }
}
