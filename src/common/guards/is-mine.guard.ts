import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/core/services/prisma.service';

@Injectable()
export class IsMineGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly prisma: PrismaService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const route = request.route.path.split("/")[1];
        const paramId = isNaN(parseInt(request.params.id)) ? 0 : parseInt(request.params.id);

        switch (route) {
            case 'post':
                const post = await this.prisma.post.findFirst({
                    where: {
                        id: paramId,
                        authorId: request.user.sub
                    }
                });

                return paramId === post?.id;
            default:
                return paramId === request.user.sub;
        }
    }
}