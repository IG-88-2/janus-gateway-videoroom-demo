import './assets/styles.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ReconnectingWebSocket from 'reconnecting-websocket';
const moment = require('moment');
import { v1 as uuidv1 } from 'uuid';
import { useState, useRef } from 'react';
import { Consola, BrowserReporter } from 'consola';
import { JanusClient } from 'janus-gateway-client'; //'./janus-gateway-client/dist';



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
    enable: () => {

        enabled = true;
    
    },
    disable: () => {
    
        enabled = false;
    
    },
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

    },
    tag: (tag:string, type:`success` | `info` | `error`) => (...args) => {

        if (enabled) {
            const tagged = log.withTag(tag);
            
            if (tagged[type]) {
                tagged[type](getDatePrefix(), ...args);
            }
        }
        
    }
};



const onError = (error) => {

    logger.error(error);
    
};



window.onerror = (msg:any, url, lineNo, columnNo, err) => {

    let obj = {};
    
    try {

		obj = JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)));

    } catch(e) {}
	
    const error = JSON.stringify({
        'Message' : msg,
        'URL' : url,
        'Line' : lineNo,
        'Column' : columnNo,
        ...obj
    });
    
    onError(error);

	return true;

};



const onPublisher = (publisher, onDisconnected) => {

	const video = document.createElement("video");

	video.id = publisher.id;
	video.autoplay = true;
	video.muted = true;
	video.width = 320;
	video.height = 240;
	video.style.height = "100%";
	
	const container = document.getElementById("local");
	
	container.appendChild(video);

	publisher.addEventListener("terminated", () => {
		
		const video = document.getElementById(publisher.id);

		if (video) {
			video.remove();
		}

	});

	publisher.addEventListener("disconnected", () => {
		
		//TODO where i should reinitialize in case webrtc down ???
		//TODO prevent any actions while renegotiation is happening
		//reinitialize
		logger.info('[publisher] handling disconnected event...');
		/*
		publisher.initialize()
		.then(() => {

			log.info('[publisher] handling disconnected event...succesfully renegotiated');
			
			video.srcObject = publisher.stream;

		});
		*/
	});
	
	video.srcObject = publisher.stream;

};



const onSubscriber = async (subscriber) => {

	const video = document.createElement("video");

	video.id = subscriber.id;
	video.autoplay = true;
	video.width = 180;
	video.height = 120;
	video.style.background = "green";
	video.style.padding = "5px";
	
	const container = document.getElementById("container");

	container.appendChild(video);

	subscriber.addEventListener("terminated", () => {

		logger.info('[subscriber] handling terminated event...');
		
		const video = document.getElementById(subscriber.id);

		if (video) {
			video.remove();
		}

	});

	subscriber.addEventListener("leaving", () => {

		logger.info('[subscriber] handling leaving event...');
		
		const video = document.getElementById(subscriber.id);

		if (video) {
			video.remove();
		}

	});

	subscriber.addEventListener("disconnected", () => {
		
		logger.info('[subscriber] handling disconnected event...');
		
	});

	await subscriber.initialize();
	
	video.srcObject = subscriber.stream;

};



const onDisconnected = (client) => {

	logger.info(`handling publisher disconnect...`);

	const room_id = client.current.room_id;

	logger.info(`handling publisher disconnect...last room id ${room_id}`);

	client.current.leave()
	.then(() => {

		logger.info(`handling publisher disconnect...successfully left...`);

		return client.current.join(room_id);

	})
	.then(() => {

		logger.info(`handling publisher disconnect...successfully rejoined...`);
		
	})
	.catch((error) => {

		logger.error(error);

	});

};



const connect = (client, server) => {

	if (client.current) {
		console.log('already connected...');
		return client.current.getRooms().then(({ load }) => load);
	}

	client.current = new JanusClient({
		server,
		logger,
		WebSocket: ReconnectingWebSocket,
		onPublisher: (publisher) => {

			onPublisher(publisher, onDisconnected);

		},
		onSubscriber: async (subscriber) => {
			
			onSubscriber(subscriber);

		},
		onError: (error) => {

			onError(error);

		},
		getId: () => uuidv1()
	});

	return client.current.initialize()
	.then(() => (

		client.current.getRooms().then(({ load }) => load)

	));

};



const disconnect = async (client) => {

	if (client.current) {
		if (client.current.publisher) {
			const video = document.getElementById(client.current.publisher.id);
			
			if (video) {
				video.remove();
			}
		}

		try {
			await client.current.terminate();
			console.log('terminated!');
		} catch(error) {
			console.error(error);
		}

		client.current = null;
	}

};



const onCreateRoom = (client, description:string) => {
	
	return client.current.createRoom(description);

};



const onJoinRoom = (client, room) => {

	if (client.current) {
		return client.current.join(room.room_id);
	}

};



const onLeaveRoom = (client, room) => {

	if (client.current) {
		return client.current.leave();
	}
	
};



const Room = ({ room, onJoin, onLeave }) => {

	const {
		room_id,
		instance_id
	} = room;

	return (
		<div 
			className="room-element"
			key={room_id}
			style={{
				display:"flex",
				flexDirection:"column",
				padding:"10px",
				color:"white",
				background:"red"
			}}
		>
			<div>
				{instance_id}
			</div>
			<div className="room-id">
				{room_id}
			</div>
			<div style={{
				display:"flex"
			}}>
				<button 
					id={`join-${room_id}`}
					onClick={(e) => onJoin()}
				>
					Join
				</button>
				<button
					id={`leave-${room_id}`}
					onClick={(e) => onLeave()}
				>
					Leave
				</button>
			</div>
		</div>
	);

};



const VideoRoom = ({ server }) => {

	const client = useRef(null);

	const [rooms, setRooms] = useState([]);

	const [muted, setMuted] = useState(false);

	const [paused, setPaused] = useState(false);

	const [description, setDescription] = useState(``);



	return (
		<div style={{
			height:`100%`,
			width:`100%`,
			display:`flex`,
			justifyContent:`space-between`,
			background:`aliceblue`
		}}>

			<div style={{
				display:`flex`,
				flexDirection:`column`,
				height:`100%`,
				width:`33.3%`,
				background:`beige`
			}}>

				<div style={{
					display:`flex`
				}}>
					<button 
						id="connect"
						onClick={() => {

							connect(client, server)
							.then((rooms) => {
								
								setRooms(rooms);

							});

						}}
					>
						Connect
					</button>
					<button 
						id="disconnect"
						onClick={() => {

							disconnect(client);
							
							setRooms([]);

						}}
					>
						Disconnect
					</button>
				</div>

				<div style={{
					display:`flex`,
					flexDirection:`column`
				}}>
					<input value={description} onChange={(e) => setDescription(e.target.value)} />
					<button onClick={(e) => {

						onCreateRoom(client, description)
						.then((result) => {

							logger.info('onCreateRoom response');
							
							logger.json(result);

							return client.current.getRooms().then(({ load }) => load);

						})
						.then((rooms) => {
							
							setRooms(rooms);

						})
						.catch((error) => {

							onError(error);

						})

					}}>
						Create Room
					</button>
				</div>

				<div 
					className="rooms"
					style={{
						display:`flex`,
						flexDirection:`column`,
						overflow:`auto`
					}}
				>
					{
						rooms.map((room, index) => {

							return (
								<Room 
									key={`room-${index}`}
									room={room}
									onJoin={() => {
										
										onJoinRoom(client, room);
										
									}} 
									onLeave={() => {

										onLeaveRoom(client, room);

									}}
								/>
							);
						})
					}
				</div>

			</div>
					
			<div
				style={{
					display:`flex`,
					flexDirection:`column`,
					height:`100%`,
					width:`66.6%`,
					overflow:`hidden`
				}}
			>

				<div style={{
					display:`flex`,
					flexDirection:`column`,
					height:`33.3%`,
					width:`100%`,
					alignItems:`center`,
					background:`darkgray`
				}}>

					<button 
						onClick={() => {
							
							if (paused) {
								client.current.resume()
								.then((result) => {

									if (
										result && 
										result.load && 
										result.load.data && 
										result.load.data.configured==="ok"
									) {
										setPaused(false);
									}

								});
							} else {
								client.current.pause()
								.then((result) => {
			
									if (
										result && 
										result.load && 
										result.load.data && 
										result.load.data.configured==="ok"
									) {
										setPaused(true);
									}
										
								});
							}
						}}
						style={{
							width:`100%`,
							height:`21px`
						}}
					>
						{paused ? 'Resume' : 'Pause'}
					</button>

					<button 
						onClick={() => {

							if (muted) {
								client.current.unmute()
								.then((result) => {

									if (
										result && 
										result.load && 
										result.load.data && 
										result.load.data.configured==="ok"
									) {
										setMuted(false);
									}

								});
							} else {
								client.current.mute()
								.then((result) => {
			
									if (
										result && 
										result.load && 
										result.load.data && 
										result.load.data.configured==="ok"
									) {
										setMuted(true);
									}
										
								});
							}

						}}
						style={{
							width:`100%`,
							height:`21px`
						}}
					>
						{muted ? 'Unmute' : 'Mute'}
					</button>

					<button 
						onClick={() => {

							if (
								client.current.publisher
							) {
								client.current.publisher.renegotiate({
									audio: true,
									video: true
								});
							}

						}}
						style={{
							width:`100%`,
							height:`21px`
						}}
					>
						Renegotiate
					</button>

					<button 
						onClick={() => {

							clearInterval(client.current.keepAliveInterval);
							
						}}
						style={{
							width:`100%`,
							height:`21px`
						}}
					>
						Stop Keepalive
					</button>

					<div 
						id="local"
						style={{
							display: `flex`,
							maxHeight: `calc(100% - 84px)`,
							width: `100%`,
							alignItems: `center`,
							justifyContent: `center`
						}}
					/>

				</div>

				<div
					id="container"
					style={{
						display:`flex`,
						flexWrap:`wrap`,
						height:`66.6%`,
						width:`100%`,
						overflow:`auto`
					}} 
				/>

			</div>
			
		</div>

	);

}

const app = document.getElementById('application');

app.style.width = '100vw';

app.style.height = '100vh';

document.body.appendChild(app);

const params = new URLSearchParams(window.location.href);

const user_id = '12'; //params.get(`user_id`);

const host = params.get(`host`);

const port = params.get(`port`);

logger.info(`params - ${user_id} ${host} ${port}`);

const url = `3.121.126.200`;

const domain = `ec2-3-121-126-200.eu-central-1.compute.amazonaws.com`;

const server = `ws://${url}:8080/?id=${user_id}`; //`ws://${host}:${port}/?id=${user_id}`;

console.log('server', server);

ReactDOM.render(<VideoRoom server={server} />, app);
//http://localhost:3000?search&user_id=12&host=127.0.0.1&port=8080
//http://localhost:3000?search&user_id=12&host=ec2-3-121-126-200.eu-central-1.compute.amazonaws.com&port=8080
