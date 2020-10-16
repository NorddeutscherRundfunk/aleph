import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import c from 'classnames';

import { compose } from 'redux';
import { withRouter } from 'react-router';
import { SortableTH, ErrorSection } from 'src/components/common';

import EditTimelineEventDialog from './EditTimelineEventDialog';
import TimelineEventTableRow from './TimelineEventTableRow';

import './TimelineEventTable.scss';

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
    defaultMessage: 'Date',
  },
  column_startDate: {
    id: 'entity.column.startDate',
    defaultMessage: 'From',
  },
  column_endDate: {
    id: 'entity.column.endDate',
    defaultMessage: 'Until',
  },
  column_important: {
    id: 'timelineevent.column.important',
    defaultMessage: 'Important',
  },
});

class TimelineEventTable extends Component {
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
    const { query, intl, location, result, editable } = this.props;
    const { hideCollection = false, showPreview = true } = this.props;
    const { updateSelection, selection } = this.props;
    const { editIsOpen, editEntity } = this.state;

    if (result.isError) {
      return <ErrorSection error={result.error} />;
    }

    if (result.total === 0 && result.page === 1) {
      return null;
    }

    const results = result.results.filter((e) => e.id !== undefined);
    const TH = ({
      sortable, field, className, ...otherProps
    }) => {
      const { field: sortedField, direction } = query.getSort();
      return (
        <SortableTH
          sortable={sortable}
          className={className}
          sorted={sortedField === field && (direction === 'desc' ? 'desc' : 'asc')}
          onClick={() => this.sortColumn(field)}
          {...otherProps}
        >
          {intl.formatMessage(messages[`column_${field}`])}
        </SortableTH>
      );
    };
    return (
      <>
        {editEntity && (
          <EditTimelineEventDialog
            entity={editEntity}
            location={location}
            toggleDialog={this.toggleEditTimelineEvent}
            isOpen={editIsOpen}
          />
        )}
        <table className="TimelineEventTable data-table">
          <thead>
            <tr>
              {updateSelection && (<th className="select" />)}
              <TH field="name" className="wide" sortable />
              {!hideCollection && (
                <TH field="collection_id" className="wide" />
              )}
              <TH className="header-country" field="countries" sortable />
              <TH className="header-dates" field="startDate" sortable />
              <TH className="header-dates" field="endDate" sortable />
              <TH className="header-dates" field="dates" sortable />
              <TH className="header-important" field="important" sortable />
              {editable && <th className="header-edit" />}
            </tr>
          </thead>
          <tbody className={c({ updating: result.isLoading })}>
            {results.map(entity => (
              <TimelineEventTableRow
                key={entity.id}
                entity={entity}
                location={location}
                hideCollection={hideCollection}
                showPreview={showPreview}
                updateSelection={updateSelection}
                selection={selection}
                handleEdit={() => this.toggleEditTimelineEvent(entity)}
                editable={editable}
              />
            ))}
          </tbody>
        </table>
      </>
    );
  }
}

export default compose(
  withRouter,
  injectIntl,
)(TimelineEventTable);
