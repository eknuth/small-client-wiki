import React from 'react'
import { MarkdownText } from '../../text'

export default React.createClass({
  render: function() {
    return (
      <div className="item" className={this.props.item.type}>
        <MarkdownText {...this.props} text={this.props.item.text} />
      </div>
    )
  }
})

