import { useState } from "react";

export default function CheckoutForm({ onSubmit, disabled = false }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const isValid =
    form.name.trim().length > 0 &&
    form.phone.trim().length > 0 &&
    form.email.trim().length > 0;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isValid || disabled) return;
    onSubmit({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="checkout">
      <div className="checkout__field">
        <label className="checkout__label" htmlFor="checkout-name">
          Nombre
        </label>
        <input
          id="checkout-name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          className="checkout__input"
          disabled={disabled}
          required
        />
      </div>
      <div className="checkout__field">
        <label className="checkout__label" htmlFor="checkout-phone">
          Teléfono
        </label>
        <input
          id="checkout-phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          className="checkout__input"
          disabled={disabled}
          required
        />
      </div>
      <div className="checkout__field">
        <label className="checkout__label" htmlFor="checkout-email">
          Email
        </label>
        <input
          id="checkout-email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="checkout__input"
          disabled={disabled}
          required
        />
      </div>
      <button className="btn btn--primary" type="submit" disabled={!isValid || disabled}>
        Confirmar compra
      </button>
    </form>
  );
}
