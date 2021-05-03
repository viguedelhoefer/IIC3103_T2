import {Entity, hasMany, model, property} from '@loopback/repository';
import {Album} from './album.model';

@model()
export class Artist extends Entity {
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
    type: 'number',
    required: true,
  })
  age: number;

  @property({
    type: 'string',
  })
  albums?: string;

  @property({
    type: 'string',
  })
  tracks?: string;

  @property({
    type: 'string',
  })
  self: string;

  @hasMany(() => Album)
  albumsList: Album[];
  [prop: string]: any;

  constructor(data?: Partial<Artist>) {
    super(data);
  }
}

export interface ArtistRelations {
  // describe navigational properties here
}

export type ArtistWithRelations = Artist & ArtistRelations;
