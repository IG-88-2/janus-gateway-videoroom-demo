export const checkAvailableDevices = (media) => {

	return navigator.mediaDevices.enumerateDevices()
	.then((devices) => {

		const audioExist = devices.some((device) => device.kind === 'audioinput');
		const videoExist = devices.some((device) => device.kind === 'videoinput');
		const audioSend = true;
		const videoSend = true;
		const needAudioDevice = true;
		const needVideoDevice = true;

		return {
			needAudioDevice,
			needVideoDevice,
			audioExist,
			videoExist,
			audioSend,
			videoSend
		}
				
	})
	
}