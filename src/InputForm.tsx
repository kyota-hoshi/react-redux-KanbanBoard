import React, { useRef, useEffect } from 'react'
import styled from 'styled-components'
import { useSelector, useDispatch } from 'react-redux'
import { randomId, reorderPatch } from './util'
import * as color from './color'
import { Button, ConfirmButton } from './Button'
import { ColumnId, CardId, api } from './api'

export function InputForm({
  columnId,
  onCancel,
  className,
}: {
  columnId: ColumnId
  onCancel?(): void
  className?: string
}) {
  const dispatch = useDispatch()
  const value = useSelector(
    state => state.columns?.find(c => c.id === columnId)?.text,
  )
  const cardsOrder = useSelector(state => state.cardsOrder)

  const onChange = (value: string) =>
    dispatch({
      type: 'InputForm.SetText',
      payload: {
        columnId,
        value,
      },
    })

  const disabled = !value?.trim()
  const handleConfirm = () => {
    if (disabled) return

    const text = value

    const cardId = randomId() as CardId

    const patch = reorderPatch(cardsOrder, cardId, cardsOrder[columnId])

    dispatch({
      type: 'InputForm.ConfirmInput',
      payload: {
        columnId,
        cardId,
      },
    })

    api('POST /v1/cards', {
      id: cardId,
      text,
    })
    api('PATCH /v1/cardsOrder', patch)
  }

  const ref = useAutoFitToContentHeight(value)

  return (
    <Container className={className}>
      <Input
        ref={ref}
        autoFocus
        placeholder="Enter a note"
        value={value}
        onChange={ev => onChange(ev.currentTarget.value)}
        onKeyDown={ev => {
          if (!((ev.metaKey || ev.ctrlKey) && ev.key === 'Enter')) return
          handleConfirm()
        }}
      />

      <ButtonRow>
        <AddButton disabled={disabled} onClick={handleConfirm} />
        <CancelButton onClick={onCancel} />
      </ButtonRow>
    </Container>
  )
}

/**
 * テキストエリアの高さを内容に合わせて自動調整する
 *
 * @param content テキストエリアの内容
 */
function useAutoFitToContentHeight(content: string | undefined) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const { borderTopWidth, borderBottomWidth } = getComputedStyle(el)
    el.style.height = 'auto'
    el.style.height = `calc(${borderTopWidth} + ${el.scrollHeight} + ${borderBottomWidth})`
  }, [content])

  return ref
}

const Container = styled.div``

const Input = styled.textarea`
  display: block;
  width: 95%;
  margin-bottom: 8px;
  border: solid 1px ${color.Silver};
  border-radius: 3px;
  padding: 6px 8px;
  background-color: ${color.White};
  font-size: 14px;
  line-height: 1.7;

  :focus {
    outline: none;
    border-color: ${color.Blue};
  }
`

const ButtonRow = styled.div`
  display: flex;

  > :not(:first-child) {
    margin-left: 8px;
  }
`

const AddButton = styled(ConfirmButton).attrs({
  children: 'Add',
})``

const CancelButton = styled(Button).attrs({
  children: 'Cancel',
})``
