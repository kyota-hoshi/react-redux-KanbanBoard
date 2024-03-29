import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import * as color from './color';
import { CheckIcon as _CheckIcon, TrashIcon } from './icon';
Card.DropArea = DropArea;
export function Card({ text, onDragStart, onDragEnd, onDeleteClick, }) {
    const [drag, setDrag] = useState(false);
    return (React.createElement(CardContainer, { style: { opacity: drag ? 0.5 : undefined }, onDragStart: () => {
            onDragStart === null || onDragStart === void 0 ? void 0 : onDragStart();
            setDrag(true);
        }, onDragEnd: () => {
            onDragEnd === null || onDragEnd === void 0 ? void 0 : onDragEnd();
            setDrag(false);
        } },
        React.createElement(CheckIcon, null), text === null || text === void 0 ? void 0 :
        text.split(/(https?:\/\/\s+)/g).map((fragment, i) => i % 2 === 0 ? (React.createElement(CardText, { key: i }, fragment)) : (React.createElement(CardLink, { key: i, href: fragment }, fragment))),
        React.createElement(DeleteButton, { onClick: onDeleteClick })));
}
const CardContainer = styled.div.attrs({
    draggable: true,
}) `
  position: relative;
  border: solid 1px ${color.Silver};
  border-radius: 6px;
  box-shadow: 0 1px 3px hsla(0, 0%, 7%, 0.1);
  padding: 8px 32px;
  background-color: ${color.White};
  cursor: move;
`;
const CheckIcon = styled(_CheckIcon) `
  position: absolute;
  top: 12px;
  left: 8px;
  color: ${color.Green};
`;
const DeleteButton = styled.button.attrs({
    type: 'button',
    children: React.createElement(TrashIcon, null),
}) `
  position: absolute;
  top: 12px;
  right: 8px;
  font-size: 14px;
  color: ${color.Gray};

  :hover {
    color: ${color.Red};
  }
`;
const CardText = styled.span `
  color: ${color.Black};
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-wrap;
`;
const CardLink = styled.a.attrs({
    target: '_blank',
    rel: 'noopener noreferrer',
}) `
  color: ${color.Blue};
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-wrap;
`;
function DropArea({ disabled, onDrop, children, className, style, }) {
    const [isTarget, setIsTarget] = useState(false);
    const visible = !disabled && isTarget;
    const [dragOver, onDragOver] = useDragAutoLeave();
    return (React.createElement(DropAreaContainer, { style: style, className: className, onDragOver: ev => {
            if (disabled)
                return;
            ev.preventDefault();
            onDragOver(() => setIsTarget(false));
        }, onDragEnter: () => {
            if (disabled || dragOver.current)
                return;
            onDragOver(() => setIsTarget(false));
            setIsTarget(true);
        }, onDrop: () => {
            if (disabled)
                return;
            setIsTarget(false);
            onDrop === null || onDrop === void 0 ? void 0 : onDrop();
        } },
        React.createElement(DropAreaIndicator, { style: {
                height: !visible ? 0 : undefined,
                borderWidth: !visible ? 0 : undefined,
            } }),
        children));
}
/**
 * dragOver イベントが継続中かどうかのフラグを ref として返す
 *
 * timeout 経過後に自動でフラグが false になる
 *
 * @param timeout 自動でフラグを false にするまでの時間 (ms)
 */
function useDragAutoLeave(timeout = 100) {
    const dragOver = useRef(false);
    const timer = useRef(0);
    return [
        dragOver,
        /**
         * @param onDragLeave フラグが false になるときに呼ぶコールバック
         */
        (onDragLeave) => {
            clearTimeout(timer.current);
            dragOver.current = true;
            timer.current = window.setTimeout(() => {
                dragOver.current = false;
                onDragLeave === null || onDragLeave === void 0 ? void 0 : onDragLeave();
            }, timeout);
        },
    ];
}
const DropAreaContainer = styled.div `
  > :not(:first-child) {
    margin-top: 8px;
  }
`;
const DropAreaIndicator = styled.div `
  height: 40px;
  border: dashed 3px ${color.Gray};
  border-radius: 6px;
  transition: all 50ms ease-out;
`;
