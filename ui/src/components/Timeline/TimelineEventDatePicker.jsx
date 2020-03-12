import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { compose } from 'redux';
import { Switch, Tag } from '@blueprintjs/core';
import { FuzzyDatePicker } from 'src/components/common';

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
  start: {
    id: 'timeline.datepicker.start',
    defaultMessage: 'Start',
  },
  end: {
    id: 'timeline.datepicker.end',
    defaultMessage: 'End',
  },
  empty: {
    id: 'timeline.datepicker.empty',
    defaultMessage: 'No date(s) selected',
  },
  from: {
    id: 'timeline.datepicker.from',
    defaultMessage: 'From',
  },
  to: {
    id: 'timeline.datepicker.to',
    defaultMessage: 'To',
  },
});

class TimelineEventDatePicker extends Component {
  constructor(props) {
    super(props);
    const { startDate, endDate } = props;
    this.state = {
      solo: !(startDate && endDate),
    };

    this.toggleSolo = this.toggleSolo.bind(this);
  }

  toggleSolo() {
    this.setState(({ solo }) => ({ solo: !solo }));
  }

  handleChange(prefix, { value, localizedValue }) {
    const data = this.state;
    data[`${prefix}Local`] = localizedValue;
    this.setState(data);
    const parentData = {};
    parentData[prefix] = value;
    this.props.onChange(parentData);
  }

  renderDateRange() {
    const { intl } = this.props;
    const { solo, dateLocal, startDateLocal, endDateLocal } = this.state;
    const start = intl.formatMessage(messages.start);
    const end = intl.formatMessage(messages.end);
    const from = intl.formatMessage(messages.from);
    const to = intl.formatMessage(messages.to);
    const tag = text => <Tag large>{text}</Tag>;

    if (dateLocal && solo) {
      return tag(dateLocal);
    }
    if (startDateLocal && endDateLocal) {
      return <>{from}: {tag(startDateLocal)} {to}: {tag(endDateLocal)}</>; // eslint-disable-line
    }
    if (startDateLocal) {
      return <>{start}: {tag(startDateLocal)}</>; // eslint-disable-line
    }
    if (endDateLocal) {
      return <>{end}: {tag(endDateLocal)}</>; // eslint-disable-line
    }
    return <em>{intl.formatMessage(messages.empty)}</em>;
  }

  render() {
    const { intl, date, startDate, endDate } = this.props;
    const { solo } = this.state;
    return (
      <div className="TimelineEventDatePicker">
        <span className="TimelineEventDatePicker__value">
          {this.renderDateRange()}
        </span>
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
            <FuzzyDatePicker
              title={intl.formatMessage(messages.label_solo)}
              value={date}
              onChange={(data) => this.handleChange('date', data)}
            />
          </div>
        ) : (
          <div className="TimelineEventDatePicker__date-range">
            <FuzzyDatePicker
              title={intl.formatMessage(messages.label_start)}
              value={startDate}
              onChange={(data) => this.handleChange('startDate', data)}
            />
            <FuzzyDatePicker
              title={intl.formatMessage(messages.label_end)}
              value={endDate}
              onChange={(data) => this.handleChange('endDate', data)}
            />
          </div>
        )}
      </div>
    );
  }
}

export default compose(injectIntl)(TimelineEventDatePicker);
