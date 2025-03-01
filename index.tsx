import React from "react";
import App from "./App.tsx";

import { AppRegistry } from 'react-native';

AppRegistry.registerComponent('App', () => App);
AppRegistry.runApplication('App', {
  initialProps: {},
  rootTag: document.getElementById('root')
})


