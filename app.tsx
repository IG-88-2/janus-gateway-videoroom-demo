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
	
	const container = document.getElementById("container");
	
	container.children[0].appendChild(video);
	
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
	video.width = 320;
	video.height = 240;
	video.style.background = "green"
	video.style.padding = "10px"

	const container = document.getElementById("container");

	container.children[1].appendChild(video);
	
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



const onCreateRoom = (client, roomName) => {

};



const onJoinRoom = (client, room) => {

	if (client.current) {
		client.current.join(room.room_id);
	}

};



const onLeaveRoom = (client) => {

	if (client.current) {
		client.current.leave();
	}
	
};



const onPause = (client) => {

};



const onMute = (client) => {

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
				<button onClick={e => onJoin()}>
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

	const [roomName, setRoomName] = useState(``);



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
					<input value={roomName} onChange={(e) => setRoomName(e.target.value)} />
					<button onClick={(e) => onCreateRoom(client, roomName)}>
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

										onLeaveRoom(room);

									}}
								/>
							);
						})
					}
				</div>

			</div>
					
			<div
				id={`container`}
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
						onClick={() => onPause(client)}
						style={{
							width:`100%`
						}}
					>
						Pause
					</button>

					<button 
						onClick={() => onMute(client)}
						style={{
							width:`100%`
						}}
					>
						Mute
					</button>

				</div>

				<div style={{
					display:`flex`,
					flexWrap:`wrap`,
					height:`66.6%`,
					width:`100%`,
					overflow:`auto`
				}}>
					
				</div>

			</div>
			
		</div>

	);

}

const app = document.getElementById('application');

app.style.width = '100vw';

app.style.height = '100vh';

document.body.appendChild(app);

const params = new URLSearchParams(window.location.href);

const user_id = uuidv1(); //params.get(`user_id`);

const host = `127.0.0.1`; //params.get(`host`);

const port = `8080`; //params.get(`port`);

const server = `ws://${host}:${port}/?id=${user_id}`;

ReactDOM.render(<VideoRoom server={server} />, app);
