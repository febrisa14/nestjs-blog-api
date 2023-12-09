import { Injectable, NotFoundException, HttpException } from '@nestjs/common';
import { CreatePostDto } from './dtos/create-post.dto';
import { PrismaService } from 'src/core/services/prisma.service';
import { UpdatePostDto } from './dtos/update-post.dto';
import { Post } from '@prisma/client';
import { QueryPaginationDto } from 'src/common/dtos/query-pagination.dto';
import { PaginateOutput, paginateOutput } from 'src/common/utils/pagination.utils';
import { paginate } from '../../common/utils/pagination.utils';

@Injectable()
export class PostService {
    constructor(private prisma: PrismaService) { }

    async createPost(createPostDto: CreatePostDto): Promise<Post> {
        try {
            const post = await this.prisma.post.create({
                data: {
                    ...createPostDto
                }
            })

            return post
        } catch (error) {
            console.error(error, error.code)
            if (error.code === 'P2003') {
                throw new NotFoundException('Author not found');
            }

            throw new HttpException(error, 500)
        }
    }

    async getAllPost(query?: QueryPaginationDto): Promise<PaginateOutput<Post>> {
        const [posts, total] = await Promise.all([
            await this.prisma.post.findMany({
                ...paginate(query)
            }),
            await this.prisma.post.count()
        ]);

        return paginateOutput<Post>(posts, total, query);
    }

    async getPostById(id: number): Promise<Post> {
        try {
            const post = await this.prisma.post.findFirstOrThrow({
                where: {
                    id
                }
            })

            return post;
        } catch (error) {
            if (error.code === 'P2003') {
                throw new NotFoundException(`Post with id ${id} not found`)
            }

            throw new HttpException(error, 500);
        }
    }

    async updatePost(id: number, updatePostDto: UpdatePostDto) {
        try {
            await this.prisma.post.findFirstOrThrow({
                where: {
                    id
                }
            })

            const post = await this.prisma.post.update({
                where: {
                    id
                },
                data: {
                    ...updatePostDto
                }
            })

            return post
        } catch (error) {
            if (error.code === "P2025") {
                throw new NotFoundException(`Post with ${id} not found`);
            }

            throw new HttpException(error, 500)
        }
    }

    async deletePost(id: number) {
        try {
            const post = await this.prisma.post.findUniqueOrThrow({
                where: {
                    id
                }
            })

            await this.prisma.post.delete({
                where: {
                    id
                }
            })

            return `Post with ${post.id} deleted`;
        } catch (error) {
            if (error.code === "P2025") {
                throw new NotFoundException(`Post with ${id} not found`);
            }

            throw new HttpException(error, 500);
        }
    }
}
