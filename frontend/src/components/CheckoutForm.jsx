import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { Button } from 'react-bootstrap';

export default function CheckoutForm({ amount }) {
  const stripe   = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/payment/confirmed/'
      }
    });

    if (confirmError) {
      setError(confirmError.message);
      setLoading(false);
    }
  };

  return (

   <form
    onSubmit={handleSubmit}
    style={{
      borderRadius: '50px',
      overflow: 'hidden',
      padding: '1.5rem',
      background: '#fff',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}
  >
    <PaymentElement />
    {error && <div style={{ color: 'red', marginTop: '1rem' }}>{error}</div>}
    <div className="d-flex justify-content-center mt-4">
      <Button
        className="btn-turquoise"
        type="submit"
        disabled={!stripe || loading}
      >
        {loading ? 'Processing...' : `Pay $${(amount/100).toFixed(2)}`}
      </Button>
    </div>
  </form>


  );
}
