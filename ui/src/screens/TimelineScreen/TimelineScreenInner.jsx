import React from 'react';
import queryString from 'query-string';
import {
  defineMessages, FormattedMessage, injectIntl,
} from 'react-intl';
import { Waypoint } from 'react-waypoint';
import { Icon, Button, ButtonGroup, AnchorButton, Tooltip } from '@blueprintjs/core';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Query from 'src/app/Query';
import { queryEntities } from 'src/actions';
import { selectEntitiesResult } from 'src/selectors';
import {
  Collection, DualPane, SectionLoading, SignInCallout,
  ErrorSection, Breadcrumbs, ResultCount, Timeline,
} from 'src/components/common';
import SearchFacets from 'src/components/Facet/SearchFacets';
import QueryTags from 'src/components/QueryTags/QueryTags';
import SuggestAlert from 'src/components/SuggestAlert/SuggestAlert';
import Screen from 'src/components/Screen/Screen';
import togglePreview from 'src/util/togglePreview';
import entityEditorWrapper from 'src/components/Entity/entityEditorWrapper';

import TimelineHeading from 'src/components/Timeline/TimelineHeading';
import TimelineEventList from 'src/components/Timeline/TimelineEventList';
import AddTimelineEventDialog from 'src/components/Timeline/AddTimelineEventDialog';

import './TimelineScreenInner.scss';

const messages = defineMessages({
  no_results_title: {
    id: 'search.no_results_title',
    defaultMessage: 'No search results',
  },
  no_results_description: {
    id: 'search.no_results_description',
    defaultMessage: 'Try making your search more general',
  },
  page_title: {
    id: 'search.title',
    defaultMessage: 'Search',
  },
  alert_export_disabled: {
    id: 'search.screen.export_disabled',
    defaultMessage: 'Cannot export more than 10,000 results at a time',
  },
});

const facetKeys = [
  // 'collection_id',
  'countries',
  'languages',
  'names',
  'addresses',
  'properties.important',
];

export class TimelineScreenInner extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      facets: facetKeys,
      hideFacets: false,
      addTimelineEventIsOpen: false,
    };

    this.updateQuery = this.updateQuery.bind(this);
    this.onTimelineSearch = this.onTimelineSearch.bind(this);
    this.getMoreResults = this.getMoreResults.bind(this);
    this.toggleFacets = this.toggleFacets.bind(this);
    this.fetchIfNeeded = this.fetchIfNeeded.bind(this);
    this.getCurrentPreviewIndex = this.getCurrentPreviewIndex.bind(this);
    this.showNextPreview = this.showNextPreview.bind(this);
    this.showPreviousPreview = this.showPreviousPreview.bind(this);
    this.showPreview = this.showPreview.bind(this);
    this.toggleAddTimelineEvent = this.toggleAddTimelineEvent.bind(this);
  }

  componentDidMount() {
    this.fetchIfNeeded();
  }

  componentDidUpdate() {
    this.fetchIfNeeded();
  }

  onTimelineSearch(queryText) {
    const { timeline, query } = this.props;
    const newQuery = query.set('q', queryText).setFilter('collection_id', timeline.collection.id);
    this.updateQuery(newQuery);
  }

  getMoreResults() {
    const { query, result } = this.props;
    if (!result.isLoading && result.next) {
      this.props.queryEntities({ query, next: result.next });
    }
  }

  getCurrentPreviewIndex() {
    const { location } = this.props;
    const parsedHash = queryString.parse(location.hash);
    return this.props.result.results.findIndex(
      entity => entity.id === parsedHash['preview:id'],
    );
  }

  getSearchScopes() {
    const { query, timeline } = this.props;
    const activeCollections = query ? query.getFilter('collection_id') : [timeline.collection.id];

    const collectionScopeList = activeCollections.map(collectionId => (
      {
        listItem: (
          <Collection.Load id={collectionId} renderWhenLoading="...">
            {collection => (
              <Collection.Label collection={collection} icon truncate={30} />
            )}
          </Collection.Load>
        ),
        onSearch: (queryText) => {
          const newQuery = query.set('q', queryText).setFilter('collection_id', collectionId);
          this.updateQuery(newQuery);
        },
      }
    ));

    collectionScopeList.push(
      {
        listItem: <Timeline.Label timeline={timeline} icon truncate={30} />,
        label: timeline.label,
        onSearch: this.onTimelineSearch,
      },
    );

    if (activeCollections.length > 1) {
      collectionScopeList.push({
        listItem: <span>{`Search ${activeCollections.length} datasets`}</span>,
        onSearch: queryText => this.updateQuery(query.set('q', queryText)),
      });
    }
    return collectionScopeList;
  }

  fetchIfNeeded() {
    const { result, query } = this.props;
    if (result.shouldLoad) {
      this.props.queryEntities({ query });
    }
  }

  updateQuery(newQuery) {
    const { history, location } = this.props;
    // make it so the preview disappears if the query is changed.
    const parsedHash = queryString.parse(location.hash);
    parsedHash['preview:id'] = undefined;
    parsedHash['preview:type'] = undefined;

    history.push({
      pathname: location.pathname,
      search: newQuery.toLocation(),
      hash: queryString.stringify(parsedHash),
    });
  }

  showNextPreview(event) {
    const currentSelectionIndex = this.getCurrentPreviewIndex();
    const nextEntity = this.props.result.results[1 + currentSelectionIndex];

    if (nextEntity && currentSelectionIndex >= 0) {
      event.preventDefault();
      this.showPreview(nextEntity);
    }
  }

  showPreviousPreview(event) {
    event.preventDefault();
    const currentSelectionIndex = this.getCurrentPreviewIndex();
    const nextEntity = this.props.result.results[currentSelectionIndex - 1];
    if (nextEntity && currentSelectionIndex >= 0) {
      event.preventDefault();
      this.showPreview(nextEntity);
    }
  }

  showPreview(entity) {
    togglePreview(this.props.history, entity);
  }

  toggleFacets() {
    this.setState(({ hideFacets }) => ({ hideFacets: !hideFacets }));
  }

  toggleAddTimelineEvent() {
    this.setState(({ addTimelineEventIsOpen }) => ({
      addTimelineEventIsOpen: !addTimelineEventIsOpen,
    }));
  }

  render() {
    const { query, result, intl, entityManager } = this.props;
    const { timeline, timelineOperations, timelineStatus } = this.props;
    const { hideFacets, facets, addTimelineEventIsOpen } = this.state;
    const title = query.getString('q') || intl.formatMessage(messages.page_title);
    const hideFacetsClass = hideFacets ? 'show' : 'hide';
    const plusMinusIcon = hideFacets ? 'minus' : 'plus';
    const hasExportLink = result && result.links && result.links.export;
    const exportLink = !hasExportLink ? null : result.links.export;
    const tooltip = intl.formatMessage(messages.alert_export_disabled);
    const canAddTimelineEvent = timeline.collection.writeable;

    const operation = (
      <>
        <ButtonGroup>
          <Tooltip content={tooltip} disabled={exportLink}>
            <AnchorButton className="bp3-intent-primary" icon="download" disabled={!exportLink} href={exportLink}>
              <FormattedMessage id="search.screen.export" defaultMessage="Export" />
            </AnchorButton>
          </Tooltip>
        </ButtonGroup>
        {timelineOperations}
      </>
    );

    const breadcrumbs = (
      <Breadcrumbs operation={operation} status={timelineStatus}>
        <Breadcrumbs.Collection key="collection" collection={timeline.collection} />
        <Breadcrumbs.Text active>
          <Timeline.Label timeline={timeline} icon />
        </Breadcrumbs.Text>
        <Breadcrumbs.Text icon="search">
          <FormattedMessage id="search.screen.breadcrumb" defaultMessage="Search" />
        </Breadcrumbs.Text>
        <Breadcrumbs.Text active>
          <ResultCount result={result} />
        </Breadcrumbs.Text>
      </Breadcrumbs>
    );

    const searchScopes = this.getSearchScopes();

    return (
      <Screen
        query={query}
        title={title}
        searchScopes={searchScopes}
        hotKeys={[
          {
            combo: 'j', global: true, label: 'Preview next search entity', onKeyDown: this.showNextPreview,
          },
          {
            combo: 'k', global: true, label: 'Preview previous search entity', onKeyDown: this.showPreviousPreview,
          },
          {
            combo: 'up', global: true, label: 'Preview previous search entity', onKeyDown: this.showPreviousPreview,
          },
          {
            combo: 'down', global: true, label: 'Preview next search entity', onKeyDown: this.showNextPreview,
          },
        ]}
      >
        {breadcrumbs}
        <TimelineHeading timeline={timeline} />
        {canAddTimelineEvent && (
          <div className="TimelineScreenInner__add-event-action">
            <Button
              icon="new-object"
              text="Add timeline event"
              className="bp3-button bp3-intent-primary"
              onClick={this.toggleAddTimelineEvent}
            />
            <AddTimelineEventDialog
              timeline={timeline}
              toggleDialog={this.toggleAddTimelineEvent}
              isOpen={addTimelineEventIsOpen}
            />
          </div>
        )}
        <DualPane className="SearchScreen">
          <DualPane.SidePane>
            <div
              role="switch"
              aria-checked={!hideFacets}
              tabIndex={0}
              className="visible-sm-flex facets total-count bp3-text-muted"
              onClick={this.toggleFacets}
              onKeyPress={this.toggleFacets}
            >
              <Icon icon={plusMinusIcon} />
              <span className="total-count-span">
                <FormattedMessage id="search.screen.filters" defaultMessage="Filters" />
              </span>
            </div>
            <div className={hideFacetsClass}>
              <SearchFacets
                query={query}
                result={result}
                updateQuery={this.updateQuery}
                facets={facets}
                isCollapsible
              />
            </div>
          </DualPane.SidePane>
          <DualPane.ContentPane>
            <SignInCallout />
            <QueryTags query={query} updateQuery={this.updateQuery} />
            <TimelineEventList
              entityManager={entityManager}
              query={query}
              updateQuery={this.updateQuery}
              result={result}
            />
            {result.total === 0 && (
              <ErrorSection
                icon="search"
                title={intl.formatMessage(messages.no_results_title)}
                resolver={<SuggestAlert queryText={query.state.q} />}
                description={intl.formatMessage(messages.no_results_description)}
              />
            )}
            <Waypoint
              onEnter={this.getMoreResults}
              bottomOffset="-400px"
              scrollableAncestor={window}
            />

            {result.isLoading && (
              <SectionLoading />
            )}
          </DualPane.ContentPane>
        </DualPane>
      </Screen>
    );
  }
}
const mapStateToProps = (state, ownProps) => {
  const { location, timeline } = ownProps;
  const { collection } = timeline;
  const context = {
    highlight: true,
    'filter:schema': 'Event',
    'filter:collection_id': collection.id,
  };
  const path = `timelines/${timeline.id}/events`;
  const query = Query.fromLocation(path, location, context, 'events');
  const result = selectEntitiesResult(state, query);
  return { query, result, collection };
};

const mapDispatchToProps = { queryEntities };

export default compose(
  injectIntl,
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
  entityEditorWrapper,
)(TimelineScreenInner);