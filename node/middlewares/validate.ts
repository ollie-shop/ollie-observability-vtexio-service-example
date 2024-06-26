import { UserInputError } from '@vtex/api'

import { logError, logInfo } from '../utils/applicationLog'

export async function validate(ctx: Context, next: () => Promise<any>) {
  const {
    vtex: {
      route: { params },
    },
  } = ctx

  // console.info('Received params:', params)

  logInfo(ctx, 'validate', {
    msg: 'receveid params',
    params,
  })

  const { code } = params

  if (!code) {
    logError(ctx, 'validate', {
      msg: 'no code provided',
    })
    throw new UserInputError('Code is required') // Wrapper for a Bad Request (400) HTTP Error. Check others in https://github.com/vtex/node-vtex-api/blob/fd6139349de4e68825b1074f1959dd8d0c8f4d5b/src/errors/index.ts
  }

  const codeNumber = parseInt(code as string, 10)

  ctx.state.code = codeNumber

  await next()
}
