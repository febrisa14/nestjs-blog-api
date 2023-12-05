import { ConflictException, HttpException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/core/services/prisma.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dtos/login-user.dto';
import { LoginResponse, UserPayload } from './interfaces/user-login.interface';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService, private jwt: JwtService) { }

    async registerUser(createUserDto: CreateUserDto) {
        try {
            const user = await this.prisma.user.create({
                data: {
                    ...createUserDto,
                    password: await hash(createUserDto.password, 10),
                }
            })

            delete user.password

            return user;
        } catch (error) {
            //check if email already registered
            if (error.code === "P2002") {
                throw new ConflictException("Email already registered")
            }

            throw new HttpException(error, 500)
        }
    }

    async loginUser(loginUserDto: LoginUserDto): Promise<LoginResponse> {
        try {
            const user = await this.prisma.user.findFirst({
                where: {
                    email: loginUserDto.email
                }
            })

            if (!user) {
                throw new NotFoundException("User not found")
            }

            if (!(await compare(loginUserDto.password, user.password))) {
                throw new UnauthorizedException("Invalid credentials")
            }

            const payload: UserPayload = {
                sub: user.id,
                email: user.email,
                name: user.name
            }

            return {
                access_token: await this.jwt.signAsync(payload)
            }
        } catch (error) {
            throw new HttpException(error, 500)
        }
    }

    async updateUser(id: number, updateUserDto: UpdateUserDto) {
        try {
            await this.prisma.user.findUniqueOrThrow({
                where: {
                    id
                }
            })

            const user = await this.prisma.user.update({
                where: {
                    id
                },
                data: {
                    ...updateUserDto,
                    ...(updateUserDto.password && {
                        password: await hash(updateUserDto.password, 10)
                    })
                }
            })

            delete user.password

            return user;
        } catch (error) {
            throw new HttpException(error, 500)
        }
    }

    async deleteUser(id: number) {
        try {
            const user = await this.prisma.user.findUniqueOrThrow({
                where: {
                    id
                }
            })

            await this.prisma.user.delete({
                where: {
                    id
                }
            })

            return `User with ${user.id} deleted`
        } catch (error) {
            if (error.code === "P2025") {
                throw new NotFoundException(`User with ${id} not found`)
            }

            throw new HttpException(error, 500)
        }
    }
}