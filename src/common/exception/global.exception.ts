import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common"

export const getStatusCode = (exception: unknown): number => {
    return exception instanceof HttpException ?
        exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
}

export const getErrorMessage = (exception: unknown) => {
    return String(exception);
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const code = getStatusCode(exception);
        const message = getErrorMessage(exception);

        response.status(code).json({
            error: {
                timestamp: new Date().toISOString(),
                path: request.url,
                code,
                message
            }
        })
    }
}