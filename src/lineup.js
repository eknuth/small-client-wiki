import React from 'react'
import $ from 'jquery'
import { ResolvedText, InternalLink } from './text'
import { Paragraph } from './plugins/paragraph'

import Remote from './remote'
import Resolution from './resolution'
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

var Image = React.createClass({
  render: function() {
    return (
    <div className="item surround">
      <img src={this.props.item.url} />
      <div className="caption">{this.props.item.text || this.props.item.caption}</div>
    </div>
    )
  }
})

var Markdown = React.createClass({
  render: function() {
    return (
      <div className="item" className={this.props.item.type}>
        <MarkdownText {...this.props} text={this.props.item.text} />
      </div>
    )
  }
})

var PageFold = React.createClass({
  render: function() {
    return <div className="item pagefold">
             <span>{this.props.item.text}</span>
           </div>
  }
})

var Reference = React.createClass({
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

var Video = React.createClass({
  render: function() {
    var parse = function(text) {
      var result = { caption: "" }
      var lines = text.split(/\r\n?|\n/)
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i]
        var match = line.match(/^\s*([A-Z0-9]+)\s+([\w\.\-\/+0-9]+)\s*$/)
        if (match) {
          result.player = match[1]
          result.key = match[2]
        }
        else {
          match = line.match(/^\s*([A-Z0-9]+)\s+([A-Za-z\,]+)\s+([\w\.\-\/+0-9]+)\s*$/)
          if (match) {
            result.player = match[1] + '/' + match[2]
            result.key = match[3]
          }
          else {
            result.caption += line + " "
          }
        }
      }
      return result;
    }

    var players = {
      "YOUTUBE": "http://www.youtube-nocookie.com/embed/#{key}?rel=0",
      "YOUTUBE/PLAYLIST": "https://www.youtube-nocookie.com/embed/videoseries?list=#{key}",
      "VIMEO": "http://player.vimeo.com/video/#{key}?title=0&amp;byline=0&amp;portrait=0",
      "TED": "https://embed-ssl.ted.com/talks/#{key}.html"
    }

    var lookupUrl = function(result) {
      
      var template = players[result.player]
      if (template == undefined)
        return undefined

      return template.replace("#{key}", result.key)
    }

    var result = parse(this.props.item.text)
    var url = lookupUrl(result)
    var player = url ?
      <iframe src={url} frameBorder="0" allowFullScreen /> :
      <div className="surround">{result.player + " " + result.key}</div>

    return (
      <div className="item">
        {player}
        <i><ResolvedText text={result.caption} {...this.props} /></i>
      </div>
    )
  }
})

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

var PlainText = React.createClass({
  render: function() {
    return <span>{this.props.text}</span>
  }
})

var ExternalLink = React.createClass({
  render: function() {
    var m = this.props.text.match(/\[(https?:.*?) (.*?)\]/)
    return <a href={m[1]}>{m[2]} <img src="external-link-ltr-icon.png" /></a>
  }
})

var MarkdownText = React.createClass({
    rawMarkup: function() {
        var context = this.props.context
        var wikiLinks = function () {
            return [
                {
                    type:   'lang',
                    regex:  /\[(https?:.*?) (.*?)\]/g,
                    replace: function (match, url, linkText) {
                        return '<a href="' + url + '" target="_blank">' + linkText + ' <img src="external-link-ltr-icon.png" /></a>'
                    }
                },
                {
                    type:   'lang',
                    regex:  /\[\[(.*?)\]\]/g,
                    replace: function (match, linkText) {
                        var asSlug = function(title) {
                            return title.replace(/\s/g, '-').replace(/[^A-Za-z0-9-]/g, '').toLowerCase()
                        }
                        var contextTitle = context.join(" ⇒ ")
                        return '<a href="#" class="internal" title="' + contextTitle + '" data-page-name="' + asSlug(linkText) + '">' + linkText + '</a>'
                    }
                }
            ]
        }
        
        var converter = new showdown.Converter({
            headerLevelStart: 3,
            tasklists: true,
            extensions: [ wikiLinks ]
        })
        var rawMarkup = converter.makeHtml(this.props.text)
        return { __html: rawMarkup}
    },
    
    onClick: function(e) {
        var target = e.target
        if (target.tagName.toLowerCase() === 'a' && target.className.toLowerCase() === 'internal') {
            var detail = { context: this.props.context, instance: this.props.instance, title: target.getAttribute('title'), slug: target.getAttribute('data-page-name') }
            var eventType = e.nativeEvent.shiftKey ? 'appendToLineup' : 'replaceInLineup'
            var event = new CustomEvent(eventType, { detail: detail })
            window.dispatchEvent(event)
            e.preventDefault()
        }
    },

    render: function() {
        return <span onClick={this.onClick} dangerouslySetInnerHTML={this.rawMarkup()} />
    }
})
