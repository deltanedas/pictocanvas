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

// 4×4 Bayer matrix.
const bayer4x4 = [
  [ 0,  8,  2, 10],
  [12,  4, 14,  6],
  [ 3, 11,  1,  9],
  [15,  7, 13,  5]
];

// Strength factor for the dithering offset.
const DITHER_STRENGTH = 16.0;

module.exports = (core, pixmap) => {
	const palette = core.canvas.palette;
	const width   = pixmap.width;
	const height  = pixmap.height;

	const paletteData = palette.map(color => getColorComponents(color));

	for (let y = 0; y < height; y++) {
		core.stage = "RGB Indexing: " + Math.floor((y / height) * 100) + "%";

		for (let x = 0; x < width; x++) {
			let pixel = pixmap.get(x, y);
			let pixelRGBA = getColorComponents(pixel);

			// Look up the Bayer threshold in [0..15], convert to [0..1]
			const bayerVal = bayer4x4[y % 4][x % 4] / 16.0;

			// For each color channel (R, G, B), add a small offset based on bayerVal
			// We center the offset around 0 by subtracting 0.5, then multiply by some strength.
			// For example, if bayerVal=0.0, offset=-0.5*DITHER_STRENGTH; if bayerVal=1.0, offset=+0.5*DITHER_STRENGTH.
			pixelRGBA[0] = Math.min(255, Math.max(0, pixelRGBA[0] + (bayerVal - 0.5) * DITHER_STRENGTH));
			pixelRGBA[1] = Math.min(255, Math.max(0, pixelRGBA[1] + (bayerVal - 0.5) * DITHER_STRENGTH));
			pixelRGBA[2] = Math.min(255, Math.max(0, pixelRGBA[2] + (bayerVal - 0.5) * DITHER_STRENGTH));

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
		}
	}
};
