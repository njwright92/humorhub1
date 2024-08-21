import React, { ReactNode } from "react";
import { CityProvider } from "./components/cityContext";
import { EventProvider } from "./components/eventContext";
import { HeadlineProvider } from "./components/headlinecontext";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata = {
  title: "Humor Hub",
  description: "The goto platform for anything comedy.",
  keywords:
    "comedy, funny, jokes, humor, ComicBot, JokePad, LLM, large language model, uncensored comedy, unfiltered comedy, mic finder, open mic, comedy news, humor hub, stand-up comedy, stand-up comedian, comedy club, open mic night, comedy events, comedy show, comedy performance, comedy routine, comedy sketches, comedy writing, comedy tips, joke writing, joke sharing, joke platform, humor app, comedy app, comedy platform, live comedy, comedy streaming, comedy videos, comedy podcasts, comedy blog, comedy articles, comedy resources, comedy network, comedian tools, comedy toolkit, comedy support, comedy community, comedy forum, comedy feedback, comedy insights, comedy analysis, comedy reviews, comedy recommendations, comedy updates, comedy trends, trending comedy, comedy scene, comedy culture, comedy industry, comedy talent, comedy development, new comedians, rising comedians, comedy gigs, comedy acts, comedy open mics, comedy nights, local comedy, regional comedy, international comedy, global comedy, comedy festivals, comedy competitions, comedy venues, comedy locations, comedy maps, comedy schedules, comedy calendars, comedy bookings, comedy promotions, comedy marketing, comedy advertising, comedy tips, comedy techniques, comedy strategies, successful comedians, popular comedians, famous comedians, legendary comedians, comedy legends, iconic comedians, comedy history, comedy trivia, comedy facts, comedy education, learning comedy, comedy workshops, comedy classes, comedy courses, comedy tutorials, comedy coaching, comedy mentoring, comedy advice, comedy tips and tricks, joke ideas, joke inspiration, comedy inspiration, comedy motivation, stand-up tips, stand-up routines, stand-up inspiration, stand-up comedy tips, stand-up comedy techniques, improv comedy, sketch comedy, dark comedy, satire, parody, observational comedy, surreal comedy, alternative comedy, blue comedy, deadpan comedy, improv classes, sketch writing, sketch performances, comedy festivals, comedy awards, comedy specials, Netflix comedy, YouTube comedy, TikTok comedy, Instagram comedy, social media comedy, viral comedy, comedy influencers, comedy creators, comedy content creators, comedy trends 2024, best comedy jokes, best stand-up acts, comedy albums, comedy records, comedy CDs, comedy DVDs, comedy specials, online comedy, virtual comedy, comedy livestreams, interactive comedy, comedy engagement, comedy audience, comedy participation, comedy interaction, comedy feedback, comedy critique, comedy ratings, comedy reviews, comedy analysis, comedy breakdowns, comedy articles, comedy blogs, comedy vlogs, comedy influencers, comedy personalities, comedy stars, upcoming comedians, comedy stars of tomorrow, next big comedians, comedy success, achieving comedy success, comedy career, comedy profession, professional comedy, comedy gigs, comedy bookings, comedy schedules, comedy diary, comedy planning, comedy preparation, comedy scriptwriting, comedy screenwriting, comedy film, comedy TV, comedy series, comedy sitcoms, comedy pilots, comedy development, comedy pitching, comedy projects, comedy collaborations, comedy partnerships, comedy networking, comedy contacts, comedy connections, comedy industry news, comedy world news, comedy business, comedy opportunities, comedy careers, breaking into comedy, making it in comedy, comedy stories, comedy anecdotes, funny stories, hilarious stories, joke stories, funny experiences, humor stories, funny moments, comedy sketches, comedy performances, stand-up specials, Netflix comedy specials, HBO comedy specials, Amazon comedy specials, Hulu comedy specials, streaming comedy, online comedy shows, virtual comedy events, comedy festivals 2024, comedy awards 2024, top comedians 2024, comedy events 2024, best comedians 2024, rising comedians 2024, future of comedy, next-gen comedy, comedy technology, comedy innovations, AI comedy, robot comedians, comedy and AI, future of humor, comedy predictions, comedy forecasts, comedy analytics, comedy metrics, comedy data, humor analysis, joke analytics, joke metrics, joke data, comedy trends, humor trends, joke trends, comedy popularity, humor popularity, joke popularity, comedy engagement, humor engagement, joke engagement, comedy research, humor research, joke research, comedy studies, humor studies, joke studies, comedy science, humor science, joke science, comedy psychology, humor psychology, joke psychology, comedy sociology, humor sociology, joke sociology, comedy theory, humor theory, joke theory, comedy philosophy, humor philosophy, joke philosophy, comedy culture, humor culture, joke culture, comedy subcultures, humor subcultures, joke subcultures, comedy movements, humor movements, joke movements, comedy genres, humor genres, joke genres, comedy types, humor types, joke types, types of comedy, types of humor, types of jokes, comedy formats, humor formats, joke formats, comedy styles, humor styles, joke styles, styles of comedy, styles of humor, styles of jokes, comedy approaches, humor approaches, joke approaches, approaches to comedy, approaches to humor, approaches to jokes, comedy perspectives, humor perspectives, joke perspectives, perspectives on comedy, perspectives on humor, perspectives on jokes, comedy attitudes, humor attitudes, joke attitudes, attitudes towards comedy, attitudes towards humor, attitudes towards jokes, comedy beliefs, humor beliefs, joke beliefs, beliefs about comedy, beliefs about humor, beliefs about jokes, comedy practices, humor practices, joke practices, practices in comedy, practices in humor, practices in jokes, comedy customs, humor customs, joke customs, customs in comedy, customs in humor, customs in jokes, comedy traditions, humor traditions, joke traditions, traditions in comedy, traditions in humor, traditions in jokes, comedy heritage, humor heritage, joke heritage, heritage of comedy, heritage of humor, heritage of jokes, comedy legacy, humor legacy, joke legacy, legacy of comedy, legacy of humor, legacy of jokes, comedy evolution, humor evolution, joke evolution, evolution of comedy, evolution of humor, evolution of jokes, comedy history, humor history, joke history, history of comedy, history of humor, history of jokes, comedy origins, humor origins, joke origins, origins of comedy, origins of humor, origins of jokes, comedy beginnings, humor beginnings, joke beginnings, beginnings of comedy, beginnings of humor, beginnings of jokes, comedy roots, humor roots, joke roots, roots of comedy, roots of humor, roots of jokes, comedy development, humor development, joke development, development of comedy, development of humor, development of jokes, comedy progress, humor progress, joke progress, progress in comedy, progress in humor, progress in jokes, comedy advancement, humor advancement, joke advancement, advancements in comedy, advancements in humor, advancements in jokes, comedy innovations, humor innovations, joke innovations, innovations in comedy, innovations in humor, innovations in jokes, comedy breakthroughs, humor breakthroughs, joke breakthroughs, breakthroughs in comedy, breakthroughs in humor, breakthroughs in jokes, comedy achievements, humor achievements, joke achievements, achievements in comedy, achievements in humor, achievements in jokes, comedy milestones, humor milestones, joke milestones, milestones in comedy, milestones in humor, milestones in jokes, comedy records, humor records, joke records, records in comedy, records in humor, records in jokes, comedy firsts, humor firsts, joke firsts, firsts in comedy, firsts in humor, firsts in jokes, comedy pioneers, humor pioneers, joke pioneers, pioneers in comedy, pioneers in humor, pioneers in jokes, comedy leaders, humor leaders, joke leaders, leaders in comedy, leaders in humor, leaders in jokes, comedy figures, humor figures, joke figures, figures in comedy, figures in humor, figures in jokes, comedy icons, humor icons, joke icons, icons in comedy, icons in humor, icons in jokes, comedy legends, humor legends, joke legends, legends in comedy, legends in humor, legends in jokes, comedy heroes, humor heroes, joke heroes, heroes in comedy, heroes in humor, heroes in jokes, comedy stars, humor stars, joke stars, stars in comedy, stars in humor, stars in jokes, comedy celebrities, humor celebrities, joke celebrities, celebrities in comedy, celebrities in humor, celebrities in jokes, comedy fame, humor fame, joke fame, fame in comedy, fame in humor, fame in jokes, comedy success, humor success, joke success, success in comedy, success in humor, success in jokes, comedy achievement, humor achievement, joke achievement, achievement in comedy, achievement in humor, achievement in jokes, comedy recognition, humor recognition, joke recognition, recognition in comedy, recognition in humor, recognition in jokes, comedy acclaim, humor acclaim, joke acclaim, acclaim in comedy, acclaim in humor, acclaim in jokes, comedy prestige, humor prestige, joke prestige, prestige in comedy, prestige in humor, prestige in jokes, comedy reputation, humor reputation, joke reputation, reputation in comedy, reputation in humor, reputation in jokes, comedy renown, humor renown, joke renown, renown in comedy, renown in humor, renown in jokes, comedy distinction, humor distinction, joke distinction, distinction in comedy, distinction in humor, distinction in jokes, comedy excellence, humor excellence, joke excellence, excellence in comedy, excellence in humor, excellence in jokes, comedy merit, humor merit, joke merit, merit in comedy, merit in humor, merit in jokes, comedy value, humor value, joke value, value in comedy, value in humor, value in jokes, comedy worth, humor worth, joke worth, worth in comedy, worth in humor, worth in jokes, comedy importance, humor importance, joke importance, importance in comedy, importance in humor, importance in jokes, comedy significance, humor significance, joke significance, significance in comedy, significance in humor, significance in jokes, comedy impact, humor impact, joke impact, impact in comedy, impact in humor, impact in jokes, comedy influence, humor influence, joke influence, influence in comedy, influence in humor, influence in jokes, comedy power, humor power, joke power, power in comedy, power in humor, power in jokes, comedy strength, humor strength, joke strength, strength in comedy, strength in humor, strength in jokes, comedy might, humor might, joke might, might in comedy, might in humor, might in jokes, comedy force, humor force, joke force, force in comedy, force in humor, force in jokes, comedy energy, humor energy, joke energy, energy in comedy, energy in humor, energy in jokes, comedy dynamism, humor dynamism, joke dynamism, dynamism in comedy, dynamism in humor, dynamism in jokes, comedy vitality, humor vitality, joke vitality, vitality in comedy, vitality in humor, vitality in jokes, comedy vibrancy, humor vibrancy, joke vibrancy, vibrancy in comedy, vibrancy in humor, vibrancy in jokes, comedy liveliness, humor liveliness, joke liveliness, liveliness in comedy, liveliness in humor, liveliness in jokes, comedy spirit, humor spirit, joke spirit, spirit in comedy, spirit in humor, spirit in jokes, comedy zest, humor zest, joke zest, zest in comedy, zest in humor, zest in jokes, comedy animation, humor animation, joke animation, animation in comedy, animation in humor, animation in jokes, comedy brilliance, humor brilliance, joke brilliance, brilliance in comedy, brilliance in humor, brilliance in jokes, comedy brightness, humor brightness, joke brightness, brightness in comedy, brightness in humor, brightness in jokes, comedy sparkle, humor sparkle, joke sparkle, sparkle in comedy, sparkle in humor, sparkle in jokes, comedy radiance, humor radiance, joke radiance, radiance in comedy, radiance in humor, radiance in jokes, comedy glow, humor glow, joke glow, glow in comedy, glow in humor, glow in jokes, comedy shine, humor shine, joke shine, shine in comedy, shine in humor, shine in jokes, comedy luster, humor luster, joke luster, luster in comedy, luster in humor, luster in jokes, comedy gloss, humor gloss, joke gloss, gloss in comedy, gloss in humor, gloss in jokes, comedy polish, humor polish, joke polish, polish in comedy, polish in humor, polish in jokes, comedy sheen, humor sheen, joke sheen, sheen in comedy, sheen in humor, sheen in jokes, comedy gleam, humor gleam, joke gleam, gleam in comedy, gleam in humor, gleam in jokes, comedy glitter, humor glitter, joke glitter, glitter in comedy, glitter in humor, glitter in jokes, comedy twinkle, humor twinkle, joke twinkle, twinkle in comedy, twinkle in humor, twinkle in jokes, comedy glimmer, humor glimmer, joke glimmer, glimmer in comedy, glimmer in humor, glimmer in jokes, comedy shimmer, humor shimmer, joke shimmer, shimmer in comedy, shimmer in humor, shimmer in jokes, comedy flash, humor flash, joke flash, flash in comedy, flash in humor, flash in jokes, comedy flair, humor flair, joke flair, flair in comedy, flair in humor, flair in jokes, comedy dazzle, humor dazzle, joke dazzle, dazzle in comedy, dazzle in humor, dazzle in jokes, comedy radiate, humor radiate, joke radiate, radiate in comedy, radiate in humor, radiate in jokes, comedy illuminate, humor illuminate, joke illuminate, illuminate in comedy, illuminate in humor, illuminate in jokes, comedy beam, humor beam, joke beam, beam in comedy, beam in humor, beam in jokes, comedy shine, humor shine, joke shine, shine in comedy, shine in humor, shine in jokes, comedy light, humor light, joke light, light in comedy, light in humor, light in jokes, comedy luminescence, humor luminescence, joke luminescence, luminescence in comedy, luminescence in humor, luminescence in jokes, comedy iridescence, humor iridescence, joke iridescence, iridescence in comedy, iridescence in humor, iridescence in jokes, comedy glow, humor glow, joke glow, glow in comedy, glow in humor, glow in jokes, comedy brilliance, humor brilliance, joke brilliance, brilliance in comedy, brilliance in humor, brilliance in jokes, comedy brightness, humor brightness, joke brightness, brightness in comedy, brightness in humor, brightness in jokes, comedy sparkle, humor sparkle, joke sparkle, sparkle in comedy, sparkle in humor, sparkle in jokes, comedy glitter, humor glitter, joke glitter, glitter in comedy, glitter in humor, glitter in jokes, comedy twinkle, humor twinkle, joke twinkle, twinkle in comedy, twinkle in humor, twinkle in jokes, comedy gleam, humor gleam, joke gleam, gleam in comedy, gleam in humor, gleam in jokes, comedy glimmer, humor glimmer, joke glimmer, glimmer in comedy, glimmer in humor, glimmer in jokes, comedy shimmer, humor shimmer, joke shimmer, shimmer in comedy, shimmer in humor, shimmer in jokes, comedy flash, humor flash, joke flash, flash in comedy, flash in humor, flash in jokes, comedy flair, humor flair, joke flair, flair in comedy, flair in humor, flair in jokes, comedy dazzle, humor dazzle, joke dazzle, dazzle in comedy, dazzle in humor, dazzle in jokes, comedy radiate, humor radiate, joke radiate, radiate in comedy, radiate in humor, radiate in jokes, comedy illuminate, humor illuminate, joke illuminate, illuminate in comedy, illuminate in humor, illuminate in jokes, comedy beam, humor beam, joke beam, beam in comedy, beam in humor, beam in jokes, comedy light, humor light, joke light, light in comedy, light in humor, light in jokes, comedy luminescence, humor luminescence, joke luminescence, luminescence in comedy, luminescence in humor, luminescence in jokes, comedy iridescence, humor iridescence, joke iridescence, iridescence in comedy, iridescence in humor, iridescence in jokes, comedy glow, humor glow, joke glow, glow in comedy, glow in humor, glow in jokes, comedy brilliance, humor brilliance, joke brilliance, brilliance in comedy, brilliance in humor, brilliance in jokes, comedy brightness, humor brightness, joke brightness, brightness in comedy, brightness in humor, brightness in jokes, comedy sparkle, humor sparkle, joke sparkle, sparkle in comedy, sparkle in humor, sparkle in jokes, comedy glitter, humor glitter, joke glitter, glitter in comedy, glitter in humor, glitter in jokes, comedy twinkle, humor twinkle, joke twinkle, twinkle in comedy, twinkle in humor, twinkle in jokes, comedy gleam, humor gleam, joke gleam, gleam in comedy, gleam in humor, gleam in jokes, comedy glimmer, humor glimmer, joke glimmer, glimmer in comedy, glimmer in humor, glimmer in jokes, comedy shimmer, humor shimmer, joke shimmer, shimmer in comedy, shimmer in humor, shimmer in jokes, comedy flash, humor flash, joke flash, flash in comedy, flash in humor, flash in jokes, comedy flair, humor flair, joke flair, flair in comedy, flair in humor, flair in jokes, comedy dazzle, humor dazzle, joke dazzle, dazzle in comedy, dazzle in humor, dazzle in jokes, comedy radiate, humor radiate, joke radiate, radiate in comedy, radiate in humor, radiate in jokes, comedy illuminate, humor illuminate, joke illuminate, illuminate in comedy, illuminate in humor, illuminate in jokes, comedy beam, humor beam, joke beam, beam in comedy, beam in humor, beam in jokes, comedy light, humor light, joke light, light in comedy, light in humor, light in jokes, comedy luminescence, humor luminescence, joke luminescence, luminescence in comedy, luminescence in humor, luminescence in jokes, comedy iridescence, humor iridescence, joke iridescence, iridescence in comedy, iridescence in humor, iridescence in jokes, comedy glow, humor glow, joke glow, glow in comedy, glow in humor, glow in jokes, comedy brilliance, humor brilliance, joke brilliance, brilliance in comedy, brilliance in humor, brilliance in jokes, comedy brightness, humor brightness, joke brightness, brightness in comedy, brightness in humor, brightness in jokes, comedy sparkle, humor sparkle, joke sparkle, sparkle in comedy, sparkle in humor, sparkle in jokes, comedy glitter, humor glitter, joke glitter, glitter in comedy, glitter in humor, glitter in jokes, comedy twinkle, humor twinkle, joke twinkle, twinkle in comedy, twinkle in humor, twinkle in jokes, comedy gleam, humor gleam, joke gleam, gleam in comedy, gleam in humor, gleam in jokes, comedy glimmer, humor glimmer, joke glimmer, glimmer in comedy, glimmer in humor, glimmer in jokes, comedy shimmer, humor shimmer, joke shimmer, shimmer in comedy, shimmer in humor, shimmer in jokes, comedy flash, humor flash, joke flash, flash in comedy, flash in humor, flash in jokes, comedy flair, humor flair, joke flair, flair in comedy, flair in humor, flair in jokes, comedy dazzle, humor dazzle, joke dazzle, dazzle in comedy, dazzle in humor, dazzle in jokes, comedy radiate, humor radiate, joke radiate, radiate in comedy, radiate in humor, radiate in jokes, comedy",
};

export const viewport = "width=device-width, initial-scale=1.0";

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <>
      <link
        rel="icon"
        href="/icon.png"
        type="image/png"
        sizes="any"
        className="rounded-full"
      />
      <html lang="en">
        <Analytics />
        <SpeedInsights />
        <CityProvider>
          <EventProvider>
            <HeadlineProvider>
              <body>{children}</body>
              <GoogleAnalytics
                gaId={process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!}
              />
            </HeadlineProvider>
          </EventProvider>
        </CityProvider>
      </html>
    </>
  );
};

export default RootLayout;
