import {belongsTo, Entity, hasMany, model, property} from '@loopback/repository';
import {Artist} from './artist.model';
import {Track} from './track.model';

@model()
export class Album extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  genre: string;

  @property({
    type: 'string',
  })
  artist: string;

  @property({
    type: 'string',
  })
  tracks: string;

  @property({
    type: 'string',
  })
  self: string;

  @belongsTo(() => Artist, {name: 'artist_album'})
  artistId: string;

  @hasMany(() => Track)
  tracksList: Track[];
  [prop: string]: any;

  constructor(data?: Partial<Album>) {
    super(data);
  }
}

export interface AlbumRelations {
  // describe navigational properties here
}

export type AlbumWithRelations = Album & AlbumRelations;
