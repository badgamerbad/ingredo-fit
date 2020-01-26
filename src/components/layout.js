import React from "react"
import Helmet from "react-helmet"
import { StaticQuery, graphql } from "gatsby"
import jwtDecode from "jwt-decode"

import "./layout.scss"

import Header from "./header"
import UserData from "./userData"
import FileListing from "./fileListing"
import FileUploader from "./fileUploader"

const userLogin = async (layoutThisObject, payload) => {
  try {
    const userLoginData = await fetch(
      payload.url,
      {
        method: payload.method,
        body: payload.body,
        credentials: 'include',
      }
    )
    
    const encodedUserLoginDataJwt = await userLoginData.text()
    const decodedResponse = jwtDecode(encodedUserLoginDataJwt)

    // handle error from aws lambda githubAccessExchange
    if (decodedResponse.login) {
      layoutThisObject.setState({
        userData: decodedResponse,
        jwt: encodedUserLoginDataJwt,
      })
    }
    else {
      console.log(decodedResponse)
    }
  }
  catch(exception) {
    console.log(exception)
  }
}
const userLogout = async layoutThisObject => {
  try {
    const userLogoutData = await fetch(
      process.env.GATSBY_URL_USER_LOGOUT,
      {
        method: "POST",
        credentials: 'include'
      }
    )

    if(userLogoutData && userLogoutData.status === 200) {
      layoutThisObject.setState({
        width: '0%',
        userData: {},
        jwt: "",
      })

      const resolvedUserLogoutData = await userLogoutData.text();
      console.log(resolvedUserLogoutData)
    }
    else {
      console.log(userLogoutData)
    }
  }
  catch (exception) {
    console.log(exception);
  }
}

const layoutContext = React.createContext()

class Layout extends React.Component {
  static contextType = layoutContext
  constructor() {
    super()
    this.state = {
			width: '0%',
      userData: {},
      jwt: "",
    }
    this.userLogout = this.userLogout.bind(this)
  }
  componentDidMount() {
    let payload;
    if(window.accessCode) {
      payload = {
        url: process.env.GATSBY_URL_USER_LOGIN,
        method: "POST",
        body: JSON.stringify({
          "code": window.accessCode,
          "state": window.accessRandomKey,
        })
      }  
    } 
    else{
      payload = {
        url: process.env.GATSBY_URL_USER_DATA,
        method: "GET"
      }
    }

    userLogin(this, payload)
  }
  userLogout() {
    // global logout function
    userLogout(this)
  }
  render() {
    return (
      <StaticQuery
				query={graphql`
						query SiteTitleQuery {
							site {
								siteMetadata {
									title
								}
							}
						}
				`}
				render={data => (
          <layoutContext.Provider>
            <Helmet
              title={data.site.siteMetadata.title}
              meta={[
                { name: 'description', content: 'Track your calorie with our app.' },
                { name: 'keywords', content: 'food, fitness' },
              ]}
            >
              <html lang="en" />
            </Helmet>
            <Header siteTitle={data.site.siteMetadata.title} userData={this.state.userData} userLogout={this.userLogout} />
            <UserData>
              <FileUploader />
              <FileListing userData={this.state.userData} jwt={this.state.jwt}/>
            </UserData>
          </layoutContext.Provider>
        )}
      />
    )
  }
}

export default Layout