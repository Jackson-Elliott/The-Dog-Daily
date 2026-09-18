import type { Episode } from "@/types/episode";

const now = new Date().toISOString();

/**
 * Temporary placeholder episodes for previewing the site design before a
 * Supabase project is set up. Audio files are real AWL radio spots copied to
 * public/audio/ (gitignored — see .gitignore) with titles derived from their
 * filenames. Photos are scraped from the real news story supplied for each
 * spot and hotlinked directly rather than downloaded/re-hosted (that
 * re-hosting only happens for real Supabase uploads via /admin — see
 * lib/episodes.ts createEpisode). Headlines are rewritten by hand (rather
 * than used verbatim) as short standalone "Dogs never..." / "Dogs would
 * never..." / "Dogs don't..." one-liners — the punchline itself, without a
 * trailing "unlike ..." clause spelling out the real story — matching the
 * site's "turning news headlines about bad humans into good reasons to
 * adopt" premise (see app/layout.tsx metadata). Enable via
 * USE_MOCK_EPISODES=true in .env.local; see lib/episodes.ts. Replace with
 * real Supabase data whenever you're ready.
 */
export const mockEpisodes: Episode[] = [
  {
    id: "mock-pandoras-box",
    scriptName: "Pandora's Box",
    airDate: "2026-09-14",
    audioUrl: "/audio/pandoras-box.wav",
    sourceUrl:
      "https://www.afr.com/technology/rivals-altman-and-musk-rally-behind-amodei-s-call-for-an-ai-slowdown-20260913-p60wup",
    headline: "Dogs never rush to release something they can't take back",
    category: "Business",
    photoUrl:
      "https://static.ffx.io/images/$zoom_0.5295%2C$multiply_2%2C$ratio_1.777778%2C$width_1059%2C$x_0%2C$y_24/t_crop_custom/c_scale%2Cw_800%2Cq_88%2Cf_jpg/t_afr_no_label_no_age_social_wm/9d978f6100c755b1f16fd273ae71bf3605e9adaa",
    createdAt: now,
  },
  {
    id: "mock-please-remain-seated",
    scriptName: "Please Remain Seated",
    airDate: "2026-09-14",
    audioUrl: "/audio/please-remain-seated.wav",
    sourceUrl:
      "https://www.nbcnews.com/news/us-news/man-accused-midair-racist-outburst-loses-job-duct-tape-flight-newark-rcna596673",
    headline: "Dogs would never get duct-taped to their seat mid-flight after a racist outburst",
    category: "News",
    photoUrl:
      "https://media-cldnry.s-nbcnews.com/image/upload/t_nbcnews-fp-1200-630,f_auto,q_auto:best/rockcms/2026-09/260908-3x2-Arthur-Lundeen-ew-505p-e06aef.jpg",
    createdAt: now,
  },
  {
    id: "mock-sydney-sweeney-sports",
    scriptName: "Sydney Sweeney Sports",
    airDate: "2026-09-14",
    audioUrl: "/audio/sydney-sweeney-sports.wav",
    sourceUrl: "https://observer.co.uk/news/opinion-and-ideas/article/sydney-sweeneys-nude-sports-ad-is-a-slam-dunk-for-sexism",
    headline: "Dogs never need to undress to sell something",
    category: "Culture",
    photoUrl:
      "https://cdn.slowdownwiseup.co.uk/media/original_images/WEB_Screenshot_2026-09-15_at_11.07.45_ca966b8a7fd2dba7e91e35922d03ae5fd1d0.jpg",
    createdAt: now,
  },
  {
    id: "mock-harrys-back",
    scriptName: "Harry's Back",
    airDate: "2026-09-09",
    audioUrl: "/audio/harrys-back.wav",
    sourceUrl:
      "https://www.nine.com.au/lifestyle/royals/prince-harry-meghan-markle-uk-move-king-charles-clarifies-their-status-20260908-p60v9m.html",
    headline: "Dogs don't need their family status clarified",
    category: "Culture",
    photoUrl:
      "https://static.ffx.io/images/$zoom_0.9806%2C$multiply_2%2C$ratio_1.777778%2C$width_1059%2C$x_0%2C$y_608/t_crop_custom/c_scale%2Cw_1200%2Cq_88%2Cf_auto/663069da5fd24c9b3618af46db110757692c01692b9971b925d114617101d23a",
    createdAt: now,
  },
  {
    id: "mock-neighbours-tiff",
    scriptName: "Neighbours' Tiff",
    airDate: "2026-09-09",
    audioUrl: "/audio/neighbours-tiff.wav",
    sourceUrl: "https://www.theguardian.com/us-news/2026/aug/30/trump-lake-america-ontario",
    headline: "Dogs mark their territory and move on",
    category: "News",
    photoUrl:
      "https://i.guim.co.uk/img/media/e44905997f5cadb38f09f93a87fc8f2f8d371861/74_0_4006_3207/master/4006.jpg?width=1200&height=630&quality=85&auto=format&fit=crop&precrop=40:21,offset-x50,offset-y0&overlay-align=bottom%2Cleft&overlay-width=100p&overlay-base64=L2ltZy9zdGF0aWMvb3ZlcmxheXMvdGctZGVmYXVsdC5wbmc&enable=upscale&s=e1bb57149ee10664aa2e488b3cc09edc",
    createdAt: now,
  },
  {
    id: "mock-the-liar-tells-all",
    scriptName: "The Liar Tells All",
    airDate: "2026-09-09",
    audioUrl: "/audio/the-liar-tells-all.wav",
    sourceUrl: "https://www.abc.net.au/news/2026-09-08/who-is-elizabeth-holmes-of-you-can-see-everything/107127436",
    headline: "Dogs would never fake it this well",
    category: "Culture",
    photoUrl:
      "https://live-production.wcms.abc-cdn.net.au/8b742056fea42dae7faaafece76891d8?impolicy=wcms_watermark_news&cropH=805&cropW=1431&xPos=0&yPos=175&width=862&height=485&imformat=generic",
    createdAt: now,
  },
  {
    id: "mock-stella-sings",
    scriptName: "Stella Sings",
    airDate: "2026-09-07",
    audioUrl: "/audio/stella-sings.wav",
    sourceUrl:
      "https://au.rollingstone.com/music/music-news/stella-lefty-fifth-plagiarism-claim-over-teenage-dirtbag-similarities-100873/",
    headline: "Dogs never copy another dog's bark",
    category: "Arts",
    photoUrl:
      "https://images.thebrag.com/cdn-cgi/image/fit=crop,width=1200,height=628/https://images-r2-1.thebrag.com/rs/uploads/2026/09/teenage-dirtbag-stella-lefty.webp",
    createdAt: now,
  },
];
