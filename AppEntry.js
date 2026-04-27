import 'react-native-gesture-handler';
import './global.css';

import { registerRootComponent } from 'expo';

const compiled = require('./target/out-rn/index.js');
const BreakdexApp = compiled.default || compiled;

registerRootComponent(BreakdexApp);

export default BreakdexApp;
