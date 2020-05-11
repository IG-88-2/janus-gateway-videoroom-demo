import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { identity, pathOr, has, allPass, uniqBy, prop, isEmpty } from 'ramda';
import { Component } from 'react';
import { Provider, connect } from 'react-redux';
import { createStore } from 'redux';
import { Subscription, merge, Observable } from 'rxjs';
import { JanusClient } from './janus-gateway-client/lib/janus-gateway-client';
import { CreateSessionResponse } from './types';
import { attachMediaStream } from './utils/attachMediaStream';
import { v1 as uuidv1 } from 'uuid';
import JanusSubscriber from './janus-gateway-client/lib/subscriber';



interface VideoRoomProps {}



interface VideoRoomState {
	rooms:any[]
}



export class VideoRoom extends Component<VideoRoomProps,VideoRoomState>{
	client: JanusClient
	server: string

	constructor(props){

		super(props);

		this.state = {
			rooms:[]
		};

		const user_id = uuidv1();

		this.server = `ws://127.0.0.1:8080/?id=${user_id}`;
		
	}



	onPublisher = (publisher) => {

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
		
		container.appendChild(video);
		
		video.srcObject = publisher.stream;

	}



	onSubscriber = async (subscriber:JanusSubscriber) => {
		
		subscriber.addEventListener("leaving", () => {

			console.log(`LEAVING EVENT ${subscriber.feed}`);

			const video = document.getElementById(subscriber.id);

			if (video) {
				video.remove();
			}

		});

		await subscriber.initialize();

		const video = document.createElement("video");

		video.id = subscriber.id;
		video.autoplay = true;
		video.width = 640;
		video.height = 480;
		video.style.background = "green"
		video.style.padding = "10px"

		const container = document.getElementById("container");

		container.appendChild(video);
		
		video.srcObject = subscriber.stream;

	}



	start = () => {

		this.client = new JanusClient({
			server: this.server,
			onPublisher: (publisher) => {

				this.onPublisher(publisher);

			},
			onSubscriber: async (subscriber:JanusSubscriber) => {
				
				this.onSubscriber(subscriber);

			},
			onError: (error) => {

				console.error(error);

			}
		});

		return this.client.initialize()
		.then(() => {

			return this.client.getRooms();

		})
		.then(({ load }) => {

			this.setState({ rooms : load });

		});

	}



	render() {
		

		return <div style={{
			display:"flex",
			flexDirection:"column",
			height:"100%",
			width:"100%"
		}}>
			<div style={{
				display:"flex",
				height:"50px"
			}}>
				<button onClick={(e) => this.start()}>
					START
				</button>
				<button onClick={(e) => {

					const video = document.getElementById("my");

					if (video) {
						video.remove();
					}

					this.setState({ rooms : [] }, () => {

						if (this.client) {
							this.client.terminate();
						}

					});
					
				}}>
					STOP
				</button>
			</div>

			<div style={{
				display:"flex",
				flex:1,
				width:"100%"
			}}>
				<div style={{
					display:"flex",
					flexDirection:"column",
					height:"100%",
					width:"150px"
				}}>
					{
						this.state.rooms.map((room) => {

							const {
								room_id,
								instance_id,
								participants
							} = room;

							return <div 
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
									<button onClick={e => {

										if (this.client) {
											this.client.join(room_id);
										}

									}}>
										JOIN
									</button>
									<button onClick={async (e) => {
										
										if (this.client) {
											this.client.leave();
										}

										const video = document.getElementById("my");

										if (video) {
											video.remove();
										}

									}}>
										LEAVE
									</button>
								</div>
							</div>

						})
					}
				</div>
				<div 
					id="container"
					style={{
						display:"flex",
						flexWrap:"wrap",
						height:"100%",
						flex:1,
						background:"blue"
					}}
				>
					
					
				</div>
			</div>
			
		</div>

	}

}
