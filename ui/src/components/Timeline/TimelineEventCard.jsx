import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { compose } from 'redux';
import queryString from 'query-string';
import c from 'classnames';
import { Button, Card, Divider, Icon, Tag } from '@blueprintjs/core';
import { Property } from '@alephdata/vislib';

import { Entity } from 'src/components/common';

import './TimelineEventCard.scss';

const messages = defineMessages({
  label_date: {
    id: 'timeline.card.label_date',
    defaultMessage: 'Date',
  },
  label_startDate: {
    id: 'timeline.card.label_startdate',
    defaultMessage: 'Start',
  },
  label_endDate: {
    id: 'timeline.card.label_enddate',
    defaultMessage: 'End',
  },
})

const VISIBLE_PROPERTIES = [
  'name',
  'summary',
  'date',
  'startDate',
  'endDate',
  'country',
  'important',
  'involved',
]


class TimelineEventCard extends Component {
  constructor(props) {
    super(props);
    this.renderEditButton = this.renderEditButton.bind(this);
    this.renderDates = this.renderDates.bind(this);
    this.properties = this.getVisibleProperties(props.entity);
  }

  getVisibleProperties(entity) {
    const props = {};
    for (let [key, prop] of entity.schema.getProperties()) {
      if (VISIBLE_PROPERTIES.indexOf(key) > -1) {
        props[key] = prop;
      }
    };
    return props;
  }

  renderEditButton() {
    const { entity, handleEdit } = this.props;
    if (handleEdit && entity.collection.writeable) {
      return <Button icon={<Icon icon="edit" />} onClick={handleEdit}>Edit</Button>;
    }
    return null;
  }

  renderProperty(key) {
    const { entity, entityManager } = this.props;
    const prop = this.properties[key];
    return (
      <div className="TimelineEventCard__property-item">
        <span className="TimelineEventCard__property-item__name">
          <Property.Name prop={prop} />
        </span>
        <Property.Values
          prop={prop}
          resolveEntityReference={entityManager.resolveEntityReference}
          values={entity.getProperty(prop.name)}
        />
      </div>
    );
  }

  renderDates() {
    const { entity, intl } = this.props;
    return ['date', 'startDate', 'endDate'].map(key => {
      const values = entity.getProperty(key);
      if (values.length > 0) {
        const prop = this.properties[key];
        return (
          <Tag key={key} icon="calendar" className="TimelineEventCard__date">
            {key !== 'date' && <span className="label">{intl.formatMessage(messages[`label_${key}`])}:</span>}
            <Property.Values prop={prop} values={values} />
          </Tag>
        );
      }
      return null;
    });
  }

  render() {
    const { entity, location, showPreview } = this.props;
    const parsedHash = queryString.parse(location.hash);
    const highlights = !entity.highlight ? [] : entity.highlight;
    // Select the current row if the ID of the entity matches the ID of the
    // current object being previewed. We do this so that if a link is shared
    // the currently displayed preview will also have the row it corresponds to
    // highlighted automatically.
    const isActive = parsedHash['preview:id'] && parsedHash['preview:id'] === entity.id;
    const isPrefix = !!highlights.length;
    const resultClass = c('TimelineEventCard', 'nowrap', { active: isActive }, { prefix: isPrefix });
    const highlightsClass = c('TimelineEventCard__highlights', { active: isActive });

    return (
      <Card key={entity.id} className={resultClass}>
        <div className="TimelineEventCard__head">
          <Entity.Link
            preview={showPreview}
            entity={entity}
            icon
          />
          <div className="TimelineEventCard__head__dates">
            {this.renderDates('date')}
          </div>
        </div>
        <Divider />
        <div className="TimelineEventCard__body">
          <div className="TimelineEventCard__body__text">
            {highlights.length ? (
              <div key={`${entity.id}-hl`} className={highlightsClass}>
                {highlights.map((phrase, index) => ( // eslint-disable-next-line
                  <span key={index}>
                    <span dangerouslySetInnerHTML={{ __html: phrase }} />
                    …
                  </span>
                ))}
              </div>
            ) : this.renderProperty('summary')}
          </div>
          {this.renderProperty('country')}
          {this.renderProperty('involved')}
        </div>
        <Divider />
        <div className="TimelineEventCard__footer">
          {this.renderEditButton()}
        </div>
      </Card>
    );
  }
}

export default compose(injectIntl)(TimelineEventCard);
