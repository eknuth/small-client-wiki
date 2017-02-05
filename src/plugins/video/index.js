import React from 'react'

import ResolvedText from '../../text'

export default React.createClass({
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
