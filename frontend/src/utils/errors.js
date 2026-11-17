export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.response?.data?.message) return error.response.data.message
  if (!error?.response) return 'Cannot reach the server. Please check your connection and try again.'
  return fallback
}

export function isRequestCanceled(error) {
  return error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError' || error?.__CANCEL__ === true
}
