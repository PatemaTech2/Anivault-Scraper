import { Router, Request, Response } from 'express';
import axios from 'axios';
import https from 'https';
import { malToAnilist, getSiteIds, getSiteIdsByMal, searchAnilist, SiteIds } from './utils/mapper';
import { cacheStats } from './utils/cache';
import { resolveEmbed } from './resolvers/megacloud';

import { getHeavenEpisodes, getHeavenServers, getHeavenStream } from './scrapers/animeheaven';
import { getAnikotoEpisodes, getAnikotoServers, getAnikotoEmbedUrl } from './scrapers/anikoto';
import { getDesidubEpisodes, getDesidubServers, getDesidubStream } from './scrapers/desidub';
import { getAnimeDetails, getEpisodes as getMalEpisodes, getEpisode as getMalEpisode, getAllEpisodes as getAllMalEpisodes, getCharacters, getCharacterDetails, getAnimePictures, getCharacterPicture, getAnimeThemes, getAnimeVideos, getStreamingPlatforms, getRecommendations, getExternalLinks, getAnimeVideos as getAnimeVideos_, getCharacters as getCharacters_, searchAnime, debugSearchHtml, getStreamingEpisodes, AniListStreamingEpisode, getAnimeImages as getAnilistAnimeImages } from './scrapers/mal';
import { getSeasonNow, getTopBanners, getStreamingEpisodes as getAniListStreamingEpisodes, getAnimeImages as getAnilistAnimeImages_ } from './scrapers/anilist';
import { getEpisodeThumbnail as getTmdbEpisodeThumbnail, getEpisodeData as getTmdbEpisodeData, getShowEpisodeCount as getTmdbEpisodeCount, getAnimeImages as getTmdbAnimeImages, extractSeasonHint } from './scrapers/tmdb';
import { getKitsuAnimeId, getEpisodeThumbnail as getKitsuEpisodeThumbnail, getEpisodeData as getKitsuEpisodeData, getAnimeImages as getKitsuAnimeImages } from './scrapers/kitsu';

const router = Router();

const SOURCES = ['animeheaven', 'anikoto', 'desidub'] as const;
type Source = typeof SOURCES[number];

function publicBase(req: Request): string {
  const proto = (req.headers['x-forwarded-proto'] as string | undefined)?.split(',')[0] || req.protocol;
  return `${proto}://${req.get('host')}`;
}

function proxiedHlsUrl(req: Request, url: string, ref?: string): string {
  const refParam = ref ? `&ref=${encodeURIComponent(ref)}` : '';
  return `${publicBase(req)}/api/proxy/hls?url=${encodeURIComponent(url)}${refParam}`;
}

function proxiedVideoUrl(req: Request, url: string, ref?: string): string {
  const refParam = ref ? `&ref=${encodeURIComponent(ref)}` : '';
  return `${publicBase(req)}/api/proxy/video?url=${encodeURIComponent(url)}${refParam}`;
}

function proxiedSubtitleUrl(req: Request, url: string, ref?: string): string {
  const refParam = ref ? `&ref=${encodeURIComponent(ref)}` : '';
  return `${publicBase(req)}/api/proxy/subtitle?url=${encodeURIComponent(url)}${refParam}`;
}
