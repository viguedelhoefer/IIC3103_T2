import {
  repository
} from '@loopback/repository';
import {
  getModelSchemaRef, param, post,
  requestBody,
  response
} from '@loopback/rest';
import {Album, Artist, Track} from '../models';
import {
  AlbumRepository,
  ArtistRepository,
  TrackRepository
} from '../repositories';

export class PostController {
  constructor(
    @repository(ArtistRepository)
    public artistRepository: ArtistRepository,
    @repository(AlbumRepository)
    public albumRepository: AlbumRepository,
    @repository(TrackRepository)
    public trackRepository: TrackRepository,
  ) { }

  @post('/artists')
  @response(201, {
    description: 'Artist model instance',
    content: {'application/json': {schema: getModelSchemaRef(Artist)}},
  })
  async create_artist(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Artist, {
            title: 'NewArtist',
            exclude: ['id', 'tracks', 'self', 'albums'],
          }),
        },
      },
    })
    artist: Omit<Artist, 'id'>,
  ): Promise<Artist> {
    artist.id = Buffer.from(artist.name).toString('base64').slice(0, 22);
    artist.self = `/artists/${artist.id}`;
    artist.albums = `/artists/${artist.id}/albums`;
    artist.tracks = `/artists/${artist.id}/tracks`;
    return this.artistRepository.create(artist);
  }

  @post('/artists/{id}/albums', {
    responses: {
      '201': {
        description: 'Artist model instance',
        content: {'application/json': {schema: getModelSchemaRef(Album)}},
      },
    },
  })
  async create_album(
    @param.path.string('id') id: typeof Artist.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Album, {
            title: 'NewAlbumInArtist',
            exclude: ['id', 'artistId', 'self', 'artist', 'tracks']
          }),
        },
      },
    }) album: Album
  ): Promise<Album> {
    const artist_id = await this.artistRepository.find({
      where: {id: id},
    });
    album.id = Buffer.from(album.name + ":" + album.artistId).toString('base64').slice(0, 22);
    album.self = `/albums/${album.id}`;
    album.artist = `/artists/${id}`;
    album.tracks = `/albums/${album.id}/tracks`;
    return this.artistRepository.albums(id).create(album);
  }

  @post('/albums/{id}/tracks', {
    responses: {
      '201': {
        description: 'Album model instance',
        content: {'application/json': {schema: getModelSchemaRef(Track)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Album.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Track, {
            title: 'NewTrackInAlbum',
            exclude: ['id', 'albumId', 'self', 'album', 'artist',
              'times_played'],
          }),
        },
      },
    }) track: Track
  ): Promise<Track> {
    const artist_id = await this.albumRepository.find({
      where: {id: id},
    });
    track.id = Buffer.from(track.name + ":" + artist_id[0].id).toString('base64').slice(0, 22);
    track.self = `/tracks/${track.id}`;
    track.times_played = 0;
    track.album = `/albums/${id}`;
    track.artist = `/artists/${artist_id[0].artistId}`;
    return this.albumRepository.tracks(id).create(track);
  }

}
