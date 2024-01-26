import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { reducer } from './reducer';
import { GlobalStyle } from './GlobalStyle';
import { App } from './App';
import 'regenerator-runtime';
const store = createStore(reducer);
ReactDOM.render(React.createElement(Provider, { store: store },
    React.createElement(GlobalStyle, null),
    React.createElement(App, null)), document.getElementById('app'));
