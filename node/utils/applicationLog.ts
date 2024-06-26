import { nodeConsole } from './nodeConsole'
import logger from './logger'

const createLogModel = (
  ctx: Context,
  functionName: string,
  logData: unknown
): unknown => {
  const log: unknown = {
    vtex: {
      account: ctx.vtex.account,
      workspace: ctx.vtex.workspace,
      appId: process.env.VTEX_APP_ID ?? '',
    },
    data: logData,
    functionName,
  }

  return log
}

export const logError = (ctx: Context, functionName: string, error: any) => {
  try {
    ctx.ollie.logger.error(createLogModel(ctx, functionName, error))
  } catch (e) {
    try {
      logger.error(createLogModel(ctx, functionName, error))
    } catch (catchError) {
      nodeConsole.log(catchError)
    }
  }

  if (process.env.VTEX_APP_LINK) {
    nodeConsole.log(error)
  }
}

export const logDebug = (ctx: Context, functionName: string, info: any) => {
  try {
    ctx.ollie.logger.debug(createLogModel(ctx, functionName, info))
  } catch (e) {
    try {
      logger.debug(createLogModel(ctx, functionName, info))
    } catch (error) {
      nodeConsole.log(error)
    }
  }

  if (process.env.VTEX_APP_LINK) {
    nodeConsole.log(info)
  }
}

export const logInfo = (ctx: Context, functionName: string, info: any) => {
  try {
    ctx.ollie.logger.info(createLogModel(ctx, functionName, info))
  } catch (e) {
    try {
      logger.info(createLogModel(ctx, functionName, info))
    } catch (error) {
      nodeConsole.log(error)
    }
  }

  if (process.env.VTEX_APP_LINK) {
    nodeConsole.log(info)
  }
}

export const logIfLinked = (
  description: string,
  object: unknown = undefined
) => {
  if (process.env.VTEX_APP_LINK) {
    nodeConsole.log(description, object)
  }
}

export const getStackTrace = () => {
  const err = new Error('not an error, this is a trick to get the stack trace')

  return err.stack
}
