import React from "react"
import { Link } from "gatsby"

import "./beforeLogin.scss"

export default function BeforeLogin(props) {
  return (
    <>
      <div className="login">
        <Link className="login-button" to="/login">LOGIN</Link>
      </div>
      <div className="aboutApp">
        <h4>About App</h4>
        <p>
          This app will help you keep track of what food items you are consuming,
          give you their calorie, nutritional value. Just upload a pic of your meal,
          and let the app do its magic. It will give you a list of ingredients in your meal,
          calories and nutrients of each item. This way you know what you are consuming.
        </p>
      </div>
    </>
  )
}