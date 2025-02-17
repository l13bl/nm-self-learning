// eslint-disable-next-line @typescript-eslint/no-var-requires
const withNx = require("@nrwl/next/plugins/with-nx");

/**
 * @type {import('@nrwl/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
	images: {
		domains: [
			"localhost",
			"source.unsplash.com",
			"images.unsplash.com",
			"loremflickr.com",
			"cloudflare-ipfs.com",
			"c.pxhere.com",
			"raw.githubusercontent.com"
		]
	},
	nx: {
		// Set this to true if you would like to to use SVGR
		// See: https://github.com/gregberge/svgr
		svgr: true
	}
};

module.exports = withNx(nextConfig);
