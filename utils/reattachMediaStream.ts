/**
 * Replace stream with another
 * @param to dom video element
 * @param from dom video element
 */
export const reattachMediaStream = (to, from) => {

	try {
		to.srcObject = from.srcObject;
	} catch (e) {
		try {
			to.src = from.src;
		} catch (e) {
			
		}
	}
	
}