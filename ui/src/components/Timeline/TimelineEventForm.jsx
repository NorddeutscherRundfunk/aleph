import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { FormGroup, Button, Intent } from '@blueprintjs/core';
import { Entity } from '@alephdata/followthemoney';
import { Property, PropertyEditor } from '@alephdata/vislib';
import c from 'classnames';
import { selectModel } from 'src/selectors';

import TimelineEventInvolvedEntities from './TimelineEventInvolvedEntities';
import TimelineEventDatePicker from './TimelineEventDatePicker';
import { getUUID } from './util';

import './TimelineEventForm.scss';

const messages = defineMessages({
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
  label_country: {
    id: 'timeline.form.label_country',
    defaultMessage: 'Country',
  },
  label_date: {
    id: 'timeline.form.label_date',
    defaultMessage: 'Date',
  },
  help_date: {
    id: 'timeline.form.help_date',
    defaultMessage: 'Format: "YYYY-MM-DD", but you can omit day or month, e.g. "1999-03" for march `99 or just "2000" for a year.',
  },
  label_important: {
    id: 'timeline.form.label_important',
    defaultMessage: 'Important entry',
  },
  label_important_checkbox: {
    id: 'timeline.form.label_important_checkbox',
    defaultMessage: 'Indicate that this is a special entry',
  },
  label_mentioned: {
    id: 'timeline.form.label_mentioned',
    defaultMessage: 'Mentioned persons, companies and organisations',
  },
  help_mentioned: {
    id: 'timeline.form.help_mentioned',
    defaultMessage: 'Click on the items to select or deselect them. Selected items appear blue.',
  },
  label_involved: {
    id: 'timeline.form.label_involved',
    defaultMessage: 'Involved persons, companies and organisations',
  },
  help_involved: {
    id: 'timeline.form.help_involved',
    defaultMessage: 'Type in to search for involved entities',
  },
  save_button: {
    id: 'timeline.edit.info.save',
    defaultMessage: 'Save changes',
  },
});


const EDITABLE_PROPERTIES = [
  'name',
  'summary',
  'date',
  'startDate',
  'endDate',
  'country',
  'important',
  'involved',
  'peopleMentioned',
  'companiesMentioned',
]


const emptyEntity = {
  schema: 'Event',
  id: getUUID(),
};


export class TimelineEventForm extends Component {
  constructor(props) {
    super(props);
    const entity = props.entity || new Entity(props.model, emptyEntity);
    this.state = { entity };

    this.onChange = this.onChange.bind(this);
    this.onEditPropertyClick = this.onEditPropertyClick.bind(this);
    this.onSave = () => this.props.onSave(this.state);
    this.handleBoolChange = this.handleBoolChange.bind(this);
    this.handleDateRangeChange = this.handleDateRangeChange.bind(this);
    this.handleMentionedChange = this.handleMentionedChange.bind(this);
    this.renderProperty = this.renderProperty.bind(this);

    this.propertyFields = {}
    for (let prop of entity.schema.getEditableProperties()) {
      if (EDITABLE_PROPERTIES.indexOf(prop.name) > -1) {
        this.propertyFields[prop.name] = prop
      }
    }
  }

  onChange(entity) {
    this.setState({ entity, currEditing: null });
  }

  onEditPropertyClick(e, property) {
    e.preventDefault()
    e.stopPropagation()
    this.setState({
      currEditing: property
    })
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

  handleMentionedChange(prefix, mentioned) {
    const data = this.state;
    data[`${prefix}Mentioned`] = mentioned;
    this.setState(data);
  }

  renderProperty(key) {
    const property = this.propertyFields[key]
    const { entity, currEditing } = this.state;
    const isEditable = property.name === currEditing?.name;
    const { entityManager } = this.props;

    return (
      <div
        className={c('EntityViewer__property-list-item', {'active': isEditable})}
        onClick={(e) => !isEditable && this.onEditPropertyClick(e, property)}
      >
        <div className='EntityViewer__property-list-item__value'>
          {isEditable && (
            <div>
              <PropertyEditor
                key={property.name}
                onSubmit={this.onChange}
                entity={entity}
                property={property}
                fetchEntitySuggestions={entityManager.getEntitySuggestions}
              />
            </div>
          )}
          {!isEditable && (
            <div>
              <Property.Values
                prop={property}
                values={entity.getProperty(property.name)}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  render() {
    const { intl, timeline, document } = this.props;
    const { entity } = this.state;

    const peopleMentioned = document ? [...document.getProperty('peopleMentioned')] : [];
    const companiesMentioned = document ? [...document.getProperty('companiesMentioned')] : [];
    const documentMentions = peopleMentioned.length + companiesMentioned.length;

    return (
      <div className="TimelineEventForm">
        {timeline && (
          <h3 className="TimelineEventForm__title">
            {timeline.name}
          </h3>
        )}
        <FormGroup
          label={intl.formatMessage(messages.label_title)}
          labelFor="name"
        >
          {this.renderProperty('name')}
        </FormGroup>
        <FormGroup
          label={intl.formatMessage(messages.label_summary)}
          labelFor="summary"
        >
          {this.renderProperty('summary')}
        </FormGroup>
        {documentMentions > 0 && (
          <FormGroup
            label={intl.formatMessage(messages.label_mentioned)}
            labelFor="event-involved"
            helperText={intl.formatMessage(messages.help_mentioned)}
          >
            <TimelineEventInvolvedEntities
              selectedEntities={[...entity.getProperty('peopleMentioned')] || []}
              entities={peopleMentioned}
              onChange={(selected) => this.handleMentionedChange('people', selected)}
            />
            <TimelineEventInvolvedEntities
              selectedEntities={[...entity.getProperty('companiesMentioned')] || []}
              entities={companiesMentioned}
              onChange={(selected) => this.handleMentionedChange('companies', selected)}
            />
          </FormGroup>
        )}
        <FormGroup
          label={intl.formatMessage(messages.label_involved)}
          labelFor="event-involved"
          helperText={intl.formatMessage(messages.help_involved)}
        >
        {this.renderProperty('involved')}
        </FormGroup>
        <FormGroup
          label={intl.formatMessage(messages.label_country)}
          labelFor="country"
        >
          {this.renderProperty('country')}
        </FormGroup>
        <FormGroup
          label={intl.formatMessage(messages.label_date)}
          labelFor="event-date"
          helperText={intl.formatMessage(messages.help_date)}
        >
          <TimelineEventDatePicker
            id="event-date"
            entity={entity}
            renderProperty={this.renderProperty}
            onChange={this.onChange}
          />
        </FormGroup>
        <FormGroup
          label={intl.formatMessage(messages.label_important)}
          labelFor="important"
        >
          {this.renderProperty('important')}
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


const mapStateToProps = (state, ownProps) => {
  const model = selectModel(state);
  return { model };
}

export default compose(
  injectIntl,
  connect(mapStateToProps),
)(TimelineEventForm);
