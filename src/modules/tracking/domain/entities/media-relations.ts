export interface MediaRelationEdge {
  id: number
  relationType: string
}

export interface MediaRelations {
  id: number
  relations: MediaRelationEdge[]
}
