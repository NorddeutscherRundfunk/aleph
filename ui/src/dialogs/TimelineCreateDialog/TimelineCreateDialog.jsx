import React, { Component } from 'react';
import { Dialog, Button, Intent, Spinner } from '@blueprintjs/core';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import Query from 'src/app/Query';
import { Collection } from 'src/components/common';
import { createTimeline } from 'src/actions';
import { showSuccessToast, showWarningToast } from 'src/app/toast';
import getTimelineLink from 'src/util/getTimelineLink';

import './TimelineCreateDialog.scss';

const messages = defineMessages({
  label_placeholder: {
    id: 'timeline.create.label_placeholder',
    defaultMessage: 'Untitled timeline',
  },
  summary_placeholder: {
    id: 'timeline.create.summary_placeholder',
    defaultMessage: 'A brief description of the timeline',
  },
  save: {
    id: 'timeline.create.submit',
    defaultMessage: 'Create',
  },
  title_create: {
    id: 'timeline.create.title',
    defaultMessage: 'Create a new timeline',
  },
  submit_create: {
    id: 'timeline.create.submit',
    defaultMessage: 'Create',
  },
  success_create: {
    id: 'timeline.create.success',
    defaultMessage: 'Your timeline has been created successfully.',
  },
});


class TimelineCreateDialog extends Component {
  constructor(props) {
    super(props);
    const { timeline } = this.props;

    this.state = {
      label: timeline.label || '',
      summary: timeline.summary || '',
      collection: timeline.collection || '',
      processing: false,
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.onChangeLabel = this.onChangeLabel.bind(this);
    this.onChangeSummary = this.onChangeSummary.bind(this);
    this.onChangeCollection = this.onChangeCollection.bind(this);
  }

  componentWillUnmount() {
    this.setState({
      label: '',
      summary: '',
      collection: '',
      processing: false,
    });
  }

  async onSubmit(event) {
    const { history, intl } = this.props;
    const { label, summary, collection, processing } = this.state;
    event.preventDefault();
    if (processing || !this.checkValid()) return;
    this.setState({ processing: true });

    try {
      const newTimeline = {
        label,
        summary,
        collection_id: collection.id,
      };

      const response = await this.props.createTimeline(newTimeline);
      this.setState({ processing: false });

      history.push({
        pathname: getTimelineLink(response.data),
      });

      showSuccessToast(
        intl.formatMessage(messages.success_create),
      );
    } catch (e) {
      showWarningToast(e.message);
      this.setState({ processing: false });
    }
  }

  onChangeLabel({ target }) {
    this.setState({ label: target.value });
  }

  onChangeSummary({ target }) {
    this.setState({ summary: target.value });
  }

  onChangeCollection(collection) {
    this.setState({ collection });
  }

  getCollectionOptionsQuery() {
    const { location } = this.props;

    const context = {
      'filter:writeable': true,
      'filter:casefile': true,
    };
    return Query.fromLocation('collections', location, context, 'collections')
      .sortBy('label', 'asc');
  }

  checkValid() {
    const { label, collection } = this.state;
    return collection && label?.length > 0;
  }

  render() {
    const { canChangeCollection, intl, isOpen, toggleDialog } = this.props;
    const { collection, label, summary, processing } = this.state;
    const disabled = processing || !this.checkValid();

    return (
      <Dialog
        icon="graph"
        className="TimelineCreateDialog"
        isOpen={isOpen}
        title={intl.formatMessage(messages.title_create)}
        onClose={toggleDialog}
      >
        <div className="TimelineCreateDialog__contents">
          {processing && <div className="TimelineCreateDialog__overlay" />}
          <form onSubmit={this.onSubmit}>
            <div className="bp3-dialog-body">
              <div className="bp3-form-group">
                <label className="bp3-label" htmlFor="label">
                  <FormattedMessage id="timeline.choose.name" defaultMessage="Title" />
                  <div className="bp3-input-group bp3-fill">
                    <input
                      id="label"
                      type="text"
                      className="bp3-input"
                      autoComplete="off"
                      placeholder={intl.formatMessage(messages.label_placeholder)}
                      onChange={this.onChangeLabel}
                      value={label}
                    />
                  </div>
                </label>
              </div>
              <div className="bp3-form-group">
                <label className="bp3-label" htmlFor="summary">
                  <FormattedMessage
                    id="timeline.choose.summary"
                    defaultMessage="Summary"
                  />
                  <div className="bp3-input-group bp3-fill">
                    <textarea
                      id="summary"
                      className="bp3-input"
                      placeholder={intl.formatMessage(messages.summary_placeholder)}
                      onChange={this.onChangeSummary}
                      value={summary}
                      rows={5}
                    />
                  </div>
                </label>
              </div>
              {canChangeCollection && (
                <div className="bp3-form-group">
                  <div className="bp3-label">
                    <FormattedMessage
                      id="timeline.collectionSelect"
                      defaultMessage="Select a dataset"
                    />
                    <Collection.Select
                      collection={collection}
                      onSelect={this.onChangeCollection}
                      query={this.getCollectionOptionsQuery()}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="bp3-dialog-footer">
              <div className="bp3-dialog-footer-actions">
                <Button
                  type="submit"
                  intent={Intent.PRIMARY}
                  disabled={disabled}
                  text={(
                    intl.formatMessage(messages.submit_create)
                  )}
                />
              </div>
            </div>
          </form>
        </div>
        {processing && (
          <Spinner className="bp3-large" />
        )}
      </Dialog>
    );
  }
}

const mapStateToProps = () => ({});

TimelineCreateDialog = injectIntl(TimelineCreateDialog);
TimelineCreateDialog = withRouter(TimelineCreateDialog);
export default connect(mapStateToProps, {
  createTimeline,
})(TimelineCreateDialog);
