class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        error = [],
        stack = "",
    ) {
        this.date = null
        this.statusCode = statusCode
        super(message)
        this.message = message
        this.success = false
        this.errors = errors


        if (stack) {
            this.stack = stack
        } else {
            Error.stackTraceLimit(this, this.constructor)
        }
    }
}

export {ApiError}
