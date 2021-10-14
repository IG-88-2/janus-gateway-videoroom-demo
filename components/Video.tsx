import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Component } from 'react';
import { JanusVideoRoom } from 'react-videoroom-janus';
import { v1 as uuidv1 } from 'uuid';
import { playStream } from '../utils/playStream';



interface VideoProps {
	id:string,
	muted:boolean,
	style:any,
	stream:any
}



interface VideoState {

}



export class Video extends Component<VideoProps,VideoState> {
	video:any
	container:any 

	constructor(props) {

		super(props);
		
	}
	


	componentDidMount() {

		if (this.props.stream) {
			playStream(this.video, this.props.stream, this.props.muted);
		}

	}



	componentWillReceiveProps(nextProps) {
		
		if (nextProps.stream!==this.props.stream) {
			playStream(this.video, nextProps.stream, this.props.muted);
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
			onMouseDown={(e) => {
				playStream(this.video, this.props.stream, this.props.muted);
			}}
			ref={(video) => { 
				this.video = video; 
			}}
		/>
		
	}

}


