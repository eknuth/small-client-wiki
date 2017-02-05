import React from 'react'
import renderer from 'react-test-renderer'

import { Lineup } from '../lineup'

jest.mock('../remote', () => 'Remote')

// page id comes from a random number, mock it
let idStart = 42
Math.random = jest.fn(() => idStart++);

describe ('lineup', () => {
  beforeEach (() => window.location.hash = '')
  it('has initial state with default site', () => {
    expect(renderLineup()).toMatchSnapshot()
  })
  it('Lineup renders correctly', () => {
    const hash = '#ward.bay.wiki.org/active-journal/forage.ward.fed.wiki.org/december-journal'
    expect(renderLineup(hash)).toMatchSnapshot()
  })
})

function renderLineup (hash=null) {
  window.location.hash = hash
  return renderer.create(
    <Lineup></Lineup>
  ).toJSON()
}