const sgMail = require("@sendgrid/mail");
const sendgrid_key = process.env.SENDGRID;
sgMail.setApiKey(sendgrid_key);

exports.sendgrid_mail = async (emails, template_id, dynamic_template_data) => {
  const msg = {
    to: emails,
    from: "info@example.com",
    templateId: template_id,
    dynamic_template_data: dynamic_template_data,
  };
  sgMail.send(msg, (err, result) => {
    if (err) {
      console.log({
        error: true,
        message: "email didn't send, please try again",
        data: err,
      });
    }
  });
};
