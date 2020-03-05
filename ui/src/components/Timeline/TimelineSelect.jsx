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
    return (
      <Select
        items={timelines}
        itemRenderer={timelineItemRenderer}
        itemPredicate={itemPredicate}
        onItemSelect={handleTimelineSelect}
        activeItem={selectedTimeline}
        filterable={filterable}
      >
        <Button
          text={timelineLabel(selectedTimeline)}
          rightIcon="double-caret-vertical"
          disabled={disabled}
        />
      </Select>
    );
  }
}
