import {
  repository
} from '@loopback/repository';
import {
  param,
  put,
  response
} from '@loopback/rest';
import {
  AlbumRepository,
  ArtistRepository,
  TrackRepository
} from '../repositories';

export class PutController {
  constructor(
    @repository(ArtistRepository)
    public artistRepository: ArtistRepository,
    @repository(AlbumRepository)
    public albumRepository: AlbumRepository,
    @repository(TrackRepository)
    public trackRepository: TrackRepository,
  ) { }

  @put('/artists/{id}/albums/play')
  @response(200, {
    description: 'Artist PUT success',
  })
  async updateArtistById(
    @param.path.string('id') id: string,
  ): Promise<void> {
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

  @put('/albums/{id}/tracks/play')
  @response(200, {
    description: 'Album PUT success',
  })
  async updateAlbumById(
    @param.path.string('id') id: string,
  ): Promise<void> {
    const tracks = await this.albumRepository.tracks(id).find();
    tracks.forEach(async (track) => {
      track.times_played!++;
      await this.trackRepository.updateById(track.id, track);
    })
    return;
  }

  @put('/tracks/{id}/play')
  @response(200, {
    description: 'Track PUT success',
  })
  async updateTrackById(
    @param.path.string('id') id: string,
  ): Promise<void> {
    const track = await this.trackRepository.find({where: {id: id}})
    track[0].times_played! ++;
    return this.trackRepository.updateById(id, track[0]);
  }

}
