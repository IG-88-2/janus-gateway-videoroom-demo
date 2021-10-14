import './assets/styles.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Component } from 'react';
import { JanusVideoRoom } from './react-videoroom-janus/dist';
import { v1 as uuidv1 } from 'uuid';
import Select from 'react-select';
import { logger } from './utils/logger';
import { Video } from './components/Video';
import { VideoRoomContainer } from './components/VideoRoomContainer';
import { IconButton } from '@mui/material';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';


interface AppProps {
	server:string,
	user_id:string
}


interface AppState {
	selectedRoom: any,
	cameras: any[],
	rooms: any[],
	cameraId: string,
	pause: boolean,
	mute: boolean,
	participants: number,
	width: number,
	height: number,
	x: number,
	y: number
}


class App extends Component<AppProps,AppState> {
	rtcConfiguration:any
	
	constructor(props) {
		
		super(props);

		this.rtcConfiguration = {
			"iceServers": [{
				urls: "stun:stun.voip.eutelia.it:3478"
			}],
			"sdpSemantics": "unified-plan"
		};

		this.state = {
			selectedRoom: null,
			cameras: [],
			rooms: [],
			cameraId: null,
			pause: false,
			mute: false,
			participants: 0,
			width: 425,
			height: 300,
			x: 300,
			y: -400
		};

	}



	componentDidMount() {

		this.getCameras()
		.then((cameras) => {
			
			this.setState({
				cameras:cameras.map(({ deviceId, label, groupId }) => {

					return {
						label: label.length==0 ? "Unknown Device" : label,
						value: deviceId.length==0 ?  groupId : deviceId
					}

				})
			});

		});

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

		this.setState({
			participants: this.state.participants + 1
		});

	}



	onParticipantLeft = (participant:any) => {
		
		logger.info('onParticipantLeft', participant);

		this.setState({
			participants: this.state.participants - 1
		});

	}



	getCameras = async () => {

		const devices = await navigator.mediaDevices.enumerateDevices();

		const cameras = devices.filter((d) => d.kind==="videoinput");

		return cameras;
		
	}



	renderContainer = (children:any) => {
		
		return (
			<div style={{
				width: `100%`,
				height: `calc(100% - 30px)`,
				overflow: `hidden`,
				display: `flex`,
				background: `rgba(40, 40, 40, 0.5)`,
				flexWrap: `wrap`,
				alignItems: `center`,
				justifyContent: `center`
			}}>
				{children}
			</div>
		);
		
	}



	renderStream = (subscriber:any) => {

		const { 
			width, 
			height 
		} = this.state;

		const participants = document.getElementsByTagName("video").length;
		const area = width * height;
		const p = participants == 0 ? 1 : participants;
		
		let s : any = {
			display:`flex`,
			flex:`0 1 0%`,
			background:`aliceblue`,
			position:`relative`,
			minWidth:`${Math.sqrt(area / p) * 0.9}px`
		};
		
		if (participants == 2) {
			s = {
				display:`flex`,
				height:`100%`,
				position:`relative`,
				background:`aliceblue`,
				width:`100%`
			};
		}

		return (
			<div 
				key={`subscriber-${subscriber.id}`}
				style={s}
			>
				<Video
					id={subscriber.id}
					muted={false}
					style={{
						width:`100%`,
						height:`100%`,
						objectFit:`contain`,
						zIndex: 5000
					}}
					stream={subscriber.stream}
				/>
				<div style={{
					pointerEvents:`none`,
					width: `100%`,
					height: `100%`,
					position: `absolute`,
					textAlign: `center`,
					color: `darkgreen`,
					background: `aliceblue`,
					display: `flex`,
					fontSize: `1.2vw`,
					alignItems: `center`,
					justifyContent: `center`,
					overflow: 'hidden',
					zIndex: 100
				}}>
					User gesture required
				</div>
			</div>
		);

	}



    LocalVideo = ({ publisher }) => (
        
        ReactDOM.createPortal(
            <div style={{
                pointerEvents:"none",
                position:"fixed",
                top:0,
                left:0,
                display:"flex",
                height:`100%`,
                minHeight:`100%`,
                width:"100%",
                zIndex:99999,
                overflow:"hidden"
            }}> 
                <div style={{
					width: `100px`,
					height: `100px`,
					position: `absolute`,
					bottom: 0,
					right: 0,
					background: `black`
				}}>
					<Video
						id={publisher.id}
						muted={true}
						style={{
							width:`100%`,
							height:`100%`,
							objectFit:`cover`
						}}
						stream={publisher.stream}
					/>
				</div>
            </div>,
            document.body
        )

    )
    

	
	renderLocalStream = (publisher:any) => {
					
		return <this.LocalVideo publisher={publisher} />

	}



	render() {
		
		return <div
			style={{
				height:`100%`,
				width:`100%`
			}}
		>
			<div style={{
				width:`300px`,
				height:`100%`
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
							placeholder={"Select device..."}
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
				<VideoRoomContainer
					onDrag={(x:number, y:number) => {
						this.setState({ x, y });
					}}
					onResize={(width:number, height:number) => {
						this.setState({ width, height });
					}}
					width={this.state.width}
					height={this.state.height}
					x={this.state.x}
					y={this.state.y}
				>
					<JanusVideoRoom
						pause={this.state.pause}
						mute={this.state.mute}
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
						renderContainer={this.renderContainer}
						renderStream={this.renderStream}
						renderLocalStream={this.renderLocalStream}
					/>
					<div style={{
						display: `flex`,
						flexDirection: `row`,
						height: `30px`,
						alignItems: `center`,
						justifyContent: `space-evenly`,
						background: `rgba(100,120,120,0.2)`
					}}>
						<IconButton 
							aria-label="toggle-mic"
							onClick={(e) => {
								this.setState({
									mute: !this.state.mute
								});
							}}
						>
							{
								!this.state.mute ?
								<MicIcon /> :
								<MicOffIcon />
							}
						</IconButton>
						<IconButton 
							aria-label="toggle-video"
							onClick={(e) => {
								this.setState({
									pause: !this.state.pause
								});
							}}
						>
							{
								!this.state.pause ?
								<VideocamIcon /> :
								<VideocamOffIcon />
							}
						</IconButton>
						<IconButton 
							aria-label="end-call"
							onClick={(e) => {
								this.setState({
									selectedRoom: null
								});
							}}
						>
							<CallEndIcon />
						</IconButton>
					</div>
				</VideoRoomContainer>
			</div>
		</div>
	
	}

}

const app = document.getElementById('application');

app.style.width = `100%`;

app.style.height = `100%`;

document.body.appendChild(app);

const params = new URLSearchParams(window.location.href);

let user_id = params.get(`user_id`);

console.log('user_id is', user_id);

if (!user_id) {
	user_id = uuidv1();
}

const server = process.env.server;

console.log(process.env.NODE_ENV, process.env.server);

ReactDOM.render(<App server={server} user_id={user_id} />, app);
