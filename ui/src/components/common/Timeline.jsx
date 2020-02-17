import React, { PureComponent } from 'react';
import { Icon } from '@blueprintjs/core';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';
import c from 'classnames';
import getTimelineLink from 'src/util/getTimelineLink';

class TimelineLabel extends PureComponent {
  render() {
    const { timeline, icon } = this.props;
    if (!timeline || !timeline.id) {
      return null;
    }

    return (
      <span className="TimelineLabel" title={timeline.label}>
        {icon && <Icon icon="timeline-events" className="left-icon" />}
        <span>{timeline.label}</span>
      </span>
    );
  }
}

class TimelineLink extends PureComponent {
  render() {
    const { timeline, className } = this.props;
    const content = <Timeline.Label {...this.props} />;

    return (
      <Link
        to={getTimelineLink(timeline)}
        className={c('TimelineLink', className)}
      >
        {content}
      </Link>
    );
  }
}

class Timeline {
  static Label = TimelineLabel;

  static Link = withRouter(TimelineLink);
}

export default Timeline;
