import React, { PureComponent } from 'react';
import { Timeline } from 'src/components/common';

import './TimelineHeading.scss';

class TimelineHeading extends PureComponent {
  render() {
    const { timeline } = this.props;
    return (
      <div className="TimelineHeading">
        <h1 itemProp="name" className="TimelineHeading__title">
          <Timeline.Label timeline={timeline} label />
        </h1>
        <div className="TimelineHeading__description">
          {timeline.summary}
        </div>
      </div>
    );
  }
}

export default TimelineHeading;
