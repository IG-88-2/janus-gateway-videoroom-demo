import './assets/styles.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useState, useEffect, useRef } from 'react';
import { v1 as uuidv1 } from 'uuid';
import { Consola, BrowserReporter } from 'consola';
import JanusClient from './janus-gateway-client/lib/janus-gateway-client';
import JanusSubscriber from './janus-gateway-client/lib/subscriber';
import JanusPublisher from './janus-gateway-client/lib/publisher';
const moment = require('moment');



const getDatePrefix = () => {

    const date = moment().format('H:mm:ss:SSS');

    return date;

};



const logger : any = new Consola({
    level: 3,
    reporters: [
      new BrowserReporter()
    ]
});



const log = {
    success: (...args) => {
        
        logger.success(getDatePrefix(), ...args);

    },
    info: (...args) => {
        
        logger.info(getDatePrefix(), ...args);
        
    },
    error: (error:any) => {
        
        logger.error(error);

    },
    json: (...args) => {
        
        logger.info(`JSON`, getDatePrefix(), ...args);

    },
    tag: (tag:string, type:`success` | `info` | `error`) => (...args) => {
        
        const tagged = logger.withTag(tag);
        
        if (tagged[type]) {
            tagged[type](getDatePrefix(), ...args);
        }
    }
};



const onError = (error) => {

    log.error(error);
    
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



const onPublisher = (publisher) => {

	publisher.addEventListener("terminated", () => {
		
		const video = document.getElementById(publisher.id);

		if (video) {
			video.remove();
		}

	});

	const video = document.createElement("video");

	video.id = publisher.id;
	video.autoplay = true;
	video.muted = true;
	video.width = 320;
	video.height = 240;
	video.style.height = "100%";
	
	const container = document.getElementById("local");
	
	container.appendChild(video);
	
	video.srcObject = publisher.stream;

};



const onSubscriber = async (subscriber:JanusSubscriber) => {
		
	subscriber.addEventListener("leaving", () => {
		
		const video = document.getElementById(subscriber.id);

		if (video) {
			video.remove();
		}

	});

	await subscriber.initialize();

	const video = document.createElement("video");

	video.id = subscriber.id;
	video.autoplay = true;
	video.width = 180;
	video.height = 120;
	video.style.background = "green";
	video.style.padding = "5px";
	
	const container = document.getElementById("container");

	container.appendChild(video);
	
	video.srcObject = subscriber.stream;

};



const connect = (client, server) => {

	if (client.current) {
		return client.current.getRooms().then(({ load }) => load);
	}

	client.current = new JanusClient({
		server,
		onPublisher: (publisher:JanusPublisher) => {

			onPublisher(publisher);

		},
		onSubscriber: async (subscriber:JanusSubscriber) => {
			
			onSubscriber(subscriber);

		},
		onError: (error) => {

			onError(error);

		}
	});

	return client.current.initialize()
	.then(() => (

		client.current.getRooms().then(({ load }) => load)

	));

};



const disconnect = (client) => {

	if (client.current) {
		const video = document.getElementById(client.current.publisher.id);
		if (video) {
			video.remove();
		}
		client.current.terminate();
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
			<div>
				{room_id}
			</div>
			<div style={{
				display:"flex"
			}}>
				<button onClick={(e) => onJoin()}>
					Join
				</button>
				<button onClick={(e) => onLeave()}>
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
					<button onClick={() => {

						connect(client, server)
						.then((rooms) => {
							
							setRooms(rooms);

						});

					}}>
						Connect
					</button>
					<button onClick={() => {

						disconnect(client);
						
						setRooms([]);

					}}>
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

							log.info('onCreateRoom response');
							
							log.json(result);

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

				<div style={{
					display:`flex`,
					flexDirection:`column`,
					overflow:`auto`
				}}>
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

					<div 
						id="local"
						style={{
							display: `flex`,
							maxHeight: `calc(100% - 42px)`,
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

const user_id = params.get(`user_id`);

const host = params.get(`host`);

const port = params.get(`port`);

log.info(`params - ${user_id} ${host} ${port}`);

const server = `ws://${host}:${port}/?id=${user_id}`;

ReactDOM.render(<VideoRoom server={server} />, app);
