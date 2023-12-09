import { Body, Controller, Delete, Get, Patch, Post, Request, Param, UseGuards, Query, HttpStatus } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dtos/create-post.dto';
import { ExpressRequestWithUser } from '../user/interfaces/express-request-with-user.interface';
import { ParseIntPipe } from '@nestjs/common/pipes';
import { Public } from 'src/common/decorator/public.decorator';
import { Post as CPost } from '@prisma/client';
import { UpdatePostDto } from './dtos/update-post.dto';
import { IsMineGuard } from 'src/common/guards/is-mine.guard';
import { QueryPaginationDto } from 'src/common/dtos/query-pagination.dto';
import { PaginateOutput } from '../../common/utils/pagination.utils';
import { SuccessResponse } from 'src/common/interfaces/response.interface';

@Controller('post')
export class PostController {
    constructor(private readonly postService: PostService) { }

    @Post()
    createPost(
        @Body() createPostDto: CreatePostDto,
        @Request() req: ExpressRequestWithUser
    ): Promise<CPost> {
        createPostDto.authorId = req.user.sub;
        return this.postService.createPost(createPostDto);
    }

    @Public()
    @Get()
    getAllPost(@Query() query?: QueryPaginationDto): Promise<PaginateOutput<CPost>> {
        return this.postService.getAllPost(query);
    }

    @Public()
    @Get(':id')
    async getPostById(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponse<CPost>> {
        const data = await this.postService.getPostById(id);

        return {
            success: true,
            data,
            message: "Success Get Post By Id",
            statusCode: HttpStatus.OK
        }
    }

    @Patch(':id')
    @UseGuards(IsMineGuard)
    updatePost(
        @Param("id", ParseIntPipe) id: number,
        @Body() updatePostDto: UpdatePostDto
    ) {
        return this.postService.updatePost(id, updatePostDto);
    }

    @Delete(':id')
    @UseGuards(IsMineGuard)
    deletePost(@Param("id", ParseIntPipe) id: number) {
        return this.postService.deletePost(id);
    }
}
