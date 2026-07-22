import { existsSync } from 'node:fs'
import { registerHooks } from 'node:module'

// The application uses extensionless TypeScript imports for Vite. Node's
// built-in TypeScript support intentionally requires explicit extensions, so
// this test-only resolver adds `.ts` when an application import omits it.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && !/\.[a-z0-9]+$/i.test(specifier)) {
      const candidate = new URL(`${specifier}.ts`, context.parentURL)
      if (existsSync(candidate)) {
        return nextResolve(candidate.href, context)
      }
    }

    return nextResolve(specifier, context)
  },
})
