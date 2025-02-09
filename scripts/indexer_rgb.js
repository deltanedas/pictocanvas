function diff(a, b) {
	// format is 0xRRGGBBAA
	const ar = (a >> 24) & 0xFF,
		ag = (a >> 16) & 0xFF,
		ab = (a >> 8 )& 0xFF;
	// get in
	const br = (b >> 24) & 0xFF,
		bg = (b >> 16) & 0xFF,
		bb = (b >> 8) & 0xFF;
	// Use Euclidean distance instead
	const dr = ar - br,
		dg = ag - bg,
		db = ab - bb;
	return dr * dr + dg * dg + db * db;
}

module.exports = (core, pixmap) => {
	const palette = core.canvas.palette;
	const percent = pixmap.width / 100;
	for (var x = 0; x < pixmap.width; x++) {
		core.stage = "RGB Indexing: " + Math.floor(x / percent) + "%";
		for (var y = 0; y < pixmap.height; y++) {
			var pixel = pixmap.get(x, y);

			var closest = null, egg = Number.MAX_VALUE;
			for (var other of palette) {
				let h = diff(pixel, other);
				if (h < egg) {
					closest = other;
					egg = h;
				}
			}

			pixmap.set(x, y, closest);
		}
	}
};
