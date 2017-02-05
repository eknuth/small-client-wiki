import React from 'react'
import renderer from 'react-test-renderer'

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
  it('renders correctly', () => {
    expect(renderRemote({instance})).toMatchSnapshot()
  })
})

function renderRemote(props = {}) {
  return renderer.create(
    <Remote {...props}></Remote>
  ).toJSON()
}