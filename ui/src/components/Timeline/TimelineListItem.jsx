import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { Card, Icon, H4 } from '@blueprintjs/core';
import getTimelineLink from 'src/util/getTimelineLink';

import {
  Collection, Date, Timeline, Summary,
} from 'src/components/common';

import './TimelineListItem.scss';

const TimelineListItem = ({ timeline, showCollection }) => (
  <div className="TimelineListItem" key={timeline.id}>
    <Link className="TimelineListItem__link" to={getTimelineLink(timeline)}>
      <Card elevation={1} className="TimelineListItem__content">
        {showCollection && (
          <div className="TimelineListItem__collection">
            <Collection.Label collection={timeline.collection} className="bp3-text-muted" />
          </div>
        )}
        <Icon className="TimelineListItem__icon" icon="timeline-events" iconSize={42} />
        <H4>
          <Timeline.Label timeline={timeline} />
        </H4>
        {timeline.summary && (
          <Summary text={timeline.summary} className="summary" truncate={2} />
        )}
        <p className="details">
          <span className="details-item">
            <Icon icon="time" iconSize={14} />
            <FormattedMessage
              id="timeline.last_updated"
              defaultMessage="Updated {date}"
              values={{
                date: <Date value={timeline.updated_at} />,
              }}
            />
          </span>
        </p>
      </Card>
    </Link>
  </div>
);

export default TimelineListItem;
