import './assets/styles.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
const moment = require('moment');
import { v1 as uuidv1 } from 'uuid';
import { useState, useRef, Component } from 'react';
import { Consola, BrowserReporter } from 'consola';
import { JanusVideoRoom } from 'react-videoroom-janus';



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



class App extends Component<any,any> {

	constructor(props) {
		
		super(props);

		this.state = {
			room: null
		};

	}

	

	render() {

		return <div>
			<div>
				app
			</div>
			<JanusVideoRoom
				logger={logger}
				generateId={() => uuidv1()}
				onPublisherDisconnected={(publisher:any) => {

				}}
				rtcConfiguration={{
					"iceServers": [{
						urls: "stun:stun.voip.eutelia.it:3478"
					}],
					"sdpSemantics" : "unified-plan"
				}}
				mediaConstraints={{}}
				customStyles={{
					video:{
		
					},
					container:{
						
					},
					videoContainer:{
						
					},
					localVideo:{
						
					},
					localVideoContainer:{
						
					}
				}}
				server={this.props.server}
				room={this.state.room}
				onConnected={(publisher:any) => {

				}}
				onDisconnected={(error) => {

				}}
				onRooms={(rooms:any) => {

				}}
				onError={(error:any) => {

				}}
				onParticipantJoined={(participant:any) => {

				}}
				onParticipantLeft={(participant:any) => {

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
	
	}

}

const app = document.getElementById('application');

app.style.width = '100vw';

app.style.height = '100vh';

document.body.appendChild(app);

const params = new URLSearchParams(window.location.href);

const user_id = params.get(`user_id`); //'12'

const host = params.get(`host`);

const port = params.get(`port`);

logger.info(`params - ${user_id} ${host} ${port}`);

const url = `127.0.0.1`; //`3.121.126.200`; //host; //

const server = `ws://${url}:8080/?id=${user_id}`; //`ws://${host}:${port}/?id=${user_id}`;

ReactDOM.render(<App server={server} />, app);
//http://localhost:3000?search&user_id=12&host=127.0.0.1&port=8080
//http://localhost:3000?search&user_id=12&host=ec2-3-121-126-200.eu-central-1.compute.amazonaws.com&port=8080
