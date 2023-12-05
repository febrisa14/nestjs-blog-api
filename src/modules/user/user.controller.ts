import { Controller, Post, Get, Patch, Delete, Body, Param, ParseIntPipe, HttpCode, Request } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { LoginResponse, UserPayload } from './interfaces/user-login.interface';
import { ExpressRequestWithUser } from './interfaces/express-request-with-user.interface';
import { Public } from 'src/common/decorator/public.decorator';

@Controller()
export class UserController {
    constructor(private userService: UserService) { }

    @Public()
    @Post("register")
    registerUser(@Body() createUserDto: CreateUserDto): Promise<User> {
        return this.userService.registerUser(createUserDto)
    }

    @Public()
    @Post("login")
    @HttpCode(200)
    loginUser(@Body() loginUserDto: LoginUserDto): Promise<LoginResponse> {
        return this.userService.loginUser(loginUserDto);
    }

    @Get("user")
    user(@Request() req: ExpressRequestWithUser): UserPayload {
        return req.user;
    }

    @Patch("user/:id")
    updateUser(@Param("id", ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto): Promise<User> {
        return this.userService.updateUser(+id, updateUserDto);
    }

    @Delete("user/:id")
    deleteUser(@Param("id", ParseIntPipe) id: number) {
        return {
            message: this.userService.deleteUser(+id)
        }
    }
}
