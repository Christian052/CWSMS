// AuthForm.jsx
import React, { useState } from "react";
import axios from "axios";
import { GoogleLogin } from "react-google-login";

const AuthForm = ({ type }) => {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = type === "login" ? "/login" : "/signup";
    const res = await axios.post(`http://localhost:5000${url}`, form);
    alert(res.data.msg || "Logged in!");
  };

  const responseGoogle = async (response) => {
    window.location.href = `http://localhost:5000/auth/google`;
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border max-w-md mx-auto mt-8 shadow-lg rounded">
      {type === "signup" && (
        <>
          <input name="full_name" placeholder="Full Name" onChange={handleChange} className="input" />
          <input name="phone" placeholder="Phone" onChange={handleChange} className="input" />
        </>
      )}
      <input name="email" placeholder="Email" onChange={handleChange} className="input" />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} className="input" />
      <button className="bg-blue-600 text-white px-4 py-2 rounded mt-2">{type === "login" ? "Login" : "Signup"}</button>

      <div className="mt-4">
        <GoogleLogin
          clientId="your_google_client_id"
          buttonText="Continue with Google"
          onSuccess={responseGoogle}
          onFailure={responseGoogle}
          cookiePolicy={'single_host_origin'}
        />
      </div>
    </form>
  );
};

export default AuthForm;
