/* Demo configuration.

   assetMode:
     'placeholder' - neutral product tiles and a generic logo. Use for the PUBLIC demo.
     'brand'       - Vaaradhi's own logo and product photos. Only for the LOCAL meeting copy
                     made by tools/make_meeting_copy.py, pending Vaaradhi's permission.
   Brand image files are never committed. They live in the local meeting copy only. */
window.DEMO_CONFIG = {
  assetMode: 'placeholder',
  brandAssets: {
    logo: null,                  // e.g. 'brand/logo.png' in the meeting copy
    productImageDir: null,       // e.g. 'brand/products/' in the meeting copy; files named <product id>.<ext>
    productImages: {},           // product id -> file name, filled by the meeting-copy tool
  },
};
