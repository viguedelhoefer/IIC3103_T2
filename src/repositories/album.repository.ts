import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, DefaultCrudRepository, HasManyRepositoryFactory, repository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Album, AlbumRelations, Artist, Track} from '../models';
import {ArtistRepository} from './artist.repository';
import {TrackRepository} from './track.repository';

export class AlbumRepository extends DefaultCrudRepository<
  Album,
  typeof Album.prototype.id,
  AlbumRelations
  > {

  public readonly artist: BelongsToAccessor<Artist, typeof Album.prototype.id>;

  public readonly tracks: HasManyRepositoryFactory<Track, typeof Album.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('ArtistRepository') protected artistRepositoryGetter: Getter<ArtistRepository>, @repository.getter('TrackRepository') protected trackRepositoryGetter: Getter<TrackRepository>,
  ) {
    super(Album, dataSource);
    this.tracks = this.createHasManyRepositoryFactoryFor('tracksList', trackRepositoryGetter,);
    this.registerInclusionResolver('tracksList', this.tracks.inclusionResolver);
    this.artist = this.createBelongsToAccessorFor('artist_album', artistRepositoryGetter,);
    this.registerInclusionResolver('artist_album', this.artist.inclusionResolver);
  }
}
