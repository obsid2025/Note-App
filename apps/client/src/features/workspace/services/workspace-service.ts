import api from "@/lib/api-client";
import { IUser } from "@/features/user/types/user.types";
import {
  ICreateInvite,
  IInvitation,
  IWorkspace,
  IAcceptInvite,
  IPublicWorkspace,
  IInvitationLink,
  IVersion,
  IJoinedWorkspace,
  ICreateWorkspace,
} from "../types/workspace.types";
import { IPagination, QueryParams } from "@/lib/types.ts";
import { ISetupWorkspace } from "@/features/auth/types/auth.types.ts";

export async function getWorkspace(): Promise<IWorkspace> {
  const req = await api.post<IWorkspace>("/workspace/info");
  return req.data;
}

export async function getWorkspacePublicData(): Promise<IPublicWorkspace> {
  const req = await api.post<IPublicWorkspace>("/workspace/public");
  return req.data;
}

export async function getCheckHostname(
  hostname: string,
): Promise<{ hostname: string }> {
  const req = await api.post("/workspace/check-hostname", { hostname });
  return req.data;
}

export async function getWorkspaceMembers(
  params?: QueryParams,
): Promise<IPagination<IUser>> {
  const req = await api.post("/workspace/members", params);
  return req.data;
}

export async function deleteWorkspaceMember(data: {
  userId: string;
}): Promise<void> {
  await api.post("/workspace/members/delete", data);
}

export async function updateWorkspace(data: Partial<IWorkspace> & { aiSearch?: boolean }) {
  const req = await api.post<IWorkspace>("/workspace/update", data);
  return req.data;
}

export async function changeMemberRole(data: {
  userId: string;
  role: string;
}): Promise<void> {
  await api.post("/workspace/members/change-role", data);
}

export async function getPendingInvitations(
  params?: QueryParams,
): Promise<IPagination<IInvitation>> {
  const req = await api.post("/workspace/invites", params);
  return req.data;
}

export async function createInvitation(data: ICreateInvite) {
  const req = await api.post("/workspace/invites/create", data);
  return req.data;
}

export async function acceptInvitation(data: IAcceptInvite): Promise<{ requiresLogin?: boolean; }> {
  const req = await api.post("/workspace/invites/accept", data);
  return req.data;
}

export async function getInviteLink(data: {
  invitationId: string;
}): Promise<IInvitationLink> {
  const req = await api.post("/workspace/invites/link", data);
  return req.data;
}

export async function resendInvitation(data: {
  invitationId: string;
}): Promise<void> {
  await api.post("/workspace/invites/resend", data);
}

export async function revokeInvitation(data: {
  invitationId: string;
}): Promise<void> {
  await api.post("/workspace/invites/revoke", data);
}

export async function getInvitationById(data: {
  invitationId: string;
}): Promise<IInvitation> {
  const req = await api.post("/workspace/invites/info", data);
  return req.data;
}

export async function createWorkspace(
  data: ISetupWorkspace,
): Promise<{ workspace: IWorkspace } & { exchangeToken: string }> {
  const req = await api.post("/workspace/create", data);
  return req.data;
}

export async function getAppVersion(): Promise<IVersion> {
  const req = await api.post("/version");
  return req.data;
}

export async function getJoinedWorkspaces(): Promise<IJoinedWorkspace[]> {
  const req = await api.post<IJoinedWorkspace[]>("/workspace/joined");
  return req.data;
}

export async function createNewWorkspace(
  data: ICreateWorkspace,
): Promise<IWorkspace> {
  const req = await api.post<IWorkspace>("/workspace/create", data);
  return req.data;
}

export async function switchWorkspace(
  workspaceId: string,
): Promise<{ success: boolean; workspaceId: string }> {
  const req = await api.post<{ success: boolean; workspaceId: string }>(
    "/workspace/switch",
    { workspaceId },
  );
  return req.data;
}

