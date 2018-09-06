'use strict'
const User = use('App/Models/User');
const Mail = use('Mail')

class UserController {
  async login({request, auth}) {
    const {email, password} = request.all()
    const token = await auth.attempt(email, password)

    try {
      await Mail.raw(`${email} just logged in`, (message) => {
        message.from('patrick@movingup.nu')
        message.to('patrick@movingup.nu')
      })
    } catch(e) {
      console.log(e);
    }

    return token;
  }

  async register({request}) {
    const {username, email, password} = request.all()
    const user = new User()
    user.username = username
    user.email = email
    user.password = password
    return await user.save()
  }
}

module.exports = UserController
