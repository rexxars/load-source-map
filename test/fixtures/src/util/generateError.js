export const generateError = (prefix = 'Meh', message = 'Some error') => new Error(`${prefix}: ${message}`)
