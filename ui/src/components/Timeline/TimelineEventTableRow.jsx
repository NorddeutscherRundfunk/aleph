import _ from 'lodash';
import React, { Component } from 'react';
import queryString from 'query-string';
import { Button, Checkbox, Icon } from '@blueprintjs/core';
import c from 'classnames';

import { Country, Collection, Entity, Date, Boolean } from 'src/components/common';

class TimelineEventTableRow extends Component {
  constructor(props) {
    super(props);
    this.renderEditButton = this.renderEditButton.bind(this);
  }

  renderEditButton() {
    const { entity, handleEdit } = this.props;
    if (handleEdit && entity.collection.writeable) {
      return <Button icon={<Icon icon="edit" />} onClick={handleEdit} />;
    }
    return null;
  }

  render() {
    const { entity, location } = this.props;
    const { hideCollection, showPreview } = this.props;
    const { updateSelection, selection } = this.props;
    const selectedIds = _.map(selection || [], 'id');
    const isSelected = selectedIds.indexOf(entity.id) > -1;
    const parsedHash = queryString.parse(location.hash);
    const highlights = !entity.highlight ? [] : entity.highlight;
    // Select the current row if the ID of the entity matches the ID of the
    // current object being previewed. We do this so that if a link is shared
    // the currently displayed preview will also have the row it corresponds to
    // highlighted automatically.
    const isActive = parsedHash['preview:id'] && parsedHash['preview:id'] === entity.id;
    const isPrefix = !!highlights.length;
    const resultClass = c('TimelineEventTableRow', 'nowrap', { active: isActive }, { prefix: isPrefix });
    const highlightsClass = c('TimelineEventTableRow', { active: isActive });
    const colSpan = hideCollection ? 5 : 6;
    const summary = entity.getFirst('summary');

    return (
      <>
        <tr key={entity.id} className={resultClass}>
          {updateSelection && (
            <td className="select">
              <Checkbox checked={isSelected} onChange={() => updateSelection(entity)} />
            </td>
          )}
          <td className="entity">
            <Entity.Link
              preview={showPreview}
              entity={entity}
              icon
            />
          </td>
          {!hideCollection && (
            <td className="collection">
              <Collection.Link preview collection={entity.collection} icon />
            </td>
          )}
          <td className="country">
            <Country.List codes={entity.getTypeValues('country')} />
          </td>
          <td className="date">
            <Date value={entity.getFirst('startDate')} />
          </td>
          <td className="date">
            <Date value={entity.getFirst('endDate')} />
          </td>
          <td className="date">
            {!entity.hasProperty('startDate') && <Date.Earliest values={entity.getTypeValues('date')} />}
          </td>
          <td className="important">
            <Boolean value={!!entity.getFirst('important')} />
          </td>
          <td className="edit">
            {this.renderEditButton()}
          </td>
        </tr>
        {highlights.length ? (
          <tr key={`${entity.id}-hl`} className={highlightsClass}>
            <td colSpan="5" className="highlights">
              {highlights.map((phrase, index) => ( // eslint-disable-next-line
                <span key={index}>
                  <span dangerouslySetInnerHTML={{ __html: phrase }} />
                  …
                </span>
              ))}
            </td>
          </tr>
        ) : summary && (
          <tr key={`${entity.id}-summary`} className="TimelineEventTableRow__summary">
            {updateSelection && <td />}
            <td colSpan={colSpan}>{entity.getFirst('summary')}</td>
          </tr>
        )}
      </>
    );
  }
}

export default TimelineEventTableRow;
