/**
 * get available media devices
 */
export const getDevices = () => {

	return navigator.mediaDevices.enumerateDevices()
	.then((devices) => {
		
		return devices;

	});
}
