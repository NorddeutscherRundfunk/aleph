import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { compose } from 'redux';
import { Checkbox, FormGroup, Button, Intent } from '@blueprintjs/core';

import TimelineSelect from './TimelineSelect';
import TimelineEventInvolvedEntities from './TimelineEventInvolvedEntities';
import TimelineEventDatePicker from './TimelineEventDatePicker';

import './TimelineEventForm.scss';

const messages = defineMessages({
  label_timeline: {
    id: 'timeline.form.label_timeline',
    defaultMessage: 'Timeline',
  },
  label_title: {
    id: 'timeline.form.label_title',
    defaultMessage: 'Title',
  },
  placeholder_title: {
    id: 'timeline.form.placeholder_title',
    defaultMessage: 'A title',
  },
  label_summary: {
    id: 'timeline.form.label_summary',
    defaultMessage: 'Summary',
  },
  placeholder_summary: {
    id: 'timeline.form.placeholder_summary',
    defaultMessage: 'A brief summary',
  },
  label_date: {
    id: 'timeline.form.label_date',
    defaultMessage: 'Date',
  },
  help_date: {
    id: 'timeline.form.help_date',
    defaultMessage: 'Click on a selected date to de-activate it.',
  },
  label_important: {
    id: 'timeline.form.label_important',
    defaultMessage: 'Important entry',
  },
  label_important_checkbox: {
    id: 'timeline.form.label_important_checkbox',
    defaultMessage: 'Indicate that this is a special entry',
  },
  label_involved: {
    id: 'timeline.form.label_involved',
    defaultMessage: 'Involved persons, companies and organisations',
  },
  help_involved: {
    id: 'timeline.form.help_involved',
    defaultMessage: 'Click on the items to select or deselect them. Selected items appear blue.',
  },
  save_button: {
    id: 'timeline.edit.info.save',
    defaultMessage: 'Save changes',
  },
});

// FIXME use EntityTags implementation?
const getPossibleInvolvedEntities = document => (
  [...document.getProperty('peopleMentioned'),
    ...document.getProperty('companiesMentioned')]
);

export class TimelineEventForm extends Component {
  constructor(props) {
    super(props);
    this.state = props.data || {
      timeline: props.timelines[0],
    };

    this.onFieldChange = this.onFieldChange.bind(this);
    this.handleBoolChange = this.handleBoolChange.bind(this);
    this.handleDateRangeChange = this.handleDateRangeChange.bind(this);
    this.handleTimelineSelect = this.handleTimelineSelect.bind(this);
    this.handleInvolvedChange = this.handleInvolvedChange.bind(this);
    this.onSave = () => this.props.onSave(this.state);
  }

  onFieldChange({ target }) {
    const data = this.state;
    data[target.id] = target.value;
    this.setState(data);
  }

  handleBoolChange({ target }) {
    const data = this.state;
    data[target.id] = target.checked ? 'true' : 'false'; // FIXME schema boolean implementation
    this.setState(data);
  }

  handleDateRangeChange({ date, startDate, endDate }) {
    if (date) this.setState({ date, startDate, endDate });
    // set date to empty when we have a range
    if (startDate) this.setState({ startDate, date });
    if (endDate) this.setState({ endDate, date });
  }

  handleInvolvedChange(involved) {
    this.setState({ involved });
  }

  handleTimelineSelect(timeline) {
    this.setState({ timeline });
  }

  render() {
    const { intl, timelines, document, isNew } = this.props;
    const data = this.state;
    return (
      <div className="TimelineEventForm">
        {isNew && (
          <FormGroup
            label={intl.formatMessage(messages.label_timeline)}
            labelFor="timeline-select"
          >
            <TimelineSelect
              id="timeline-select"
              timelines={timelines}
              handleTimelineSelect={this.handleTimelineSelect}
              selectedTimeline={data.timeline}
            />
          </FormGroup>
        )}
        <FormGroup
          label={intl.formatMessage(messages.label_title)}
          labelFor="name"
        >
          <input
            id="name"
            type="text"
            className="bp3-input bp3-large bp3-fill"
            placeholder={intl.formatMessage(messages.placeholder_title)}
            onChange={this.onFieldChange}
            value={data.name || ''}
          />
        </FormGroup>
        <FormGroup
          label={intl.formatMessage(messages.label_summary)}
          labelFor="summary"
        >
          <textarea
            id="summary"
            className="bp3-input bp3-fill"
            placeholder={intl.formatMessage(messages.placeholder_summary)}
            dir="auto"
            rows={5}
            onChange={this.onFieldChange}
            value={data.summary || ''}
          />
        </FormGroup>
        {isNew && (
          <FormGroup
            label={intl.formatMessage(messages.label_involved)}
            labelFor="event-involved"
            helperText={intl.formatMessage(messages.help_involved)}
          >
            <TimelineEventInvolvedEntities
              selectedEntities={data.involved}
              entities={getPossibleInvolvedEntities(document)}
              onChange={this.handleInvolvedChange}
            />
          </FormGroup>
        )}
        <FormGroup
          label={intl.formatMessage(messages.label_date)}
          labelFor="event-date"
          helperText={intl.formatMessage(messages.help_date)}
        >
          <TimelineEventDatePicker
            id="event-date"
            date={data.date}
            startDate={data.startDate}
            endDate={data.endDate}
            onChange={this.handleDateRangeChange}
          />
        </FormGroup>
        <FormGroup
          label={intl.formatMessage(messages.label_important)}
          labelFor="important"
        >
          <Checkbox
            id="important"
            checked={(data.important === 'true') || (data.important === true)}
            label={intl.formatMessage(messages.label_important_checkbox)}
            onChange={this.handleBoolChange}
          />
        </FormGroup>
        <Button
          intent={Intent.PRIMARY}
          onClick={this.onSave}
          disabled={this.props.blocking}
          text={intl.formatMessage(messages.save_button)}
        />
      </div>
    );
  }
}

export default compose(injectIntl)(TimelineEventForm);
