// Computes the squared distance between two ARGB colors (ignoring the alpha in the distance).
function diffRGBA(colorA, colorB) {
	// colorA = [rA, gA, bA, aA]
	// colorB = [rB, gB, bB, aB]
	const dr = colorA[0] - colorB[0];
	const dg = colorA[1] - colorB[1];
	const db = colorA[2] - colorB[2];
  
	return dr * dr + dg * dg + db * db;
}

function getColorComponents(color) {
	return [
		(color >>> 24) & 0xFF,
		(color >>> 16) & 0xFF,
		(color >>>  8) & 0xFF,
		(color	   ) & 0xFF
	];
}

function makeColor(rgba) {
	return ((rgba[0] & 0xFF) << 24) |
		   ((rgba[1] & 0xFF) << 16) |
		   ((rgba[2] & 0xFF) <<  8) |
		   (rgba[3] & 0xFF);
}

module.exports = (core, pixmap) => {
	const palette = core.canvas.palette;
	const width   = pixmap.width;
	const height  = pixmap.height;

	const paletteData = palette.map(color => getColorComponents(color));

	// Create an error buffer for R, G, B channels: size = width * height * 3
	const errors = new Array(width * height * 3).fill(0);

	function addError(x, y, channel, val) {
		if (x < 0 || x >= width || y < 0 || y >= height) return;
		errors[(y * width + x) * 3 + channel] += val;
	}

	for (let y = 0; y < height; y++) {
		core.stage = "RGB Indexing: " + Math.floor((y / height) * 100) + "%";

		for (let x = 0; x < width; x++) {
			let pixel = pixmap.get(x, y);
			let pixelRGBA = getColorComponents(pixel);

			// Add accumulated dithering error
			const idx = (y * width + x) * 3;
			pixelRGBA[0] = Math.min(255, Math.max(0, pixelRGBA[0] + Math.round(errors[idx	])));
			pixelRGBA[1] = Math.min(255, Math.max(0, pixelRGBA[1] + Math.round(errors[idx + 1])));
			pixelRGBA[2] = Math.min(255, Math.max(0, pixelRGBA[2] + Math.round(errors[idx + 2])));

			// Find the closest color in the palette
			let bestColor = null;
			let minDist = Number.MAX_VALUE;

			for (let i = 0; i < paletteData.length; i++) {
				const dist = diffRGBA(pixelRGBA, paletteData[i]);
				if (dist < minDist) {
					minDist = dist;
					bestColor = paletteData[i];
				}
			}

			pixmap.set(x, y, makeColor(bestColor));

			// Compute the error between our adjusted pixel and the chosen color
			const [br, bg, bb, ba] = bestColor;
			const errR = pixelRGBA[0] - br;
			const errG = pixelRGBA[1] - bg;
			const errB = pixelRGBA[2] - bb;

			// Distribute the error (Floyd–Steinberg)
			addError(x + 1, y,	 0, errR * (7 / 16));
			addError(x + 1, y,	 1, errG * (7 / 16));
			addError(x + 1, y,	 2, errB * (7 / 16));

			addError(x - 1, y + 1, 0, errR * (3 / 16));
			addError(x - 1, y + 1, 1, errG * (3 / 16));
			addError(x - 1, y + 1, 2, errB * (3 / 16));

			addError(x,	 y + 1, 0, errR * (5 / 16));
			addError(x,	 y + 1, 1, errG * (5 / 16));
			addError(x,	 y + 1, 2, errB * (5 / 16));

			addError(x + 1, y + 1, 0, errR * (1 / 16));
			addError(x + 1, y + 1, 1, errG * (1 / 16));
			addError(x + 1, y + 1, 2, errB * (1 / 16));
		}
	}
};
