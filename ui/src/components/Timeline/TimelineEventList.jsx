import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import c from 'classnames';
import { compose } from 'redux';
import { withRouter } from 'react-router';

import { Button, Intent } from '@blueprintjs/core';
import { ErrorSection } from 'src/components/common';

import DateRangeQuery from 'src/components/Timeline/DateRangeQuery';
import EditTimelineEventDialog from './EditTimelineEventDialog';
import TimelineEventCard from './TimelineEventCard';

import './TimelineEventList.scss';

const messages = defineMessages({
  column_name: {
    id: 'entity.column.name',
    defaultMessage: 'Name',
  },
  column_collection_id: {
    id: 'entity.column.collection_id',
    defaultMessage: 'Dataset',
  },
  column_countries: {
    id: 'entity.column.countries',
    defaultMessage: 'Countries',
  },
  column_dates: {
    id: 'entity.column.dates',
    defaultMessage: 'Dates',
  },
  column_startDate: {
    id: 'entity.column.startDate',
    defaultMessage: 'Start',
  },
  column_endDate: {
    id: 'entity.column.endDate',
    defaultMessage: 'End',
  },
  column_important: {
    id: 'timelineevent.column.important',
    defaultMessage: 'Important',
  },
  label_sorting: {
    id: 'timelineevent.list.label_sorting',
    defaultMessage: 'Sort events by:',
  }
});

const SortableField = ({ field, handleSort, sorted, intl }) => (
  <Button
    key={field}
    icon={sorted === 'asc' ? 'chevron-up' : sorted === 'desc' ? 'chevron-down' : null}
    className='TimelineEventList__sortable-field'
    intent={sorted ? Intent.PRIMARY : null}
    onClick={handleSort}>
    {intl.formatMessage(messages[`column_${field}`])}
  </Button>
)

const SORTABLE_FIELDS = ['name', 'dates', 'startDate', 'endDate'];

class TimelineEventList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editIsOpen: false,
    };

    this.toggleEditTimelineEvent = this.toggleEditTimelineEvent.bind(this);
  }

  toggleEditTimelineEvent(editEntity) {
    const { editIsOpen } = this.state;
    if (editIsOpen) {
      this.setState({ editIsOpen: false, editEntity: undefined });
    } else {
      this.setState({ editIsOpen: true, editEntity });
    }
  }

  sortColumn(newField) {
    if (['startDate', 'endDate'].indexOf(newField) > -1) {
      newField = `properties.${newField}`;
    }
    const { query, updateQuery } = this.props;
    const { field: currentField, direction } = query.getSort();
    // Toggle through sorting states: ascending, descending, or unsorted.
    if (currentField !== newField) {
      return updateQuery(query.sortBy(newField, 'asc'));
    }
    if (direction === 'asc') {
      updateQuery(query.sortBy(currentField, 'desc'));
    } else {
      updateQuery(query.sortBy(currentField, undefined));
    }
    return undefined;
  }

  render() {
    const { result, query, intl, location, entityManager, updateQuery } = this.props;
    const { showPreview = true } = this.props;
    const { editIsOpen, editEntity } = this.state;

    if (result.isError) {
      return <ErrorSection error={result.error} />;
    }

    if (result.total === 0 && result.page === 1) {
      return null;
    }

    const entities = result.results.filter((e) => e.id !== undefined);
    const { field: sortedField, direction } = query.getSort();

    return (
      <>
        {editEntity && (
          <EditTimelineEventDialog
            entityManager={entityManager}
            entity={editEntity}
            toggleDialog={this.toggleEditTimelineEvent}
            isOpen={editIsOpen}
          />
        )}
        <div className={c("TimelineEventList", { updating: result.isLoading })}>
          <DateRangeQuery query={query} updateQuery={updateQuery} />
          <div className="TimelineEventList__sortable-fields">
            <h3 className="TimelineEventList__sortable-fields__title">
              {intl.formatMessage(messages.label_sorting)}
            </h3>
            {SORTABLE_FIELDS.map(field => (
              <SortableField
                key={field}
                field={field}
                handleSort={() => this.sortColumn(field)}
                sorted={sortedField?.replace('properties.', '') === field
                    && (direction === 'desc' ? 'desc' : 'asc')}
                intl={intl}
              />
            ))}
          </div>
          {entities.map(entity => (
            <TimelineEventCard
              key={entity.id}
              location={location}
              entity={entity}
              showPreview={showPreview}
              handleEdit={() => this.toggleEditTimelineEvent(entity)}
              entityManager={entityManager}
            />
          ))}
        </div>
      </>
    );
  }
}

export default compose(
  injectIntl,
  withRouter,
)(TimelineEventList);
