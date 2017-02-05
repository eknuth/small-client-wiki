import React from 'react'

export default React.createClass({
  render: function() {
    return (
    <div className="item surround">
      <img src={this.props.item.url} />
      <div className="caption">{this.props.item.text || this.props.item.caption}</div>
    </div>
    )
  }
})

