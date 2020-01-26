import React from "react"
import Helmet from "react-helmet"
import { StaticQuery, graphql } from "gatsby"
import jwtDecode from "jwt-decode"

import "./layout.scss"

import Header from "./header"
import UserData from "./userData"
import FileListing from "./fileListing"
import FileUploader from "./fileUploader"

// sets the state with userData and JWT of userData
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
        uploadedImageUrl: "",
        ingredients: [],
      })

      window.accessCode = null;

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
      ingredients: [],
      uploadedImageUrl: "",
    }
    this.userLogout = this.userLogout.bind(this)
    this.fetchUpdatedUserData = this.fetchUpdatedUserData.bind(this)
    this.fetchUploadedFileWithIngredients = this.fetchUploadedFileWithIngredients.bind(this)
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
  async fetchUpdatedUserData(fileName, operation) {
    try {
      const userData = await fetch(
        process.env.GATSBY_URL_USER_DATA,
        {
          method: "GET",
          credentials: 'include',
        }
      )

      const encodedUserDataJwt = await userData.text()
      const decodedUserData = jwtDecode(encodedUserDataJwt)

      // handle error from aws lambda githubAccessExchange
      if (decodedUserData.login) {
        this.setState({
          userData: decodedUserData,
          jwt: encodedUserDataJwt,
        })
        
        if(operation == "upload")
          this.fetchUploadedFileWithIngredients(fileName, encodedUserDataJwt)
      }
      else {
        console.log(decodedUserData)
      }
    }
    catch (exception) {
      console.log(exception)
    }
  }
  async fetchUploadedFileWithIngredients(fileName, encodedUserDataJwt) {
    try {
      this.setState({
        uploadedImageUrl: "",
        ingredients: [],
      })

      // get the uploaded image url and the clarifai ingredients 
      let fetchUploadedImageData = await fetch(
        process.env.GATSBY_URL_SIGNED_FILE_DATA_INGREDIENTS,
        {
          method: "POST",
          body: JSON.stringify({
            fileName,
            jwt: encodedUserDataJwt,
          }),
          credentials: 'include'
        }
      )
      if (fetchUploadedImageData.status !== 200) {
        console.log(fetchUploadedImageData.statusText)
      }
      else {
        // TODO: handle the loader effect
        // onLoadStateChange('100%')

        const imageDataToText = await fetchUploadedImageData.text()
        const parsedImageData = JSON.parse(imageDataToText)

        this.setState({
          uploadedImageUrl: parsedImageData.url,
          ingredients: parsedImageData.ingredients
        })
      }
    }
    catch (exception) {
      console.log(exception)
    }
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
              <FileUploader uploadedImageUrl={this.state.uploadedImageUrl} ingredients={this.state.ingredients} fetchUpdatedUserData={this.fetchUpdatedUserData}/>
              <FileListing userData={this.state.userData} jwt={this.state.jwt} fetchUpdatedUserData={this.fetchUpdatedUserData} fetchUploadedFileWithIngredients={this.fetchUploadedFileWithIngredients}/>
            </UserData>
          </layoutContext.Provider>
        )}
      />
    )
  }
}

export default Layout