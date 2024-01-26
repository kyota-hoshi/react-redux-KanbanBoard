import React from 'react'
import styled from 'styled-components'
import { Column } from './Column'
import { useSelector, shallowEqual } from 'react-redux'

export function MainArea() {
  const columns = useSelector(
    state => state.columns?.map(v => v.id),
    shallowEqual,
  )
  return (
    <MainAreaContainer>
      <HorizontalScroll>
        {!columns ? (
          <Loading />
        ) : (
          columns?.map(id => <Column key={id} id={id} />)
        )}
      </HorizontalScroll>
    </MainAreaContainer>
  )
}

const MainAreaContainer = styled.div`
  height: 100%;
  padding: 16px 0;
  overflow-y: auto;
`

const HorizontalScroll = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  overflow-x: auto;

  > * {
    margin-left: 16px;
    flex-shrink: 0;
  }

  ::after {
    display: block;
    flex: 0 0 16px;
    content: '';
  }
`

const Loading = styled.div.attrs({
  children: 'Loading...',
})`
  font-size: 14px;
`
