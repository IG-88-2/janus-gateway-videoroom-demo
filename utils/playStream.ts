export const playStream = (video, stream, muted) => {
	
	console.log(`play stream`, stream);

	video.srcObject = stream;
	
	video.muted = muted;

	video.volume = 1;
	
	video.play()
	.catch((error) => {
		console.error(error);
	});
	
}
