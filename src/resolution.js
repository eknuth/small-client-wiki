import React from 'react'

export default React.createClass({
    resolve: function(context, slug, i) {
      if (i >= context.length) {
        return;
      }

      var site = context[i]
      var source = 'http://' + site + '/' + slug + '.json'
      var that = this;

      var ammend = function(sum) {
        return function(each) {
          if (each.site != undefined && sum.indexOf(each.site) == -1) {
            sum.push(each.site)
          }
        }
      }

      this.serverRequest = $.getJSON(source)
        .done( function (result) {
            var resolvedContext = [site]
            var journal = result.journal || []
            journal.reverse().forEach(ammend(resolvedContext))

            var detail = { id: that.props.instance.id, context: resolvedContext,
                           site: site, slug: that.props.instance.slug,
                           title: result.title, story: result.story }
            var event = new CustomEvent('pageAvailable', { detail: detail })
            window.dispatchEvent(event)})
        .fail(function (result) {
            that.resolve(context, slug, ++i)
      });
    },
    componentDidMount: function() {
      this.resolve(this.props.instance.context, this.props.instance.slug, 0)
    },
    render: function(){
      return <Page instance={this.props.instance} />
    }
})
