'use strict'
const User = use('App/Models/User');

class UserController {
  async login ({ request, auth }) {
    const { email, password } = request.all()
      return await auth.attempt(email, password)
  }

  async register({request}) {
    const {username, email, password } = request.all()
    const user = new User()
    user.username = username
    user.email = email
    user.password = password
    return await user.save()
  }
}

module.exports = UserController
