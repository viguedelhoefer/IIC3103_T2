import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,

  post,
  requestBody
} from '@loopback/rest';
import {
  Album,
  Track
} from '../models';
import {AlbumRepository} from '../repositories';

export class AlbumTrackController {
  constructor(
    @repository(AlbumRepository) protected albumRepository: AlbumRepository,
  ) { }

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
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Track>,
  ): Promise<Track[]> {
    return this.albumRepository.tracks(id).find(filter);
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
    track.self = `https://stormy-badlands-49969.herokuapp.com/tracks/${track.id}`;
    track.times_played = 0;
    track.album = `https://stormy-badlands-49969.herokuapp.com/albums/${id}`;
    track.artist = `https://stormy-badlands-49969.herokuapp.com/artists/${artist_id[0].artistId}`;
    return this.albumRepository.tracks(id).create(track);
  }

  @del('/albums/{id}/tracks', {
    responses: {
      '200': {
        description: 'Album.Track DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Track)) where?: Where<Track>,
  ): Promise<Count> {
    console.log(id);
    console.log(where);
    const ahhh = await this.albumRepository.tracks(id).find();
    console.log(ahhh);
    return this.albumRepository.tracks(id).delete();
  }
}
