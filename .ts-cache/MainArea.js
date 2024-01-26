import React from 'react';
import styled from 'styled-components';
import { Column } from './Column';
export function MainArea({ filterValue, columns, setDraggingCardID, dropCardTo, onCardDeleteClick, onTextChange, onTextConfirm, }) {
    return (React.createElement(MainAreaContainer, null,
        React.createElement(HorizontalScroll, null, !columns ? (React.createElement(Loading, null)) : (columns === null || columns === void 0 ? void 0 : columns.map(({ id: columnId, title, cards, text }) => (React.createElement(Column, { key: columnId, title: title, filterValue: filterValue, cards: cards, onCardDragStart: cardId => setDraggingCardID === null || setDraggingCardID === void 0 ? void 0 : setDraggingCardID(cardId), onCardDrop: entered => dropCardTo === null || dropCardTo === void 0 ? void 0 : dropCardTo(entered !== null && entered !== void 0 ? entered : columnId), onCardDeleteClick: onCardDeleteClick, text: text, onTextChange: value => onTextChange === null || onTextChange === void 0 ? void 0 : onTextChange(columnId, value), onTextConfirm: () => onTextConfirm === null || onTextConfirm === void 0 ? void 0 : onTextConfirm(columnId) })))))));
}
const MainAreaContainer = styled.div `
  height: 100%;
  padding: 16px 0;
  overflow-y: auto;
`;
const HorizontalScroll = styled.div `
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
`;
const Loading = styled.div.attrs({
    children: 'Loading...',
}) `
  font-size: 14px;
`;
