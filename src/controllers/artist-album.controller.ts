import {inject} from '@loopback/context';
import {
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
  requestBody,

  Response, RestBindings
} from '@loopback/rest';
import {
  Album, Artist, Track
} from '../models';
import {AlbumRepository, ArtistRepository} from '../repositories';

export class ArtistAlbumController {
  constructor(
    @repository(ArtistRepository) protected artistRepository: ArtistRepository,
    @repository(AlbumRepository) protected albumRepository: AlbumRepository,
    @inject(RestBindings.Http.RESPONSE) public response: Response,
  ) { }

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
      '400': {
        description: 'Not Found',
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Album>,
  ): Promise<Album[]> {
    const valido = await this.albumRepository.exists(id);
    valido ? this.response.status(200) : this.response.status(404).send();
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
      '400': {
        description: 'Not Found',
      },
    },
  })
  async find_(
    @param.path.string('id') id: string,
  ): Promise<Track[][]> {
    const valido = await this.albumRepository.exists(id);
    valido ? this.response.status(200) : this.response.status(404).send();
    const albums = await this.artistRepository.albums(id).find();
    return Promise.all(albums.map(async (album) => {
      var track = await this.albumRepository.tracks(album.id).find();
      return track;
    }));
  }

  @post('/artists/{id}/albums', {
    responses: {
      '201': {
        description: 'Artist model instance',
        content: {'application/json': {schema: getModelSchemaRef(Album)}},
      },
    },
  })
  async create(
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
    album.self = `https://stormy-badlands-49969.herokuapp.com/albums/${album.id}`;
    album.artist = `https://stormy-badlands-49969.herokuapp.com/artists/${id}`;
    album.tracks = `https://stormy-badlands-49969.herokuapp.com/albums/${album.id}/tracks`;
    return this.artistRepository.albums(id).create(album);
  }

  @del('/artists/{id}/albums', {
    responses: {
      '200': {
        description: 'Artist.Album DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Album)) where?: Where<Album>,
  ): Promise<void> {
    const albums = await this.artistRepository.albums(id).find();
    albums.forEach(async (album) => {
      await this.albumRepository.tracks(album.id).delete()
    });
    await this.artistRepository.albums(id).delete();
    return this.artistRepository.deleteById(id);
  }
}
