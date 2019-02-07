function hsvToRgb (h, s, v) {
	// h /= 360
	v = Math.round(v * 255)

	let i = Math.floor(h * 6)
	let f = h * 6 - i
	let p = Math.round(v * (1 - s))
	let q = Math.round(v * (1 - f * s))
	let t = Math.round(v * (1 - (1 - f) * s))

	switch (i % 6) {
	case 0:
		return [v, t, p]
	case 1:
		return [q, v, p]
	case 2:
		return [p, v, t]
	case 3:
		return [p, q, v]
	case 4:
		return [t, p, v]
	case 5:
		return [v, p, q]
	}
}

function toHex(d) {
    return  ("0"+(Number(d).toString(16))).slice(-2).toUpperCase()
}

function rgb2color(rgb) {
	return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`
}

function gen_colors(count, h, s, v){
	count = count || 32
	h = h || Math.random()
	s = s || 0.74
	v = v || 0.86
	let res = []
	for(let i=0;i<count; i++){
		h += 0.618033988749895
		h %= 1
		res.push(rgb2color(hsvToRgb(h, s, v)))
	}
	return res
}