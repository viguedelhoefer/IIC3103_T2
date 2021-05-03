import {
  repository
} from '@loopback/repository';
import {
  del,
  param,
  response
} from '@loopback/rest';
import {
  AlbumRepository,
  ArtistRepository,
  TrackRepository
} from '../repositories';

export class DelController {
  constructor(
    @repository(ArtistRepository)
    public artistRepository: ArtistRepository,
    @repository(AlbumRepository)
    public albumRepository: AlbumRepository,
    @repository(TrackRepository)
    public trackRepository: TrackRepository,
  ) { }

  @del('/artists/{id}')
  @response(204, {
    description: 'Artist DELETE success',
  })
  async deleteArtist(
    @param.path.string('id') id: string,
  ): Promise<void> {
    const albums = await this.artistRepository.albums(id).find();
    albums.forEach(async (album) => {
      await this.albumRepository.tracks(album.id).delete()
    });
    await this.artistRepository.albums(id).delete();
    return this.artistRepository.deleteById(id);
  }

  @del('/albums/{id}')
  @response(204, {
    description: 'Album DELETE success',
  })
  async deleteAlbum(
    @param.path.string('id') id: string,
  ): Promise<void> {
    await this.albumRepository.tracks(id).delete();
    return this.albumRepository.deleteById(id);
  }

  @del('/tracks/{id}')
  @response(204, {
    description: 'Track DELETE success',
  })
  async deleteTrack(@param.path.string('id') id: string): Promise<void> {
    await this.trackRepository.deleteById(id);
  }

}
