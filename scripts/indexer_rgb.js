function diff(a, b) {
	const ar = (a >> 24) & 0xFF,
		ag = (a >> 16) & 0xFF,
		ab = (a >> 8) & 0xFF;
	// get in
	const br = (b >> 24) & 0xFF,
		bg = (b >> 16) & 0xFF,
		bb = (b >> 8) & 0xFF;
	const dr = Math.abs(ar - br),
		dg = Math.abs(ag - bg),
		db = Math.abs(ab - bb);
	return dr + dg + db;
}

module.exports = (core, pixmap) => {
	const palette = core.canvas.palette;
	const percent = pixmap.width / 100;
	for (var x = 0; x < pixmap.width; x++) {
		core.stage = "RGB Indexing: " + Math.floor(x / percent) + "%";
		for (var y = 0; y < pixmap.height; y++) {
			var pixel = pixmap.get(x, y);

			var closest = null, egg = 1000;
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
