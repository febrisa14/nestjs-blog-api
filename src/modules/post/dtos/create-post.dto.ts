import { IsBoolean, IsNotEmpty } from "class-validator";

export class CreatePostDto {
    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    content: string;

    @IsBoolean()
    @IsNotEmpty()
    published: boolean = false;

    authorId: number;
}