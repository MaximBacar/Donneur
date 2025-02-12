import React, { useState } from "react";
import {useStripe, useElements, ExpressCheckoutElement} from '@stripe/react-stripe-js';

export default function ECheckout(){
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState();

    const onConfirm = async (event) => {
        if (!stripe) {
        // Stripe.js hasn't loaded yet.
        // Make sure to disable form submission until Stripe.js has loaded.
        return;
        }

        const {error: submitError} = await elements.submit();
        if (submitError) {
        setErrorMessage(submitError.message);
        return;
        }


        // Confirm the PaymentIntent using the details collected by the Express Checkout Element
        const {error} = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: 'https://google.com',
            },
        });

        if (error) {
        // This point is only reached if there's an immediate error when
        // confirming the payment. Show the error to your customer (for example, payment details incomplete)
        setErrorMessage(error.message);
        } else {
        // The payment UI automatically closes with a success animation.
        // Your customer is redirected to your `return_url`.
        }
    };
    return (
        <div id="checkout-page">
            <ExpressCheckoutElement onConfirm={onConfirm} />
            {errorMessage && <div>{errorMessage}</div>}
        </div>
    );
};