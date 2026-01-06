import { IsUUID } from 'class-validator';

export class SwitchWorkspaceDto {
  @IsUUID()
  workspaceId: string;
}
