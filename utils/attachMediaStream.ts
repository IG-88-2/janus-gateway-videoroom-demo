/**
 * Attach stream to dom video object
 * @param element dom video element
 * @param stream local or remote stream
 */
export const attachMediaStream = (element, stream) => {
	
	console.log('attaching...', stream);

	try {
		element.srcObject = stream;
	} catch (e) {
		console.error(e);
		try {
			element.src = URL.createObjectURL(stream);
		} catch (e) {
			console.error(e);
		}
	}

}