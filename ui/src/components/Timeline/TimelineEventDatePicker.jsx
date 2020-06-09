import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { compose } from 'redux';
import { Switch } from '@blueprintjs/core';

import './TimelineEventDatePicker.scss';

const messages = defineMessages({
  label_solo: {
    id: 'timeline.datepicker.label_solo',
    defaultMessage: 'Single date',
  },
  label_range: {
    id: 'timeline.datepicker.label_range',
    defaultMessage: 'Date range',
  },
  label_start: {
    id: 'timeline.datepicker.label_start',
    defaultMessage: 'Start date',
  },
  label_end: {
    id: 'timeline.datepicker.label_end',
    defaultMessage: 'End date',
  },
  help_toggle: {
    id: 'timeline.datepicker.help_toggle',
    defaultMessage: 'You can switch between a fixed date and a date range',
  },
});

class TimelineEventDatePicker extends Component {
  constructor(props) {
    super(props);
    const { entity } = props;
    this.state = {
      solo: !(entity.getProperty('startDate').length && entity.getProperty('endDate').length),
    };

    this.toggleSolo = this.toggleSolo.bind(this);
  }

  toggleSolo() {
    this.setState(({ solo }) => ({ solo: !solo }));
  }


  render() {
    const { intl, renderProperty } = this.props;
    const { solo } = this.state;
    return (
      <div className="TimelineEventDatePicker">
        <div className="TimelineEventDatePicker__toggle">
          <span>{intl.formatMessage(messages.help_toggle)}</span>
          <div className="TimelineEventDatePicker__switch">
            <Switch
              checked={!solo}
              onChange={this.toggleSolo}
              innerLabel={intl.formatMessage(
                messages[`label_${solo ? 'solo' : 'range'}`],
              )}
              large
            />
          </div>
        </div>
        {solo ? (
          <div className="TimelineEventDatePicker__solo-date">
            <span>{intl.formatMessage(messages.label_solo)}</span>
            {renderProperty('date')}
          </div>
        ) : (
          <div className="TimelineEventDatePicker__date-range">
            <div className="TimelineEventDatePicker__start">
              <span>{intl.formatMessage(messages.label_start)}</span>
              {renderProperty('startDate')}
            </div>
            <div className="TimelineEventDatePicker__end">
              <span>{intl.formatMessage(messages.label_end)}</span>
              {renderProperty('endDate')}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default compose(injectIntl)(TimelineEventDatePicker);
