/**
 * TODO check before - after
 * Helper method to munge an SDP to enable simulcasting (Chrome only)
 * @param sdp string 
 */
export const mungeSdpForSimulcasting = (sdp) => {
	// Let's munge the SDP to add the attributes for enabling simulcasting
	// (based on https://gist.github.com/ggarber/a19b4c33510028b9c657)

	let lines = sdp.split("\r\n");
	let video = false;
	let ssrc = [ -1 ]; 
	let ssrc_fid = [ -1 ];
	let cname = null; 
	let msid = null; 
	let mslabel = null; 
	let label = null;
	let insertAt = -1;

	for(let i = 0; i < lines.length; i++) {
		//among all lines find m line
		let mline = lines[i].match(/m=(\w+) */);
		if (mline) {
			let medium = mline[1];
			if (medium === "video") {
				// New video m-line: make sure it's the first one
				if (ssrc[0] < 0) {
					video = true;
				} else {
					// We're done, let's add the new attributes here
					insertAt = i;
					break;
				}
			} else {
				// New non-video m-line: do we have what we were looking for?
				if(ssrc[0] > -1) {
					// We're done, let's add the new attributes here
					insertAt = i;
					break;
				}
			}
			continue;
		}
		if (!video) {
			continue;
		}

		let fid = lines[i].match(/a=ssrc-group:FID (\d+) (\d+)/);

		if (fid) {
			ssrc[0] = fid[1];
			ssrc_fid[0] = fid[2];
			lines.splice(i, 1); i--;
			continue;
		}

		if (ssrc[0]) {
			let match = lines[i].match('a=ssrc:' + ssrc[0] + ' cname:(.+)');
			if (match) {
				cname = match[1];
			}
			match = lines[i].match('a=ssrc:' + ssrc[0] + ' msid:(.+)');
			if (match) {
				msid = match[1];
			}
			match = lines[i].match('a=ssrc:' + ssrc[0] + ' mslabel:(.+)');
			if (match) {
				mslabel = match[1];
			}
			match = lines[i].match('a=ssrc:' + ssrc[0] + ' label:(.+)');
			if (match) {
				label = match[1];
			}
			if (lines[i].indexOf('a=ssrc:' + ssrc_fid[0]) === 0) {
				lines.splice(i, 1); 
				i--;
				continue;
			}
			if (lines[i].indexOf('a=ssrc:' + ssrc[0]) === 0) {
				lines.splice(i, 1); 
				i--;
				continue;
			}
		}

		if (lines[i].length == 0) {
			lines.splice(i, 1); 
			i--;
			continue;
		}

	}

	if (ssrc[0] < 0) {
		// Couldn't find a FID attribute, let's just take the first video SSRC we find
		insertAt = -1;
		video = false;
		for(let i = 0; i < lines.length; i++) {
			let mline = lines[i].match(/m=(\w+) */);
			if (mline) {
				let medium = mline[1];
				if(medium === "video") {
					// New video m-line: make sure it's the first one
					if(ssrc[0] < 0) {
						video = true;
					} else {
						// We're done, let's add the new attributes here
						insertAt = i;
						break;
					}
				} else {
					// New non-video m-line: do we have what we were looking for?
					if(ssrc[0] > -1) {
						// We're done, let's add the new attributes here
						insertAt = i;
						break;
					}
				}
				continue;
			}
			if (!video) {
				continue;
			}
			if (ssrc[0] < 0) {
				let value = lines[i].match(/a=ssrc:(\d+)/);
				if (value) {
					ssrc[0] = value[1];
					lines.splice(i, 1); i--;
					continue;
				}
			} else {
				let match = lines[i].match('a=ssrc:' + ssrc[0] + ' cname:(.+)')
				if (match) {
					cname = match[1];
				}
				match = lines[i].match('a=ssrc:' + ssrc[0] + ' msid:(.+)')
				if (match) {
					msid = match[1];
				}
				match = lines[i].match('a=ssrc:' + ssrc[0] + ' mslabel:(.+)')
				if (match) {
					mslabel = match[1];
				}
				match = lines[i].match('a=ssrc:' + ssrc[0] + ' label:(.+)')
				if (match) {
					label = match[1];
				}
				if (lines[i].indexOf('a=ssrc:' + ssrc_fid[0]) === 0) {
					lines.splice(i, 1); i--;
					continue;
				}
				if (lines[i].indexOf('a=ssrc:' + ssrc[0]) === 0) {
					lines.splice(i, 1); i--;
					continue;
				}
			}
			if (lines[i].length == 0) {
				lines.splice(i, 1); i--;
				continue;
			}
		}
	}
	if (ssrc[0] < 0) {
		// Still nothing, let's just return the SDP we were asked to munge
		return sdp;
	}
	if (insertAt < 0) {
		// Append at the end
		insertAt = lines.length;
	}
	// Generate a couple of SSRCs (for retransmissions too)
	// Note: should we check if there are conflicts, here?
	ssrc[1] = Math.floor(Math.random()*0xFFFFFFFF);
	ssrc[2] = Math.floor(Math.random()*0xFFFFFFFF);
	ssrc_fid[1] = Math.floor(Math.random()*0xFFFFFFFF);
	ssrc_fid[2] = Math.floor(Math.random()*0xFFFFFFFF);
	// Add attributes to the SDP
	for (let i = 0; i < ssrc.length; i++) {
		if (cname) {
			lines.splice(insertAt, 0, 'a=ssrc:' + ssrc[i] + ' cname:' + cname);
			insertAt++;
		}
		if (msid) {
			lines.splice(insertAt, 0, 'a=ssrc:' + ssrc[i] + ' msid:' + msid);
			insertAt++;
		}
		if (mslabel) {
			lines.splice(insertAt, 0, 'a=ssrc:' + ssrc[i] + ' mslabel:' + mslabel);
			insertAt++;
		}
		if (label) {
			lines.splice(insertAt, 0, 'a=ssrc:' + ssrc[i] + ' label:' + label);
			insertAt++;
		}
		// Add the same info for the retransmission SSRC
		if (cname) {
			lines.splice(insertAt, 0, 'a=ssrc:' + ssrc_fid[i] + ' cname:' + cname);
			insertAt++;
		}
		if (msid) {
			lines.splice(insertAt, 0, 'a=ssrc:' + ssrc_fid[i] + ' msid:' + msid);
			insertAt++;
		}
		if (mslabel) {
			lines.splice(insertAt, 0, 'a=ssrc:' + ssrc_fid[i] + ' mslabel:' + mslabel);
			insertAt++;
		}
		if (label) {
			lines.splice(insertAt, 0, 'a=ssrc:' + ssrc_fid[i] + ' label:' + label);
			insertAt++;
		}
	}
	lines.splice(insertAt, 0, 'a=ssrc-group:FID ' + ssrc[2] + ' ' + ssrc_fid[2]);
	lines.splice(insertAt, 0, 'a=ssrc-group:FID ' + ssrc[1] + ' ' + ssrc_fid[1]);
	lines.splice(insertAt, 0, 'a=ssrc-group:FID ' + ssrc[0] + ' ' + ssrc_fid[0]);
	lines.splice(insertAt, 0, 'a=ssrc-group:SIM ' + ssrc[0] + ' ' + ssrc[1] + ' ' + ssrc[2]);
	sdp = lines.join("\r\n");
	if (!sdp.endsWith("\r\n")) {
		sdp += "\r\n";
	}
	return sdp;
}
