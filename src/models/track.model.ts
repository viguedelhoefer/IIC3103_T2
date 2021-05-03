import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Album} from './album.model';

@model()
export class Track extends Entity {
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
  })
  duration?: number;

  @property({
    type: 'number',
  })
  times_played?: number;

  @property({
    type: 'string',
  })
  artist?: string;

  @property({
    type: 'string',
  })
  album?: string;

  @property({
    type: 'string',
  })
  self: string;

  @belongsTo(() => Album, {name: 'album_track'})
  albumId: string;

  constructor(data?: Partial<Track>) {
    super(data);
  }
}

export interface TrackRelations {
  // describe navigational properties here
}

export type TrackWithRelations = Track & TrackRelations;
