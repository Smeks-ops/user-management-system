import { Schema } from "mongoose";
import { compare, hash, Hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { SECRET } from "../constants";
import { randomBytes } from "crypto";
import { pick } from "lodash"

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String,
    required: false
  },
  resetPasswordToken: {
    type: String,
    required: false
  },
  resetPasswordExpiresIn: {
    type: Date,
    required: false
  }
},
  { timestamps: true }
)

//Prehook method
UserSchema.pre('save', async function (next) {
  let user = this
  if (!useer.isModified("password")) return next()
  user.password = await hash(user.password, 10)
  next()
})

//compare passwords
UserSchema.methods.comparePassword = async function (password) {
  return await compare(password, this.password)
}

//generate JWT
UserSchema.methods.generateJWT = async function () {
  let payload = {
    username: this.username,
    email: this.email,
    name: this.name,
    id: this._id
  }
  return await sign(payload, SECRET, { expiresIn: "1 day" })
}

//Generate password reset token function
UserSchema.methods.generatePasswordReset = function () {
  this.resetPasswordExpiresIn = Date.now() + 36000000
  this.resetPasswordToken = randomBytes(20).toString("hex")
}

//Get user info
UserSchema.methods.getUserInfo = function () {
  return pick(this, ["_id", "username", "email"])
}

const User = model('users', UserSchema)
export default User