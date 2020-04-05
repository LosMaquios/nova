import path from 'path'
import ts from 'rollup-plugin-typescript2'

const name = 'nova'

function resolveDist (suffix) {
  return path.resolve(__dirname, `./dist/${name}.${suffix}.js`)
}

function getConfig (format, suffix = format) {
  return {
    input: path.resolve(__dirname, './src/index.ts'),
    output: {
      file: resolveDist(suffix),
      name: 'Nova',
      format
    },
    plugins: [
      ts({
        tsconfigOverride: {
          compilerOptions: {
            sourceMap: format === 'umd',
            declaration: format === 'es',
            declarationMap: format === 'es'
          },
          exclude: ['__test__']
        }
      })
    ]
  }
}

const outputs = [
  getConfig('umd'),
  getConfig('es', 'esm')
]

export default outputs
