import React, { useState, useRef } from 'react'
import styled from 'styled-components'
import { useSelector, useDispatch } from 'react-redux'
import { reorderPatch } from './util'
import { api, CardId, ColumnId } from './api'
import * as color from './color'
import { CheckIcon as _CheckIcon, TrashIcon } from './icon'

Card.DropArea = DropArea

export function Card({ id }: { id: CardId }) {
  const dispatch = useDispatch()
  const card = useSelector(state =>
    state.columns?.flatMap(column => column.cards ?? []).find(c => c.id === id),
  )
  const drag = useSelector(state => state.draggingCardId === id)

  const onDeleteClick = () =>
    dispatch({
      type: 'Card.SetDeletingCard',
      payload: {
        cardId: id,
      },
    })

  if (!card) {
    return null
  }
  const { text } = card

  return (
    <CardContainer
      style={{ opacity: drag ? 0.5 : undefined }}
      onDragStart={() => {
        dispatch({
          type: 'Card.StartDragging',
          payload: {
            cardId: id,
          },
        })
      }}
      onDragEnd={() => {
        dispatch({
          type: 'Card.EndDragging',
        })
      }}
    >
      <CheckIcon />
      {text?.split(/(https?:\/\/\s+)/g).map((fragment, i) =>
        i % 2 === 0 ? (
          <CardText key={i}>{fragment}</CardText>
        ) : (
          <CardLink key={i} href={fragment}>
            {fragment}
          </CardLink>
        ),
      )}
      <DeleteButton onClick={onDeleteClick} />
    </CardContainer>
  )
}

const CardContainer = styled.div.attrs({
  draggable: true,
})`
  position: relative;
  border: solid 1px ${color.Silver};
  border-radius: 6px;
  box-shadow: 0 1px 3px hsla(0, 0%, 7%, 0.1);
  padding: 8px 32px;
  background-color: ${color.White};
  cursor: move;
`

const CheckIcon = styled(_CheckIcon)`
  position: absolute;
  top: 12px;
  left: 8px;
  color: ${color.Green};
`

const DeleteButton = styled.button.attrs({
  type: 'button',
  children: <TrashIcon />,
})`
  position: absolute;
  top: 12px;
  right: 8px;
  font-size: 14px;
  color: ${color.Gray};

  :hover {
    color: ${color.Red};
  }
`

const CardText = styled.span`
  color: ${color.Black};
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-wrap;
`

const CardLink = styled.a.attrs({
  target: '_blank',
  rel: 'noopener noreferrer',
})`
  color: ${color.Blue};
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-wrap;
`

function DropArea({
  targetId: toId,
  disabled,
  children,
  className,
  style,
}: {
  targetId: CardId | ColumnId
  disabled?: boolean
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  const dispatch = useDispatch()
  const draggingCardId = useSelector(state => state.draggingCardId)
  const cardsOrder = useSelector(state => state.cardsOrder)

  const [isTarget, setIsTarget] = useState(false)
  const visible = !disabled && isTarget

  const [dragOver, onDragOver] = useDragAutoLeave()

  return (
    <DropAreaContainer
      style={style}
      className={className}
      onDragOver={ev => {
        if (disabled) return

        ev.preventDefault()
        onDragOver(() => setIsTarget(false))
      }}
      onDragEnter={() => {
        if (disabled || dragOver.current) return

        onDragOver(() => setIsTarget(false))
        setIsTarget(true)
      }}
      onDrop={() => {
        if (disabled) return
        if (!draggingCardId || draggingCardId === toId) return

        dispatch({
          type: 'Card.Drop',
          payload: {
            toId,
          },
        })

        const patch = reorderPatch(cardsOrder, draggingCardId, toId)
        api('PATCH /v1/cardsOrder', patch)

        setIsTarget(false)
      }}
    >
      <DropAreaIndicator
        style={{
          height: !visible ? 0 : undefined,
          borderWidth: !visible ? 0 : undefined,
        }}
      />

      {children}
    </DropAreaContainer>
  )
}

/**
 * dragOver イベントが継続中かどうかのフラグを ref として返す
 *
 * timeout 経過後に自動でフラグが false になる
 *
 * @param timeout 自動でフラグを false にするまでの時間 (ms)
 */
function useDragAutoLeave(timeout: number = 100) {
  const dragOver = useRef(false)
  const timer = useRef(0)

  return [
    dragOver,

    /**
     * @param onDragLeave フラグが false になるときに呼ぶコールバック
     */
    (onDragLeave?: () => void) => {
      clearTimeout(timer.current)

      dragOver.current = true
      timer.current = window.setTimeout(() => {
        dragOver.current = false
        onDragLeave?.()
      }, timeout)
    },
  ] as const
}

const DropAreaContainer = styled.div`
  > :not(:first-child) {
    margin-top: 8px;
  }
`

const DropAreaIndicator = styled.div`
  height: 40px;
  border: dashed 3px ${color.Gray};
  border-radius: 6px;
  transition: all 50ms ease-out;
`
