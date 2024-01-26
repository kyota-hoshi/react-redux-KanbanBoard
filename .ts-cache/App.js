import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import produce from 'immer';
import { randomId, sortBy, reorderPatch } from './util';
import { api } from './api';
import { Header as _Header } from './Header';
import { MainArea } from './MainArea';
import { DeleteDialog } from './DeleteDialog';
import { Overlay as _Overlay } from './Overlay';
export function App() {
    const dispatch = useDispatch();
    const filterValue = useSelector(state => state.filterValue);
    const setFilterValue = (value) => {
        dispatch({
            type: 'Filter.setFilter',
            payload: {
                value,
            },
        });
    };
    const [{ columns, cardsOrder }, setData] = useState({ cardsOrder: {} });
    useEffect(() => {
        ;
        (async () => {
            const columns = await api('GET /v1/columns', null);
            setData(produce((draft) => {
                draft.columns = columns;
            }));
            const [unorderedCards, cardsOrder] = await Promise.all([
                await api('GET /v1/cards', null),
                await api('GET /v1/cardsOrder', null),
            ]);
            setData(produce((draft) => {
                var _a;
                draft.cardsOrder = cardsOrder;
                (_a = draft.columns) === null || _a === void 0 ? void 0 : _a.forEach(column => {
                    column.cards = sortBy(unorderedCards, cardsOrder, column.id);
                });
            }));
        })();
    }, []);
    const [draggingCardID, setDraggingCardID] = useState(undefined);
    const setText = (columnId, value) => {
        setData(produce((draft) => {
            var _a;
            const column = (_a = draft.columns) === null || _a === void 0 ? void 0 : _a.find(c => c.id === columnId);
            if (!column)
                return;
            column.text = value;
        }));
    };
    const addCard = (columnId) => {
        const column = columns === null || columns === void 0 ? void 0 : columns.find(c => c.id === columnId);
        if (!column)
            return;
        const text = column.text;
        const cardId = randomId();
        const patch = reorderPatch(cardsOrder, cardId, cardsOrder[columnId]);
        setData(produce((draft) => {
            var _a;
            const column = (_a = draft.columns) === null || _a === void 0 ? void 0 : _a.find(c => c.id === columnId);
            if (!(column === null || column === void 0 ? void 0 : column.cards))
                return;
            column.cards.unshift({
                id: cardId,
                text: column.text,
            });
            column.text = '';
            draft.cardsOrder = {
                ...draft.cardsOrder,
                ...patch,
            };
        }));
        api('POST /v1/cards', {
            id: cardId,
            text,
        });
        api('PATCH /v1/cardsOrder', patch);
    };
    const [deleteCardId, setDeleteCardId] = useState(undefined);
    const dropCardTo = (toId) => {
        const fromID = draggingCardID;
        if (!fromID)
            return;
        setDraggingCardID(undefined);
        if (fromID === toId)
            return;
        const patch = reorderPatch(cardsOrder, fromID, toId);
        setData(produce((draft) => {
            var _a, _b, _c;
            draft.cardsOrder = {
                ...draft.cardsOrder,
                ...patch,
            };
            const unorderedCards = (_b = (_a = draft.columns) === null || _a === void 0 ? void 0 : _a.flatMap(c => { var _a; return (_a = c.cards) !== null && _a !== void 0 ? _a : []; })) !== null && _b !== void 0 ? _b : [];
            (_c = draft.columns) === null || _c === void 0 ? void 0 : _c.forEach(column => {
                column.cards = sortBy(unorderedCards, draft.cardsOrder, column.id);
            });
        }));
        api('PATCH /v1/cardsOrder', patch);
    };
    const deleteCard = () => {
        const cardId = deleteCardId;
        if (!cardId)
            return;
        setDeleteCardId(undefined);
        const patch = reorderPatch(cardsOrder, cardId);
        setData(produce((draft) => {
            var _a;
            const column = (_a = draft.columns) === null || _a === void 0 ? void 0 : _a.find(col => { var _a; return (_a = col.cards) === null || _a === void 0 ? void 0 : _a.some(c => c.id === cardId); });
            if (!(column === null || column === void 0 ? void 0 : column.cards))
                return;
            column.cards = column.cards.filter(c => c.id !== cardId);
            draft.cardsOrder = {
                ...draft.cardsOrder,
                ...patch,
            };
        }));
        api('DELETE /v1/cards', {
            id: cardId,
        });
        api('PATCH /v1/cardsOrder', patch);
    };
    return (React.createElement(Container, null,
        React.createElement(Header, { filterValue: filterValue, onFilterChange: setFilterValue }),
        React.createElement(MainArea, { filterValue: filterValue, columns: columns, setDraggingCardID: setDraggingCardID, dropCardTo: dropCardTo, onCardDeleteClick: cardId => setDeleteCardId(cardId), onTextChange: setText, onTextConfirm: addCard }),
        deleteCardId && (React.createElement(Overlay, { onClick: () => setDeleteCardId(undefined) },
            React.createElement(DeleteDialog, { onConfirm: deleteCard, onCancel: () => setDeleteCardId(undefined) })))));
}
const Container = styled.div `
  display: flex;
  flex-flow: column;
  height: 100%;
`;
const Header = styled(_Header) `
  flex-shrink: 0;
`;
const Overlay = styled(_Overlay) `
  display: flex;
  justify-content: center;
  align-items: center;
`;
