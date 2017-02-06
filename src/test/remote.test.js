import React from 'react'
import renderer from 'react-test-renderer'
import nock from 'nock'

import Remote from '../remote'

jest.mock('../page', () => 'Page')

describe('Remote', () => {
  const instance = {
    "context": undefined,
    "id": 44000000000,
    "site": "ward.bay.wiki.org",
    "slug": "active-journal",
    "story": undefined,
    "title": undefined
  }
  nock('http://ward.bay.wiki.org:80')
    .get('/active-journal.json')
    .reply(200, require('./fixtures/active-journal.json'))

  it('renders correctly', (done) => {
    window.dispatchEvent = jest.fn()
    const remote = renderRemote({instance})
    setTimeout(() => {
      expect(window.dispatchEvent).toHaveBeenCalled()
      done()
    }, 10)
  })
})

function renderRemote(props = {}) {
  return renderer.create(<Remote {...props}></Remote>).toJSON()
}