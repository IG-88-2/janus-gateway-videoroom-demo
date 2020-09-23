import './assets/styles.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Component } from 'react';
import { Consola, BrowserReporter } from 'consola';
import { JanusVideoRoom } from 'react-videoroom-janus'; //'./react-videoroom-janus/react-videoroom-janus';
import { v1 as uuidv1 } from 'uuid';
import Select from 'react-select';
const moment = require('moment');



const styles = {
	'0': {
		container:{
			height: `100%`,
			width: `100%`,
			position: `relative`
		},
		localVideo:{
			width: `200px`,
			height: `auto`
		},
		localVideoContainer:{
			position: `absolute`,
			top: `50px`,
			right: `50px`
		}
	},
	'1': {
		container:{
			height: `100%`,
			width: `100%`,
			position: `relative`
		},
		video:{
			width: `100%`,
		},
		videoContainer:{
			width: `100%`,
			height: `100%`
		},
		localVideo:{
			width: `200px`,
			height: `auto`
		},
		localVideoContainer:{
			position: `absolute`,
			top: `50px`,
			right: `50px`
		}
	},
	'2': {
		container:{
			height: `100%`,
			width: `100%`,
			display: `flex`,
			position: `relative`
		},
		video:{
			width: `100%`,
			height: `100%`,
			objectFit: `cover`
		},
		videoContainer:{
			width: `100%`,
			height: `100%`
		},
		localVideo:{
			width: `200px`,
			height: `auto`
		},
		localVideoContainer:{
			position: `absolute`,
    		right: `calc(50% - 100px)`
		}
	},
	'3': {
		container:{
			display: `grid`,
			gridTemplateColumns: `50% 50%`
		},
		video:{
			width: `100%`,
			height: `100%`,
			objectFit: `cover`
		},
		localVideo:{
			height: `100%`
		},
		localVideoContainer:{
			
		}
	},
	'4': {
		container:{
			display: `grid`,
			gridTemplateColumns: `50% 50%`,
			gridTemplateRows: `50% 50%`,
    		height: `100%`
		},
		video:{
			width: `100%`,
			height: `100%`,
			objectFit: `cover`
		},
		localVideo:{
			height: `100%`,
		},
		localVideoContainer:{
		    position: `absolute`,
			top: `calc(50% - 80px)`,
			left: `calc(50% + 70px)`,
			borderRadius: `200px`,
			overflow: `hidden`,
			width: `160px`,
			height: `160px`
		}
	},
	'5': {
		container:{
			display: `grid`,
			gridTemplateColumns: `33.3% 33.3% 33.3%`,
			gridTemplateRows: `50% 50%`,
    		height: `100%`
		},
		video:{
			width: `100%`,
			height: `100%`,
			objectFit: `cover`
		},
		localVideo:{
			height: `100%`
		},
		localVideoContainer:{
			
		}
	}
};



interface VideoProps {
	id:string,
	muted:boolean,
	style:any,
	stream:any
}



interface VideoState {

}



class Video extends Component<VideoProps,VideoState> {
	video:any
	container:any 

	constructor(props) {

		super(props);
		
	}
	


	componentDidMount() {
		
		this.video.srcObject = this.props.stream;
	
		this.video.play();

	}



	componentWillReceiveProps(nextProps) {
		
		if (nextProps.stream!==this.props.stream) {
			this.video.srcObject = nextProps.stream;
			this.video.play();
		}

	}



	render () {

		const {
			id,
			muted,
			style
		} = this.props;

		return <video
			id={`video-${id}`}
			muted={muted}
			style={style}
			ref={(video) => { 
				this.video = video; 
			}}
		/>
		
	}

}



let enabled = true;



const log : any = new Consola({
    level: 3, 
    reporters: [
      new BrowserReporter()
    ]
});



const getDatePrefix = () => {

    const date = moment().format('H:mm:ss:SSS');

    return date;

};



const logger = {
    success: (...args) => {

        if (enabled) {
            log.success(getDatePrefix(), ...args);
        }

    },
    info: (...args) => {

        if (enabled) {
            log.info(getDatePrefix(), ...args);
        }

    },
    error: (error:any) => {

        if (enabled) {
            log.error(error);
        }

    },
    json: (...args) => {

        if (enabled) {
            log.info(`JSON`, getDatePrefix(), ...args);
        }

    }
};



interface AppProps {
	server:string,
	user_id:string
}



interface AppState {
	selectedRoom: any,
	cameras: any[],
	rooms: any[],
	cameraId: string
}



class App extends Component<AppProps,AppState> {
	rtcConfiguration:any

	constructor(props) {
		
		super(props);

		this.state = {
			selectedRoom: null,
			cameras: [],
			rooms: [],
			cameraId: null
		};

		this.rtcConfiguration = {
			"iceServers": [{
				urls: "stun:stun.voip.eutelia.it:3478"
			}],
			"sdpSemantics": "unified-plan"
		};
		
	}



	componentDidMount() {

		this.getCameras()
		.then((cameras) => {
			
			this.setState({
				cameras:cameras.map(({ deviceId, label }) => {

					return {
						label,
						value:deviceId
					}

				})
			});

		});

	}


	getCustomStyles = (nParticipants) => {
		
		const key = String(nParticipants);

		const s = styles[key];

		return s || {};

	}
	


	selectRoom = (room_id) => {
		
		this.setState({
			selectedRoom: null
		}, () => {

			this.setState({
				selectedRoom: room_id
			});

		});

	}



	onPublisherDisconnected = (publisher:any) => {
						
		logger.info('onPublisherDisconnected', publisher);

	}



	onConnected = (publisher:any) => {

		logger.info('onConnected', publisher);

	}



	onDisconnected = (error) => {

		logger.info('onDisconnected', error);

	}



	onRooms = (rooms:any) => {

		logger.info('onRooms', rooms);

		this.setState({
			rooms
		});
		
	}



	onError = (error:any) => {

		logger.info('onError', error);

	}



	onParticipantJoined = (participant:any) => {
		
		logger.info('onParticipantJoined', participant);

	}



	onParticipantLeft = (participant:any) => {
		
		logger.info('onParticipantLeft', participant);

	}



	getCameras = async () => {

		const devices = await navigator.mediaDevices.enumerateDevices();

		const cameras = devices.filter((d) => d.kind==="videoinput");

		return cameras;
		
	}



	render() {
		
		return <div style={{
			height:`100%`,
			width:`100%`,
			display:`flex`
		}}>
			<div style={{
				width:`300px`,
				height:`calc(100% - 50px)`
			}}>
				<div style={{
					display:`flex`,
					flexDirection:`column`,
					height:`100%`,
					width:`100%`,
					background:`rgba(0,140,220,1)`,
					overflowX:`hidden`,
					overflowY:`auto`
				}}>
					<div style={{
						padding: `10px`
					}}>
						<Select
							options={this.state.cameras}
							onChange={(r) => {
								
								this.setState({
									cameraId: r.value
								});

							}}
						/>
					</div>
					{
						this.state.rooms.map((room, index) => {
							
							return (
								<div
									className="room"
									id={`room-${room.room_id}`}
									key={`room-${index}`}
									style={{
										margin: `10px`,
										background: `white`,
										padding: `20px`,
										boxShadow: `0px 0px 5px 5px rgba(0,0,0,0.1)`,
										cursor: `pointer`
									}}
									onClick={(e) => {
										
										this.selectRoom(room.room_id);

									}}
								>
									{room.description} ({room.instance_id})
								</div>
							);

						})
					}
				</div>
			</div>
			<div style={{
				flex:1,
				height:`100%`
			}}>
				<JanusVideoRoom
					logger={logger}
					server={this.props.server}
					room={this.state.selectedRoom}
					onPublisherDisconnected={this.onPublisherDisconnected}
					rtcConfiguration={this.rtcConfiguration}
					cameraId={this.state.cameraId}
					user_id={this.props.user_id}
					onConnected={this.onConnected}
					onDisconnected={this.onDisconnected}
					onRooms={this.onRooms}
					onError={this.onError}
					onParticipantJoined={this.onParticipantJoined}
					onParticipantLeft={this.onParticipantLeft}
					mediaConstraints={{
						video: true,
						audio: true
					}}
					getCustomStyles={(n:number) => {

						const customStyles = this.getCustomStyles(n);

						return customStyles;

					}}
					/*
					renderContainer={(children:any) => {

						const customStyles = this.getCustomStyles(1);
						
						return (
							<div style={customStyles.container}>
								{children}
							</div>
						);
						
					}}
					renderStream={(subscriber:any) => {

						const customStyles = this.getCustomStyles(1);

						return (
							<div 
								key={`subscriber-${subscriber.id}`}
								style={customStyles.videoContainer}
							>
								<Video
									id={subscriber.id}
									muted={false}
									style={customStyles.video}
									stream={subscriber.stream}
								/>
							</div>
						);

					}}
					renderLocalStream={(publisher:any) => {

						const customStyles = this.getCustomStyles(1);

						return (
							<div style={customStyles.localVideoContainer}>
								<Video
									id={publisher.id}
									muted={true}
									style={customStyles.localVideo}
									stream={publisher.stream}
								/>
							</div>
						);

					}}
					*/
				/>
			</div>
		</div>
	
	}

}

const app = document.getElementById('application');

app.style.width = `calc(100vw - 20px)`;

app.style.height = `calc(100vh - 20px)`;

document.body.appendChild(app);

const params = new URLSearchParams(window.location.href);

let user_id = params.get(`user_id`);

if (!user_id) {
	user_id = uuidv1();
}

const server = `wss://kreiadesign.com`; //`wss://dev-janus.blipiq.com`; //`ws://127.0.0.1:8080`;

ReactDOM.render(<App server={server} user_id={user_id} />, app);
