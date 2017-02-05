import React from 'react'

import Markdown from './plugins/markdown'
import PageFold from './plugins/page-fold'
import Paragraph from './plugins/paragraph'
import Reference from './plugins/reference'
import Video from './plugins/video'


var MissingPlugin = React.createClass({
  render: function() {
    return (
      <div className="item missing">
        Missing '{this.props.item.type}' plugin
      </div>
    )
  }
})

var plugins = {
  "image": Image,
  "markdown": Markdown,
  "pagefold": PageFold,
  "paragraph": Paragraph,
  "reference": Reference,
  "video": Video
}

var Footer = React.createClass({
    render: function(){
        function li (detail, index){ return (<li key={index}>{detail}</li>); }
        return (
          <div>
              {this.props.details.map(li)}
          </div>
        );
    }
});

export default React.createClass({
    getInitialState: function() {
      return {
        position: {
          top: 0,
          left: 0
        }
      }
    },
    handleTouchStart: function(event) {
      var changedTouch = event.nativeEvent.changedTouches[0]

      var newState = Object.assign({}, this.state)
      newState.touch = {
        original: Object.assign({}, this.state.position),
        clientX: changedTouch.clientX,
        clientY: changedTouch.clientY
      }
      this.setState(newState)
    },
    handleTouchMove: function(event) {
      var changedTouch = event.nativeEvent.changedTouches[0]

      var deltaX = changedTouch.clientX - this.state.touch.clientX
      var deltaY = changedTouch.clientY - this.state.touch.clientY

      var newState = Object.assign({}, this.state)
      newState.position = {
        top: this.state.touch.original.top + deltaY,
        left: this.state.touch.original.left + deltaX
      }
      this.setState(newState)
      event.preventDefault()
    },
    render: function(){
        function item(instance) {
          return function(item, index){
            var I = plugins[item.type] || MissingPlugin
            return (<I key={item.id} item={item} instance={instance} {...instance} />);
          }
        }

        var items = this.props.instance.story || []
        var context = this.props.instance.context || [this.props.instance.site]

        return (
            <div onTouchStart={this.handleTouchStart} onTouchMove={this.handleTouchMove} style={this.state.position} className="page">
                <h2>
                  <img style={{width: 18, marginRight: 5}} src={'http://' + this.props.instance.site + '/favicon.png'}  />
                  {this.props.instance.title || this.props.instance.slug}
                </h2>
                {items.map(item(this.props.instance))}
                <Footer details={[context.join(" ⇒ ")]} />
            </div>
        );
    }
});