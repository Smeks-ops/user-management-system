import { validationResult } from 'express-validator'

//Custom middleware
// const custtomMiddleware =(req, res,next) => {

// }

const validationMiddleware = (req, res, next) => {
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.json({
      errors: errors.array(),
    })
  }
}

export default validationMiddleware;