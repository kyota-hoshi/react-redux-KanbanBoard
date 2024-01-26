import { Reducer } from 'react'
import produce from 'immer'
import { sortBy, reorderPatch } from './util'
import { CardId, ColumnId } from './api'

export type State = {
  filterValue: string
  columns?: {
    id: ColumnId
    title?: string
    text?: string
    cards?: {
      id: CardId
      text?: string
    }[]
  }[]
  cardsOrder: Record<string, CardId | ColumnId | null>
  deletingCardId?: CardId
  draggingCardId?: CardId
}

const initialState: State = {
  filterValue: '',
  cardsOrder: {},
}

export type Action =
  | {
      type: 'Filter.SetFilter'
      payload: {
        value: string
      }
    }
  | {
      type: 'App.SetColumns'
      payload: {
        columns: {
          id: ColumnId
          title?: string
          text?: string
        }[]
      }
    }
  | {
      type: 'App.SetCards'
      payload: {
        cards: {
          id: CardId
          text?: string
        }[]
        cardsOrder: Record<string, CardId | ColumnId | null>
      }
    }
  | {
      type: 'Card.SetDeletingCard'
      payload: {
        cardId: CardId
      }
    }
  | {
      type: 'Dialog.ConfirmDelete'
    }
  | {
      type: 'Dialog.CancelDelete'
    }
  | {
      type: 'Card.StartDragging'
      payload: {
        cardId: CardId
      }
    }
  | {
      type: 'Card.EndDragging'
    }
  | {
      type: 'Card.Drop'
      payload: {
        toId: CardId | ColumnId
      }
    }
  | {
      type: 'InputForm.SetText'
      payload: {
        columnId: ColumnId
        value: string
      }
    }
  | {
      type: 'InputForm.ConfirmInput'
      payload: {
        columnId: ColumnId
        cardId: CardId
      }
    }

export const reducer: Reducer<State, Action> = produce(
  (draft: State, action: Action) => {
    switch (action.type) {
      case 'Filter.SetFilter': {
        const { value } = action.payload

        draft.filterValue = value
        return
      }

      case 'App.SetColumns': {
        const { columns } = action.payload

        draft.columns = columns
        return
      }

      case 'App.SetCards': {
        const { cards: unorderedCards, cardsOrder } = action.payload

        draft.cardsOrder = cardsOrder
        draft.columns?.forEach(column => {
          column.cards = sortBy(unorderedCards, cardsOrder, column.id)
        })
        return
      }

      case 'Card.SetDeletingCard': {
        const { cardId } = action.payload

        draft.deletingCardId = cardId
        return
      }

      case 'Dialog.ConfirmDelete': {
        const cardId = draft.deletingCardId
        if (!cardId) return

        draft.deletingCardId = undefined

        const column = draft.columns?.find(col =>
          col.cards?.some(c => c.id === cardId),
        )
        if (!column?.cards) return

        column.cards = column.cards.filter(c => c.id !== cardId)

        const patch = reorderPatch(draft.cardsOrder, cardId)
        draft.cardsOrder = {
          ...draft.cardsOrder,
          ...patch,
        }
        return
      }

      case 'Dialog.CancelDelete': {
        draft.deletingCardId = undefined
        return
      }

      case 'Card.StartDragging': {
        const { cardId } = action.payload

        draft.draggingCardId = cardId
        return
      }

      case 'Card.EndDragging': {
        draft.draggingCardId = undefined
        return
      }

      case 'Card.Drop': {
        const fromId = draft.draggingCardId
        if (!fromId) return

        draft.draggingCardId = undefined

        const { toId } = action.payload
        if (fromId === toId) return

        const patch = reorderPatch(draft.cardsOrder, fromId, toId)
        draft.cardsOrder = {
          ...draft.cardsOrder,
          ...patch,
        }

        const unorderedCards = draft.columns?.flatMap(c => c.cards ?? []) ?? []
        draft.columns?.forEach(column => {
          column.cards = sortBy(unorderedCards, draft.cardsOrder, column.id)
        })
        return
      }

      case 'InputForm.SetText': {
        const { columnId, value } = action.payload

        const column = draft.columns?.find(column => column.id === columnId)
        if (!column) return

        column.text = value
        return
      }

      case 'InputForm.ConfirmInput': {
        const { columnId, cardId } = action.payload

        const column = draft.columns?.find(column => column.id === columnId)
        if (!column) return

        column.cards?.unshift({
          id: cardId,
          text: column.text,
        })
        column.text = ''

        const patch = reorderPatch(
          draft.cardsOrder,
          cardId,
          draft.cardsOrder[columnId],
        )
        draft.cardsOrder = {
          ...draft.cardsOrder,
          ...patch,
        }
        return
      }

      default: {
        const _: never = action
      }
    }
  },
  initialState,
)
