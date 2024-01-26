import baretest from 'baretest'
import assert from 'assert'
import produce from 'immer'
import { reducer, State } from '../src/reducer'
import { CardId, ColumnId } from '../src/api'

const test = baretest('reducer')
setImmediate(() => test.run())

const initialState: State = {
  filterValue: '',
  cardsOrder: {},
}

test('Filter.SetFilter', async () => {
  const prev = produce(initialState, draft => {
    draft.filterValue = 'hello'
  })

  const next = reducer(prev, {
    type: 'Filter.SetFilter',
    payload: {
      value: 'welcome',
    },
  })

  const expected = produce(prev, draft => {
    draft.filterValue = 'welcome'
  })

  assert.deepStrictEqual(next, expected)
})

test('App.SetCards', async () => {
  const prev = produce(initialState, draft => {
    draft.columns = [
      {
        id: 'A' as ColumnId,
      },
      {
        id: 'B' as ColumnId,
      },
    ]
  })

  const next = reducer(prev, {
    type: 'App.SetCards',
    payload: {
      cards: [
        {
          id: '3' as CardId,
        },
        {
          id: '2' as CardId,
        },
        {
          id: '1' as CardId,
        },
      ],
      cardsOrder: {
        A: '1' as CardId,
        '1': '2' as CardId,
        '2': 'A' as ColumnId,
        B: '3' as CardId,
        '3': 'B' as ColumnId,
      },
    },
  })

  const expected = produce(prev, draft => {
    draft.cardsOrder = {
      A: '1' as CardId,
      '1': '2' as CardId,
      '2': 'A' as ColumnId,
      B: '3' as CardId,
      '3': 'B' as ColumnId,
    }
    draft.columns = [
      {
        id: 'A' as ColumnId,
        cards: [
          {
            id: '1' as CardId,
          },
          {
            id: '2' as CardId,
          },
        ],
      },
      {
        id: 'B' as ColumnId,
        cards: [
          {
            id: '3' as CardId,
          },
        ],
      },
    ]
  })

  assert.deepStrictEqual(next, expected)
})

test('Card.Drop', async () => {
  const prev = produce(initialState, draft => {
    draft.draggingCardId = '1' as CardId

    draft.cardsOrder = {
      A: '1' as CardId,
      '1': '2' as CardId,
      '2': 'A' as CardId,
      B: '3' as CardId,
      '3': 'B' as CardId,
    }
    draft.columns = [
      {
        id: 'A' as ColumnId,
        cards: [
          {
            id: '1' as CardId,
          },
          {
            id: '2' as CardId,
          },
        ],
      },
      {
        id: 'B' as ColumnId,
        cards: [
          {
            id: '3' as CardId,
          },
        ],
      },
    ]
  })

  const next = reducer(prev, {
    type: 'Card.Drop',
    payload: {
      toId: '3' as CardId,
    },
  })

  const expected = produce(prev, draft => {
    draft.draggingCardId = undefined

    draft.cardsOrder = {
      ...draft.cardsOrder,
      A: '2' as CardId,
      B: '1' as CardId,
      '1': '3' as CardId,
    }

    const [card] = draft.columns![0].cards!.splice(0, 1)
    draft.columns![1].cards!.unshift(card)
  })

  assert.deepStrictEqual(next, expected)
})

test('InputForm.ConfirmInput', async () => {
  const prev = produce(initialState, draft => {
    draft.cardsOrder = {
      A: '1' as CardId,
      '1': '2' as CardId,
      '2': 'A' as CardId,
      B: '3' as CardId,
      '3': 'B' as CardId,
    }
    draft.columns = [
      {
        id: 'A' as ColumnId,
        text: 'hello',
        cards: [
          {
            id: '1' as CardId,
          },
          {
            id: '2' as CardId,
          },
        ],
      },
      {
        id: 'B' as ColumnId,
        cards: [
          {
            id: '3' as CardId,
          },
        ],
      },
    ]
  })

  const next = reducer(prev, {
    type: 'InputForm.ConfirmInput',
    payload: {
      columnId: 'A' as ColumnId,
      cardId: 'new' as CardId,
    },
  })

  const expected = produce(prev, draft => {
    draft.cardsOrder = {
      ...draft.cardsOrder,
      A: 'new' as CardId,
      new: '1' as CardId,
    }

    const column = draft.columns![0]!
    column.text = ''
    column.cards!.unshift({
      id: 'new' as CardId,
      text: 'hello',
    })
  })

  assert.deepStrictEqual(next, expected)
})
