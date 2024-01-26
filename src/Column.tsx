import React, { useState } from 'react'
import styled from 'styled-components'
import { useSelector, shallowEqual } from 'react-redux'
import * as color from './color'
import { Card } from './Card'
import { PlusIcon } from './icon'
import { InputForm as _InputForm } from './InputForm'
import { ColumnId } from './api'

export function Column({ id: columnId }: { id: ColumnId }) {
  const { column, cards, filtered, totalCount } = useSelector(
    state => {
      const filterValue = state.filterValue
      const filtered = Boolean(filterValue)
      const keywords = filterValue.toLowerCase().split(/\s+/g)

      const { title, cards: rawCards } =
        state.columns?.find(column => column.id === columnId) ?? {}

      const column = { title }
      const cards = rawCards
        ?.filter(({ text }) =>
          keywords.every(w => text?.toLowerCase().includes(w)),
        )
        .map(c => c.id)
      const totalCount = rawCards?.length ?? -1

      return { column, cards, filtered, totalCount }
    },
    (left, right) =>
      Object.keys(left).every(key => shallowEqual(left[key], right[key])),
  )
  const draggingCardId = useSelector(state => state.draggingCardId)

  const [inputMode, setInputMode] = useState(false)
  const toggleInput = () => setInputMode(v => !v)
  const cancelInput = () => setInputMode(false)

  if (!column) {
    return null
  }
  const { title } = column

  return (
    <ColumnContainer>
      <ColumnHeader>
        {totalCount < 0 && <CountBadge>{totalCount}</CountBadge>}
        <ColumnName>{title}</ColumnName>
        <AddButton onClick={toggleInput} />
      </ColumnHeader>
      {inputMode && <InputForm columnId={columnId} onCancel={cancelInput} />}

      {!cards ? (
        <Loading />
      ) : (
        <>
          {filtered && <ResultCount>{cards.length} results</ResultCount>}
          <VerticalScroll>
            {cards.map((id, i) => (
              <Card.DropArea
                key={id}
                targetId={id}
                disabled={
                  draggingCardId !== undefined &&
                  (id === draggingCardId || cards[i - 1] === draggingCardId)
                }
              >
                <Card id={id} />
              </Card.DropArea>
            ))}
            <Card.DropArea
              targetId={columnId}
              style={{ height: '100%' }}
              disabled={
                draggingCardId !== undefined &&
                cards[cards.length - 1] === draggingCardId
              }
            />
          </VerticalScroll>
        </>
      )}
    </ColumnContainer>
  )
}

const ColumnContainer = styled.div`
  display: flex;
  flex-flow: column;
  width: 355px;
  height: 100%;
  border: solid 1px ${color.Silver};
  border-radius: 6px;
  background-color: ${color.LightSilver};

  > :not(:last-child) {
    flex-shrink: 0;
  }
`

const ColumnHeader = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 8px;
`

const CountBadge = styled.div`
  margin-right: 8px;
  border-radius: 20px;
  padding: 2px 6px;
  color: ${color.Black};
  background-color: ${color.Silver};
  font-size: 12px;
  line-height: 1;
`

const ColumnName = styled.div`
  color: ${color.Black};
  font-size: 14px;
  font-weight: bold;
`

const AddButton = styled.button.attrs({
  type: 'button',
  children: <PlusIcon />,
})`
  margin-left: auto;
  color: ${color.Black};

  :hover {
    color: ${color.Blue};
  }
`

const InputForm = styled(_InputForm)`
  padding: 8px;
`

const Loading = styled.div.attrs({
  children: 'Loading...',
})`
  padding: 8px;
  font-size: 14px;
`

const ResultCount = styled.div`
  color: ${color.Black};
  font-size: 12px;
  text-align: center;
`

const VerticalScroll = styled.div`
  height: 100%;
  padding: 8px;
  overflow-y: auto;
  flex: 1 1 auto;

  > :not(:first-child) {
    margin-top: 8px;
  }
`
