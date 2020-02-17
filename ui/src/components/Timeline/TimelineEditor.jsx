import React from 'react';
import { connect } from 'react-redux';
import { updateTimeline } from 'src/actions';
import { selectLocale, selectModel } from 'src/selectors';

import './TimelineEditor.scss';

class TimelineEditor extends React.Component {
  render() {
    const { timeline, filterText } = this.props;

    return (
      <div className="TimelineEditor">
        <h1>
          {timeline.label}
        </h1>
        {filterText}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  model: selectModel(state),
  locale: selectLocale(state),
});

export default connect(mapStateToProps, {
  updateTimeline,
})(TimelineEditor);
