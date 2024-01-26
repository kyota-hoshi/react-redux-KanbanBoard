import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useSelector, useDispatch } from 'react-redux'
import { api } from './api'
import { Header as _Header } from './Header'
import { MainArea } from './MainArea'
import { DeleteDialog } from './DeleteDialog'
import { Overlay as _Overlay } from './Overlay'

export function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    ;(async () => {
      const columns = await api('GET /v1/columns', null)

      dispatch({
        type: 'App.SetColumns',
        payload: {
          columns,
        },
      })

      const [unorderedCards, cardsOrder] = await Promise.all([
        await api('GET /v1/cards', null),
        await api('GET /v1/cardsOrder', null),
      ])

      dispatch({
        type: 'App.SetCards',
        payload: {
          cards: unorderedCards,
          cardsOrder,
        },
      })
    })()
  }, [dispatch])

  return (
    <Container>
      <Header />
      <MainArea />

      <DialogOverlay />
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-flow: column;
  height: 100%;
`

const Header = styled(_Header)`
  flex-shrink: 0;
`

function DialogOverlay() {
  const dispatch = useDispatch()
  const cardIsBeingDeleted = useSelector(state => Boolean(state.deletingCardId))

  const cancelDelete = () => {
    dispatch({
      type: 'Dialog.CancelDelete',
    })
  }

  if (!cardIsBeingDeleted) {
    return null
  }

  return (
    <Overlay onClick={cancelDelete}>
      <DeleteDialog />
    </Overlay>
  )
}

const Overlay = styled(_Overlay)`
  display: flex;
  justify-content: center;
  align-items: center;
`
