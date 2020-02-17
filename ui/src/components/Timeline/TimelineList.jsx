import React, { Component } from 'react';
import { Waypoint } from 'react-waypoint';
import TimelineListItem from 'src/components/Timeline/TimelineListItem';

import './TimelineList.scss';

class TimelineList extends Component {
  render() {
    const { getMoreItems, items, showCollection } = this.props;

    return (
      <div className="TimelineList">
        <div className="TimelineList__items">
          {items.map((timeline) => (
            <TimelineListItem
              key={timeline.id}
              timeline={timeline}
              showCollection={showCollection}
            />
          ))}
        </div>
        <Waypoint
          onEnter={getMoreItems}
          bottomOffset="0"
          scrollableAncestor={window}
        />
      </div>
    );
  }
}

export default TimelineList;
