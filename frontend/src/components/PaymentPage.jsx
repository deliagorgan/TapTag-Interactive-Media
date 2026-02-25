import { useState, useEffect } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useParams } from 'react-router-dom';
import CheckoutForm from './CheckoutForm';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

export default function PaymentPage({ amount = 2000, testMode = true }) {
  const [clientSecret, setClientSecret] = useState(null);
  const API      = process.env.REACT_APP_BACKEND_BASE_URL;
  const { userID } = useParams();

  useEffect(() => {
    // include userID so the backend can stick it in the PaymentIntent.metadata
    axios
      .post(`${API}/api/payment/create-payment-intent`, {
        amount,
        testMode,
        userID,
      })
      .then(r => setClientSecret(r.data.clientSecret))
      .catch(console.error);
  }, [amount, testMode, API, userID]);

  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#3fc1c9',
      colorBackground: '#f8f9fa',
    },
    rules: {
      '.Input':  { borderRadius: '8px', padding: '12px' },
      '.Button': { borderRadius: '8px' },
    }
  };

  if (!clientSecret) return <div>Loading payment...</div>;

  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret, appearance }}
    >
      <div
        className="feed-animated-bg d-flex align-items-center justify-content-center min-vh-100 overflow-auto"
        style={{ padding: '2rem 2rem' }}
      >
        <div style={{ width: '100%', maxWidth: '400px', padding: '0 1rem'}}>
          <CheckoutForm amount={amount} />
        </div>
      </div>
    </Elements>
  );
}
