import './assets/styles.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
const moment = require('moment');
import { v1 as uuidv1 } from 'uuid';
import { useState, useRef, Component } from 'react';
import { Consola, BrowserReporter } from 'consola';
import { JanusVideoRoom } from './react-janus-videoroom/react-janus-videoroom'; //'react-videoroom-janus'; //
import Select from 'react-select';



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
		},
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
			id={id}
			muted={muted}
			style={style}
			ref={(video) => { this.video = video; }}
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
	camera: any
}



class App extends Component<AppProps,AppState> {
	rtcConfiguration:any

	constructor(props) {
		
		super(props);

		this.state = {
			selectedRoom: null,
			cameras: [],
			rooms: [],
			camera: null
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
									camera: r
								});

							}}
						/>
					</div>
					{
						this.state.rooms.map((room, index) => {
							
							return (
								<div
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
					camera={this.state.camera}
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

						return null;

					}}
					renderStream={(subscriber:any) => {

						return null;

					}}
					renderLocalStream={(publisher:any) => {

						return null;

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

const user_id = params.get(`user_id`); //'12'

const host = params.get(`host`);

const port = params.get(`port`);

logger.info(`params - ${user_id} ${host} ${port}`);

const url = `127.0.0.1`; //`3.121.126.200`; //host; //

const server = `ws://${url}:8080/?id=${user_id}`; //`ws://${host}:${port}/?id=${user_id}`;

ReactDOM.render(<App server={server} user_id={user_id} />, app);
//http://localhost:3000?search&user_id=12&host=127.0.0.1&port=8080
//http://localhost:3000?search&user_id=12&host=ec2-3-121-126-200.eu-central-1.compute.amazonaws.com&port=8080
