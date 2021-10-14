
import * as React from 'react';
import { Component } from 'react';
import { Rnd } from 'react-rnd';

type DraggableData = {
	node: HTMLElement,
	x: number,
	y: number,
	deltaX: number, deltaY: number,
	lastX: number, lastY: number
}

interface VideoRoomContainerProps {
    onDrag:(x:number, y:number) => void,
    onResize:(width:number, height:number) => void,
    width: number,
    height: number,
    x: number,
    y: number
}

interface VideoRoomContainerState {

}

export class VideoRoomContainer extends Component<VideoRoomContainerProps, VideoRoomContainerState> {

    constructor(props) {

        super(props);
    
        this.state = {
            
        };
    }
    


    componentDidMount() {
        
    }

    

    componentWillReceiveProps(nextProps) {
        
    }
    


    componentDidUpdate(prevProps, prevState) {
        
    }
    


    render() {
        return (
            <Rnd
                size={{ 
                    width: this.props.width,  
                    height: this.props.height 
                }}
                position={{ 
                    x: this.props.x, 
                    y: this.props.y
                }}
                onDragStart={(e, d: DraggableData) => {}}
                onDrag={(e, d: DraggableData) => {}}
                onDragStop={(e, d: DraggableData) => {
                    
                    this.props.onDrag(d.x, d.y);

                }}
                onResizeStart={(e,dir,ref) => {}}
                onResize={(e, direction, ref, delta, position) => {
                    this.props.onResize(ref.offsetWidth, ref.offsetHeight);
                    this.props.onDrag(position.x, position.y);
                    
                }}
                onResizeStop={(e, direction, ref, delta, position) => {
                    this.props.onResize(ref.offsetWidth, ref.offsetHeight);
                    this.props.onDrag(position.x, position.y);
                }}
                style={{

                }}
                enableResizing={{
                    bottom: true,
                    bottomLeft: true,
                    bottomRight: true,
                    left: true,
                    right: true,
                    top: true,
                    topLeft: true,
                    topRight: true
                }} 
                //lockAspectRatio={true}
                //lockAspectRatioExtraWidth={100}
                //lockAspectRatioExtraHeight={120}
                //disableDragging={false}
                //minWidth={200}
                //minHeight={200}
                bounds="window" //"parent" "body" ".fooClassName"
                //maxWidth
                //maxHeight
                /*
                resizeHandleStyles={{
                    bottom: {}, //React.CSSProperties,
                    bottomLeft: {},
                    bottomRight: {},
                    left: {},
                    right: {},
                    top: {},
                    topLeft: {},
                    topRight: {}
                }}
                resizeHandleComponent={{
                    top: <div> </div>,  //React.ReactElement<any>,
                    right: <div> </div>, 
                    bottom: <div> </div>,
                    left: <div> </div>,
                    bottomRight: <div> </div>,
                    bottomLeft: <div> </div>,
                    topLeft: <div> </div>
                }}
                */
                //resizeHandleWrapperStyle={{}}
                //cancel={'.body'}
                //enableUserSelectHack={true}
                //allowAnyClick={true}
            >
                {this.props.children}
            </Rnd>
        )
    }
}






