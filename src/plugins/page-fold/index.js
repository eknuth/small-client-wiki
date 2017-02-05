import React from 'react'

export default React.createClass({
  render: function() {
    return <div className="item pagefold">
             <span>{this.props.item.text}</span>
           </div>
  }
})

