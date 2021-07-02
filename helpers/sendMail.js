const sgMail = require('@sendgrid/mail')
/**
 * 
 * @param {*} msg 
 * msg = {
 *  to: 'destination@mail.com',
 *  from: 'from@mail.com',
 *  subject: 'Very important title',
 *  text: 'as noted in the title, this is very important email',
 *  html: '<strong>very important</strong>'
 * }
 * @returns Promise
 */
module.exports = (msg) => {
    if (process.env.NODE_ENV !== 'production') {
        msg.to = 'test@mail.com';
    }
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const mail = new Promise((resolve, reject) => {
        sgMail
        .send(msg)
        .then(() => resolve())
        .catch((error) => {
            error.errors = error.response.body.errors.map(er => ({
                title: error.message,
                details: er.message,
                status: error.code
            }))
            reject(error)
        })
    })
    return mail;
}