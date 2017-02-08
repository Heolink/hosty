import Promise from 'promise'
import fs from 'fs'
import Mac  from './mac'
import { remote } from 'electron'
const pathConfig = remote.app.getPath('userData')

export default class Linux extends Mac {

}
