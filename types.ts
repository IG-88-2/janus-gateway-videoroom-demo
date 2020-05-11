export type Dispatch = (action:action) => void;



export interface IceServer {
	urls: string
};



export interface action{ 
	type: string, 
	load: any 
};



export interface RoomData {
	audiocodec: string,
	bitrate: number,
	description: string,
	fir_freq: number,
	max_publishers: number,
	notify_joining: boolean,
	num_participants: number,
	pin_required: boolean,
	record: boolean,
	require_pvtid: boolean,
	room: number, //room_id
	videocodec: string, //"vp8"
	participants?: any[] 
};



export interface RequestBase<T> {
	janus: T,
	transaction?: string,
	token?: string,
	apisecret?: string,
	session_id?: number, 
	handle_id?: number,
	jsep?:Jsep
};



export interface CreateSessionRequest extends RequestBase<"create"> {

};



export interface CreateSessionResponse extends RequestBase<"success"> {
	data: {
		id: number
	}
};



export interface KeepAliveRequest extends RequestBase<"keepalive"> {

};



export interface KeepAliveResponse extends RequestBase<"ack"> {
	
};



export interface AttachRequest extends RequestBase<"attach"> {
	plugin: "janus.plugin.videoroom", 
	opaque_id: string
};



export interface AttachResponse extends RequestBase<"success"> {
	data: {
		id: number
	}
};



export interface CreateRequest {
	request: "create",
	room: number,
	permanent: boolean,
	description: string,
	secret?: string,
	pin?: string,
	is_private: boolean,
	allowed? : string[],
	type?: "synchronous"
};



export interface CreateResponse {
	videoroom: "created",
	room: number,
	permanent: boolean
};



export interface ErrorResponse {
	videoroom: "event",
	error_code: number,
	error: string
};



export interface DestroyRequest {
	request : "destroy",
	room: number,
	secret?: string,
	permanent: boolean,
	type?: "synchronous"
};



export interface DestroyResponse {
	videoroom: "destroyed",
	room: number
};



export interface EditRequest {
	request: "edit",
	room: number,
	secret?: string,
	new_description: string,
	new_secret: string,
	new_pin: string,
	new_is_private: boolean,
	new_require_pvtid: boolean,
	new_bitrate: number,
	new_fir_freq: number,
	new_publishers: number,
	permanent: boolean,
	type?: "synchronous"
};



export interface EditResponse {
	videoroom: "edited",
	room: number
};



export interface ExistsRequest {
	request: "exists",
	room: number,
	type?: "synchronous"
};



export interface ExistsResponse {
	videoroom: "success",
	room: number,
	exists: boolean
};



export interface ListRequest {
	request: "list",
	type?: "synchronous"
};



export interface ListResponse {
	videoroom: "success",
	rooms: RoomData[]
};



export interface ListParticipantsRequest {
	request: "listparticipants",
	room: number
};



export interface ParticipantData {
	id: number,
	display: string,
	talking: boolean,
	internal_audio_ssrc: any,
	internal_video_ssrc: any
};



export interface ListParticipantsResponse {
	videoroom: "participants",
	room: number,
	participants: ParticipantData[]
};



export interface AllowedRequest {
	request: "allowed",
	secret?: string,
	action: "enable" | "disable" | "add" | "remove",
	room: number,
	allowed: string[],
	type?: "synchronous"
};



export interface AllowedResponse {
	videoroom: "success",
	room: number,
	allowed: string[]
};



export interface KickRequest {
	request: "kick",
	secret: string,
	room: number,
	id: number,
	type?: "synchronous"
};



export interface KickResponse {
	videoroom: "success"
};



export interface JoinPublisherRequest {
	request: "join",
	ptype: "publisher",
	room: number,
	id?: number,
	display: string,
	token?: string,
	type?: "asynchronous"
};



export interface PublisherData {
	id: number,
	display: string,
	audio_codec: string,
	video_codec: string,
	simulcast: boolean,
	talking: boolean
};



export interface AttendeeData {
	id: number,
	display: string
};



export interface JoinPublisherResponse{
	videoroom: "joined",
	room: number,
	description: string,
	id: number,
	private_id: number,
	publishers: PublisherData[],
	attendees?: AttendeeData[]
};



export interface JoinPublisherEvent {
	videoroom: "event",
	room: number,
	joining: {
		id: number,
		display: string
	}
};



export interface JoinAndConfigureRequest {
	type?: "asynchronous"
};



export interface ConfigureRequest {
	request: "configure",
	audio: boolean,
	video: boolean,
	data: boolean,
	bitrate: number
	keyframe: boolean,
	record: boolean,
	filename?: string,
	display: string,
	type?: "asynchronous"
};



export interface ConfigureResponse {
	videoroom: "event",
	configured: "ok"
};



export interface ConfigureEvent {
	videoroom: "talking" | "stopped-talking",
	room: number,
	id: number,
	"audio-level-dBov-avg": number
};



export interface PublishRequest {
	request: "publish",
	audio: boolean,
	video: boolean,
	data: boolean,
	audiocodec: string,
	videocodec: string,
	bitrate: number,
	record: boolean,
	filename: string,
	display: string,
	type?: "asynchronous"
};



export interface PublishResponse {
	videoroom: "event",
	configured: "ok"
};



export interface PublishEvent {
	videoroom: "event",
	room: number,
	publishers: PublisherData[]
};



export interface UnpublishRequest {
	request: "unpublish"
	type?: "asynchronous"
};



export interface UnpublishResponse {
	videoroom: "event",
	unpublished: "ok"
};



export interface UnpublishEvent {
	videoroom: "event",
	room: number,
	unpublished: number
};



export interface StartRequest {
	request: "start"
	type?: "asynchronous"
};



export interface StartResponse {
	videoroom: "event",
	started: "ok"
};



export interface PauseRequest {
	request: "pause"
	type?: "asynchronous"
};



export interface PauseResponse {
	videoroom: "event",
	paused: "ok"
};



export interface SwitchRequest {
	request: "switch",
	feed: number,
	audio: boolean,
	video: boolean,
	data: boolean,
	type?: "asynchronous"
};



export interface SwitchEvent {
	videoroom: "event",
	switched: "ok",
	room: number,
	id: number
};



export interface LeaveRequest {
	request: "leave",
	type?: "asynchronous"
};



export interface LeaveResponse {
	videoroom: "event",
	leaving: "ok"
};



export interface LeaveResponse2 {
	videoroom: "event",
	left: "ok"
};



export interface LeaveEvent {
	videoroom: "event",
	room: number,
	"leaving|unpublished": number
};



export interface RtpForwardRequest {
	request: "rtp_forward",
	room: number,
	publisher_id: number,
	host: string,
	host_family: "ipv4" | "ipv6",
	audio_port: number
	audio_ssrc?: string,
	audio_pt?: string,
	audio_rtcp_port: number,
	video_port: number,
	video_ssrc?: string,
	video_pt?: string,
	video_rtcp_port?: number,
	video_port_2: number,
	video_ssrc_2?: string,
	video_pt_2?: string,
	video_port_3: number,
	video_ssrc_3?: string,
	video_pt_3?: string,
	data_port: number,
	srtp_suite?: number,
	srtp_crypto?: string,
	type?: "asynchronous"	
};



export interface RtpForwardResponse {
	videoroom: "rtp_forward",
	room: number,
	publisher_id: number,
	rtp_stream: {
		host: string,
		audio: number,
		audio_rtcp: number,
		audio_stream_id: number,
		video: number,
		video_rtcp: number,
		video_stream_id: number,
		video_2: number,
		video_stream_id_2: number,
		video_3: number,
		video_stream_id_3: number,
		data: number,
		data_stream_id: number
	}
};



export interface RtpForwardStopRequest {
	request: "stop_rtp_forward",
	room: number,
	publisher_id: number,
	stream_id: number,
	type?: "asynchronous"	
};



export interface RtpForwardStopResponse {
	videoroom: "stop_rtp_forward",
	room: number,
	publisher_id: number,
	stream_id: number
};



export interface ListForwardersRequest {
	request: "listforwarders",
	room: number,
	secret: string,
	type?: "asynchronous"	
};



export interface RtpForwarder {
	audio_stream_id: number,
	video_stream_id: number,
	data_stream_id: number,
	ip: string,
	port: number,
	rtcp_port: number,
	ssrc: string,
	pt: string,
	substream: string,
	srtp: boolean
};



export interface RtpForwarders {
	publisher_id: number,
	rtp_forwarders: RtpForwarder[]
};



export interface ListForwardersResponse {
	videoroom: "forwarders",
	room: number,
	rtp_forwarders: RtpForwarders
};



export interface JoinSubscriberRequest {	
	request: "join",
	ptype: "subscriber",
	room: number,
	feed: number,
	private_id: number,
	close_pc: boolean,
	audio: boolean,
	video: boolean,
	data: boolean,
	offer_audio: boolean,
	offer_video: boolean,
	offer_data: boolean,
	substream?: number,
	temporal?: number,
	spatial_layer?: number,
	temporal_layer?: number
};



export interface JoinSubscriberResponse{
	videoroom: "attached",
	room: number,
	feed: number,
	display: string
};



export interface ConfigureSubscriberRequest {
	request: "configure",
	audio: boolean,
	video: boolean,
	data: boolean,
	substream?: number,
	temporal?: number,
	spatial_layer?: number,
	temporal_layer?: number
};



export interface Jsep {
	type : "offer" | "answer",
	sdp : string
};



export type Transaction = <T extends RequestBase<string>, U>(request: T, jsep?: any) => Promise<U>;
