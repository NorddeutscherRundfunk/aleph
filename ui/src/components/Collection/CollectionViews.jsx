import _ from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Tabs, Tab, Icon } from '@blueprintjs/core';
import queryString from 'query-string';

import { Count } from 'src/components/common';
import CollectionOverviewMode from 'src/components/Collection/CollectionOverviewMode';
import CollectionXrefMode from 'src/components/Collection/CollectionXrefMode';
import CollectionDiagramsIndexMode from 'src/components/Collection/CollectionDiagramsIndexMode';
import CollectionTimelinesIndexMode from 'src/components/Collection/CollectionTimelinesIndexMode';
import CollectionContentViews from 'src/components/Collection/CollectionContentViews';

import { queryCollectionDiagrams, queryCollectionXrefFacets } from 'src/queries';
import {
  selectCollectionXrefIndex,
  selectCollectionXrefResult,
  selectTester,
  selectModel,
  selectDiagramsResult,
  selectTimelinesResult,
  selectSessionIsTester,
} from 'src/selectors';

import './CollectionViews.scss';

const viewIds = {
  OVERVIEW: 'overview',
  BROWSE: 'browse',
  XREF: 'xref',
  DIAGRAMS: 'diagrams',
  TIMELINES: 'timelines',
};

/* eslint-disable */
class CollectionViews extends React.Component {
  constructor(props) {
    super(props);
    this.handleTabChange = this.handleTabChange.bind(this);
  }

  componentDidUpdate() {
    const { activeMode } = this.props;

    if (Object.values(viewIds).indexOf(activeMode) < 0) {
      this.handleTabChange(viewIds.OVERVIEW);
    }
  }

  getEntitySchemata() {
    const { collection, model } = this.props;
    const matching = [];
    for (const key in collection.schemata) {
      if (!model.getSchema(key).isDocument()) {
        matching.push({
          schema: key,
          count: collection.schemata[key],
        });
      }
    }
    return _.reverse(_.sortBy(matching, ['count']));
  }

  countDocuments() {
    const { collection, model } = this.props;
    let totalCount = 0;
    for (const key in collection.schemata) {
      if (model.getSchema(key).isDocument()) {
        totalCount += collection.schemata[key];
      }
    }
    return totalCount;
  }

  handleTabChange(mode) {
    const { history, location } = this.props;
    const parsedHash = queryString.parse(location.hash);

    parsedHash.mode = mode;
    delete parsedHash.type;

    history.push({
      pathname: location.pathname,
      search: location.search,
      hash: queryString.stringify(parsedHash),
    });
  }

  render() {
    const {
<<<<<<< HEAD
      collection, activeMode, diagrams, showDiagramsTab, xref,
=======
      collection,
      activeMode,
      diagrams,
      timelines,
      showDiagramsTab,
      showTimelinesTab,
      xrefIndex,
>>>>>>> Add basic frontend logic to create/edit/delete/browse Timelines
    } = this.props;
    // const numOfDocs = this.countDocuments();
    // const entitySchemata = this.getEntitySchemata();
    return (
      <Tabs
        id="CollectionInfoTabs"
        className="CollectionViews__tabs info-tabs-padding"
        onChange={this.handleTabChange}
        selectedTabId={activeMode}
        renderActiveTabPanelOnly
      >
        <Tab
          id={viewIds.OVERVIEW}
          className="CollectionViews__tab"
          title={
            <>
              <Icon icon="grouped-bar-chart" className="left-icon" />
              <FormattedMessage
                id="entity.info.overview"
                defaultMessage="Overview"
              />
            </>
          }
          panel={<CollectionOverviewMode collection={collection} />}
        />
        <Tab
          id={viewIds.BROWSE}
          className="CollectionViews__tab"
          title={
            <>
              <Icon icon="inbox-search" className="left-icon" />
              <FormattedMessage
                id="entity.info.contents"
                defaultMessage="Browse"
              />
            </>
          }
          panel={
            <CollectionContentViews
              collection={collection}
              activeMode={activeMode}
              onChange={this.handleTabChange}
            />
          }
        />
        <Tab
          id={viewIds.XREF}
          className="CollectionViews__tab"
          title={
            <>
              <Icon className="left-icon" icon="comparison" />
<<<<<<< HEAD
              <FormattedMessage id="entity.info.xref" defaultMessage="Cross-reference" />
              <Count count={xref.total} />
            </>}
          panel={<CollectionXrefMode collection={collection} />}
=======
              <FormattedMessage
                id="entity.info.xref"
                defaultMessage="Cross-reference"
              />
              <Count count={xrefIndex.total} />
            </TextLoading>
          }
          panel={<CollectionXrefIndexMode collection={collection} />}
>>>>>>> Add basic frontend logic to create/edit/delete/browse Timelines
        />
        {showDiagramsTab && (
          <Tab
            id={viewIds.DIAGRAMS}
            className="CollectionViews__tab"
            title={
<<<<<<< HEAD
              <>
                <Icon className="left-icon" icon="graph" />
                <FormattedMessage id="collection.info.diagrams" defaultMessage="Network diagrams" />
=======
              <TextLoading loading={diagrams.shouldLoad || diagrams.isLoading}>
                {' '}
                <Icon className="left-icon" icon="graph" />
                <FormattedMessage
                  id="collection.info.diagrams"
                  defaultMessage="Network diagrams"
                />
>>>>>>> Add basic frontend logic to create/edit/delete/browse Timelines
                <Count count={diagrams.total} />
              </>
            }
            panel={<CollectionDiagramsIndexMode collection={collection} />}
          />
        )}
        {showTimelinesTab && (
          <Tab
            id={viewIds.TIMELINES}
            className="CollectionViews__tab"
            title={
              <TextLoading
                loading={timelines.shouldLoad || timelines.isLoading}
              >
                {' '}
                <Icon className="left-icon" icon="timeline-events" />
                <FormattedMessage
                  id="collection.info.timelines"
                  defaultMessage="Timelines"
                />
                <Count count={timelines.total} />
              </TextLoading>
            }
            panel={<CollectionTimelinesIndexMode collection={collection} />}
          />
        )}
      </Tabs>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { collection, location } = ownProps;
  const diagramsQuery = queryCollectionDiagrams(location, collection.id);
  const xrefQuery = queryCollectionXrefFacets(location, collection.id);

  const context = {
    'filter:collection_id': collection.id,
  };
  const diagramsQuery = new Query('diagrams', {}, context, 'diagrams').sortBy(
    'updated_at',
    'desc'
  );
  const timelinesQuery = new Query(
    'timelines',
    {},
    context,
    'timelines'
  ).sortBy('updated_at', 'desc');

  return {
    model: selectModel(state),
    xref: selectCollectionXrefResult(state, xrefQuery),
    diagrams: selectDiagramsResult(state, diagramsQuery),
    timelines: selectTimelinesResult(state, timelinesQuery),
    showDiagramsTab: collection.casefile && selectSessionIsTester(state),
    showTimelinesTab: collection.casefile && selectSessionIsTester(state),
  };
};

CollectionViews = connect(mapStateToProps, {})(CollectionViews);
CollectionViews = injectIntl(CollectionViews);
CollectionViews = withRouter(CollectionViews);
export default CollectionViews;
