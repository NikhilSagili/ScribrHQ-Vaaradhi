/* Demo configuration.

   assetMode:
     'brand'       - Vaaradhi's own logo (img/vaaradhi-logo.png). Used by the public demo and
                     the local meeting copy.
     'placeholder' - a text wordmark ("VF") instead of the logo.
   Product photos are the same in both builds: img/products/, listed in data/product-images.js
   (made by tools/fetch_product_images.py).

   subscriptionCutoff:
     PROVISIONAL. Changes to tomorrow's subscription delivery close at this local time
     (24-hour clock, Asia/Kolkata). To be agreed with Vaaradhi. Change it here only.

   sampleInterest:
     Seed 8 illustrative breakfast-interest responses (labelled "Sample" in the merchant view).
     false in the public demo, so it starts with an empty interest list; the local meeting copy
     turns it on. Sample responses are always stored apart from customer-submitted ones.

   homeEssentials:
     Product ids shown in the "Everyday essentials" row on the customer Home screen.
     A presentation choice, not a claim about what sells most. */
window.DEMO_CONFIG = {
  assetMode: 'brand',
  brandAssets: {
    logo: 'img/vaaradhi-logo.png',
  },
  subscriptionCutoff: '21:00',
  sampleInterest: false,
  homeEssentials: [
    'desi-eggs-6-pcs', 'onion-1-kg', 'potato-500-g', 'sunflower-oil-1-litre',
    'wheat-flour-1-kg', 'sona-masuri-rice-1-kg', 'minapappu-500-g', 'ragi-idli-rava-500-g',
  ],
};
