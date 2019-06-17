export interface IResolveIncident {
  skipCustomListeners: boolean;
  skipIoMappings: boolean;
  instructions: IInstruction[];
}

export interface IInstruction {
  type: string;
  activityId: string;
  [custom: string]: any;
}
