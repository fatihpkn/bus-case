export type AlertErrorType = {
  message: string
  type: 'alert'
  level: 'error' | 'warning' | 'success' | 'info'
}

export function AlertError({ message, level }: AlertErrorType) {
  return {
    message,
    type: 'alert',
    level,
  }
}
