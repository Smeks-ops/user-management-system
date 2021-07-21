import { User } from '../models'
import { join } from 'path'
import { Router } from "express"
import { DOMAIN } from '../constants'
import sendMail from '../functions/emailSender'
import { RegisteredValidations, AuthenticateValidations } from '../validators/user-validators'
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
      let { username, email } = req.body;
      // Check if the username is taken or not
      let user = await User.findOne({ username });
      if (user) {
        return res.status(400).json({
          success: false,
          message: "Username is already taken.",
        });
      }
      // Check if the user exists with that email
      user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({
          success: false,
          message:
            "Email is already registered. Did you forget the password. Try resetting it.",
        });
      }
      user = new User({
        ...req.body,
        verificationCode: randomBytes(20).toString("hex")
      })
      await user.save()
      //  Send the email with verification link
      let html = `
    <div>
    <h1>Hello, ${user.username} </h1>
    <p>Please click the following link to verify your account</p>
    <a href="${DOMAIN}/users/verify-now/${user.verificationCode}">Verify Now</a>
    </div>
    `
      await sendMail(user.email, "Verify Account", "Please verify your account", html)
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

/** 
 * @description To verify a new user's account via  email
 * @access Public <Only via email>
 * @api /users/verify-now/verificationCode
 * @type GET
 */
router.get('/verify-now/:verificationCode', async (req, res) => {
  try {
    let { verificationCode } = req.params
    let user = await User.findOne({ verificationCode })
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorised access. Invalid verification code."
      })
    }
    user.verified = true
    user.verificationCode = undefined
    await user.save()
    return res.sendFile(join(__dirname, '../templates/verification-succces.html'))
  } catch (error) {
    console.log("ERR", error.message)
    // return res.sendFile(join(__dirname, '../templates/errors.html'))
  }
})


/**
 * @description To aiuthenticate an user and get auth token
 * @api /users/api/authenticate
 * @access PUBLIC
 * @type POST
 */
router.post(
  "/api/authenticate",
  AuthenticateValidations,
  validator,
  async (req, res) => {
    try {
      let { username, password } = req.body;
      let user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Username not found.",
        });
      }
      if (!(await user.comparePassword(password))) {
        return res.status(401).json({
          success: false,
          message: "Incorrect password.",
        });
      }
      let token = await user.generateJWT();
      return res.status(200).json({
        success: true,
        user: user.getUserInfo(),
        token: `Bearer ${token}`,
        message: "Hurray! You are now logged in.",
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "An error occurred.",
      });
    }
  }
);


export default router