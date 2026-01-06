import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';

export const AuthWorkspace = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // Prefer JWT-provided workspace (from authenticated user) over middleware workspace
    // This allows multi-workspace support in self-hosted mode
    const workspace = request?.user?.workspace ?? request.raw?.workspace;

    if (!workspace) {
      throw new BadRequestException('Invalid workspace');
    }

    return workspace;
  },
);
