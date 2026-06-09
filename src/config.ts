import { Mic, Video, Lightbulb } from 'lucide-react';

/**
 * ============================================================================
 * 🚀 MAIN CONFIGURATION FILE FOR BUYERS
 * ============================================================================
 * 
 * Edit this file to customize the app without needing to know how to code!
 * Simply change the text inside the quotes ("...") to your own values.
 */

export const APP_CONFIG = {
  // 1. Branding
  appName: "TeleMaster Pro",
  appTagline: "Studio-grade script pacing",
  appDescription: "Craft your video script here... \\n\\nUse empty lines to create natural pacing breaks.",

  // 2. Default Settings
  defaultWPM: 150,

  // 3. Monetization 💰
  // Replace the 'link' values with your actual affiliate links (e.g., from Amazon Associates, BH Photo, etc.)
  affiliateProducts: [
    {
      title: "Pro Wireless Mic",
      description: "Studio-grade wireless audio",
      price: "$199",
      icon: Mic,
      link: "https://amazon.com/your-affiliate-link-here", 
    },
    {
      title: "Creator Ring Light",
      description: "Perfect diffuse lighting",
      price: "$89",
      icon: Lightbulb,
      link: "https://amazon.com/your-affiliate-link-here",
    },
    {
      title: "4K Cinema Cam",
      description: "Ultra HD streaming",
      price: "$249",
      icon: Video,
      link: "https://amazon.com/your-affiliate-link-here",
    }
  ]
};
