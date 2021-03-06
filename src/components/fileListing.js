import React from "react"

import "./fileListing.scss"

export default function fileListing(props) {
	const deleteFile = async event => {
		try {
			let fileName = event.currentTarget.dataset.filename
			let jwt = props.jwt
	
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
	
			if (deleteFileData && deleteFileData.status === 204) {
				console.log(deleteFileData.statusText)

				props.fetchUpdatedUserData(fileName, "delete")
			}
			else {
				console.log(deleteFileData)
			}
		}
		catch (exception) {
			console.log(exception)
		}
	}
	const seeImage = async event => {
		let fileName = event.currentTarget.dataset.filename
		props.fetchUploadedFileWithIngredients(fileName, props.jwt)
	}
	return (
		<ul className="uploaded-image-list">
			{
				props.userData ?
					props.userData.filesList ?
						props.userData.filesList.map(
							(file, index) => <li className="uploaded-image-row" key={index}><button onClick={seeImage} data-filename={file.name}><img src={file.url} alt="file url" /></button><button className="close" data-filename={file.name} data-fileurl={file.url} onClick={deleteFile}>x</button></li>
						)
						: ""
					: ""
			}
		</ul>
	)
}