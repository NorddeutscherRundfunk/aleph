import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { compose } from 'redux';
import { DateRangePicker } from "@blueprintjs/datetime";
import { Button, Collapse, Icon, Intent } from '@blueprintjs/core';

import '@blueprintjs/datetime/src/blueprint-datetime.scss';
import './DateRangeQuery.scss';

const messages = defineMessages({
  label_title: {
    id: 'timeline.daterangequery.label_title',
    defaultMessage: 'Filter dates',
  },
});

const MIN_DATE = new Date('1800-01-01')

export class DateRangeQuery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: new Date(),
      endDate: new Date(),
      isOpen: false,
    };

    this.onChange = this.onChange.bind(this);
    this.renderButtonText = this.renderButtonText.bind(this);
    this.handleCollapse = this.handleCollapse.bind(this);
    this.handleUpdateQuery = this.handleUpdateQuery.bind(this);
  }

  onChange([startDate, endDate]) {
    this.setState({ startDate, endDate });
  }

  handleCollapse() {
    const { isOpen } = this.state;
    this.setState({ isOpen: !isOpen });
  }

  handleUpdateQuery() {
    const { query, updateQuery } = this.props;
    const { startDate, endDate } = this.state;
    let newQuery = query;
    newQuery = newQuery.clearFilter('dates__gte')
    newQuery = newQuery.clearFilter('dates__lte')
    if (startDate) {
      newQuery = newQuery.setFilter('dates__gte', startDate.toISOString().substring(0, 10));
    }
    if (endDate) {
      newQuery = newQuery.setFilter('dates__lte', endDate.toISOString().substring(0, 10));
    }
    updateQuery(newQuery);
  }

  renderButtonText() {
    const { startDate, endDate } = this.state;
    if (startDate && endDate && startDate !== endDate) {
      return `Search from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`;
    } else if (startDate) {
      return `Search starting from ${startDate.toLocaleDateString()}`;
    }
    return `Select dates`
  }

  render() {
    const { intl } = this.props;
    const { startDate, endDate, isOpen } = this.state;
    const disabled = !startDate;
    const intent = startDate ? Intent.PRIMARY : null;

    return (
      <div className="DateRangeQuery">
        <h3 className="DateRangeQuery__title" onClick={this.handleCollapse}>
          {intl.formatMessage(messages.label_title)}
          <Icon icon={`chevron-${isOpen ? 'up' : 'down'}`} iconsize={20} />
        </h3>
        <Collapse isOpen={isOpen} keepChildrenMounted>
          <DateRangePicker
            contiguousCalendarMonths={false}
            minDate={MIN_DATE}
            onChange={this.onChange}
            value={[startDate, endDate]}
          />
          <Button
            intent={intent}
            disabled={disabled}
            text={this.renderButtonText()}
            onClick={this.handleUpdateQuery}
          />
        </Collapse>
      </div>
    )
  }

}

export default compose(injectIntl)(DateRangeQuery);
