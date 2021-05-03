import {inject} from '@loopback/context';
import {
  Filter,
  FilterExcludingWhere,
  repository
} from '@loopback/repository';
import {
  del, get,
  getModelSchemaRef, param, post,
  put,
  requestBody,
  response,

  Response, RestBindings
} from '@loopback/rest';
import {Artist} from '../models';
import {
  AlbumRepository,
  ArtistRepository,
  TrackRepository
} from '../repositories';

export class ArtistController {
  constructor(
    @repository(ArtistRepository)
    public artistRepository: ArtistRepository,
    @repository(AlbumRepository)
    public albumRepository: AlbumRepository,
    @repository(TrackRepository)
    public trackRepository: TrackRepository,
    @inject(RestBindings.Http.RESPONSE)
    public response: Response,
  ) { }

  @post('/artists')
  @response(201, {
    description: 'Artist model instance',
    content: {'application/json': {schema: getModelSchemaRef(Artist)}},
  })
  async create(
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
    artist.self = `https://stormy-badlands-49969.herokuapp.com/artists/${artist.id}`;
    artist.albums = `https://stormy-badlands-49969.herokuapp.com//artists/${artist.id}/albums`;
    artist.tracks = `https://stormy-badlands-49969.herokuapp.com//artists/${artist.id}/tracks`;
    return this.artistRepository.create(artist);
  }

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
  async find(
    @param.filter(Artist) filter?: Filter<Artist>,
  ): Promise<Artist[]> {
    return this.artistRepository.find(filter);
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
  @response(404, {
    description: 'Not Found',
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Artist, {exclude: 'where'}) filter?: FilterExcludingWhere<Artist>
  ): Promise<Artist> {
    const valido = await this.artistRepository.exists(id);
    valido ? this.response.status(200) : this.response.status(404).send();
    return this.artistRepository.findById(id, filter);
  }

  @put('/artists/{id}/albums/play')
  @response(200, {
    description: 'Artist PUT success',
  })
  @response(404, {
    description: 'Not Found',
  })
  async updateById(
    @param.path.string('id') id: string,
  ): Promise<void> {
    const valido = await this.artistRepository.exists(id);
    if (!valido) {
      this.response.status(404).send();
      return;
    }
    const albums = await this.artistRepository.albums(id).find();
    albums.forEach(async (album) => {
      const tracks = await this.albumRepository.tracks(album.id).find();
      tracks.forEach(async (track) => {
        track.times_played!++;
        await this.trackRepository.updateById(track.id, track);
      })
    })
    return;
  }

  @del('/artists/{id}')
  @response(204, {
    description: 'Artist DELETE success',
  })
  @response(404, {
    description: 'Not Found',
  })
  async delete(
    @param.path.string('id') id: string,
  ): Promise<void> {
    const valido = await this.artistRepository.exists(id);
    if (!valido) {
      this.response.status(404).send();
      return;
    }
    const albums = await this.artistRepository.albums(id).find();
    albums.forEach(async (album) => {
      await this.albumRepository.tracks(album.id).delete()
    });
    await this.artistRepository.albums(id).delete();
    return this.artistRepository.deleteById(id);
  }
}
