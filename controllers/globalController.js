
// This is your real test secret API key.
const stripe = require("stripe")("sk_test_51HPO1cGZEhjhe0LvVYUYOAKS4vz5zTY1WnCw5pw4r7J6OZNKHclqCTXXz2HELnKuKBUTMUIg7u3rld8j4j2Qz5ax000O92s3ie");

const calculateOrderAmount = items => {
    // Replace this constant with a calculation of the order's amount
    // Calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    return 1400;
};
export const home = (req, res) => res.send("REST API를 위한 서버입니다.");

export const stripePayment = async (req, res) => {
    const { items } = req.body;
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
        amount: calculateOrderAmount(items),
        currency: "usd"
    });
    res.send({
        clientSecret: paymentIntent.client_secret
    });
};