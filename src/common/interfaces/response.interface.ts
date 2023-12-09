export interface SuccessResponse<T> {
    success: boolean,
    data: T | T[],
    message: string,
    statusCode: number,
}