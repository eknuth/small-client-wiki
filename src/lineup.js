import React from 'react'
import $ from 'jquery'

import Remote from './remote'
import Page from './page'

export const Lineup = React.createClass({
  createInstance: function(context, site, slug, title, story) {
    return {
      id: Math.floor(Math.random() * 1000000000),
      context: context,
      site: site,
      slug: slug,
      title: title,
      story: story
    }
  },
  instancesFromUrl: function(lineupString) {
    var instances = []
    var segments = lineupString.split("/")
    for (var i = 0; i < segments.length; i += 2) {
      instances.push(this.createInstance(undefined, segments[i], segments[i + 1]))
    }
    return instances
  },
  urlFromInstances: function(instances) {
    return instances.map(function(instance) {
      return instance.site + "/" + instance.slug
    }).join("/")
  },
  alignInstances: function(original, replacement) {
    for (var i = 0; i < replacement.length; i++) {
      var o = original[i]
      var r = replacement[i]
      if (o == undefined || r.site != o.site || r.slug != o.slug) {
        break
      }
      replacement[i] = o
    }
    return replacement
  },
  getInitialState: function() {
    var initial = window.location.hash.replace("#", "")
    if (initial == "") {
      initial = "small.bay.wiki.org/welcome-visitors"
      window.location.hash = "#" + initial
    }

    return {
      lineup: this.instancesFromUrl(initial)
    }
  },
  appendToLineup: function(event) {
    var detail = event.detail
    console.log("Detail: " + detail)
    var newLineup = this.state.lineup.slice(0);
    newLineup.push(this.createInstance(detail.context, detail.site, detail.slug, detail.title))
    this.setState({ lineup: newLineup, ready: 'append' })
  },
  replaceInLineup: function(event) {
    var detail = event.detail
    var lastDesiredIndex = this.state.lineup.findIndex(function(item) { return item.id == detail.instance.id})
    var newLineup = this.state.lineup.slice(0, lastDesiredIndex + 1);
    newLineup.push(this.createInstance(detail.context, detail.site, detail.slug, detail.title))
    this.setState({ lineup: newLineup, ready: 'replace' })
  },
  pageAvailable: function(event) {
    var detail = event.detail
    var that = this
    var newLineup = this.state.lineup.map(function(item) {
        if (item.id == detail.id) {
          return that.createInstance(detail.context, detail.site, detail.slug, detail.title, detail.story)
        }
        else {
          return item
        }
    })

    this.setState({ lineup: newLineup })
  },
  onPopstate: function(event) {
    var newLineup = this.instancesFromUrl(window.location.hash.replace("#", ""))
    this.alignInstances(this.state.lineup, newLineup)
    this.setState({ lineup: newLineup })
  },
  componentDidMount: function() {
    window.addEventListener("appendToLineup", this.appendToLineup, false)
    window.addEventListener("replaceInLineup", this.replaceInLineup, false)
    window.addEventListener("pageAvailable", this.pageAvailable, false)
    window.addEventListener("popstate", this.onPopstate, false)
  },
  componentDidUpdate: function() {
    var loading = this.state.lineup.find(function(item) { return item.site == undefined })

    if (!loading) {
      window.location.hash = "#" + this.urlFromInstances(this.state.lineup)
      this.state.ready = 'done'
    }
  },
  render: function() {
    function toSegment(instance) {
      if (instance.story) {
        return <Page key={instance.id} instance={instance} />
      }
      else if (instance.site == undefined) {
        return <Resolution key={instance.id} instance={instance} />
      }
      else {
        return <Remote key={instance.id} instance={instance} />
      }
    }

    return <div>
        <div className="lineup">{this.state.lineup.map(toSegment)}</div>
        <div className="ready">{this.state.ready||"starting"}</div>
        </div>
  }
})
