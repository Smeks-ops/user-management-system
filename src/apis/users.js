import { User } from '../models'
import { Router } from "express"
import { RegisteredValidations } from '../validators/user-validators'
import validator from "../middlewares/validator-middleware"

const router = Router()

/** 
 * @description To create a new user account
 * @access Public
 * @api /users/api/register
 * @type POST
 */
router.post(
  '/api/register',
  RegisteredValidations,
  validator,
  async (req, res) => {
    let { username, email } = req.body
    // check if username is taken or not
    let user = User.findOne({ username })
    if (user) {
      return res.status(400).json({
        success: false,
        message: "Username is already taken."
      })
    }
    //check if the user exists with that email
    user = User.findOne({ email })
    if (user) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered. Did you forget the password? Try resetting it."
      })
    }

  }
)

export default router