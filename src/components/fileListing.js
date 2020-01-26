import React, { useState } from "react"
import axios from 'axios'

import "./fileListing.scss"

const deleteFile = async event => {
	let fileName = event.currentTarget.dataset.filename
	let jwt = event.currentTarget.dataset.jwt

	let deleteFileData = await fetch(
		process.env.GATSBY_URL_DELETE_FILE, 
		{
			method: "POST",
			body: JSON.stringify({
				fileName, 
				jwt
			}),
			credentials: 'include',
		},
	)

	if(deleteFileData && deleteFileData.status == 204) {
		console.log(deleteFileData.statusText)
	}
	else {
		console.log(deleteFileData)
	}
}

export default function fileListing(props) {
	return (
		<ul>
			{
				props.userData ?
					props.userData.filesList ?
						props.userData.filesList.map(
							(file, index) => <li key={index}>{file.name} <button data-filename={file.name} data-fileurl={file.url} data-jwt={props.jwt} onClick={deleteFile}>x</button></li>
						)
						: ""
					: ""
			}
		</ul>
	)
}