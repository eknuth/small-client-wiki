import React from 'react'
import { InternalLink, ResolvedText } from '../../text'

export default React.createClass({
  render: function () {
    var referenceContext = this.props.context
    if (referenceContext.indexOf(this.props.item.site) == -1) {
      referenceContext = referenceContext.concat(this.props.item.site)
    }

    return (
        <div className="item" className={this.props.item.type}>
          <p>
            <a href=''><img style={{width: 12, marginRight: 5}} src={'http://' + this.props.item.site + '/favicon.png'}  /></a>
            <InternalLink key={1} {...this.props} context={referenceContext} site={this.props.item.site} text={this.props.item.title} /> — <ResolvedText {...this.props} context={referenceContext} text={this.props.item.text} />
          </p>
        </div>
    )
  }
})

