import React from 'react'
import superagent from 'superagent'

import Page from './page'

export default React.createClass({
    componentDidMount: function() {
        var ammend = function(sum) {
          return function(each) {
            if (each.site != undefined && sum.indexOf(each.site) == -1) {
              sum.push(each.site)
            }
          }
        }

        var source = 'http://' + this.props.instance.site + '/' + this.props.instance.slug + '.json'
        superagent
          .get(source)
          .end((err, result) => {
            var context = [this.props.instance.site]
            var journal = result.journal || []
            journal.reverse().forEach(ammend(context))
            var detail = { id: this.props.instance.id, context: context,
                            site: this.props.instance.site, slug: this.props.instance.slug,
                            title: result.title, story: result.story }
            var event = new CustomEvent('pageAvailable', { detail: detail })
            window.dispatchEvent(event)
          })
    },
    render: function(){
        return <Page instance={this.props.instance} />
    }
});
