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
import {Album} from '../models';
import {AlbumRepository, TrackRepository} from '../repositories';

export class AlbumController {
  constructor(
    @repository(AlbumRepository)
    public albumRepository: AlbumRepository,
    @repository(TrackRepository)
    public trackRepository: TrackRepository,
    @inject(RestBindings.Http.RESPONSE)
    public response: Response,
  ) { }

  @post('/albums')
  @response(200, {
    description: 'Album model instance',
    content: {'application/json': {schema: getModelSchemaRef(Album)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Album, {
            title: 'NewAlbum',
            exclude: ['id'],
          }),
        },
      },
    })
    album: Omit<Album, 'id'>,
  ): Promise<Album> {
    return this.albumRepository.create(album);
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
  async find(
    @param.filter(Album) filter?: Filter<Album>,
  ): Promise<Album[]> {
    return this.albumRepository.find(filter);
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
  @response(404, {
    description: 'Not Found',
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Album, {exclude: 'where'}) filter?: FilterExcludingWhere<Album>
  ): Promise<Album> {
    const valido = await this.albumRepository.exists(id);
    valido ? this.response.status(200) : this.response.status(404).send();
    return this.albumRepository.findById(id, filter);
  }

  @put('/albums/{id}/tracks/play')
  @response(200, {
    description: 'Album PUT success',
  })
  @response(404, {
    description: 'Not Found',
  })
  async updateById(
    @param.path.string('id') id: string,
  ): Promise<void> {
    const valido = await this.albumRepository.exists(id);
    if (!valido) {
      this.response.status(404).send();
      return;
    }
    const tracks = await this.albumRepository.tracks(id).find();
    tracks.forEach(async (track) => {
      track.times_played!++;
      await this.trackRepository.updateById(track.id, track);
    })
    return;
  }

  @del('/albums/{id}')
  @response(204, {
    description: 'Album DELETE success',
  })
  @response(404, {
    description: 'Not Found',
  })
  async delete(
    @param.path.string('id') id: string,
  ): Promise<void> {
    const valido = await this.albumRepository.exists(id);
    if (!valido) {
      this.response.status(404).send();
      return;
    }
    await this.albumRepository.tracks(id).delete();
    return this.albumRepository.deleteById(id);
  }
}
