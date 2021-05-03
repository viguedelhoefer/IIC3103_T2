import {
  Filter,
  FilterExcludingWhere,
  repository
} from '@loopback/repository';
import {
  get,
  getModelSchemaRef, param,
  response
} from '@loopback/rest';
import {Album, Artist, Track} from '../models';
import {
  AlbumRepository,
  ArtistRepository,
  TrackRepository
} from '../repositories';

export class GetController {
  constructor(
    @repository(ArtistRepository)
    public artistRepository: ArtistRepository,
    @repository(AlbumRepository)
    public albumRepository: AlbumRepository,
    @repository(TrackRepository)
    public trackRepository: TrackRepository,
  ) { }

  @get('/artists')
  @response(200, {
    description: 'Array of Artist model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Artist, {includeRelations: true}),
        },
      },
    },
  })
  async find_artists(
    @param.filter(Artist) filter?: Filter<Artist>,
  ): Promise<Artist[]> {
    return this.artistRepository.find(filter);
  }

  @get('/albums')
  @response(200, {
    description: 'Array of Album model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Album, {includeRelations: true}),
        },
      },
    },
  })
  async find_albums(
    @param.filter(Album) filter?: Filter<Album>,
  ): Promise<Album[]> {
    return this.albumRepository.find(filter);
  }

  @get('/tracks')
  @response(200, {
    description: 'Array of Track model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Track, {includeRelations: true}),
        },
      },
    },
  })
  async find_tracks(
    @param.filter(Track) filter?: Filter<Track>,
  ): Promise<Track[]> {
    return this.trackRepository.find(filter);
  }

  @get('/artists/{id}')
  @response(200, {
    description: 'Artist model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Artist, {includeRelations: true}),
      },
    },
  })
  async findArtistById(
    @param.path.string('id') id: string,
    @param.filter(Artist, {exclude: 'where'}) filter?: FilterExcludingWhere<Artist>
  ): Promise<Artist> {
    return this.artistRepository.findById(id, filter);
  }

  @get('/artists/{id}/albums', {
    responses: {
      '200': {
        description: 'Array of Artist has many Album',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Album)},
          },
        },
      },
    },
  })
  async findAlbums(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Album>,
  ): Promise<Album[]> {
    return this.artistRepository.albums(id).find(filter);
  }

  @get('/artists/{id}/tracks', {
    responses: {
      '200': {
        description: 'Array of Artist has many Tracks',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Album)},
          },
        },
      },
    },
  })
  async findTracks(
    @param.path.string('id') id: string,
  ): Promise<Track[][]> {
    const albums = await this.artistRepository.albums(id).find();
    return Promise.all(albums.map(async (album) => {
      var track = await this.albumRepository.tracks(album.id).find();
      return track;
    }));
  }

  @get('/albums/{id}')
  @response(200, {
    description: 'Album model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Album, {includeRelations: true}),
      },
    },
  })
  async findAlbumById(
    @param.path.string('id') id: string,
    @param.filter(Album, {exclude: 'where'}) filter?: FilterExcludingWhere<Album>
  ): Promise<Album> {
    return this.albumRepository.findById(id, filter);
  }

  @get('/albums/{id}/tracks', {
    responses: {
      '200': {
        description: 'Array of Album has many Track',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Track)},
          },
        },
      },
    },
  })
  async findTracks_(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Track>,
  ): Promise<Track[]> {
    return this.albumRepository.tracks(id).find(filter);
  }

  @get('/tracks/{id}')
  @response(200, {
    description: 'Track model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Track, {includeRelations: true}),
      },
    },
  })
  async findTrackById(
    @param.path.string('id') id: string,
    @param.filter(Track, {exclude: 'where'}) filter?: FilterExcludingWhere<Track>
  ): Promise<Track> {
    return this.trackRepository.findById(id, filter);
  }

}
