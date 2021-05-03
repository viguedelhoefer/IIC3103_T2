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
import {Track} from '../models';
import {TrackRepository} from '../repositories';

export class TrackController {
  constructor(
    @repository(TrackRepository)
    public trackRepository: TrackRepository,
    @inject(RestBindings.Http.RESPONSE)
    public response: Response,
  ) { }

  @post('/tracks')
  @response(200, {
    description: 'Track model instance',
    content: {'application/json': {schema: getModelSchemaRef(Track)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Track, {
            title: 'NewTrack',
            exclude: ['id'],
          }),
        },
      },
    })
    track: Omit<Track, 'id'>,
  ): Promise<Track> {
    return this.trackRepository.create(track);
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
  async find(
    @param.filter(Track) filter?: Filter<Track>,
  ): Promise<Track[]> {
    return this.trackRepository.find(filter);
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
  @response(404, {
    description: 'Not Found',
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Track, {exclude: 'where'}) filter?: FilterExcludingWhere<Track>
  ): Promise<Track> {
    const valido = await this.trackRepository.exists(id);
    valido ? this.response.status(200) : this.response.status(404).send();
    return this.trackRepository.findById(id, filter);
  }

  @put('/tracks/{id}/play')
  @response(200, {
    description: 'Track PUT success',
  })
  @response(404, {
    description: 'Not Found',
  })
  async updateById(
    @param.path.string('id') id: string,
  ): Promise<void> {
    const valido = await this.trackRepository.exists(id);
    if (!valido) {
      this.response.status(404).send();
      return;
    }
    const track = await this.trackRepository.find({where: {id: id}})
    track[0].times_played! ++;
    return this.trackRepository.updateById(id, track[0]);
  }

  @del('/tracks/{id}')
  @response(204, {
    description: 'Track DELETE success',
  })
  @response(404, {
    description: 'Not Found',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    const valido = await this.trackRepository.exists(id);
    if (!valido) {
      this.response.status(404).send();
      return;
    }
    await this.trackRepository.deleteById(id);
  }
}
