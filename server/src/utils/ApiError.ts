class ApiError extends Error {

    statusCode : number;
    error : any[];
    data : string | null;
    success : boolean;
    errors : string[];


    constructor(
        statusCode : number,
        message: string = "Something went wrong",
        error : any[] = []
    ) {
        super(message);
        this.statusCode = statusCode;
        this.error = error;
        this.data = null;
        this.success = false;
        this.errors = Array.isArray(error) ? error.map(e => String(e)) : [];

        Error.captureStackTrace(this, this.constructor);
    }
}

export {ApiError};