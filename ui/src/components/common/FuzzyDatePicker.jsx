import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { compose } from 'redux';
import { Tag } from '@blueprintjs/core';
import { DatePicker, TimePrecision } from '@blueprintjs/datetime';
import toDate from 'src/util/toDate';

import './FuzzyDatePicker.scss';

const messages = defineMessages({
  help_precision: {
    id: 'fuzzydatepicker.help_precision',
    defaultMessage:
      "Toggle the precision if you don't have an exact date.",
  },
  precision_month: {
    id: 'fuzzydatepicker.precision_month',
    defaultMessage: 'Month',
  },
  precision_day: {
    id: 'fuzzydatepicker.precision_day',
    defaultMessage: 'Day',
  },
  precision_time: {
    id: 'fuzzydatepicker.precision_time',
    defaultMessage: 'Time',
  },
});

const PRECISIONS = ['month', 'day', 'time'];

const FuzzyDatePrecision = ({ precisions, onToggle, intl }) => (
  <div className="FuzzyDatePrecision">
    {Object.keys(precisions).map((precision) => (
      <Tag
        className="FuzzyDatePrecision__tag"
        key={precision}
        active={precisions[precision]}
        intent={precisions[precision] ? 'primary' : null}
        onClick={() => onToggle(precision)}
        minimal
        interactive
      >
        {intl.formatMessage(messages[`precision_${precision}`])}
      </Tag>
    ))}
    <span className="bp3-form-helper-text">
      {intl.formatMessage(messages.help_precision)}
    </span>
  </div>
);

class FuzzyDatePicker extends Component {
  constructor(props) {
    super(props);
    const { value } = props;
    const date = toDate(value);
    this.state = {
      value,
      date,
      localizedValue: this.toString({ date, localized: true }),
      month: true,
      day: true,
      time: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.togglePrecision = this.togglePrecision.bind(this);
    this.toString = this.toString.bind(this);
    this.getValues = this.getValues.bind(this);
  }

  getValues(data) {
    return {
      value: this.toString(data),
      localizedValue: this.toString({ ...data, localize: true }),
    };
  }

  handleChange(date) {
    const values = this.getValues({ date });
    this.setState({ date, ...values });
    const { onChange } = this.props;
    if (onChange) onChange(values);
  }

  togglePrecision(precision) {
    const data = this.state;
    const toggleOn = !data[precision];
    if (toggleOn) {
      // toggle PRECISIONS upwards ON
      const reversedPrecisions = PRECISIONS.slice(0).reverse();
      const ix = reversedPrecisions.indexOf(precision);
      reversedPrecisions.slice(ix).map((prec) => { // eslint-disable-line
        data[prec] = toggleOn;
      });
    } else {
      // toggle PRECISIONS downwards OFF
      const ix = PRECISIONS.indexOf(precision);
      PRECISIONS.slice(ix).map((prec) => { // eslint-disable-line
        data[prec] = toggleOn;
      });
    }
    this.setState(data);
    const { onChange } = this.props;
    if (onChange) onChange(this.getValues(data));
  }

  toString(data) {
    // FIXME date handling / formatting in general...
    const { date, month, day, time, localize } = { ...this.state, ...data };
    if (date) {
      if (month && day && time) {
        return localize ? date.toLocaleString() : date.toISOString();
      }
      if (month && day) {
        return localize ? date.toLocaleDateString() : date.toISOString().substring(0, 10);
      }
      if (month) {
        return `${date.getFullYear()}-${date.getMonth() + 1}`;
      }
      return date.getFullYear().toString();
    }
    return '';
  }

  render() {
    const { intl, title } = this.props;
    const { date, month, day, time } = this.state;
    const timePrecision = time ? TimePrecision.MINUTE : null;
    return (
      <div className="FuzzyDatePicker">
        <span className="FuzzyDatePicker__title">{title}</span>
        <FuzzyDatePrecision
          onToggle={this.togglePrecision}
          precisions={{ month, day, time }}
          intl={intl}
        />
        <DatePicker
          date={date}
          onChange={this.handleChange}
          timePrecision={timePrecision}
        />
      </div>
    );
  }
}

export default compose(injectIntl)(FuzzyDatePicker);
