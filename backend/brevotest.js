require('dotenv').config();
const SibApiV3Sdk = require('sib-api-v3-sdk');

console.log('BREVO_API_KEY exists:', !!process.env.BREVO_API_KEY);
console.log('EMAIL_USER:', process.env.EMAIL_USER);

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

apiInstance.sendTransacEmail({
  sender: { email: process.env.EMAIL_USER, name: 'Momentum Test' },
  to: [{ email: process.env.EMAIL_USER }], // sending to yourself for this test
  subject: 'Brevo test email',
  htmlContent: '<p>If you got this, Brevo is working!</p>'
}).then((data) => {
  console.log('SUCCESS:', JSON.stringify(data));
}).catch((err) => {
  console.log('FAILED:', JSON.stringify(err.response ? err.response.body : err.message));
});