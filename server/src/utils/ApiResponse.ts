type ApiResponseData = Record<string, unknown>;

class ApiResponse {
    statusCode: number;
    message: string;
    data: ApiResponseData | null;
    success: boolean;

    constructor(statusCode: number, message: string, data: ApiResponseData | null = null) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = statusCode >= 200 && statusCode < 300; 
    }
}

export {ApiResponse};