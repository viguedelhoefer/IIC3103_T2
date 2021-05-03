import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, DefaultCrudRepository, repository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Album, Track, TrackRelations} from '../models';
import {AlbumRepository} from './album.repository';

export class TrackRepository extends DefaultCrudRepository<
  Track,
  typeof Track.prototype.id,
  TrackRelations
  > {

  public readonly album: BelongsToAccessor<Album, typeof Track.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('AlbumRepository') protected albumRepositoryGetter: Getter<AlbumRepository>,
  ) {
    super(Track, dataSource);
    this.album = this.createBelongsToAccessorFor('album_track', albumRepositoryGetter,);
    this.registerInclusionResolver('album_track', this.album.inclusionResolver);
  }
}
