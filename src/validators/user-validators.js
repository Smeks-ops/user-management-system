import { check } from "express-validator";

const name = check('name', "Name is required.").not().isEmpty()
const username = check('username', "Username is required.").not().isEmpty()
const password = check('password', "Password is required.").not().isEmpty()
