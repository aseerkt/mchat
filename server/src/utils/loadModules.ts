import moduleAlias from 'module-alias'
import path from 'node:path'

if (!process.env.NO_ALIAS) {
  moduleAlias.addAliases({ '@': path.resolve(__dirname, '..', '..', 'dist') })
}
