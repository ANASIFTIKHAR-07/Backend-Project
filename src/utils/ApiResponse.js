class ApiResponse {
    constructor(
        statusCode,
        message = "Successful",
        data,
    ) {
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}