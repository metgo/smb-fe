export interface IMapPoint {
  _id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  updatedBy: Date;
  createdBy: Date;
  deletedBy: Date;
}

export interface IMapPointCategoires {
  id: string;
  name: string;
  mapPointId: [];
}
