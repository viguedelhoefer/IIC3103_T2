import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, HasManyRepositoryFactory, repository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Album, Artist, ArtistRelations} from '../models';
import {AlbumRepository} from './album.repository';

export class ArtistRepository extends DefaultCrudRepository<
  Artist,
  typeof Artist.prototype.id,
  ArtistRelations
  > {

  public readonly albums: HasManyRepositoryFactory<Album, typeof Artist.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('AlbumRepository') protected albumRepositoryGetter: Getter<AlbumRepository>,
  ) {
    super(Artist, dataSource);
    this.albums = this.createHasManyRepositoryFactoryFor('albumsList', albumRepositoryGetter,);
    this.registerInclusionResolver('albumsList', this.albums.inclusionResolver);
  }
}
