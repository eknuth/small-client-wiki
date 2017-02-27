import React from 'react'
import showdown from 'showdown'

var PlainText = React.createClass({
  render: function () {
    return <span>{this.props.text}</span>
  }
})

var ExternalLink = React.createClass({
  render: function () {
    var m = this
      .props
      .text
      .match(/\[(https?:.*?) (.*?)\]/)
    return <a href={m[1]}>{m[2]}
      <img src="external-link-ltr-icon.png"/></a>
  }
})

var InternalLink = React.createClass({
  asSlug: function (title) {
    return title
      .replace(/\s/g, '-')
      .replace(/[^A-Za-z0-9-]/g, '')
      .toLowerCase()
  },
  handleClick: function (click) {
    var detail = {
      context: this.props.context,
      instance: this.props.instance,
      title: this.props.text,
      slug: this.asSlug(this.props.text)
    }
    var eventType = click.nativeEvent.shiftKey
      ? 'appendToLineup'
      : 'replaceInLineup'
    var event = new CustomEvent(eventType, {detail: detail})
    window.dispatchEvent(event)
    click.preventDefault()
  },
  render: function () {
    var contextTitle = this
      .props
      .context
      .join(" ⇒ ")
    return <a
      href="#"
      className="internal"
      title={contextTitle}
      onClick={this.handleClick}>{this.props.text}</a>
  }
})

var ResolvedText = React.createClass({
  render: function () {
    function splitText(text) {
      return text.split(/(\[https?:.*? .*?\]|\[\[.*?\]\])/)
    }

    function span(props) {
      return function (split, index) {
        if (split.startsWith("[[")) {
          return <InternalLink key={index} {...props} text={split.slice(2, -2)}/>
        } else if (split.startsWith("[")) {
          return <ExternalLink key={index} {...props} text={split}/>
        } else {
          return <PlainText key={index} {...props} text={split}/>
        }
      }
    }

    var spans = splitText(this.props.text)
    return <span>{spans.map(span(this.props))}</span>
  }
})

var MarkdownText = React.createClass({
  rawMarkup: function () {
    var context = this.props.context
    var wikiLinks = function () {
      return [
        {
          type: 'lang',
          regex: /\[(https?:.*?) (.*?)\]/g,
          replace: function (match, url, linkText) {
            return '<a href="' + url + '" target="_blank">' + linkText + ' <img src="external-link-ltr-icon.png" /></a>'
          }
        }, {
          type: 'lang',
          regex: /\[\[(.*?)\]\]/g,
          replace: function (match, linkText) {
            var asSlug = function (title) {
              return title
                .replace(/\s/g, '-')
                .replace(/[^A-Za-z0-9-]/g, '')
                .toLowerCase()
            }
            var contextTitle = context.join(" ⇒ ")
            return '<a href="#" class="internal" title="' + contextTitle + '" data-page-name="' + asSlug(linkText) + '">' + linkText + '</a>'
          }
        }
      ]
    }

    var converter = new showdown.Converter({headerLevelStart: 3, tasklists: true, extensions: [wikiLinks]})
    var rawMarkup = converter.makeHtml(this.props.text)
    return {__html: rawMarkup}
  },

  onClick: function (e) {
    var target = e.target
    if (target.tagName.toLowerCase() === 'a' && target.className.toLowerCase() === 'internal') {
      var detail = {
        context: this.props.context,
        instance: this.props.instance,
        title: target.getAttribute('title'),
        slug: target.getAttribute('data-page-name')
      }
      var eventType = e.nativeEvent.shiftKey
        ? 'appendToLineup'
        : 'replaceInLineup'
      var event = new CustomEvent(eventType, {detail: detail})
      window.dispatchEvent(event)
      e.preventDefault()
    }
  },

  render: function () {
    return <span onClick={this.onClick} dangerouslySetInnerHTML={this.rawMarkup()}/>
  }
})

export const Image = React.createClass({
  render: function () {
    return (
      <div className="item surround">
        <img src={this.props.item.url}/>
        <div className="caption">{this.props.item.text || this.props.item.caption}</div>
      </div>
    )
  }
})

export const Markdown = React.createClass({
  render: function () {
    return (
      <div className="item" className={this.props.item.type}>
        <MarkdownText {...this.props} text={this.props.item.text}/>
      </div>
    )
  }
})

export const PageFold = React.createClass({
  render: function () {
    return <div className="item pagefold">
      <span>{this.props.item.text}</span>
    </div>
  }
})

export const Paragraph = React.createClass({
  render: function () {
    return (
      <div className="item" className={this.props.item.type}>
        <p>
          <ResolvedText {...this.props} text={this.props.item.text}/>
        </p>
      </div>
    );
  }
})

export const Reference = React.createClass({
  render: function () {
    var referenceContext = this.props.context
    if (referenceContext.indexOf(this.props.item.site) == -1) {
      referenceContext = referenceContext.concat(this.props.item.site)
    }

    return (
      <div className="item" className={this.props.item.type}>
        <p>
          <a href=''><img
            style={{
        width: 12,
        marginRight: 5
      }}
            src={'http://' + this.props.item.site + '/favicon.png'}/></a>
          <InternalLink
            key={1}
            {...this.props}
            context={referenceContext}
            site={this.props.item.site}
            text={this.props.item.title}/>
          —
          <ResolvedText
            {...this.props}
            context={referenceContext}
            text={this.props.item.text}/>
        </p>
      </div>
    )
  }
})

export const Video = React.createClass({
  render: function () {
    var parse = function (text) {
      var result = {
        caption: ""
      }
      var lines = text.split(/\r\n?|\n/)
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i]
        var match = line.match(/^\s*([A-Z0-9]+)\s+([\w\.\-\/+0-9]+)\s*$/)
        if (match) {
          result.player = match[1]
          result.key = match[2]
        } else {
          match = line.match(/^\s*([A-Z0-9]+)\s+([A-Za-z\,]+)\s+([\w\.\-\/+0-9]+)\s*$/)
          if (match) {
            result.player = match[1] + '/' + match[2]
            result.key = match[3]
          } else {
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
    var lookupUrl = function (result) {

      var template = players[result.player]
      if (template == undefined) 
        return undefined

      return template.replace("#{key}", result.key)
    }

    var result = parse(this.props.item.text)
    var url = lookupUrl(result)
    var player = url
      ? <iframe src={url} frameBorder="0" allowFullScreen/>
      : <div className="surround">{result.player + " " + result.key}</div>

    return (
      <div className="item">
        {player}
        <i><ResolvedText text={result.caption} {...this.props}/></i>
      </div>
    )
  }
})

export const MissingPlugin = React.createClass({
  render: function () {
    return (
      <div className="item missing">
        Missing '{this.props.item.type}' plugin
      </div>
    )
  }
})
