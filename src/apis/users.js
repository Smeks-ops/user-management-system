import { User } from '../models'
import { Router } from "express"
import sendMail from '../functions/emailSender'
import { RegisteredValidations } from '../validators/user-validators'
import validator from "../middlewares/validator-middleware"
import { randomBytes } from 'crypto'

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
    try {
      // let { username, email } = req.body
      // check if username is taken or not
      // let user = User.findOne({ username })
      // if (user) {
      //   return res.status(400).json({
      //     success: false,
      //     message: "Username is already taken."
      //   })
      // }
      // //check if the user exists with that email
      // user = User.findOne({ email })
      // if (user) {
      //   return res.status(400).json({
      //     success: false,
      //     message: "Email is already registered. Did you forget the password? Try resetting it."
      //   })
      // }
      let user = new User({
        ...req.body,
        verificationCode: randomBytes(20).toString("hex")
      })
      await user.save()
      //  Send the email with verification link
      let html = `
    <div>
    <h1>Hello, ${user.username} </h1>
    <p>Please click the following link to verify your account</p>
    <a href="/users/verify-now/${user.verificationCode}">Verify Now</a>
    </div>
    `
      sendMail(user.email, "Verify Account", "Please verify your account", html)
      return res.status(201).json({
        success: true,
        message: "Account created, please verify email address."
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "An error occured"
      })
    }
  }
)

export default router