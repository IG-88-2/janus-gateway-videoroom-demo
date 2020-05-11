import './assets/styles.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Component } from 'react';
import { onError } from './utils/onError';
import { VideoRoom } from './VideoRoom';
const axios = require('axios');

/*
http://192.168.21.141:8088/janus

sudo docker images

sudo docker ps

sudo docker stop b5bc69cf8347

sudo docker run -i -t -p 8188:8188 -p 8088:8088 4c6aa60bb4ce

./janus --config=/opt/janus/etc/janus/janus.cfg
*/

console.log(process.env.NODE_ENV);



const isDev = () => process.env.NODE_ENV==="development";



window.onerror = (msg:any, url, lineNo, columnNo, err) => {

    let obj = {};
    
    try {

		obj = JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)));

    } catch(e) {

	}
	
    const error = JSON.stringify({ 
        'development' : isDev(),
        'Message' : msg,
        'URL' : url,
        'Line' : lineNo,
        'Column' : columnNo,
        ...obj
    });
    
    onError(error, 'window.onerror');

	return true; //suppress error
	
};



interface AppProps {

}



interface AppState {
	user: any,
	component: any
}



class App extends Component<AppProps,AppState>{
	
	constructor(props) {

		super(props);

		this.state = {
			user : {
				id : null
			},
			component : null
		};

	}

	

	render() {
		
		return (
			<div 
				id="root"
				style={{
					height:"100%",
					display:"flex",
					flexDirection:"column",
					justifyContent:"center"
				}}
			>
				<VideoRoom />
			</div>
		);

	}

}

const app = document.getElementById('application');

app.style.width = '100vw';

app.style.height = '100vh';

document.body.appendChild(app);

ReactDOM.render(
	<App />,
	document.getElementById('application')
);
