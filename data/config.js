/* Demo configuration.

   assetMode:
     'placeholder' - neutral product tiles and a generic logo. Use for the PUBLIC demo.
     'brand'       - Vaaradhi's own logo and product photos. Only for the LOCAL meeting copy
                     made by tools/make_meeting_copy.py, pending Vaaradhi's permission.
   Brand image files are never committed. They live in the local meeting copy only.

   subscriptionCutoff:
     PROVISIONAL. Changes to tomorrow's subscription delivery close at this local time
     (24-hour clock, Asia/Kolkata). To be agreed with Vaaradhi. Change it here only.

   homeEssentials:
     Product ids shown in the "Everyday essentials" row on the customer Home screen.
     A presentation choice, not a claim about what sells most. */
window.DEMO_CONFIG = {
  assetMode: 'placeholder',
  brandAssets: {
    logo: null,                  // e.g. 'brand/logo.png' in the meeting copy
    productImageDir: null,       // e.g. 'brand/products/' in the meeting copy; files named <product id>.<ext>
    productImages: {},           // product id -> file name, filled by the meeting-copy tool
  },
  subscriptionCutoff: '21:00',
  homeEssentials: [
    'desi-eggs-6-pcs', 'onion-1-kg', 'potato-500-g', 'sunflower-oil-1-litre',
    'wheat-flour-1-kg', 'sona-masuri-rice-1-kg', 'minapappu-500-g', 'ragi-idli-rava-500-g',
  ],
};
